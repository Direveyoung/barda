# BARDA — 매일 루틴 체크리스트 화면 설계서
**작성일: 2026.02.16**  
**목적: Claude Code 개발용 상세 명세**

---

## 1. 화면 개요

### 1-1. 목적
- 벤치마킹 결과 **모든 성공 서비스의 핵심 기능**
- 분석 후 "매일 돌아오게 만드는" 리텐션 핵심
- 사용자가 루틴을 실제로 따라하도록 유도
- 데이터 축적 → 주간 리포트 → 인사이트 제공

### 1-2. 위치
- **로그인 홈 화면의 핵심 섹션** (비로그인은 랜딩 페이지)
- 하단 네비게이션 🏠 홈 탭

### 1-3. 사용 시간
- 약 **10초 이내** (탭탭탭 체크 완료)

---

## 2. 화면 구조

### 2-1. 레이아웃 (모바일 480px 기준)

```
┌─────────────────────────────────────────┐
│ [BARDA 로고]              [알림] [프로필] │ ← 헤더
├─────────────────────────────────────────┤
│  ☀️ 오늘 서울 UV 6 / 습도 45%           │ ← 피부 날씨
│  "선크림 필수! 적당한 날씨, 기본 루틴 OK" │
├─────────────────────────────────────────┤
│                                         │
│  ☀️ 아침 루틴 (5단계)        [모두 완료]│ ← AM 섹션
│  ────────────────────────────────────   │
│  ☐ 클렌저                 [라운드랩 ...]│
│  ☐ 토너                   [토리든 ...]  │
│  ☐ 세럼                   [이니스프리...]│
│  ☐ 크림                   [벨리프 ...]  │
│  ☐ 선크림                 [라로슈 ...]  │
│                                         │
├─────────────────────────────────────────┤
│  🌙 저녁 루틴 — 🏷️ 레티놀 Day           │ ← PM 섹션
│  ────────────────────────────────────   │
│  ☐ 오일클렌저              [마녀공장 ...]│
│  ☐ 폼클렌저                [라운드랩 ...]│
│  ☐ 토너                   [토리든 ...]  │
│  ☐ 레티놀 세럼            [이니스프리...]│
│  ☐ 크림                   [벨리프 ...]  │
│                                         │
├─────────────────────────────────────────┤
│  오늘 피부 어때?                         │ ← 피부 컨디션
│  😊  😐  😣  😡         📝 메모 추가    │
│                                         │
│  [메모 입력 영역 - 선택 시 확장됨]       │
├─────────────────────────────────────────┤
│  🔥 12일 연속 체크 중!                   │ ← 스트릭
│  💡 오늘의 성분: 세라마이드              │ ← 오늘의 성분
│  "피부 장벽을 지키는 수호자 성분"        │
│                                         │
│  ❓ 오늘의 퀴즈                          │ ← 퀴즈
│  "BHA는 아침에 써도 될까요?"             │
│  ⭕ 괜찮아요    ❌ 피해야 해요           │
└─────────────────────────────────────────┘
│ 🏠  📱  ➕  📖  👤                       │ ← 하단 네비
└─────────────────────────────────────────┘
```

### 2-2. 컴포넌트 구조

```tsx
<HomePage>
  <Header />
  
  <ScrollView>
    <SkinWeatherCard />           {/* 피부 날씨 */}
    
    <RoutineChecklistSection 
      timeSlot="am" 
      label="아침 루틴"
      icon="☀️"
      products={amProducts}
    />
    
    <RoutineChecklistSection 
      timeSlot="pm" 
      label="저녁 루틴"
      icon="🌙"
      dayLabel="레티놀 Day"        {/* 조건부 */}
      products={pmProducts}
    />
    
    <SkinConditionCard />         {/* 피부 컨디션 */}
    
    <StreakCard />                {/* 스트릭 */}
    
    <DailyIngredientCard />       {/* 오늘의 성분 */}
    
    <DailyQuizCard />             {/* 오늘의 퀴즈 */}
    
    <FeedPreview />               {/* 피드 미리보기 */}
  </ScrollView>
  
  <BottomNavigation />
</HomePage>
```

---

## 3. 핵심 컴포넌트 상세

### 3-1. RoutineChecklistSection

