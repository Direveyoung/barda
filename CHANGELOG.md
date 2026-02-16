# BARDA 개발 로그 (CHANGELOG)
> 모든 기획/업데이트 히스토리를 기록합니다. 나중에 봐도 흐름을 파악할 수 있게.

---

## [DB전략] 제품 DB 전략 구현 — 2026.02.16

### 변경 사항
- **제품 DB 186 → 300개 확장** (20개 카테고리 균형 배분)
  - 모든 제품에 `key_ingredients`, `tags`, `source`, `verified` 필드 추가
  - 신규 브랜드: 달바, 바이오더마, 유세린, 듀이트리, 비플레인, 아비브, 원씽, 탬버린즈, 닥터시라보, 프리메라, 오휘, 더페이스샵, 마몽드, 바이위시트렌드, 티아엠
  - 카테고리별: cream(43), sunscreen(25), essence(24), toner(23), cleanser(18), vitamin_c(16), ampoule(15), toner_pad(14), mask_pack(14), retinol(13), eye_cream(13), lotion(12), niacinamide(11), hyaluronic(11), oil_cleanser(10), sleeping_pack(9), spot_treatment(9), aha(7), bha(7), pha(6)
- **검색 로깅 시스템** (`/api/search-logs`)
  - POST: 검색 쿼리 + 결과 수 + 선택 제품 로깅
  - GET: 히트율 통계 + 미스 쿼리 TOP 20
  - 1.5초 디바운스 자동 로깅
- **제품 후보 관리** (`/api/product-candidates`)
  - 유저가 DB에 없는 제품 직접 입력 → 후보 테이블 저장
  - 동일 브랜드+제품명 중복 제출 시 submit_count 자동 증가
  - 관리자 승인/거부/대기 상태 관리 (PATCH)
- **관리자 대시보드 강화** (`/admin`)
  - 검색 통계 3개 카드 (총 검색, 미스, 히트율)
  - 제품 후보 관리 UI (필터 탭 + 승인/거부 버튼 + submit_count 배지)
  - `result_count` → `results_count` 컬럼명 버그 수정
- **ProductStep UI 개선**
  - 검색 결과 없을 때 직접 입력 폼 자동 표시
  - 후보 제출 확인 메시지

### 파일
- `src/data/products.ts` — 300개 제품 (key_ingredients, tags, source, verified 완비)
- `src/components/ProductStep.tsx` — 직접입력 + 검색로그
- `src/app/api/search-logs/route.ts` — 신규
- `src/app/api/product-candidates/route.ts` — 신규
- `src/app/api/admin/stats/route.ts` — 검색통계 추가
- `src/app/admin/page.tsx` — 후보관리 + 검색통계 UI

---

## [Phase 2] 맞춤 제품추천, 성분가이드 30종, 7일 챌린지, 랭킹 — 2026.02.15

### 변경 사항
- **맞춤 제품 추천**: 피부타입 × 고민별 제품 추천 엔진
- **성분 가이드 30종**: `/guide` 페이지, 30개 핵심 성분 상세 설명 (효과, 주의사항, 추천 조합)
- **7일 챌린지**: `/challenge` 페이지, 캘린더 기반 7일 체크인 + 배지 시스템
- **인기 루틴 랭킹**: `/ranking` 페이지, 피부타입별 주간/월간 TOP 10 자동 생성

### 주요 파일
- `src/app/guide/page.tsx` — 성분 가이드 (30종)
- `src/app/challenge/page.tsx` — 7일 챌린지
- `src/app/ranking/page.tsx` — 인기 루틴 랭킹

---

## [Phase 1.5] 피드 검색, 루틴 따라하기, 프로필, OG, 알림 — 2026.02.15

### 변경 사항
- **피드 검색/필터**: 피부타입·고민별 원터치 필터 (`FeedClient.tsx`)
- **"이 루틴 따라하기"**: 다른 사람 루틴의 제품을 내 분석에 자동 입력
- **프로필 설정**: 닉네임 + 피부타입 배지 (`/mypage/profile`)
- **OG 메타 태그**: 루틴 점수 카드 이미지 자동 생성, 카카오톡/인스타 공유
- **알림 시스템**: 좋아요/댓글 알림 (`NotificationBell.tsx`)

### 주요 파일
- `src/app/feed/FeedClient.tsx` — 피드 필터/검색
- `src/app/mypage/profile/page.tsx` — 프로필 설정
- `src/components/NotificationBell.tsx` — 알림
- `src/lib/notifications.ts` — 알림 로직

---

## [Phase 1] 홈 화면, 5탭 네비게이션, 체크리스트, 다이어리, 상세페이지 — 2026.02.15

### 변경 사항
- **홈 화면 리뉴얼**:
  - 비로그인: 마케팅 랜딩 (히어로 + 기능소개 + 피드 미리보기 + 통계)
  - 로그인(분석 완료): 매일 체크리스트 (AM/PM) + 피부 컨디션 + 피드 새글 + 점수
  - 로그인(분석 전): CTA + 기능소개
