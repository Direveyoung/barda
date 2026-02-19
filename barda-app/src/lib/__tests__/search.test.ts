import { describe, it, expect } from "vitest";
import { searchProducts } from "@/lib/search";
import type { Product } from "@/data/products";

/* ─── Test Fixtures ─── */

const SAMPLE_PRODUCTS: Product[] = [
  { id: "roundlab-dokdo-toner", brand: "라운드랩", name: "독도 토너", categoryId: "toner", key_ingredients: ["히알루론산"], tags: ["수분"], source: "manual", verified: true },
  { id: "cosrx-snail-essence", brand: "코스알엑스", name: "어드밴스드 스네일 96 에센스", categoryId: "essence", key_ingredients: ["달팽이뮤신"], tags: ["수분"], source: "manual", verified: true },
  { id: "innisfree-green-tea-serum", brand: "이니스프리", name: "그린티 씨드 세럼", categoryId: "essence", key_ingredients: ["녹차"], tags: ["수분"], source: "manual", verified: true },
  { id: "manyo-bifida-ampoule", brand: "마녀공장", name: "비피다 바이옴 앰플", categoryId: "ampoule", key_ingredients: ["비피다"], tags: ["장벽강화"], source: "manual", verified: true },
  { id: "the-ordinary-niacinamide", brand: "디오디너리", name: "나이아신아마이드 10% + 징크 1%", categoryId: "niacinamide", key_ingredients: ["나이아신아마이드"], tags: ["모공"], source: "manual", verified: true },
  { id: "paulas-choice-bha", brand: "폴라초이스", name: "BHA 리퀴드 엑스폴리언트", categoryId: "bha", active_flags: ["bha"], key_ingredients: ["살리실산"], tags: ["각질"], source: "manual", verified: true },
  { id: "laroche-posay-cicaplast", brand: "라로슈포제", name: "시카플라스트 B5+ 밤", categoryId: "cream", key_ingredients: ["시카", "판테놀"], tags: ["진정"], source: "manual", verified: true },
  { id: "dr-jart-ceramidin", brand: "닥터자르트", name: "세라마이딘 크림", categoryId: "cream", key_ingredients: ["세라마이드"], tags: ["장벽강화"], source: "manual", verified: true },
  { id: "some-by-mi-aha-bha", brand: "썸바이미", name: "AHA BHA PHA 30일 미라클 토너", categoryId: "toner", active_flags: ["aha", "bha", "pha"], key_ingredients: ["AHA", "BHA", "PHA"], tags: ["각질"], source: "manual", verified: true },
  { id: "numbuzin-no3-serum", brand: "넘버즈인", name: "3번 세럼", categoryId: "essence", key_ingredients: ["갈락토미세스"], tags: ["톤업"], source: "manual", verified: true },
];

/* ─── Stage 1: Exact Match ─── */

describe("searchProducts - exact match", () => {
  it("finds by exact Korean brand name", () => {
    const results = searchProducts("라운드랩", SAMPLE_PRODUCTS);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].id).toBe("roundlab-dokdo-toner");
  });

  it("finds by product name (first result is exact match)", () => {
    const results = searchProducts("독도 토너", SAMPLE_PRODUCTS);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].id).toBe("roundlab-dokdo-toner");
  });

  it("finds by partial name (first result contains query)", () => {
    const results = searchProducts("스네일", SAMPLE_PRODUCTS);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].id).toBe("cosrx-snail-essence");
  });

  it("case insensitive for English", () => {
    const results = searchProducts("BHA", SAMPLE_PRODUCTS);
    expect(results.length).toBeGreaterThan(0);
  });

  it("ignores whitespace differences", () => {
    const r1 = searchProducts("독도토너", SAMPLE_PRODUCTS);
    const r2 = searchProducts("독도 토너", SAMPLE_PRODUCTS);
    expect(r1[0].id).toBe(r2[0].id);
    expect(r1[0].id).toBe("roundlab-dokdo-toner");
  });

  it("returns empty for empty query", () => {
    expect(searchProducts("", SAMPLE_PRODUCTS)).toEqual([]);
    expect(searchProducts("  ", SAMPLE_PRODUCTS)).toEqual([]);
  });

  it("respects maxResults limit", () => {
    const results = searchProducts("세럼", SAMPLE_PRODUCTS, 1);
    expect(results.length).toBeLessThanOrEqual(1);
  });
});

/* ─── Stage 2: Alias Match ─── */

