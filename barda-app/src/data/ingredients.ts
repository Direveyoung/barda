/* ─── Ingredient Safety / Efficacy Database ─── */

export interface IngredientInfo {
  name: string;           // Korean name
  nameEn: string;         // English/INCI name
  category:
    | "moisturizing"
    | "brightening"
    | "anti-aging"
    | "soothing"
    | "exfoliating"
    | "antioxidant"
    | "barrier"
    | "acne"
    | "uv-protection";
  safetyScore: number;    // 1-5 (1=caution, 5=very safe)
  efficacy: string;       // One-line description
  caution: string;        // One-line caution note
  goodWith: string[];     // Synergy ingredients (Korean names matching keys)
  avoidWith: string[];    // Conflicting ingredients (Korean names matching keys)
  skinTypes: string[];    // Best for: "dry", "oily", "sensitive", "combination", "normal"
}

export const CATEGORY_LABELS: Record<IngredientInfo["category"], string> = {
  moisturizing: "보습",
  brightening: "미백/브라이트닝",
  "anti-aging": "안티에이징",
  soothing: "진정",
  exfoliating: "각질케어",
  antioxidant: "항산화",
  barrier: "장벽강화",
  acne: "트러블/여드름",
  "uv-protection": "자외선차단",
};

export const CATEGORY_ICON: Record<IngredientInfo["category"], string> = {
  moisturizing: "drop",
  brightening: "sparkle",
  "anti-aging": "purple-heart",
  soothing: "leaf",
  exfoliating: "beaker",
  antioxidant: "orange",
  barrier: "shield",
  acne: "burst",
  "uv-protection": "sun",
};

export const SKIN_TYPE_LABELS: Record<string, string> = {
  dry: "건성",
  oily: "지성",
  sensitive: "민감성",
  combination: "복합성",
  normal: "중성",
};

