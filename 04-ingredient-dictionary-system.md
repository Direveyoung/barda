# BARDA — 성분사전 30종 콘텐츠 시스템
**작성일: 2026.02.16**  
**목표: SEO 유입 채널 + 룰 엔진 신뢰도**

---

## 1. 개요

### 1-1. 목적
- **SEO 유입 채널**: "레티놀 AHA 같이" 같은 검색 유입
- **룰 엔진 신뢰도**: 충돌 경고 "왜?" 클릭 → 성분사전
- **사용자 교육**: 성분 지식 축적 → 서비스 신뢰도 ↑

### 1-2. 구조
```
성분사전 (30종)
├─ 각질케어 (3종)
├─ 안티에이징 (5종)
├─ 미백·톤업 (5종)
├─ 보습 (5종)
├─ 진정 (5종)
├─ 트러블 (3종)
└─ 기타 (4종)
```

---

## 2. 성분 30종 리스트

### 2-1. 카테고리별 목록

| 카테고리 | 성분 | 우선순위 |
|---|---|---|
| **각질케어** | | |
| | AHA (글리콜산) | 🔴 필수 |
| | BHA (살리실산) | 🔴 필수 |
| | PHA (글루코노락톤) | 🟡 중요 |
| **안티에이징** | | |
| | 레티놀 | 🔴 필수 |
| | 레틴알데히드 | 🟡 중요 |
| | 바쿠치올 | 🟡 중요 |
| | 펩타이드 | 🟡 중요 |
| | 아데노신 | 🟢 권장 |
| **미백·톤업** | | |
| | 비타민C (L-AA) | 🔴 필수 |
| | 나이아신아마이드 | 🔴 필수 |
| | 알파아르부틴 | 🟡 중요 |
| | 트라넥사믹산 | 🟡 중요 |
| | 글루타치온 | 🟢 권장 |
| **보습** | | |
| | 히알루론산 | 🔴 필수 |
| | 세라마이드 | 🔴 필수 |
| | 스쿠알란 | 🟡 중요 |
| | 판테놀 | 🟡 중요 |
| | 글리세린 | 🟢 권장 |
| **진정** | | |
| | 시카 (센텔라) | 🔴 필수 |
| | 알로에 | 🟡 중요 |
| | 마데카소사이드 | 🟡 중요 |
| | 알란토인 | 🟢 권장 |
| | 병풀추출물 | 🟢 권장 |
| **트러블** | | |
| | 벤조일퍼옥사이드 | 🔴 필수 |
| | 티트리 | 🟡 중요 |
| | 아젤라인산 | 🟢 권장 |
| **기타** | | |
| | 구리펩타이드 | 🟡 중요 |
| | 효소 (파파인) | 🟢 권장 |
| | EGF | 🟢 권장 |
| | 콜라겐 | 🟢 권장 |

---

## 3. 데이터 구조

### 3-1. JSON 스키마

```typescript
interface Ingredient {
  id: string;                           // "retinol"
  nameKo: string;                       // "레티놀"
  nameEn: string;                       // "Retinol"
  category: string;                     // "안티에이징"
  
  // 핵심 정보
  oneLiner: string;                     // "주름 개선의 황금 성분"
  description: string;                  // 상세 설명 (2~3문장)
  effects: string[];                    // ["주름개선", "피부재생", "콜라겐 촉진"]
  
  // 사용 가이드
  recommendedSkinTypes: string[];       // ["all"] | ["건성", "지성", ...]
  cautionSkinTypes: string[];           // ["민감성"]
  usageFrequency: string;               // "주 2~3회부터 시작"
  usageTiming: string;                  // "PM만 사용"
  usageTips: string[];                  // ["저농도부터 시작", "선크림 필수"]
  
  // 조합 정보
  conflictRules: string[];              // ["B01", "B03", "B04", "B10"]
  conflictIngredients: ConflictInfo[];  // 충돌 성분 상세
  synergyIngredients: SynergyInfo[];    // 시너지 성분 상세
  
  // SEO
  searchKeywords: string[];             // ["레티놀", "주름", "안티에이징", ...]
  relatedQuestions: string[];           // ["레티놀 부작용은?", ...]
  
  // 메타
  addedAt: string;
}

interface ConflictInfo {
  ingredientId: string;                 // "aha"
  level: 'high' | 'medium' | 'low';
  reason: string;                       // "자극 상승 위험"
  solution: string;                     // "번갈아 사용 권장"
}

interface SynergyInfo {
  ingredientId: string;                 // "niacinamide"
  effect: string;                       // "자극 완화 + 효능 유지"
}
```

