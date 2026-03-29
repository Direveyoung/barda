# BARDA TODO

> 작업 목록. 완료 시 `[x]`로 체크. 최종 업데이트: 2026-03-29

---

## 완료된 작업

- [x] MVP-1: 루틴 분석 엔진 + 제품 DB 186개 + 검색 (2026.02.14)
- [x] MVP-2: 인증 + 결제 + 커뮤니티 + 관리자 (2026.02.15)
- [x] Phase 1: 홈 화면 분기 + 5탭 네비 + 체크리스트 + 다이어리 (2026.02.15)
- [x] Phase 1.5: 피드 검색/필터 + 루틴 따라하기 + 프로필 + OG + 알림 (2026.02.15)
- [x] Phase 2: 맞춤 추천 + 성분 가이드 30종 + 7일 챌린지 + 랭킹 (2026.02.15)
- [x] DB전략: 제품 300개 확장 + 검색로그 + 후보관리 (2026.02.16)
- [x] 벤치마킹: 날씨 루틴 + 제품 서랍 + 듀프 파인더 (2026.02.16)
- [x] 외부 API 3종 + 자동 학습 파이프라인 + 관리자 대시보드 강화 (2026.02.16)
- [x] 문서 관리 체계 도입 (2026.02.16)
- [x] 품평단 P0~P2: localStorage SSR 방지, useMemo, next.config (2026.02.19)
- [x] Phase 3: AI 성분 분석 + 바코드 스캐너 + 성분 DB 30종 (2026.02.19)
- [x] 제품 DB 502개 달성 (83개 브랜드, 20개 카테고리) (2026.02.19)
- [x] 테스트 코드 71개 (Vitest: analysis 44 + search 27) (2026.02.19)
- [x] API 응답 타입 중앙화 + validation 강화 (2026.02.19)
- [x] 날씨 고도화: 7일 예보 + 바람 + 루틴 어드바이스 (2026.02.19)
- [x] 듀프 파인더 고도화: 가격 예상, 인기도, 배지, 정렬, 절약 계산 (2026.02.19)
- [x] 외부 API 프로덕션 연동: 캐싱(5분 TTL) + 재시도 + 통합 성분 조회 (2026.02.19)
- [x] 이모지 → SVG 아이콘 전면 교체 (Icon 컴포넌트) (2026.02.20)
- [x] API 입력 검증 강화 (Zod + XSS 방지 + 결제 멱등성) (2026.02.20)
- [x] 네비게이션 전면 개선 (2026.02.20)
- [x] PC 데스크톱 셸 + 랜딩 페이지 리디자인 (화해/파우더룸 스타일) (2026.02.20)
- [x] 테스트 계정 로그인 기능 (test@barda.dev + 프리미엄 포함) (2026.02.25)
- [x] 하드코딩 제거: URL/localStorage키/API limit/UI 타이밍/라벨 상수화, 듀프 데이터 분리 (2026.03.29)
- [x] 베타 보안 강화: ��이월 우회 차단, 테스�� 유저 환경 분기, 결제 금액 서버 검증, 보안 헤더, Rate Limiting, 관리자 환경변수화 (2026.03.29)
- [x] 프로덕션 인프라: error.tsx/not-found.tsx, robots.ts/sitemap.ts, .env.example, PWA manifest (2026.03.29)
- [x] P0 성분 민감도 알림: checkSensitivities() + analyzeRoutine() 연동 + ResultView 경고 UI + SensitivityManager (구현 완료 확인)
- [x] P1 배지/업적 시스템: badge-repository.ts + BadgeCard + MypageClient 통합 (��현 완료 확인)
- [x] P2 체크리스트 준수율 대시보드: checklist-stats.ts + AdherenceDashboard + MypageClient 통합 (구현 완료 확인)

---

## 즉시 필요: 실제 연결 (DB + API키 + 배포)