describe("searchProducts - alias match", () => {
  it("expands brand alias '라랩' → '라운드랩'", () => {
    const results = searchProducts("라랩", SAMPLE_PRODUCTS);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((r) => r.brand === "라운드랩")).toBe(true);
  });

  it("expands brand alias '코알' → '코스알엑스'", () => {
    const results = searchProducts("코알", SAMPLE_PRODUCTS);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((r) => r.brand === "코스알엑스")).toBe(true);
  });

  it("expands brand alias '이니' → '이니스프리'", () => {
    const results = searchProducts("이니", SAMPLE_PRODUCTS);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((r) => r.brand === "이니스프리")).toBe(true);
  });

  it("expands brand alias '마공' → '마녀공장'", () => {
    const results = searchProducts("마공", SAMPLE_PRODUCTS);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((r) => r.brand === "마녀공장")).toBe(true);
  });

  it("expands brand alias '디오디' → '디오디너리'", () => {
    const results = searchProducts("디오디", SAMPLE_PRODUCTS);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((r) => r.brand === "디오디너리")).toBe(true);
  });

  it("expands brand alias '폴초' → '폴라초이스'", () => {
    const results = searchProducts("폴초", SAMPLE_PRODUCTS);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((r) => r.brand === "폴라초이스")).toBe(true);
  });

  it("expands brand alias '라포제' → '라로슈포제'", () => {
    const results = searchProducts("라포제", SAMPLE_PRODUCTS);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((r) => r.brand === "라로슈포제")).toBe(true);
  });

  it("expands brand alias '닥자' → '닥터자르트'", () => {
    const results = searchProducts("닥자", SAMPLE_PRODUCTS);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((r) => r.brand === "닥터자르트")).toBe(true);
  });

  it("expands brand alias '썸바미' → '썸바이미'", () => {
    const results = searchProducts("썸바미", SAMPLE_PRODUCTS);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((r) => r.brand === "썸바이미")).toBe(true);
  });

  it("expands brand alias '넘즈' → '넘버즈인'", () => {
    const results = searchProducts("넘즈", SAMPLE_PRODUCTS);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((r) => r.brand === "넘버즈인")).toBe(true);
  });

  it("expands product alias '시카플' → '시카플라스트'", () => {
    const results = searchProducts("시카플", SAMPLE_PRODUCTS);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((r) => r.id === "laroche-posay-cicaplast")).toBe(true);
  });

  it("expands product alias '독도'", () => {
    const results = searchProducts("독도", SAMPLE_PRODUCTS);
    expect(results.length).toBeGreaterThanOrEqual(1);
    // 독도 should match the roundlab toner (either exact or alias)
    expect(results[0].id).toBe("roundlab-dokdo-toner");
  });
});

/* ─── Stage 3: Fuzzy Match ─── */

describe("searchProducts - fuzzy match", () => {
  it("finds product with minor typo", () => {
    // "라운드래" (typo: 랩→래)
    const results = searchProducts("라운드래", SAMPLE_PRODUCTS);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].brand).toBe("라운드랩");
  });

  it("finds product with slight variation", () => {
    // "이닛스프리" (extra char)
    const results = searchProducts("이닛스프리", SAMPLE_PRODUCTS);
    expect(results.length).toBeGreaterThan(0);
  });
});

/* ─── Deduplication ─── */

describe("searchProducts - deduplication", () => {
  it("does not return duplicates across stages", () => {
    const results = searchProducts("라운드랩", SAMPLE_PRODUCTS);
    const ids = results.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it("combines results from multiple stages", () => {
    // "라랩" matches via alias (stage 2), may also get fuzzy results
    const results = searchProducts("라랩", SAMPLE_PRODUCTS);
    expect(results.length).toBeGreaterThan(0);
  });
});

/* ─── Edge Cases ─── */

describe("searchProducts - edge cases", () => {
  it("handles single character query", () => {
    const results = searchProducts("크", SAMPLE_PRODUCTS);
    expect(Array.isArray(results)).toBe(true);
  });

  it("handles query with no matches", () => {
    const results = searchProducts("존재하지않는제품", SAMPLE_PRODUCTS);
    expect(results.length).toBe(0);
  });

  it("handles empty product list", () => {
    const results = searchProducts("라운드랩", []);
    expect(results.length).toBe(0);
  });

  it("handles products with missing optional fields", () => {
    const minimal: Product[] = [
      { id: "min-1", brand: "테스트", name: "미니멀 제품", categoryId: "toner" },
    ];
    const results = searchProducts("미니멀", minimal);
    expect(results.length).toBe(1);
  });
});
