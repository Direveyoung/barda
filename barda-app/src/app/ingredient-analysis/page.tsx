"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { ALL_PRODUCTS, type Product, CATEGORIES, type CategoryItem } from "@/data/products";
import { searchProducts } from "@/lib/search";
import {
  INGREDIENT_DB,
  CATEGORY_LABELS,
  CATEGORY_ICON,
  SKIN_TYPE_LABELS,
  lookupIngredient,
  type IngredientInfo,
} from "@/data/ingredients";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";

/* ─── Types ─── */

interface EnrichedData {
  nameEn: string | null;
  casNo: string | null;
  purpose: string | null;
  maxConcentration: string | null;
  regulation: string | null;
  ewgScore: number | null;
  category: string | null;
  sources: string[];
}

interface AnalyzedIngredient {
  name: string;
  info: IngredientInfo | null;
}

interface SynergyPair {
  a: string;
  b: string;
}

interface ConflictPair {
  a: string;
  b: string;
}

interface ProfileData {
  nickname: string;
  skinType: string;
  concerns: string[];
}

/* ─── Helpers ─── */

function getCategoryIcon(categoryId: string): string {
  for (const group of Object.values(CATEGORIES)) {
    const item = group.items.find((i: CategoryItem) => i.id === categoryId);
    if (item) return item.icon;
  }
  return "bottle";
}

function getCategoryLabel(categoryId: string): string {
  for (const group of Object.values(CATEGORIES)) {
    const item = group.items.find((i: CategoryItem) => i.id === categoryId);
    if (item) return item.label;
  }
  return categoryId;
}

function getSafetyColor(score: number): string {
  if (score >= 5) return "text-green-500";
  if (score >= 4) return "text-emerald-500";
  if (score >= 3) return "text-amber-500";
  if (score >= 2) return "text-orange-500";
  return "text-red-500";
}

function getSafetyBg(score: number): string {
  if (score >= 5) return "bg-green-50";
  if (score >= 4) return "bg-emerald-50";
  if (score >= 3) return "bg-amber-50";
  if (score >= 2) return "bg-orange-50";
  return "bg-red-50";
}

function getSafetyDotColor(score: number): string {
  if (score >= 5) return "bg-green-500";
  if (score >= 4) return "bg-emerald-500";
  if (score >= 3) return "bg-amber-500";
  if (score >= 2) return "bg-orange-500";
  return "bg-red-500";
}

function getSafetyLabel(score: number): string {
  if (score >= 5) return "\uB9E4\uC6B0 \uC548\uC804";
  if (score >= 4) return "\uC548\uC804";
  if (score >= 3) return "\uBCF4\uD1B5";
  if (score >= 2) return "\uC8FC\uC758";
  return "\uACBD\uACE0";
}

function getOverallScoreColor(score: number): string {
  if (score >= 4.5) return "text-green-600";
  if (score >= 3.5) return "text-emerald-600";
  if (score >= 2.5) return "text-amber-600";
  if (score >= 1.5) return "text-orange-600";
  return "text-red-600";
}

function getOverallScoreBg(score: number): string {
  if (score >= 4.5) return "bg-green-50 border-green-200";
  if (score >= 3.5) return "bg-emerald-50 border-emerald-200";
  if (score >= 2.5) return "bg-amber-50 border-amber-200";
  if (score >= 1.5) return "bg-orange-50 border-orange-200";
  return "bg-red-50 border-red-200";
}

function getBarColor(score: number): string {
  if (score >= 4.5) return "bg-green-500";
  if (score >= 3.5) return "bg-emerald-500";
  if (score >= 2.5) return "bg-amber-500";
  if (score >= 1.5) return "bg-orange-500";
  return "bg-red-500";
}

