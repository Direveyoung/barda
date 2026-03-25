import type { Product, CategoryItem } from "@/data/products";
import { CATEGORIES } from "@/data/products";
import { CONFLICT_RULES, MISSING_STEP_RULES } from "@/data/rules";
import type { ConflictRule } from "@/data/rules";
import { SCORE, WEEKDAY_NAMES_KO, SCHEDULE_DAYS } from "@/lib/constants";

/* ─── Helpers ─── */

export function findCategory(id: string): CategoryItem | undefined {
  for (const group of Object.values(CATEGORIES)) {
    const found = group.items.find((c) => c.id === id);
    if (found) return found;
  }
  return undefined;
}

/** Get effective active IDs for a product (categoryId + active_flags) */
function getActiveIds(product: Product): string[] {
  const ids = [product.categoryId];
  if (product.active_flags) {
    ids.push(...product.active_flags);
  }
  return [...new Set(ids)];
}

/* ─── Types ─── */

export interface RoutineProduct extends Product {
  frequency: string;
}

export interface DetectedConflict {
  rule: ConflictRule;
  severity: "critical" | "high" | "medium" | "low";
  involvedProducts: string[];
}

export interface MissingStep {
  id: string;
  priority: "critical" | "warning";
  step: string;
  why: string;
}

export interface DaySchedule {
  day: string;
  isRetinolDay: boolean;
  isExfoliateDay: boolean;
  pmIcon: string;
  pmLabel: string;
}

export interface AnalysisResult {
  score: number;
  amProducts: RoutineProduct[];
  pmProducts: RoutineProduct[];
  conflicts: DetectedConflict[];
  missingSteps: MissingStep[];
  amTips: string[];
  pmTips: string[];
  calendar: DaySchedule[];
  hasSunscreen: boolean;
  hasRetinol: boolean;
  hasAHA: boolean;
}

/* ─── Conflict Detection (v3.0: active_flags + concentration) ─── */

function resolveConcentrationSeverity(
  rule: ConflictRule,
  productsA: Product[],
  productsB: Product[]
): "critical" | "high" | "medium" | "low" {
  if (!rule.concentrationModifier) return rule.severity;

  const allProducts = [...productsA, ...productsB];
  const levels = allProducts
    .map((p) => p.concentration_level)
    .filter(Boolean) as string[];

  if (levels.length === 0) return rule.severity;

  const hasHigh = levels.includes("high");
  const hasMedium = levels.includes("medium");

  if (hasHigh && rule.concentrationModifier.any_high) {
    return rule.concentrationModifier.any_high.severity;
  }
  if (hasMedium && rule.concentrationModifier.any_medium) {
    return rule.concentrationModifier.any_medium.severity;
  }
  if (
    levels.every((l) => l === "low") &&
    rule.concentrationModifier.both_low
  ) {
    return rule.concentrationModifier.both_low.severity;
  }
  return rule.severity;
}

export function checkConflicts(
  products: RoutineProduct[],
  skinType?: string
): DetectedConflict[] {
  const conflicts: DetectedConflict[] = [];

  for (const rule of CONFLICT_RULES) {
    if (!rule.enabled) continue;

    if (rule.isMultiActive) {
      // B15: Count active products
      const activeProducts = products.filter(
        (p) => findCategory(p.categoryId)?.tag === "active"
      );
      if (activeProducts.length >= 3) {
        conflicts.push({
          rule,
          severity: rule.severity,
          involvedProducts: activeProducts.map((p) => p.name),
        });
      }
      continue;
    }

    // Match using both categoryId and active_flags
    const allActiveIds = products.map((p) => ({
      product: p,
      ids: getActiveIds(p),
    }));

    const matchA = allActiveIds.filter((pa) =>
      rule.a.some((a) => pa.ids.includes(a))
    );
    const matchB = allActiveIds.filter((pa) =>
      rule.b.some((b) => pa.ids.includes(b))
    );

    if (matchA.length > 0 && matchB.length > 0) {
      let severity = resolveConcentrationSeverity(
        rule,
        matchA.map((m) => m.product),
        matchB.map((m) => m.product)
      );

      // Skin type modifier
      if (skinType && rule.skinTypeModifier?.[skinType]) {
        const bump = rule.skinTypeModifier[skinType].severityBump;
        const levels: Array<"low" | "medium" | "high" | "critical"> = [
          "low",
          "medium",
          "high",
          "critical",
        ];
        const idx = levels.indexOf(severity);
        if (idx >= 0 && idx + bump < levels.length) {
          severity = levels[idx + bump];
        }
      }

      const involvedNames = [
        ...matchA.map((m) => m.product.name),
        ...matchB.map((m) => m.product.name),
      ];
      conflicts.push({
        rule,
        severity,
        involvedProducts: [...new Set(involvedNames)],
      });
    }
  }

  // Sort by priority
  conflicts.sort((a, b) => a.rule.priority - b.rule.priority);
  return conflicts;
}

