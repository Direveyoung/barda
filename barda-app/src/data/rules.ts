// ---------------------------------------------------------------------------
// Rule Engine Data
// Conflict rules (B01-B15) and Missing-step rules (E01-E04)
// ---------------------------------------------------------------------------

// ---- Types ----------------------------------------------------------------

export interface ConflictRule {
  id: string;
  priority: number;
  a: string[];
  b: string[];
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  tip: string;
  enabled: boolean;
  isMultiActive?: boolean;
  concentrationModifier?: {
    any_high?: { severity: "critical" | "high" | "medium" | "low" };
    any_medium?: { severity: "critical" | "high" | "medium" | "low" };
    both_low?: { severity: "critical" | "high" | "medium" | "low" };
  };
  skinTypeModifier?: Record<string, { severityBump: number }>;
}

export interface MissingStepRule {
  id: string;
  check:
    | "no_sunscreen_am"
    | "retinol_no_sunscreen"
    | "no_moisturizer"
    | "no_cleanser";
  priority: "critical" | "warning";
  step: string;
  why: string;
}

// ---- Conflict Rules -------------------------------------------------------

export const CONFLICT_RULES: ConflictRule[] = [
  // B01 ── 레티놀 x AHA/BHA (산성 각질제거제 전체)
  {
    id: "B01",
    priority: 1,
    a: ["retinol"],
    b: ["aha", "bha"],
    severity: "critical",
    title: "레티놀 x AHA/BHA",
    description:
      "레티놀과 산성 각질제거제를 함께 사용하면 심한 자극을 유발해요. " +
      "두 성분 모두 각질층을 얇게 만들기 때문에 동시에 쓰면 홍조, " +
      "건조, 벗겨짐이 생길 수 있어요.",
    tip:
      "레티놀은 PM 루틴에, AHA/BHA는 별도의 날 저녁에 사용하세요. " +
      "반드시 다음 날 아침 선크림을 꼼꼼히 발라 주세요.",
    enabled: true,
    concentrationModifier: {
      any_high: { severity: "critical" },
      any_medium: { severity: "critical" },
      both_low: { severity: "high" },
    },
    skinTypeModifier: {
      sensitive: { severityBump: 1 },
    },
  },

  // B02 ── 레티놀 x 비타민C
  {
    id: "B02",
    priority: 2,
    a: ["retinol"],
    b: ["vitamin_c"],
    severity: "high",
    title: "레티놀 x 비타민C",
    description:
      "레티놀과 비타민C를 동시에 사용하면 효과가 떨어지고 자극이 생겨요. " +
      "레티놀(최적 pH 5.5~6)과 비타민C(최적 pH 2.5~3.5)는 " +
      "최적 pH 범위가 달라 서로의 효능이 저하돼요.",
    tip:
      "비타민C는 AM 루틴에, 레티놀은 PM 루틴에 분리하여 사용하세요. " +
      "이렇게 하면 두 성분의 효과를 모두 살릴 수 있어요.",
    enabled: true,
    concentrationModifier: {
      any_high: { severity: "critical" },
      any_medium: { severity: "high" },
      both_low: { severity: "medium" },
    },
    skinTypeModifier: {
      sensitive: { severityBump: 1 },
    },
  },

  // B03 ── AHA x BHA 같은 루틴
  {
    id: "B03",
    priority: 3,
    a: ["aha"],
    b: ["bha"],
    severity: "medium",
    title: "AHA x BHA 동시 사용",
    description:
      "두 가지 산성 각질제거제를 한 루틴에 쓰면 과각질이 될 수 있어요. " +
      "AHA는 피부 표면을, BHA는 모공 속을 각질제거하기 때문에 " +
      "이중 각질제거로 장벽이 약해질 수 있어요.",
    tip:
      "AHA와 BHA를 번갈아 사용하세요. 예: AHA는 월/수/금, BHA는 화/목/토. " +
      "보습과 선크림을 철저히 해 주세요.",
    enabled: true,
    concentrationModifier: {
      any_high: { severity: "high" },
      any_medium: { severity: "medium" },
      both_low: { severity: "low" },
    },
    skinTypeModifier: {
      sensitive: { severityBump: 1 },
    },
  },

  // B04 ── 비타민C x 나이아신아마이드
  {
    id: "B04",
    priority: 14,
    a: ["vitamin_c"],
    b: ["niacinamide"],
    severity: "low",
    title: "비타민C x 나이아신아마이드",
    description:
      "비타민C와 나이아신아마이드는 pH 차이로 효과가 줄어들 수 있어요. " +
      "다만 최근 연구에 따르면 현대 제형에서는 대부분 함께 사용해도 " +
      "큰 문제가 없다는 결과가 많아요.",
    tip:
      "대부분 함께 사용 가능하지만, 자극이 느껴지면 " +
      "비타민C를 AM에, 나이아신아마이드를 PM에 분리하세요.",
    enabled: true,
    skinTypeModifier: {
      sensitive: { severityBump: 1 },
    },
  },

  // B05 ── 레티놀 x 벤조일퍼옥사이드
  {
    id: "B05",
    priority: 4,
    a: ["retinol"],
    b: ["benzoyl_peroxide"],
    severity: "critical",
    title: "레티놀 x 벤조일퍼옥사이드",
    description:
      "레티놀과 벤조일퍼옥사이드는 서로를 분해시켜요. " +
      "벤조일퍼옥사이드는 레티놀을 산화시켜 효과를 무력화하고, " +
      "동시에 피부 건조와 자극을 극심하게 유발할 수 있어요.",
    tip:
      "벤조일퍼옥사이드는 AM에, 레티놀은 PM에 사용하세요. " +
      "같은 시간대에 절대 겹치지 않도록 해 주세요.",
    enabled: true,
    concentrationModifier: {
      any_high: { severity: "critical" },
      any_medium: { severity: "critical" },
      both_low: { severity: "high" },
    },
    skinTypeModifier: {
      sensitive: { severityBump: 1 },
    },
  },

  // B06 ── AHA/BHA x 비타민C 같은 루틴
  {
    id: "B06",
    priority: 5,
    a: ["aha", "bha"],
    b: ["vitamin_c"],
    severity: "medium",
    title: "AHA/BHA x 비타민C",
    description:
      "강한 산성 성분끼리 함께 쓰면 자극이 커져요. " +
      "과도한 산성 환경이 조성되어 피부 자극, 홍조, " +
      "따가움이 발생할 수 있어요.",
    tip:
      "비타민C를 먼저 바르고 충분히 흡수시킨 뒤(20~30분) " +
      "AHA/BHA를 사용하거나, 아예 다른 시간대로 분리하세요.",
    enabled: true,
    concentrationModifier: {
      any_high: { severity: "high" },
      any_medium: { severity: "medium" },
      both_low: { severity: "low" },
    },
    skinTypeModifier: {
      sensitive: { severityBump: 1 },
    },
  },

  // B07 ── 레티놀 x 물리적 각질제거(스크럽)
  {
    id: "B07",
    priority: 6,
    a: ["retinol"],
    b: ["physical_scrub"],
    severity: "high",
    title: "레티놀 x 스크럽",
    description:
      "레티놀 사용 중 물리적 각질제거는 피부 장벽을 손상시켜요. " +
      "이미 얇아진 각질층에 물리적 마찰까지 더해져 " +
      "심한 자극, 상처, 색소침착이 생길 수 있어요.",
    tip:
      "레티놀 사용일에는 물리적 스크럽을 피하세요. " +
      "스크럽은 레티놀을 쉬는 날에만 사용하고, 부드러운 제품을 선택하세요.",
    enabled: true,
    concentrationModifier: {
      any_high: { severity: "critical" },
      any_medium: { severity: "high" },
      both_low: { severity: "medium" },
    },
    skinTypeModifier: {
      sensitive: { severityBump: 1 },
    },
  },

  // B08 ── 비타민C 중복 사용
  {
    id: "B08",
    priority: 13,
    a: ["vitamin_c"],
    b: ["vitamin_c"],
    severity: "low",
    title: "비타민C 중복 사용",
    description:
      "비타민C 중복 사용은 자극만 늘고 효과는 동일해요. " +
      "비타민C는 일정 농도 이상에서 피부 흡수가 포화되기 때문에 " +
      "여러 제품을 겹쳐 써도 효과가 더 좋아지지 않아요.",
    tip:
      "비타민C 제품은 가장 효과적인 한 가지만 선택하세요. " +
      "고농도 세럼 하나가 저농도 여러 개보다 나아요.",
    enabled: true,
    skinTypeModifier: {
      sensitive: { severityBump: 1 },
    },
  },

  // B09 ── 레티놀 x AHA (B01과 동일 카테고리, AHA 단독 명시)
  {
    id: "B09",
    priority: 7,
    a: ["retinol"],
    b: ["aha"],
    severity: "critical",
    title: "레티놀 x AHA",
    description:
      "레티놀과 AHA를 동시에 사용하면 피부 자극이 크게 증가해요. " +
      "두 성분 모두 각질을 제거하고 세포 턴오버를 촉진하기 때문에 " +
      "피부 장벽이 손상되어 홍조, 건조, 벗겨짐이 발생할 수 있어요.",
    tip:
      "레티놀은 PM 루틴에, AHA는 별도의 날 저녁에 사용하세요. " +
      "반드시 다음 날 아침 선크림을 꼼꼼히 발라 주세요.",
    enabled: true,
    concentrationModifier: {
      any_high: { severity: "critical" },
      any_medium: { severity: "critical" },
      both_low: { severity: "high" },
    },
    skinTypeModifier: {
      sensitive: { severityBump: 1 },
    },
  },

  // B10 ── BHA x 레티놀 (B01과 동일 카테고리, BHA 단독 명시)
  {
    id: "B10",
    priority: 8,
    a: ["bha"],
    b: ["retinol"],
    severity: "critical",
    title: "BHA x 레티놀",
    description:
      "BHA(살리실산)와 레티놀을 함께 사용하면 피부 건조와 자극이 " +
      "심해질 수 있어요. BHA는 모공 속 각질을 녹이고, 레티놀은 " +
      "세포 재생을 가속화하므로 중복 사용 시 장벽 기능이 약해져요.",
    tip:
      "BHA는 AM 또는 별도의 날에 사용하고, 레티놀은 PM에 사용하세요. " +
      "보습제를 충분히 덧발라 장벽을 보호하세요.",
    enabled: true,
    concentrationModifier: {
      any_high: { severity: "critical" },
      any_medium: { severity: "high" },
      both_low: { severity: "medium" },
    },
    skinTypeModifier: {
      sensitive: { severityBump: 1 },
    },
  },

  // B11 ── 나이아신아마이드 x 강한 산(저pH)
  {
    id: "B11",
    priority: 9,
    a: ["niacinamide"],
    b: ["aha", "bha"],
    severity: "medium",
    title: "나이아신아마이드 x 강산(저pH)",
    description:
      "나이아신아마이드는 낮은 pH 환경에서 나이아신(니코틴산)으로 전환되어 " +
      "홍조와 따가움을 유발할 수 있어요. 강한 산성 제품과 동시에 " +
      "사용하면 이 반응이 촉진돼요.",
    tip:
      "나이아신아마이드는 AHA/BHA 사용 후 충분히 흡수시킨 뒤(20분 이상) " +
      "사용하거나, 다른 시간대로 분리하세요.",
    enabled: true,
    concentrationModifier: {
      any_high: { severity: "high" },
      any_medium: { severity: "medium" },
      both_low: { severity: "low" },
    },
    skinTypeModifier: {
      sensitive: { severityBump: 1 },
    },
  },

  // B12 ── 레티노이드 중복 사용
  {
    id: "B12",
    priority: 10,
    a: ["retinol"],
    b: ["retinol"],
    severity: "high",
    title: "레티노이드 중복 사용",
    description:
      "레티노이드를 여러 개 쓰면 과자극 위험이 높아요. " +
      "레티놀 제품을 중복으로 사용하면 피부가 감당할 수 있는 " +
      "한계를 초과하여 심한 건조, 벗겨짐, 홍조가 생길 수 있어요.",
    tip:
      "레티놀 제품은 가장 효과적인 한 가지만 선택하세요. " +
      "농도를 서서히 올리는 것이 중복 사용보다 훨씬 안전하고 효과적이에요.",
    enabled: true,
    concentrationModifier: {
      any_high: { severity: "critical" },
      any_medium: { severity: "high" },
      both_low: { severity: "medium" },
    },
    skinTypeModifier: {
      sensitive: { severityBump: 1 },
    },
  },

  // B13 ── AHA x PHA
  {
    id: "B13",
    priority: 12,
    a: ["aha"],
    b: ["pha"],
    severity: "low",
    title: "AHA x PHA",
    description:
      "AHA와 PHA는 유사한 각질제거 메커니즘을 가지고 있어요. " +
      "PHA가 AHA보다 순하긴 하지만, 함께 사용하면 " +
      "과각질제거 위험이 있어요.",
    tip:
      "PHA와 AHA는 같은 루틴에 쓰지 말고 번갈아 사용하세요. " +
      "민감할 때는 PHA 단독 사용을 권장해요.",
    enabled: true,
    concentrationModifier: {
      any_high: { severity: "medium" },
      any_medium: { severity: "low" },
      both_low: { severity: "low" },
    },
    skinTypeModifier: {
      sensitive: { severityBump: 1 },
    },
  },

  // B14 ── 민감피부 + 액티브 3개 이상 (multi-active)
  {
    id: "B14",
    priority: 11,
    a: [
      "retinol",
      "aha",
      "bha",
      "pha",
      "vitamin_c",
      "benzoyl_peroxide",
      "copper_peptide",
      "enzyme_peel",
      "physical_scrub",
      "niacinamide",
    ],
    b: [],
    severity: "medium",
    isMultiActive: true,
    title: "액티브 과다 사용",
    description:
      "민감피부에 액티브 3개 이상은 자극 과부하예요. " +
      "한 루틴에 강력한 활성 성분을 3종류 이상 동시에 사용하면 " +
      "피부 총 자극량이 급격히 올라가 장벽 손상, 홍조, 트러블이 생길 수 있어요.",
    tip:
      "한 루틴에는 강한 액티브를 최대 2종까지만 사용하세요. " +
      "나머지는 다른 요일이나 AM/PM으로 분산시키세요. " +
      "'적게, 천천히, 꾸준히'가 건강한 피부의 핵심이에요.",
    enabled: true,
    skinTypeModifier: {
      sensitive: { severityBump: 1 },
    },
  },

  // B15 ── 레티놀 + AHA + 비타민C 트리플 충돌
  {
    id: "B15",
    priority: 0,
    a: ["retinol", "aha"],
    b: ["vitamin_c"],
    severity: "critical",
    title: "레티놀 + AHA + 비타민C 트리플 충돌",
    description:
      "레티놀, AHA, 비타민C를 동시에 사용하는 것은 가장 위험한 조합이에요. " +
      "세 성분 모두 피부에 강한 자극을 주며, pH 범위도 서로 달라 " +
      "심각한 장벽 손상, 홍조, 화학적 화상까지 유발할 수 있어요.",
    tip:
      "비타민C는 AM에, 레티놀은 PM에, AHA는 레티놀을 쉬는 날 PM에 사용하세요. " +
      "세 성분을 요일별로 철저히 분리하면 효과를 모두 누릴 수 있어요.",
    enabled: true,
    concentrationModifier: {
      any_high: { severity: "critical" },
      any_medium: { severity: "critical" },
      both_low: { severity: "high" },
    },
    skinTypeModifier: {
      sensitive: { severityBump: 1 },
    },
  },
];

