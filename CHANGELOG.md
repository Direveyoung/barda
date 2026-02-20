# BARDA 개발 로그 (CHANGELOG)

> 모든 주요 변경사항을 기록합니다. 포맷: `[버전] - YYYY-MM-DD` + Added / Fixed / Changed / Removed

---

## [1.4.0] - 2026-02-20

### Added
- **SVG Icon 컴포넌트** (`components/Icon.tsx`): 90+ 인라인 SVG 아이콘 (스킨케어, 날씨, UI, 성분, 피부타입, 랭킹 메달 등)
  - `<Icon name="..." size={...} className="..." />` 형태로 사용
  - 카테고리: UI(sun, moon, heart, trophy 등), 제품(bottle, jar, drop 등), 성분(beaker, pill, shield 등), 날씨(cloudy, rainy, snowy 등), 피부 컨디션(face-happy~face-bad), 메달(gold/silver/bronze-medal)

### Changed
- **프론트엔드 전체 이모지 → SVG 아이콘 대체** (13개 파일, 75+ 이모지 제거)
  - `data/products.ts`: `CategoryItem.emoji` → `CategoryItem.icon` (20개 카테고리)
  - `data/ingredients.ts`: `CATEGORY_EMOJI` → `CATEGORY_ICON` (9개 성분 카테고리)
  - `lib/weather.ts`: `WeatherTip.emoji` → `WeatherTip.icon`, `WEATHER_DESCRIPTIONS` 아이콘 매핑 (24개 날씨 코드 + 20개 팁)
  - `lib/analysis.ts`: `DaySchedule.pmEmoji` → `DaySchedule.pmIcon`
  - 컴포넌트 5개: SkinTypeStep, ConcernStep, ProductStep, ResultView, NotificationBell, BlurOverlay, FeedbackButtons
  - 페이지 10개: page, analyze, challenge, drawer, dupe, guide, ranking, mypage/profile, mypage/MypageClient, ingredient-analysis, auth/login

### Removed
- 모든 유니코드 이모지 문자 (렌더링 일관성 + 크로스 플랫폼 호환성 확보)

---

## [1.3.0] - 2026-02-20

### Added
- **Zod 스키마 검증 도입** (`lib/api-types.ts`)
  - 8개 Zod 스키마: routines, comments, payments, search-logs, events, feedback, product-candidates, update-candidate
  - `parseWithZod()` 헬퍼: 에러 메시지 자동 포맷팅
  - `sanitizeString()` XSS 새니타이저: HTML 태그/특수문자 이스케이프
- **결제 멱등성 체크** (`api/payments/confirm`): orderId 중복 결제 방지 (409 반환)
- **Toss 에러 응답 마스킹**: 민감 데이터 제거, code/message만 클라이언트에 반환

### Changed
- 모든 POST/PATCH API 라우트: 수동 타입 체크 → Zod 스키마 검증으로 교체
  - `api/routines`: score 0-100, rating 1-5, concerns 배열 길이 제한, comment 500자 제한
  - `api/product-candidates`: brand 100자, name 200자 제한 + XSS 새니타이징
  - `api/events`: 개별 이벤트 필드 검증 + 배열 최대 100개 제한
  - `api/feedback`: 문자열 길이 200자 제한
  - `api/search-logs`: query 200자 제한, results_count 정수 검증
  - `api/comments`: Zod 검증 + XSS 새니타이징
- `api/routines` GET: 검색 쿼리 SQL 와일드카드 이스케이프 (`%`, `_`)

### Fixed
- 품평 리포트 P1 항목 전체 대응: API 입력 검증 강화, XSS 방지, 결제 멱등성, 에러 마스킹

---

## [1.2.0] - 2026-02-19

### Added
- **날씨 기반 루틴 고도화** (`lib/weather.ts`)
  - 7일 예보 (DailyForecast): 일자별 기온/UV/날씨코드 + 루틴 어드바이스
  - 바람 속도 데이터: 강풍(10m/s+), 바람(6m/s+) 팁 추가
  - `getWeatherRoutineAdvice()`: UV/온도/습도/바람 종합 분석 → 레티놀/각질케어 안전도, 선크림 재도포 횟수, 보습 레벨, 텍스처 어드바이스
