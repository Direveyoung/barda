/* ─── Shared Constants ─── */
/* 프로젝트 전역에서 사용되는 상수 중앙 관리 */

/* ── 피부타입 / 고민 라벨 ── */

export const SKIN_TYPE_LABEL: Record<string, string> = {
  dry: "건성",
  oily: "지성",
  combination: "복합성",
  sensitive: "민감성",
  normal: "중성",
};

export const CONCERN_LABEL: Record<string, string> = {
  acne: "여드름",
  wrinkle: "주름",
  pigmentation: "색소침착",
  pigment: "잡티·색소침착",
  dryness: "건조",
  sensitivity: "민감",
  pore: "모공",
  blackhead: "블랙헤드",
  whitehead: "화이트헤드",
  redness: "홍조",
  darkCircle: "다크서클",
  dullness: "칙칙함·톤업",
};

/* ── 결제 ── */

export const PAYMENT = {
  PREMIUM_PRICE: 9900,
  CURRENCY: "KRW",
  ORDER_NAME: "BARDA 프리미엄 분석",
  DISPLAY_TEXT: "₩9,900 일회성 결제",
} as const;

/* ── 포인트 시스템 ── */

export const POINT_ACTIONS = {
  checkin_am:    { points: 10,  dailyLimit: 1, label: "AM 루틴 체크인" },
  checkin_pm:    { points: 10,  dailyLimit: 1, label: "PM 루틴 체크인" },
  diary:         { points: 10,  dailyLimit: 1, label: "다이어리 기록" },
  barcode_scan:  { points: 50,  dailyLimit: 3, label: "바코드 등록" },
  ingredient_input: { points: 100, dailyLimit: 2, label: "전성분 입력" },
  feedback:      { points: 10,  dailyLimit: 5, label: "충돌 피드백" },
  routine_share: { points: 30,  dailyLimit: 1, label: "루틴 공유" },
  streak_bonus:  { points: 300, dailyLimit: 1, label: "30일 연속 보너스" },
} as const;

export type PointActionType = keyof typeof POINT_ACTIONS;

export const POINT_DAILY_CAP = 100;

export const POINT_ACTION_ICON: Record<string, string> = {
  checkin_am: "sun",
  checkin_pm: "moon",
  diary: "memo",
  barcode_scan: "camera",
  ingredient_input: "beaker",
  feedback: "thumbs-up",
  routine_share: "share",
  streak_bonus: "fire",
  redeem: "money",
};

/* ── localStorage 키 ── */

export const STORAGE_KEYS = {
  WEATHER: "barda_weather",
  SESSION_ID: "barda_session_id",
  DEV_UNLOCK: "barda_dev_unlock",
  DRAWER: "barda_drawer",
  PROFILE: "barda_profile",
  CHALLENGE: "barda_challenge",
  MIGRATED: "barda_migrated_v3",
  POINTS_BALANCE: "barda_points_balance",
  LAST_ROUTINE: "barda_last_routine",
  notifications: (userId: string) => `barda_notifications_${userId}`,
  diary: (date: string) => `barda_diary_${date}`,
  checks: (date: string) => `barda_checks_${date}`,
} as const;

/* ── 커뮤니티/카카오톡 ── */

export const COMMUNITY = {
  KAKAO_OPEN_CHAT_URL: process.env.NEXT_PUBLIC_KAKAO_OPEN_CHAT_URL ?? "https://open.kakao.com/o/gXXXXXXX",
  CLINIC_LIST_URL: process.env.NEXT_PUBLIC_CLINIC_LIST_URL ?? "https://clinic-list.vercel.app/",
} as const;

/* ── 다이어리 컨디션 점수 매핑 ── */

export const CONDITION_SCORE: Record<string, number> = {
  good: 5,
  normal: 4,
  meh: 3,
  bad: 2,
  terrible: 1,
};

export const CONDITION_LABEL: Record<string, string> = {
  good: "좋음",
  normal: "보통",
  meh: "그저그럭",
  bad: "별로",
  terrible: "나쁨",
};

/* ── 외부 API ── */

export const API_URLS = {
  MFDS: "https://apis.data.go.kr/1471000/CosmeFnctnlMaterialService/getCosmeFnctnlMaterialList",
  OBF: "https://world.openbeautyfacts.org",
  INGREDIENT_DICT: "https://apis.data.go.kr/1471000/CsmtcsIngdService/getCsmtcsIngdInforList",
  WEATHER: "https://api.open-meteo.com/v1/forecast",
  AIR_QUALITY: "https://air-quality-api.open-meteo.com/v1/air-quality",
  TOSS_SDK: "https://js.tosspayments.com/v1/payment",
  TOSS_CONFIRM: "https://api.tosspayments.com/v1/payments/confirm",
} as const;