**Props:**
```typescript
interface RoutineChecklistSectionProps {
  timeSlot: 'am' | 'pm';
  label: string;              // "아침 루틴" | "저녁 루틴"
  icon: string;               // "☀️" | "🌙"
  dayLabel?: string;          // "레티놀 Day" | "각질 케어 Day"
  products: ChecklistProduct[];
  onCheckToggle: (productId: string, isChecked: boolean) => void;
  onCompleteAll: () => void;
}

interface ChecklistProduct {
  id: string;
  productId: string;
  productName: string;
  categoryName: string;        // "클렌저", "세럼" 등
  order: number;
  isChecked: boolean;
  checkedAt?: Date;
}
```

**UI 상태:**
```typescript
// 기본 상태
☐ 클렌저                 [라운드랩 ...]

// 체크된 상태
☑ 클렌저                 [라운드랩 ...] ✓

// 모두 체크된 경우
☀️ 아침 루틴 완료! ✨     [다시 하기]
```

**동작:**
1. 제품 클릭 → 체크박스 토글
2. 체크 시 `checkedAt` 타임스탬프 저장
3. 전체 체크 완료 → 축하 애니메이션 + 섹션 접기 옵션
4. "모두 완료" 버튼 → 남은 항목 일괄 체크

**애니메이션:**
```css
/* 체크 시 */
.product-item.checked {
  animation: checkBounce 0.3s ease-out;
  opacity: 0.7;
}

/* 전체 완료 시 */
.section-complete {
  animation: confetti 0.5s ease-out;
}
```

---

### 3-2. SkinConditionCard

**Props:**
```typescript
interface SkinConditionCardProps {
  currentCondition?: 'good' | 'normal' | 'irritated' | 'trouble';
  currentMemo?: string;
  onConditionSelect: (condition: string) => void;
  onMemoSave: (memo: string) => void;
}
```

**UI:**
```
오늘 피부 어때?
😊  😐  😣  😡         📝 메모 추가

[선택 시]
😊  😐  😣  😡  ✓ 선택됨

[메모 클릭 시]
┌─────────────────────────┐
│ 한 줄 메모 (선택)        │
│ [                      ]│
│           [저장] [취소] │
└─────────────────────────┘
```

**저장 로직:**
- 이모지 선택 즉시 저장 (API 호출)
- 메모는 저장 버튼 클릭 시 저장
- 하루 1번만 기록 가능 (수정 가능)

---

### 3-3. StreakCard

**Props:**
```typescript
interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  totalCheckDays: number;
}
```

**UI:**
```
🔥 12일 연속 체크 중!
───────────────────────
최장 연속: 18일 | 총 체크: 45일
```

**스트릭 계산 로직:**
```typescript
function calculateStreak(checkDates: Date[]): number {
  // 1. 날짜 정렬 (최신순)
  // 2. 어제까지 연속인지 확인
  // 3. 오늘 체크하면 +1, 안 하면 유지
  // 4. 어제 안 했으면 0으로 리셋
}
```

---

### 3-4. DailyQuizCard

**Props:**
```typescript
interface DailyQuizCardProps {
  quizId: string;
  ruleId: string;
  question: string;
  correctAnswer: boolean;        // true = ⭕, false = ❌
  explanation: string;
  onAnswer: (isCorrect: boolean) => void;
}
```

**UI 플로우:**
```
[답변 전]
❓ 오늘의 퀴즈
"BHA는 아침에 써도 될까요?"
⭕ 괜찮아요    ❌ 피해야 해요

[답변 후 - 정답]
✅ 정답이에요!
BHA는 광감작성이 없어 아침에도 사용 가능해요.
단, 자극이 있을 수 있으니 선크림은 필수!

[답변 후 - 오답]
❌ 아쉬워요!
BHA는 아침에도 괜찮아요. AHA와 달리 광감작성이 없거든요.
```

**퀴즈 생성 로직:**
```typescript
// 룰 50개를 기반으로 퀴즈 자동 생성
const quizzes = rules.map(rule => ({
  question: generateQuestion(rule),
  correctAnswer: rule.type === 'safe',
  explanation: rule.description
}));

// 날짜별 로테이션 (50일 주기)
const todayQuiz = quizzes[dayOfYear % 50];
```

---

## 4. 상태 관리

### 4-1. 전역 상태 (Context/Store)