- **듀프 파인더 고도화** (`app/dupe/page.tsx`)
  - 예상 가격대: 4단계 × 카테고리별 가격 범위 표시
  - 절약 금액 배너: 원본 대비 최대 절약 가능 금액
  - 인기도 점수: 올리브영베스트 + 브랜드 인지도 기반
  - 배지 시스템: "가장 유사", "Best Value", "인기" 자동 부여
  - 정렬 옵션: 유사도순 / 가격순 / 인기순
  - 피부고민 매칭: 원본과 대안의 태그 일치도 표시
- **외부 API 프로덕션 연동** (`lib/external-apis.ts`)
  - 인메모리 캐싱 (5분 TTL, 최대 500엔트리)
  - 재시도 로직 (최대 2회, 1s/2s 백오프)
  - `lookupIngredientEnriched()`: 식약처 + 성분사전 병렬 조회 → 통합 결과
  - 헬스체크 실제 연결 테스트로 강화
- **성분 조회 API** (`/api/ingredients/lookup`)
  - 사용자 대면 API: 성분명으로 외부 DB 조회 (MFDS + 공공데이터포털)
  - 성분 분석 페이지에서 외부 API 데이터 자동 보강 (EWG 등급, 규제, 배합한도)

### Changed
- `ingredient-analysis/page.tsx`: 등록/미등록 성분 모두 외부 API 데이터 표시
- `external-apis.ts`: 모든 API 함수에 캐싱 + 재시도 적용

---

## [1.1.0] - 2026-02-19

### Added
- **제품 DB 502개 달성** (496 → 502, 6개 K-뷰티 신제품 추가)
  - 믹순 빈 에센스, 일리윤 프로바이오틱 에센스, 라운드랩 쑥 진정 토너
  - 스킨1004 센텔라 앰플 2세대, 메디큐브 콜라겐 나이트 크림, 토리든 셀마징 크림
- **테스트 코드 71개** (Vitest 프레임워크 도입)
  - `analysis.test.ts`: 44개 (충돌 감지, 누락 단계, 점수, 캘린더, 팁, 헬퍼)
  - `search.test.ts`: 27개 (정확 매칭, 별칭 확장, 퍼지 매칭, 엣지 케이스)
- **API 응답 타입 중앙화** (`lib/api-types.ts`)
  - 12개 API 엔드포인트 request/response 타입 정의
  - 공유 validation 헬퍼: `isNonEmptyString`, `isPositiveNumber`, `isValidBarcode`, `isValidSkinType`, `isStringArray`, `isValidRating`, `isValidCandidateStatus`
  - 모든 API route에 return type annotation 적용

### Changed
- API route handlers: 타입 안전성 강화 (response type + validation 함수 적용)
- `package.json`: vitest, @vitejs/plugin-react devDependencies 추가, test script 추가

---

## [1.0.0] - 2026-02-19

### Added
- **Phase 3-1: 날씨 기반 루틴 고도화** (`lib/weather.ts`)
  - 미세먼지(PM2.5/PM10) 데이터 추가 (Open-Meteo Air Quality API 병렬 호출)
  - 시간대별 추천 (morning/afternoon/evening `timeTag`)
  - 계절별 추천 (spring/summer/autumn/winter `season`)
  - 최대 TIP 수 4 → 6개 확장
  - 홈 화면 날씨 카드에 PM2.5/UV/습도 배지 추가
- **Phase 3-2: 듀프 파인더 고도화** (`app/dupe/page.tsx`)
  - 가격대 필터 (`PriceTier`: budget/mid/premium/luxury)
  - 브랜드별 가격 매핑 (60+ 브랜드)
  - 성분 비교 모달 (사이드 바이 사이드)
  - 가격 티어 배지 및 필터 카운트
- **Phase 3-3: AI 성분 분석 강화**
  - `data/ingredients.ts`: 30종 성분 DB (safetyScore 1-5, goodWith/avoidWith, skinTypes)
  - `app/ingredient-analysis/page.tsx`: 성분별 상세 분석, 시너지/충돌 맵, 맞춤 추천
  - 카테고리별 이모지/라벨, 피부타입별 라벨
  - SafetyLevel 타입 + getSafetyLevel/toEwgScore 헬퍼
