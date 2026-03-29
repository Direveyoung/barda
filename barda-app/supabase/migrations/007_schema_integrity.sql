-- 007: DB 무결성 강화 — atomic 포인트, 카테고리 마스터, 승격 추적, RLS, 인덱스
-- 데이터 플라이휠의 정확한 DB 구축을 위한 스키마 보정

-- ════════════════════════════════════════════
-- A. 포인트 적립 atomic 함수 (race condition 해결)
-- ════════════════════════════════════════════

CREATE OR REPLACE FUNCTION earn_points(
  p_user_id uuid,
  p_action text,
  p_points integer,
  p_reference_id text,
  p_reference_date date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_action_count integer;
  v_daily_total integer;
  v_balance integer;
  v_lifetime integer;
  v_streak integer;
  v_longest integer;
  v_last_date date;
  v_new_balance integer;
  v_new_streak integer;
  v_new_longest integer;
BEGIN
  -- 1. 트랜잭션 삽입 (UNIQUE 인덱스가 멱등성 보장)
  INSERT INTO point_transactions (user_id, action, points, reference_id, reference_date)
  VALUES (p_user_id, p_action, p_points, p_reference_id, p_reference_date);

  -- 2. user_points UPSERT + atomic 잔액 증가 (SELECT FOR UPDATE로 동시성 제어)
  INSERT INTO user_points (user_id, balance, lifetime_earned, current_streak_days, longest_streak_days, last_earn_date)
  VALUES (p_user_id, p_points, p_points, 1, 1, p_reference_date)
  ON CONFLICT (user_id) DO UPDATE SET
    balance = user_points.balance + p_points,
    lifetime_earned = user_points.lifetime_earned + p_points,
    current_streak_days = CASE
      WHEN user_points.last_earn_date = p_reference_date THEN user_points.current_streak_days
      WHEN user_points.last_earn_date = p_reference_date - 1 THEN user_points.current_streak_days + 1
      ELSE 1
    END,
    longest_streak_days = GREATEST(
      user_points.longest_streak_days,
      CASE
        WHEN user_points.last_earn_date = p_reference_date THEN user_points.current_streak_days
        WHEN user_points.last_earn_date = p_reference_date - 1 THEN user_points.current_streak_days + 1
        ELSE 1
      END
    ),
    last_earn_date = p_reference_date
  RETURNING balance, current_streak_days, longest_streak_days
  INTO v_new_balance, v_new_streak, v_new_longest;

  -- 3. 오늘 총 적립액 계산
  SELECT COALESCE(SUM(points), 0) INTO v_daily_total
  FROM point_transactions
  WHERE user_id = p_user_id AND reference_date = p_reference_date AND points > 0;

  RETURN jsonb_build_object(
    'earned', p_points,
    'new_balance', v_new_balance,
    'daily_earned', v_daily_total,
    'current_streak', v_new_streak,
    'longest_streak', v_new_longest
  );

EXCEPTION
  WHEN unique_violation THEN
    -- 멱등성: 이미 적립된 경우
    RETURN jsonb_build_object('earned', 0, 'reason', 'already_earned');
END;
$$;

-- 포인트 사용 atomic 함수
CREATE OR REPLACE FUNCTION redeem_points(
  p_user_id uuid,
  p_amount integer,
  p_description text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance integer;
  v_new_balance integer;
BEGIN
  -- 잔액 조회 + 행 잠금 (FOR UPDATE)
  SELECT balance INTO v_balance
  FROM user_points
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_balance IS NULL OR v_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'reason', 'insufficient_balance');
  END IF;

  v_new_balance := v_balance - p_amount;

  -- 트랜잭션 기록
  INSERT INTO point_transactions (user_id, action, points, reference_id, reference_date, metadata)
  VALUES (
    p_user_id,
    'redeem',
    -p_amount,
    'redeem:' || CURRENT_DATE || ':' || extract(epoch from now())::text,
    CURRENT_DATE,
    jsonb_build_object('description', p_description)
  );

  -- 잔액 차감
  UPDATE user_points
  SET balance = v_new_balance,
      lifetime_redeemed = lifetime_redeemed + p_amount
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;


-- ════════════════════════════════════════════
-- B. 카테고리 마스터 테이블
-- ════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,                    -- 'cleanser', 'toner', 'serum' 등
  name_ko text NOT NULL,
  name_en text,
  display_order integer NOT NULL DEFAULT 0,
  icon text,                              -- Icon 컴포넌트 아이콘명
  created_at timestamptz DEFAULT now()
);