### 3-2. 예시 데이터 (레티놀)

```json
{
  "id": "retinol",
  "nameKo": "레티놀",
  "nameEn": "Retinol",
  "category": "안티에이징",
  
  "oneLiner": "주름 개선의 황금 성분",
  "description": "비타민A 유도체로, 피부 세포 재생을 촉진하고 콜라겐 생성을 도와 주름을 개선합니다. 강력한 효과만큼 자극도 있어 천천히 적응하는 것이 중요해요.",
  "effects": ["주름개선", "피부재생", "콜라겐 촉진", "모공 축소"],
  
  "recommendedSkinTypes": ["all"],
  "cautionSkinTypes": ["민감성"],
  "usageFrequency": "주 2~3회부터 시작 → 적응 후 매일",
  "usageTiming": "PM만 사용 (광감작성)",
  "usageTips": [
    "0.1% 이하 저농도부터 시작",
    "다음 날 아침 선크림 필수",
    "각질케어 제품과 같은 날 사용 금지",
    "보습 크림과 함께 사용하면 자극 완화"
  ],
  
  "conflictRules": ["B01", "B02", "B03", "B04", "B10", "B12"],
  "conflictIngredients": [
    {
      "ingredientId": "aha",
      "level": "high",
      "reason": "각질제거 이중 자극으로 피부 장벽 손상 위험",
      "solution": "번갈아 사용 권장 (레티놀날/AHA날 분리)"
    },
    {
      "ingredientId": "benzoyl_peroxide",
      "level": "high",
      "reason": "레티놀 성분 분해로 효능 감소",
      "solution": "AM(벤조일퍼옥사이드) / PM(레티놀) 분리"
    },
    {
      "ingredientId": "vitamin_c",
      "level": "medium",
      "reason": "pH 차이로 효능 감소 가능",
      "solution": "AM(비타민C) / PM(레티놀) 분리 권장"
    }
  ],
  
  "synergyIngredients": [
    {
      "ingredientId": "niacinamide",
      "effect": "레티놀 자극 완화 + 피부장벽 강화"
    },
    {
      "ingredientId": "hyaluronic_acid",
      "effect": "레티놀 건조함 완화 + 보습 효과"
    },
    {
      "ingredientId": "ceramide",
      "effect": "피부장벽 회복 + 자극 최소화"
    }
  ],
  
  "searchKeywords": [
    "레티놀",
    "레티놀 사용법",
    "레티놀 부작용",
    "레티놀 AHA",
    "레티놀 비타민C",
    "레티놀 초보",
    "주름 개선"
  ],
  
  "relatedQuestions": [
    "레티놀 부작용은?",
    "레티놀 얼마나 써야 효과?",
    "레티놀과 비타민C 같이 써도 돼?",
    "레티놀 입문자 추천 제품은?",
    "레티놀 아침에 써도 돼?"
  ],
  
  "addedAt": "2026-02-16"
}
```

---

## 4. 자동 생성 시스템

### 4-1. 템플릿 엔진

```typescript
// lib/ingredient-template.ts

interface TemplateData {
  ingredient: Ingredient;
  relatedProducts: Product[];
  relatedQA: Question[];
}

export function generateIngredientPage(data: TemplateData): string {
  const { ingredient } = data;
  
  return `
# ${ingredient.nameKo} (${ingredient.nameEn})
**${ingredient.oneLiner}**

---

## 📌 이런 효과가 있어요

${ingredient.effects.map(e => `- ✅ ${e}`).join('\n')}

---

## 💡 상세 설명

${ingredient.description}

---

## 👤 추천 피부타입

${ingredient.recommendedSkinTypes.includes('all') 
  ? '✅ 모든 피부타입 사용 가능' 
  : ingredient.recommendedSkinTypes.map(t => `✅ ${t}`).join('\n')}

${ingredient.cautionSkinTypes.length > 0 
  ? `\n⚠️ 주의: ${ingredient.cautionSkinTypes.join(', ')} 피부는 패치테스트 권장` 
  : ''}

---

## 🕐 사용 가이드

**사용 시간**: ${ingredient.usageTiming}  
**사용 빈도**: ${ingredient.usageFrequency}

