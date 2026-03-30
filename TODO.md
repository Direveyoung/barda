# BARDA TODO

> 작업 목록. 완료 시 `[x]`로 체크. 최종 업데이트: 2026-03-30

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
- [x] 베타 보안 강화: 페이월 우회 차단, 테스트 유저 환경 분기, 결제 금액 서버 검증, 보안 헤더, Rate Limiting, 관리자 환경변수화 (2026.03.29)
- [x] 프로덕션 인프라: error.tsx/not-found.tsx, robots.ts/sitemap.ts, .env.example, PWA manifest (2026.03.29)
- [x] P0 성분 민감도 알림: checkSensitivities() + analyzeRoutine() 연동 + ResultView 경고 UI + SensitivityManager
- [x] P1 배지/업적 시스템: badge-repository.ts + BadgeCard + MypageClient 통합
- [x] P2 체크리스트 준수율 대시보드: checklist-stats.ts + AdherenceDashboard + MypageClient 통합

---

## 즉시 필요: 실제 연결 (DB + API키 + 배포)

### Supabase 연결
- [x] `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정 (2026.03.30)
- [x] `supabase/migrations/001_initial_schema.sql` 실행 — 9개 테이블 생성 완료 (2026.03.30)
- [x] Supabase Auth 설정 — site_url + redirect allow list 설정 (2026.03.30)
- [x] Vercel 환경변수 동기화 (`PUBLIC_DATA_SERVICE_KEY` 포함) (2026.03.30)

### 토스페이먼츠 연결
- [ ] 토스 비즈니스 계정 + 실제 API키 발급 **← 유저 직접 진행 필요**
- [ ] `.env.local`에 `NEXT_PUBLIC_TOSS_CLIENT_KEY` + `TOSS_SECRET_KEY` 설정
- [ ] 테스트 모드 결제 플로우 검증

### 외부 API키 연결
- [x] 공공데이터포털 `PUBLIC_DATA_SERVICE_KEY` 발급 및 설정 (2026.03.30)
- [x] `.env.local` + Vercel 환경변수 설정 완료 (2026.03.30)
- [x] Open Beauty Facts — Edge Function `collect-cosmetics` 배포 + pg_cron 주간 수집 자동화 (2026.03.30)

### 배포
- [x] Vercel 프로젝트 생성 (Seoul icn1 리전) — `barda-red.vercel.app` READY (2026.03.30)
- [x] 환경변수 설정 + 빌드 + 배포 완료 (2026.03.30)
- [ ] 커스텀 도메인 연결 **← 유저 직접 진행 필요**

---

## Phase 4A: ✅ 완료 (2026.03.30)

- [x] `data/challenges.ts` — 챌린지 프리셋 5종 + 테마별 dailyTips
- [x] `challenge/page.tsx` — 프리셋 선택 화면 + N일 진행률 + presetId 저장
- [x] `lib/product-similarity.ts` — 성분유사도(70%) + 태그유사도(30%) 추천 엔진
- [x] `drawer/page.tsx` — finished 제품 "비슷한 제품 보기" 버튼 + 추천 3개 모달

---

## Phase 4B: ✅ 완료 (2026.03.30)

- [x] Supabase cron + Edge Function 자동 학습 파이프라인 (2026.03.30)
  - `collect-cosmetics`: 매주 K-뷰티 신규 제품 수집
  - `enrich-products`: 매주 이미지/성분 자동 보강

---

## Phase 5: ✅ 완료 (2026.03.30)

- [x] 팔로우/팔로워 시스템: `user_follows` 테이블 + `/api/follows` + `lib/follow-repository.ts`
- [x] 피드 팔로잉 탭: FeedClient에 전체/팔로잉 탭 분기
- [x] 루틴 따라하기 확장: 부족 제품 확인 + 구매 링크 + 듀프 자동 제시 모달
- [x] 루틴 상세에서 유저 팔로우/팔로우 취소 버튼
- [x] Q&A 섹션: `/qa` 페이지 + `qa_posts`/`qa_answers` 테이블 + 채택 기능
- [x] 피드에서 Q&A 바로가기 버튼

---

## Phase 6: ✅ 완료 (2026.03.30)

- [x] 어필리에이트 링크 유틸리티: `lib/affiliate.ts` (올리브영/쿠팡)
- [x] 듀프 파인더 → 구매 CTA: 각 듀프 카드에 올리브영/쿠팡 버튼
- [x] 제품 서랍 재구매: finished 제품 추천에 구매 링크 추가
- [x] 루틴 따라하기 모달: 제품별 올리브영/쿠팡 구매 링크
- [x] 브랜드 협업 배너: `BrandBanner` 컴포넌트 + 피드 5번째 포스트 후 삽입
- [x] 어필리에이트 클릭 이벤트 추적 (`funnel_events` 연동)

---

## Phase 7: ✅ 완료 (2026.03.30)

- [x] 트렌드 API: `/api/trends` (검색어/브랜드/성분/카테고리 트렌드, 30d 기준)
- [x] 인사이트 API: `/api/insights` (피부타입 분포, 고민 분포, 루틴 점수, 인기 제품)
- [x] 관리자 트렌드 대시보드: `/admin/trends` — 바 차트 + API 엔드포인트 안내

---

## Phase 8: 이후 (선택)

- [ ] 프리미엄 구독 (월 ₩3,900) — 토스페이먼츠 연결 후 활성화
- [ ] 에러 모니터링 (Sentry) 연동
- [ ] 팔로우/팔로워 피드 고도화 (복수 userId 필터 지원)
- [ ] Q&A 전문가 배지 시스템 (user_profiles 확장)
- [ ] 어필리에이트 파트너스 ID 등록 (올리브영/쿠팡 실계약)
- [ ] 트렌드 B2B API 유료화 (API 키 인증)
