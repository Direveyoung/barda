# BARDA 기능 인벤토리 + 구현 상태

## 구현 완료 기능

### MVP-1 (2026.02.14)
| 기능 | 파일 | 설명 |
|------|------|------|
| 루틴 분석 엔진 | `lib/analysis.ts` | 15 충돌 규칙, 농도/피부타입 보정 |
| 3단계 검색 | `lib/search.ts` | 정확→별칭→Levenshtein |
| 제품 DB | `data/products.ts` | 502개, 20 카테고리, 83 브랜드 |
| 루틴 점수 | `lib/analysis.ts` | 100점 만점 (감점+가점) |
| 7일 캘린더 | `lib/analysis.ts` | 레티놀/각질 자동 분배 |
| AM/PM TIP | `lib/analysis.ts` | 피부타입×시간대 가이드 |
| 결과 UI | `components/ResultView.tsx` | 점수링, 충돌카드, 순서, 캘린더 |

### MVP-2 (2026.02.15)
| 기능 | 파일 | 설명 |
|------|------|------|
| Supabase Auth | `contexts/AuthContext.tsx` | 이메일 + Google OAuth |
| 블러/페이월 | `components/BlurOverlay.tsx` | 충돌2+, 캘린더, 팁 블러 |
| 토스 결제 | `lib/payments.ts` | 테스트키 플레이스홀더 |
| 커뮤니티 피드 | `app/feed/` | 루틴 공유 + 좋아요 |
| 피드백 | `components/FeedbackButtons.tsx` | 충돌 카드 👍/👎 |
| 퍼널 추적 | `lib/events.ts` | 11개 이벤트 배치 전송 |
| 관리자 | `app/admin/page.tsx` | 통계 + 후보관리 + 검색분석 |

### Phase 1 (2026.02.15)
| 기능 | 파일 | 설명 |
|------|------|------|
| 홈 화면 분기 | `app/page.tsx` | 비로그인:랜딩 / 로그인:체크리스트 |
| 5탭 네비 | `components/BottomNav.tsx` | 홈/피드/분석/가이드/마이 |
| 매일 체크리스트 | `app/page.tsx` | AM/PM 체크오프 + 스트릭 |
| 스킨 다이어리 | `app/page.tsx` | 이모지 + 한줄 메모 |
| 루틴 상세 | `app/feed/[id]/` | OG 메타 + 댓글 스레드 |
| 댓글 시스템 | `api/routines/[id]/comments` | CRUD |

### Phase 1.5 (2026.02.15)
| 기능 | 파일 | 설명 |
|------|------|------|
| 피드 검색/필터 | `app/feed/FeedClient.tsx` | 피부타입·고민별 필터 |
| 이 루틴 따라하기 | `app/feed/[id]/RoutineDetailClient.tsx` | 자동 제품 입력 |
| 프로필 설정 | `app/mypage/profile/page.tsx` | 닉네임 + 피부타입 배지 |
| OG 메타/공유 | `app/feed/[id]/page.tsx` | 루틴 점수 카드 공유 |
| 알림 | `components/NotificationBell.tsx` | 좋아요/댓글 알림 |

### Phase 2 (2026.02.15)
| 기능 | 파일 | 설명 |
|------|------|------|
| 맞춤 제품추천 | `app/page.tsx` | 피부타입×고민 기반 |
| 성분 가이드 30종 | `app/guide/page.tsx` | 핵심 성분 상세 |
| 7일 챌린지 | `app/challenge/page.tsx` | 캘린더 체크인 + 배지 |
| 인기 루틴 랭킹 | `app/ranking/page.tsx` | 피부타입별 TOP 10 |

### DB 전략 (2026.02.16)
| 기능 | 파일 | 설명 |
|------|------|------|
| 제품 300개 확장 | `data/products.ts` | 전 제품 메타데이터 완비 |
| 검색 로그 | `api/search-logs/route.ts` | 히트/미스 통계 |
| 제품 후보 관리 | `api/product-candidates/route.ts` | 유저 제출 → 관리자 승인 |
| 직접 입력 UI | `components/ProductStep.tsx` | 미등록 제품 입력 폼 |

### 연동 강화 (2026.02.16)
| 기능 | 파일 | 설명 |
|------|------|------|
| 체크리스트↔캘린더 | `app/page.tsx` | "오늘은 레티놀 Day" 배지 |
| 다이어리↔챌린지 | `app/page.tsx` + `app/challenge/page.tsx` | 자동 완료 연동 |

### 벤치마킹 기능 (2026.02.16)
| 기능 | 파일 | 설명 |
|------|------|------|
| 날씨 기반 루틴 | `lib/weather.ts` + `app/page.tsx` | Open-Meteo API, 기온/습도/UV 기반 TIP |
| 제품 서랍/트래커 | `app/drawer/page.tsx` | 보유제품 관리 + 개봉일 + 사용완료 |
| 듀프 파인더 | `app/dupe/page.tsx` | 성분 유사도 기반 대안 제품 찾기 |

