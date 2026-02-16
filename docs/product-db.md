# BARDA 제품 DB 전략

## 현황 (2026.02.16)
- **총 300개** 제품, **20개** 카테고리
- 모든 제품에 `key_ingredients`, `tags`, `source`, `verified` 완비
- 누락률: key_ingredients 0%, tags 0%, source 0%

## 카테고리 분포
| 카테고리 | 수량 | 카테고리 | 수량 |
|---------|-----|---------|-----|
| cream | 43 | sunscreen | 25 |
| essence | 24 | toner | 23 |
| cleanser | 18 | vitamin_c | 16 |
| ampoule | 15 | toner_pad | 14 |
| mask_pack | 14 | retinol | 13 |
| eye_cream | 13 | lotion | 12 |
| niacinamide | 11 | hyaluronic | 11 |
| oil_cleanser | 10 | sleeping_pack | 9 |
| spot_treatment | 9 | aha | 7 |
| bha | 7 | pha | 6 |

## Product 인터페이스
```typescript
interface Product {
  id: string;
  brand: string;
  name: string;
  categoryId: string;
  key_ingredients: string[];    // 핵심 성분
  tags: string[];               // 올리영베스트, 안티에이징 등
  source: "manual_v1" | "user_submitted" | "crawled";
  verified: boolean;
  aliases?: string[];           // 검색 별칭
  active_flags?: string[];      // 추가 활성 성분 ID
  concentration_level?: "low" | "medium" | "high";
}
```

## 검색 시스템 (3단계)
1. **정확 매칭**: 브랜드+이름 포함 여부
2. **별칭 매칭**: `aliases.ts`의 한글↔영문 변환
3. **퍼지 매칭**: Levenshtein 거리 기반 (threshold 0.3)

## 제품 후보 시스템
- 유저가 DB에 없는 제품 입력 시 → `product_candidates` 테이블 저장
- 동일 브랜드+이름 중복 제출 → `submit_count` 자동 증가
- 관리자 대시보드에서 승인/거부/대기 관리
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
  tags: ["태그1"], source: "manual_v1", verified: true },
```
4. `active_flags` 필요 시 추가 (예: 나이아신아마이드 함유 크림 → `["niacinamide"]`)
5. 빌드 확인: `npm run build`

## 확장 계획
- 유저 제출 데이터 기반 점진적 확대 (submit_count 높은 순)
- Phase 3: 전성분 파싱 (OCR) → 자동 DB 확장
- Phase 3: 바코드/사진 스캐너 → 제품 자동 인식
