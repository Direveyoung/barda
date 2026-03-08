import { describe, it, expect } from "vitest";
import {
  analyzeRoutine,
  checkConflicts,
  checkMissingSteps,
  findCategory,
  scoreColor,
  scoreLabel,
  severityConfig,
} from "./analysis";
import type { RoutineProduct } from "./analysis";

/* ─── Test Product Factory ─── */

function makeProduct(
  overrides: Partial<RoutineProduct> & { id: string; brand: string; name: string; categoryId: string }
): RoutineProduct {
  return {
    frequency: "daily",
    ...overrides,
  };
}

const cleanser = makeProduct({ id: "p-cleanser", brand: "라운드랩", name: "독도 클렌저", categoryId: "cleanser" });
const toner = makeProduct({ id: "p-toner", brand: "라운드랩", name: "독도 토너", categoryId: "toner" });
const cream = makeProduct({ id: "p-cream", brand: "코스알엑스", name: "스네일 크림", categoryId: "cream" });
const sunscreen = makeProduct({ id: "p-sun", brand: "라로슈포제", name: "안뗄리오스", categoryId: "sunscreen" });
const retinol = makeProduct({ id: "p-retinol", brand: "디오디너리", name: "레티놀 1%", categoryId: "retinol" });
const aha = makeProduct({ id: "p-aha", brand: "코스알엑스", name: "AHA 파워리퀴드", categoryId: "aha" });
const bha = makeProduct({ id: "p-bha", brand: "코스알엑스", name: "BHA 파워리퀴드", categoryId: "bha" });
const vitaminC = makeProduct({ id: "p-vitc", brand: "멜라노", name: "비타민C 세럼", categoryId: "vitamin_c" });
const niacinamide = makeProduct({ id: "p-nia", brand: "디오디너리", name: "나이아신아마이드 10%", categoryId: "niacinamide" });
const essence = makeProduct({ id: "p-essence", brand: "코스알엑스", name: "갈락토미세스 에센스", categoryId: "essence" });
const pha = makeProduct({ id: "p-pha", brand: "네오젠", name: "PHA 가우징 패드", categoryId: "pha" });

const retinolHigh = makeProduct({
  id: "p-retinol-high", brand: "디오디너리", name: "레티놀 1% (고농도)",
  categoryId: "retinol", concentration_level: "high",
});
const ahaLow = makeProduct({
  id: "p-aha-low", brand: "코스알엑스", name: "AHA (저농도)",
  categoryId: "aha", concentration_level: "low",
});
const retinolLow = makeProduct({
  id: "p-retinol-low", brand: "디오디너리", name: "레티놀 0.2%",
  categoryId: "retinol", concentration_level: "low",
});

/* ─── findCategory ─── */

describe("findCategory", () => {
  it("returns category for valid id", () => {
    const cat = findCategory("cleanser");
    expect(cat).toBeDefined();
    expect(cat?.id).toBe("cleanser");
  });

  it("returns undefined for unknown id", () => {
    expect(findCategory("nonexistent")).toBeUndefined();
  });
});

/* ─── checkConflicts ─── */