```typescript
interface DailyRoutineState {
  // 루틴 데이터
  userRoutine: {
    amProducts: ChecklistProduct[];
    pmProducts: ChecklistProduct[];
    currentDay: number;           // 0(월)~6(일)
    dayLabel?: string;            // "레티놀 Day"
  };
  
  // 오늘의 기록
  todayLog: {
    date: Date;
    amCompleted: boolean;
    pmCompleted: boolean;
    skinCondition?: 'good' | 'normal' | 'irritated' | 'trouble';
    memo?: string;
    checkedProducts: string[];    // 체크된 제품 ID 배열
  };
  
  // 스트릭
  streak: {
    current: number;
    longest: number;
    total: number;
    lastCheckDate: Date;
  };
  
  // 일일 콘텐츠
  dailyContent: {
    weather: WeatherData;
    ingredient: IngredientOfDay;
    quiz: DailyQuiz;
  };
}
```

### 4-2. 로컬 상태 (Component)

```typescript
// RoutineChecklistSection 내부
const [isExpanded, setIsExpanded] = useState(true);
const [showConfetti, setShowConfetti] = useState(false);

// SkinConditionCard 내부
const [memoInput, setMemoInput] = useState('');
const [isMemoOpen, setIsMemoOpen] = useState(false);
```

---

## 5. API 연동

### 5-1. 필요한 API 엔드포인트

```typescript
// 1. 오늘의 루틴 가져오기
GET /api/routine/today
Response: {
  amProducts: ChecklistProduct[];
  pmProducts: ChecklistProduct[];
  dayLabel: string;
  todayChecks: string[];          // 이미 체크된 제품 ID
}

// 2. 제품 체크/언체크
POST /api/routine/check
Body: {
  date: string;                   // "2026-02-16"
  timeSlot: 'am' | 'pm';
  productId: string;
  isChecked: boolean;
}

// 3. 피부 컨디션 저장
POST /api/skin-log/condition
Body: {
  date: string;
  condition: 'good' | 'normal' | 'irritated' | 'trouble';
  memo?: string;
}

// 4. 오늘의 콘텐츠 가져오기
GET /api/daily-content
Response: {
  weather: { uv: number; humidity: number; tip: string; };
  ingredient: { id: string; nameKo: string; oneLiner: string; };
  quiz: { id: string; question: string; ... };
}

// 5. 퀴즈 답변 제출
POST /api/quiz/answer
Body: {
  quizId: string;
  isCorrect: boolean;
}

// 6. 스트릭 조회
GET /api/streak
Response: {
  current: number;
  longest: number;
  total: number;
  lastCheckDate: string;
}
```

---

## 6. DB 스키마

### 6-1. daily_skin_logs (일일 피부 기록)

```sql
CREATE TABLE daily_skin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  condition TEXT,                           -- "good" | "normal" | "irritated" | "trouble"
  memo TEXT,
  am_completed BOOLEAN DEFAULT false,
  pm_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_skin_logs_user_date 
  ON daily_skin_logs(user_id, date DESC);
```

### 6-2. routine_checks (루틴 체크 상세)

```sql
CREATE TABLE routine_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,                  -- "am" | "pm"
  product_id TEXT NOT NULL,                 -- 사용자 루틴의 제품 ID
  is_checked BOOLEAN DEFAULT false,
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date, time_slot, product_id)
);

CREATE INDEX idx_routine_checks_user_date 
  ON routine_checks(user_id, date DESC);
```

### 6-3. user_streaks (스트릭)

```sql
CREATE TABLE user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_check_days INTEGER DEFAULT 0,
  last_check_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6-4. quiz_logs (퀴즈 기록)

```sql
CREATE TABLE quiz_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  quiz_id TEXT NOT NULL,
  rule_id TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_quiz_logs_user_date 
  ON quiz_logs(user_id, date DESC);
```

---

## 7. UX 플로우

### 7-1. 초회 진입 (분석 완료 직후)

```
1. 분석 완료 → "루틴이 생성되었어요!" 모달
2. "오늘부터 시작하기" 버튼 → 홈 화면 이동
3. 첫 방문 튜토리얼 (옵션):
   - "매일 체크하면 스트릭이 쌓여요 🔥"
   - "피부 컨디션도 간단히 기록해보세요 😊"
   - "퀴즈 맞추면 성분 지식도 늘어요! 💡"