/* ─── Missing Steps ─── */

export function checkMissingSteps(
  products: RoutineProduct[]
): MissingStep[] {
  const categoryIds = products.map((p) => p.categoryId);
  const allActiveIds = products.flatMap((p) => getActiveIds(p));
  const missing: MissingStep[] = [];

  for (const rule of MISSING_STEP_RULES) {
    switch (rule.check) {
      case "no_sunscreen_am":
        if (!categoryIds.includes("sunscreen")) {
          missing.push(rule);
        }
        break;
      case "retinol_no_sunscreen":
        if (
          allActiveIds.includes("retinol") &&
          !categoryIds.includes("sunscreen")
        ) {
          missing.push(rule);
        }
        break;
      case "no_moisturizer":
        if (
          !categoryIds.includes("cream") &&
          !categoryIds.includes("lotion")
        ) {
          missing.push(rule);
        }
        break;
      case "no_cleanser":
        if (!categoryIds.includes("cleanser")) {
          missing.push(rule);
        }
        break;
    }
  }

  return missing;
}

/* ─── Routine Sorting ─── */

function sortByOrder(products: RoutineProduct[]): RoutineProduct[] {
  return [...products].sort((a, b) => {
    const catA = findCategory(a.categoryId);
    const catB = findCategory(b.categoryId);
    return (catA?.order ?? 99) - (catB?.order ?? 99);
  });
}

function buildAMRoutine(products: RoutineProduct[]): RoutineProduct[] {
  const amProducts = products.filter((p) => {
    const cat = findCategory(p.categoryId);
    return cat && (cat.time === "am" || cat.time === "both");
  });
  return sortByOrder(amProducts);
}

function buildPMRoutine(products: RoutineProduct[]): RoutineProduct[] {
  const pmProducts = products.filter((p) => {
    const cat = findCategory(p.categoryId);
    return cat && (cat.time === "pm" || cat.time === "both");
  });
  return sortByOrder(pmProducts);
}

/* ─── Scoring ─── */

function calculateScore(
  conflicts: DetectedConflict[],
  missingSteps: MissingStep[],
  products: RoutineProduct[]
): number {
  let score = SCORE.BASE;

  for (const c of conflicts) {
    score -= SCORE.PENALTY[c.severity];
  }

  for (const m of missingSteps) {
    score -= SCORE.MISSING_STEP[m.priority];
  }

  // Bonus for balanced routine
  const categoryIds = new Set(products.map((p) => p.categoryId));
  if (categoryIds.size >= 5) score += SCORE.BONUS.BALANCED_ROUTINE;
  if (categoryIds.has("sunscreen")) score += SCORE.BONUS.HAS_SUNSCREEN;

  return Math.max(0, Math.min(100, score));
}

/* ─── AM/PM Tips ─── */

function generateAMTips(
  products: RoutineProduct[],
  skinType?: string,
  concerns?: string[]
): string[] {
  const tips: string[] = [];
  const ids = products.flatMap((p) => getActiveIds(p));

  tips.push("아침에는 가벼운 제형 위주로 사용해 주세요!");

  if (ids.includes("sunscreen")) {
    tips.push(
      "선크림은 외출 20분 전, 500원 동전 크기만큼 넉넉하게 발라주세요."
    );
  }
  if (ids.includes("vitamin_c")) {
    tips.push(
      "비타민C는 아침에 사용하면 선크림과 시너지 효과로 자외선 방어력이 높아져요."
    );
  }

  if (skinType === "oily") {
    tips.push(
      "지성피부는 아침 클렌징을 가볍게, 토너로 피지를 정돈해 주세요."
    );
  } else if (skinType === "dry") {
    tips.push("건성피부는 아침에도 에센스로 수분을 먼저 채워주세요.");
  }

  if (concerns?.includes("pigment")) {
    tips.push("잡티 고민이라면 아침에 비타민C 세럼을 추가해 보세요.");
  }

  return tips;
}

