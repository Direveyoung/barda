# BARDA — 컴포넌트 아키텍처
**작성일: 2026.02.16**  
**목표: Claude Code 개발용 컴포넌트 구조 설계**

---

## 1. 전체 폴더 구조

```
app/
├─ (home)/
│  ├─ page.tsx                       # 홈 분기 로직
│  ├─ landing/
│  │  └─ page.tsx                    # 비로그인 랜딩
│  ├─ dashboard/
│  │  └─ page.tsx                    # 로그인 대시보드
│  └─ onboarding/
│     └─ page.tsx                    # 분석 전 온보딩
│
├─ analyze/
│  ├─ page.tsx                       # 루틴 분석 메인
│  ├─ step1/page.tsx                 # 피부타입 선택
│  ├─ step2/page.tsx                 # 피부 고민 선택
│  ├─ step3/page.tsx                 # 제품 등록
│  └─ result/page.tsx                # 분석 결과
│
├─ feed/
│  ├─ page.tsx                       # 피드 메인
│  └─ [id]/page.tsx                  # 루틴 상세
│
├─ qa/
│  ├─ page.tsx                       # Q&A 목록
│  └─ [id]/page.tsx                  # 질문 상세
│
├─ ingredients/
│  ├─ page.tsx                       # 성분사전 목록
│  └─ [id]/page.tsx                  # 성분 상세
│
├─ profile/
│  └─ page.tsx                       # 마이페이지
│
└─ api/
   ├─ routine/
   ├─ products/
   ├─ feed/
   ├─ qa/
   └─ daily-content/

components/
├─ shared/                           # 전역 공통 컴포넌트
│  ├─ Header.tsx
│  ├─ BottomNavigation.tsx
│  ├─ Button.tsx
│  ├─ Card.tsx
│  ├─ Modal.tsx
│  ├─ Spinner.tsx
│  ├─ Toast.tsx
│  └─ EmptyState.tsx
│
├─ home/                             # 홈 관련
│  ├─ landing/
│  │  ├─ HeroSection.tsx
│  │  ├─ FeaturesSection.tsx
│  │  ├─ FeedPreviewSection.tsx
│  │  ├─ PopularRoutinesSection.tsx
│  │  ├─ StatsSection.tsx
│  │  ├─ GuideCTASection.tsx
│  │  └─ FinalCTASection.tsx
│  │
│  └─ dashboard/
│     ├─ SkinWeatherCard.tsx
│     ├─ RoutineChecklistSection.tsx
│     ├─ ChecklistProduct.tsx
│     ├─ SkinConditionCard.tsx
│     ├─ StreakCard.tsx
│     ├─ DailyIngredientCard.tsx
│     └─ DailyQuizCard.tsx
│
├─ analyze/                          # 루틴 분석
│  ├─ SkinTypeSelector.tsx
│  ├─ ConcernSelector.tsx
│  ├─ ProductSearchInput.tsx
│  ├─ ProductList.tsx
│  ├─ ProductItem.tsx
│  ├─ CategorySelector.tsx
│  └─ AnalysisProgress.tsx
│
├─ result/                           # 분석 결과
│  ├─ RoutineScoreCard.tsx
│  ├─ MissingStepsCard.tsx
│  ├─ AMRoutineCard.tsx
│  ├─ PMRoutineCard.tsx
│  ├─ ConflictWarningCard.tsx
│  ├─ CalendarView.tsx
│  └─ ShareButton.tsx
│
├─ feed/                             # 피드
│  ├─ RoutinePostCard.tsx
│  ├─ FeedFilter.tsx
│  ├─ RoutineDetailView.tsx
│  └─ CommentSection.tsx
│
├─ qa/                               # Q&A
│  ├─ QuestionCard.tsx
│  ├─ AnswerList.tsx
│  ├─ QuestionForm.tsx
│  └─ BardaGuideBox.tsx
│
├─ ingredients/                      # 성분사전
│  ├─ IngredientListCard.tsx
│  ├─ IngredientDetailPage.tsx
│  ├─ ConflictCard.tsx
│  └─ SynergyCard.tsx
│
└─ profile/                          # 프로필
   ├─ ProfileHeader.tsx
   ├─ RoutineHistory.tsx
   ├─ SavedRoutines.tsx
   └─ BadgeCollection.tsx

lib/
├─ hooks/
│  ├─ useAuth.ts
│  ├─ useUserRoutine.ts
│  ├─ useDailyRoutine.ts
│  ├─ useStreak.ts
│  ├─ useDailyContent.ts
│  ├─ useProductSearch.ts
│  └─ useABTest.ts
│
├─ api/
│  ├─ routine.ts
│  ├─ products.ts
│  ├─ feed.ts
│  ├─ qa.ts
│  ├─ ingredients.ts
│  ├─ weather.ts
│  └─ daily-content.ts
│
├─ utils/
│  ├─ date.ts
│  ├─ format.ts
│  └─ validation.ts
│
├─ supabase/
│  ├─ client.ts
│  └─ server.ts
│
└─ types/
   ├─ routine.ts
   ├─ product.ts
   ├─ feed.ts
   ├─ qa.ts
   └─ ingredient.ts
```