### Supabase 연결
- [ ] `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정
- [ ] `supabase/migrations/001_initial_schema.sql` 실행 (9개 테이블 생성)
- [ ] Supabase Auth 설정 (Google OAuth redirect URL)
- [ ] Vercel 환경변수 동기화

### 토스페이먼츠 연결
- [ ] 토스 비즈니스 계정 + 테스트 API키 발급
- [ ] `.env.local`에 `NEXT_PUBLIC_TOSS_CLIENT_KEY` + `TOSS_SECRET_KEY` 설정
- [ ] 테스트 모드 결제 플로우 검증

### 외부 API키 연결
- [ ] 공공데이터포털 계정 + `PUBLIC_DATA_SERVICE_KEY` 발급
- [ ] `.env.local`에 설정 → 식약처 + 성분사전 API 동시 활성화
- [ ] Open Beauty Facts는 키 불필요 (이미 프로덕션 레디)

### 배포
- [ ] Vercel 프로젝트 생성 (Seoul icn1 리전)
- [ ] `vercel login` → 환경변수 설정 → 빌드 → 배포
- [ ] 커스텀 도메인 연결

---

## Phase 4A: 지금 구현 가능 (외부 의존성 없음)

> localStorage + 인메모리 데이터만으로 구현 가능한 기능들

### 🟡 P3: 확장 챌린지 (21/30일 + 테마별)
> 7일 챌린지 구조 확장. ChallengeState.completedDays[] 길이 가변화.

- [ ] `data/challenges.ts` 신규 생성 — 챌린지 프리셋 정의
  - 기본 7일 (기존)
  - 브라이트닝 21일: 비타민C, 나이아신아마이드, 아르부틴 중심
  - 트러블 케어 21일: BHA, 티트리, 시카 중심
  - 안티에이징 30일: 레티놀, 펩타이드, 콜라겐 중심
  - 보습 집중 14일: 히알루론산, 세라마이드, 판테놀 중심
  - 각 프리셋: `{ id, label, days, theme, icon, dailyTips[] }`
- [ ] `challenge/page.tsx` 리팩토링
  - 챌린지 선택 화면 (프리셋 카드 그리드)
  - ChallengeState에 `presetId` 필드 추가
  - `completedDays[]` 길이를 프리셋 days에 맞게 동적 생성
  - 진행률 표시 확장 (7 → N일)
- [ ] `user-data-repository.ts` ChallengeState 타입 확장
  - `presetId?: string` 추가 (하위 호환)

### 🟡 P4: 서랍 재구매 추천
> finished 제품 → 같은 카테고리 유사 제품 추천. 듀프 파인더 로직 재사용.

- [ ] `lib/product-similarity.ts` 신규 생성 (또는 search.ts 확장)
  - `findSimilarProducts(product, limit)`: 카테고리 + key_ingredients 유사도 계산
  - 듀프 파인더의 성분 유사도(70%) + 태그 유사도(30%) 로직 추출/재사용
- [ ] `drawer/page.tsx`에서 status="finished" 제품 카드에 "비슷한 제품 보기" 버튼
  - 클릭 시 하단 시트/모달로 추천 3개 표시
  - 각 추천: 제품명, 브랜드, 유사도%, 가격대 (brand-tiers.ts 활용)
- [ ] "서랍이 비었어요" 상태에서 인기 제품 추천 CTA 추가

---

## Phase 4B: 외부 의존성 필요

### Supabase 연결 후
- [ ] 프리미엄 구독 (월 ₩3,900): AI 성분 무제한 + 실시간 날씨 + 개인화 리포트
- [ ] Supabase cron으로 자동 학습 파이프라인 스케줄링
- [ ] 에러 모니터링 (Sentry 등) 연동

---

## Phase 5: 소셜 + 바이럴 (Supabase 필수)

- [ ] "루틴 따라하기" 확장: 부족 제품 추천 + 듀프 자동 제시
- [ ] 팔로우/팔로워 + 피드 맞춤화
- [ ] Q&A 섹션: 성분/루틴 질문+답변, 전문가 배지

---

## Phase 6: 커머스 연동 (제휴 필수)

- [ ] 올리브영/쿠팡 어필리에이트 링크 (제품 카드에 "구매" 버튼)
- [ ] 듀프 파인더 → 구매 전환 CTA
- [ ] 빈 서랍 → 재구매 추천 + 구매 링크
- [ ] 브랜드 협업 배너 슬롯

---

## Phase 7: 데이터 비즈니스 (사업화)

- [ ] 월간 트렌드 리포트 (B2B): 성분/브랜드 트렌드 분석
- [ ] 피부타입별 인기 루틴 인사이트 (브랜드사 대상)
- [ ] 익명화 데이터 API (연구기관/브랜드 대상)