```

### 7-2. 매일 재방문

```
1. 앱 열기 → 홈 화면 (체크리스트가 메인)
2. 아침 루틴 체크 (5개 탭탭탭) → 완료 애니메이션 ✨
3. 피부 컨디션 선택 (이모지 1탭)
4. 퀴즈 풀기 (⭕❌ 1탭) → 정답 확인
5. 스트릭 +1 확인 🔥
6. 종료 (총 10초 이내)

저녁:
7. 앱 열기 → 홈 화면
8. 저녁 루틴 체크 → PM 완료
9. 하루 완료! → 내일 보상 예고
```

### 7-3. 스트릭 끊김 처리

```
어제 체크 안 함 → 앱 열기:

┌─────────────────────────────────┐
│ 😢 어제 체크를 놓쳤어요           │
│                                 │
│ 12일 스트릭이 초기화되었어요     │
│ 하지만 다시 시작하면 돼요!       │
│                                 │
│ [오늘부터 다시 시작하기]         │
└─────────────────────────────────┘
```

---

## 8. 성능 최적화

### 8-1. 초기 로딩

```typescript
// 1. 서버 사이드에서 데이터 미리 준비
// 2. 클라이언트는 한 번의 API 호출로 모든 데이터 수신
GET /api/home-dashboard

Response: {
  routine: { am, pm },
  todayLog: { checks, condition },
  streak: { current, longest },
  dailyContent: { weather, ingredient, quiz }
}

// 3. Suspense로 점진적 렌더링
<Suspense fallback={<Skeleton />}>
  <DashboardContent />
</Suspense>
```

### 8-2. 체크 반응성

```typescript
// Optimistic Update 패턴
function handleCheck(productId: string) {
  // 1. UI 즉시 업데이트 (낙관적)
  setProducts(prev => prev.map(p => 
    p.id === productId ? { ...p, isChecked: !p.isChecked } : p
  ));
  
  // 2. 백그라운드 API 호출
  checkProduct(productId)
    .catch(() => {
      // 실패 시 롤백
      toast.error('체크 저장 실패');
      setProducts(originalProducts);
    });
}
```

### 8-3. 오프라인 지원

```typescript
// Service Worker로 체크 데이터 로컬 저장
// 온라인 복구 시 동기화
if (!navigator.onLine) {
  localStorage.setItem('pendingChecks', JSON.stringify(checks));
}

window.addEventListener('online', () => {
  syncPendingChecks();
});
```

---

## 9. 접근성 (A11y)

```typescript
// 1. 키보드 네비게이션
<button
  role="checkbox"
  aria-checked={isChecked}
  aria-label={`${productName} 체크하기`}
  onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
>

// 2. 스크린 리더
<div role="region" aria-label="오늘의 루틴 체크리스트">
  <div aria-live="polite" aria-atomic="true">
    {amCompleted && "아침 루틴이 완료되었습니다"}
  </div>
</div>

// 3. 색상 대비
- 체크박스: WCAG AA 이상
- 이모지 + 텍스트 병기
```

---

## 10. 에러 처리

```typescript
// 1. API 실패
try {
  await checkProduct(id);
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    toast('인터넷 연결을 확인해주세요', { icon: '📡' });
  } else {
    toast('일시적인 오류예요. 다시 시도해주세요', { icon: '⚠️' });
  }
}

// 2. 데이터 없음
if (!userRoutine) {
  return (
    <EmptyState>
      <p>아직 루틴 분석을 하지 않았어요</p>
      <Button to="/analyze">내 루틴 분석하기</Button>
    </EmptyState>
  );
}

