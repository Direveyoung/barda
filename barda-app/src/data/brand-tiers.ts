/* ─── Brand Price Tier Classification ─── */
/* 브랜드별 가격 티어 분류 — 중앙 관리 */

export type PriceTier = "budget" | "mid" | "premium" | "luxury";

export const LUXURY_BRANDS = new Set([
  "설화수", "헤라", "오휘", "SK-II", "에스티로더",
  "랑콤", "시슬리", "라메르", "스킨수티컬즈", "달팡", "바이레도",
]);

export const PREMIUM_BRANDS = new Set([
  "아이오페", "프리메라", "탬버린즈", "달바", "AHC",
  "폴라초이스", "라로슈포제", "바이오더마", "유세린", "비쉬",
  "DHC", "판클", "쿠라이온",
]);

export const BUDGET_BRANDS = new Set([
  "코스알엑스", "이즈앤트리", "퓨리토", "원씽", "바닐라코",
  "스킨푸드", "에뛰드", "더페이스샵", "미샤", "더인키리스트",
  "디오디너리", "세라비", "바니크림",
]);

export function getBrandPriceTier(brand: string): PriceTier {
  if (LUXURY_BRANDS.has(brand)) return "luxury";
  if (PREMIUM_BRANDS.has(brand)) return "premium";
  if (BUDGET_BRANDS.has(brand)) return "budget";
  return "mid";
}

export const PRICE_TIER_LABEL: Record<PriceTier, string> = {
  budget: "가성비",
  mid: "중가",
  premium: "프리미엄",
  luxury: "럭셔리",
};

export const PRICE_TIER_STYLE: Record<PriceTier, string> = {
  budget: "bg-green-50 text-green-600",
  mid: "bg-blue-50 text-blue-600",
  premium: "bg-purple-50 text-purple-600",
  luxury: "bg-amber-50 text-amber-700",
};

/* ─── Price Range Estimates (category × tier, ₩) ─── */

export const PRICE_RANGES: Record<PriceTier, Record<string, { min: number; max: number }>> = {
  budget: {
    cleanser: { min: 5000, max: 12000 }, oil_cleanser: { min: 8000, max: 15000 },
    toner: { min: 7000, max: 15000 }, toner_pad: { min: 8000, max: 16000 },
    essence: { min: 10000, max: 18000 }, ampoule: { min: 10000, max: 20000 },
    serum: { min: 10000, max: 20000 }, cream: { min: 8000, max: 18000 },
    sunscreen: { min: 8000, max: 15000 }, mask: { min: 1000, max: 4000 },
    _default: { min: 8000, max: 16000 },
  },
  mid: {
    cleanser: { min: 12000, max: 25000 }, oil_cleanser: { min: 15000, max: 28000 },
    toner: { min: 15000, max: 28000 }, toner_pad: { min: 16000, max: 30000 },
    essence: { min: 18000, max: 35000 }, ampoule: { min: 20000, max: 40000 },
    serum: { min: 20000, max: 40000 }, cream: { min: 18000, max: 35000 },
    sunscreen: { min: 15000, max: 25000 }, mask: { min: 3000, max: 8000 },
    _default: { min: 15000, max: 30000 },
  },
  premium: {
    cleanser: { min: 25000, max: 45000 }, oil_cleanser: { min: 28000, max: 50000 },
    toner: { min: 28000, max: 50000 }, toner_pad: { min: 25000, max: 45000 },
    essence: { min: 35000, max: 65000 }, ampoule: { min: 40000, max: 75000 },
    serum: { min: 35000, max: 70000 }, cream: { min: 35000, max: 65000 },
    sunscreen: { min: 25000, max: 40000 }, mask: { min: 5000, max: 15000 },
    _default: { min: 30000, max: 55000 },
  },
  luxury: {
    cleanser: { min: 40000, max: 80000 }, oil_cleanser: { min: 45000, max: 90000 },
    toner: { min: 50000, max: 100000 }, toner_pad: { min: 40000, max: 70000 },
    essence: { min: 70000, max: 180000 }, ampoule: { min: 80000, max: 200000 },
    serum: { min: 70000, max: 170000 }, cream: { min: 60000, max: 150000 },
    sunscreen: { min: 35000, max: 60000 }, mask: { min: 10000, max: 30000 },
    _default: { min: 50000, max: 120000 },
  },
};

export function getEstimatedPrice(tier: PriceTier, categoryId: string): { min: number; max: number } {
  const tierPrices = PRICE_RANGES[tier];
  return tierPrices[categoryId] ?? tierPrices._default;
}