function generatePMTips(
  products: RoutineProduct[],
  skinType?: string
): string[] {
  const tips: string[] = [];
  const ids = products.flatMap((p) => getActiveIds(p));
  const categoryIds = products.map((p) => p.categoryId);

  tips.push("저녁에는 두꺼운 크림으로 수분을 봉인해 주세요.");

  if (categoryIds.includes("oil_cleanser")) {
    tips.push(
      "오일클렌저 → 폼클렌저 이중세안으로 모공 속까지 깨끗하게 해주세요."
    );
  } else {
    tips.push("이중세안(오일+폼)을 하면 모공 속 노폐물까지 깔끔해져요.");
  }

  if (ids.includes("retinol")) {
    tips.push(
      "레티놀은 반드시 저녁에만! 다음 날 아침 선크림은 필수예요."
    );
  }
  if (ids.includes("aha") || ids.includes("bha")) {
    tips.push(
      "각질케어 제품은 저녁 토너 후에 사용하고, 다음 날 선크림을 꼭 챙겨주세요."
    );
  }

  if (skinType === "dry") {
    tips.push("건성피부는 크림 위에 오일이나 수면팩을 덧발라 보세요.");
  } else if (skinType === "sensitive") {
    tips.push(
      "민감피부는 시카·세라마이드 위주로 장벽 회복에 집중해 주세요."
    );
  }

  return tips;
}

/* ─── 7-Day Calendar ─── */

function buildCalendar(products: RoutineProduct[]): DaySchedule[] {
  const days = WEEKDAY_NAMES_KO;
  const ids = products.flatMap((p) => getActiveIds(p));
  const hasRetinol = ids.includes("retinol");
  const hasAHA =
    ids.includes("aha") || ids.includes("bha") || ids.includes("pha");

  return days.map((day, i) => {
    let isRetinolDay = false;
    let isExfoliateDay = false;
    let pmIcon = "moon";
    let pmLabel = "기본 루틴";

    const isRetinolSchedule = (SCHEDULE_DAYS.RETINOL as readonly number[]).includes(i);
    const isExfoliateSchedule = (SCHEDULE_DAYS.EXFOLIATE as readonly number[]).includes(i);

    if (hasRetinol && isRetinolSchedule) {
      isRetinolDay = true;
      pmIcon = "purple-heart";
      pmLabel = "레티놀";
    } else if (hasAHA && isExfoliateSchedule) {
      isExfoliateDay = true;
      pmIcon = "sparkle";
      pmLabel = "각질케어";
    }

    return { day, isRetinolDay, isExfoliateDay, pmIcon, pmLabel };
  });
}

/* ─── Main Analysis ─── */

export function analyzeRoutine(
  products: RoutineProduct[],
  skinType?: string,
  concerns?: string[]
): AnalysisResult {
  const amProducts = buildAMRoutine(products);
  const pmProducts = buildPMRoutine(products);
  const conflicts = checkConflicts(products, skinType);
  const missingSteps = checkMissingSteps(products);
  const score = calculateScore(conflicts, missingSteps, products);
  const amTips = generateAMTips(amProducts, skinType, concerns);
  const pmTips = generatePMTips(pmProducts, skinType);
  const calendar = buildCalendar(products);
  const allIds = products.flatMap((p) => getActiveIds(p));

  return {
    score,
    amProducts,
    pmProducts,
    conflicts,
    missingSteps,
    amTips,
    pmTips,
    calendar,
    hasSunscreen: products.some((p) => p.categoryId === "sunscreen"),
    hasRetinol: allIds.includes("retinol"),
    hasAHA:
      allIds.includes("aha") ||
      allIds.includes("bha") ||
      allIds.includes("pha"),
  };
}

/* ─── Score Helpers ─── */

export function scoreColor(score: number): string {
  if (score >= 90) return "#059669";
  if (score >= 80) return "#F59E0B";
  if (score >= 60) return "#D97706";
  return "#DC2626";
}

export function scoreLabel(score: number): string {
  if (score >= 90) return "완벽한 루틴!";
  if (score >= 80) return "좋은 루틴이에요";
  if (score >= 60) return "개선하면 더 좋아져요";
  return "점검이 필요해요";
}

export function severityConfig(severity: string) {
  switch (severity) {
    case "critical":
      return {
        bg: "#FEE2E2",
        border: "#FCA5A5",
        text: "#991B1B",
        label: "위험",
        badge: "#DC2626",
      };
    case "high":
      return {
        bg: "#FEE2E2",
        border: "#FCA5A5",
        text: "#991B1B",
        label: "높음",
        badge: "#DC2626",
      };
    case "medium":
      return {
        bg: "#FEF3C7",
        border: "#FCD34D",
        text: "#92400E",
        label: "중간",
        badge: "#D97706",
      };
    default:
      return {
        bg: "#ECFDF5",
        border: "#6EE7B7",
        text: "#065F46",
        label: "낮음",
        badge: "#059669",
      };
  }
}
