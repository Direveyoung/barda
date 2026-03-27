"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import { ALL_PRODUCTS, type Product } from "@/data/products";
import { searchProducts } from "@/lib/search";
import { getCategoryLabel, getCategoryIcon } from "@/lib/analysis";
import Icon from "@/components/Icon";
import { saveDrawerItems, loadDrawerItems, type DrawerItem } from "@/lib/user-data-repository";

const STATUS_CONFIG = {
  unopened: { label: "미개봉", icon: "package", color: "bg-gray-100 text-gray-600" },
  using: { label: "사용 중", icon: "check-circle", color: "bg-green-50 text-green-600" },
  finished: { label: "다 씀", icon: "flag", color: "bg-gray-50 text-gray-400" },
};

function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

export default function DrawerPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<DrawerItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "unopened" | "using" | "finished">("all");

  // Load from DB (dual-read: DB → localStorage fallback)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const userId = user?.id ?? "anonymous";

    loadDrawerItems(userId).then((data) => {
      setItems(data);
      setLoaded(true);
    });
  }, [user]);

  // Save to DB + localStorage
  const saveItems = useCallback((newItems: DrawerItem[]) => {
    setItems(newItems);
    const userId = user?.id ?? "anonymous";
    saveDrawerItems(userId, newItems);
  }, [user]);

  // Search products
  useEffect(() => {
    if (searchQuery.trim().length >= 1) {
      const results = searchProducts(searchQuery, ALL_PRODUCTS, 10);
      // Filter out already added products
      const existing = new Set(items.map((i) => i.productId));
      setSearchResults(results.filter((r) => !existing.has(r.id)));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, items]);

  const addProduct = useCallback((product: Product) => {
    const newItem: DrawerItem = {
      productId: product.id,
      brand: product.brand,
      name: product.name,
      categoryId: product.categoryId,
      openedDate: null,
      status: "unopened",
      addedAt: new Date().toISOString(),
    };
    saveItems([newItem, ...items]);
    setSearchQuery("");
    setShowAddModal(false);
  }, [items, saveItems]);

  const updateStatus = useCallback((productId: string, status: "unopened" | "using" | "finished") => {
    const updated = items.map((item) => {
      if (item.productId !== productId) return item;
      const openedDate = status === "using" && !item.openedDate
        ? new Date().toISOString().slice(0, 10)
        : item.openedDate;
      return { ...item, status, openedDate };
    });
    saveItems(updated);
  }, [items, saveItems]);

  const removeProduct = useCallback((productId: string) => {
    saveItems(items.filter((i) => i.productId !== productId));
  }, [items, saveItems]);

  const filteredItems = filterStatus === "all"
    ? items
    : items.filter((i) => i.status === filterStatus);

  const stats = {
    total: items.length,
    using: items.filter((i) => i.status === "using").length,
    unopened: items.filter((i) => i.status === "unopened").length,
    finished: items.filter((i) => i.status === "finished").length,
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">내 서랍</h1>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-full hover:bg-primary-light transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            제품 추가
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: "전체", value: stats.total, icon: "bottle" },
            { label: "사용 중", value: stats.using, icon: "check-circle" },
            { label: "미개봉", value: stats.unopened, icon: "package" },
            { label: "다 씀", value: stats.finished, icon: "flag" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
              <Icon name={s.icon} size={16} />
              <p className="text-lg font-bold text-gray-800 mt-0.5">{s.value}</p>
              <p className="text-[10px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {(["all", "using", "unopened", "finished"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {status === "all" ? "전체" : STATUS_CONFIG[status].label}
              {status !== "all" && (
                <span className="ml-1">
                  {status === "using" ? stats.using : status === "unopened" ? stats.unopened : stats.finished}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Product list */}
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Icon name="bottle" size={36} />
            {items.length === 0 ? (
              <>
                <p className="text-sm font-medium mb-1">서랍이 비어있어요</p>
                <p className="text-xs text-gray-300 mb-4">보유한 제품을 등록해 보세요</p>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 text-xs font-medium bg-primary text-white rounded-xl hover:bg-primary-light transition-colors"
                >
                  제품 추가하기
                </button>
              </>
            ) : (
              <p className="text-sm">해당 상태의 제품이 없어요</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const statusConfig = STATUS_CONFIG[item.status];
              const openDays = item.openedDate ? daysSince(item.openedDate) : null;
              return (
                <div
                  key={item.productId}
                  className="bg-white rounded-xl border border-gray-100 p-3.5"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5"><Icon name={getCategoryIcon(item.categoryId)} size={20} /></span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs text-gray-400">{item.brand}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 ${statusConfig.color}`}>
                          <Icon name={statusConfig.icon} size={10} /> {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-gray-300">{getCategoryLabel(item.categoryId)}</span>
                        {openDays !== null && (
                          <span className="text-[10px] text-gray-400">
                            개봉 {openDays}일째
                            {openDays > 180 && (
                              <span className="text-red-400 ml-1">유통기한 확인!</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-1.5 mt-2.5 ml-8">
                    {item.status === "unopened" && (
                      <button
                        type="button"
                        onClick={() => updateStatus(item.productId, "using")}
                        className="px-2.5 py-1 text-[10px] font-medium bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        개봉하기
                      </button>
                    )}
                    {item.status === "using" && (
                      <button
                        type="button"
                        onClick={() => updateStatus(item.productId, "finished")}
                        className="px-2.5 py-1 text-[10px] font-medium bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        다 썼어요
                      </button>
                    )}
                    {item.status === "finished" && (
                      <button
                        type="button"
                        onClick={() => updateStatus(item.productId, "using")}
                        className="px-2.5 py-1 text-[10px] font-medium bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        재사용
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeProduct(item.productId)}
                      className="px-2.5 py-1 text-[10px] font-medium text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA: Analyze with drawer products */}
        {items.filter((i) => i.status === "using").length >= 2 && (
          <div className="mt-6 mb-4">
            <Link
              href="/analyze"
              className="block w-full py-3 text-center text-sm font-semibold bg-primary text-white rounded-2xl hover:bg-primary-light transition-colors"
            >
              사용 중인 제품으로 루틴 분석하기 ({items.filter((i) => i.status === "using").length}개)
            </Link>
          </div>
        )}
      </main>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setShowAddModal(false);
              setSearchQuery("");
            }}
          />
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl p-5 pb-8 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">제품 추가</h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setSearchQuery("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <input
              type="text"
              placeholder="브랜드 또는 제품명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary/50 mb-3"
              autoFocus
            />

            <div className="flex-1 overflow-y-auto space-y-1">
              {searchResults.length > 0 ? (
                searchResults.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addProduct(product)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <Icon name={getCategoryIcon(product.categoryId)} size={18} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400">{product.brand}</p>
                      <p className="text-sm text-gray-800 truncate">{product.name}</p>
                    </div>
                    <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                ))
              ) : searchQuery.trim().length > 0 ? (
                <div className="py-8 text-center text-gray-400">
                  <p className="text-sm">검색 결과가 없어요</p>
                  <p className="text-xs mt-1">다른 키워드로 검색해 보세요</p>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <p className="text-sm">제품명을 입력해 주세요</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