**사용 TIP**:
${ingredient.usageTips.map(tip => `- 💡 ${tip}`).join('\n')}

---

## ⚠️ 주의할 조합

${ingredient.conflictIngredients.map(conflict => `
### ${conflict.level === 'high' ? '🔴' : conflict.level === 'medium' ? '🟡' : '🟢'} ${getIngredientName(conflict.ingredientId)} 

**왜 조심해야 하나요?**  
${conflict.reason}

**해결 방법**  
${conflict.solution}
`).join('\n\n')}

---

## ✅ 함께 쓰면 좋은 성분

${ingredient.synergyIngredients.map(synergy => `
- **${getIngredientName(synergy.ingredientId)}**  
  ${synergy.effect}
`).join('\n')}

---

## 🛍️ 대표 제품

${data.relatedProducts.slice(0, 5).map(p => 
  `- ${p.brand} ${p.name}`
).join('\n')}

[더 많은 ${ingredient.nameKo} 제품 보기 →](/products?ingredient=${ingredient.id})

---

## ❓ 자주 묻는 질문

${ingredient.relatedQuestions.map((q, i) => `
### ${i + 1}. ${q}

[커뮤니티에서 답변 보기 →](/qa?search=${encodeURIComponent(q)})
`).join('\n\n')}

---

## 📚 관련 가이드

- [레티놀 초보자 완전 가이드](/guide/retinol-beginner)
- [성분 충돌 조합표 전체보기](/guide/conflicts)
- [내 루틴에 ${ingredient.nameKo} 추가하기](/analyze)
  `;
}
```

### 4-2. 대량 생성 스크립트

```typescript
// scripts/generate-ingredient-pages.ts

import fs from 'fs';
import path from 'path';
import ingredientsData from './ingredients-30.json';
import { generateIngredientPage } from '../lib/ingredient-template';

async function generateAllPages() {
  const outputDir = path.join(process.cwd(), 'content/ingredients');
  
  // 디렉토리 생성
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  for (const ingredient of ingredientsData) {
    // 관련 제품 가져오기
    const relatedProducts = await getRelatedProducts(ingredient.id);
    
    // 관련 Q&A 가져오기
    const relatedQA = await getRelatedQuestions(ingredient.nameKo);
    
    // 페이지 생성
    const content = generateIngredientPage({
      ingredient,
      relatedProducts,
      relatedQA
    });
    
    // 파일 저장
    const filename = `${ingredient.id}.md`;
    fs.writeFileSync(
      path.join(outputDir, filename),
      content,
      'utf-8'
    );
    
    console.log(`✅ ${ingredient.nameKo} 페이지 생성 완료`);
  }
  
  console.log(`\n🎉 총 ${ingredientsData.length}개 성분 페이지 생성 완료!`);
}

generateAllPages();
```

---

## 5. DB 스키마

```sql
CREATE TABLE ingredients (
  id TEXT PRIMARY KEY,
  name_ko TEXT NOT NULL,
  name_en TEXT,
  category TEXT NOT NULL,
  
  one_liner TEXT NOT NULL,
  description TEXT NOT NULL,
  effects TEXT[] NOT NULL,
  
  recommended_skin_types TEXT[],
  caution_skin_types TEXT[],
  usage_frequency TEXT,
  usage_timing TEXT,
  usage_tips TEXT[],
  
  conflict_rules TEXT[],
  conflict_ingredients JSONB,
  synergy_ingredients JSONB,
  
  search_keywords TEXT[],
  related_questions TEXT[],
  
  added_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 검색 최적화
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('simple', name_ko || ' ' || COALESCE(name_en, '') || ' ' || one_liner)
  ) STORED
);

CREATE INDEX idx_ingredients_search ON ingredients USING GIN(search_vector);
CREATE INDEX idx_ingredients_category ON ingredients(category);
```

---

## 6. 성분 상세 페이지 (Next.js)

### 6-1. 동적 라우트

