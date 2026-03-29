"use client";

import { useEffect, useState } from "react";
import { PageHeader, StatCard, CardSkeleton, TableSkeleton } from "@/components/admin/shared";

interface SearchMiss { query: string; count: number; }
interface FunnelItem { event_name: string; count: number; }

interface AdminStats {
  totalUsers: number;
  totalAnalyses: number;
  totalPayments: number;
  totalRevenue: number;
  totalPosts: number;
  totalFeedback: number;
  totalSearches: number;
  missedSearches: number;
  searchHitRate: number;
  recentSearchMisses: SearchMiss[];
  funnelData: FunnelItem[];
}

const FUNNEL_ORDER = ["wizard_start", "result_viewed", "paywall_shown", "payment_completed"];
const FUNNEL_LABELS: Record<string, string> = {
  wizard_start: "위저드 시작", result_viewed: "결과 조회",
  paywall_shown: "페이월 노출", payment_completed: "결제 완료",
};

function FunnelBar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-sm text-gray-600 text-right shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-700 flex items-center justify-end pr-2" style={{ width: `${Math.max(pct, 2)}%` }}>
          {pct > 12 && <span className="text-xs font-semibold text-white">{count.toLocaleString()}</span>}
        </div>
      </div>
      {pct <= 12 && <span className="text-xs font-medium text-gray-500 w-12 shrink-0">{count.toLocaleString()}</span>}
    </div>
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  const orderedFunnel = stats
    ? FUNNEL_ORDER.map((name) => ({
        event_name: name,
        count: stats.funnelData.find((f) => f.event_name === name)?.count ?? 0,
      }))
    : [];
  const funnelMax = Math.max(...orderedFunnel.map((f) => f.count), 1);

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md text-center">
          <p className="text-red-600 font-semibold mb-2">데이터를 불러올 수 없습니다</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="대시보드" description="주요 지표 및 전환 퍼널" />

      {/* Stat Cards */}
      <section className="mb-6">
        {stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="총 분석" value={stats.totalAnalyses} />
            <StatCard label="총 결제" value={stats.totalPayments} />
            <StatCard label="총 수익" value={stats.totalRevenue} format="currency" />
            <StatCard label="커뮤니티 글" value={stats.totalPosts} />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
        )}
      </section>

      {/* Search Stats */}
      <section className="mb-6">
        <h3 className="text-sm font-bold text-gray-800 mb-3">검색 통계</h3>
        {stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard label="총 검색" value={stats.totalSearches} />
            <StatCard label="미스 검색" value={stats.missedSearches} />
            <StatCard label="검색 히트율" value={stats.searchHitRate} format="percent" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
        )}
      </section>

      {/* Two-column: Misses + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-1">검색 미스 Top 10</h3>
          <p className="text-xs text-gray-400 mb-4">DB에 없어서 결과 0건인 검색어</p>
          {stats ? (
            stats.recentSearchMisses.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">검색어</th>
                    <th className="text-right py-2 text-gray-500 font-medium w-20">횟수</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentSearchMisses.map((miss) => (
                    <tr key={miss.query} className="border-b border-gray-50 last:border-0">
                      <td className="py-2 text-gray-800">{miss.query}</td>
                      <td className="py-2 text-right font-medium text-gray-600">{miss.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">검색 미스 데이터가 없습니다.</p>
            )
          ) : (
            <TableSkeleton rows={5} />
          )}
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-1">전환 퍼널</h3>
          <p className="text-xs text-gray-400 mb-4">wizard_start → payment_completed</p>
          {stats ? (
            <div className="space-y-4">
              {orderedFunnel.map((item) => (
                <FunnelBar key={item.event_name} label={FUNNEL_LABELS[item.event_name] ?? item.event_name} count={item.count} max={funnelMax} />
              ))}
            </div>
          ) : (
            <TableSkeleton rows={4} />
          )}
        </section>
      </div>
    </div>
  );
}
