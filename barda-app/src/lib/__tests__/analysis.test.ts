import { describe, it, expect } from "vitest";
import {
  analyzeRoutine,
  checkConflicts,
  checkMissingSteps,
  checkSensitivities,
  findCategory,
  scoreColor,
  scoreLabel,
  severityConfig,
} from "@/lib/analysis";
import type { RoutineProduct } from "@/lib/analysis";

/* ─── Test Fixtures ─── */

function makeProduct(
  overrides: Partial<RoutineProduct> & { id: string; name: string; categoryId: string }
): RoutineProduct {
  return {
    brand: "테스트",
    frequency: "daily",
    ...overrides,
  };
}

const CLEANSER = makeProduct({ id: "cleanser-1", name: "폼클렌저", categoryId: "cleanser", brand: "라운드랩" });
const TONER = makeProduct({ id: "toner-1", name: "독도 토너", categoryId: "toner", brand: "라운드랩" });
const ESSENCE = makeProduct({ id: "essence-1", name: "에센스", categoryId: "essence", brand: "코스알엑스" });
const CREAM = makeProduct({ id: "cream-1", name: "크림", categoryId: "cream", brand: "라운드랩" });
const SUNSCREEN = makeProduct({ id: "sun-1", name: "워터리 선", categoryId: "sunscreen", brand: "비오레" });
const RETINOL = makeProduct({ id: "retinol-1", name: "레티놀 세럼", categoryId: "retinol", active_flags: ["retinol"], concentration_level: "medium", brand: "이니스프리" });
const AHA = makeProduct({ id: "aha-1", name: "AHA 토너", categoryId: "aha", active_flags: ["aha"], concentration_level: "medium", brand: "코스알엑스" });
const BHA = makeProduct({ id: "bha-1", name: "BHA 세럼", categoryId: "bha", active_flags: ["bha"], concentration_level: "medium", brand: "폴라초이스" });
const VITAMIN_C = makeProduct({ id: "vitc-1", name: "비타민C 세럼", categoryId: "vitamin_c", active_flags: ["vitamin_c"], concentration_level: "medium", brand: "멜라노" });
const NIACINAMIDE = makeProduct({ id: "nia-1", name: "나이아신아마이드 세럼", categoryId: "niacinamide", active_flags: ["niacinamide"], brand: "디오디너리" });

/* ─── findCategory ─── */

describe("findCategory", () => {
  it("finds existing category", () => {
    const cat = findCategory("cleanser");
    expect(cat).toBeDefined();
    expect(cat?.id).toBe("cleanser");
    expect(cat?.time).toBe("both");
  });

  it("finds sunscreen category (AM only)", () => {
    const cat = findCategory("sunscreen");
    expect(cat).toBeDefined();
    expect(cat?.time).toBe("am");
  });

  it("finds retinol category (PM only)", () => {
    const cat = findCategory("retinol");
    expect(cat).toBeDefined();
    expect(cat?.time).toBe("pm");
  });

  it("returns undefined for unknown category", () => {
    expect(findCategory("nonexistent")).toBeUndefined();
  });
});

/* ─── checkConflicts ─── */

