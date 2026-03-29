"use client";

import { useMemo } from "react";
import { ALL_PRODUCTS } from "@/data/products";
import {
  getBrandPriceTier,
  PRICE_TIER_LABEL,
  PRICE_TIER_STYLE,
  PRICE_RANGES,
  type PriceTier,
} from "@/data/brand-tiers";
import { PageHeader, InMemoryBanner, StatusBadge } from "@/components/admin/shared";

const TIERS: PriceTier[] = ["luxury", "premium", "mid", "budget"];

export default function AdminBrandsPage() {
  const brandData = useMemo(() => {
    const map = new Map<string, { tier: PriceTier; productCount: number }>();
    for (const p of ALL_PRODUCTS) {
      if (!map.has(p.brand)) {
        map.set(p.brand, { tier: getBrandPriceTier(p.brand), productCount: 0 });
      }
      map.get(p.brand)!.productCount++;
    }
    return map;
  }, []);

  const tierGroups = useMemo(() => {
    const groups: Record<PriceTier, { brand: string; count: number }[]> = {
      luxury: [], premium: [], mid: [], budget: [],
    };
    for (const [brand, data] of brandData) {
      groups[data.tier].push({ brand, count: data.productCount });
    }
    // Sort by product count desc
    for (const tier of TIERS) {
      groups[tier].sort((a, b) => b.count - a.count);
    }
    return groups;
  }, [brandData]);

  return (
    <div>
      <PageHeader
        title="브랜드 티어"
        description={`총 ${brandData.size}개 브랜드 · 4개 티어`}
      />

      <InMemoryBanner />

      {/* Tier summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {TIERS.map((tier) => (
          <div key={tier} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <StatusBadge status={tier === "luxury" ? "critical" : tier === "premium" ? "high" : tier === "mid" ? "medium" : "low"} label={PRICE_TIER_LABEL[tier]} />
            <p className="text-2xl font-bold text-gray-800 mt-2">{tierGroups[tier].length}</p>
            <p className="text-[10px] text-gray-400">브랜드</p>
          </div>
        ))}
      </div>

      {/* Tier columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TIERS.map((tier) => (
          <div key={tier} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className={`px-4 py-3 border-b border-gray-100 ${PRICE_TIER_STYLE[tier]}`}>
              <p className="text-sm font-bold">{PRICE_TIER_LABEL[tier]}</p>
              <p className="text-[10px] opacity-80">{tierGroups[tier].length}개 브랜드</p>
            </div>
            <div className="p-3 space-y-1 max-h-80 overflow-y-auto">
              {tierGroups[tier].map(({ brand, count }) => (
                <div key={brand} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-50">
                  <span className="text-xs text-gray-700">{brand}</span>
                  <span className="text-[10px] text-gray-400">{count}개</span>
                </div>
              ))}
              {tierGroups[tier].length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">브랜드 없음</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Price ranges */}
      <div className="mt-6">
        <h3 className="text-sm font-bold text-gray-800 mb-3">카테고리별 가격대 (KRW)</h3>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2.5 px-3 font-semibold text-gray-500">카테고리</th>
                {TIERS.map((t) => (
                  <th key={t} className="text-center py-2.5 px-3 font-semibold text-gray-500">{PRICE_TIER_LABEL[t]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(PRICE_RANGES.budget).map((catKey) => (
                <tr key={catKey} className="border-b border-gray-100">
                  <td className="py-2 px-3 font-medium text-gray-700">{catKey}</td>
                  {TIERS.map((tier) => {
                    const range = PRICE_RANGES[tier]?.[catKey];
                    return (
                      <td key={tier} className="py-2 px-3 text-center text-gray-500">
                        {range ? `${(range.min / 1000).toFixed(0)}k~${(range.max / 1000).toFixed(0)}k` : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