export const INGREDIENT_DB: Record<string, IngredientInfo> = {
  /* ── 미백/브라이트닝 ── */
  나이아신아마이드: {
    name: "나이아신아마이드",
    nameEn: "Niacinamide (Vitamin B3)",
    category: "brightening",
    safetyScore: 5,
    efficacy: "피지 조절, 미백, 모공 축소, 피부장벽 강화에 효과적인 만능 성분",
    caution: "고농도(10%+) 사용 시 민감피부에 자극 가능, 비타민C와 분리 사용 권장",
    goodWith: ["히알루론산", "세라마이드", "판테놀", "아르부틴", "트라넥삼산"],
    avoidWith: ["비타민C"],
    skinTypes: ["oily", "combination", "normal", "sensitive", "dry"],
  },
  비타민C: {
    name: "비타민C (아스코르빈산)",
    nameEn: "Ascorbic Acid (L-Ascorbic Acid)",
    category: "brightening",
    safetyScore: 3,
    efficacy: "강력한 항산화, 멜라닌 생성 억제, 콜라겐 합성 촉진으로 피부톤 균일화",
    caution: "산화에 취약하여 개봉 후 빠르게 사용, pH 의존적이라 산성 환경 필요",
    goodWith: ["토코페롤", "히알루론산"],
    avoidWith: ["나이아신아마이드", "벤조일퍼옥사이드", "레티놀"],
    skinTypes: ["normal", "combination", "oily"],
  },
  아르부틴: {
    name: "아르부틴",
    nameEn: "Arbutin (Alpha-Arbutin)",
    category: "brightening",
    safetyScore: 4,
    efficacy: "멜라닌 합성 억제를 통한 미백, 기미/잡티 완화에 효과적",
    caution: "하이드로퀴논 유도체로 고농도 시 자극 가능, 알파아르부틴이 더 안정적",
    goodWith: ["나이아신아마이드", "트라넥삼산", "히알루론산", "비타민C"],
    avoidWith: [],
    skinTypes: ["normal", "dry", "combination", "sensitive"],
  },
  트라넥삼산: {
    name: "트라넥삼산",
    nameEn: "Tranexamic Acid",
    category: "brightening",
    safetyScore: 4,
    efficacy: "색소침착 개선, 기미/잡티 완화, 멜라닌 전달 억제에 효과적",
    caution: "대부분 안전하나 경구 복용 시 전문의 상담 필요, 외용은 저자극",
    goodWith: ["나이아신아마이드", "아르부틴", "비타민C", "글루타치온"],
    avoidWith: [],
    skinTypes: ["normal", "dry", "combination", "sensitive", "oily"],
  },
  글루타치온: {
    name: "글루타치온",
    nameEn: "Glutathione",
    category: "brightening",
    safetyScore: 4,
    efficacy: "강력한 항산화 및 미백 효과, 멜라닌 생성 억제와 피부톤 개선",
    caution: "안정성이 낮아 제형에 따라 효능 차이 큼, 피부 흡수율 고려 필요",
    goodWith: ["비타민C", "나이아신아마이드", "트라넥삼산", "토코페롤"],
    avoidWith: [],
    skinTypes: ["normal", "dry", "combination", "oily"],
  },

  /* ── 안티에이징 ── */
  레티놀: {
    name: "레티놀",
    nameEn: "Retinol (Vitamin A)",
    category: "anti-aging",
    safetyScore: 2,
    efficacy: "주름 개선, 콜라겐 촉진, 세포 턴오버 증가로 피부 재생 효과 탁월",
    caution: "자외선 민감 증가, 건조/벗겨짐 가능, 반드시 야간 사용 + 선크림 필수",
    goodWith: ["히알루론산", "세라마이드", "펩타이드", "판테놀"],
    avoidWith: ["비타민C", "살리실산", "글리콜산", "벤조일퍼옥사이드"],
    skinTypes: ["normal", "combination", "oily"],
  },
  아데노신: {
    name: "아데노신",
    nameEn: "Adenosine",
    category: "anti-aging",
    safetyScore: 5,
    efficacy: "주름 개선 기능성 고시 성분, 상처 회복 촉진 및 항염 효과",
    caution: "특별한 주의 없음, 대부분의 성분과 안전하게 병용 가능",
    goodWith: ["레티놀", "펩타이드", "나이아신아마이드", "히알루론산"],
    avoidWith: [],
    skinTypes: ["normal", "dry", "combination", "sensitive", "oily"],
  },
  펩타이드: {
    name: "펩타이드",
    nameEn: "Peptides (Copper Peptide, Matrixyl)",
    category: "anti-aging",
    safetyScore: 4,
    efficacy: "콜라겐/엘라스틴 생성 촉진, 탄력 개선, 주름 완화 효과",
    caution: "구리 펩타이드는 비타민C/레티놀과 분리 사용 권장, 일반 펩타이드는 안전",
    goodWith: ["히알루론산", "나이아신아마이드", "아데노신", "세라마이드"],
    avoidWith: ["비타민C"],
    skinTypes: ["normal", "dry", "combination", "sensitive"],
  },
  콜라겐: {
    name: "콜라겐",
    nameEn: "Collagen (Hydrolyzed Collagen)",
    category: "anti-aging",
    safetyScore: 5,
    efficacy: "피부 탄력 및 보습 개선, 잔주름 완화, 피부결 정돈 효과",
    caution: "고분자 콜라겐은 피부 흡수 어려움, 가수분해 콜라겐 또는 저분자 형태 권장",
    goodWith: ["히알루론산", "비타민C", "펩타이드", "세라마이드"],
    avoidWith: [],
    skinTypes: ["normal", "dry", "combination", "sensitive", "oily"],
  },
  코엔자임Q10: {
    name: "코엔자임Q10",
    nameEn: "Coenzyme Q10 (Ubiquinone)",
    category: "anti-aging",
    safetyScore: 5,
    efficacy: "세포 에너지 활성화, 항산화, 주름 개선 및 피부 탄력 강화",
    caution: "특별한 주의 없음, 산화에 약해 밀봉 보관 권장",
    goodWith: ["비타민C", "토코페롤", "히알루론산", "레티놀"],
    avoidWith: [],
    skinTypes: ["normal", "dry", "combination"],
  },
  바쿠치올: {
    name: "바쿠치올",
    nameEn: "Bakuchiol",
    category: "anti-aging",
    safetyScore: 4,
    efficacy: "식물성 레티놀 대안, 콜라겐 촉진 + 항산화, 주름/탄력 개선",
    caution: "레티놀보다 순한 편이나 민감피부는 패치 테스트 권장",
    goodWith: ["히알루론산", "세라마이드", "비타민C", "나이아신아마이드"],
    avoidWith: [],
    skinTypes: ["normal", "dry", "combination", "sensitive"],
  },

  /* ── 보습 ── */
  히알루론산: {
    name: "히알루론산",
    nameEn: "Hyaluronic Acid (Sodium Hyaluronate)",
    category: "moisturizing",
    safetyScore: 5,
    efficacy: "자기 무게 1000배 수분 보유, 피부 탄력 개선 및 즉각적인 수분 공급",
    caution: "건조한 환경에서는 오히려 피부 수분을 빼앗길 수 있으므로 크림으로 봉인 필수",
    goodWith: ["세라마이드", "나이아신아마이드", "비타민C", "레티놀", "판테놀"],
    avoidWith: [],
    skinTypes: ["dry", "normal", "combination", "sensitive", "oily"],
  },
  스쿠알란: {
    name: "스쿠알란",
    nameEn: "Squalane",
    category: "moisturizing",
    safetyScore: 5,
    efficacy: "피부 유사 오일로 빠른 흡수, 보습 + 장벽 강화 + 피부 연화 효과",
    caution: "순한 편이나 지성피부는 소량 사용 권장",
    goodWith: ["세라마이드", "히알루론산", "레티놀", "비타민C"],
    avoidWith: [],
    skinTypes: ["dry", "normal", "sensitive", "combination"],
  },

  /* ── 장벽강화 ── */
  세라마이드: {
    name: "세라마이드",
    nameEn: "Ceramide (Ceramide NP/AP/EOP)",
    category: "barrier",
    safetyScore: 5,
    efficacy: "피부장벽 핵심 구성 성분, 수분 증발 방지 및 외부 자극 차단",
    caution: "특별한 주의 없음, 손상된 피부장벽 회복에 최우선 추천 성분",
    goodWith: ["히알루론산", "판테놀", "나이아신아마이드", "스쿠알란"],
    avoidWith: [],
    skinTypes: ["dry", "sensitive", "normal", "combination"],
  },

  /* ── 진정 ── */
  판테놀: {
    name: "판테놀",
    nameEn: "Panthenol (D-Panthenol, Vitamin B5)",
    category: "soothing",
    safetyScore: 5,
    efficacy: "피부 진정, 보습, 장벽 회복, 상처 치유 촉진 효과",
    caution: "매우 순한 성분으로 특별한 주의 없음, 모든 피부 타입에 적합",
    goodWith: ["세라마이드", "히알루론산", "나이아신아마이드", "알란토인", "센텔라"],
    avoidWith: [],
    skinTypes: ["sensitive", "dry", "normal", "combination", "oily"],
  },
  센텔라: {
    name: "센텔라 (시카)",
    nameEn: "Centella Asiatica Extract (Cica)",
    category: "soothing",
    safetyScore: 5,
    efficacy: "피부 진정, 장벽 회복, 트러블 완화, 콜라겐 합성 촉진 효과",
    caution: "극히 드물게 접촉 알레르기, 대부분의 성분과 안전하게 병용 가능",
    goodWith: ["판테놀", "마데카소사이드", "히알루론산", "나이아신아마이드"],
    avoidWith: [],
    skinTypes: ["sensitive", "dry", "normal", "combination", "oily"],
  },
  알란토인: {
    name: "알란토인",
    nameEn: "Allantoin",
    category: "soothing",
    safetyScore: 5,
    efficacy: "피부 진정, 자극 완화, 각질 연화, 세포 재생 촉진 효과",
    caution: "매우 순한 성분으로 특별한 주의 없음",
    goodWith: ["판테놀", "센텔라", "히알루론산", "세라마이드"],
    avoidWith: [],
    skinTypes: ["sensitive", "dry", "normal", "combination", "oily"],
  },
  알파비사보롤: {
    name: "알파비사보롤",
    nameEn: "Alpha-Bisabolol",
    category: "soothing",
    safetyScore: 5,
    efficacy: "캐모마일 유래 진정 성분, 항염/항균/피부 진정 효과 우수",
    caution: "특별한 주의 없음, 민감피부에도 안전하게 사용 가능",
    goodWith: ["판테놀", "센텔라", "알란토인", "히알루론산"],
    avoidWith: [],
    skinTypes: ["sensitive", "dry", "normal", "combination"],
  },
  마데카소사이드: {
    name: "마데카소사이드",
    nameEn: "Madecassoside",
    category: "soothing",
    safetyScore: 5,
    efficacy: "센텔라 핵심 활성 성분, 진정/항염/콜라겐 합성 촉진에 탁월",
    caution: "특별한 주의 없음, 손상 피부 회복에 최적",
    goodWith: ["센텔라", "판테놀", "히알루론산", "세라마이드"],
    avoidWith: [],
    skinTypes: ["sensitive", "dry", "normal", "combination", "oily"],
  },

  /* ── 항산화 ── */
  녹차추출물: {
    name: "녹차 추출물",
    nameEn: "Green Tea Extract (Camellia Sinensis)",
    category: "antioxidant",
    safetyScore: 5,
    efficacy: "폴리페놀 풍부한 항산화, 피지 조절, 항염, 자외선 손상 방어 효과",
    caution: "매우 안전, 카페인에 민감한 경우 드물게 자극 가능",
    goodWith: ["비타민C", "나이아신아마이드", "히알루론산", "토코페롤"],
    avoidWith: [],
    skinTypes: ["oily", "combination", "normal", "sensitive"],
  },
  토코페롤: {
    name: "토코페롤",
    nameEn: "Tocopherol (Vitamin E)",
    category: "antioxidant",
    safetyScore: 5,
    efficacy: "지용성 항산화제, 비타민C 효과 증대, 피부 보호 및 보습 효과",
    caution: "순한 편이나 지성피부에 과량 사용 시 모공 막힘 가능",
    goodWith: ["비타민C", "스쿠알란", "녹차추출물"],
    avoidWith: [],
    skinTypes: ["dry", "normal", "combination", "sensitive"],
  },
  프로폴리스: {
    name: "프로폴리스",
    nameEn: "Propolis Extract",
    category: "antioxidant",
    safetyScore: 4,
    efficacy: "천연 항균/항염, 항산화, 영양 공급, 트러블 진정 및 피부 강화",
    caution: "꿀벌 유래 성분으로 봉독 알레르기 있으면 사용 주의, 패치 테스트 권장",
    goodWith: ["나이아신아마이드", "히알루론산", "센텔라"],
    avoidWith: [],
    skinTypes: ["normal", "oily", "combination", "sensitive"],
  },

  /* ── 각질케어 ── */
  살리실산: {
    name: "살리실산 (BHA)",
    nameEn: "Salicylic Acid (BHA)",
    category: "exfoliating",
    safetyScore: 3,
    efficacy: "지용성 각질 제거로 모공 속까지 침투, 블랙헤드/피지 관리에 효과적",
    caution: "건조/자극 가능, 과도한 사용 금지, AHA/레티놀과 동시 사용 주의",
    goodWith: ["나이아신아마이드", "히알루론산", "센텔라"],
    avoidWith: ["레티놀", "글리콜산", "비타민C"],
    skinTypes: ["oily", "combination"],
  },
  글리콜산: {
    name: "글리콜산 (AHA)",
    nameEn: "Glycolic Acid (AHA)",
    category: "exfoliating",
    safetyScore: 3,
    efficacy: "가장 작은 분자의 AHA로 깊은 침투, 각질 제거 및 피부결 개선 효과",
    caution: "선크림 필수, 레티놀과 같은 날 사용 금지, 민감피부 농도 주의",
    goodWith: ["히알루론산", "나이아신아마이드", "세라마이드"],
    avoidWith: ["레티놀", "살리실산", "비타민C"],
    skinTypes: ["normal", "combination", "oily"],
  },
  PHA: {
    name: "PHA",
    nameEn: "Polyhydroxy Acid (Gluconolactone)",
    category: "exfoliating",
    safetyScore: 4,
    efficacy: "AHA보다 순한 각질 제거, 보습력 보유, 민감피부도 사용 가능",
    caution: "다른 산성 제품과 중복 사용 시 자극 가능, 점진적 사용 권장",
    goodWith: ["히알루론산", "세라마이드", "판테놀", "나이아신아마이드"],
    avoidWith: ["글리콜산", "살리실산"],
    skinTypes: ["sensitive", "dry", "normal", "combination"],
  },

  /* ── 트러블/여드름 ── */
  티트리오일: {
    name: "티트리 오일",
    nameEn: "Tea Tree Oil (Melaleuca Alternifolia)",
    category: "acne",
    safetyScore: 3,
    efficacy: "천연 항균/항염, 여드름 스팟 케어 및 트러블 진정 효과",
    caution: "원액 사용 절대 금지, 반드시 희석된 제품으로 사용, 알레르기 주의",
    goodWith: ["센텔라", "나이아신아마이드", "살리실산"],
    avoidWith: ["레티놀"],
    skinTypes: ["oily", "combination"],
  },
  벤조일퍼옥사이드: {
    name: "벤조일퍼옥사이드",
    nameEn: "Benzoyl Peroxide",
    category: "acne",
    safetyScore: 2,
    efficacy: "여드름균 강력 살균, 염증성 트러블 치료에 효과적",
    caution: "레티놀/비타민C와 동시 사용 금지, 건조/자극 가능, 의류 탈색 주의",
    goodWith: ["나이아신아마이드", "히알루론산"],
    avoidWith: ["레티놀", "비타민C", "글리콜산", "살리실산"],
    skinTypes: ["oily"],
  },
  아젤라산: {
    name: "아젤라산",
    nameEn: "Azelaic Acid",
    category: "acne",
    safetyScore: 4,
    efficacy: "여드름, 주사비, 색소침착 개선에 효과적인 다기능 성분",
    caution: "초기 사용 시 약간의 따끔거림 가능, 사용량 점진적 증가 권장",
    goodWith: ["나이아신아마이드", "히알루론산", "세라마이드", "판테놀"],
    avoidWith: [],
    skinTypes: ["oily", "combination", "sensitive", "normal"],
  },
  카페인: {
    name: "카페인",
    nameEn: "Caffeine",
    category: "acne",
    safetyScore: 4,
    efficacy: "혈관 수축으로 부기/다크서클 완화, 항산화 및 셀룰라이트 개선",
    caution: "눈가 사용 시 자극 주의, 건조피부는 보습제와 함께 사용 권장",
    goodWith: ["나이아신아마이드", "비타민C", "펩타이드", "히알루론산"],
    avoidWith: [],
    skinTypes: ["oily", "combination", "normal"],
  },

  /* ── 자외선차단 ── */
  징크옥사이드: {
    name: "징크옥사이드",
    nameEn: "Zinc Oxide",
    category: "uv-protection",
    safetyScore: 5,
    efficacy: "물리적(무기) 자외선 차단, UVA+UVB 광범위 차단, 민감피부 적합",
    caution: "백탁 가능, 나노 입자 논란 있으나 외용 시 안전성 확인됨",
    goodWith: ["세라마이드", "나이아신아마이드", "히알루론산"],
    avoidWith: [],
    skinTypes: ["sensitive", "dry", "normal", "combination", "oily"],
  },
};