```typescript
// app/ingredients/[id]/page.tsx

import { getIngredient, getRelatedProducts, getRelatedQuestions } from '@/lib/api/ingredients';
import { IngredientDetailPage } from '@/components/ingredients/IngredientDetailPage';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  const ingredient = await getIngredient(params.id);
  
  if (!ingredient) return {};
  
  return {
    title: `${ingredient.nameKo} - 효과, 사용법, 조합 가이드 | BARDA`,
    description: `${ingredient.oneLiner}. ${ingredient.description}`,
    keywords: ingredient.searchKeywords.join(', '),
    openGraph: {
      title: `${ingredient.nameKo} 완전 정복`,
      description: ingredient.oneLiner,
      images: [`/og/ingredient-${ingredient.id}.png`],
    },
  };
}

export default async function IngredientPage({ params }: PageProps) {
  const [ingredient, relatedProducts, relatedQuestions] = await Promise.all([
    getIngredient(params.id),
    getRelatedProducts(params.id),
    getRelatedQuestions(params.id),
  ]);
  
  if (!ingredient) {
    notFound();
  }
  
  return (
    <IngredientDetailPage
      ingredient={ingredient}
      relatedProducts={relatedProducts}
      relatedQuestions={relatedQuestions}
    />
  );
}

// 정적 생성 (30개만)
export async function generateStaticParams() {
  const ingredients = await getAllIngredients();
  
  return ingredients.map(ing => ({
    id: ing.id,
  }));
}
```

### 6-2. 컴포넌트

```typescript
// components/ingredients/IngredientDetailPage.tsx

export function IngredientDetailPage({
  ingredient,
  relatedProducts,
  relatedQuestions
}: Props) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <header className="mb-8">
        <div className="text-sm text-gray-500 mb-2">{ingredient.category}</div>
        <h1 className="text-4xl font-bold mb-2">
          {ingredient.nameKo} <span className="text-gray-400 text-2xl">({ingredient.nameEn})</span>
        </h1>
        <p className="text-xl text-primary">{ingredient.oneLiner}</p>
      </header>
      
      {/* 효과 */}
      <section className="mb-8 p-6 bg-gray-50 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">📌 이런 효과가 있어요</h2>
        <div className="grid grid-cols-2 gap-3">
          {ingredient.effects.map(effect => (
            <div key={effect} className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span>{effect}</span>
            </div>
          ))}
        </div>
      </section>
      
      {/* 상세 설명 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">💡 상세 설명</h2>
        <p className="text-lg leading-relaxed text-gray-700">
          {ingredient.description}
        </p>
      </section>
      
      {/* 사용 가이드 */}
      <section className="mb-8 p-6 bg-blue-50 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">🕐 사용 가이드</h2>
        <div className="space-y-3">
          <div>
            <strong>사용 시간:</strong> {ingredient.usageTiming}
          </div>
          <div>
            <strong>사용 빈도:</strong> {ingredient.usageFrequency}
          </div>
          <div>
            <strong>사용 TIP:</strong>
            <ul className="mt-2 space-y-2">
              {ingredient.usageTips.map(tip => (
                <li key={tip} className="flex items-start gap-2">
                  <span>💡</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      
      {/* 충돌 조합 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">⚠️ 주의할 조합</h2>
        <div className="space-y-4">
          {ingredient.conflictIngredients.map(conflict => (
            <ConflictCard key={conflict.ingredientId} conflict={conflict} />
          ))}
        </div>
      </section>
      
      {/* 시너지 조합 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">✅ 함께 쓰면 좋은 성분</h2>
        <div className="space-y-3">
          {ingredient.synergyIngredients.map(synergy => (
            <SynergyCard key={synergy.ingredientId} synergy={synergy} />
          ))}
        </div>
      </section>
      
      {/* 대표 제품 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">🛍️ 대표 제품</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatedProducts.slice(0, 6).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <Link
          href={`/products?ingredient=${ingredient.id}`}
          className="mt-4 inline-block text-primary font-semibold hover:underline"
        >
          더 많은 {ingredient.nameKo} 제품 보기 →
        </Link>
      </section>
      
      {/* Q&A */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">❓ 자주 묻는 질문</h2>
        <div className="space-y-3">
          {ingredient.relatedQuestions.map(q => (
            <QuestionLink key={q} question={q} />
          ))}
        </div>
      </section>
      
      {/* CTA */}
      <section className="text-center p-8 bg-gradient-to-r from-primary-light/20 to-pm-accent/20 rounded-2xl">
        <h3 className="text-2xl font-bold mb-4">
          내 루틴에 {ingredient.nameKo} 추가해보세요!
        </h3>
        <Link
          href="/analyze"
          className="inline-block px-8 py-4 bg-primary text-white rounded-full font-bold hover:bg-primary-light transition"
        >
          무료로 루틴 분석하기 →
        </Link>
      </section>
    </div>
  );
}
```

---