### 외부 API + 자동 학습 (2026.02.16)
| 기능 | 파일 | 설명 |
|------|------|------|
| 식약처 OpenAPI | `lib/external-apis.ts` | 기능성화장품 성분 조회 (배합한도/규제) |
| Open Beauty Facts | `lib/external-apis.ts` | 글로벌 K-뷰티 전성분 DB (바코드/검색) |
| 공공데이터포털 성분사전 | `lib/external-apis.ts` | 한글↔INCI 성분명 매핑 + EWG 등급 |
| API 헬스체크 | `api/admin/external-apis/route.ts` | 3종 API 가용성 확인 + 테스트 쿼리 |
| 자동 승격 파이프라인 | `lib/pipeline.ts` | submit_count >= 3 후보 자동 승격 |
| 검색 미스 리포트 | `lib/pipeline.ts` | 주간 Top 20 미스 쿼리 + 히트율 |
| 커뮤니티 분석 | `lib/pipeline.ts` | 인기 제품 추출 + 피부타입별 다양성 |
| 주간 종합 리포트 | `lib/pipeline.ts` | 검색+후보+커뮤니티 종합 현황 |
| 파이프라인 API | `api/admin/pipeline/route.ts` | 관리자 파이프라인 실행 엔드포인트 |
| 관리자 대시보드 강화 | `app/admin/page.tsx` | 3탭 (개요/파이프라인/외부API) + 아키텍처 다이어그램 |

### Phase 3: AI 성분 분석 + 바코드 스캐너 (2026.02.19)
| 기능 | 파일 | 설명 |
|------|------|------|
| 성분 DB 30종 | `data/ingredients.ts` | safetyScore, goodWith/avoidWith, skinTypes |
| AI 성분 분석 | `app/ingredient-analysis/page.tsx` | 성분별 상세, 시너지/충돌 맵, 맞춤 추천 |
| 바코드 스캐너 | `app/scanner/page.tsx` | 카메라 + 수동입력, OBF 연동 |
| 바코드 API | `api/barcode/route.ts` | Open Beauty Facts 바코드 조회 |

### v1.1.0: 테스트 + API 타입 강화 (2026.02.19)
| 기능 | 파일 | 설명 |
|------|------|------|
| 제품 DB 502개 | `data/products.ts` | 83개 브랜드, 20개 카테고리 |
| Vitest 71개 테스트 | `lib/__tests__/` | analysis(44) + search(27) |
| API 타입 중앙화 | `lib/api-types.ts` | 12개 API 타입 + 7개 validation 헬퍼 |

### v1.2.0: 고도화 + 프로덕션 연동 (2026.02.19)
| 기능 | 파일 | 설명 |
|------|------|------|
| 날씨 7일 예보 | `lib/weather.ts` | DailyForecast + 바람 + 루틴 어드바이스 |
| 듀프 가격 비교 | `app/dupe/page.tsx` | 4단계 가격대, 절약 금액, 인기도 |
| 듀프 배지/정렬 | `app/dupe/page.tsx` | 가장유사/BestValue/인기 + 3종 정렬 |
| 외부 API 캐싱 | `lib/external-apis.ts` | 5분 TTL + 재시도(2회, 백오프) |
| 통합 성분 조회 | `lib/external-apis.ts` | `lookupIngredientEnriched()` 병렬 |
| 성분 조회 API | `api/ingredients/lookup/route.ts` | 사용자 대면 외부 성분 데이터 API |
| 성분 분석 보강 | `app/ingredient-analysis/page.tsx` | 외부 API 데이터 자동 표시 |

### v1.3.0: Zod 입력 검증 + XSS 방지 (2026.02.20)
| 기능 | 파일 | 설명 |
|------|------|------|
| Zod 스키마 검증 | `lib/api-types.ts` | 8개 Zod 스키마 + `parseWithZod()` 헬퍼 |
| XSS 새니타이저 | `lib/api-types.ts` | `sanitizeString()` HTML 이스케이프 |
| 결제 멱등성 | `api/payments/confirm` | orderId 중복 방지 (409) |
| API 전체 검증 교체 | 모든 POST/PATCH API | 수동 체크 → Zod 스키마 |

### v1.4.0: SVG 아이콘 시스템 (2026.02.20)
| 기능 | 파일 | 설명 |
|------|------|------|
| Icon 컴포넌트 | `components/Icon.tsx` | 90+ 인라인 SVG 아이콘 |
| 이모지 전면 교체 | 13개 파일 | 75+ 이모지 → SVG 아이콘 |

### v1.5.0: PC 데스크톱 셸 + 랜딩 리디자인 (2026.02.20)
| 기능 | 파일 | 설명 |
|------|------|------|
| DesktopShell | `components/DesktopShell.tsx` | PC 폰 목업 + QR 사이드바 |
| 랜딩 리디자인 | `app/page.tsx` | 화해/파우더룸 스타일 (히어로, 카테고리, 기능카드) |
| 테스트 로그인 | `app/auth/login/page.tsx` | test@barda.dev 원클릭 (프리미엄 포함) |

---

## 미구현 (Phase 4+)
| 기능 | 우선순위 | 복잡도 | 비고 |
|------|---------|--------|------|
| Q&A 섹션 | 중간 | 중 | Phase 5 소셜 확장 |
| 팔로우/팔로워 | 낮음 | 중 | 유저 규모 확대 후 |
| 커머스 연동 | 중간 | 중 | 올리브영/쿠팡 어필리에이트 |
| 데이터 리포트 B2B | 낮음 | 대 | 트렌드 분석 유료 리포트 |
| 프리미엄 구독 | 중간 | 소 | 월 3,900원 (기존 원타임 외 추가) |