/* ─── Compat Types & Helpers ─── */

export type SafetyLevel = "safe" | "moderate" | "caution";

/** Derive safety level from safetyScore (1-5) */
export function getSafetyLevel(score: number): SafetyLevel {
  if (score >= 4) return "safe";
  if (score >= 3) return "moderate";
  return "caution";
}

/** Convert safetyScore (1-5, 5=safest) to EWG-style score (1-10, 1=safest) */
export function toEwgScore(safetyScore: number): number {
  return Math.max(1, Math.min(10, 11 - safetyScore * 2));
}

/** Normalize INCI ingredient name for comparison */
export function normalizeINCI(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/* ─── Lookup Helpers ─── */

/**
 * Normalize a Korean ingredient name for fuzzy matching.
 * Removes spaces, parentheses, and lowercases Latin characters.
 */
function normalizeKorean(name: string): string {
  return name
    .replace(/\s+/g, "")
    .replace(/[()（）]/g, "")
    .replace(/[A-Za-z]/g, (ch) => ch.toLowerCase());
}

/**
 * Look up an ingredient from the product's key_ingredients list.
 * Tries exact key match first, then normalized fuzzy matching.
 */
export function lookupIngredient(ingredientName: string): IngredientInfo | null {
  // 1. Exact key match
  if (INGREDIENT_DB[ingredientName]) {
    return INGREDIENT_DB[ingredientName];
  }

  // 2. Normalized fuzzy match against keys and names
  const normalized = normalizeKorean(ingredientName);
  for (const [key, info] of Object.entries(INGREDIENT_DB)) {
    if (
      normalizeKorean(key) === normalized ||
      normalizeKorean(info.name) === normalized
    ) {
      return info;
    }
  }

  // 3. Partial match (ingredient name contained in key or vice versa)
  for (const [key, info] of Object.entries(INGREDIENT_DB)) {
    const nKey = normalizeKorean(key);
    const nName = normalizeKorean(info.name);
    if (
      nKey.includes(normalized) ||
      normalized.includes(nKey) ||
      nName.includes(normalized) ||
      normalized.includes(nName)
    ) {
      return info;
    }
  }

  return null;
}

/** Alias for lookupIngredient (backward compat) */
export const lookupIngredientKorean = lookupIngredient;
