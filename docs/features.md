# BARDA 기능 인벤토리 + 구현 상태

## 구현 완료 기능

### MVP-1 (2026.02.14)
| 기능 | 파일 | 설명 |
|------|------|------|
| 루틴 분석 엔진 | `lib/analysis.ts` | 15 충돌 규칙, 농도/피부타입 보정 |
| 3단계 검색 | `lib/search.ts` | 정확→별칭→Levenshtein |
| 제품 DB | `data/products.ts` | 300개, 20 카테고리 |
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

---

## 미구현 (Phase 3+)
| 기능 | 우선순위 | 복잡도 | 비고 |
|------|---------|--------|------|
| Q&A 섹션 | 중간 | 중 | 피드 질문 태그로 대체 중 |
| 제품 스캐너 | 낮음 | 대 | 사진/바코드 인식 |
| AI 피부 분석 | 낮음 | 대 | 프리미엄 정당성 |
| 전성분 파싱 | 낮음 | 대 | OCR → 성분 매칭 |
| 팔로우/팔로워 | 낮음 | 중 | 유저 1만+ 이후 |
