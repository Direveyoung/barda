-- 006: 포인트 기반 크라우드소싱 데이터 플라이휠
-- 유저 데이터 기여 → 포인트 적립 → 혜택 교환

-- ── 유저 포인트 잔액 ──

CREATE TABLE IF NOT EXISTS user_points (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime_earned integer NOT NULL DEFAULT 0,
  lifetime_redeemed integer NOT NULL DEFAULT 0,
  current_streak_days integer NOT NULL DEFAULT 0,
  longest_streak_days integer NOT NULL DEFAULT 0,
  last_earn_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ── 포인트 거래 내역 (불변 원장) ──

CREATE TABLE IF NOT EXISTS point_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  -- 'checkin_am' | 'checkin_pm' | 'diary' | 'barcode_scan' | 'ingredient_input'
  -- | 'feedback' | 'routine_share' | 'streak_bonus' | 'redeem'
  points integer NOT NULL,          -- 양수=적립, 음수=사용
  reference_id text,                -- 멱등성 키 (e.g. "diary:2026-03-28")
  reference_date date NOT NULL DEFAULT CURRENT_DATE,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- ── 인덱스 ──

CREATE INDEX idx_pt_user_date ON point_transactions(user_id, reference_date DESC);
CREATE INDEX idx_pt_user_action ON point_transactions(user_id, action);

-- 멱등성: 같은 유저 + 같은 액션 + 같은 reference_id → 중복 적립 방지
CREATE UNIQUE INDEX idx_pt_idempotency ON point_transactions(user_id, action, reference_id)
  WHERE reference_id IS NOT NULL;

-- ── RLS ──

ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own points" ON user_points
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users read own transactions" ON point_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- ── updated_at 트리거 ──

CREATE TRIGGER user_points_updated_at
  BEFORE UPDATE ON user_points
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