---

## 2. 핵심 컴포넌트 명세

### 2-1. shared/Button

```typescript
// components/shared/Button.tsx

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = ''
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-full transition focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-light focus:ring-primary',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    ghost: 'text-primary hover:bg-primary/10'
  };
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {loading && <Spinner className="mr-2" size="sm" />}
      {children}
    </button>
  );
}
```

---

### 2-2. home/dashboard/RoutineChecklistSection

```typescript
// components/home/dashboard/RoutineChecklistSection.tsx

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
  categoryName: string;
  order: number;
  isChecked: boolean;
  checkedAt?: Date;
}

export function RoutineChecklistSection({
  timeSlot,
  label,
  icon,
  dayLabel,
  products,
  onCheckToggle,
  onCompleteAll
}: RoutineChecklistSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const checkedCount = products.filter(p => p.isChecked).length;
  const totalCount = products.length;
  const isComplete = checkedCount === totalCount;
  
  useEffect(() => {
    if (isComplete && checkedCount > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  }, [isComplete, checkedCount]);
  
  return (
    <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-bold text-lg">{label} ({checkedCount}/{totalCount})</h3>
            {dayLabel && (
              <span className="text-xs px-2 py-1 bg-pm-accent/20 text-pm-accent rounded-full">
                {dayLabel}
              </span>
            )}
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-600"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>
      
      {/* 제품 리스트 */}
      {isExpanded && (
        <div className="space-y-2">
          {products.map(product => (
            <ChecklistProduct
              key={product.id}
              product={product}
              onToggle={() => onCheckToggle(product.id, !product.isChecked)}
            />
          ))}
        </div>
      )}
      
      {/* 완료 버튼 */}
      {!isComplete && isExpanded && (
        <button
          onClick={onCompleteAll}
          className="mt-3 w-full py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition"
        >
          모두 완료
        </button>
      )}
      
      {/* 완료 애니메이션 */}
      {showConfetti && (
        <div className="text-center mt-3 animate-bounce">
          ✨ 완료! 잘하셨어요! ✨
        </div>
      )}
    </div>
  );
}
```

---

### 2-3. analyze/ProductSearchInput

```typescript
// components/analyze/ProductSearchInput.tsx

interface ProductSearchInputProps {
  onSelectProduct: (product: Product) => void;
  placeholder?: string;
}

export function ProductSearchInput({
  onSelectProduct,
  placeholder = "제품명 또는 브랜드 검색"
}: ProductSearchInputProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const { results, isLoading } = useProductSearch(query);
  
  const handleSelect = (product: Product) => {
    onSelectProduct(product);
    setQuery('');
    setIsFocused(false);
  };
  
  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-2xl focus:border-primary focus:outline-none transition"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </div>
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Spinner size="sm" />
          </div>
        )}
      </div>
      
      {/* 검색 결과 드롭다운 */}
      {isFocused && query.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-100 rounded-2xl shadow-lg max-h-80 overflow-y-auto">
          {results.length > 0 ? (
            results.map(product => (
              <button
                key={product.id}
                onClick={() => handleSelect(product)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition border-b border-gray-100 last:border-0"
              >
                <div className="font-semibold">{product.name}</div>
                <div className="text-sm text-gray-500">{product.brand}</div>
              </button>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              <p className="mb-2">검색 결과가 없어요</p>
              <button
                onClick={() => {/* 직접 입력 모달 열기 */}}
                className="text-primary hover:underline"
              >
                직접 입력하기 →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

### 2-4. result/ConflictWarningCard

```typescript
// components/result/ConflictWarningCard.tsx