describe("checkConflicts", () => {
  it("detects no conflicts for safe routine", () => {
    const conflicts = checkConflicts([cleanser, toner, cream, sunscreen]);
    expect(conflicts).toHaveLength(0);
  });

  it("detects retinol x AHA conflict (B01/B09)", () => {
    const conflicts = checkConflicts([retinol, aha]);
    expect(conflicts.length).toBeGreaterThanOrEqual(1);
    const ruleIds = conflicts.map((c) => c.rule.id);
    expect(ruleIds.some((id) => ["B01", "B09"].includes(id))).toBe(true);
  });

  it("detects retinol x vitamin C conflict (B02)", () => {
    const conflicts = checkConflicts([retinol, vitaminC]);
    const b02 = conflicts.find((c) => c.rule.id === "B02");
    expect(b02).toBeDefined();
    expect(b02?.severity).toBe("high");
  });

  it("detects AHA x BHA conflict (B03)", () => {
    const conflicts = checkConflicts([aha, bha]);
    const b03 = conflicts.find((c) => c.rule.id === "B03");
    expect(b03).toBeDefined();
    expect(b03?.severity).toBe("medium");
  });

  it("detects vitamin C x niacinamide (B04) as low", () => {
    const conflicts = checkConflicts([vitaminC, niacinamide]);
    const b04 = conflicts.find((c) => c.rule.id === "B04");
    expect(b04).toBeDefined();
    expect(b04?.severity).toBe("low");
  });

  it("detects triple conflict retinol + AHA + vitC (B15)", () => {
    const conflicts = checkConflicts([retinol, aha, vitaminC]);
    const b15 = conflicts.find((c) => c.rule.id === "B15");
    expect(b15).toBeDefined();
    expect(b15?.severity).toBe("critical");
  });

  it("bumps severity for sensitive skin", () => {
    const normalConflicts = checkConflicts([vitaminC, niacinamide], "normal");
    const sensitiveConflicts = checkConflicts([vitaminC, niacinamide], "sensitive");
    const normalB04 = normalConflicts.find((c) => c.rule.id === "B04");
    const sensitiveB04 = sensitiveConflicts.find((c) => c.rule.id === "B04");
    expect(normalB04?.severity).toBe("low");
    expect(sensitiveB04?.severity).toBe("medium"); // bumped by 1
  });

  it("adjusts severity by concentration level", () => {
    // Both low retinol + aha should downgrade from critical
    const conflicts = checkConflicts([retinolLow, ahaLow]);
    const b01 = conflicts.find((c) => c.rule.id === "B01");
    expect(b01).toBeDefined();
    expect(b01?.severity).toBe("high"); // both_low downgrades critical -> high
  });

  it("detects retinoid duplication (B12) with two retinol products", () => {
    const retinol2 = makeProduct({ id: "p-retinol-2", brand: "스킨", name: "레티놀 세럼", categoryId: "retinol" });
    const conflicts = checkConflicts([retinol, retinol2]);
    const b12 = conflicts.find((c) => c.rule.id === "B12");
    expect(b12).toBeDefined();
  });

  it("detects multi-active overload (B14) with 3+ actives", () => {
    const conflicts = checkConflicts([retinol, aha, vitaminC, niacinamide]);
    const b14 = conflicts.find((c) => c.rule.id === "B14");
    expect(b14).toBeDefined();
  });

  it("sorts conflicts by priority", () => {
    const conflicts = checkConflicts([retinol, aha, vitaminC, bha]);
    for (let i = 1; i < conflicts.length; i++) {
      expect(conflicts[i].rule.priority).toBeGreaterThanOrEqual(conflicts[i - 1].rule.priority);
    }
  });
});

/* ─── checkMissingSteps ─── */

describe("checkMissingSteps", () => {
  it("reports no sunscreen (E01)", () => {
    const missing = checkMissingSteps([cleanser, toner, cream]);
    const e01 = missing.find((m) => m.id === "E01");
    expect(e01).toBeDefined();
    expect(e01?.priority).toBe("critical");
  });

  it("no missing steps with full routine", () => {
    const missing = checkMissingSteps([cleanser, toner, cream, sunscreen]);
    expect(missing).toHaveLength(0);
  });

  it("reports retinol without sunscreen (E02)", () => {
    const missing = checkMissingSteps([retinol, cleanser, cream]);
    const e02 = missing.find((m) => m.id === "E02");
    expect(e02).toBeDefined();
  });

  it("reports no moisturizer (E03)", () => {
    const missing = checkMissingSteps([cleanser, toner, sunscreen]);
    const e03 = missing.find((m) => m.id === "E03");
    expect(e03).toBeDefined();
    expect(e03?.priority).toBe("warning");
  });

  it("reports no cleanser (E04)", () => {
    const missing = checkMissingSteps([toner, cream, sunscreen]);
    const e04 = missing.find((m) => m.id === "E04");
    expect(e04).toBeDefined();
  });
});

/* ─── analyzeRoutine ─── */

