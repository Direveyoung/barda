# BARDA — 일일 콘텐츠 생성 시스템
**작성일: 2026.02.16**  
**목표: 매일 10초 대시보드 콘텐츠 자동화**

---

## 1. 개요

### 1-1. 일일 콘텐츠 3종
1. **오늘의 피부 날씨** (UV + 습도 + TIP)
2. **오늘의 성분** (30종 로테이션)
3. **오늘의 퀴즈** (50개 룰 기반)

### 1-2. 목표
- 매일 **다른 콘텐츠**로 재방문 유도
- 100% **자동 생성** (수동 작업 없음)
- **교육 + 재미** 병행

---

## 2. 오늘의 피부 날씨

### 2-1. 데이터 소스

#### 기상청 API
- URL: https://apihub.kma.go.kr/
- 제공 데이터: UV 지수, 습도, 기온, 강수 확률

#### 활용 정보
- **UV 지수**: 0~2 (낮음), 3~5 (보통), 6~7 (높음), 8~10 (매우 높음), 11+ (위험)
- **습도**: 0~30% (매우 건조), 31~60% (적당), 61~80% (습함), 81%+ (매우 습함)
- **기온**: 영하, 0~10°C (추움), 11~20°C (선선), 21~28°C (적당), 29°C+ (더움)

### 2-2. TIP 매핑 테이블

```typescript
interface WeatherTip {
  condition: WeatherCondition;
  tip: string;
  icon: string;
}

const weatherTips: WeatherTip[] = [
  // UV 높음
  {
    condition: { uvMin: 6 },
    tip: "선크림 필수! 2~3시간마다 덧바르세요",
    icon: "☀️🔴"
  },
  {
    condition: { uvMin: 3, uvMax: 5 },
    tip: "선크림 꼭 바르고, 외출 시 모자 챙기세요",
    icon: "☀️"
  },
  {
    condition: { uvMax: 2 },
    tip: "UV 낮지만 선크림은 기본! 실내에서도 자외선 조심",
    icon: "⛅"
  },
  
  // 습도 낮음
  {
    condition: { humidityMax: 30 },
    tip: "매우 건조해요! 보습 크림 충분히 + 수분 스프레이 챙기세요",
    icon: "💧🔴"
  },
  {
    condition: { humidityMin: 31, humidityMax: 50 },
    tip: "조금 건조한 날씨. 보습에 신경 쓰세요",
    icon: "💧"
  },
  
  // 습도 높음
  {
    condition: { humidityMin: 81 },
    tip: "매우 습해요! 가벼운 제형 사용 + 피지 관리 중요",
    icon: "💦"
  },
  {
    condition: { humidityMin: 61, humidityMax: 80 },
    tip: "습한 날씨. 무거운 크림보다 젤/로션 추천",
    icon: "💦"
  },
  
  // 기온 낮음
  {
    condition: { tempMax: 0 },
    tip: "추운 날씨! 오일/크림으로 피부장벽 보호하세요",
    icon: "❄️"
  },
  {
    condition: { tempMin: 1, tempMax: 10 },
    tip: "쌀쌀한 날씨. 보습 단계 강화 권장",
    icon: "🧥"
  },
  
  // 기온 높음
  {
    condition: { tempMin: 29 },
    tip: "더운 날씨! 가벼운 보습 + 피지 조절 중요",
    icon: "🥵"
  },
  
  // 비/눈
  {
    condition: { rainProbMin: 60 },
    tip: "비 올 확률 높아요. 방수 선크림 추천",
    icon: "☔"
  },
];
```

### 2-3. API 구현

