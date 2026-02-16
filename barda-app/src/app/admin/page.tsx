"use client";

import { useCallback, useEffect, useState } from "react";

/* ---------- Types ---------- */

interface SearchMiss {
  query: string;
  count: number;
}

interface FunnelItem {
  event_name: string;
  count: number;
}

interface ProductCandidate {
  id: string;
  brand: string;
  name: string;
  category_guess: string | null;
  submit_count: number;
  status: string;
  created_at: string;
}

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
  productCandidates: ProductCandidate[];
}

/* ---------- Constants ---------- */

const FUNNEL_ORDER = [
  "wizard_start",
  "result_viewed",
  "paywall_shown",
  "payment_completed",
];

const FUNNEL_LABELS: Record<string, string> = {
  wizard_start: "위저드 시작",
  result_viewed: "결과 조회",
  paywall_shown: "페이월 노출",
  payment_completed: "결제 완료",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "대기",
  approved: "승인",
  rejected: "거절",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

/* ---------- Skeleton ---------- */

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
      <div className="h-3 w-20 bg-gray-200 rounded mb-3" />
      <div className="h-8 w-28 bg-gray-200 rounded" />
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 flex-1 bg-gray-200 rounded" />
          <div className="h-4 w-12 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

/* ---------- Stat Card ---------- */

function StatCard({
  label,
  value,
  format,
  subtitle,
}: {
  label: string;
  value: number;
  format?: "number" | "currency" | "percent";
  subtitle?: string;
}) {
  const display =
    format === "currency"
      ? `${value.toLocaleString("ko-KR")}원`
      : format === "percent"
        ? `${value}%`
        : value.toLocaleString("ko-KR");

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{display}</p>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

/* ---------- Funnel Bar ---------- */

function FunnelBar({
  label,
  count,
  max,
}: {
  label: string;
  count: number;
  max: number;
}) {
  const pct = max > 0 ? (count / max) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-sm text-gray-600 text-right shrink-0">
        {label}
      </span>
      <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700 flex items-center justify-end pr-2"
          style={{ width: `${Math.max(pct, 2)}%` }}
        >
          {pct > 12 && (
            <span className="text-xs font-semibold text-white">
              {count.toLocaleString()}
            </span>
          )}
        </div>
      </div>
      {pct <= 12 && (
        <span className="text-xs font-medium text-gray-500 w-12 shrink-0">
          {count.toLocaleString()}
        </span>
      )}
    </div>
  );
}

/* ---------- Main Page ---------- */

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [candidateFilter, setCandidateFilter] = useState<string>("pending");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setStats(data))
      .catch((err) => setError(err.message));
  }, []);

  // Update candidate status (approve / reject)
  const updateCandidateStatus = useCallback(
    async (id: string, status: "approved" | "rejected" | "pending") => {
      setUpdatingId(id);
      try {
        const res = await fetch("/api/product-candidates", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status }),
        });
        if (!res.ok) throw new Error("Failed");

        // Update local state
        setStats((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            productCandidates: prev.productCandidates.map((pc) =>
              pc.id === id ? { ...pc, status } : pc
            ),
          };
        });
      } catch {
        // Silently fail, could add toast
      } finally {
        setUpdatingId(null);
      }
    },
    []
  );

  /* ---- Error state ---- */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md text-center">
          <p className="text-red-600 font-semibold mb-2">
            데이터를 불러올 수 없습니다
          </p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  /* ---- Funnel helpers ---- */
  const orderedFunnel = stats
    ? FUNNEL_ORDER.map((name) => ({
        event_name: name,
        count: stats.funnelData.find((f) => f.event_name === name)?.count ?? 0,
      }))
    : [];
  const funnelMax = Math.max(...orderedFunnel.map((f) => f.count), 1);

  /* ---- Candidate filter ---- */
  const filteredCandidates = stats
    ? candidateFilter === "all"
      ? stats.productCandidates
      : stats.productCandidates.filter((pc) => pc.status === candidateFilter)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-primary">BARDA</h1>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>
          <a
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            사이트로 돌아가기
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ---- Stat Cards ---- */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            주요 지표
          </h2>
          {stats ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="총 분석" value={stats.totalAnalyses} />
              <StatCard label="총 결제" value={stats.totalPayments} />
              <StatCard
                label="총 수익"
                value={stats.totalRevenue}
                format="currency"
              />
              <StatCard label="커뮤니티 글" value={stats.totalPosts} />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          )}
        </section>

        {/* ---- Search Stats ---- */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            검색 통계
          </h2>
          {stats ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard label="총 검색" value={stats.totalSearches} />
              <StatCard label="미스 검색" value={stats.missedSearches} />
              <StatCard
                label="검색 히트율"
                value={stats.searchHitRate}
                format="percent"
                subtitle={`${stats.totalSearches - stats.missedSearches}건 히트 / ${stats.totalSearches}건 총 검색`}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          )}
        </section>

        {/* ---- Two-column: Search Misses + Funnel ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Search Misses */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              검색 미스 Top 10
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              DB에 없어서 결과 0건인 검색어
            </p>
            {stats ? (
              stats.recentSearchMisses.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-gray-500 font-medium">
                        검색어
                      </th>
                      <th className="text-right py-2 text-gray-500 font-medium w-20">
                        횟수
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentSearchMisses.map((miss) => (
                      <tr
                        key={miss.query}
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td className="py-2 text-gray-800">{miss.query}</td>
                        <td className="py-2 text-right font-medium text-gray-600">
                          {miss.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-400 py-4 text-center">
                  검색 미스 데이터가 없습니다.
                </p>
              )
            ) : (
              <TableSkeleton rows={5} />
            )}
          </section>

          {/* Funnel Chart */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              전환 퍼널
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              wizard_start &rarr; payment_completed
            </p>
            {stats ? (
              <div className="space-y-4">
                {orderedFunnel.map((item) => (
                  <FunnelBar
                    key={item.event_name}
                    label={
                      FUNNEL_LABELS[item.event_name] ?? item.event_name
                    }
                    count={item.count}
                    max={funnelMax}
                  />
                ))}
              </div>
            ) : (
              <TableSkeleton rows={4} />
            )}
          </section>
        </div>

        {/* ---- Product Candidates ---- */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-gray-800">
              제품 후보 관리
            </h2>
            {stats && (
              <span className="text-xs text-gray-400">
                총 {stats.productCandidates.length}건
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-4">
            사용자가 직접 입력한 제품 후보 (submit_count 높은 순)
          </p>

          {/* Status filter tabs */}
          <div className="flex gap-2 mb-4">
            {["pending", "approved", "rejected", "all"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setCandidateFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  candidateFilter === s
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
              >
                {s === "all" ? "전체" : STATUS_LABELS[s] ?? s}
                {stats && (
                  <span className="ml-1 opacity-70">
                    (
                    {s === "all"
                      ? stats.productCandidates.length
                      : stats.productCandidates.filter((pc) => pc.status === s).length}
                    )
                  </span>
                )}
              </button>
            ))}
          </div>

          {stats ? (
            filteredCandidates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-gray-500 font-medium">
                        브랜드
                      </th>
                      <th className="text-left py-2 text-gray-500 font-medium">
                        제품명
                      </th>
                      <th className="text-left py-2 text-gray-500 font-medium hidden sm:table-cell">
                        카테고리
                      </th>
                      <th className="text-center py-2 text-gray-500 font-medium w-16">
                        요청수
                      </th>
                      <th className="text-center py-2 text-gray-500 font-medium w-16">
                        상태
                      </th>
                      <th className="text-right py-2 text-gray-500 font-medium w-28">
                        액션
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map((pc) => (
                      <tr
                        key={pc.id}
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td className="py-2.5 text-gray-800 font-medium">
                          {pc.brand || "-"}
                        </td>
                        <td className="py-2.5 text-gray-800">
                          {pc.name || "-"}
                        </td>
                        <td className="py-2.5 text-gray-500 hidden sm:table-cell">
                          {pc.category_guess || "-"}
                        </td>
                        <td className="py-2.5 text-center">
                          <span className={`inline-block min-w-[1.5rem] px-1.5 py-0.5 rounded-full text-xs font-bold ${
                            pc.submit_count >= 3
                              ? "bg-red-100 text-red-600"
                              : pc.submit_count >= 2
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-500"
                          }`}>
                            {pc.submit_count}
                          </span>
                        </td>
                        <td className="py-2.5 text-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            STATUS_COLORS[pc.status] ?? "bg-gray-100 text-gray-500"
                          }`}>
                            {STATUS_LABELS[pc.status] ?? pc.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {pc.status !== "approved" && (
                              <button
                                type="button"
                                onClick={() => updateCandidateStatus(pc.id, "approved")}
                                disabled={updatingId === pc.id}
                                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50 transition-colors"
                              >
                                승인
                              </button>
                            )}
                            {pc.status !== "rejected" && (
                              <button
                                type="button"
                                onClick={() => updateCandidateStatus(pc.id, "rejected")}
                                disabled={updatingId === pc.id}
                                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50 transition-colors"
                              >
                                거절
                              </button>
                            )}
                            {pc.status !== "pending" && (
                              <button
                                type="button"
                                onClick={() => updateCandidateStatus(pc.id, "pending")}
                                disabled={updatingId === pc.id}
                                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                              >
                                대기
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">
                {candidateFilter === "all"
                  ? "등록된 제품 후보가 없습니다."
                  : `${STATUS_LABELS[candidateFilter] ?? candidateFilter} 상태의 후보가 없습니다.`}
              </p>
            )
          ) : (
            <TableSkeleton rows={5} />
          )}
        </section>
      </main>
    </div>
  );
}
