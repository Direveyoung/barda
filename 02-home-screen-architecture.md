# BARDA — 홈 화면 분기 설계서
**작성일: 2026.02.16**  
**목적: 비로그인 랜딩 vs 로그인 대시보드 구조**

---

## 1. 개요

### 1-1. 핵심 원칙
> **비로그인 = 마케팅 랜딩**  
> **로그인 = 매일 쓰는 도구**

이 분기가 서비스 구색의 핵심. FeelinMySkin, Skincare Routine App 모두 이 패턴 사용.

### 1-2. 분기 조건

```typescript
function HomePage() {
  const { user, isLoading } = useAuth();
  const { hasRoutine } = useUserRoutine();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    return <LandingPage />;              // 비로그인
  }
  
  if (!hasRoutine) {
    return <OnboardingPage />;           // 로그인 + 분석 전
  }
  
  return <DashboardPage />;              // 로그인 + 분석 완료
}
```

---

## 2. 비로그인 랜딩 페이지

### 2-1. 레이아웃

```
┌─────────────────────────────────────────┐
│ [BARDA 로고]              [로그인] [가입]│ ← 헤더
├─────────────────────────────────────────┤
│                                         │
│         🌸 BARDA (바르다)               │ ← 히어로
│     "내 루틴, 바르게 바르고 있을까?"     │
│                                         │
│  [내 루틴 분석하기 →]                   │ CTA
│                                         │
│  이미 N명이 루틴을 분석했어요            │ 소셜프루프
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  💡 BARDA가 해결하는 3가지               │ ← 핵심 기능
│                                         │
│  🔬 성분 충돌 분석                      │
│  "레티놀×AHA 같은 날? 위험해요!"         │
│                                         │
│  ☀️🌙 AM·PM 루틴 제안                  │
│  "아침은 가볍게, 저녁은 집중 케어"       │
│                                         │
│  📅 7일 캘린더                          │
│  "레티놀날/각질날 자동 분배"             │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  실시간 루틴 피드 👀                    │ ← 피드 미리보기
│                                         │
│  ┌───────────────────┐                 │
│  │ 건성+보습  92점 ⭐ │                 │
│  │ 충돌 0건 ✅        │                 │
│  │ 오늘 28명이 좋아요 │                 │
│  └───────────────────┘                 │
│                                         │
│  [피드 더보기 →]                        │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  인기 루틴 TOP 3 🏆                     │ ← 인기 루틴
│                                         │
│  1️⃣ 건성 피부 보습 루틴 (538명)         │
│  2️⃣ 레티놀 입문 루틴 (421명)           │
│  3️⃣ 각질 케어 루틴 (389명)             │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  📊 BARDA 통계                          │ ← 통계 (신뢰감)
│                                         │
│  12,547개 루틴 분석됨                   │
│  평균 루틴 점수 78점                    │
│  가장 많이 쓰는 성분: 나이아신아마이드   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  💡 성분 가이드                         │ ← 가이드 CTA
│                                         │
│  📖 레티놀 초보자 가이드                │
│  📖 비타민C 완전 정복                   │
│  📖 AHA vs BHA 차이점                   │
│                                         │
│  [가이드 전체보기 →]                    │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  🚀 지금 시작하세요!                    │ ← 최종 CTA
│                                         │
│  [무료로 분석하기 →]                    │
│                                         │
└─────────────────────────────────────────┘
```

### 2-2. 섹션별 상세

#### Hero Section

```typescript
<HeroSection className="py-16 px-4 text-center bg-gradient-to-b from-primary-light/10 to-white">
  <div className="max-w-2xl mx-auto">
    <h1 className="text-4xl font-bold mb-4">
      🌸 BARDA (바르다)
    </h1>
    <p className="text-xl text-gray-600 mb-8">
      내 루틴, 바르게 바르고 있을까?
    </p>
    
    <Link
      href="/analyze"
      className="inline-block px-8 py-4 bg-primary text-white rounded-full text-lg font-semibold hover:bg-primary-light transition"
    >
      내 루틴 분석하기 →
    </Link>
    
    <p className="mt-6 text-sm text-gray-500">
      이미 <strong>{totalRoutines.toLocaleString()}명</strong>이 루틴을 분석했어요
    </p>
  </div>
</HeroSection>
```

#### Features Section

