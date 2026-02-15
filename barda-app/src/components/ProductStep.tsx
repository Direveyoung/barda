"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Product } from "@/data/products";
import { CATEGORIES, ALL_PRODUCTS } from "@/data/products";
import { searchProducts } from "@/lib/search";
import { findCategory } from "@/lib/analysis";
import type { RoutineProduct } from "@/lib/analysis";

interface Props {
  products: RoutineProduct[];
  onAdd: (product: RoutineProduct) => void;
  onRemove: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ProductStep({
  products,
  onAdd,
  onRemove,
  onNext,
  onBack,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      if (value.trim().length >= 1) {
        const found = searchProducts(value, ALL_PRODUCTS);
        setResults(found);
        setShowResults(true);
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
      setQuery("");
      setResults([]);
      setShowResults(false);
    },
    [products, onAdd]
  );

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
          <span className="text-gray-400">🔍</span>
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
              ✕
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
                  <span className="text-lg">{cat?.emoji ?? "📦"}</span>
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
          <div className="absolute z-10 mt-2 w-full bg-white rounded-2xl border border-gray-200 shadow-lg p-4 text-center text-gray-500 text-sm">
            검색 결과가 없어요. 카테고리에서 직접 선택해 보세요.
          </div>
        )}
      </div>

      {/* Category Browse */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.entries(CATEGORIES).map(([groupKey, group]) =>
            group.items.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.emoji} {cat.label}
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
                  <span className="text-lg">{cat?.emoji ?? "📦"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {product.brand} {product.name}
                    </div>
                    <div className="text-xs text-gray-400">{cat?.label}</div>
                  </div>
                  <button
                    onClick={() => onRemove(product.id)}
                    className="text-gray-400 hover:text-danger transition-colors text-sm"
                  >
                    ✕
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
