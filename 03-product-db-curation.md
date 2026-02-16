# BARDA — 제품 DB 200개 큐레이션 가이드
**작성일: 2026.02.16**  
**목표: 검색 히트율 70%+ 달성**

---

## 1. 개요

### 1-1. 목표
- **Phase 1 MVP**: 80~100개 (프로토타입 완료)
- **Phase 2**: 200개 (검색 히트율 70%+ 목표)
- **Phase 3**: 500개+ (자동 확장 파이프라인)

### 1-2. 핵심 원칙
> **제품 DB가 두꺼워질수록 UX가 좋아지고, 사용자가 늘면 데이터가 쌓이고, 커뮤니티·바이럴·리텐션이 자동으로 따라오는 구조**

제품 DB = 서비스의 진짜 해자(moat)

---

## 2. 제품 선정 기준

### 2-1. 우선순위 브랜드 (한국 시장)

#### Tier 1 — 필수 (각 브랜드 15~20개)
```
- 라운드랩 (Round Lab)
- 토리든 (Torriden)
- 아누아 (Anua)
- 코스알엑스 (COSRX)
- 이니스프리 (Innisfree)
```

#### Tier 2 — 중요 (각 브랜드 10~15개)
```
- 넘버즈인 (numbuzin)
- 에스트라 (ESTRA)
- 마녀공장 (Manyo Factory)
- 닥터지 (Dr.G)
- 클레어스 (Klairs)
- 구달 (GOODAL)
- VT 코스메틱
- 메디힐 (Mediheal)
```

#### Tier 3 — 프리미엄 (각 브랜드 5~10개)
```
- 라네즈 (Laneige)
- 벨리프 (Belif)
- 키엘 (Kiehl's)
- SK-II
- 설화수 (Sulwhasoo)
```

#### Tier 4 — 글로벌 (각 브랜드 3~5개)
```
- 라로슈포제 (La Roche-Posay)
- 더오디너리 (The Ordinary)
- 폴라초이스 (Paula's Choice)
- 세타필 (Cetaphil)
- 비오레 (Biore)
```

### 2-2. 카테고리별 목표 개수

| 카테고리 | 목표 개수 | 우선순위 |
|---|---|---|
| 클렌저 | 20개 | 🔴 높음 |
| 오일클렌저 | 10개 | 🔴 높음 |
| 토너 | 25개 | 🔴 높음 |
| 토너패드 | 15개 | 🟡 중간 |
| 에센스 | 20개 | 🔴 높음 |
| 세럼 | 30개 | 🔴 높음 |
| 크림 | 25개 | 🔴 높음 |
| 로션 | 15개 | 🟡 중간 |
| 선크림 | 20개 | 🔴 높음 |
| 레티놀 제품 | 10개 | 🔴 높음 |
| 비타민C 제품 | 10개 | 🔴 높음 |
| AHA/BHA 제품 | 8개 | 🟡 중간 |
| 아이크림 | 5개 | 🟢 낮음 |
| 수면팩 | 5개 | 🟢 낮음 |
| 시트마스크 | 5개 | 🟢 낮음 |
| **합계** | **200개** | |

---

## 3. 데이터 수집 방법

### 3-1. 옵션 A: 수동 큐레이션 (추천 ⭐)

#### 소스
1. **올리브영 베스트**: https://www.oliveyoung.co.kr/store/main/getBest.do
2. **화해 랭킹**: https://www.hwahae.co.kr/ranking
3. **글로우픽 랭킹**: https://www.glowpick.com/ranking

#### 프로세스
```
1. 올리브영 베스트 상위 100개 리스트 확보
2. 카테고리별 분류
3. 브랜드 중복 체크 (같은 브랜드 너무 많으면 분산)
4. JSON 포맷으로 정리
5. DB 임포트
```

**예상 시간: 6~8시간** (200개 기준, 제품당 2~3분)

---

### 3-2. 옵션 B: 반자동 크롤링 (Claude Code 활용)

#### 크롤링 타겟
- 올리브영 베스트 페이지
- 화해 랭킹 페이지 (API 없음, HTML 파싱)

