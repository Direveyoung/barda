"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Product } from "@/data/products";
import { CATEGORIES, ALL_PRODUCTS } from "@/data/products";
import { searchProducts } from "@/lib/search";
import { findCategory } from "@/lib/analysis";
import type { RoutineProduct } from "@/lib/analysis";
import Icon from "@/components/Icon";

interface Props {
  products: RoutineProduct[];
  skinType?: string;
  concerns?: string[];
  onAdd: (product: RoutineProduct) => void;
  onRemove: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

// Log search to backend
function logSearch(query: string, resultsCount: number, selectedId?: string) {
  fetch("/api/search-logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      results_count: resultsCount,
      selected_product_id: selectedId ?? null,
      fell_through: resultsCount === 0,
    }),
  }).catch(() => {});
}

export default function ProductStep({
  products,
  skinType,
  concerns,
  onAdd,
  onRemove,
  onNext,
  onBack,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showDirectInput, setShowDirectInput] = useState(false);
  const [directBrand, setDirectBrand] = useState("");
  const [directName, setDirectName] = useState("");
  const [directCategory, setDirectCategory] = useState("");
  const [directSubmitted, setDirectSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchLogTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      setShowDirectInput(false);
      setDirectSubmitted(false);
      if (value.trim().length >= 1) {
        const found = searchProducts(value, ALL_PRODUCTS);
        setResults(found);
        setShowResults(true);

        // Debounced search log (logs after 1.5s of inactivity)
        if (searchLogTimer.current) clearTimeout(searchLogTimer.current);
        searchLogTimer.current = setTimeout(() => {
          logSearch(value.trim(), found.length);
        }, 1500);
      } else {
        setResults([]);
        setShowResults(false);
      }
    },
    []
  );

  const handleAdd = useCallback(
    (product: Product) => {
      if (products.some((p) => p.id === product.id)) return;
      onAdd({ ...product, frequency: "daily" });
      // Log product selection
      if (query.trim()) logSearch(query.trim(), results.length, product.id);
      setQuery("");
      setResults([]);
      setShowResults(false);
    },
    [products, onAdd, query, results.length]
  );

  // Submit direct input as product candidate
  const handleDirectSubmit = useCallback(async () => {
    if (!directBrand.trim() || !directName.trim()) return;
    try {
      await fetch("/api/product-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: directBrand.trim(),
          name: directName.trim(),
          category_guess: directCategory || null,
        }),
      });
      setDirectSubmitted(true);

      // Add as temporary product for this session
      const tempProduct: Product = {
        id: `user-${Date.now()}`,
        brand: directBrand.trim(),
        name: directName.trim(),
        categoryId: directCategory || "cream",
      };
      onAdd({ ...tempProduct, frequency: "daily" });
      setDirectBrand("");
      setDirectName("");
      setDirectCategory("");
      setShowDirectInput(false);
      setQuery("");
    } catch { /* ignore */ }
  }, [directBrand, directName, directCategory, onAdd]);

  const handleCategorySelect = useCallback(
    (categoryId: string) => {
      setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
    },
    [selectedCategory]
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filter products by category for browsing
  const categoryProducts = selectedCategory
    ? ALL_PRODUCTS.filter((p) => p.categoryId === selectedCategory)
    : [];

  return (
    <div className="animate-fade-up">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        사용 중인 제품을 등록하세요
      </h2>
      <p className="text-gray-500 mb-6">
        검색하거나 카테고리에서 선택할 수 있어요
      </p>

      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-gray-200 bg-white focus-within:border-primary transition-colors">
          <Icon name="search" size={16} className="text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => query.trim().length >= 1 && setShowResults(true)}
            placeholder="제품명 또는 브랜드를 검색해 보세요"
            className="flex-1 outline-none text-gray-800 placeholder:text-gray-400"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                setShowResults(false);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && results.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-10 mt-2 w-full bg-white rounded-2xl border border-gray-200 shadow-lg max-h-64 overflow-y-auto"
          >
            {results.map((product) => {
              const cat = findCategory(product.categoryId);
              const isAdded = products.some((p) => p.id === product.id);

              return (
                <button
                  key={product.id}
                  onClick={() => handleAdd(product)}
                  disabled={isAdded}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    isAdded ? "opacity-50" : ""
                  }`}
                >
                  <Icon name={cat?.icon ?? "package"} size={20} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {product.brand} {product.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {cat?.label ?? product.categoryId}
                    </div>
                  </div>
                  {isAdded ? (
                    <span className="text-xs text-gray-400">등록됨</span>
                  ) : (
                    <span className="text-primary text-sm">+</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {showResults && query.trim().length >= 1 && results.length === 0 && (
          <div className="absolute z-10 mt-2 w-full bg-white rounded-2xl border border-gray-200 shadow-lg p-4 text-center">
            <p className="text-sm text-gray-500 mb-2">
              검색 결과가 없어요
            </p>
            <button
              type="button"
              onClick={() => {
                setShowResults(false);
                setShowDirectInput(true);
                setDirectBrand("");
                setDirectName(query.trim());
              }}
              className="text-xs text-primary font-medium"
            >
              직접 입력하기 →
            </button>
          </div>
        )}
      </div>

      {/* Direct Input Form */}
      {showDirectInput && (
        <div className="mb-4 bg-gray-50 rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">제품 직접 입력</h4>
            <button
              type="button"
              onClick={() => setShowDirectInput(false)}
              className="text-xs text-gray-400"
            >
              닫기
            </button>
          </div>

          {directSubmitted ? (
            <div className="text-center py-2">
              <p className="text-xs text-green-600 font-medium">
                등록되었어요! 제품 DB에 반영될 예정이에요
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <input
                type="text"
                value={directBrand}
                onChange={(e) => setDirectBrand(e.target.value)}
                placeholder="브랜드명 (예: 라운드랩)"
                maxLength={50}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-primary/50"
              />
              <input
                type="text"
                value={directName}
                onChange={(e) => setDirectName(e.target.value)}
                placeholder="제품명 (예: 독도 토너)"
                maxLength={100}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-primary/50"
              />
              <select
                value={directCategory}
                onChange={(e) => setDirectCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-primary/50 text-gray-600"
              >
                <option value="">카테고리 선택 (선택사항)</option>
                {Object.entries(CATEGORIES).map(([, group]) =>
                  group.items.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))
                )}
              </select>
              <button
                type="button"
                onClick={handleDirectSubmit}
                disabled={!directBrand.trim() || !directName.trim()}
                className="w-full py-2.5 text-sm font-medium rounded-xl bg-primary text-white disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
              >
                등록하기
              </button>
              <p className="text-[10px] text-gray-400 text-center">
                입력하신 제품은 검토 후 정식 DB에 추가됩니다
              </p>
            </div>
          )}
        </div>
      )}

      {/* Category Browse */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.entries(CATEGORIES).map(([groupKey, group]) =>
            group.items.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Icon name={cat.icon} size={14} /> {cat.label}
              </button>
            ))
          )}
        </div>

        {selectedCategory && categoryProducts.length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-3 max-h-48 overflow-y-auto">
            {categoryProducts.map((product) => {
              const isAdded = products.some((p) => p.id === product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => handleAdd(product)}
                  disabled={isAdded}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left hover:bg-white transition-colors ${
                    isAdded ? "opacity-50" : ""
                  }`}
                >
                  <span className="text-sm text-gray-800">
                    {product.brand} {product.name}
                  </span>
                  {isAdded ? (
                    <span className="text-xs text-gray-400">등록됨</span>
                  ) : (
                    <span className="text-primary text-sm font-bold">+</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Products */}
      {products.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            등록된 제품 ({products.length})
          </h3>
          <div className="space-y-2">
            {products.map((product) => {
              const cat = findCategory(product.categoryId);
              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-gray-200"
                >
                  <Icon name={cat?.icon ?? "package"} size={20} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {product.brand} {product.name}
                    </div>
                    <div className="text-xs text-gray-400">{cat?.label}</div>
                  </div>
                  <button
                    onClick={() => onRemove(product.id)}
                    className="text-gray-400 hover:text-danger transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-2xl font-semibold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          이전
        </button>
        <button
          onClick={onNext}
          disabled={products.length < 2}
          className="flex-[2] py-3.5 rounded-2xl font-semibold text-white bg-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-light transition-colors"
        >
          {products.length < 2
            ? `제품을 ${2 - products.length}개 더 추가해 주세요`
            : "분석 시작하기"}
        </button>
      </div>
    </div>
  );
}
