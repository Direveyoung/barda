# BARDA - 스킨케어 루틴 분석기

## 프로젝트 개요
K-뷰티 특화 스킨케어 루틴 분석 웹앱. 여러 제품 조합의 성분 충돌을 분석하고, AM/PM 순서 + 7일 캘린더를 자동 생성. 듀프 파인더, AI 성분 분석, 바코드 스캐너, 날씨 기반 루틴 추천 등 종합 스킨케어 플랫폼.

## 기술 스택
- **프레임워크**: Next.js 16.1.6 (App Router, Turbopack)
- **스타일링**: Tailwind CSS v4 (`@theme inline`)
- **DB/Auth**: Supabase (PostgreSQL 9테이블 + Auth) — *연결 예정*
- **결제**: 토스페이먼츠 (테스트키 플레이스홀더) — *연결 예정*
- **외부 API**: Open-Meteo (날씨), Open Beauty Facts (바코드), 식약처/공공데이터포털 (성분) — *API키 연결 예정*
- **테스트**: Vitest (71개 테스트)
- **배포**: Vercel (Seoul icn1) — *배포 예정*

## 핵심 명령어
```bash
cd barda-app
npm run dev          # 개발 서버 (Turbopack)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint
npm run test         # Vitest 테스트 실행
npm run test:watch   # Vitest 와치 모드
```

## 디렉토리 구조
```
barda/
├── CLAUDE.md                 ← 이 파일 (500줄 이하 유지)
├── CHANGELOG.md              ← 버전별 변경이력
├── TODO.md                   ← 작업 목록 + 사업 전략
├── check-docs.sh             ← 문서 규칙 체크 스크립트
├── docs/                     ← 상세 문서
│   ├── architecture.md       ← 아키텍처 + 파일 맵 + 데이터 흐름
│   ├── product-db.md         ← 제품 DB 전략/구조
│   ├── features.md           ← 기능 인벤토리 + 구현 상태
│   └── api-routes.md         ← API 라우트 명세 (16개 엔드포인트)
└── barda-app/                ← Next.js 앱
    └── src/
        ├── app/              ← 라우트 (16 페이지 + 16 API)
        ├── components/       ← 컴포넌트 (12개)
        ├── contexts/         ← AuthContext
        ├── data/             ← products(502), rules(15), aliases, ingredients(30)
        └── lib/              ← analysis, search, weather, external-apis, pipeline, events, payments, api-types
```

## 주요 규칙

### 문서 관리
- **CLAUDE.md는 항상 500줄 이하** 유지 — 초과 시 즉시 `docs/`로 분리.
- 기능 추가/수정 시 **CHANGELOG.md** 필수 업데이트 (날짜, 버전, 변경내용).
- 새 세션 시작 시 **CLAUDE.md 먼저 읽기**.
- `bash check-docs.sh`로 문서 규칙 준수 여부 확인 가능.

### 코딩 컨벤션
- TypeScript strict, no `any`
- Tailwind CSS v4 유틸리티 클래스 사용 (CSS 파일 직접 수정 X)
- 컴포넌트: `function` 선언 + `export default`
- 상태 저장: localStorage 키 prefix `barda_`
- API: Next.js Route Handlers (`/api/...`), 응답 타입은 `lib/api-types.ts` 중앙 관리
- Supabase/외부 API 없으면 graceful fallback (503 또는 빈 응답)

### Git 규칙
- 커밋 메시지: `feat:`, `fix:`, `docs:` 한글 설명
- 브랜치: `claude/skincare-routine-analyzer-wB07w`

### 제품 DB
- **502개** 제품, 83개 브랜드, 20개 카테고리
- 모든 제품: `key_ingredients`, `tags`, `source`, `verified` 필수
- 검색: 3단계 (정확 → 별칭 → Levenshtein)
- 미등록 제품: 유저 직접입력 → `product_candidates` 테이블

### 분석 엔진
- 15개 충돌 규칙 (`src/data/rules.ts`)
- 농도 레벨별 심각도 조정 (`concentration_level`)
- 피부타입별 심각도 범프 (`skinTypeModifier`)
- 100점 만점 루틴 점수

### 날씨 엔진
- Open-Meteo API (무료, API키 불필요)
- 7일 예보 + 바람 속도 + 미세먼지 + UV
- `getWeatherRoutineAdvice()`: 레티놀/각질케어 안전도, 보습 레벨, 텍스처 어드바이스

### 듀프 파인더
- 성분 유사도(70%) + 태그 유사도(30%) 종합
- 4단계 가격 티어 × 카테고리별 예상 가격대
- 인기도 점수, 배지 시스템 (가장유사/BestValue/인기)
- 정렬: 유사도순/가격순/인기순

### 외부 API (3종)
- 식약처 OpenAPI: 기능성화장품 성분 (배합한도, 규제)
- Open Beauty Facts: 바코드 제품 조회 (무료)
- 공공데이터포털 성분사전: INCI 매핑 + EWG 등급
- 인메모리 캐싱 (5분 TTL) + 재시도 (2회, 백오프)

### 페이월 (블러)
| 항목 | 무료 | 유료 (9,900원) |
|------|------|---------------|
| 충돌 1건 | 전체 | 전체 |
| 충돌 2건+ | 블러 | 전체 |
| 7일 캘린더 | 블러 | 전체 |
| 팁 | 첫 번째만 | 전체 |
| 개발 테스트 | `barda_dev_unlock=true` (localStorage) |

### DB 테이블 (9개)
```
user_routines, payments, search_logs, product_candidates,
funnel_events, report_feedback, routine_posts,
routine_post_likes, routine_post_comments
```

## 환경 변수 (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=           # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # Supabase 공개 키
NEXT_PUBLIC_TOSS_CLIENT_KEY=        # 토스 클라이언트 키
TOSS_SECRET_KEY=                    # 토스 시크릿 키
PUBLIC_DATA_SERVICE_KEY=            # 공공데이터포털 인증키 (식약처 + 성분사전 공용)
```

## 현재 상태 (2026.02.25)
- 버전: **v1.5.0**
- MVP-1 ~ Phase 3 + 고도화 + UI 리디자인 **전체 구현 완료**
- 제품 DB 502개, 성분 DB 30종, 테스트 71개
- 이모지 → SVG 아이콘 전면 교체, Zod 입력 검증 완비
- PC 데스크톱 셸 + 화해/파우더룸 스타일 랜딩 페이지
- 테스트 계정 로그인 (test@barda.dev)
- 외부 API 캐싱/재시도 프로덕션 레디
- **남은 작업**: DB/API키 실제 연결, Vercel 배포, Supabase cron
- 상세: `docs/features.md`, `TODO.md` 참고

## 상세 문서 링크
- `docs/architecture.md` — 아키텍처 + 파일 맵 + 데이터 흐름
- `docs/features.md` — 기능 인벤토리 + 구현 상태
- `docs/api-routes.md` — API 라우트 명세 (16개 엔드포인트)
- `docs/product-db.md` — 제품 DB 전략/구조 (502개)
