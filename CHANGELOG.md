# BARDA 개발 로그 (CHANGELOG)

> 모든 주요 변경사항을 기록합니다. 포맷: `[버전] - YYYY-MM-DD` + Added / Fixed / Changed / Removed

---

## [1.7.0] - 2026-03-30

### Added
- **Supabase 실제 연결**: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` `.env.local` 설정 완료
- **Vercel 환경변수**: `PUBLIC_DATA_SERVICE_KEY` (식약처 API) Vercel + `.env.local` 동시 적용
- **Supabase Auth URL 설정**: `site_url=https://barda-red.vercel.app`, redirect allow list (vercel + localhost) 설정 완료
- **관리자 인증 재구현**: HTTP-only 쿠키 기반 (`barda_admin_session`) → Supabase session 의존 제거
- **Edge Function `collect-cosmetics`**: Open Beauty Facts API로 K-뷰티 신규 제품 자동 수집 (24개 브랜드 로테이션)
- **Edge Function `enrich-products`**: OBF API로 기존 제품 이미지/성분 자동 보강
- **pg_cron 2개**: `collect-cosmetics-weekly` (매주 월 03:00 KST) + `enrich-products-weekly` (매주 수 02:00 KST)
- **`app_secrets` 테이블**: API 키 Supabase DB 안전 보관 (service_role 전용 접근)
- **제품 DB 확장**: 640 → 660개 (+20개 Open Beauty Facts 수집: innisfree, anua, beauty of joseon, purito 등)
- **성분 DB 확장**: 55 → 63종 (+8: 글리세린, 세라마이드NP, 페룰산, 트레할로스, 폴리글루타민산 등)
- **pg_cron + pg_net 확장**: Supabase 프로젝트에 비동기 HTTP + 스케줄러 활성화

### Fixed
- **admin stats RLS 우회**: `supabase.rpc("get_admin_stats")` 기반으로 교체 → 관리자 통계 정상 조회
- **`admin/layout.tsx`**: 로그인/로그아웃 `/api/admin/auth` POST/DELETE 연동

### Changed
- **제품 DB 브랜드 확장**: 84 → 115개 브랜드 (미샤, SK-II, Paula's Choice, Glow Recipe, Tatcha 등)

---

## [1.6.0] - 2026-03-29