#### 스크립트 구조

```python
# scripts/scrape-products.py

import requests
from bs4 import BeautifulSoup
import json

def scrape_oliveyoung_best():
    """
    올리브영 베스트 페이지에서 제품 정보 크롤링
    """
    url = "https://www.oliveyoung.co.kr/store/main/getBest.do"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    products = []
    
    # 제품 목록 파싱 (실제 HTML 구조에 맞게 수정 필요)
    items = soup.select('.prd_info')
    
    for item in items:
        try:
            brand = item.select_one('.brand').text.strip()
            name = item.select_one('.name').text.strip()
            category = infer_category(name)  # 자동 분류
            
            products.append({
                'brand': brand,
                'name': name,
                'categoryId': category,
                'source': 'oliveyoung'
            })
        except:
            continue
    
    return products

def infer_category(product_name):
    """
    제품명으로 카테고리 추론
    """
    name_lower = product_name.lower()
    
    if '클렌징' in name_lower or '폼' in name_lower:
        return 'cleanser'
    elif '토너' in name_lower:
        if '패드' in name_lower:
            return 'toner_pad'
        return 'toner'
    elif '세럼' in name_lower:
        return 'serum'
    elif '에센스' in name_lower:
        return 'essence'
    elif '크림' in name_lower:
        return 'cream'
    elif '선크림' in name_lower or 'spf' in name_lower:
        return 'sunscreen'
    elif '레티놀' in name_lower:
        return 'retinol'
    elif '비타민c' in name_lower or 'vitamin c' in name_lower:
        return 'vitamin_c'
    else:
        return 'etc'

def save_to_json(products, filename='products.json'):
    """
    JSON 파일로 저장
    """
    # ID 생성
    for i, product in enumerate(products, start=1):
        product['id'] = f'p{i:03d}'
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    
    print(f'✅ {len(products)}개 제품 저장 완료: {filename}')

if __name__ == '__main__':
    products = scrape_oliveyoung_best()
    save_to_json(products)
```

**주의사항:**
- 올리브영/화해 크롤링 정책 확인 필요
- robots.txt 준수
- 과도한 요청 금지 (rate limit)

**예상 시간: 2~3시간** (스크립트 작성 + 실행 + 검수)

---

### 3-3. 옵션 C: 공공 API 활용 (Phase 2)

#### 식약처 OpenAPI
- URL: https://www.mfds.go.kr/data/index.do
- 제공 데이터: 기능성 화장품 정보
- 활용: 레티놀, 나이아신아마이드 등 기능성 제품 자동 매칭

```python
# scripts/fetch-from-mfds.py

import requests

def fetch_functional_cosmetics(ingredient='레티놀'):
    """
    식약처 API에서 기능성 화장품 검색
    """
    api_key = 'YOUR_API_KEY'
    url = f'http://openapi.mfds.go.kr/...'
    
    params = {
        'serviceKey': api_key,
        'ingredient': ingredient,
        'numOfRows': 100
    }
    
    response = requests.get(url, params=params)
    # ... 파싱
```

---

## 4. 제품 데이터 구조

### 4-1. JSON 스키마

```typescript
interface Product {
  id: string;                    // "p001"
  name: string;                  // "라운드랩 1025 독도 토너"
  brand: string;                 // "라운드랩"
  categoryId: string;            // "toner"
  tags: string[];                // ["기초", "토너", "진정"]
  
  // 선택 필드 (Phase 2+)
  ingredients?: string[];        // ["판테놀", "알란토인", ...]
  volume?: string;               // "200ml"
  price?: number;                // 17800
  imageUrl?: string;             // "https://..."
  productUrl?: string;           // 올리브영 링크
  
  // 메타
  source?: string;               // "oliveyoung" | "manual" | "user"
  addedAt?: string;              // "2026-02-16"
}
```

### 4-2. 초기 데이터 예시 (products.json)