// ---- Missing Step Rules ---------------------------------------------------

export const MISSING_STEP_RULES: MissingStepRule[] = [
  {
    id: "E01",
    check: "no_sunscreen_am",
    priority: "critical",
    step: "선크림이 없어요!",
    why:
      "자외선은 피부 노화의 80%를 차지해요. " +
      "어떤 스킨케어보다 선크림이 가장 효과적인 안티에이징 제품이에요. " +
      "흐린 날이나 실내에서도 UVA는 유리를 통과하므로 매일 발라 주세요.",
  },
  {
    id: "E02",
    check: "retinol_no_sunscreen",
    priority: "critical",
    step: "레티놀 사용 중인데 선크림이 없어요!",
    why:
      "레티놀은 광과민성을 높여요. " +
      "선크림 없이 레티놀을 사용하면 오히려 광손상과 색소침착이 악화될 수 있어요. " +
      "레티놀 사용 시 SPF 50+ 선크림은 필수예요.",
  },
  {
    id: "E03",
    check: "no_moisturizer",
    priority: "warning",
    step: "보습제가 없어요",
    why:
      "수분 장벽이 무너지면 모든 케어가 무의미해져요. " +
      "보습은 피부 장벽을 건강하게 유지하는 기본 단계이고, " +
      "특히 액티브 성분을 사용할 때는 보습이 자극을 완화하는 데 필수적이에요.",
  },
  {
    id: "E04",
    check: "no_cleanser",
    priority: "warning",
    step: "클렌저가 없어요",
    why:
      "클렌징 없이는 다른 제품이 제대로 흡수되지 않아요. " +
      "세안은 먼지, 피지, 잔여 메이크업을 제거하여 " +
      "이후 스킨케어 성분의 흡수를 돕는 첫 번째 단계예요.",
  },
];