/* ── 앱 URL ── */

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://barda.vercel.app";

export const API_TIMEOUT_MS = 8000;
export const HEALTH_CHECK_TIMEOUT_MS = 5000;

/* ── 캐시 ── */

export const CACHE_TTL = {
  API: 5 * 60 * 1000,       // 5분 (외부 API 인메모리)
  WEATHER: 60 * 60 * 1000,  // 1시간 (날씨 localStorage)
} as const;

export const CACHE_MAX_SIZE = 500;
export const CACHE_EVICT_TARGET = 400;

/* ── 날씨 기본 좌표 (서울) ── */

export const DEFAULT_LOCATION = {
  LAT: 37.5665,
  LON: 126.978,
} as const;

/* ── 분석 엔진 점수 ── */

export const SCORE = {
  BASE: 100,
  PENALTY: {
    critical: 20,
    high: 15,
    medium: 8,
    low: 3,
  },
  MISSING_STEP: {
    critical: 25,
    warning: 10,
  },
  BONUS: {
    BALANCED_ROUTINE: 5,   // 5개+ 카테고리
    HAS_SUNSCREEN: 5,
  },
} as const;

/* ── 요일 ── */

export const DAY_NAMES_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;
export const WEEKDAY_NAMES_KO = ["월", "화", "수", "목", "금", "토", "일"] as const;

/* ── 캘린더 스케줄 ── */

export const SCHEDULE_DAYS = {
  RETINOL: [1, 3, 5],   // 화, 목, 토 (0-based weekday index)
  EXFOLIATE: [2, 6],     // 수, 일
} as const;

/* ── UV/날씨 임계값 ── */

export const UV_THRESHOLD = {
  VERY_HIGH: 8,
  HIGH: 5,
  MODERATE: 3,
} as const;

export const TEMP_THRESHOLD = {
  VERY_COLD: 5,
  COLD: 10,
  WARM: 25,
  HOT: 30,
} as const;

/* ── 알림 ── */

export const NOTIFICATION_DISPLAY_MAX = 20;

/* ── 이벤트 플러시 간격 ── */

export const EVENT_FLUSH_INTERVAL_MS = 5000;

/* ── 검색 ── */

export const SEARCH_DEFAULTS = {
  MAX_RESULTS: 8,
  FUZZY_THRESHOLD: 2,
  SCANNER_RESULTS: 5,
} as const;

/* ── 페이지네이션 ── */

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
  LANDING_FEED: 3,
  RANKING: 20,
  POINTS_HISTORY: 20,
  LIKED_POSTS: 50,
} as const;

/* ── UI 타이밍 (ms) ── */

export const UI_TIMING = {
  SEARCH_DEBOUNCE: 400,
  BANNER_ROTATE: 4000,
  TOAST_DISMISS: 2500,
  PAYMENT_TOAST: 4000,
  SAVE_CONFIRM: 2000,
} as const;

/* ── Safety 등급 색상 (safetyScore 1~5) ── */

export const SAFETY_SCORE_CONFIG: Record<number, { label: string; color: string; bg: string; dot: string }> = {
  5: { label: "매우 안전", color: "text-green-500", bg: "bg-green-50", dot: "bg-green-500" },
  4: { label: "안전", color: "text-emerald-500", bg: "bg-emerald-50", dot: "bg-emerald-500" },
  3: { label: "보통", color: "text-amber-500", bg: "bg-amber-50", dot: "bg-amber-500" },
  2: { label: "주의", color: "text-orange-500", bg: "bg-orange-50", dot: "bg-orange-500" },
  1: { label: "경고", color: "text-red-500", bg: "bg-red-50", dot: "bg-red-500" },
};

export function getSafetyConfig(score: number) {
  return SAFETY_SCORE_CONFIG[Math.max(1, Math.min(5, score))] ?? SAFETY_SCORE_CONFIG[3];
}

/* ── SafetyLevel 색상 ── */

export const SAFETY_LEVEL_CONFIG = {
  safe: { label: "안전", bg: "bg-green-50", text: "text-green-600", dot: "bg-green-400" },
  moderate: { label: "보통", bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400" },
  caution: { label: "주의", bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },
} as const;