- **Phase 3-4: 바코드 스캐너** (`app/scanner/page.tsx`)
  - 카메라 탭: 웹캠 바코드 촬영 + 스캔 애니메이션
  - 수동 입력 탭: 전성분 목록 붙여넣기 → 성분 분석
  - `/api/barcode` 라우트: Open Beauty Facts 바코드 조회
  - 예시 성분 목록 (보습 크림/미백 세럼/레티놀 크림)
  - BARDA DB 자동 매칭 + 루틴 분석 CTA
- **가이드 페이지 업데이트** (`app/guide/page.tsx`)
  - "스킨케어 도구" 섹션 추가 (성분 분석/스캐너/듀프/루틴 4개 카드)

### Fixed
- scanner/page.tsx: `fetchOBFByBarcode` 직접 import → `/api/barcode` fetch로 변경 (클라이언트/서버 분리)
- scanner/page.tsx: ingredients.ts 신규 API에 맞게 필드명 수정 (koreanName→name, ewgScore→safetyScore 등)
- `INGREDIENT_DB.length` → `Object.keys(INGREDIENT_DB).length` (Record 타입 대응)

---

## [0.9.1] - 2026-02-16

### Fixed
- (P0) localStorage SSR 방지: MypageClient, challenge, page, drawer, profile, ResultView, NotificationBell에 `typeof window` 가드 추가
- (P0) admin/page.tsx candidateFilter를 `useMemo`로 최적화

### Changed
- (P1) localStorage 접근 방식 전체 통일: lib/notifications.ts, lib/weather.ts에도 SSR 가드 추가
- (P2) next.config.ts에 `reactStrictMode`, `poweredByHeader: false`, `images.formats` 설정 추가

---

## [0.9.0] - 2026-02-16

### Added
- 문서 관리 체계 도입: `check-docs.sh` (문서 규칙 체크 스크립트)
- `TODO.md` 작업 목록 파일
- CLAUDE.md에 문서 관리 규칙 강화 (필수 섹션, CHANGELOG 포맷 규정, check-docs.sh 안내)

### Changed
- CHANGELOG.md 포맷을 `[버전] - YYYY-MM-DD` + Added/Fixed/Changed 섹션 구분으로 통일
- CLAUDE.md 디렉토리 구조에 `TODO.md`, `check-docs.sh` 추가

---

## [데이터전략] 외부 API 3종 + 자동 학습 파이프라인 + 관리자 강화 — 2026.02.16

### 변경 사항
- **외부 API 연동 3종** (`lib/external-apis.ts`)
  - 식약처 OpenAPI: 기능성화장품 성분 조회 (배합한도, 규제사항)
  - Open Beauty Facts: 글로벌 K-뷰티 전성분 DB (바코드/제품명 검색, API키 불필요)
  - 공공데이터포털 성분사전: 한글↔INCI 성분명 매핑 + EWG 등급
  - 통합 `APIResult<T>` 타입 + `checkAPIHealth()` 헬스체크
- **자동 학습 파이프라인** (`lib/pipeline.ts`)
  - `runAutoPromotePipeline()`: submit_count >= 3 후보 자동 승격 (pending → auto_promoted)
  - `generateSearchMissReport()`: 주간 검색 미스 Top 20 + 히트율 분석
  - `analyzeCommunityProducts()`: 커뮤니티 인기 제품 추출 + 피부타입별 다양성
  - `generateWeeklyReport()`: 검색 + 후보 + 커뮤니티 종합 주간 리포트
  - SQL 참고 쿼리 (Supabase cron 실행용)
- **관리자 대시보드 강화** (`app/admin/page.tsx`)
  - 3탭 구조: 개요 / 파이프라인 / 외부 API
  - 파이프라인 탭: 3계층 아키텍처 다이어그램 (수집→분석→실행) + 4개 파이프라인 실행 버튼 + 결과 표시 + 주간 리포트 뷰
  - 외부 API 탭: 3종 API 헬스체크 (상태 dot) + API 테스트 콘솔 (select + input + JSON 결과) + 연동 플로우 설명
  - 제품 후보 필터에 `auto_promoted` 상태 추가