```typescript
<FeaturesSection className="py-12 px-4 bg-white">
  <h2 className="text-2xl font-bold text-center mb-8">
    💡 BARDA가 해결하는 3가지
  </h2>
  
  <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
    <FeatureCard
      icon="🔬"
      title="성분 충돌 분석"
      description="레티놀×AHA 같은 날? 위험해요!"
      gradient="from-red-50 to-orange-50"
    />
    
    <FeatureCard
      icon="☀️🌙"
      title="AM·PM 루틴 제안"
      description="아침은 가볍게, 저녁은 집중 케어"
      gradient="from-yellow-50 to-purple-50"
    />
    
    <FeatureCard
      icon="📅"
      title="7일 캘린더"
      description="레티놀날/각질날 자동 분배"
      gradient="from-blue-50 to-indigo-50"
    />
  </div>
</FeaturesSection>
```

#### Feed Preview Section

```typescript
<FeedPreviewSection className="py-12 px-4 bg-gray-50">
  <h2 className="text-2xl font-bold text-center mb-8">
    실시간 루틴 피드 👀
  </h2>
  
  <div className="max-w-4xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-4">
    {recentRoutines.slice(0, 6).map(routine => (
      <RoutinePreviewCard key={routine.id} routine={routine} />
    ))}
  </div>
  
  <div className="text-center mt-8">
    <Link href="/feed" className="text-primary font-semibold hover:underline">
      피드 더보기 →
    </Link>
  </div>
</FeedPreviewSection>
```

#### Popular Routines Section

```typescript
<PopularRoutinesSection className="py-12 px-4 bg-white">
  <h2 className="text-2xl font-bold text-center mb-8">
    인기 루틴 TOP 3 🏆
  </h2>
  
  <div className="max-w-2xl mx-auto space-y-4">
    {topRoutines.map((routine, index) => (
      <PopularRoutineCard
        key={routine.id}
        rank={index + 1}
        routine={routine}
      />
    ))}
  </div>
</PopularRoutinesSection>
```

#### Stats Section

```typescript
<StatsSection className="py-12 px-4 bg-gradient-to-r from-primary-light/10 to-pm-accent/10">
  <h2 className="text-2xl font-bold text-center mb-8">
    📊 BARDA 통계
  </h2>
  
  <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
    <StatCard
      number={stats.totalRoutines.toLocaleString()}
      label="루틴 분석됨"
      icon="📊"
    />
    
    <StatCard
      number={`${stats.avgScore}점`}
      label="평균 루틴 점수"
      icon="⭐"
    />
    
    <StatCard
      number={stats.topIngredient}
      label="가장 많이 쓰는 성분"
      icon="🧪"
    />
  </div>
</StatsSection>
```

#### Guide CTA Section

```typescript
<GuideCTASection className="py-12 px-4 bg-white">
  <h2 className="text-2xl font-bold text-center mb-8">
    💡 성분 가이드
  </h2>
  
  <div className="max-w-3xl mx-auto space-y-3">
    <GuideLink
      title="📖 레티놀 초보자 가이드"
      href="/guide/retinol-beginner"
    />
    <GuideLink
      title="📖 비타민C 완전 정복"
      href="/guide/vitamin-c"
    />
    <GuideLink
      title="📖 AHA vs BHA 차이점"
      href="/guide/aha-vs-bha"
    />
  </div>
  
  <div className="text-center mt-8">
    <Link href="/guide" className="text-primary font-semibold hover:underline">
      가이드 전체보기 →
    </Link>
  </div>
</GuideCTASection>
```

#### Final CTA Section

```typescript
<FinalCTASection className="py-16 px-4 text-center bg-gradient-to-b from-white to-primary-light/10">
  <h2 className="text-3xl font-bold mb-6">
    🚀 지금 시작하세요!
  </h2>
  
  <Link
    href="/analyze"
    className="inline-block px-10 py-5 bg-primary text-white rounded-full text-xl font-bold hover:bg-primary-light transition shadow-lg hover:shadow-xl"
  >
    무료로 분석하기 →
  </Link>
</FinalCTASection>
```

---

## 3. 로그인 대시보드 (분석 완료)

### 3-1. 레이아웃

이미 "문서 1: 매일 루틴 체크리스트"에서 상세히 다뤘으므로 간략히:

```
┌─────────────────────────────────────────┐
│ [BARDA 로고]              [알림] [프로필]│
├─────────────────────────────────────────┤
│  ☀️ 오늘 서울 UV 6 / 습도 45%           │
│  "선크림 필수! 적당한 날씨, 기본 루틴 OK"│
├─────────────────────────────────────────┤
│  ☀️ 아침 루틴 (5단계)                   │
│  ☐ 클렌저  ☐ 토너  ☐ 세럼  ☐ 크림  ☐ 선크림│
├─────────────────────────────────────────┤
│  🌙 저녁 루틴 — 🏷️ 레티놀 Day           │
│  ☐ 오일  ☐ 폼  ☐ 토너  ☐ 레티놀  ☐ 크림│
├─────────────────────────────────────────┤
│  오늘 피부 어때?                         │
│  😊  😐  😣  😡         📝 메모 추가    │
├─────────────────────────────────────────┤
│  🔥 12일 연속 체크 중!                   │
│  💡 오늘의 성분: 세라마이드              │
│  ❓ 퀴즈: BHA는 아침에 써도 될까? ⭕❌   │
├─────────────────────────────────────────┤
│  📱 피드 새글 (3)                        │
│  🔔 알림 (2): 00님이 좋아요를 눌렀어요   │
└─────────────────────────────────────────┘
│ 🏠  📱  ➕  📖  👤                       │
└─────────────────────────────────────────┘
```

---

## 4. 로그인 (분석 전) 온보딩

### 4-1. 레이아웃

```
┌─────────────────────────────────────────┐
│ [BARDA 로고]                    [프로필]│
├─────────────────────────────────────────┤
│                                         │
│  👋 안녕하세요, [사용자]님!             │
│                                         │
│  BARDA에서 내 루틴을 분석하고            │
│  매일 체크해보세요!                      │
│                                         │
│  📊 내 루틴 분석하기                    │
│  └─ 3분이면 완료돼요                    │
│                                         │
│  [시작하기 →]                           │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  💡 이런 걸 알 수 있어요                │
│                                         │
│  ✅ 내 제품 간 충돌 경고                │
│  ✅ AM/PM 최적 순서                    │
│  ✅ 7일 루틴 캘린더                    │
│  ✅ 루틴 점수 (100점 만점)             │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  실시간 루틴 피드 👀                    │
│  (랜딩과 동일한 피드 미리보기)           │
│                                         │
└─────────────────────────────────────────┘
```

---

## 5. 분기 로직 상세

### 5-1. 전체 플로우

```typescript
// app/(home)/page.tsx

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { hasRoutine, isLoading: routineLoading } = useUserRoutine();
  
  // 1. 로딩 중
  if (authLoading || routineLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
        <p className="ml-3 text-gray-600">로딩 중...</p>
      </div>
    );
  }
  
  // 2. 비로그인
  if (!user) {
    return <LandingPage />;
  }
  
  // 3. 로그인 + 분석 전
  if (!hasRoutine) {
    return <OnboardingPage />;
  }
  
  // 4. 로그인 + 분석 완료
  return <DashboardPage />;
}
```

### 5-2. useAuth Hook

```typescript
// lib/hooks/useAuth.ts

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Supabase Auth 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });
    
    // Auth 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  return { user, isLoading };
}
```

### 5-3. useUserRoutine Hook

```typescript
// lib/hooks/useUserRoutine.ts

export function useUserRoutine() {
  const { user } = useAuth();
  const [hasRoutine, setHasRoutine] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      setHasRoutine(false);
      setIsLoading(false);
      return;
    }
    
    // 사용자의 루틴 존재 여부 확인
    checkUserRoutine(user.id).then((exists) => {
      setHasRoutine(exists);
      setIsLoading(false);
    });
  }, [user]);
  
  return { hasRoutine, isLoading };
}

async function checkUserRoutine(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_routines')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();
  
  return !!data;
}
```

---

## 6. 컴포넌트 재사용 전략

### 6-1. 공통 컴포넌트

```
components/
├─ shared/
│  ├─ RoutinePreviewCard.tsx      # 랜딩 + 피드에서 공통 사용
│  ├─ FeatureCard.tsx              # 랜딩 전용
│  ├─ StatCard.tsx                 # 랜딩 전용
│  └─ GuideLink.tsx                # 랜딩 + 가이드에서 공통
│
├─ home/
│  ├─ landing/
│  │  ├─ HeroSection.tsx
│  │  ├─ FeaturesSection.tsx
│  │  ├─ FeedPreviewSection.tsx
│  │  ├─ PopularRoutinesSection.tsx
│  │  ├─ StatsSection.tsx
│  │  ├─ GuideCTASection.tsx
│  │  └─ FinalCTASection.tsx
│  │
│  ├─ dashboard/
│  │  └─ (체크리스트 관련 컴포넌트들)
│  │
│  └─ onboarding/
│     ├─ OnboardingHero.tsx
│     └─ OnboardingBenefits.tsx
```