// 3. 만료된 루틴
if (isRoutineExpired) {
  return (
    <ExpiredState>
      <p>30일이 지나 루틴이 만료되었어요</p>
      <Button to="/analyze">새로운 루틴 만들기</Button>
    </ExpiredState>
  );
}
```

---

## 11. 테스트 시나리오

### 11-1. 기능 테스트

```typescript
describe('RoutineChecklist', () => {
  it('제품을 클릭하면 체크/언체크된다', () => {
    // Given: 아침 루틴 5개
    // When: 클렌저 클릭
    // Then: 체크박스가 체크됨
  });
  
  it('모든 제품을 체크하면 완료 애니메이션이 나온다', () => {
    // Given: 5개 중 4개 체크됨
    // When: 마지막 1개 체크
    // Then: 축하 애니메이션 + "완료!" 표시
  });
  
  it('하루에 한 번만 피부 컨디션을 기록할 수 있다', () => {
    // Given: 오늘 이미 😊 선택함
    // When: 😣로 변경 시도
    // Then: 기존 기록이 업데이트됨
  });
  
  it('퀴즈는 답변 후 재시도 불가', () => {
    // Given: 오늘의 퀴즈
    // When: ⭕ 선택 → 정답 확인
    // Then: 버튼 비활성화 + "내일 다시 도전!"
  });
});
```

### 11-2. 통합 테스트

```typescript
describe('DailyRoutine Integration', () => {
  it('체크 완료 → 스트릭 증가 → DB 저장', async () => {
    // 1. AM 루틴 전체 체크
    // 2. PM 루틴 전체 체크
    // 3. 스트릭 +1 확인
    // 4. DB에 기록 확인
  });
});
```

---

## 12. 개발 우선순위

| 순서 | 컴포넌트 | 난이도 | 예상 시간 |
|---|---|---|---|
| 1 | RoutineChecklistSection (기본) | 🟢 | 2h |
| 2 | 체크 상태 관리 + API | 🟢 | 1h |
| 3 | SkinConditionCard | 🟢 | 1h |
| 4 | StreakCard | 🟢 | 1h |
| 5 | DailyQuizCard | 🟡 | 2h |
| 6 | 완료 애니메이션 | 🟡 | 1h |
| 7 | SkinWeatherCard | 🟢 | 1h |
| 8 | DailyIngredientCard | 🟢 | 0.5h |
| 9 | 전체 통합 + 테스트 | 🟡 | 2h |

**총 예상: 11.5시간**

---

## 13. Next.js 구현 가이드

### 13-1. 파일 구조

```
app/
├─ (home)/
│  ├─ page.tsx                    # 홈 (분기 로직)
│  └─ dashboard/
│     └─ page.tsx                 # 로그인 대시보드
│
components/
├─ home/
│  ├─ RoutineChecklistSection.tsx
│  ├─ ChecklistProduct.tsx
│  ├─ SkinConditionCard.tsx
│  ├─ StreakCard.tsx
│  ├─ DailyQuizCard.tsx
│  ├─ SkinWeatherCard.tsx
│  └─ DailyIngredientCard.tsx
│
lib/
├─ hooks/
│  ├─ useDailyRoutine.ts
│  ├─ useStreak.ts
│  └─ useDailyContent.ts
│
├─ api/
│  ├─ routine.ts
│  └─ daily-content.ts
```

### 13-2. useDailyRoutine Hook

```typescript
export function useDailyRoutine() {
  const [routine, setRoutine] = useState<DailyRoutineState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 초기 로드
  useEffect(() => {
    loadTodayRoutine();
  }, []);
  
  // 제품 체크/언체크
  const toggleCheck = async (productId: string, timeSlot: 'am' | 'pm') => {
    // Optimistic update
    setRoutine(prev => ...);
    
    try {
      await api.checkProduct({ productId, timeSlot });
    } catch (error) {
      // Rollback
      setRoutine(originalRoutine);
      toast.error('체크 실패');
    }
  };
  
  return { routine, toggleCheck, isLoading };
}
```

---

## 14. 디자인 토큰 (Tailwind)

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: '#D4726A',
        'primary-light': '#E8927C',
        'am-accent': '#FDE68A',
        'pm-accent': '#C4B5FD',
      },
      animation: {
        'check-bounce': 'checkBounce 0.3s ease-out',
        'confetti': 'confetti 0.5s ease-out',
      },
      keyframes: {
        checkBounce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        confetti: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(180deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(360deg)', opacity: '1' },
        },
      },
    },
  },
};
```

---

## 15. 체크리스트

개발 시작 전 확인:
- [ ] Supabase 테이블 생성 (daily_skin_logs, routine_checks, user_streaks, quiz_logs)
- [ ] API 엔드포인트 구현
- [ ] 사용자 루틴 데이터 존재 확인
- [ ] 날씨 API 키 발급
- [ ] 퀴즈 데이터 50개 생성

개발 완료 후 확인:
- [ ] 모바일 반응형 테스트
- [ ] 오프라인 모드 테스트
- [ ] 스트릭 계산 로직 검증
- [ ] 자정 넘어가는 경우 테스트
- [ ] 다국어(한국어) 텍스트 확인
