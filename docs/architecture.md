# BARDA 아키텍처 상세

## 파일 맵

### 페이지 라우트 (13개)
```
src/app/
├── page.tsx                    ← 홈 (비로그인: 랜딩 / 로그인: 체크리스트+다이어리)
├── analyze/page.tsx            ← 루틴 분석 위자드 (4단계)
├── feed/
│   ├── page.tsx                ← 커뮤니티 피드 (SSR)
│   ├── FeedClient.tsx          ← 피드 인터랙션 (필터, 검색, 좋아요)
│   └── [id]/
│       ├── page.tsx            ← 루틴 상세 (SSR + OG 메타)
│       └── RoutineDetailClient.tsx ← 상세 인터랙션 (댓글, 따라하기)
├── guide/page.tsx              ← 성분 가이드 30종
├── challenge/page.tsx          ← 7일 스킨케어 챌린지
├── ranking/page.tsx            ← 인기 루틴 랭킹
├── mypage/
│   ├── page.tsx                ← 마이페이지
│   ├── MypageClient.tsx        ← 마이페이지 인터랙션
│   └── profile/page.tsx        ← 프로필 설정
├── auth/
│   ├── login/page.tsx          ← 로그인 (이메일 + Google OAuth)
│   └── callback/route.ts       ← OAuth 콜백 핸들러
└── admin/page.tsx              ← 관리자 대시보드
```

### API 라우트 (8개)
```
src/app/api/
├── routines/
│   ├── route.ts                ← GET (피드 목록) + POST (루틴 공유)
│   └── [id]/
│       ├── like/route.ts       ← POST (좋아요 토글)
│       └── comments/route.ts   ← GET + POST + DELETE (댓글)
├── search-logs/route.ts        ← POST (검색 로그) + GET (통계)
├── product-candidates/route.ts ← POST + GET + PATCH (제품 후보)
├── admin/stats/route.ts        ← GET (관리자 통계 집계)
├── events/route.ts             ← POST (퍼널 이벤트 배치)
├── feedback/route.ts           ← POST (👍/👎 피드백)
└── payments/confirm/route.ts   ← POST (토스 결제 확인)
```

### 컴포넌트 (12개)
```
src/components/
├── BottomNav.tsx               ← 5탭 하단 네비게이션
├── BlurOverlay.tsx             ← 페이월 블러 컴포넌트
├── FeedbackButtons.tsx         ← 👍/👎 피드백
├── NotificationBell.tsx        ← 알림 벨
├── RoutinePostCard.tsx         ← 루틴 카드 (피드용)
├── ShareRoutineModal.tsx       ← 루틴 공유 모달
├── ProductStep.tsx             ← 제품 검색/입력 (분석 2단계)
├── SkinTypeStep.tsx            ← 피부타입 선택 (분석 0단계)
├── ConcernStep.tsx             ← 고민 선택 (분석 1단계)
└── ResultView.tsx              ← 분석 결과 (점수, 충돌, 캘린더, 순서, 팁)
```

### 데이터 + 라이브러리
```
src/data/
├── products.ts                 ← 제품 DB (300개, 20 카테고리)
├── rules.ts                    ← 충돌 규칙 15개 + 미싱스텝 규칙
└── aliases.ts                  ← 검색 별칭 (한글↔영문)

src/lib/
├── analysis.ts                 ← 분석 엔진 (충돌, 점수, 캘린더, 팁)
├── search.ts                   ← 3단계 검색 (정확→별칭→퍼지)
├── events.ts                   ← 퍼널 이벤트 트래킹
├── payments.ts                 ← 토스페이먼츠 SDK
├── notifications.ts            ← 알림 로직
└── supabase/
    ├── client.ts               ← 브라우저 클라이언트
    └── server.ts               ← 서버 클라이언트 (cookies)

src/contexts/
└── AuthContext.tsx              ← AuthProvider (user, isPaid, signOut)

src/middleware.ts                ← 세션 갱신 + /admin 보호
```

## localStorage 키 맵
| 키 | 용도 | 구조 |
|---|---|---|
| `barda_last_routine` | 마지막 분석 결과 | `{score, amRoutine, pmRoutine, calendar, hasRetinol, hasAHA, skinType, concerns, savedAt}` |
| `barda_checks_YYYY-MM-DD` | 오늘 체크리스트 상태 | `{am: boolean[], pm: boolean[]}` |
| `barda_diary_YYYY-MM-DD` | 스킨 다이어리 | `{condition: string, memo: string}` |
| `barda_challenge` | 7일 챌린지 상태 | `{startDate: string, completedDays: boolean[]}` |
| `barda_dev_unlock` | 개발용 페이월 해제 | `"true"` |

## 데이터 흐름

### 분석 플로우
```
SkinTypeStep → ConcernStep → ProductStep → analyzeRoutine() → ResultView
                                              ↓ 저장
                                    localStorage(barda_last_routine)
                                              ↓ 읽기
                                    홈 화면 체크리스트 (AM/PM)
                                              ↓ 캘린더 매핑
                                    "오늘은 레티놀 Day" 표시
```

### 검색 → 후보 플로우
```
ProductStep 검색 → search.ts 3단계 매칭
  ├─ 결과 있음 → 선택 → search_logs에 로그
  └─ 결과 없음 → 직접입력 폼 → product_candidates에 저장
                                  → 관리자 대시보드에서 승인/거부
```

### 다이어리 → 챌린지 플로우
```
홈 피부 컨디션 저장 → barda_diary_날짜 저장
                    → barda_challenge 해당 Day 자동 완료
                    → 챌린지 페이지에서 다이어리 기록 표시
```