describe("checkConflicts", () => {
  it("detects retinol x AHA conflict", () => {
    const conflicts = checkConflicts([RETINOL, AHA]);
    const retinolAha = conflicts.filter(
      (c) => c.rule.a.includes("retinol") && c.rule.b.includes("aha")
    );
    expect(retinolAha.length).toBeGreaterThan(0);
    expect(["critical", "high"]).toContain(retinolAha[0].severity);
  });

  it("detects retinol x vitamin C conflict", () => {
    const conflicts = checkConflicts([RETINOL, VITAMIN_C]);
    const found = conflicts.some((c) => c.rule.id === "B02");
    expect(found).toBe(true);
  });

  it("detects AHA x BHA conflict", () => {
    const conflicts = checkConflicts([AHA, BHA]);
    const found = conflicts.some((c) => c.rule.id === "B03");
    expect(found).toBe(true);
  });

  it("no conflict for safe combo (cleanser + toner + cream)", () => {
    const conflicts = checkConflicts([CLEANSER, TONER, CREAM]);
    expect(conflicts.length).toBe(0);
  });

  it("applies skin type modifier to increase severity", () => {
    const normal = checkConflicts([VITAMIN_C, NIACINAMIDE]);
    const sensitive = checkConflicts([VITAMIN_C, NIACINAMIDE], "sensitive");

    const normalB04 = normal.find((c) => c.rule.id === "B04");
    const sensitiveB04 = sensitive.find((c) => c.rule.id === "B04");

    expect(normalB04).toBeDefined();
    expect(sensitiveB04).toBeDefined();
    // Sensitive skin should bump severity by 1 level
    const levels = ["low", "medium", "high", "critical"];
    const normalIdx = levels.indexOf(normalB04!.severity);
    const sensitiveIdx = levels.indexOf(sensitiveB04!.severity);
    expect(sensitiveIdx).toBe(normalIdx + 1);
  });

  it("detects multi-active overload with 3+ actives", () => {
    const products = [RETINOL, AHA, VITAMIN_C];
    const conflicts = checkConflicts(products);
    const multiActive = conflicts.some((c) => c.rule.id === "B14");
    expect(multiActive).toBe(true);
  });

  it("no multi-active warning with only 2 actives", () => {
    const products = [RETINOL, CREAM];
    const conflicts = checkConflicts(products);
    const multiActive = conflicts.some((c) => c.rule.id === "B14");
    expect(multiActive).toBe(false);
  });

  it("applies concentration modifier (both low → reduced severity)", () => {
    const lowRetinol = makeProduct({
      id: "ret-low", name: "저농도 레티놀", categoryId: "retinol",
      active_flags: ["retinol"], concentration_level: "low", brand: "테스트",
    });
    const lowAha = makeProduct({
      id: "aha-low", name: "저농도 AHA", categoryId: "aha",
      active_flags: ["aha"], concentration_level: "low", brand: "테스트",
    });
    const conflicts = checkConflicts([lowRetinol, lowAha]);
    // B01 both_low should reduce severity from critical to high
    const b01 = conflicts.find((c) => c.rule.id === "B01");
    expect(b01).toBeDefined();
    expect(b01!.severity).toBe("high");
  });

  it("sorts conflicts by priority", () => {
    const conflicts = checkConflicts([RETINOL, AHA, VITAMIN_C]);
    for (let i = 1; i < conflicts.length; i++) {
      expect(conflicts[i].rule.priority).toBeGreaterThanOrEqual(
        conflicts[i - 1].rule.priority
      );
    }
  });
});

/* ─── checkMissingSteps ─── */

describe("checkMissingSteps", () => {
  it("detects missing sunscreen", () => {
    const missing = checkMissingSteps([CLEANSER, TONER, CREAM]);
    const noSun = missing.some((m) => m.id === "E01");
    expect(noSun).toBe(true);
  });

  it("detects retinol without sunscreen", () => {
    const missing = checkMissingSteps([CLEANSER, RETINOL, CREAM]);
    const retNoSun = missing.some((m) => m.id === "E02");
    expect(retNoSun).toBe(true);
  });

  it("no retinol warning when sunscreen is present", () => {
    const missing = checkMissingSteps([CLEANSER, RETINOL, CREAM, SUNSCREEN]);
    const retNoSun = missing.some((m) => m.id === "E02");
    expect(retNoSun).toBe(false);
  });

  it("detects missing moisturizer", () => {
    const missing = checkMissingSteps([CLEANSER, TONER, SUNSCREEN]);
    const noMoist = missing.some((m) => m.id === "E03");
    expect(noMoist).toBe(true);
  });

  it("cream satisfies moisturizer requirement", () => {
    const missing = checkMissingSteps([CLEANSER, TONER, CREAM, SUNSCREEN]);
    const noMoist = missing.some((m) => m.id === "E03");
    expect(noMoist).toBe(false);
  });

  it("lotion also satisfies moisturizer requirement", () => {
    const lotion = makeProduct({ id: "lot-1", name: "로션", categoryId: "lotion", brand: "테스트" });
    const missing = checkMissingSteps([CLEANSER, TONER, lotion, SUNSCREEN]);
    const noMoist = missing.some((m) => m.id === "E03");
    expect(noMoist).toBe(false);
  });

  it("detects missing cleanser", () => {
    const missing = checkMissingSteps([TONER, CREAM, SUNSCREEN]);
    const noClean = missing.some((m) => m.id === "E04");
    expect(noClean).toBe(true);
  });

  it("complete routine has no missing steps", () => {
    const missing = checkMissingSteps([CLEANSER, TONER, CREAM, SUNSCREEN]);
    expect(missing.length).toBe(0);
  });
});