```json
[
  {
    "id": "p001",
    "name": "라운드랩 1025 독도 토너",
    "brand": "라운드랩",
    "categoryId": "toner",
    "tags": ["기초", "토너", "진정"]
  },
  {
    "id": "p002",
    "name": "토리든 다이브인 세럼",
    "brand": "토리든",
    "categoryId": "serum",
    "tags": ["기초", "세럼", "보습"]
  },
  {
    "id": "p003",
    "name": "아누아 어성초 77% 수딩 토너",
    "brand": "아누아",
    "categoryId": "toner",
    "tags": ["기초", "토너", "진정", "트러블"]
  },
  {
    "id": "p004",
    "name": "코스알엑스 레티놀 0.1 크림",
    "brand": "코스알엑스",
    "categoryId": "retinol",
    "tags": ["기능성", "레티놀", "주름개선"]
  },
  {
    "id": "p005",
    "name": "이니스프리 그린티 클렌징폼",
    "brand": "이니스프리",
    "categoryId": "cleanser",
    "tags": ["기초", "클렌저"]
  }
]
```

---

## 5. DB 임포트

### 5-1. Supabase 테이블

```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category_id TEXT NOT NULL,
  tags TEXT[],
  ingredients TEXT[],
  volume TEXT,
  price INTEGER,
  image_url TEXT,
  product_url TEXT,
  source TEXT DEFAULT 'manual',
  added_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 검색 최적화
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('simple', name || ' ' || brand)
  ) STORED
);

-- 검색 인덱스
CREATE INDEX idx_products_search ON products USING GIN(search_vector);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_category ON products(category_id);
```

### 5-2. 임포트 스크립트

```typescript
// scripts/import-products.ts

import { createClient } from '@supabase/supabase-js';
import productsData from './products.json';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function importProducts() {
  console.log(`📦 ${productsData.length}개 제품 임포트 시작...`);
  
  const { data, error } = await supabase
    .from('products')
    .upsert(productsData, { onConflict: 'id' });
  
  if (error) {
    console.error('❌ 임포트 실패:', error);
    return;
  }
  
  console.log('✅ 임포트 완료!');
  
  // 통계
  const stats = productsData.reduce((acc, p) => {
    acc[p.categoryId] = (acc[p.categoryId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\n📊 카테고리별 개수:');
  Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}개`);
    });
}

importProducts();
```

**실행:**
```bash
npx ts-node scripts/import-products.ts
```

---

## 6. 검색 API 구현

### 6-1. API 엔드포인트

```typescript
// app/api/products/search/route.ts

import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  
  if (query.length === 0) {
    return Response.json({ products: [] });
  }
  
  const supabase = createClient();
  
  // Full-text search
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, brand, category_id')
    .textSearch('search_vector', query, {
      type: 'websearch',
      config: 'simple'
    })
    .limit(8);
  
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  
  return Response.json({ products });
}
```

### 6-2. 클라이언트 Hook

```typescript
// lib/hooks/useProductSearch.ts

import { useState, useEffect } from 'react';
import { debounce } from 'lodash';

export function useProductSearch(query: string) {
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (query.length === 0) {
      setResults([]);
      return;
    }
    
    const search = debounce(async () => {
      setIsLoading(true);
      
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
      const { products } = await res.json();
      
      setResults(products);
      setIsLoading(false);
    }, 300);
    
    search();
    
    return () => search.cancel();
  }, [query]);
  
  return { results, isLoading };
}
```

---

## 7. 검색 히트율 추적

### 7-1. 로깅 시스템

```sql
-- 검색 로그 테이블
CREATE TABLE product_search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  query TEXT NOT NULL,
  result_count INTEGER NOT NULL,
  was_selected BOOLEAN DEFAULT false,
  selected_product_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_logs_query ON product_search_logs(query);
CREATE INDEX idx_search_logs_created ON product_search_logs(created_at DESC);
```

### 7-2. 검색 로깅 API

```typescript
// app/api/products/search/route.ts

export async function GET(request: Request) {
  // ... 검색 로직
  
  // 로그 저장
  await supabase.from('product_search_logs').insert({
    user_id: userId,
    query: query,
    result_count: products.length,
  });
  
  return Response.json({ products });
}
```

### 7-3. 히트율 계산 쿼리

```sql
-- 검색 히트율 (결과 1개 이상)
SELECT 
  COUNT(CASE WHEN result_count > 0 THEN 1 END) * 100.0 / COUNT(*) AS hit_rate