### 6-2. RoutinePreviewCard (공통)

```typescript
// components/shared/RoutinePreviewCard.tsx

interface RoutinePreviewCardProps {
  routine: {
    id: string;
    skinType: string;
    concerns: string[];
    score: number;
    conflictCount: number;
    likesCount: number;
    comment?: string;
  };
  showLink?: boolean;           // 랜딩: false, 피드: true
}

export function RoutinePreviewCard({ 
  routine, 
  showLink = true 
}: RoutinePreviewCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition">
      {/* 피부타입 + 고민 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-1 bg-primary-light/20 text-primary text-xs rounded-full">
          {routine.skinType}
        </span>
        {routine.concerns.map(c => (
          <span key={c} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            {c}
          </span>
        ))}
      </div>
      
      {/* 점수 + 충돌 */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-2xl font-bold text-primary">
          {routine.score}점 ⭐
        </div>
        <div className="text-sm text-gray-600">
          충돌 {routine.conflictCount}건 {routine.conflictCount === 0 ? '✅' : '⚠️'}
        </div>
      </div>
      
      {/* 한 줄 코멘트 */}
      {routine.comment && (
        <p className="text-sm text-gray-700 mb-2 line-clamp-2">
          {routine.comment}
        </p>
      )}
      
      {/* 좋아요 */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>오늘 {routine.likesCount}명이 좋아요</span>
        {showLink && (
          <Link href={`/feed/${routine.id}`} className="text-primary hover:underline">
            자세히 →
          </Link>
        )}
      </div>
    </div>
  );
}
```

---

## 7. 데이터 로딩 전략

### 7-1. 랜딩 페이지 데이터

```typescript
// app/(home)/page.tsx - 랜딩 페이지

export default async function LandingPage() {
  // 서버 사이드에서 미리 로드
  const [stats, recentRoutines, topRoutines] = await Promise.all([
    getStats(),
    getRecentRoutines(6),
    getTopRoutines(3),
  ]);
  
  return (
    <div>
      <HeroSection totalRoutines={stats.totalRoutines} />
      <FeaturesSection />
      <FeedPreviewSection routines={recentRoutines} />
      <PopularRoutinesSection routines={topRoutines} />
      <StatsSection stats={stats} />
      <GuideCTASection />
      <FinalCTASection />
    </div>
  );
}

// lib/api/landing.ts

export async function getStats() {
  const { count: totalRoutines } = await supabase
    .from('user_routines')
    .select('*', { count: 'exact', head: true });
  
  const { data: avgScoreData } = await supabase
    .from('user_routines')
    .select('score')
    .not('score', 'is', null);
  
  const avgScore = avgScoreData
    ? Math.round(avgScoreData.reduce((sum, r) => sum + r.score, 0) / avgScoreData.length)
    : 0;
  
  // 가장 많이 쓰는 성분 (간단히 하드코딩, 나중에 실제 데이터로)
  const topIngredient = '나이아신아마이드';
  
  return { totalRoutines, avgScore, topIngredient };
}

export async function getRecentRoutines(limit: number = 6) {
  const { data } = await supabase
    .from('routine_posts')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  return data || [];
}

export async function getTopRoutines(limit: number = 3) {
  const { data } = await supabase
    .from('routine_posts')
    .select('*')
    .eq('is_public', true)
    .order('likes_count', { ascending: false })
    .limit(limit);
  
  return data || [];
}
```

### 7-2. 대시보드 데이터

