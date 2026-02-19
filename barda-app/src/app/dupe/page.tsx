"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ALL_PRODUCTS, type Product, CATEGORIES, type CategoryItem } from "@/data/products";
import { searchProducts } from "@/lib/search";
import BottomNav from "@/components/BottomNav";

/* ─── Types ─── */

type PriceTier = "budget" | "mid" | "premium" | "luxury";

interface DupeResult {
  product: Product;
  similarity: number; // 0~100
  matchedIngredients: string[];
  totalIngredients: number;
  priceTier: PriceTier;
}

/* ─── Brand Price Tier Mapping ─── */
const LUXURY_BRANDS = new Set(["설화수", "헤라", "오휘", "SK-II", "에스티로더", "랑콤", "시슬리", "라메르", "스킨수티컬즈", "달팡", "바이레도"]);
const PREMIUM_BRANDS = new Set(["아이오페", "프리메라", "탬버린즈", "달바", "AHC", "폴라초이스", "라로슈포제", "바이오더마", "유세린", "비쉬", "DHC", "판클", "쿠라이온"]);
const BUDGET_BRANDS = new Set(["코스알엑스", "이즈앤트리", "퓨리토", "원씽", "바닐라코", "스킨푸드", "에뛰드", "더페이스샵", "미샤", "더인키리스트", "디오디너리", "세라비", "바니크림"]);

function getBrandPriceTier(brand: string): PriceTier {
  if (LUXURY_BRANDS.has(brand)) return "luxury";
  if (PREMIUM_BRANDS.has(brand)) return "premium";
  if (BUDGET_BRANDS.has(brand)) return "budget";
  return "mid";
}

const PRICE_TIER_LABEL: Record<PriceTier, string> = {
  budget: "가성비",
  mid: "중가",
  premium: "프리미엄",
  luxury: "럭셔리",
};

const PRICE_TIER_STYLE: Record<PriceTier, string> = {
  budget: "bg-green-50 text-green-600",
  mid: "bg-blue-50 text-blue-600",
  premium: "bg-purple-50 text-purple-600",
  luxury: "bg-amber-50 text-amber-700",
};

/* ─── Helpers ─── */

function getCategoryLabel(categoryId: string): string {
  for (const group of Object.values(CATEGORIES)) {
    const item = group.items.find((i: CategoryItem) => i.id === categoryId);
    if (item) return item.label;
  }
  return categoryId;
}

function getCategoryEmoji(categoryId: string): string {
  for (const group of Object.values(CATEGORIES)) {
    const item = group.items.find((i: CategoryItem) => i.id === categoryId);
    if (item) return item.emoji;
  }
  return "🧴";
}

/** Normalize ingredient for comparison */
function normalizeIngredient(ing: string): string {
  return ing.trim().toLowerCase().replace(/\s+/g, "");
}

/** Find dupes for a product based on key_ingredients overlap + same/similar category */
function findDupes(target: Product, allProducts: Product[]): DupeResult[] {
  const targetIngredients = (target.key_ingredients ?? []).map(normalizeIngredient);

  if (targetIngredients.length === 0) return [];

  const results: DupeResult[] = [];

  for (const product of allProducts) {
    if (product.id === target.id) continue;

    // Must be same category for a true dupe
    if (product.categoryId !== target.categoryId) continue;

    const productIngredients = (product.key_ingredients ?? []).map(normalizeIngredient);
    if (productIngredients.length === 0) continue;

    // Calculate ingredient overlap
    const matched: string[] = [];
    for (const tIng of targetIngredients) {
      for (const pIng of productIngredients) {
        if (tIng === pIng || tIng.includes(pIng) || pIng.includes(tIng)) {
          // Find the original (non-normalized) name
          const origIdx = productIngredients.indexOf(pIng);
          matched.push(product.key_ingredients?.[origIdx] ?? pIng);
          break;
        }
      }
    }

    if (matched.length === 0) continue;

    // Similarity = overlap ratio considering both sides
    const overlapRatio = matched.length / Math.max(targetIngredients.length, productIngredients.length);
    // Also give credit for tag overlap
    const targetTags = new Set(target.tags ?? []);
    const productTags = new Set(product.tags ?? []);
    let tagOverlap = 0;
    for (const tag of productTags) {
      if (targetTags.has(tag)) tagOverlap++;
    }
    const tagScore = targetTags.size > 0 ? tagOverlap / targetTags.size : 0;

    const similarity = Math.round((overlapRatio * 70 + tagScore * 30));

    if (similarity >= 15) {
      results.push({
        product,
        similarity,
        matchedIngredients: matched,
        totalIngredients: productIngredients.length,
        priceTier: getBrandPriceTier(product.brand),
      });
    }
  }

  // Sort by similarity (highest first)
  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, 15);
}