describe("analyzeRoutine", () => {
  it("returns high score for clean routine with no conflicts", () => {
    const result = analyzeRoutine([cleanser, toner, cream, sunscreen, essence], "normal", ["dryness"]);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.conflicts).toHaveLength(0);
    expect(result.missingSteps).toHaveLength(0);
    expect(result.hasSunscreen).toBe(true);
  });

  it("returns lower score for routine with critical conflicts", () => {
    const result = analyzeRoutine([retinol, aha, cream, sunscreen, cleanser], "normal", []);
    expect(result.score).toBeLessThan(90);
    expect(result.conflicts.length).toBeGreaterThan(0);
  });

  it("correctly splits AM/PM products", () => {
    const result = analyzeRoutine([cleanser, toner, vitaminC, sunscreen, retinol, cream], "normal", []);
    // sunscreen + vitaminC should be in AM
    expect(result.amProducts.some((p) => p.categoryId === "sunscreen")).toBe(true);
    expect(result.amProducts.some((p) => p.categoryId === "vitamin_c")).toBe(true);
    // retinol should be in PM
    expect(result.pmProducts.some((p) => p.categoryId === "retinol")).toBe(true);
    // cleanser, toner, cream should be in both
    expect(result.amProducts.some((p) => p.categoryId === "cleanser")).toBe(true);
    expect(result.pmProducts.some((p) => p.categoryId === "cleanser")).toBe(true);
  });

  it("generates 7-day calendar", () => {
    const result = analyzeRoutine([cleanser, toner, cream, sunscreen], "normal", []);
    expect(result.calendar).toHaveLength(7);
    expect(result.calendar[0].day).toBe("월");
    expect(result.calendar[6].day).toBe("일");
  });

  it("marks retinol days in calendar", () => {
    const result = analyzeRoutine([cleanser, retinol, cream, sunscreen], "normal", []);
    expect(result.hasRetinol).toBe(true);
    const retinolDays = result.calendar.filter((d) => d.isRetinolDay);
    expect(retinolDays.length).toBeGreaterThan(0);
  });

  it("marks exfoliate days in calendar for AHA", () => {
    const result = analyzeRoutine([cleanser, aha, cream, sunscreen], "normal", []);
    expect(result.hasAHA).toBe(true);
    const exfoliateDays = result.calendar.filter((d) => d.isExfoliateDay);
    expect(exfoliateDays.length).toBeGreaterThan(0);
  });

  it("generates AM tips", () => {
    const result = analyzeRoutine([cleanser, toner, sunscreen, cream], "oily", []);
    expect(result.amTips.length).toBeGreaterThan(0);
  });

  it("generates PM tips", () => {
    const result = analyzeRoutine([cleanser, retinol, cream, sunscreen], "dry", []);
    expect(result.pmTips.length).toBeGreaterThan(0);
    // Should mention retinol tip
    expect(result.pmTips.some((t) => t.includes("레티놀"))).toBe(true);
  });

  it("score is clamped between 0 and 100", () => {
    // Many conflicts should still not go below 0
    const result = analyzeRoutine([retinol, aha, vitaminC, bha, pha, niacinamide], "sensitive", []);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("detects hasSunscreen flag", () => {
    const withSun = analyzeRoutine([cleanser, sunscreen], "normal", []);
    const noSun = analyzeRoutine([cleanser, cream], "normal", []);
    expect(withSun.hasSunscreen).toBe(true);
    expect(noSun.hasSunscreen).toBe(false);
  });
});

/* ─── Score Helpers ─── */

describe("scoreColor", () => {
  it("returns green for 90+", () => {
    expect(scoreColor(95)).toBe("#059669");
  });
  it("returns amber for 80-89", () => {
    expect(scoreColor(85)).toBe("#F59E0B");
  });
  it("returns orange for 60-79", () => {
    expect(scoreColor(70)).toBe("#D97706");
  });
  it("returns red for <60", () => {
    expect(scoreColor(40)).toBe("#DC2626");
  });
});

describe("scoreLabel", () => {
  it("returns appropriate labels", () => {
    expect(scoreLabel(95)).toBe("완벽한 루틴!");
    expect(scoreLabel(85)).toBe("좋은 루틴이에요");
    expect(scoreLabel(70)).toBe("개선하면 더 좋아져요");
    expect(scoreLabel(40)).toBe("점검이 필요해요");
  });
});

describe("severityConfig", () => {
  it("returns correct config for each severity", () => {
    expect(severityConfig("critical").label).toBe("위험");
    expect(severityConfig("high").label).toBe("높음");
    expect(severityConfig("medium").label).toBe("중간");
    expect(severityConfig("low").label).toBe("낮음");
  });
});