```typescript
// lib/api/weather.ts

import axios from 'axios';

interface WeatherData {
  uv: number;
  humidity: number;
  temp: number;
  rainProb: number;
  tip: string;
  icon: string;
}

export async function getTodayWeather(
  lat: number = 37.5665,    // 서울 기본
  lon: number = 126.9780
): Promise<WeatherData> {
  const apiKey = process.env.KMA_API_KEY!;
  
  // 기상청 API 호출
  const response = await axios.get('https://apihub.kma.go.kr/api/...', {
    params: {
      serviceKey: apiKey,
      lat,
      lon,
      // ... 기타 파라미터
    }
  });
  
  const { uv, humidity, temp, rainProb } = response.data;
  
  // TIP 자동 선택
  const tip = selectWeatherTip({ uv, humidity, temp, rainProb });
  
  return {
    uv,
    humidity,
    temp,
    rainProb,
    tip: tip.tip,
    icon: tip.icon
  };
}

function selectWeatherTip(conditions: {
  uv: number;
  humidity: number;
  temp: number;
  rainProb: number;
}): WeatherTip {
  // 우선순위: UV > 습도 > 기온 > 강수
  
  // 1. UV 체크
  if (conditions.uv >= 8) {
    return weatherTips.find(t => t.condition.uvMin === 8)!;
  }
  if (conditions.uv >= 6) {
    return weatherTips.find(t => t.condition.uvMin === 6)!;
  }
  
  // 2. 습도 극단 체크
  if (conditions.humidity <= 30) {
    return weatherTips.find(t => t.condition.humidityMax === 30)!;
  }
  if (conditions.humidity >= 81) {
    return weatherTips.find(t => t.condition.humidityMin === 81)!;
  }
  
  // 3. 기온 극단 체크
  if (conditions.temp <= 0) {
    return weatherTips.find(t => t.condition.tempMax === 0)!;
  }
  if (conditions.temp >= 29) {
    return weatherTips.find(t => t.condition.tempMin === 29)!;
  }
  
  // 4. 강수 확률 체크
  if (conditions.rainProb >= 60) {
    return weatherTips.find(t => t.condition.rainProbMin === 60)!;
  }
  
  // 5. 기본 (평범한 날씨)
  return {
    condition: {},
    tip: "적당한 날씨예요! 기본 루틴대로 진행하세요",
    icon: "☀️"
  };
}
```

### 2-4. 캐싱 전략

```typescript
// lib/api/weather.ts

import { unstable_cache } from 'next/cache';

export const getCachedWeather = unstable_cache(
  async (lat: number, lon: number) => getTodayWeather(lat, lon),
  ['weather'],
  {
    revalidate: 3600,  // 1시간마다 갱신
    tags: ['weather']
  }
);
```

---

## 3. 오늘의 성분

### 3-1. 로테이션 로직

```typescript
// lib/daily-content.ts

interface DailyIngredient {
  id: string;
  nameKo: string;
  oneLiner: string;
  category: string;
  link: string;
}

export function getTodayIngredient(date: Date = new Date()): DailyIngredient {
  // 30일 주기로 로테이션
  const dayOfMonth = date.getDate(); // 1~31
  const ingredientIndex = (dayOfMonth - 1) % 30;
  
  const ingredient = INGREDIENTS_30[ingredientIndex];
  
  return {
    id: ingredient.id,
    nameKo: ingredient.nameKo,
    oneLiner: ingredient.oneLiner,
    category: ingredient.category,
    link: `/ingredients/${ingredient.id}`
  };
}

// 30개 성분 목록 (순서 중요)
const INGREDIENTS_30 = [
  { id: 'retinol', nameKo: '레티놀', oneLiner: '주름 개선의 황금 성분', category: '안티에이징' },
  { id: 'aha', nameKo: 'AHA (글리콜산)', oneLiner: '각질 제거의 대표 주자', category: '각질케어' },
  { id: 'bha', nameKo: 'BHA (살리실산)', oneLiner: '모공 속 피지까지 케어', category: '각질케어' },
  { id: 'vitamin_c', nameKo: '비타민C', oneLiner: '미백과 항산화의 파워', category: '미백·톤업' },
  { id: 'niacinamide', nameKo: '나이아신아마이드', oneLiner: '만능 멀티플레이어', category: '미백·톤업' },
  { id: 'hyaluronic_acid', nameKo: '히알루론산', oneLiner: '수분 충전의 왕', category: '보습' },
  { id: 'ceramide', nameKo: '세라마이드', oneLiner: '피부장벽을 지키는 수호자', category: '보습' },
  { id: 'centella', nameKo: '시카 (센텔라)', oneLiner: '진정의 대명사', category: '진정' },
  { id: 'benzoyl_peroxide', nameKo: '벤조일퍼옥사이드', oneLiner: '트러블 제압 전문', category: '트러블' },
  { id: 'pha', nameKo: 'PHA', oneLiner: '순한 각질케어', category: '각질케어' },
  // ... 나머지 20개
];
```

### 3-2. DB 저장 (선택)

```sql
-- 오늘의 성분 히스토리 (통계용)
CREATE TABLE daily_ingredient_history (
  date DATE PRIMARY KEY,
  ingredient_id TEXT NOT NULL,
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0
);
```

---

## 4. 오늘의 퀴즈