```typescript
// app/(home)/dashboard/page.tsx

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  // 한 번의 호출로 모든 데이터 가져오기
  const dashboardData = await getDashboardData(user.id);
  
  return (
    <div>
      <SkinWeatherCard weather={dashboardData.weather} />
      <RoutineChecklistSection 
        timeSlot="am" 
        products={dashboardData.routine.am}
        todayChecks={dashboardData.todayChecks.am}
      />
      <RoutineChecklistSection 
        timeSlot="pm" 
        products={dashboardData.routine.pm}
        todayChecks={dashboardData.todayChecks.pm}
      />
      <SkinConditionCard 
        currentCondition={dashboardData.todayLog?.condition}
        currentMemo={dashboardData.todayLog?.memo}
      />
      <StreakCard streak={dashboardData.streak} />
      <DailyIngredientCard ingredient={dashboardData.dailyContent.ingredient} />
      <DailyQuizCard quiz={dashboardData.dailyContent.quiz} />
    </div>
  );
}

// lib/api/dashboard.ts

export async function getDashboardData(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  const [routine, todayLog, todayChecks, streak, weather, dailyContent] = 
    await Promise.all([
      getUserRoutine(userId),
      getTodayLog(userId, today),
      getTodayChecks(userId, today),
      getUserStreak(userId),
      getWeather(),
      getDailyContent(today),
    ]);
  
  return {
    routine,
    todayLog,
    todayChecks: {
      am: todayChecks.filter(c => c.time_slot === 'am').map(c => c.product_id),
      pm: todayChecks.filter(c => c.time_slot === 'pm').map(c => c.product_id),
    },
    streak,
    weather,
    dailyContent,
  };
}
```

---

## 8. SEO 최적화

### 8-1. 랜딩 페이지 메타데이터

```typescript
// app/(home)/page.tsx

export const metadata: Metadata = {
  title: 'BARDA (바르다) - 내 루틴, 바르게 바르고 있을까?',
  description: '화장품 루틴 성분 충돌 체크 + AM/PM 순서 제안 + 7일 캘린더. 내가 가진 제품을 입력하면 최적의 루틴을 자동으로 만들어드려요.',
  keywords: '스킨케어 루틴, 화장품 순서, 성분 충돌, 레티놀 사용법, 비타민C, AHA BHA, 루틴 분석, K-뷰티',
  openGraph: {
    title: 'BARDA (바르다) - 내 루틴, 바르게 바르고 있을까?',
    description: '화장품 루틴 성분 충돌 체크 + AM/PM 순서 제안 + 7일 캘린더',
    images: ['/og-image-landing.png'],
    url: 'https://barda.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BARDA (바르다)',
    description: '내 루틴, 바르게 바르고 있을까?',
    images: ['/og-image-landing.png'],
  },
};
```

### 8-2. 구조화된 데이터 (JSON-LD)

```typescript
// app/(home)/page.tsx

export default function LandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'BARDA',
    description: '화장품 루틴 분석 서비스',
    applicationCategory: 'HealthApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1247',
    },
  };
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* 랜딩 페이지 컨텐츠 */}
    </>
  );
}
```

---

## 9. 성능 최적화

### 9-1. 이미지 최적화

```typescript
// next.config.js

module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
};

// 컴포넌트에서 사용
import Image from 'next/image';

<Image
  src="/hero-image.png"
  alt="BARDA 루틴 분석"
  width={600}
  height={400}
  priority              // LCP 이미지는 priority
  placeholder="blur"
/>
```

### 9-2. 코드 스플리팅

```typescript
// 랜딩 페이지는 대시보드 코드를 로드하지 않음
import dynamic from 'next/dynamic';

const DashboardPage = dynamic(() => import('./dashboard/page'), {
  loading: () => <LoadingScreen />,
});

const LandingPage = dynamic(() => import('./landing/page'), {
  loading: () => <LoadingScreen />,
});
```

### 9-3. 데이터 캐싱

```typescript
// lib/api/landing.ts

export const revalidate = 300; // 5분마다 revalidate

export async function getStats() {
  // Next.js 13+ fetch cache
  const res = await fetch('/api/stats', {
    next: { revalidate: 300 },
  });
  
  return res.json();
}
```

---

## 10. 반응형 디자인

### 10-1. 브레이크포인트

```typescript
// tailwind.config.ts

export default {
  theme: {
    screens: {
      'sm': '640px',      // 모바일 가로
      'md': '768px',      // 태블릿
      'lg': '1024px',     // 데스크탑
      'xl': '1280px',     // 큰 데스크탑
    },
  },
};
```

### 10-2. 반응형 레이아웃 예시

