import { describe, it, expect } from "vitest";
import { searchProducts } from "./search";
import { ALL_PRODUCTS } from "@/data/products";
import type { Product } from "@/data/products";

/* ─── Helper: make minimal product ─── */

function makeProduct(id: string, brand: string, name: string, categoryId: string): Product {
  return { id, brand, name, categoryId };
}

const testProducts: Product[] = [
  makeProduct("t1", "라운드랩", "1025 독도 토너", "toner"),
  makeProduct("t2", "코스알엑스", "AHA 7 화이트헤드 파워리퀴드", "aha"),
  makeProduct("t3", "디오디너리", "나이아신아마이드 10% + 징크 1%", "niacinamide"),
  makeProduct("t4", "이니스프리", "그린티 씨드 세럼", "essence"),
  makeProduct("t5", "라운드랩", "자작나무 수분 크림", "cream"),
  makeProduct("t6", "코스알엑스", "어드밴스드 스네일 92 올인원 크림", "cream"),
  makeProduct("t7", "마녀공장", "퓨어 클렌징 오일", "oil_cleanser"),
  makeProduct("t8", "라로슈포제", "시카플라스트 밤 B5", "cream"),
];

/* ─── Stage 1: Exact Substring Match ─── */

describe("searchProducts - exact match", () => {
  it("finds products by exact brand name", () => {
    const results = searchProducts("라운드랩", testProducts);
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results.every((r) => r.brand === "라운드랩")).toBe(true);
  });

  it("finds products by exact product name", () => {
    const results = searchProducts("독도", testProducts);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].name).toContain("독도");
  });

  it("finds products by combined brand+name search", () => {
    const results = searchProducts("코스알엑스 AHA", testProducts);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].id).toBe("t2");
  });

  it("is case insensitive for ASCII", () => {
    const results = searchProducts("aha", testProducts);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].name.toLowerCase()).toContain("aha");
  });

  it("returns empty for empty query", () => {
    expect(searchProducts("", testProducts)).toHaveLength(0);
    expect(searchProducts("   ", testProducts)).toHaveLength(0);
  });

  it("returns empty for no match", () => {
    const results = searchProducts("존재하지않는브랜드", testProducts);
    expect(results).toHaveLength(0);
  });
});

/* ─── Stage 2: Alias Expansion ─── */

describe("searchProducts - alias expansion", () => {
  it("expands brand alias '라랩' to '라운드랩'", () => {
    const results = searchProducts("라랩", ALL_PRODUCTS);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].brand).toBe("라운드랩");
  });

  it("expands brand alias '코알' to '코스알엑스'", () => {
    const results = searchProducts("코알", ALL_PRODUCTS);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].brand).toBe("코스알엑스");
  });

  it("expands brand alias '이니' to '이니스프리'", () => {
    const results = searchProducts("이니", ALL_PRODUCTS);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].brand).toBe("이니스프리");
  });

  it("expands product alias '갈락' to '갈락토미세스'", () => {
    const results = searchProducts("갈락", ALL_PRODUCTS);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.name.includes("갈락토미세스"))).toBe(true);
  });
});

/* ─── Stage 3: Fuzzy Match ─── */

describe("searchProducts - fuzzy match", () => {
  it("handles typos with Levenshtein distance <= 2", () => {
    // "독돈" is 1 edit from "독도" (within a product name context)
    const results = searchProducts("독돈", testProducts);
    // Should find "독도 토너" via fuzzy
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it("returns results sorted by edit distance (best match first)", () => {
    const results = searchProducts("독도", testProducts);
    // Exact match should always come first
    expect(results[0].name).toContain("독도");
  });
});

/* ─── Max Results ─── */

describe("searchProducts - result limiting", () => {
  it("returns at most maxResults products", () => {
    const results = searchProducts("크림", ALL_PRODUCTS, 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it("defaults to 8 results max", () => {
    const results = searchProducts("크림", ALL_PRODUCTS);
    expect(results.length).toBeLessThanOrEqual(8);
  });
});

/* ─── Deduplication ─── */

describe("searchProducts - deduplication", () => {
  it("does not return duplicate products across stages", () => {
    const results = searchProducts("라운드랩 독도", ALL_PRODUCTS);
    const ids = results.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });
});

/* ─── Integration with Real Product DB (502 products) ─── */

describe("searchProducts - real product DB", () => {
  it("finds products in the 502-product database", () => {
    expect(ALL_PRODUCTS.length).toBeGreaterThanOrEqual(400);
  });

  it("finds 라운드랩 독도 products", () => {
    const results = searchProducts("독도 클렌저", ALL_PRODUCTS);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain("독도");
  });

  it("finds 코스알엑스 스네일 제품", () => {
    const results = searchProducts("스네일 크림", ALL_PRODUCTS);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain("스네일");
  });

  it("search is performant (< 100ms for 502 products)", () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      searchProducts("라운드랩", ALL_PRODUCTS);
    }
    const elapsed = performance.now() - start;
    // 100 searches should complete in < 500ms total (5ms each)
    expect(elapsed).toBeLessThan(500);
  });
});