### 4-1. 퀴즈 생성 로직

```typescript
// lib/daily-content.ts

interface DailyQuiz {
  id: string;
  ruleId: string;
  question: string;
  correctAnswer: boolean;    // true = ⭕, false = ❌
  explanation: string;
  category: string;
}

export function getTodayQuiz(date: Date = new Date()): DailyQuiz {
  // 연중 날짜로 50일 주기 로테이션
  const dayOfYear = getDayOfYear(date);
  const quizIndex = (dayOfYear - 1) % 50;
  
  return QUIZZES_50[quizIndex];
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
```

### 4-2. 퀴즈 50개 자동 생성

```typescript
// scripts/generate-quizzes.ts

import { RULES_50 } from './rules';

interface Quiz {
  id: string;
  ruleId: string;
  question: string;
  correctAnswer: boolean;
  explanation: string;
  category: string;
}

function generateQuizFromRule(rule: Rule): Quiz {
  // 룰 타입에 따라 질문 형식 결정
  
  if (rule.type === 'conflict') {
    // 충돌 룰 → "같이 써도 돼?" 형식
    return {
      id: `quiz_${rule.id}`,
      ruleId: rule.id,
      question: `${rule.ingredients[0]}과 ${rule.ingredients[1]}, 같은 날 써도 될까요?`,
      correctAnswer: false,
      explanation: rule.reason + ' ' + rule.solution,
      category: '성분 충돌'
    };
  }
  
  if (rule.type === 'timing') {
    // 타이밍 룰 → "아침/저녁 써도 돼?" 형식
    return {
      id: `quiz_${rule.id}`,
      ruleId: rule.id,
      question: `${rule.ingredient}는 ${rule.wrongTiming}에 써도 될까요?`,
      correctAnswer: false,
      explanation: rule.reason + ' ' + rule.correctTiming + '에만 사용하세요.',
      category: '사용 시간'
    };
  }
  
  if (rule.type === 'safe') {
    // 안전 조합 → "같이 쓰면 좋아?" 형식
    return {
      id: `quiz_${rule.id}`,
      ruleId: rule.id,
      question: `${rule.ingredients[0]}과 ${rule.ingredients[1]}, 함께 쓰면 좋을까요?`,
      correctAnswer: true,
      explanation: rule.synergyEffect,
      category: '시너지 조합'
    };
  }
  
  // 기본
  return {
    id: `quiz_${rule.id}`,
    ruleId: rule.id,
    question: rule.question,
    correctAnswer: rule.answer,
    explanation: rule.explanation,
    category: '기타'
  };
}

// 50개 룰 → 50개 퀴즈 변환
const QUIZZES_50: Quiz[] = RULES_50.map(generateQuizFromRule);

// JSON 파일로 저장
fs.writeFileSync(
  'data/quizzes-50.json',
  JSON.stringify(QUIZZES_50, null, 2),
  'utf-8'
);

console.log('✅ 퀴즈 50개 생성 완료!');
```

### 4-3. 퀴즈 예시

```json
[
  {
    "id": "quiz_B01",
    "ruleId": "B01",
    "question": "레티놀과 AHA(글리콜산), 같은 날 써도 될까요?",
    "correctAnswer": false,
    "explanation": "각질제거 이중 자극으로 피부 장벽 손상 위험이 있어요. 번갈아 사용하거나 레티놀날/AHA날로 분리하세요.",
    "category": "성분 충돌"
  },
  {
    "id": "quiz_D04",
    "ruleId": "D04",
    "question": "비타민C는 저녁에만 써야 할까요?",
    "correctAnswer": false,
    "explanation": "비타민C는 항산화 효과가 있어 아침에 사용하는 게 더 효과적이에요. 선크림과 시너지가 있습니다!",
    "category": "사용 시간"
  },
  {
    "id": "quiz_synergy_01",
    "ruleId": "synergy_01",
    "question": "나이아신아마이드와 세라마이드, 함께 쓰면 좋을까요?",
    "correctAnswer": true,
    "explanation": "나이아신아마이드가 피부장벽 강화를 돕고, 세라마이드가 장벽을 구성해 시너지 효과가 있어요!",
    "category": "시너지 조합"
  }
]
```

---

## 5. API 통합

### 5-1. 통합 엔드포인트