- **관리자 API 라우트 2개 신규**
  - `/api/admin/pipeline`: POST (자동승격/미스분석/커뮤니티/주간리포트)
  - `/api/admin/external-apis`: GET (헬스체크) + POST (테스트 쿼리)

### 파일
- `src/lib/external-apis.ts` — 신규 (외부 API 3종 커넥터)
- `src/lib/pipeline.ts` — 신규 (자동 학습 파이프라인)
- `src/app/api/admin/pipeline/route.ts` — 신규 (파이프라인 API)
- `src/app/api/admin/external-apis/route.ts` — 신규 (외부 API 테스트)
- `src/app/admin/page.tsx` — 3탭 대시보드로 대폭 강화
- `docs/features.md` — 외부 API + 자동학습 섹션 추가
- `docs/architecture.md` — API 라우트 10개, lib 파일 추가, 파이프라인/API 플로우 추가

### 아키텍처 근거
- 3계층 자동 학습: 수집(search_logs + product_candidates + routine_posts) → 분석(미스/승격/커뮤니티) → 실행(DB확장/별칭/리포트)
- 외부 API는 관리자 테스트 후 점진적 통합 (헬스체크 + 테스트 콘솔)

---

## [벤치마킹] 날씨 루틴 + 제품 서랍 + 듀프 파인더 — 2026.02.16

### 변경 사항
- **날씨 기반 루틴 추천** (`lib/weather.ts`)
  - Open-Meteo API 연동 (무료, API키 불필요)
  - 브라우저 위치 자동 감지 (서울 기본값)
  - 기온/습도/UV/날씨코드 기반 스킨케어 TIP 생성
  - 피부타입·레티놀/AHA 사용 여부 반영한 맞춤 TIP
  - 1시간 캐시 (`barda_weather`)
  - 홈 화면 체크리스트 상단에 날씨 TIP 카드 통합
- **제품 서랍/트래커** (`app/drawer/page.tsx`)
  - 보유 제품 등록 (DB 검색 연동)
  - 상태 관리: 미개봉 → 사용 중 → 다 씀
  - 개봉일 자동 기록 + 경과일 표시
  - 180일 초과 시 유통기한 경고
  - 상태별 필터 (전체/사용 중/미개봉/다 씀)
  - "사용 중인 제품으로 루틴 분석하기" CTA
- **듀프 파인더** (`app/dupe/page.tsx`)
  - 성분 유사도 기반 대안 제품 찾기 (같은 카테고리)
  - key_ingredients 겹침 비율(70%) + 태그 유사도(30%) = 종합 유사도
  - 유사도 15%+ 제품 최대 10개 표시
  - 매칭 성분 하이라이트, 카테고리별 브라우징
  - 인기 검색어 + 설명 섹션 (SEO)
- **홈 화면 업데이트**
  - 비로그인 랜딩: 듀프 파인더 CTA 추가
  - 로그인 홈: 날씨 TIP 카드 + 내 서랍/듀프 파인더 배너

### 파일
- `src/lib/weather.ts` — 신규 (날씨 API + TIP 생성)
- `src/app/drawer/page.tsx` — 신규 (제품 서랍)
- `src/app/dupe/page.tsx` — 신규 (듀프 파인더)
- `src/app/page.tsx` — 날씨 TIP + 서랍/듀프 링크 추가
- `docs/features.md` — 벤치마킹 기능 섹션 추가
- `docs/architecture.md` — 페이지 15개, weather.ts, localStorage 키 추가

### 벤치마킹 근거
- 날씨 기반 루틴: Skin Bliss의 "쉬운 차별화" 기능
- 제품 서랍: FeelinMySkin/SkinSort의 제품 트래커 (마지막 🔴 핵심 갭)
- 듀프 파인더: SkinSort의 듀프 파인더 (SEO 가치 높음)

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
        ├── app/                    ← 라우트 (15개 페이지)
        ├── components/             ← 컴포넌트 (12개)
        ├── contexts/               ← 상태 (AuthContext)
        ├── data/                   ← 데이터 (products, rules, aliases)
        └── lib/                    ← 유틸 (analysis, search, weather, events, payments, notifications)
```

---

*이 CHANGELOG는 모든 기획/업데이트 시 업데이트됩니다.*
*형식: [태그] 제목 — 날짜 / 변경사항 / 파일 목록*
