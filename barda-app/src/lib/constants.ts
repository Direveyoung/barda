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
  dryness: "건조",
  sensitivity: "민감",
  pore: "모공",
  blackhead: "블랙헤드",
  whitehead: "화이트헤드",
  redness: "홍조",
  darkCircle: "다크서클",
};

/* ── 결제 ── */

export const PAYMENT = {
  PREMIUM_PRICE: 9900,
  CURRENCY: "KRW",
  ORDER_NAME: "BARDA 프리미엄 분석",
  DISPLAY_TEXT: "₩9,900 일회성 결제",
} as const;

/* ── localStorage 키 ── */

export const STORAGE_KEYS = {
  WEATHER: "barda_weather",
  SESSION_ID: "barda_session_id",
  DEV_UNLOCK: "barda_dev_unlock",
  notifications: (userId: string) => `barda_notifications_${userId}`,
} as const;

/* ── 외부 API ── */

export const API_URLS = {
  MFDS: "https://apis.data.go.kr/1471000/CosmeFnctnlMaterialService/getCosmeFnctnlMaterialList",
  OBF: "https://world.openbeautyfacts.org",
  INGREDIENT_DICT: "https://apis.data.go.kr/1471000/CsmtcsIngdService/getCsmtcsIngdInforList",
  WEATHER: "https://api.open-meteo.com/v1/forecast",
  AIR_QUALITY: "https://air-quality-api.open-meteo.com/v1/air-quality",
  TOSS_SDK: "https://js.tosspayments.com/v1/payment",
} as const;

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

export const NOTIFICATION_MAX = 50;
export const NOTIFICATION_DISPLAY_MAX = 20;

/* ── 이벤트 플러시 간격 ── */

export const EVENT_FLUSH_INTERVAL_MS = 5000;
