"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { CATEGORIES } from "@/data/products";
import { getCategoryLabel, getCategoryIcon } from "@/lib/analysis";
import Icon from "@/components/Icon";
import {
  PageHeader,
  SearchInput,
  StatusBadge,
  DataTable,
  type Column,
} from "@/components/admin/shared";

const ADMIN_PW =
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "barda2026";

interface DBProduct {
  id: string;
  legacy_id: string;
  name: string;
  brand_name: string;
  category_id: string;
  active_flags: string[];
  concentration_level: string | null;
  key_ingredients: string[];
  tags: string[];
  source: string;
  verified: boolean;
  is_active: boolean;
  created_at: string;
}

const ALL_CATEGORIES = Object.values(CATEGORIES).flatMap((g) => g.items);

export default function AdminProductsPage() {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [page] = useState(1);

  // Selected for detail / edit / delete
  const [selected, setSelected] = useState<DBProduct | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<DBProduct>>({});
  const [saving, setSaving] = useState(false);

  // Derived unique brands from loaded data
  const brands = useMemo(
    () => [...new Set(products.map((p) => p.brand_name))].sort(),
    [products]
  );

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "502",
      ...(search ? { search } : {}),
      ...(categoryFilter !== "all" ? { category: categoryFilter } : {}),
      ...(brandFilter !== "all" ? { brand: brandFilter } : {}),
    });
    try {
      const res = await fetch(`/api/admin/products?${params}`, {
        headers: { "x-admin-password": ADMIN_PW },
      });
      if (!res.ok) {
        setError(`서버 오류: ${res.status}`);
        return;
      }
      const json = await res.json();
      setProducts(json.products ?? []);
      setTotal(json.total ?? 0);
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, brandFilter]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchProducts, search]);

  // Stats from loaded data
  const stats = useMemo(
    () => ({
      total,
      verified: products.filter((p) => p.verified).length,
      brands: brands.length,
      categories: ALL_CATEGORIES.length,
    }),
    [products, total, brands]
  );

  // Patch product
  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": ADMIN_PW,
        },
        body: JSON.stringify({ id: selected.id, ...editData }),
      });
      if (res.ok) {
        await fetchProducts();
        setSelected(null);
        setEditMode(false);
      }
    } finally {
      setSaving(false);
    }
  }

  // Delete product
  async function handleDelete(id: string) {
    if (!confirm("이 제품을 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/products?id=${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": ADMIN_PW },
    });
    setSelected(null);
    fetchProducts();
  }

  const columns: Column<DBProduct>[] = [
    {
      key: "brand_name",
      label: "브랜드",
      width: "120px",
      render: (p) => (
        <span className="text-xs font-medium text-gray-600">{p.brand_name}</span>
      ),
      sortValue: (p) => p.brand_name,
    },
    {
      key: "name",
      label: "제품명",
      render: (p) => (
        <button
          type="button"
          onClick={() => {
            setSelected(p);
            setEditMode(false);
            setEditData({});
          }}
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
          <Icon name={getCategoryIcon(p.category_id)} size={12} />
          {getCategoryLabel(p.category_id)}
        </span>
      ),
      sortValue: (p) => p.category_id,
    },
    {
      key: "key_ingredients",
      label: "핵심성분",
      width: "80px",
      render: (p) => (
        <span className="text-xs text-gray-500">
          {p.key_ingredients?.length ?? 0}종
        </span>
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
      sortValue: (p) => (p.verified ? 1 : 0),
    },
    {
      key: "active",
      label: "활성",
      width: "60px",
      render: (p) => (
        <StatusBadge
          status={p.is_active ? "enabled" : "disabled"}
          label={p.is_active ? "활성" : "비활성"}
        />
      ),
      sortValue: (p) => (p.is_active ? 1 : 0),
    },
  ];

  return (
    <div>
      <PageHeader
        title="제품 관리"
        description={`Supabase DB · 총 ${total}개 제품 · ${stats.brands}개 브랜드`}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: "전체 제품", value: stats.total },
          { label: "검증 완료", value: stats.verified },
          { label: "브랜드", value: stats.brands },
          { label: "카테고리", value: stats.categories },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-gray-100 p-3 text-center"
          >
            <p className="text-lg font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="브랜드 또는 제품명 검색..."
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">전체 카테고리</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">전체 브랜드</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="inline-block w-6 h-6 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin mb-2" />
          <p className="text-sm text-gray-500">Supabase에서 데이터 로딩 중...</p>
        </div>
      ) : (
        <DataTable columns={columns} data={products} />
      )}

      {/* Product Detail / Edit Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelected(null);
              setEditMode(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">{selected.name}</h2>
                <p className="text-xs text-gray-400">{selected.brand_name}</p>
              </div>
              <div className="flex gap-2">
                {!editMode && (
                  <>
                    <button
                      onClick={() => {
                        setEditMode(true);
                        setEditData({
                          name: selected.name,
                          verified: selected.verified,
                          is_active: selected.is_active,
                          key_ingredients: selected.key_ingredients,
                          tags: selected.tags,
                        });
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-medium"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(selected.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium"
                    >
                      삭제
                    </button>
                  </>
                )}
                <button
                  onClick={() => { setSelected(null); setEditMode(false); }}
                  className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {editMode ? (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">제품명</label>
                    <input
                      value={editData.name ?? ""}
                      onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">핵심 성분 (쉼표 구분)</label>
                    <input
                      value={(editData.key_ingredients ?? []).join(", ")}
                      onChange={(e) =>
                        setEditData((d) => ({
                          ...d,
                          key_ingredients: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">태그 (쉼표 구분)</label>
                    <input
                      value={(editData.tags ?? []).join(", ")}
                      onChange={(e) =>
                        setEditData((d) => ({
                          ...d,
                          tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editData.verified ?? false}
                        onChange={(e) => setEditData((d) => ({ ...d, verified: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">검증 완료</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editData.is_active ?? true}
                        onChange={(e) => setEditData((d) => ({ ...d, is_active: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">활성</span>
                    </label>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? "저장 중..." : "저장"}
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Row label="ID" value={selected.legacy_id} mono />
                  <Row label="카테고리" value={getCategoryLabel(selected.category_id)} />
                  <Row label="소스" value={selected.source} />
                  <Row
                    label="핵심 성분"
                    value={selected.key_ingredients?.join(", ") ?? "—"}
                  />
                  <Row
                    label="태그"
                    value={selected.tags?.join(", ") ?? "—"}
                  />
                  <Row
                    label="액티브 플래그"
                    value={selected.active_flags?.join(", ") || "없음"}
                  />
                  {selected.concentration_level && (
                    <Row label="농도 레벨" value={selected.concentration_level} />
                  )}
                  <Row
                    label="등록일"
                    value={new Date(selected.created_at).toLocaleDateString("ko-KR")}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-gray-50">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className={`text-xs text-gray-700 text-right ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}