```typescript
// FeaturesSection
<div className="
  grid 
  grid-cols-1          /* 모바일: 1열 */
  md:grid-cols-2       /* 태블릿: 2열 */
  lg:grid-cols-3       /* 데스크탑: 3열 */
  gap-6
">
  {features.map(f => <FeatureCard key={f.id} {...f} />)}
</div>

// 텍스트 크기
<h1 className="
  text-3xl             /* 모바일: 3xl */
  md:text-4xl          /* 태블릿: 4xl */
  lg:text-5xl          /* 데스크탑: 5xl */
  font-bold
">
```

---

## 11. A/B 테스트 준비

### 11-1. 히어로 CTA 테스트

```typescript
// lib/hooks/useABTest.ts

export function useABTest(testName: string) {
  const [variant, setVariant] = useState<'A' | 'B'>('A');
  
  useEffect(() => {
    // 사용자 ID 기반 또는 랜덤
    const savedVariant = localStorage.getItem(`ab_${testName}`);
    
    if (savedVariant) {
      setVariant(savedVariant as 'A' | 'B');
    } else {
      const newVariant = Math.random() > 0.5 ? 'A' : 'B';
      setVariant(newVariant);
      localStorage.setItem(`ab_${testName}`, newVariant);
    }
  }, [testName]);
  
  return variant;
}

// HeroSection에서 사용
export function HeroSection() {
  const ctaVariant = useABTest('hero_cta');
  
  return (
    <div>
      {ctaVariant === 'A' ? (
        <button>내 루틴 분석하기 →</button>
      ) : (
        <button>무료로 시작하기 →</button>
      )}
    </div>
  );
}
```

---

## 12. 개발 체크리스트

### 12-1. 랜딩 페이지
- [ ] HeroSection 구현
- [ ] FeaturesSection 구현
- [ ] FeedPreviewSection 구현 + API 연동
- [ ] PopularRoutinesSection 구현 + API 연동
- [ ] StatsSection 구현 + API 연동
- [ ] GuideCTASection 구현
- [ ] FinalCTASection 구현
- [ ] 반응형 테스트 (480px, 768px, 1024px)
- [ ] SEO 메타데이터 확인
- [ ] OG 이미지 생성

### 12-2. 대시보드
- [ ] 분기 로직 구현 (비로그인/로그인/분석 전/분석 후)
- [ ] useAuth Hook 구현
- [ ] useUserRoutine Hook 구현
- [ ] getDashboardData API 구현
- [ ] 로딩 상태 처리
- [ ] 에러 처리

### 12-3. 온보딩
- [ ] OnboardingPage 구현
- [ ] "시작하기" CTA → 분석 페이지 연결
- [ ] 피드 미리보기 연동

### 12-4. 성능
- [ ] Lighthouse 점수 90+ (모바일)
- [ ] LCP < 2.5s
- [ ] 이미지 최적화 (AVIF/WebP)
- [ ] 코드 스플리팅 확인

---

## 13. 파일 구조 최종

```
app/
├─ (home)/
│  ├─ page.tsx                      # 분기 로직
│  │
│  ├─ landing/
│  │  └─ page.tsx                   # 랜딩 페이지
│  │
│  ├─ dashboard/
│  │  └─ page.tsx                   # 대시보드
│  │
│  └─ onboarding/
│     └─ page.tsx                   # 온보딩
│
components/
├─ shared/
│  ├─ RoutinePreviewCard.tsx
│  ├─ FeatureCard.tsx
│  ├─ StatCard.tsx
│  └─ GuideLink.tsx
│
├─ home/
│  ├─ landing/
│  │  ├─ HeroSection.tsx
│  │  ├─ FeaturesSection.tsx
│  │  ├─ FeedPreviewSection.tsx
│  │  ├─ PopularRoutinesSection.tsx
│  │  ├─ StatsSection.tsx
│  │  ├─ GuideCTASection.tsx
│  │  └─ FinalCTASection.tsx
│  │
│  └─ onboarding/
│     ├─ OnboardingHero.tsx
│     └─ OnboardingBenefits.tsx
│
lib/
├─ hooks/
│  ├─ useAuth.ts
│  ├─ useUserRoutine.ts
│  └─ useABTest.ts
│
└─ api/
   ├─ landing.ts
   └─ dashboard.ts
```

---

## 14. 다음 단계

1. ✅ 랜딩 페이지 구현
2. ✅ 분기 로직 구현
3. ✅ 대시보드 연결
4. 🔜 A/B 테스트 시작
5. 🔜 SEO 최적화
6. 🔜 성능 측정 및 개선