## 7. SEO 최적화

### 7-1. 메타데이터

```typescript
// app/ingredients/[id]/page.tsx

export async function generateMetadata({ params }: PageProps) {
  const ingredient = await getIngredient(params.id);
  
  return {
    title: `${ingredient.nameKo} - 효과, 사용법, 조합 가이드 | BARDA`,
    description: `${ingredient.oneLiner}. ${ingredient.description.slice(0, 150)}...`,
    keywords: ingredient.searchKeywords.join(', '),
    alternates: {
      canonical: `https://barda.app/ingredients/${ingredient.id}`,
    },
    openGraph: {
      title: `${ingredient.nameKo} 완전 정복`,
      description: ingredient.oneLiner,
      url: `https://barda.app/ingredients/${ingredient.id}`,
      images: [
        {
          url: `/og/ingredient-${ingredient.id}.png`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}
```

### 7-2. 구조화된 데이터 (JSON-LD)

```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: `${ingredient.nameKo} - 효과와 사용법`,
  description: ingredient.description,
  author: {
    '@type': 'Organization',
    name: 'BARDA',
  },
  publisher: {
    '@type': 'Organization',
    name: 'BARDA',
    logo: {
      '@type': 'ImageObject',
      url: 'https://barda.app/logo.png',
    },
  },
  datePublished: ingredient.addedAt,
  keywords: ingredient.searchKeywords.join(', '),
};
```

### 7-3. 내부 링크 전략

```
성분사전 → 관련 제품 → 루틴 분석
성분사전 → 충돌 성분 → 다른 성분 페이지
성분사전 → 관련 Q&A → 커뮤니티
성분사전 → 가이드 → 초보자 가이드
```

---

## 8. 관련 Q&A 자동 매칭

```typescript
// lib/api/ingredients.ts

export async function getRelatedQuestions(ingredientId: string) {
  const ingredient = await getIngredient(ingredientId);
  
  // Q&A에서 해당 성분이 언급된 질문 검색
  const { data } = await supabase
    .from('qa_questions')
    .select('*')
    .or(ingredient.searchKeywords.map(kw => 
      `title.ilike.%${kw}%,content.ilike.%${kw}%`
    ).join(','))
    .order('views_count', { ascending: false })
    .limit(5);
  
  return data || [];
}
```

---

## 9. 개발 체크리스트

### 9-1. 콘텐츠 작성 (Phase 1)

- [ ] 30개 성분 데이터 JSON 작성
  - [ ] 🔴 필수 10개 (레티놀, AHA, BHA, 비타민C, 나이아신아마이드, 히알루론산, 세라마이드, 시카, 벤조일퍼옥사이드, PHA)
  - [ ] 🟡 중요 12개
  - [ ] 🟢 권장 8개
- [ ] 충돌 정보 연결 (룰 엔진 기반)
- [ ] 시너지 정보 작성
- [ ] 관련 질문 리스트 작성

### 9-2. 시스템 구현 (Phase 1)

- [ ] DB 테이블 생성
- [ ] 템플릿 엔진 구현
- [ ] 대량 생성 스크립트 실행
- [ ] Next.js 동적 라우트 구현
- [ ] SEO 메타데이터 설정
- [ ] OG 이미지 자동 생성

### 9-3. 연동 (Phase 1.5)

- [ ] 제품 DB 연동 (성분별 제품 필터)
- [ ] Q&A 자동 매칭
- [ ] 룰 엔진 연동 (충돌 경고 → 성분사전)
- [ ] 검색 기능 (성분 검색)

---

## 10. 예상 시간

| 작업 | 시간 | 난이도 |
|---|---|---|
| 30개 성분 데이터 작성 | 8h | 🟡 |
| 템플릿 엔진 구현 | 2h | 🟢 |
| DB 스키마 + 임포트 | 1h | 🟢 |
| Next.js 라우트 구현 | 3h | 🟢 |
| 컴포넌트 UI | 4h | 🟡 |
| SEO 최적화 | 2h | 🟢 |
| 관련 시스템 연동 | 3h | 🟡 |
| **합계** | **23h** | |

---

## 11. 다음 단계

1. ✅ 핵심 10개 성분 우선 작성
2. 🔜 템플릿 엔진 구현 + 자동 생성
3. 🔜 SEO 검증 (네이버/구글 색인)
4. 🔜 사용자 피드백 수집
5. 🔜 나머지 20개 성분 추가