```typescript
// app/api/daily-content/route.ts

import { getTodayWeather } from '@/lib/api/weather';
import { getTodayIngredient, getTodayQuiz } from '@/lib/daily-content';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get('lat')) || 37.5665;
  const lon = Number(searchParams.get('lon')) || 126.9780;
  
  const [weather, ingredient, quiz] = await Promise.all([
    getTodayWeather(lat, lon),
    getTodayIngredient(),
    getTodayQuiz(),
  ]);
  
  return Response.json({
    weather,
    ingredient,
    quiz,
    date: new Date().toISOString().split('T')[0]
  });
}
```

### 5-2. 클라이언트 Hook

```typescript
// lib/hooks/useDailyContent.ts

export function useDailyContent() {
  const [content, setContent] = useState<DailyContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // 위치 정보 가져오기 (옵션)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        const res = await fetch(
          `/api/daily-content?lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();
        
        setContent(data);
        setIsLoading(false);
      },
      async () => {
        // 위치 거부 시 서울 기본값
        const res = await fetch('/api/daily-content');
        const data = await res.json();
        
        setContent(data);
        setIsLoading(false);
      }
    );
  }, []);
  
  return { content, isLoading };
}
```

---

## 6. 컴포넌트 구현

### 6-1. SkinWeatherCard

```typescript
// components/home/SkinWeatherCard.tsx

interface SkinWeatherCardProps {
  weather: WeatherData;
}

export function SkinWeatherCard({ weather }: SkinWeatherCardProps) {
  return (
    <div className="bg-gradient-to-r from-am-accent/20 to-blue-100 rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-2xl">{weather.icon}</div>
        <div className="text-right text-sm text-gray-600">
          <div>UV {weather.uv} / 습도 {weather.humidity}%</div>
          <div>{weather.temp}°C</div>
        </div>
      </div>
      
      <p className="text-sm font-medium text-gray-800">
        {weather.tip}
      </p>
    </div>
  );
}
```

### 6-2. DailyIngredientCard

```typescript
// components/home/DailyIngredientCard.tsx

interface DailyIngredientCardProps {
  ingredient: DailyIngredient;
}

export function DailyIngredientCard({ ingredient }: DailyIngredientCardProps) {
  return (
    <Link href={ingredient.link} className="block mb-4">
      <div className="bg-white rounded-2xl p-4 border-2 border-gray-100 hover:border-primary transition">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-gray-500 uppercase">
            {ingredient.category}
          </div>
          <div className="text-xs text-primary font-semibold">
            자세히 →
          </div>
        </div>
        
        <div className="text-lg font-bold mb-1">
          💡 오늘의 성분: {ingredient.nameKo}
        </div>
        
        <p className="text-sm text-gray-600">
          {ingredient.oneLiner}
        </p>
      </div>
    </Link>
  );
}
```

### 6-3. DailyQuizCard

```typescript
// components/home/DailyQuizCard.tsx

interface DailyQuizCardProps {
  quiz: DailyQuiz;
  onAnswer: (isCorrect: boolean) => void;
}

export function DailyQuizCard({ quiz, onAnswer }: DailyQuizCardProps) {
  const [answered, setAnswered] = useState(false);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  
  const handleAnswer = (answer: boolean) => {
    setUserAnswer(answer);
    setAnswered(true);
    onAnswer(answer === quiz.correctAnswer);
  };
  
  if (!answered) {
    return (
      <div className="bg-white rounded-2xl p-4 border-2 border-gray-100">
        <div className="text-xs text-gray-500 uppercase mb-2">
          {quiz.category}
        </div>
        
        <div className="text-lg font-bold mb-4">
          ❓ {quiz.question}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleAnswer(true)}
            className="py-3 bg-green-50 hover:bg-green-100 text-green-700 font-semibold rounded-xl transition"
          >
            ⭕ 괜찮아요
          </button>
          
          <button
            onClick={() => handleAnswer(false)}
            className="py-3 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl transition"
          >
            ❌ 피해야 해요
          </button>
        </div>
      </div>
    );
  }
  
  // 답변 후
  const isCorrect = userAnswer === quiz.correctAnswer;
  
  return (
    <div className={`rounded-2xl p-4 ${
      isCorrect 
        ? 'bg-green-50 border-2 border-green-200' 
        : 'bg-orange-50 border-2 border-orange-200'
    }`}>
      <div className="text-2xl mb-2">
        {isCorrect ? '✅ 정답이에요!' : '❌ 아쉬워요!'}
      </div>
      
      <p className="text-sm text-gray-700 mb-3">
        {quiz.explanation}
      </p>
      
      <div className="text-xs text-gray-500">
        내일 다시 도전하세요! 🔥
      </div>
    </div>
  );
}
```

---

## 7. 데이터 로깅

### 7-1. 조회/클릭 로깅

```sql
-- 일일 콘텐츠 로그
CREATE TABLE daily_content_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  date DATE NOT NULL,
  content_type TEXT NOT NULL,        -- "weather" | "ingredient" | "quiz"
  content_id TEXT,                   -- ingredient_id 또는 quiz_id
  action TEXT NOT NULL,              -- "view" | "click" | "answer"
  details JSONB,                     -- 추가 정보 (퀴즈 답변 등)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_daily_content_logs_date ON daily_content_logs(date DESC);