/** Render safety dots (filled = score, empty = 5 - score) */
function SafetyDots({ score }: { score: number }) {
  const filled = getSafetyDotColor(score);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${i < score ? filled : "bg-gray-200"}`}
        />
      ))}
    </div>
  );
}

/* ─── Main Component ─── */

export default function IngredientAnalysisPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [enrichedMap, setEnrichedMap] = useState<Record<string, EnrichedData>>({});
  const [enrichedLoading, setEnrichedLoading] = useState(false);

  // Fetch enriched data from external APIs when product is selected
  useEffect(() => {
    if (!selectedProduct?.key_ingredients) {
      setEnrichedMap({});
      return;
    }

    let cancelled = false;
    const ingredients = selectedProduct.key_ingredients;

    async function fetchEnriched() {
      setEnrichedLoading(true);
      const results: Record<string, EnrichedData> = {};

      // Fetch in parallel (max 5 concurrent)
      const batches: string[][] = [];
      for (let i = 0; i < ingredients.length; i += 5) {
        batches.push(ingredients.slice(i, i + 5));
      }

      for (const batch of batches) {
        if (cancelled) break;
        const promises = batch.map(async (name) => {
          try {
            const res = await fetch(`/api/ingredients/lookup?name=${encodeURIComponent(name)}`);
            if (res.ok) {
              const data = await res.json();
              if (data.ingredient) {
                results[name] = data.ingredient as EnrichedData;
              }
            }
          } catch {
            // Silently fail — enriched data is optional
          }
        });
        await Promise.all(promises);
      }

      if (!cancelled) {
        setEnrichedMap(results);
        setEnrichedLoading(false);
      }
    }

    fetchEnriched();
    return () => { cancelled = true; };
  }, [selectedProduct]);

  // Load profile from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const data = localStorage.getItem("barda_profile");
      if (data) {
        const parsed: unknown = JSON.parse(data);
        if (
          parsed &&
          typeof parsed === "object" &&
          "skinType" in parsed &&
          typeof (parsed as ProfileData).skinType === "string"
        ) {
          setProfile(parsed as ProfileData);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Search handler
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setSelectedProduct(null);

    if (query.trim().length >= 1) {
      const results = searchProducts(query, ALL_PRODUCTS, 8);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, []);

  // Select product
  const selectProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setSearchResults([]);
    setSearchQuery(`${product.brand} ${product.name}`);
  }, []);

  // Analyze ingredients for the selected product
  const analyzedIngredients = useMemo((): AnalyzedIngredient[] => {
    if (!selectedProduct?.key_ingredients) return [];
    return selectedProduct.key_ingredients.map((name) => ({
      name,
      info: lookupIngredient(name),
    }));
  }, [selectedProduct]);

  // Overall product safety score
  const overallScore = useMemo((): number => {
    const withInfo = analyzedIngredients.filter((a) => a.info !== null);
    if (withInfo.length === 0) return 0;
    const sum = withInfo.reduce((acc, a) => acc + (a.info?.safetyScore ?? 0), 0);
    return Math.round((sum / withInfo.length) * 10) / 10;
  }, [analyzedIngredients]);

  // Synergy pairs within the product
  const synergyPairs = useMemo((): SynergyPair[] => {
    const pairs: SynergyPair[] = [];
    const seen = new Set<string>();
    for (const a of analyzedIngredients) {
      if (!a.info) continue;
      for (const b of analyzedIngredients) {
        if (!b.info || a.name === b.name) continue;
        const aGoodWithB = a.info.goodWith.some(
          (g) => lookupIngredient(g)?.name === b.info?.name
        );
        if (aGoodWithB) {
          const key = [a.name, b.name].sort().join("||");
          if (!seen.has(key)) {
            seen.add(key);
            pairs.push({ a: a.info.name, b: b.info.name });
          }
        }
      }
    }
    return pairs;
  }, [analyzedIngredients]);

  // Conflict pairs within the product
  const conflictPairs = useMemo((): ConflictPair[] => {
    const pairs: ConflictPair[] = [];
    const seen = new Set<string>();
    for (const a of analyzedIngredients) {
      if (!a.info) continue;
      for (const b of analyzedIngredients) {
        if (!b.info || a.name === b.name) continue;
        const aAvoidsB = a.info.avoidWith.some(
          (g) => lookupIngredient(g)?.name === b.info?.name
        );
        if (aAvoidsB) {
          const key = [a.name, b.name].sort().join("||");
          if (!seen.has(key)) {
            seen.add(key);
            pairs.push({ a: a.info.name, b: b.info.name });
          }
        }
      }
    }
    return pairs;
  }, [analyzedIngredients]);

  // Personalized product recommendations
  const recommendations = useMemo((): Product[] => {
    if (!profile?.skinType) return [];
    const userSkinType = profile.skinType;

    // Find ingredients that are good for the user's skin type
    const goodIngredients = Object.values(INGREDIENT_DB).filter((info) =>
      info.skinTypes.includes(userSkinType)
    );
    const goodIngredientNames = new Set(goodIngredients.map((i) => i.name));

    // Score each product by how many of its ingredients match the user's skin type
    const scored: { product: Product; score: number }[] = [];
    for (const product of ALL_PRODUCTS) {
      // Skip the selected product
      if (selectedProduct && product.id === selectedProduct.id) continue;
      if (!product.key_ingredients || product.key_ingredients.length === 0) continue;

      let matchCount = 0;
      let totalSafety = 0;
      let matched = 0;
      for (const ing of product.key_ingredients) {
        const info = lookupIngredient(ing);
        if (info) {
          matched++;
          totalSafety += info.safetyScore;
          if (goodIngredientNames.has(info.name)) {
            matchCount++;
          }
        }
      }

      if (matchCount === 0) continue;

      const avgSafety = matched > 0 ? totalSafety / matched : 3;
      const score = matchCount * 20 + avgSafety * 10;
      scored.push({ product, score });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 6).map((s) => s.product);
  }, [profile, selectedProduct]);

  const hasAnalysis =
    selectedProduct !== null && analyzedIngredients.length > 0;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                성분 분석
              </h1>
              <p className="text-xs text-gray-400">
                제품의 성분을 AI가 분석해 드려요
              </p>
            </div>
            <Link
              href="/guide"
              className="text-xs text-primary font-medium px-3 py-1.5 rounded-full bg-primary-bg hover:bg-primary/10 transition-colors"
            >
              성분 가이드
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4">
        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="제품명 또는 브랜드를 검색하세요..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 pl-10 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:border-primary/50 bg-white"
          />
          <svg
            className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setSelectedProduct(null);
              }}
              className="absolute right-3.5 top-3 text-gray-300 hover:text-gray-500"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
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
                  <p className="text-sm text-gray-800 truncate">
                    {product.name}
                  </p>
                </div>
                <span className="text-[10px] text-gray-300">
                  {getCategoryLabel(product.categoryId)}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Selected product card */}
        {selectedProduct && (
          <div className="bg-primary-bg rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                분석 대상
              </span>
              <span className="text-[10px] text-gray-400">
                {getCategoryLabel(selectedProduct.categoryId)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Icon name={getCategoryIcon(selectedProduct.categoryId)} size={24} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">
                  {selectedProduct.brand}
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {selectedProduct.name}
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
        )}

        {/* ─── Analysis Results ─── */}
        {hasAnalysis && (
          <>
            {/* Overall Safety Score */}
            {overallScore > 0 && (
              <div
                className={`rounded-2xl border p-4 mb-4 ${getOverallScoreBg(overallScore)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-gray-800">
                    종합 안전 점수
                  </h3>
                  <span
                    className={`text-2xl font-bold ${getOverallScoreColor(overallScore)}`}
                  >
                    {overallScore}
                    <span className="text-sm font-normal text-gray-400">
                      {" "}/ 5
                    </span>
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${getBarColor(overallScore)}`}
                    style={{ width: `${(overallScore / 5) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-2">
                  {analyzedIngredients.filter((a) => a.info).length}개 성분 기반
                  분석 결과
                  {analyzedIngredients.filter((a) => !a.info).length > 0
                    ? ` / ${analyzedIngredients.filter((a) => !a.info).length}개 미등록 성분 제외`
                    : " / 전체 성분 분석 완료"}
                </p>
              </div>
            )}

            {/* Ingredient Synergy Map */}
            {(synergyPairs.length > 0 || conflictPairs.length > 0) && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
                <h3 className="text-sm font-bold text-gray-800 mb-3">
                  성분 시너지 맵
                </h3>

                {synergyPairs.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] text-green-600 font-medium mb-1.5">
                      시너지 조합
                    </p>
                    <div className="space-y-1.5">
                      {synergyPairs.map((pair) => (
                        <div
                          key={`${pair.a}-${pair.b}`}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50"
                        >
                          <span className="text-[10px] font-medium text-green-700">
                            {pair.a}
                          </span>
                          <svg
                            className="w-3 h-3 text-green-400 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                            />
                          </svg>
                          <span className="text-[10px] font-medium text-green-700">
                            {pair.b}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {conflictPairs.length > 0 && (
                  <div>
                    <p className="text-[10px] text-red-500 font-medium mb-1.5">
                      주의 필요 조합
                    </p>
                    <div className="space-y-1.5">
                      {conflictPairs.map((pair) => (
                        <div
                          key={`${pair.a}-${pair.b}`}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50"
                        >
                          <span className="text-[10px] font-medium text-red-600">
                            {pair.a}
                          </span>
                          <svg
                            className="w-3 h-3 text-red-400 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                            />
                          </svg>
                          <span className="text-[10px] font-medium text-red-600">
                            {pair.b}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Individual Ingredient Analysis */}
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3">
                성분별 상세 분석
              </h3>
              <div className="space-y-3">
                {analyzedIngredients.map((item) =>
                  item.info ? (
                    <div
                      key={item.name}
                      className="bg-white rounded-2xl border border-gray-100 p-4"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">
                            <Icon name={CATEGORY_ICON[item.info.category]} size={16} />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {item.info.name}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {item.info.nameEn}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <SafetyDots score={item.info.safetyScore} />
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getSafetyBg(item.info.safetyScore)} ${getSafetyColor(item.info.safetyScore)}`}
                          >
                            {getSafetyLabel(item.info.safetyScore)}
                          </span>
                        </div>
                      </div>

                      {/* Category badge */}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 inline-block mb-2">
                        {CATEGORY_LABELS[item.info.category]}
                      </span>

                      {/* Efficacy */}
                      <p className="text-xs text-gray-600 mb-2">
                        {item.info.efficacy}
                      </p>

                      {/* Caution */}
                      <div className="flex items-start gap-1.5 mb-3">
                        <span className="text-xs text-warning shrink-0">&#9888;&#65039;</span>
                        <p className="text-xs text-gray-400">
                          {item.info.caution}
                        </p>
                      </div>

                      {/* Synergy / Conflict */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {item.info.goodWith.length > 0 && (
                          <div>
                            <p className="text-[10px] text-green-600 font-medium mb-1">
                              함께 쓰면 좋은 성분
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {item.info.goodWith.slice(0, 4).map((g) => (
                                <span
                                  key={g}
                                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-600"
                                >
                                  {g}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {item.info.avoidWith.length > 0 && (
                          <div>
                            <p className="text-[10px] text-red-500 font-medium mb-1">
                              같이 쓰면 주의
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {item.info.avoidWith.map((a) => (
                                <span
                                  key={a}
                                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-500"
                                >
                                  {a}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Skin types */}
                      <div>
                        <p className="text-[10px] text-gray-400 mb-1">
                          추천 피부 타입
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {item.info.skinTypes.map((st) => (
                            <span
                              key={st}
                              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                profile?.skinType === st
                                  ? "bg-primary/10 text-primary font-semibold"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {SKIN_TYPE_LABELS[st] ?? st}
                              {profile?.skinType === st ? " (내 피부)" : ""}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Enriched external data */}
                      {enrichedMap[item.name] && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-[10px] text-gray-400 font-medium mb-1.5">
                            외부 API 데이터
                            {enrichedLoading && " (로딩 중...)"}
                          </p>
                          <div className="space-y-1">
                            {enrichedMap[item.name].purpose && (
                              <p className="text-[10px] text-gray-500">
                                <span className="font-medium">기능성 용도:</span> {enrichedMap[item.name].purpose}
                              </p>
                            )}
                            {enrichedMap[item.name].maxConcentration && (
                              <p className="text-[10px] text-gray-500">
                                <span className="font-medium">최대 배합한도:</span> {enrichedMap[item.name].maxConcentration}
                              </p>
                            )}
                            {enrichedMap[item.name].regulation && (
                              <p className="text-[10px] text-gray-500">
                                <span className="font-medium">규제:</span> {enrichedMap[item.name].regulation}
                              </p>
                            )}
                            {enrichedMap[item.name].ewgScore !== null && (
                              <p className="text-[10px] text-gray-500">
                                <span className="font-medium">EWG 등급:</span>{" "}
                                <span className={
                                  (enrichedMap[item.name].ewgScore ?? 0) <= 2 ? "text-green-600 font-medium" :
                                  (enrichedMap[item.name].ewgScore ?? 0) <= 6 ? "text-amber-600 font-medium" :
                                  "text-red-600 font-medium"
                                }>
                                  {enrichedMap[item.name].ewgScore}
                                </span>
                              </p>
                            )}
                            {enrichedMap[item.name].casNo && (
                              <p className="text-[10px] text-gray-400">
                                CAS: {enrichedMap[item.name].casNo}
                              </p>
                            )}
                            <p className="text-[9px] text-gray-300 mt-1">
                              출처: {enrichedMap[item.name].sources.join(", ")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      key={item.name}
                      className="bg-white rounded-2xl border border-gray-100 p-4"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base text-gray-300">&#10068;</span>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-gray-300">
                            데이터베이스에 미등록된 성분입니다
                          </p>
                        </div>
                      </div>

                      {/* Enriched data for unregistered ingredients */}
                      {enrichedMap[item.name] && (
                        <div className="mt-2 pl-8">
                          <p className="text-[10px] text-blue-500 font-medium mb-1">
                            외부 API에서 찾은 정보
                          </p>
                          <div className="space-y-0.5">
                            {enrichedMap[item.name].nameEn && (
                              <p className="text-[10px] text-gray-500">
                                {enrichedMap[item.name].nameEn}
                              </p>
                            )}
                            {enrichedMap[item.name].purpose && (
                              <p className="text-[10px] text-gray-500">
                                용도: {enrichedMap[item.name].purpose}
                              </p>
                            )}
                            {enrichedMap[item.name].ewgScore !== null && (
                              <p className="text-[10px] text-gray-500">
                                EWG 등급:{" "}
                                <span className={
                                  (enrichedMap[item.name].ewgScore ?? 0) <= 2 ? "text-green-600 font-medium" :
                                  (enrichedMap[item.name].ewgScore ?? 0) <= 6 ? "text-amber-600 font-medium" :
                                  "text-red-600 font-medium"
                                }>
                                  {enrichedMap[item.name].ewgScore}
                                </span>
                              </p>
                            )}
                            <p className="text-[9px] text-gray-300">
                              출처: {enrichedMap[item.name].sources.join(", ")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Personalized Recommendations */}
            {profile?.skinType && recommendations.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-bold text-gray-800">
                    맞춤 추천 제품
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-bg text-primary font-medium">
                    {SKIN_TYPE_LABELS[profile.skinType] ?? profile.skinType}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mb-3">
                  내 피부 타입에 맞는 안전한 성분 위주의 제품을 추천해 드려요
                </p>
                <div className="space-y-2">
                  {recommendations.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => selectProduct(product)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                      <Icon name={getCategoryIcon(product.categoryId)} size={18} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-400">
                          {product.brand}
                        </p>
                        <p className="text-xs font-medium text-gray-700 truncate">
                          {product.name}
                        </p>
                        {product.key_ingredients && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.key_ingredients.slice(0, 3).map((ing) => {
                              const info = lookupIngredient(ing);
                              return (
                                <span
                                  key={ing}
                                  className={`text-[9px] px-1 py-0.5 rounded-full ${
                                    info
                                      ? `${getSafetyBg(info.safetyScore)} ${getSafetyColor(info.safetyScore)}`
                                      : "bg-gray-100 text-gray-400"
                                  }`}
                                >
                                  {ing}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <svg
                        className="w-4 h-4 text-gray-300 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No profile CTA */}
            {!profile?.skinType && (
              <div className="bg-primary-bg rounded-2xl p-4 mb-4 text-center">
                <p className="text-sm font-semibold text-gray-800 mb-1">
                  맞춤 추천을 받고 싶다면?
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  피부 타입을 설정하면 나에게 맞는 제품을 추천해 드려요
                </p>
                <Link
                  href="/mypage/profile"
                  className="inline-block px-5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-light transition-colors"
                >
                  피부 타입 설정하기
                </Link>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!selectedProduct && searchResults.length === 0 && (
          <>
            {/* Feature explanation */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
              <h2 className="text-sm font-bold text-gray-800 mb-2">
                성분 분석이란?
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                제품에 포함된 핵심 성분의 안전도, 효능, 시너지/충돌 관계를 한눈에
                분석해 드려요. {Object.keys(INGREDIENT_DB).length}개 성분
                데이터베이스를 기반으로 정확한 정보를 제공합니다.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-green-700 mb-0.5">
                    안전도 평가
                  </p>
                  <p className="text-[10px] text-green-600">
                    1~5점 기반 성분별 안전 점수
                  </p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-blue-700 mb-0.5">
                    시너지 분석
                  </p>
                  <p className="text-[10px] text-blue-600">
                    성분 간 궁합 자동 분석
                  </p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-0.5">
                    충돌 감지
                  </p>
                  <p className="text-[10px] text-amber-600">
                    같이 쓰면 안 되는 성분 경고
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-purple-700 mb-0.5">
                    맞춤 추천
                  </p>
                  <p className="text-[10px] text-purple-600">
                    내 피부 타입에 딱 맞는 제품
                  </p>
                </div>
              </div>
            </div>

            {/* Popular ingredient info */}
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3">
                인기 성분 TOP 6
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {([
                  "나이아신아마이드",
                  "레티놀",
                  "히알루론산",
                  "비타민C",
                  "세라마이드",
                  "센텔라",
                ] as const).map((key) => {
                  const info = INGREDIENT_DB[key];
                  if (!info) return null;
                  return (
                    <div
                      key={key}
                      className="bg-white rounded-xl border border-gray-100 p-3"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">
                          <Icon name={CATEGORY_ICON[info.category]} size={14} />
                        </span>
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {info.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        <SafetyDots score={info.safetyScore} />
                        <span
                          className={`text-[9px] ml-0.5 ${getSafetyColor(info.safetyScore)}`}
                        >
                          {info.safetyScore}/5
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 line-clamp-2">
                        {info.efficacy}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA to analyze */}
            <div className="bg-primary-bg rounded-2xl p-5 text-center mb-6">
              <p className="text-sm font-semibold text-gray-800 mb-1">
                내 제품의 성분이 궁금하다면?
              </p>
              <p className="text-xs text-gray-500 mb-3">
                위 검색창에서 제품을 검색하고 성분을 분석해 보세요
              </p>
              <Link
                href="/analyze"
                className="inline-block px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-light transition-colors"
              >
                내 루틴 분석하기
              </Link>
            </div>
          </>
        )}

        {/* Selected product but no ingredients */}
        {selectedProduct &&
          (!selectedProduct.key_ingredients ||
            selectedProduct.key_ingredients.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <span className="text-3xl mb-3">&#128300;</span>
              <p className="text-sm font-medium">
                이 제품의 성분 정보가 없어요
              </p>
              <p className="text-xs text-gray-300 mt-1">
                key_ingredients가 등록되지 않은 제품입니다
              </p>
            </div>
          )}
      </main>

      <BottomNav />
    </div>
  );
}