- **5탭 하단 네비게이션**: 홈 / 피드 / 분석(중앙) / 가이드 / 마이
- **매일 루틴 체크리스트**: AM/PM 제품 체크오프, 7일 캘린더 연동
- **스킨 다이어리**: 이모지(😊😐😣) + 한줄 메모, 매일 기록
- **루틴 상세 페이지**: `/feed/[id]` + 댓글 스레드
- **댓글 시스템**: 루틴 포스트 댓글 입력/조회

### 주요 파일
- `src/app/page.tsx` — 홈 (조건부 렌더링)
- `src/components/BottomNav.tsx` — 5탭 네비
- `src/app/feed/[id]/page.tsx` — 루틴 상세
- `src/app/feed/[id]/RoutineDetailClient.tsx` — 상세 인터랙션

---

## [MVP-2] 인증, 결제, 커뮤니티, 관리자 대시보드 — 2026.02.15

### 변경 사항
- **Supabase 연동**: DB 9개 테이블 + Auth (이메일 + Google OAuth)
- **인증 시스템**: AuthContext + 로그인 페이지 + OAuth 콜백
- **블러/페이월**: 충돌 2건+, 7일 캘린더, 팁 블러 (₩9,900 원타임)
- **토스페이먼츠**: 결제 확인 API (테스트키 플레이스홀더)
- **커뮤니티**: 루틴 공유 + 좋아요 + 피드 (SSR)
- **피드백**: 👍/👎 버튼
- **퍼널 추적**: 11개 이벤트 (wizard_start ~ payment_completed)
- **관리자 대시보드**: 통계 카드 + 퍼널 차트

### 주요 파일
- `src/contexts/AuthContext.tsx` — 인증 상태
- `src/components/BlurOverlay.tsx` — 페이월
- `src/components/FeedbackButtons.tsx` — 피드백
- `src/lib/events.ts` — 퍼널 이벤트
- `src/lib/payments.ts` — 토스 결제
- `src/app/auth/login/page.tsx` — 로그인
- `src/app/feed/page.tsx` — 피드
- `src/app/admin/page.tsx` — 관리자
- `src/middleware.ts` — 세션 갱신 + /admin 보호
- `supabase/migrations/001_initial_schema.sql` — DB 스키마

---

## [MVP-1] 스킨케어 루틴 분석기 — 2026.02.14

### 변경 사항
- **루틴 분석 엔진**: 15개 충돌 규칙 (레티놀×AHA, BHA×비타민C 등)
- **3단계 검색**: 정확 → 별칭(aliases) → Levenshtein 퍼지
- **제품 DB**: 186개 K-뷰티 제품, 20개 카테고리
- **루틴 점수**: 100점 만점 (충돌 감점, 고민 매칭 가점)
- **7일 캘린더**: 레티놀/각질 자동 분배
- **AM/PM TIP**: 피부타입×시간대별 가이드
- **결과 페이지**: 충돌 카드 + 캘린더 + 순서 + 팁
- **별칭 시스템**: "디올 캡쳐" → "Dior Capture" 등

### 주요 파일
- `src/data/products.ts` — 제품 DB
- `src/data/rules.ts` — 충돌 규칙
- `src/data/aliases.ts` — 검색 별칭
- `src/lib/analysis.ts` — 분석 엔진
- `src/lib/search.ts` — 3단계 검색
- `src/components/ResultView.tsx` — 결과 UI
- `src/components/ProductStep.tsx` — 제품 입력
- `src/components/SkinTypeStep.tsx` — 피부타입 선택
- `src/components/ConcernStep.tsx` — 고민 선택

---

## [기획] 서비스 기획서 — 2026.02.13~14

### 버전 이력
- **v1.0**: 초기 기획서 (스킨케어 루틴 분석 기본 컨셉)
- **v2.2**: 데이터 학습 전략 전면 보강
- **v3.0**: MVP 2단계 분리 + 무료/유료 전환 전략 변경 + 커뮤니티/관리자 설계

### 주요 파일
- `BARDA-서비스기획서-v3.md` — 서비스 기획서 (최신)
- `BARDA-벤치마킹-업데이트-v1.md` → `v2.md` — 벤치마킹 문서

---

## 문서 구조

```
/home/user/barda/
├── CHANGELOG.md                    ← 이 파일 (개발 로그)
├── BARDA-벤치마킹-업데이트-v1.md    ← 벤치마킹 v1 (아카이브)
├── BARDA-벤치마킹-업데이트-v2.md    ← 벤치마킹 v2 (최신)
├── BARDA-서비스기획서-v3.md         ← 서비스 기획서
├── README.md                       ← 프로젝트 README
└── barda-app/                      ← Next.js 앱
    └── src/
        ├── app/                    ← 라우트 (13개 페이지)
        ├── components/             ← 컴포넌트 (12개)
        ├── contexts/               ← 상태 (AuthContext)
        ├── data/                   ← 데이터 (products, rules, aliases)
        └── lib/                    ← 유틸 (analysis, search, events, payments, notifications)
```

---

*이 CHANGELOG는 모든 기획/업데이트 시 업데이트됩니다.*
*형식: [태그] 제목 — 날짜 / 변경사항 / 파일 목록*