/* ─── analyzeRoutine ─── */

describe("analyzeRoutine", () => {
  it("returns complete analysis result", () => {
    const result = analyzeRoutine([CLEANSER, TONER, CREAM, SUNSCREEN]);
    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("amProducts");
    expect(result).toHaveProperty("pmProducts");
    expect(result).toHaveProperty("conflicts");
    expect(result).toHaveProperty("missingSteps");
    expect(result).toHaveProperty("amTips");
    expect(result).toHaveProperty("pmTips");
    expect(result).toHaveProperty("calendar");
    expect(result).toHaveProperty("hasSunscreen");
    expect(result).toHaveProperty("hasRetinol");
    expect(result).toHaveProperty("hasAHA");
  });

  it("perfect routine scores 100", () => {
    // 5+ categories + sunscreen → bonuses, no conflicts or missing steps
    const result = analyzeRoutine([CLEANSER, TONER, ESSENCE, CREAM, SUNSCREEN]);
    expect(result.score).toBe(100);
    expect(result.conflicts.length).toBe(0);
    expect(result.missingSteps.length).toBe(0);
  });

  it("score is capped between 0 and 100", () => {
    const result = analyzeRoutine([CLEANSER, TONER, ESSENCE, CREAM, SUNSCREEN]);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("separates AM and PM products correctly", () => {
    const result = analyzeRoutine([CLEANSER, TONER, SUNSCREEN, RETINOL, CREAM]);
    // Sunscreen is AM only
    expect(result.amProducts.some((p) => p.categoryId === "sunscreen")).toBe(true);
    expect(result.pmProducts.some((p) => p.categoryId === "sunscreen")).toBe(false);
    // Retinol is PM only
    expect(result.pmProducts.some((p) => p.categoryId === "retinol")).toBe(true);
    expect(result.amProducts.some((p) => p.categoryId === "retinol")).toBe(false);
    // Cleanser is both
    expect(result.amProducts.some((p) => p.categoryId === "cleanser")).toBe(true);
    expect(result.pmProducts.some((p) => p.categoryId === "cleanser")).toBe(true);
  });

  it("sorts AM/PM products by category order", () => {
    // Add products in reverse order
    const result = analyzeRoutine([CREAM, SUNSCREEN, TONER, CLEANSER]);
    for (let i = 1; i < result.amProducts.length; i++) {
      const prevCat = findCategory(result.amProducts[i - 1].categoryId);
      const currCat = findCategory(result.amProducts[i].categoryId);
      expect((prevCat?.order ?? 99)).toBeLessThanOrEqual(currCat?.order ?? 99);
    }
  });

  it("detects hasSunscreen flag", () => {
    const withSun = analyzeRoutine([CLEANSER, SUNSCREEN]);
    expect(withSun.hasSunscreen).toBe(true);

    const noSun = analyzeRoutine([CLEANSER, TONER]);
    expect(noSun.hasSunscreen).toBe(false);
  });

  it("detects hasRetinol flag", () => {
    const withRet = analyzeRoutine([CLEANSER, RETINOL, SUNSCREEN]);
    expect(withRet.hasRetinol).toBe(true);
  });

  it("detects hasAHA flag", () => {
    const withAha = analyzeRoutine([CLEANSER, AHA, SUNSCREEN]);
    expect(withAha.hasAHA).toBe(true);

    const withBha = analyzeRoutine([CLEANSER, BHA, SUNSCREEN]);
    expect(withBha.hasAHA).toBe(true);
  });

  it("generates 7-day calendar", () => {
    const result = analyzeRoutine([CLEANSER, TONER, CREAM, SUNSCREEN]);
    expect(result.calendar.length).toBe(7);
    expect(result.calendar[0].day).toBe("월");
    expect(result.calendar[6].day).toBe("일");
  });

  it("calendar marks retinol days (Tue, Thu, Sat)", () => {
    const result = analyzeRoutine([CLEANSER, RETINOL, CREAM, SUNSCREEN]);
    // indexes: 1=화, 3=목, 5=토
    expect(result.calendar[1].isRetinolDay).toBe(true);
    expect(result.calendar[3].isRetinolDay).toBe(true);
    expect(result.calendar[5].isRetinolDay).toBe(true);
    expect(result.calendar[0].isRetinolDay).toBe(false);
  });

  it("calendar marks exfoliate days (Wed, Sun)", () => {
    const result = analyzeRoutine([CLEANSER, AHA, CREAM, SUNSCREEN]);
    // indexes: 2=수, 6=일
    expect(result.calendar[2].isExfoliateDay).toBe(true);
    expect(result.calendar[6].isExfoliateDay).toBe(true);
    expect(result.calendar[0].isExfoliateDay).toBe(false);
  });

  it("generates AM tips", () => {
    const result = analyzeRoutine([CLEANSER, SUNSCREEN, VITAMIN_C, CREAM]);
    expect(result.amTips.length).toBeGreaterThan(0);
    // Should mention sunscreen tip
    expect(result.amTips.some((t) => t.includes("선크림"))).toBe(true);
  });

  it("generates PM tips", () => {
    const result = analyzeRoutine([CLEANSER, RETINOL, CREAM]);
    expect(result.pmTips.length).toBeGreaterThan(0);
    // Should mention retinol tip
    expect(result.pmTips.some((t) => t.includes("레티놀"))).toBe(true);
  });

  it("generates skin-type-specific tips", () => {
    const oily = analyzeRoutine([CLEANSER, TONER, CREAM, SUNSCREEN], "oily");
    expect(oily.amTips.some((t) => t.includes("지성"))).toBe(true);

    const dry = analyzeRoutine([CLEANSER, TONER, CREAM, SUNSCREEN], "dry");
    expect(dry.amTips.some((t) => t.includes("건성"))).toBe(true);
  });

  it("deducts score for conflicts", () => {
    const safe = analyzeRoutine([CLEANSER, TONER, ESSENCE, CREAM, SUNSCREEN]);
    const risky = analyzeRoutine([CLEANSER, RETINOL, AHA, CREAM, SUNSCREEN]);
    expect(risky.score).toBeLessThan(safe.score);
  });

  it("deducts score for missing steps", () => {
    const complete = analyzeRoutine([CLEANSER, TONER, ESSENCE, CREAM, SUNSCREEN]);
    const incomplete = analyzeRoutine([TONER, ESSENCE]); // no cleanser, no cream, no sunscreen
    expect(incomplete.score).toBeLessThan(complete.score);
  });
});

/* ─── Score Helpers ─── */

describe("scoreColor", () => {
  it("returns green for 90+", () => {
    expect(scoreColor(90)).toBe("#059669");
    expect(scoreColor(100)).toBe("#059669");
  });

  it("returns amber for 80-89", () => {
    expect(scoreColor(80)).toBe("#F59E0B");
    expect(scoreColor(89)).toBe("#F59E0B");
  });

  it("returns orange for 60-79", () => {
    expect(scoreColor(60)).toBe("#D97706");
    expect(scoreColor(79)).toBe("#D97706");
  });

  it("returns red for below 60", () => {
    expect(scoreColor(0)).toBe("#DC2626");
    expect(scoreColor(59)).toBe("#DC2626");
  });
});

describe("scoreLabel", () => {
  it("returns correct label for each range", () => {
    expect(scoreLabel(95)).toBe("완벽한 루틴!");
    expect(scoreLabel(85)).toBe("좋은 루틴이에요");
    expect(scoreLabel(70)).toBe("개선하면 더 좋아져요");
    expect(scoreLabel(40)).toBe("점검이 필요해요");
  });
});

describe("severityConfig", () => {
  it("returns config for each severity level", () => {
    expect(severityConfig("critical").label).toBe("위험");
    expect(severityConfig("high").label).toBe("높음");
    expect(severityConfig("medium").label).toBe("중간");
    expect(severityConfig("low").label).toBe("낮음");
  });

  it("unknown severity defaults to low config", () => {
    expect(severityConfig("unknown").label).toBe("낮음");
  });
});

/* ─── checkSensitivities ─── */

describe("checkSensitivities", () => {
  it("returns empty array when no sensitivities", () => {
    const result = checkSensitivities([RETINOL, VITAMIN_C], []);
    expect(result).toEqual([]);
  });

  it("detects sensitivity matching key_ingredients", () => {
    const product = makeProduct({
      id: "test-serum",
      name: "나이아신 세럼",
      categoryId: "niacinamide",
      key_ingredients: ["나이아신아마이드", "히알루론산"],
    });
    const result = checkSensitivities(
      [product],
      [{ ingredientName: "나이아신아마이드", severity: "moderate" }]
    );
    expect(result).toHaveLength(1);
    expect(result[0].ingredientName).toBe("나이아신아마이드");
    expect(result[0].severity).toBe("moderate");
    expect(result[0].foundInProducts).toContain("테스트 나이아신 세럼");
  });

  it("detects sensitivity matching active_flags", () => {
    const result = checkSensitivities(
      [RETINOL],
      [{ ingredientName: "retinol", severity: "severe" }]
    );
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe("severe");
    expect(result[0].foundInProducts.length).toBeGreaterThan(0);
  });

  it("returns no warnings when sensitivity does not match any product", () => {
    const result = checkSensitivities(
      [CLEANSER, TONER],
      [{ ingredientName: "레티놀", severity: "severe" }]
    );
    expect(result).toHaveLength(0);
  });

  it("sorts warnings by severity (severe first)", () => {
    const serum1 = makeProduct({
      id: "s1", name: "세럼A", categoryId: "serum",
      key_ingredients: ["레티놀"],
    });
    const serum2 = makeProduct({
      id: "s2", name: "세럼B", categoryId: "serum",
      key_ingredients: ["나이아신아마이드"],
    });
    const result = checkSensitivities(
      [serum1, serum2],
      [
        { ingredientName: "나이아신아마이드", severity: "mild" },
        { ingredientName: "레티놀", severity: "severe" },
      ]
    );
    expect(result).toHaveLength(2);
    expect(result[0].severity).toBe("severe");
    expect(result[1].severity).toBe("mild");
  });

  it("integrates with analyzeRoutine and reduces score", () => {
    const products = [CLEANSER, TONER, CREAM, SUNSCREEN, RETINOL];
    const withoutSens = analyzeRoutine(products, "normal");
    const withSens = analyzeRoutine(products, "normal", [], [
      { ingredientName: "retinol", severity: "severe" },
    ]);
    expect(withSens.sensitivityWarnings).toHaveLength(1);
    expect(withSens.score).toBeLessThan(withoutSens.score);
  });
});