FROM product_search_logs
WHERE created_at > NOW() - INTERVAL '7 days';

-- 선택율 (사용자가 실제로 클릭한 비율)
SELECT 
  COUNT(CASE WHEN was_selected THEN 1 END) * 100.0 / COUNT(*) AS selection_rate
FROM product_search_logs
WHERE created_at > NOW() - INTERVAL '7 days';

-- 검색량 많은 키워드 (DB 보강 우선순위)
SELECT 
  query, 
  COUNT(*) as search_count,
  AVG(result_count) as avg_results
FROM product_search_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY query
ORDER BY search_count DESC
LIMIT 20;
```

---

## 8. 사용자 입력 데이터 활용

### 8-1. 직접 입력 제품 저장

```sql
-- 사용자가 직접 입력한 제품 (검색에 없을 때)
CREATE TABLE user_input_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  product_name TEXT NOT NULL,
  brand TEXT,
  category_id TEXT NOT NULL,
  input_count INTEGER DEFAULT 1,        -- 여러 사용자가 입력한 횟수
  is_approved BOOLEAN DEFAULT false,    -- 관리자 승인 여부
  approved_product_id TEXT,             -- 승인 후 products 테이블 ID
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 집계 인덱스
CREATE INDEX idx_user_input_products_count 
  ON user_input_products(input_count DESC);
```

### 8-2. 자동 승격 파이프라인

```typescript
// scripts/promote-user-products.ts

async function promotePopularUserProducts() {
  // 3회 이상 입력된 제품 자동 승격
  const { data: candidates } = await supabase
    .from('user_input_products')
    .select('*')
    .gte('input_count', 3)
    .eq('is_approved', false)
    .order('input_count', { ascending: false });
  
  for (const candidate of candidates) {
    // 1. 실제 제품인지 검증 (올리브영/화해 API로 확인)
    const isValid = await verifyProduct(candidate.product_name, candidate.brand);
    
    if (!isValid) continue;
    
    // 2. products 테이블에 추가
    const newProductId = `p${Date.now()}`;
    await supabase.from('products').insert({
      id: newProductId,
      name: candidate.product_name,
      brand: candidate.brand,
      category_id: candidate.category_id,
      source: 'user_promoted'
    });
    
    // 3. user_input_products 업데이트
    await supabase
      .from('user_input_products')
      .update({
        is_approved: true,
        approved_product_id: newProductId
      })
      .eq('id', candidate.id);
    
    console.log(`✅ ${candidate.product_name} 승격 완료`);
  }
}
```

---

## 9. 관리자 대시보드

### 9-1. 화면 구성

```
┌─────────────────────────────────────────┐
│ BARDA 관리자 — 제품 DB 관리              │
├─────────────────────────────────────────┤
│                                         │
│  📊 통계                                │
│  ┌─────────┬─────────┬─────────┐       │
│  │ 전체    │ 검색    │ 히트율  │       │
│  │ 247개   │ 1,234회 │ 73%    │       │
│  └─────────┴─────────┴─────────┘       │
│                                         │
│  📈 카테고리별 현황                      │
│  ┌──────────────────────────────┐      │
│  │ 토너: 28개 ████████████ 70%  │      │
│  │ 세럼: 35개 ████████████ 88%  │      │
│  │ 크림: 22개 ████████     55%  │      │
│  └──────────────────────────────┘      │
│                                         │
│  🔥 검색 많은 미등록 제품 (승격 후보)    │
│  ┌──────────────────────────────┐      │
│  │ 1. 바이오힐보 판시크림 (12회) │      │
│  │    [자세히] [승격하기]        │      │
│  │ 2. 메디큐브 레티놀 (9회)      │      │
│  │    [자세히] [승격하기]        │      │
│  └──────────────────────────────┘      │
│                                         │
│  🔍 최근 검색 키워드 (히트율 낮음)       │
│  ┌──────────────────────────────┐      │
│  │ "센텔리안24 마데카크림" (0건) │      │
│  │ "스킨1004 토너" (0건)         │      │
│  └──────────────────────────────┘      │
└─────────────────────────────────────────┘
```

### 9-2. 구현

```typescript
// app/admin/products/page.tsx

