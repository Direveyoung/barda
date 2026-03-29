"use client";

import { useState, useMemo } from "react";
import { ALL_PRODUCTS, CATEGORIES, type Product } from "@/data/products";
import { getCategoryLabel, getCategoryIcon } from "@/lib/analysis";
import Icon from "@/components/Icon";
import { PageHeader, SearchInput, InMemoryBanner, StatusBadge, DataTable, type Column } from "@/components/admin/shared";

// Flatten category items for filter dropdown
const ALL_CATEGORIES = Object.values(CATEGORIES).flatMap((g) => g.items);

// Unique brands
const ALL_BRANDS = [...new Set(ALL_PRODUCTS.map((p) => p.brand))].sort();

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState<"all" | "verified" | "unverified">("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    let list = ALL_PRODUCTS;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.brand.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.id.includes(q)
      );
    }
    if (categoryFilter !== "all") {
      list = list.filter((p) => p.categoryId === categoryFilter);
    }
    if (brandFilter !== "all") {
      list = list.filter((p) => p.brand === brandFilter);
    }
    if (verifiedFilter !== "all") {
      list = list.filter((p) => verifiedFilter === "verified" ? p.verified : !p.verified);
    }

    return list;
  }, [search, categoryFilter, brandFilter, verifiedFilter]);

  // Stats
  const stats = {
    total: ALL_PRODUCTS.length,
    verified: ALL_PRODUCTS.filter((p) => p.verified).length,
    brands: ALL_BRANDS.length,
    categories: ALL_CATEGORIES.length,
  };

  const columns: Column<Product>[] = [
    {
      key: "brand",
      label: "브랜드",
      width: "120px",
      render: (p) => <span className="text-xs font-medium text-gray-600">{p.brand}</span>,
      sortValue: (p) => p.brand,
    },
    {
      key: "name",
      label: "제품명",
      render: (p) => (
        <button
          type="button"
          onClick={() => setSelectedProduct(p)}
          className="text-sm text-gray-800 hover:text-primary transition-colors text-left"
        >
          {p.name}
        </button>
      ),
      sortValue: (p) => p.name,
    },
    {
      key: "category",
      label: "카테고리",
      width: "130px",
      render: (p) => (
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <Icon name={getCategoryIcon(p.categoryId)} size={12} />
          {getCategoryLabel(p.categoryId)}
        </span>
      ),
      sortValue: (p) => p.categoryId,
    },
    {
      key: "ingredients",
      label: "핵심성분",
      width: "80px",
      render: (p) => (
        <span className="text-xs text-gray-500">{p.key_ingredients?.length ?? 0}종</span>
      ),
      sortValue: (p) => p.key_ingredients?.length ?? 0,
    },
    {
      key: "verified",
      label: "검증",
      width: "60px",
      render: (p) => (
        <StatusBadge
          status={p.verified ? "enabled" : "disabled"}
          label={p.verified ? "검증" : "미검증"}
        />
      ),
      sortValue: (p) => p.verified ? 1 : 0,
    },
  ];

  return (
    <div>
      <PageHeader
        title="제품 관리"
        description={`총 ${stats.total}개 제품 · ${stats.brands}개 브랜드 · ${stats.categories}개 카테고리`}
      />

      <InMemoryBanner />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: "전체 제품", value: stats.total },
          { label: "검증 완료", value: stats.verified },
          { label: "브랜드", value: stats.brands },
          { label: "카테고리", value: stats.categories },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <p className="text-lg font-bold text-gray-800">{s.value}</p>
            <p className="text-[10px] text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="브랜드 또는 제품명 검색..." />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary/50"
          >
            <option value="all">전체 카테고리</option>
            {Object.entries(CATEGORIES).map(([key, group]) => (
              <optgroup key={key} label={group.label}>
                {group.items.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </optgroup>
            ))}
          </select>

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary/50"
          >
            <option value="all">전체 브랜드</option>
            {ALL_BRANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value as "all" | "verified" | "unverified")}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary/50"
          >
            <option value="all">전체 상태</option>
            <option value="verified">검증 완료</option>
            <option value="unverified">미검증</option>
          </select>
        </div>
        <p className="text-xs text-gray-400 mt-2">검색 결과: {filtered.length}개</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <DataTable data={filtered} columns={columns} pageSize={20} />
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedProduct(null)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400">{selectedProduct.brand}</p>
                <h3 className="text-base font-bold text-gray-900">{selectedProduct.name}</h3>
              </div>
              <button type="button" onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">기본 정보</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-gray-400">ID:</span> <span className="text-gray-700">{selectedProduct.id}</span></div>
                  <div><span className="text-gray-400">카테고리:</span> <span className="text-gray-700">{getCategoryLabel(selectedProduct.categoryId)}</span></div>
                  <div><span className="text-gray-400">농도:</span> <span className="text-gray-700">{selectedProduct.concentration_level ?? "-"}</span></div>
                  <div><span className="text-gray-400">출처:</span> <span className="text-gray-700">{selectedProduct.source ?? "-"}</span></div>
                  <div><span className="text-gray-400">검증:</span> <StatusBadge status={selectedProduct.verified ? "enabled" : "disabled"} label={selectedProduct.verified ? "완료" : "미검증"} /></div>
                </div>
              </div>

              {selectedProduct.key_ingredients && selectedProduct.key_ingredients.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">핵심 성분</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProduct.key_ingredients.map((ing) => (
                      <span key={ing} className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{ing}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedProduct.active_flags && selectedProduct.active_flags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">액티브 플래그</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProduct.active_flags.map((flag) => (
                      <span key={flag} className="text-[11px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">{flag}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">태그</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProduct.tags.map((tag) => (
                      <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