interface ConflictWarningCardProps {
  conflict: {
    level: 'high' | 'medium' | 'low';
    products: string[];           // 제품명들
    ingredients: string[];        // 성분명들
    reason: string;
    solution: string;
    ruleId: string;
  };
}

export function ConflictWarningCard({ conflict }: ConflictWarningCardProps) {
  const levelConfig = {
    high: {
      icon: '🔴',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      label: '높음'
    },
    medium: {
      icon: '🟡',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      label: '중간'
    },
    low: {
      icon: '🟢',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      label: '낮음'
    }
  };
  
  const config = levelConfig[conflict.level];
  
  return (
    <div className={`rounded-2xl p-4 border-2 ${config.bgColor} ${config.borderColor}`}>
      {/* 헤더 */}
      <div className="flex items-start gap-3 mb-3">
        <div className="text-2xl">{config.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-1 rounded-full ${config.textColor} bg-white`}>
              위험도: {config.label}
            </span>
          </div>
          <h4 className="font-bold text-lg">
            {conflict.ingredients.join(' × ')}
          </h4>
        </div>
      </div>
      
      {/* 관련 제품 */}
      <div className="mb-3">
        <div className="text-sm text-gray-600 mb-1">관련 제품</div>
        <div className="flex flex-wrap gap-2">
          {conflict.products.map(product => (
            <span key={product} className="px-3 py-1 bg-white rounded-full text-sm">
              {product}
            </span>
          ))}
        </div>
      </div>
      
      {/* 이유 */}
      <div className="mb-3">
        <div className="text-sm font-semibold mb-1">왜 조심해야 하나요?</div>
        <p className="text-sm text-gray-700">{conflict.reason}</p>
      </div>
      
      {/* 해결 방법 */}
      <div className="bg-white rounded-xl p-3">
        <div className="text-sm font-semibold mb-1 flex items-center gap-1">
          💡 이렇게 바꿔보세요
        </div>
        <p className="text-sm text-gray-700">{conflict.solution}</p>
      </div>
      
      {/* 자세히 보기 */}
      <button
        onClick={() => {/* 성분사전으로 이동 */}}
        className="mt-3 w-full py-2 text-sm text-primary hover:underline"
      >
        자세히 알아보기 →
      </button>
    </div>
  );
}
```

---

## 3. 컴포넌트 패턴

### 3-1. Compound Component Pattern

```typescript
// components/shared/Card.tsx

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-white rounded-2xl shadow-sm', className)}>
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('p-4 border-b border-gray-100', className)}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className }: CardBodyProps) {
  return (
    <div className={cn('p-4', className)}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('p-4 border-t border-gray-100', className)}>
      {children}
    </div>
  );
};

// 사용
<Card>
  <Card.Header>제목</Card.Header>
  <Card.Body>내용</Card.Body>
  <Card.Footer>푸터</Card.Footer>
</Card>
```

### 3-2. Render Props Pattern

```typescript
// components/shared/InfiniteScroll.tsx

interface InfiniteScrollProps<T> {
  items: T[];
  loadMore: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  render: (item: T) => React.ReactNode;
}

export function InfiniteScroll<T>({
  items,
  loadMore,
  hasMore,
  isLoading,
  render
}: InfiniteScrollProps<T>) {
  const observerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );
    
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);
  
  return (
    <div>
      {items.map(render)}
      {hasMore && (
        <div ref={observerRef} className="py-4 text-center">
          {isLoading && <Spinner />}
        </div>
      )}
    </div>
  );
}

// 사용
<InfiniteScroll
  items={posts}
  loadMore={loadMorePosts}
  hasMore={hasMore}
  isLoading={isLoading}
  render={(post) => <RoutinePostCard key={post.id} post={post} />}
/>
```

---

## 4. 상태 관리 전략

### 4-1. Context 구조

```typescript
// lib/context/RoutineContext.tsx

interface RoutineContextValue {
  routine: UserRoutine | null;
  isLoading: boolean;
  updateRoutine: (routine: UserRoutine) => Promise<void>;
  refreshRoutine: () => Promise<void>;
}

const RoutineContext = createContext<RoutineContextValue | null>(null);

export function RoutineProvider({ children }: { children: React.ReactNode }) {
  const [routine, setRoutine] = useState<UserRoutine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // ... 로직
  
  return (
    <RoutineContext.Provider value={{ routine, isLoading, updateRoutine, refreshRoutine }}>
      {children}
    </RoutineContext.Provider>
  );
}

export function useRoutine() {
  const context = useContext(RoutineContext);
  if (!context) {
    throw new Error('useRoutine must be used within RoutineProvider');
  }
  return context;
}
```

### 4-2. Zustand Store (옵션)

```typescript
// lib/store/useRoutineStore.ts

import { create } from 'zustand';

interface RoutineStore {
  routine: UserRoutine | null;
  isLoading: boolean;
  setRoutine: (routine: UserRoutine) => void;
  updateRoutine: (routine: Partial<UserRoutine>) => void;
  clearRoutine: () => void;
}

export const useRoutineStore = create<RoutineStore>((set) => ({
  routine: null,
  isLoading: false,
  
  setRoutine: (routine) => set({ routine }),
  
  updateRoutine: (updates) => set((state) => ({
    routine: state.routine ? { ...state.routine, ...updates } : null
  })),
  
  clearRoutine: () => set({ routine: null }),
}));
```

---

## 5. 개발 가이드라인

### 5-1. 컴포넌트 작성 원칙

1. **Single Responsibility**: 하나의 컴포넌트는 하나의 역할만
2. **Props Drilling 최소화**: Context 또는 Composition 활용
3. **재사용성**: 공통 컴포넌트는 shared/에 위치
4. **TypeScript**: 모든 컴포넌트 Props 타입 정의
5. **접근성**: ARIA 속성, 키보드 네비게이션 고려

### 5-2. 파일명 컨벤션

```
- PascalCase.tsx: 컴포넌트 파일
- camelCase.ts: 유틸/훅 파일
- kebab-case.css: 스타일 파일 (사용 시)
```

### 5-3. import 순서

```typescript
// 1. React
import { useState, useEffect } from 'react';

// 2. 외부 라이브러리
import { cn } from '@/lib/utils';

// 3. 내부 컴포넌트
import { Button } from '@/components/shared/Button';

// 4. 타입
import type { Product } from '@/lib/types/product';

// 5. 스타일 (사용 시)
import './styles.css';
```

---

## 6. 체크리스트

### 6-1. 컴포넌트 개발 전

- [ ] 컴포넌트 책임 명확화
- [ ] Props 인터페이스 정의
- [ ] 상태 관리 방식 결정 (local/context/store)
- [ ] 재사용 가능성 검토

### 6-2. 컴포넌트 개발 중

- [ ] TypeScript 타입 에러 없음
- [ ] 접근성 속성 추가
- [ ] 로딩/에러 상태 처리
- [ ] 반응형 디자인 적용

### 6-3. 컴포넌트 개발 후

- [ ] 스토리북 작성 (옵션)
- [ ] 단위 테스트 작성 (주요 컴포넌트)
- [ ] 성능 최적화 (memo, useMemo, useCallback)
- [ ] 문서화 (JSDoc)

---

## 7. 다음 단계

1. ✅ 컴포넌트 구조 설계 완료
2. 🔜 shared 컴포넌트 우선 구현
3. 🔜 페이지별 컴포넌트 순차 개발
4. 🔜 통합 테스트
5. 🔜 성능 최적화