CREATE INDEX idx_daily_content_logs_type ON daily_content_logs(content_type);
```

### 7-2. 로깅 API

```typescript
// app/api/daily-content/log/route.ts

export async function POST(request: Request) {
  const { userId, contentType, contentId, action, details } = await request.json();
  
  await supabase.from('daily_content_logs').insert({
    user_id: userId,
    date: new Date().toISOString().split('T')[0],
    content_type: contentType,
    content_id: contentId,
    action: action,
    details: details
  });
  
  return Response.json({ success: true });
}
```

---

## 8. 통계 & 분석

### 8-1. 대시보드 쿼리

```sql
-- 오늘의 성분 인기도
SELECT 
  ingredient_id,
  COUNT(*) FILTER (WHERE action = 'view') as views,
  COUNT(*) FILTER (WHERE action = 'click') as clicks,
  ROUND(COUNT(*) FILTER (WHERE action = 'click')::numeric / 
        NULLIF(COUNT(*) FILTER (WHERE action = 'view'), 0) * 100, 1) as ctr
FROM daily_content_logs
WHERE content_type = 'ingredient'
  AND date > NOW() - INTERVAL '30 days'
GROUP BY ingredient_id
ORDER BY clicks DESC;

-- 퀴즈 정답률
SELECT 
  quiz_id,
  COUNT(*) as total_answers,
  COUNT(*) FILTER (WHERE details->>'is_correct' = 'true') as correct_answers,
  ROUND(COUNT(*) FILTER (WHERE details->>'is_correct' = 'true')::numeric / 
        COUNT(*) * 100, 1) as accuracy
FROM daily_content_logs
WHERE content_type = 'quiz'
  AND action = 'answer'
  AND date > NOW() - INTERVAL '30 days'
GROUP BY quiz_id
ORDER BY total_answers DESC;
```

---

## 9. 개발 체크리스트

### 9-1. 피부 날씨

- [ ] 기상청 API 키 발급
- [ ] 날씨 API 구현
- [ ] TIP 매핑 테이블 작성 (20개)
- [ ] SkinWeatherCard 컴포넌트
- [ ] 캐싱 설정

### 9-2. 오늘의 성분

- [ ] 30개 성분 순서 결정
- [ ] 로테이션 로직 구현
- [ ] DailyIngredientCard 컴포넌트
- [ ] 성분사전 링크 연동

### 9-3. 오늘의 퀴즈

- [ ] 룰 50개 → 퀴즈 50개 변환 스크립트
- [ ] quizzes-50.json 생성
- [ ] 로테이션 로직 구현
- [ ] DailyQuizCard 컴포넌트
- [ ] 답변 저장 API

### 9-4. 통합

- [ ] /api/daily-content 엔드포인트
- [ ] useDailyContent Hook
- [ ] 로깅 시스템
- [ ] 통계 대시보드

---

## 10. 예상 시간

| 작업 | 시간 | 난이도 |
|---|---|---|
| 기상청 API 연동 | 2h | 🟡 |
| 날씨 TIP 매핑 | 1h | 🟢 |
| 성분 로테이션 | 0.5h | 🟢 |
| 퀴즈 자동 생성 | 2h | 🟡 |
| API 통합 | 1h | 🟢 |
| 컴포넌트 UI | 3h | 🟢 |
| 로깅 시스템 | 1h | 🟢 |
| **합계** | **10.5h** | |

---

## 11. 다음 단계

1. ✅ 일일 콘텐츠 3종 자동 생성 완료
2. 🔜 사용자 참여도 모니터링
3. 🔜 TIP 고도화 (피부타입별 맞춤)
4. 🔜 퀴즈 난이도 조정
5. 🔜 주간 요약 리포트 생성
