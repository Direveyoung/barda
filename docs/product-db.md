# BARDA 제품 DB 전략

## 현황 (2026.02.19)
- **총 502개** 제품, **84개** 브랜드, **20개** 카테고리
- 소스: manual_v1 (300개, 초기), manual_v2 (202개, 확장)
- 모든 제품에 `key_ingredients`, `tags`, `source`, `verified` 완비
- concentration_level 설정: 126개 (25%)
- active_flags 설정: 23개

## 카테고리 분포
| 카테고리 | 수량 | 카테고리 | 수량 |
|---------|-----|---------|-----|
| cream | 63 | essence | 41 |
| sunscreen | 40 | toner | 34 |
| cleanser | 30 | ampoule | 29 |
| vitamin_c | 23 | mask_pack | 23 |
| toner_pad | 21 | sleeping_pack | 20 |
| spot_treatment | 19 | retinol | 19 |
| lotion | 19 | oil_cleanser | 18 |
| niacinamide | 18 | hyaluronic | 18 |
| eye_cream | 18 | aha | 17 |
| pha | 16 | bha | 16 |

## Product 인터페이스
```typescript
interface Product {
  id: string;
  brand: string;
  name: string;
  categoryId: string;
  key_ingredients: string[];    // 핵심 성분
  tags: string[];               // 올리영베스트, 안티에이징 등
  source: "manual_v1" | "manual_v2" | "user_submitted" | "crawled";
  verified: boolean;
  aliases?: string[];           // 검색 별칭
  active_flags?: string[];      // 추가 활성 성분 ID
  concentration_level?: "low" | "medium" | "high";
}
```

## 성분 DB (ingredients.ts)
- **30종** 핵심 성분 데이터
- 각 성분: `safetyScore`, `goodWith[]`, `avoidWith[]`, `skinTypes`
- AI 성분 분석 페이지에서 시너지/충돌 맵 생성에 사용
- 외부 API 데이터(배합한도, EWG등급, INCI명)로 보강 가능

## 검색 시스템 (3단계)
1. **정확 매칭**: 브랜드+이름 포함 여부
2. **별칭 매칭**: `aliases.ts`의 한글↔영문 변환
3. **퍼지 매칭**: Levenshtein 거리 기반 (threshold 0.3)

**테스트**: 27개 Vitest 테스트 (search.test.ts)

## 듀프 파인더
- 같은 카테고리 내 성분 유사도 계산
- 유사도 = key_ingredients 겹침 비율(70%) + tags 겹침 비율(30%)
- 가격대 추정: 4단계 (budget/mid/premium/luxury) × 카테고리별 범위
- 인기도 점수: tags 수 + verified + concentration 기반
- 배지: 가장유사 / Best Value / 인기
- 정렬: 유사도순 / 가격순 / 인기순

## 제품 후보 시스템
- 유저가 DB에 없는 제품 입력 시 → `product_candidates` 테이블 저장
- 동일 브랜드+이름 중복 제출 → `submit_count` 자동 증가
- 관리자 대시보드에서 승인/거부/대기 관리
- submit_count >= 3 → 자동 승격 파이프라인 대상
- submit_count 높은 제품 = 수요 높은 제품 → 우선 추가

## 검색 로그
- 모든 검색 쿼리를 `search_logs` 테이블에 기록
- 1.5초 디바운스 후 자동 로그
- 히트/미스 통계 → 관리자 대시보드에서 확인
- 미스 쿼리 TOP 20 → 별칭 확대 또는 제품 추가 근거

## 제품 추가 가이드
1. `src/data/products.ts` 열기
2. 해당 카테고리 섹션 찾기
3. 형식에 맞춰 추가:
```typescript
{ id: "brand-product-name", brand: "브랜드명", name: "제품명",
  categoryId: "category_id", key_ingredients: ["성분1", "성분2"],
  tags: ["태그1"], source: "manual_v2", verified: true },
```
4. `active_flags` 필요 시 추가 (예: 나이아신아마이드 함유 크림 → `["niacinamide"]`)
5. 빌드 확인: `npm run build`

## DB 확장 이력
| 버전 | 날짜 | 제품 수 | 브랜드 수 | 비고 |
|------|------|---------|----------|------|
| MVP-1 | 2026.02.14 | 186 | ~40 | 초기 DB |
| DB전략 | 2026.02.16 | 300 | ~60 | 전 카테고리 확장 |
| v1.1.0 | 2026.02.19 | 502 | 84 | +202개 (manual_v2) |

## 확장 계획
- 유저 제출 데이터 기반 점진적 확대 (submit_count 높은 순)
- 바코드 스캐너(Open Beauty Facts) → 미등록 제품 전성분 파악
- 외부 API(식약처/공공데이터포털) → 성분 메타데이터 자동 보강
- 커뮤니티 분석 → 인기 제품 자동 추출 → 후보 등록
