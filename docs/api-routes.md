# BARDA API 라우트 명세

## 인증 불필요 (public)

### POST /api/search-logs
검색 쿼리 로그 기록.
```json
// Request
{ "query": "이니스프리", "results_count": 5, "selected_product_id": "innisfree-green-tea" }

// Response
{ "ok": true }
```

### GET /api/search-logs?type=stats
검색 통계 (총 검색, 미스, 히트율).
```json
// Response
{ "totalSearches": 150, "missedSearches": 30, "hitRate": 80 }
```

### GET /api/search-logs?type=missed
미스 쿼리 TOP 20.
```json
// Response
{ "missed": [{ "query": "닥터지", "count": 12 }, ...] }
```

### POST /api/product-candidates
미등록 제품 후보 제출. 동일 brand+name 중복 시 submit_count 증가.
```json
// Request
{ "brand": "닥터지", "name": "레드 블레미쉬 클리어 크림", "category_guess": "cream" }

// Response
{ "ok": true }
```

### GET /api/product-candidates?status=pending
제품 후보 목록 조회. status 필터 옵션: pending, approved, rejected.
```json
// Response
{ "candidates": [{ "id": "uuid", "brand": "닥터지", "name": "...", "submit_count": 5, "status": "pending" }] }
```

### PATCH /api/product-candidates
후보 상태 변경 (관리자용).
```json
// Request
{ "id": "uuid", "status": "approved" }
```

### POST /api/events
퍼널 이벤트 배치 저장.
```json
// Request
{ "events": [{ "event_name": "wizard_start", "metadata": {} }] }
```

### POST /api/feedback
충돌 카드 피드백 저장.
```json
// Request
{ "routine_id": "uuid", "conflict_rule_id": "R1", "is_helpful": true }
```

## 인증 선택 (optional auth)

### GET /api/routines?sort=latest&page=1&limit=10&skinType=dry
루틴 피드 목록. 피부타입/고민 필터 지원.

### POST /api/routines
루틴 공유 (로그인 필요).
```json
// Request
{ "products": [...], "skinType": "dry", "concerns": ["wrinkle"], "score": 85, "rating": 4, "comment": "만족!" }
```

### POST /api/routines/[id]/like
좋아요 토글 (로그인 필요).

### GET /api/routines/[id]/comments
댓글 목록 조회.

### POST /api/routines/[id]/comments
댓글 작성 (로그인 필요).
```json
// Request
{ "content": "좋은 루틴이에요!" }
```

### DELETE /api/routines/[id]/comments
댓글 삭제 (작성자만).
```json
// Request
{ "comment_id": "uuid" }
```

## 결제

### POST /api/payments/confirm
토스 결제 확인 + DB 저장 + is_paid 업데이트.
```json
// Request
{ "paymentKey": "toss_key", "orderId": "BARDA-...", "amount": 9900 }
```

## 관리자

### GET /api/admin/stats
통계 집계 (totalUsers, totalAnalyses, totalPayments, totalRevenue, searchHitRate, recentSearchMisses, funnelData, productCandidates).

## 퍼널 이벤트 목록
```
wizard_start, skin_type_selected, concerns_selected,
product_search, product_added, analysis_started,
result_viewed, paywall_shown, payment_initiated,
payment_completed, feedback_submitted
```