/* ─── Popular search suggestions ─── */
const POPULAR_SEARCHES = [
  "설화수 자음생",
  "SK-II 에센스",
  "에스티로더 나이트 리페어",
  "랑콤 제니피크",
  "아이오페 레티놀",
];

export default function DupePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [dupeResults, setDupeResults] = useState<DupeResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [priceFilter, setPriceFilter] = useState<PriceTier | "all">("all");
  const [compareTarget, setCompareTarget] = useState<DupeResult | null>(null);

  // Search products
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setSelectedProduct(null);
    setDupeResults([]);
    setHasSearched(false);

    if (query.trim().length >= 1) {
      const results = searchProducts(query, ALL_PRODUCTS, 8);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, []);

  // Select product and find dupes
  const selectProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setSearchResults([]);
    setSearchQuery(`${product.brand} ${product.name}`);
    setHasSearched(true);

    const dupes = findDupes(product, ALL_PRODUCTS);
    setDupeResults(dupes);
  }, []);

  // Category distribution for SEO-friendly browsing
  const categoryGroups = useMemo(() => {
    const groups: Record<string, { label: string; emoji: string; count: number }> = {};
    for (const product of ALL_PRODUCTS) {
      if (!groups[product.categoryId]) {
        groups[product.categoryId] = {
          label: getCategoryLabel(product.categoryId),
          emoji: getCategoryEmoji(product.categoryId),
          count: 0,
        };
      }
      groups[product.categoryId].count++;
    }
    return Object.entries(groups)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);
  }, []);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900 mb-0.5">듀프 파인더</h1>
          <p className="text-xs text-gray-400">비슷한 성분의 대안 제품을 찾아보세요</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4">
        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="제품명 또는 브랜드 검색..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 pl-10 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:border-primary/50 bg-white"
          />
          <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setSelectedProduct(null);
                setDupeResults([]);
                setHasSearched(false);
              }}
              className="absolute right-3.5 top-3 text-gray-300 hover:text-gray-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        {searchResults.length > 0 && !selectedProduct && (
          <div className="bg-white rounded-2xl border border-gray-200 mb-4 overflow-hidden shadow-lg">
            {searchResults.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => selectProduct(product)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
              >
                <span className="text-lg">{getCategoryEmoji(product.categoryId)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">{product.brand}</p>
                  <p className="text-sm text-gray-800 truncate">{product.name}</p>
                </div>
                <span className="text-[10px] text-gray-300">{getCategoryLabel(product.categoryId)}</span>
              </button>
            ))}
          </div>
        )}

        {/* Selected product + dupe results */}
        {selectedProduct && hasSearched && (
          <>
            {/* Original product card */}
            <div className="bg-primary-bg rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  원본 제품
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getCategoryEmoji(selectedProduct.categoryId)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">{selectedProduct.brand}</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedProduct.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {getCategoryLabel(selectedProduct.categoryId)}
                  </p>
                </div>
              </div>
              {(selectedProduct.key_ingredients?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {selectedProduct.key_ingredients?.map((ing) => (
                    <span
                      key={ing}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white text-gray-600"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Dupe results */}
            {dupeResults.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-800">
                      대안 제품 {dupeResults.length}개
                    </h3>
                    <span className="text-[10px] text-gray-400">성분 유사도 기준</span>
                  </div>
                </div>

                {/* Price tier filter */}
                <div className="flex gap-1.5 mb-3 flex-wrap">
                  {(["all", "budget", "mid", "premium", "luxury"] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setPriceFilter(tier)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${
                        priceFilter === tier
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-500 border-gray-200"
                      }`}
                    >
                      {tier === "all" ? "전체" : PRICE_TIER_LABEL[tier]}
                      <span className="ml-0.5 opacity-70">
                        ({tier === "all" ? dupeResults.length : dupeResults.filter(d => d.priceTier === tier).length})
                      </span>
                    </button>
                  ))}
                </div>

                {/* Comparison modal */}
                {compareTarget && selectedProduct && (
                  <div className="bg-white rounded-2xl border-2 border-primary/20 p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-gray-800">성분 비교</h4>
                      <button type="button" onClick={() => setCompareTarget(null)} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-gray-400 mb-1">원본</p>
                        <p className="text-xs font-semibold text-gray-800 mb-1">{selectedProduct.brand} {selectedProduct.name}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${PRICE_TIER_STYLE[getBrandPriceTier(selectedProduct.brand)]}`}>
                          {PRICE_TIER_LABEL[getBrandPriceTier(selectedProduct.brand)]}
                        </span>
                        <div className="mt-2 space-y-0.5">
                          {(selectedProduct.key_ingredients ?? []).map((ing) => {
                            const isMatched = compareTarget.matchedIngredients.some(
                              m => normalizeIngredient(m) === normalizeIngredient(ing) || normalizeIngredient(m).includes(normalizeIngredient(ing)) || normalizeIngredient(ing).includes(normalizeIngredient(m))
                            );
                            return (
                              <p key={ing} className={`text-[10px] ${isMatched ? "text-green-600 font-medium" : "text-gray-400"}`}>
                                {isMatched ? "✓ " : "· "}{ing}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 mb-1">대안 (유사도 {compareTarget.similarity}%)</p>
                        <p className="text-xs font-semibold text-gray-800 mb-1">{compareTarget.product.brand} {compareTarget.product.name}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${PRICE_TIER_STYLE[compareTarget.priceTier]}`}>
                          {PRICE_TIER_LABEL[compareTarget.priceTier]}
                        </span>
                        <div className="mt-2 space-y-0.5">
                          {(compareTarget.product.key_ingredients ?? []).map((ing) => {
                            const isMatched = compareTarget.matchedIngredients.some(
                              m => normalizeIngredient(m) === normalizeIngredient(ing) || normalizeIngredient(m).includes(normalizeIngredient(ing)) || normalizeIngredient(ing).includes(normalizeIngredient(m))
                            );
                            return (
                              <p key={ing} className={`text-[10px] ${isMatched ? "text-green-600 font-medium" : "text-gray-400"}`}>
                                {isMatched ? "✓ " : "· "}{ing}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {dupeResults
                    .filter(d => priceFilter === "all" || d.priceTier === priceFilter)
                    .map((dupe) => (
                    <div
                      key={dupe.product.id}
                      className="bg-white rounded-xl border border-gray-100 p-3.5"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">{getCategoryEmoji(dupe.product.categoryId)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span className="text-xs text-gray-400">{dupe.product.brand}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              dupe.similarity >= 70
                                ? "bg-green-50 text-green-600"
                                : dupe.similarity >= 40
                                ? "bg-amber-50 text-amber-600"
                                : "bg-gray-50 text-gray-500"
                            }`}>
                              유사도 {dupe.similarity}%
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${PRICE_TIER_STYLE[dupe.priceTier]}`}>
                              {PRICE_TIER_LABEL[dupe.priceTier]}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-800">{dupe.product.name}</p>

                          {/* Matched ingredients */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {dupe.matchedIngredients.map((ing) => (
                              <span
                                key={ing}
                                className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-600"
                              >
                                {ing}
                              </span>
                            ))}
                            {(dupe.product.key_ingredients ?? [])
                              .filter((ing) => !dupe.matchedIngredients.includes(ing))
                              .map((ing) => (
                                <span
                                  key={ing}
                                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-50 text-gray-400"
                                >
                                  {ing}
                                </span>
                              ))}
                          </div>

                          {/* Tags + Compare button */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex flex-wrap gap-1">
                              {dupe.product.tags?.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => setCompareTarget(compareTarget?.product.id === dupe.product.id ? null : dupe)}
                              className={`text-[10px] px-2 py-1 rounded-lg font-medium transition-colors ${
                                compareTarget?.product.id === dupe.product.id
                                  ? "bg-primary text-white"
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              }`}
                            >
                              {compareTarget?.product.id === dupe.product.id ? "비교 중" : "비교"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <span className="text-3xl mb-3">🔍</span>
                <p className="text-sm font-medium">비슷한 대안 제품을 찾지 못했어요</p>
                <p className="text-xs text-gray-300 mt-1">
                  같은 카테고리에서 성분이 겹치는 제품이 없습니다
                </p>
              </div>
            )}
          </>
        )}

        {/* Empty state: popular searches + categories */}
        {!selectedProduct && !hasSearched && searchResults.length === 0 && (
          <>
            {/* Popular searches */}
            <section className="mb-6">
              <h3 className="text-sm font-bold text-gray-800 mb-3">인기 검색</h3>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSearch(q)}
                    className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </section>

            {/* Browse by category */}
            <section className="mb-6">
              <h3 className="text-sm font-bold text-gray-800 mb-3">카테고리별 탐색</h3>
              <div className="grid grid-cols-2 gap-2">
                {categoryGroups.map(([catId, info]) => (
                  <Link
                    key={catId}
                    href={`/guide`}
                    className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-2.5 hover:border-primary/30 transition-colors"
                  >
                    <span className="text-lg">{info.emoji}</span>
                    <div>
                      <p className="text-xs font-medium text-gray-700">{info.label}</p>
                      <p className="text-[10px] text-gray-400">{info.count}개 제품</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Info */}
            <section className="bg-gray-50 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">듀프 파인더란?</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                비싼 제품과 비슷한 핵심 성분을 가진 저렴한 대안(dupe)을 찾아주는 기능이에요.
                같은 카테고리 내에서 성분 유사도를 분석하여 추천합니다.
              </p>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">70%+</span>
                  <span className="text-[10px] text-gray-400">매우 유사한 대안</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">40~69%</span>
                  <span className="text-[10px] text-gray-400">부분적으로 유사</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-50 text-gray-500 font-medium">15~39%</span>
                  <span className="text-[10px] text-gray-400">일부 성분 겹침</span>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
