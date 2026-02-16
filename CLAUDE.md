# BARDA - 스킨케어 루틴 분석기

## 프로젝트 개요
K-뷰티 특화 스킨케어 루틴 분석 웹앱. 여러 제품 조합의 성분 충돌을 분석하고, AM/PM 순서 + 7일 캘린더를 자동 생성.

## 기술 스택
- **프레임워크**: Next.js 16.1.6 (App Router, Turbopack)
- **스타일링**: Tailwind CSS v4 (`@theme inline`)
- **DB/Auth**: Supabase (PostgreSQL 9테이블 + Auth)
- **결제**: 토스페이먼츠 (테스트키 플레이스홀더)
- **배포**: Vercel (Seoul icn1)

## 핵심 명령어
```bash
cd barda-app
npm run dev          # 개발 서버 (Turbopack)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint
```

## 디렉토리 구조
```
barda/
├── CLAUDE.md                 ← 이 파일 (500줄 이하 유지)
├── CHANGELOG.md              ← 개발 히스토리 로그
├── docs/                     ← 스킬별 상세 문서
│   ├── architecture.md       ← 아키텍처 + 파일 맵
│   ├── product-db.md         ← 제품 DB 전략/구조
│   ├── features.md           ← 기능 인벤토리 + 구현 상태
│   └── api-routes.md         ← API 라우트 명세
├── BARDA-벤치마킹-업데이트-v2.md  ← 경쟁분석
├── BARDA-서비스기획서-v3.md       ← 서비스 기획서
└── barda-app/                ← Next.js 앱
    └── src/
        ├── app/              ← 라우트 (13 페이지)
        ├── components/       ← 컴포넌트 (12개)
        ├── contexts/         ← AuthContext
        ├── data/             ← products, rules, aliases
        └── lib/              ← analysis, search, events, payments
```

## 주요 규칙

### 문서 관리
- **CLAUDE.md는 항상 500줄 이하** 유지. 필수항목만.
- 기능 상세, API 명세, 아키텍처 등은 `docs/` 폴더에 분리.
- 기획/업데이트 시 **CHANGELOG.md** 반드시 업데이트.

### 코딩 컨벤션
- TypeScript strict, no `any`
- Tailwind CSS v4 유틸리티 클래스 사용 (CSS 파일 직접 수정 X)
- 컴포넌트: `function` 선언 + `export default`
- 상태 저장: localStorage 키 prefix `barda_`
- API: Next.js Route Handlers (`/api/...`)
- Supabase 없으면 graceful fallback (503 또는 빈 응답)

### Git 규칙
- 커밋 메시지: `feat:`, `fix:`, `docs:` 한글 설명
- 브랜치: `claude/skincare-routine-analyzer-wB07w`

### 제품 DB
- 현재 300개, 20개 카테고리
- 모든 제품: `key_ingredients`, `tags`, `source`, `verified` 필수
- 신규 제품 추가 시 `src/data/products.ts` 직접 편집
- 검색: 3단계 (정확 → 별칭 → Levenshtein)
- 미등록 제품: 유저 직접입력 → `product_candidates` 테이블

### 분석 엔진
- 15개 충돌 규칙 (`src/data/rules.ts`)
- 농도 레벨별 심각도 조정 (`concentration_level`)
- 피부타입별 심각도 범프 (`skinTypeModifier`)
- 100점 만점 루틴 점수

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

### 홈 화면 분기
- 비로그인 → 마케팅 랜딩 (히어로 + 기능소개 + 피드 + 통계)
- 로그인(분석완료) → 체크리스트(AM/PM) + 다이어리 + 챌린지 + 피드
- 로그인(분석전) → 분석 CTA

### 체크리스트 ↔ 캘린더 연동
- `barda_last_routine`에 `calendar` 데이터 포함
- PM 루틴에 "오늘은 레티놀 Day" / "각질케어 Day" 배지 표시
- AM 루틴에 레티놀/각질 Day일 때 "선크림 필수" 배지

### 다이어리 ↔ 챌린지 연동
- 피부 컨디션 저장 시 → 챌린지 해당 Day 자동 완료
- 챌린지 페이지에서 각 Day별 다이어리 기록 표시

## 환경 변수 (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=
```

## 현재 상태 (2026.02.16)
- MVP-1 ~ Phase 2 + DB전략 **전체 구현 완료**
- 벤치마킹 🔴/🟡 항목 전부 완료
- 남은 과제: Phase 3 (AI, 스캐너, 날씨, 듀프파인더)
- 상세: `docs/features.md` 참고
