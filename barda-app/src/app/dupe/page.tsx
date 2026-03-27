"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ALL_PRODUCTS, type Product } from "@/data/products";
import { searchProducts } from "@/lib/search";
import { getCategoryLabel, getCategoryIcon } from "@/lib/analysis";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";

/* ─── Types ─── */

type PriceTier = "budget" | "mid" | "premium" | "luxury";
type SortMode = "similarity" | "price_low" | "popularity";

interface DupeResult {
  product: Product;
  similarity: number; // 0~100
  matchedIngredients: string[];
  totalIngredients: number;
  priceTier: PriceTier;
  priceRange: { min: number; max: number };
  popularityScore: number; // 0~100
  concernMatch: string[]; // matched tags (skin concerns)
  badges: ("best_value" | "most_popular" | "highest_match")[];
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

/* ─── Price Range Estimates (category-based, ₩) ─── */
const PRICE_RANGES: Record<PriceTier, Record<string, { min: number; max: number }>> = {
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

function getEstimatedPrice(tier: PriceTier, categoryId: string): { min: number; max: number } {
  const tierPrices = PRICE_RANGES[tier];
  return tierPrices[categoryId] ?? tierPrices._default;
}

function formatPrice(val: number): string {
  if (val >= 10000) return `${(val / 10000).toFixed(val % 10000 === 0 ? 0 : 1)}만`;
  return `${(val / 1000).toFixed(0)}천`;
}

/* ─── Popularity scoring ─── */
function calculatePopularity(product: Product): number {
  let score = 0;
  const tags = product.tags ?? [];
  if (tags.includes("올리브영베스트")) score += 40;
  if (tags.includes("민감성추천")) score += 10;
  if (product.verified) score += 10;
  // Brand recognition bonus (more products = more established)
  const brandCount = ALL_PRODUCTS.filter(p => p.brand === product.brand).length;
  score += Math.min(30, brandCount * 2);
  // Tag richness
  score += Math.min(10, tags.length * 2);
  return Math.min(100, score);
}

/* ─── Concern tags for matching ─── */
const CONCERN_TAGS = new Set(["저자극", "진정", "수분", "안티에이징", "미백", "보습강화", "톤업", "트러블", "각질", "모공", "민감성추천", "피지조절", "탄력", "장벽강화"]);

/* ─── Helpers ─── */

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
      const priceTier = getBrandPriceTier(product.brand);
      const targetTags2 = target.tags ?? [];
      const productTags2 = product.tags ?? [];
      const concernMatch = productTags2.filter(t => CONCERN_TAGS.has(t) && targetTags2.includes(t));

      results.push({
        product,
        similarity,
        matchedIngredients: matched,
        totalIngredients: productIngredients.length,
        priceTier,
        priceRange: getEstimatedPrice(priceTier, product.categoryId),
        popularityScore: calculatePopularity(product),
        concernMatch,
        badges: [],
      });
    }
  }

  // Sort by similarity (highest first)
  results.sort((a, b) => b.similarity - a.similarity);
  const sliced = results.slice(0, 15);

  // Assign badges
  if (sliced.length > 0) {
    // Highest match badge → top similarity
    sliced[0].badges.push("highest_match");

    // Best value badge → highest similarity among budget/mid tier
    const valuePick = sliced
      .filter(d => d.priceTier === "budget" || d.priceTier === "mid")
      .sort((a, b) => b.similarity - a.similarity)[0];
    if (valuePick && !valuePick.badges.includes("highest_match")) {
      valuePick.badges.push("best_value");
    }

    // Most popular badge → highest popularity score
    const popularPick = [...sliced].sort((a, b) => b.popularityScore - a.popularityScore)[0];
    if (popularPick && popularPick.badges.length === 0) {
      popularPick.badges.push("most_popular");
    }
  }

  return sliced;
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
  const [sortMode, setSortMode] = useState<SortMode>("similarity");
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

  // Sorted + filtered dupe results
  const filteredDupes = useMemo(() => {
    let list = dupeResults.filter(d => priceFilter === "all" || d.priceTier === priceFilter);
    if (sortMode === "price_low") {
      list = [...list].sort((a, b) => a.priceRange.min - b.priceRange.min);
    } else if (sortMode === "popularity") {
      list = [...list].sort((a, b) => b.popularityScore - a.popularityScore);
    }
    // similarity is default sort from findDupes
    return list;
  }, [dupeResults, priceFilter, sortMode]);

  // Savings calculation
  const savingsInfo = useMemo(() => {
    if (!selectedProduct || dupeResults.length === 0) return null;
    const originalTier = getBrandPriceTier(selectedProduct.brand);
    const originalPrice = getEstimatedPrice(originalTier, selectedProduct.categoryId);
    const cheapestDupe = [...dupeResults].sort((a, b) => a.priceRange.min - b.priceRange.min)[0];
    if (!cheapestDupe) return null;
    const saving = originalPrice.min - cheapestDupe.priceRange.min;
    if (saving <= 0) return null;
    return {
      originalRange: originalPrice,
      cheapestRange: cheapestDupe.priceRange,
      cheapestProduct: cheapestDupe.product,
      savingEstimate: saving,
    };
  }, [selectedProduct, dupeResults]);

  // Category distribution for SEO-friendly browsing
  const categoryGroups = useMemo(() => {
    const groups: Record<string, { label: string; icon: string; count: number }> = {};
    for (const product of ALL_PRODUCTS) {
      if (!groups[product.categoryId]) {
        groups[product.categoryId] = {
          label: getCategoryLabel(product.categoryId),
          icon: getCategoryIcon(product.categoryId),
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
    <div className="min-h-screen pb-16">
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
                <Icon name={getCategoryIcon(product.categoryId)} size={18} />
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
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${PRICE_TIER_STYLE[getBrandPriceTier(selectedProduct.brand)]}`}>
                  {PRICE_TIER_LABEL[getBrandPriceTier(selectedProduct.brand)]}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Icon name={getCategoryIcon(selectedProduct.categoryId)} size={24} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">{selectedProduct.brand}</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedProduct.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] text-gray-400">
                      {getCategoryLabel(selectedProduct.categoryId)}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium">
                      ~{formatPrice(getEstimatedPrice(getBrandPriceTier(selectedProduct.brand), selectedProduct.categoryId).min)}~{formatPrice(getEstimatedPrice(getBrandPriceTier(selectedProduct.brand), selectedProduct.categoryId).max)}
                    </p>
                  </div>
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

            {/* Savings banner */}
            {savingsInfo && savingsInfo.savingEstimate >= 5000 && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-4 flex items-center gap-3">
                <Icon name="money" size={20} />
                <div className="flex-1">
                  <p className="text-xs font-bold text-green-700">
                    최대 ~{formatPrice(savingsInfo.savingEstimate)} 절약 가능
                  </p>
                  <p className="text-[10px] text-green-600 mt-0.5">
                    {savingsInfo.cheapestProduct.brand} {savingsInfo.cheapestProduct.name}으로 전환 시
                  </p>
                </div>
              </div>
            )}

            {/* Dupe results */}
            {dupeResults.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-800">
                      대안 제품 {dupeResults.length}개
                    </h3>
                  </div>
                  {/* Sort mode */}
                  <div className="flex gap-1">
                    {([
                      ["similarity", "유사도순"],
                      ["price_low", "가격순"],
                      ["popularity", "인기순"],
                    ] as const).map(([mode, label]) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setSortMode(mode)}
                        className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                          sortMode === mode
                            ? "bg-gray-800 text-white"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
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
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${PRICE_TIER_STYLE[getBrandPriceTier(selectedProduct.brand)]}`}>
                            {PRICE_TIER_LABEL[getBrandPriceTier(selectedProduct.brand)]}
                          </span>
                          <span className="text-[9px] text-gray-400">
                            ~{formatPrice(getEstimatedPrice(getBrandPriceTier(selectedProduct.brand), selectedProduct.categoryId).min)}~{formatPrice(getEstimatedPrice(getBrandPriceTier(selectedProduct.brand), selectedProduct.categoryId).max)}
                          </span>
                        </div>
                        <div className="mt-2 space-y-0.5">
                          {(selectedProduct.key_ingredients ?? []).map((ing) => {
                            const isMatched = compareTarget.matchedIngredients.some(
                              m => normalizeIngredient(m) === normalizeIngredient(ing) || normalizeIngredient(m).includes(normalizeIngredient(ing)) || normalizeIngredient(ing).includes(normalizeIngredient(m))
                            );
                            return (
                              <p key={ing} className={`text-[10px] flex items-center gap-0.5 ${isMatched ? "text-green-600 font-medium" : "text-gray-400"}`}>
                                {isMatched ? (
                                  <svg className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                  <span className="w-2.5 h-2.5 shrink-0 flex items-center justify-center"><span className="w-1 h-1 rounded-full bg-gray-300" /></span>
                                )}
                                {ing}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 mb-1">대안 (유사도 {compareTarget.similarity}%)</p>
                        <p className="text-xs font-semibold text-gray-800 mb-1">{compareTarget.product.brand} {compareTarget.product.name}</p>
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${PRICE_TIER_STYLE[compareTarget.priceTier]}`}>
                            {PRICE_TIER_LABEL[compareTarget.priceTier]}
                          </span>
                          <span className="text-[9px] text-gray-400">
                            ~{formatPrice(compareTarget.priceRange.min)}~{formatPrice(compareTarget.priceRange.max)}
                          </span>
                        </div>
                        <div className="mt-2 space-y-0.5">
                          {(compareTarget.product.key_ingredients ?? []).map((ing) => {
                            const isMatched = compareTarget.matchedIngredients.some(
                              m => normalizeIngredient(m) === normalizeIngredient(ing) || normalizeIngredient(m).includes(normalizeIngredient(ing)) || normalizeIngredient(ing).includes(normalizeIngredient(m))
                            );
                            return (
                              <p key={ing} className={`text-[10px] flex items-center gap-0.5 ${isMatched ? "text-green-600 font-medium" : "text-gray-400"}`}>
                                {isMatched ? (
                                  <svg className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                  <span className="w-2.5 h-2.5 shrink-0 flex items-center justify-center"><span className="w-1 h-1 rounded-full bg-gray-300" /></span>
                                )}
                                {ing}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {filteredDupes.map((dupe) => (
                    <div
                      key={dupe.product.id}
                      className={`bg-white rounded-xl border p-3.5 ${
                        dupe.badges.length > 0 ? "border-primary/20" : "border-gray-100"
                      }`}
                    >
                      {/* Badges */}
                      {dupe.badges.length > 0 && (
                        <div className="flex gap-1.5 mb-2">
                          {dupe.badges.includes("highest_match") && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                              가장 유사
                            </span>
                          )}
                          {dupe.badges.includes("best_value") && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold inline-flex items-center gap-0.5">
                              <Icon name="money" size={10} /> Best Value
                            </span>
                          )}
                          {dupe.badges.includes("most_popular") && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold inline-flex items-center gap-0.5">
                              <Icon name="fire" size={10} /> 인기
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <span className="mt-0.5"><Icon name={getCategoryIcon(dupe.product.categoryId)} size={20} /></span>
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

                          {/* Price + Popularity row */}
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-gray-500">
                              ~{formatPrice(dupe.priceRange.min)}~{formatPrice(dupe.priceRange.max)}
                            </span>
                            <span className="text-[10px] text-gray-300">|</span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                              인기
                              <span className="inline-flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span
                                    key={i}
                                    className={`inline-block w-1.5 h-1.5 rounded-full mx-px ${
                                      i < Math.round(dupe.popularityScore / 20)
                                        ? "bg-rose-400"
                                        : "bg-gray-200"
                                    }`}
                                  />
                                ))}
                              </span>
                            </span>
                          </div>

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

                          {/* Concern match */}
                          {dupe.concernMatch.length > 0 && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <span className="text-[10px] text-gray-400">고민 매칭:</span>
                              {dupe.concernMatch.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-500"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Tags + Compare button */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex flex-wrap gap-1">
                              {dupe.product.tags
                                ?.filter(t => !CONCERN_TAGS.has(t))
                                .slice(0, 3)
                                .map((tag) => (
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
                <Icon name="search" size={30} />
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
                    <Icon name={info.icon} size={18} />
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
                같은 카테고리 내에서 성분 유사도, 예상 가격대, 인기도, 피부고민 매칭까지 분석합니다.
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
              <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">가장 유사</span>
                  <span className="text-[10px] text-gray-400">성분이 가장 비슷한 제품</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">Best Value</span>
                  <span className="text-[10px] text-gray-400">가격 대비 유사도 최고</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold">인기</span>
                  <span className="text-[10px] text-gray-400">올리브영 베스트 등 인기 제품</span>
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
