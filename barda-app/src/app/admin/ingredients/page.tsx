"use client";

import { useState, useMemo } from "react";
import { INGREDIENT_DB, CATEGORY_LABELS, CATEGORY_ICON, type IngredientInfo } from "@/data/ingredients";
import Icon from "@/components/Icon";
import { PageHeader, SearchInput, InMemoryBanner, StatusBadge } from "@/components/admin/shared";

const SAFETY_COLORS = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-lime-400", "bg-green-400"];

const allIngredients = Object.entries(INGREDIENT_DB).map(([key, info]) => ({ key, ...info }));
const categories = Object.keys(CATEGORY_LABELS) as IngredientInfo["category"][];

export default function AdminIngredientsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = allIngredients;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q) || i.nameEn.toLowerCase().includes(q));
    }
    if (categoryFilter !== "all") {
      list = list.filter((i) => i.category === categoryFilter);
    }
    return list;
  }, [search, categoryFilter]);

  // Stats by category
  const catStats = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of allIngredients) {
      map.set(i.category, (map.get(i.category) ?? 0) + 1);
    }
    return map;
  }, []);

  return (
    <div>
      <PageHeader
        title="성분 DB"
        description={`총 ${allIngredients.length}개 성분 · ${categories.length}개 카테고리`}
      />

      <InMemoryBanner />

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setCategoryFilter("all")}
          className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
            categoryFilter === "all" ? "bg-primary text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          전체 ({allIngredients.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
              categoryFilter === cat ? "bg-primary text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <Icon name={CATEGORY_ICON[cat]} size={12} />
            {CATEGORY_LABELS[cat]} ({catStats.get(cat) ?? 0})
          </button>
        ))}
      </div>

      <div className="mb-4 max-w-sm">
        <SearchInput value={search} onChange={setSearch} placeholder="성분명 검색 (한글/영문)..." />
      </div>

      {/* Ingredient cards */}
      <div className="space-y-2">
        {filtered.map((ing) => (
          <div
            key={ing.key}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setExpanded(expanded === ing.key ? null : ing.key)}
              className="w-full text-left p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <Icon name={CATEGORY_ICON[ing.category]} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">{ing.name}</span>
                  <span className="text-xs text-gray-400">{ing.nameEn}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{ing.efficacy}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Safety score */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${i < ing.safetyScore ? SAFETY_COLORS[ing.safetyScore] : "bg-gray-200"}`}
                    />
                  ))}
                </div>
                <StatusBadge status={ing.category} label={CATEGORY_LABELS[ing.category]} />
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded === ing.key ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {expanded === ing.key && (
              <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 mb-1">효능</p>
                    <p className="text-xs text-gray-700">{ing.efficacy}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 mb-1">주의사항</p>
                    <p className="text-xs text-gray-700">{ing.caution}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 mb-1">적합 피부타입</p>
                    <div className="flex flex-wrap gap-1">
                      {ing.skinTypes.map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 mb-1">안전점수</p>
                    <p className="text-xs text-gray-700">{ing.safetyScore}/5</p>
                  </div>
                  {ing.goodWith.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-green-500 mb-1">시너지 성분</p>
                      <div className="flex flex-wrap gap-1">
                        {ing.goodWith.map((g) => (
                          <span key={g} className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-600">{g}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {ing.avoidWith.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-red-500 mb-1">충돌 성분</p>
                      <div className="flex flex-wrap gap-1">
                        {ing.avoidWith.map((a) => (
                          <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {ing.regulation && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 mb-1">규제</p>
                      <p className="text-xs text-gray-700">{ing.regulation}</p>
                    </div>
                  )}
                  {ing.maxConcentration && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 mb-1">최대 배합한도</p>
                      <p className="text-xs text-gray-700">{ing.maxConcentration}</p>
                    </div>
                  )}
                  {ing.casNo && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 mb-1">CAS No.</p>
                      <p className="text-xs text-gray-700">{ing.casNo}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">검색 결과가 없습니다</div>
        )}
      </div>
    </div>
  );
}