-- 시드 데이터: 기존 products.category_id에 사용된 20개 카테고리
INSERT INTO categories (id, name_ko, name_en, display_order, icon) VALUES
  ('cleanser',       '클렌저',       'Cleanser',       1,  'bubble'),
  ('oil-cleanser',   '오일 클렌저',   'Oil Cleanser',   2,  'drop'),
  ('toner',          '토너',         'Toner',          3,  'bottle'),
  ('essence',        '에센스',       'Essence',        4,  'drop'),
  ('serum',          '세럼',         'Serum',          5,  'drop'),
  ('ampoule',        '앰플',         'Ampoule',        6,  'drop'),
  ('emulsion',       '에멀전',       'Emulsion',       7,  'bottle'),
  ('cream',          '크림',         'Cream',          8,  'jar'),
  ('eye-cream',      '아이크림',     'Eye Cream',      9,  'eye'),
  ('moisturizer',    '수분크림',     'Moisturizer',    10, 'jar'),
  ('sunscreen',      '선크림',       'Sunscreen',      11, 'sun'),
  ('mask',           '마스크팩',     'Mask Pack',      12, 'mask'),
  ('sleeping-mask',  '수면팩',       'Sleeping Mask',  13, 'mask'),
  ('exfoliator',     '각질케어',     'Exfoliator',     14, 'beaker'),
  ('mist',           '미스트',       'Mist',           15, 'droplets'),
  ('lip',            '립케어',       'Lip Care',       16, 'package'),
  ('body',           '바디',         'Body',           17, 'bottle'),
  ('spot',           '스팟',         'Spot Treatment', 18, 'target'),
  ('oil',            '오일',         'Oil',            19, 'drop'),
  ('retinol',        '레티놀',       'Retinol',        20, 'lightning')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read categories" ON categories FOR SELECT USING (true);


-- ════════════════════════════════════════════
-- C. product_candidates 승격 추적 (데이터 기여 어트리뷰션)
-- ════════════════════════════════════════════

ALTER TABLE product_candidates
  ADD COLUMN IF NOT EXISTS promoted_product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS promoted_at timestamptz;

-- 승격 시 기여자 조회용 인덱스
CREATE INDEX IF NOT EXISTS idx_candidates_promoted
  ON product_candidates(promoted_product_id)
  WHERE promoted_product_id IS NOT NULL;

-- product_candidates SELECT 정책 추가 (본인 제출 조회 가능)
CREATE POLICY "Users read own candidates" ON product_candidates
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- product_candidates status CHECK 제약
ALTER TABLE product_candidates
  ADD CONSTRAINT chk_candidate_status
  CHECK (status IN ('pending', 'auto_promoted', 'approved', 'rejected'));


-- ════════════════════════════════════════════
-- D. payments RLS 수정 (보안 강화)
-- ════════════════════════════════════════════

-- 기존 INSERT 정책 제거 후 본인만 삽입 가능하도록 재생성
DROP POLICY IF EXISTS "Service inserts payments" ON payments;
CREATE POLICY "Users create own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ════════════════════════════════════════════
-- E. 누락 인덱스 추가 (성능)
-- ════════════════════════════════════════════

-- routine_posts: 유저별 조회 (마이페이지)
CREATE INDEX IF NOT EXISTS idx_routine_posts_user
  ON routine_posts(user_id, created_at DESC);

-- products: 활성 제품 필터
CREATE INDEX IF NOT EXISTS idx_products_is_active
  ON products(is_active)
  WHERE is_active = true;

-- search_logs: 날짜 범위 조회 (파이프라인 리포트)
CREATE INDEX IF NOT EXISTS idx_search_logs_created
  ON search_logs(created_at DESC);

-- product_candidates: 자동 승격 파이프라인 조회
CREATE INDEX IF NOT EXISTS idx_candidates_status_count
  ON product_candidates(status, submit_count)
  WHERE status = 'pending';

-- funnel_events: 날짜 범위 분석
CREATE INDEX IF NOT EXISTS idx_funnel_events_created
  ON funnel_events(created_at DESC);


-- ════════════════════════════════════════════
-- F. pipeline_runs RLS 정책 (서비스 전용)
-- ════════════════════════════════════════════

-- 일반 유저는 파이프라인 결과 접근 불가
CREATE POLICY "No user access to pipeline_runs" ON pipeline_runs
  FOR SELECT USING (false);