export default async function AdminProductsPage() {
  const stats = await getProductStats();
  const topMissing = await getTopMissingProducts();
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">제품 DB 관리</h1>
      
      <StatsCards stats={stats} />
      
      <CategoryBreakdown categories={stats.byCategory} />
      
      <PromotionCandidates candidates={topMissing} />
      
      <MissingSearches searches={stats.missingSearches} />
    </div>
  );
}
```

---

## 10. 로드맵 & 체크리스트

### 10-1. Phase 1: 기본 DB (Week 2~3)

- [ ] 옵션 선택 (A: 수동 / B: 크롤링)
- [ ] 200개 제품 리스트 확보
- [ ] JSON 포맷 정리
- [ ] Supabase 테이블 생성
- [ ] 임포트 스크립트 실행
- [ ] 검색 API 구현
- [ ] 검색 UI 테스트
- [ ] 히트율 70%+ 달성 확인

### 10-2. Phase 2: 자동 확장 (Month 2~3)

- [ ] 검색 로그 시스템 구축
- [ ] 사용자 입력 제품 테이블 구축
- [ ] 자동 승격 파이프라인 개발
- [ ] 관리자 대시보드 구현
- [ ] 주간 자동 리포트 (히트율, 승격 후보)

### 10-3. Phase 3: 고도화 (Month 6+)

- [ ] 식약처 API 연동
- [ ] Open Beauty Facts API 연동
- [ ] 전성분 파싱 + OCR
- [ ] AI 기반 카테고리 자동 분류
- [ ] 제품 스캐너 (사진 → 제품 인식)

---

## 11. 예상 시간 & 리소스

| 작업 | 방법 | 시간 | 난이도 |
|---|---|---|---|
| 제품 리스트 확보 | 올리브영 베스트 수동 | 4h | 🟢 |
| JSON 정리 | 스프레드시트 + 변환 | 2h | 🟢 |
| 크롤링 스크립트 (옵션) | Python | 3h | 🟡 |
| DB 테이블 생성 | SQL | 0.5h | 🟢 |
| 임포트 스크립트 | TypeScript | 1h | 🟢 |
| 검색 API | Next.js API | 2h | 🟢 |
| 검색 UI | React | 2h | 🟢 |
| 로깅 시스템 | Supabase | 1h | 🟢 |
| 관리자 대시보드 | Next.js | 4h | 🟡 |
| **합계** | | **19.5h** | |

**예산 (옵션):**
- 크롤링 대행: 없음 (직접 구현)
- 데이터 검수 외주: 없음 (초기는 직접)
- 식약처 API: 무료
- Open Beauty Facts API: 무료

---

## 12. 품질 관리

### 12-1. 검수 체크리스트

제품 추가 시 확인 사항:
- [ ] 브랜드명 정확한가?
- [ ] 제품명이 공식 명칭인가?
- [ ] 카테고리가 올바른가?
- [ ] 중복 제품이 없는가?
- [ ] 태그가 적절한가?

### 12-2. 품질 지표

```typescript
// scripts/quality-check.ts

async function checkProductQuality() {
  // 1. 중복 제품 체크
  const duplicates = await findDuplicateProducts();
  
  // 2. 카테고리 미지정 체크
  const uncategorized = await findUncategorizedProducts();
  
  // 3. 브랜드 오타 체크
  const typos = await findBrandTypos();
  
  console.log(`❌ 중복: ${duplicates.length}개`);
  console.log(`❌ 미분류: ${uncategorized.length}개`);
  console.log(`❌ 오타 의심: ${typos.length}개`);
}
```

---

## 13. 다음 단계

1. ✅ 제품 DB 200개 완료
2. 🔜 검색 히트율 모니터링 시작
3. 🔜 사용자 피드백 수집
4. 🔜 자동 확장 파이프라인 준비
5. 🔜 500개 확장 계획
