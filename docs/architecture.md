# BARDA 아키텍처 상세

## 파일 맵

### 페이지 라우트 (15개)
```
src/app/
├── page.tsx                    ← 홈 (비로그인: 랜딩 / 로그인: 체크리스트+다이어리+날씨TIP)
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
├── drawer/page.tsx             ← 내 서랍 (제품 트래커)
├── dupe/page.tsx               ← 듀프 파인더 (대안 제품)
├── mypage/
│   ├── page.tsx                ← 마이페이지
│   ├── MypageClient.tsx        ← 마이페이지 인터랙션
│   └── profile/page.tsx        ← 프로필 설정
├── auth/
│   ├── login/page.tsx          ← 로그인 (이메일 + Google OAuth)
│   └── callback/route.ts       ← OAuth 콜백 핸들러
└── admin/page.tsx              ← 관리자 대시보드
```

### API 라우트 (10개)
```
src/app/api/
├── routines/
│   ├── route.ts                ← GET (피드 목록) + POST (루틴 공유)
│   └── [id]/
│       ├── like/route.ts       ← POST (좋아요 토글)
│       └── comments/route.ts   ← GET + POST + DELETE (댓글)
├── search-logs/route.ts        ← POST (검색 로그) + GET (통계)
├── product-candidates/route.ts ← POST + GET + PATCH (제품 후보)
├── admin/
│   ├── stats/route.ts          ← GET (관리자 통계 집계)
│   ├── pipeline/route.ts       ← POST (파이프라인 실행: 자동승격/미스분석/커뮤니티/주간리포트)
│   └── external-apis/route.ts  ← GET (API 헬스체크) + POST (API 테스트 쿼리)
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
├── weather.ts                  ← 날씨 기반 루틴 TIP (Open-Meteo API)
├── external-apis.ts            ← 외부 API 3종 (식약처/OBF/성분사전)
├── pipeline.ts                 ← 자동 학습 파이프라인 (승격/미스/커뮤니티/리포트)
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
| `barda_drawer` | 내 서랍 (보유 제품) | `DrawerItem[]` |
| `barda_weather` | 날씨 캐시 (1시간 TTL) | `{data: WeatherData, timestamp: number}` |

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

### 날씨 → 루틴 TIP 플로우
```
홈 화면 로드 → Open-Meteo API (위치 자동 감지, 서울 기본)
            → 기온/습도/UV/날씨코드 → generateWeatherTips()
            → skinType/hasRetinol/hasAHA 반영한 맞춤 TIP 표시
            → 1시간 캐시 (barda_weather)
```

### 듀프 파인더 플로우
```
제품 검색 → 같은 카테고리 제품 필터
          → key_ingredients 유사도 계산 (겹치는 성분 비율 70% + 태그 유사도 30%)
          → 유사도 15%+ 제품 최대 10개 표시
```

### 자동 학습 파이프라인 (수집 → 분석 → 실행)
```
[1] 수집 (Collection)
  ├─ search_logs        ← 유저 검색 쿼리 + 결과수
  ├─ product_candidates ← 직접입력 (브랜드 + 제품명)
  └─ routine_posts      ← 커뮤니티 제품 언급 데이터
         ↓
[2] 분석 (Analysis)
  ├─ 미스 분석          ← 주간 Top 20 미스 쿼리 + 히트율 트렌드
  ├─ 자동 승격          ← submit_count >= 3 → auto_promoted 상태
  └─ 커뮤니티 분석      ← 인기 제품 추출 + 피부타입별 다양성
         ↓
[3] 실행 (Execution)
  ├─ DB 확장            ← 관리자 승인 후 products.ts 업데이트
  ├─ 별칭 추가          ← 미스 쿼리 기반 aliases.ts 업데이트
  └─ 주간 리포트        ← 검색 + 후보 + 커뮤니티 종합 현황
```

### 외부 API 연동 플로우
```
1. 식약처 OpenAPI → 성분명 → 기능성화장품 성분 DB → 배합한도/규제 → 분석 엔진
2. Open Beauty Facts → 바코드/제품명 → 전성분 목록 → 미등록 제품 보강 → 제품 DB
3. 공공데이터포털 → 한글 성분명 → INCI 국제명 + EWG 등급 → 성분 가이드
```
