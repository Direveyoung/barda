"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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

interface APIHealth {
  mfds: { available: boolean; hasKey: boolean };
  obf: { available: boolean; hasKey: boolean };
  ingredientDict: { available: boolean; hasKey: boolean };
}

interface PipelineResult {
  action: string;
  count: number;
  details: string[];
  timestamp: string;
}

interface WeeklyReport {
  period: { start: string; end: string };
  searchStats: {
    totalSearches: number;
    hitRate: number;
    missedSearches: number;
    topMissedQueries: { query: string; count: number }[];
  };
  candidateStats: {
    newCandidates: number;
    autoPromoted: number;
    manualApproved: number;
    pendingHighDemand: { brand: string; name: string; count: number }[];
  };
  communityStats: {
    newPosts: number;
    uniqueProducts: string[];
    popularProducts: { name: string; count: number }[];
  };
  generatedAt: string;
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
  auto_promoted: "자동승격",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
  auto_promoted: "bg-blue-100 text-blue-700",
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

/* ---------- API Status Dot ---------- */

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${ok ? "bg-green-400" : "bg-red-400"}`}
    />
  );
}

/* ---------- Main Page ---------- */

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [candidateFilter, setCandidateFilter] = useState<string>("pending");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // API monitoring state
  const [apiHealth, setApiHealth] = useState<APIHealth | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiTestQuery, setApiTestQuery] = useState("");
  const [apiTestTarget, setApiTestTarget] = useState<"mfds" | "obf" | "ingredient">("obf");
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);
  const [apiTesting, setApiTesting] = useState(false);

  // Pipeline state
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [pipelineRunning, setPipelineRunning] = useState<string | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);

  // Bulk import state
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkImportResult, setBulkImportResult] = useState<{ processed: number; succeeded: number; failed: number } | null>(null);

  // Admin tab
  const [activeTab, setActiveTab] = useState<"overview" | "pipeline" | "api">("overview");

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
        // Silently fail
      } finally {
        setUpdatingId(null);
      }
    },
    []
  );

  // Fetch API health
  const fetchAPIHealth = useCallback(async () => {
    setApiLoading(true);
    try {
      const res = await fetch("/api/admin/external-apis");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setApiHealth(data.health);
    } catch {
      setApiHealth(null);
    } finally {
      setApiLoading(false);
    }
  }, []);

  // Test external API
  const testExternalAPI = useCallback(async () => {
    if (!apiTestQuery.trim()) return;
    setApiTesting(true);
    setApiTestResult(null);
    try {
      const res = await fetch("/api/admin/external-apis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api: apiTestTarget, query: apiTestQuery.trim() }),
      });
      const data = await res.json();
      setApiTestResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setApiTestResult(`Error: ${err instanceof Error ? err.message : "Unknown"}`);
    } finally {
      setApiTesting(false);
    }
  }, [apiTestQuery, apiTestTarget]);

  // Run pipeline action
  const runPipeline = useCallback(async (action: string) => {
    setPipelineRunning(action);
    setPipelineResult(null);
    setWeeklyReport(null);
    try {
      const res = await fetch("/api/admin/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (action === "weekly_report") {
        setWeeklyReport(data);
      } else {
        setPipelineResult(data);
      }
    } catch (err) {
      setPipelineResult({
        action,
        count: 0,
        details: [`Error: ${err instanceof Error ? err.message : "Unknown"}`],
        timestamp: new Date().toISOString(),
      });
    } finally {
      setPipelineRunning(null);
    }
  }, []);

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
  const filteredCandidates = useMemo(() => {
    if (!stats) return [];
    if (candidateFilter === "all") return stats.productCandidates;
    return stats.productCandidates.filter((pc) => pc.status === candidateFilter);
  }, [stats, candidateFilter]);

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

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {(["overview", "pipeline", "api"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "overview" ? "개요" : tab === "pipeline" ? "파이프라인" : "외부 API"}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === "overview" && (
          <>
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
              <div className="flex gap-2 mb-4 flex-wrap">
                {["pending", "auto_promoted", "approved", "rejected", "all"].map((s) => (
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
          </>
        )}

        {/* ===== PIPELINE TAB ===== */}
        {activeTab === "pipeline" && (
          <>
            {/* Architecture Diagram */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                자동 학습 파이프라인 아키텍처
              </h2>
              <div className="overflow-x-auto">
                <div className="min-w-[600px] space-y-4 text-sm font-mono">
                  {/* Layer 1: Collection */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-blue-700 font-bold mb-2">[1] 수집 (Collection)</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-lg p-3 border border-blue-100 text-center">
                        <p className="text-xs text-gray-500">유저 검색</p>
                        <p className="font-semibold text-gray-800">search_logs</p>
                        <p className="text-[10px] text-gray-400 mt-1">쿼리 + 결과수</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-100 text-center">
                        <p className="text-xs text-gray-500">직접 입력</p>
                        <p className="font-semibold text-gray-800">product_candidates</p>
                        <p className="text-[10px] text-gray-400 mt-1">브랜드 + 제품명</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-100 text-center">
                        <p className="text-xs text-gray-500">커뮤니티</p>
                        <p className="font-semibold text-gray-800">routine_posts</p>
                        <p className="text-[10px] text-gray-400 mt-1">제품 언급 데이터</p>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center text-gray-400 text-lg">&#x25BC; &#x25BC; &#x25BC;</div>

                  {/* Layer 2: Analysis */}
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <p className="text-purple-700 font-bold mb-2">[2] 분석 (Analysis)</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-lg p-3 border border-purple-100 text-center">
                        <p className="text-xs text-gray-500">미스 분석</p>
                        <p className="font-semibold text-gray-800">Top 20 리포트</p>
                        <p className="text-[10px] text-gray-400 mt-1">히트율 + 미스 쿼리</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-purple-100 text-center">
                        <p className="text-xs text-gray-500">자동 승격</p>
                        <p className="font-semibold text-gray-800">submit_count &ge; 3</p>
                        <p className="text-[10px] text-gray-400 mt-1">pending &rarr; auto_promoted</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-purple-100 text-center">
                        <p className="text-xs text-gray-500">커뮤니티 분석</p>
                        <p className="font-semibold text-gray-800">인기 제품 추출</p>
                        <p className="text-[10px] text-gray-400 mt-1">피부타입별 다양성</p>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center text-gray-400 text-lg">&#x25BC; &#x25BC; &#x25BC;</div>

                  {/* Layer 3: Execution */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-green-700 font-bold mb-2">[3] 실행 (Execution)</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-lg p-3 border border-green-100 text-center">
                        <p className="text-xs text-gray-500">DB 확장</p>
                        <p className="font-semibold text-gray-800">products.ts 업데이트</p>
                        <p className="text-[10px] text-gray-400 mt-1">관리자 승인 후</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-green-100 text-center">
                        <p className="text-xs text-gray-500">별칭 추가</p>
                        <p className="font-semibold text-gray-800">aliases.ts 업데이트</p>
                        <p className="text-[10px] text-gray-400 mt-1">미스 쿼리 기반</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-green-100 text-center">
                        <p className="text-xs text-gray-500">주간 리포트</p>
                        <p className="font-semibold text-gray-800">종합 현황 생성</p>
                        <p className="text-[10px] text-gray-400 mt-1">검색 + 후보 + 커뮤니티</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Pipeline Actions */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                파이프라인 실행
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                수동으로 파이프라인 작업을 실행합니다
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => runPipeline("auto_promote")}
                  disabled={!!pipelineRunning}
                  className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left disabled:opacity-50"
                >
                  <p className="font-semibold text-gray-800 text-sm">
                    {pipelineRunning === "auto_promote" ? "실행 중..." : "자동 승격"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    submit_count &ge; 3 후보 자동 승격
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => runPipeline("search_miss")}
                  disabled={!!pipelineRunning}
                  className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors text-left disabled:opacity-50"
                >
                  <p className="font-semibold text-gray-800 text-sm">
                    {pipelineRunning === "search_miss" ? "실행 중..." : "미스 분석"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    주간 검색 미스 Top 20 리포트
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => runPipeline("community")}
                  disabled={!!pipelineRunning}
                  className="p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors text-left disabled:opacity-50"
                >
                  <p className="font-semibold text-gray-800 text-sm">
                    {pipelineRunning === "community" ? "실행 중..." : "커뮤니티 분석"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    인기 제품 + 피부타입별 다양성
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => runPipeline("weekly_report")}
                  disabled={!!pipelineRunning}
                  className="p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-left disabled:opacity-50"
                >
                  <p className="font-semibold text-gray-800 text-sm">
                    {pipelineRunning === "weekly_report" ? "실행 중..." : "주간 리포트"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    종합 주간 현황 리포트 생성
                  </p>
                </button>
              </div>
            </section>

            {/* Bulk Import */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">성분 벌크 임포트</h2>
              <p className="text-xs text-gray-400 mb-4">INGREDIENT_DB 전체 성분을 MFDS API에서 조회하여 규제 데이터를 DB에 저장합니다.</p>
              <button
                type="button"
                disabled={bulkImporting}
                onClick={async () => {
                  setBulkImporting(true);
                  setBulkImportResult(null);
                  try {
                    const res = await fetch("/api/admin/import-ingredients", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        ingredients: [
                          "나이아신아마이드", "레티놀", "아르부틴", "아데노신", "살리실산",
                          "글리콜산", "히알루론산", "세라마이드", "판테놀", "비타민C",
                          "트라넥삼산", "글루타치온", "펩타이드", "센텔라", "알란토인",
                        ],
                      }),
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setBulkImportResult(data);
                    }
                  } catch { /* ignore */ }
                  setBulkImporting(false);
                }}
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50 hover:bg-primary-light transition-colors"
              >
                {bulkImporting ? "임포트 중..." : "주요 성분 15종 임포트"}
              </button>
              {bulkImportResult && (
                <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
                  처리: {bulkImportResult.processed}건 / 성공: {bulkImportResult.succeeded}건 / 실패: {bulkImportResult.failed}건
                </div>
              )}
            </section>

            {/* Pipeline Result */}
            {pipelineResult && (
              <section className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-800">
                    실행 결과
                  </h2>
                  <span className="text-xs text-gray-400">
                    {new Date(pipelineResult.timestamp).toLocaleString("ko-KR")}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {pipelineResult.action}
                  </span>
                  <span className="text-sm text-gray-600">
                    처리: {pipelineResult.count}건
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {pipelineResult.details.map((detail, i) => (
                    <p key={i} className="text-xs text-gray-600 font-mono leading-relaxed">
                      {detail}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* Weekly Report */}
            {weeklyReport && (
              <section className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    주간 리포트
                  </h2>
                  <span className="text-xs text-gray-400">
                    {weeklyReport.period.start} ~ {weeklyReport.period.end}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Search Stats */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-blue-700 mb-2">검색 통계</p>
                    <div className="space-y-1 text-xs text-gray-600">
                      <p>총 검색: {weeklyReport.searchStats.totalSearches}건</p>
                      <p>히트율: {weeklyReport.searchStats.hitRate}%</p>
                      <p>미스: {weeklyReport.searchStats.missedSearches}건</p>
                      {weeklyReport.searchStats.topMissedQueries.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-blue-200">
                          <p className="font-medium text-blue-600 mb-1">미스 Top 5</p>
                          {weeklyReport.searchStats.topMissedQueries.slice(0, 5).map((q) => (
                            <p key={q.query} className="text-gray-500">
                              &quot;{q.query}&quot; ({q.count}회)
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Candidate Stats */}
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-purple-700 mb-2">제품 후보</p>
                    <div className="space-y-1 text-xs text-gray-600">
                      <p>신규 후보: {weeklyReport.candidateStats.newCandidates}건</p>
                      <p>자동 승격: {weeklyReport.candidateStats.autoPromoted}건</p>
                      <p>수동 승인: {weeklyReport.candidateStats.manualApproved}건</p>
                      {weeklyReport.candidateStats.pendingHighDemand.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-purple-200">
                          <p className="font-medium text-purple-600 mb-1">고수요 대기</p>
                          {weeklyReport.candidateStats.pendingHighDemand.map((c) => (
                            <p key={`${c.brand}-${c.name}`} className="text-gray-500">
                              {c.brand} {c.name} ({c.count}회)
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Community Stats */}
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-green-700 mb-2">커뮤니티</p>
                    <div className="space-y-1 text-xs text-gray-600">
                      <p>신규 포스트: {weeklyReport.communityStats.newPosts}건</p>
                      <p>고유 제품: {weeklyReport.communityStats.uniqueProducts.length}종</p>
                      {weeklyReport.communityStats.popularProducts.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-green-200">
                          <p className="font-medium text-green-600 mb-1">인기 제품 Top 5</p>
                          {weeklyReport.communityStats.popularProducts.slice(0, 5).map((p) => (
                            <p key={p.name} className="text-gray-500">
                              {p.name} ({p.count}회)
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {/* ===== EXTERNAL API TAB ===== */}
        {activeTab === "api" && (
          <>
            {/* API Health */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">
                    외부 API 상태
                  </h2>
                  <p className="text-xs text-gray-400">
                    연동된 외부 API의 가용성 확인
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchAPIHealth}
                  disabled={apiLoading}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {apiLoading ? "확인 중..." : "상태 확인"}
                </button>
              </div>

              {apiHealth ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusDot ok={apiHealth.mfds.available} />
                      <p className="font-semibold text-gray-800 text-sm">식약처 OpenAPI</p>
                    </div>
                    <p className="text-xs text-gray-500">기능성화장품 성분 조회</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      API 키: {apiHealth.mfds.hasKey ? "설정됨" : "미설정"}
                    </p>
                  </div>

                  <div className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusDot ok={apiHealth.obf.available} />
                      <p className="font-semibold text-gray-800 text-sm">Open Beauty Facts</p>
                    </div>
                    <p className="text-xs text-gray-500">글로벌 K-뷰티 전성분 DB</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      API 키: 불필요 (오픈소스)
                    </p>
                  </div>

                  <div className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusDot ok={apiHealth.ingredientDict.available} />
                      <p className="font-semibold text-gray-800 text-sm">성분사전</p>
                    </div>
                    <p className="text-xs text-gray-500">공공데이터포털 성분명 매핑</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      API 키: {apiHealth.ingredientDict.hasKey ? "설정됨" : "미설정"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">
                  &quot;상태 확인&quot; 버튼을 눌러 API 상태를 확인하세요
                </p>
              )}
            </section>

            {/* API Test */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                API 테스트
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                외부 API에 테스트 쿼리를 실행합니다
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <select
                  value={apiTestTarget}
                  onChange={(e) => setApiTestTarget(e.target.value as "mfds" | "obf" | "ingredient")}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                >
                  <option value="mfds">식약처 (성분명 검색)</option>
                  <option value="obf">Open Beauty Facts (제품 검색)</option>
                  <option value="ingredient">성분사전 (성분명 매핑)</option>
                </select>
                <input
                  type="text"
                  value={apiTestQuery}
                  onChange={(e) => setApiTestQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && testExternalAPI()}
                  placeholder={
                    apiTestTarget === "mfds"
                      ? "나이아신아마이드"
                      : apiTestTarget === "obf"
                        ? "innisfree"
                        : "히알루론산"
                  }
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={testExternalAPI}
                  disabled={apiTesting || !apiTestQuery.trim()}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
                >
                  {apiTesting ? "조회 중..." : "테스트"}
                </button>
              </div>

              {apiTestResult && (
                <div className="bg-gray-50 rounded-lg p-4 max-h-80 overflow-y-auto">
                  <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap break-all">
                    {apiTestResult}
                  </pre>
                </div>
              )}
            </section>

            {/* API Integration Flow */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                API 연동 플로우
              </h2>
              <div className="overflow-x-auto">
                <div className="min-w-[500px] space-y-3 text-sm font-mono">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-700 font-semibold">1. 식약처 OpenAPI</p>
                    <p className="text-xs text-gray-500 mt-1">
                      성분명 입력 &rarr; 기능성화장품 성분 DB 조회 &rarr; 배합한도/규제 확인 &rarr; 분석 엔진에 반영
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-700 font-semibold">2. Open Beauty Facts</p>
                    <p className="text-xs text-gray-500 mt-1">
                      바코드/제품명 검색 &rarr; 전성분 목록 조회 &rarr; 미등록 제품 자동 보강 &rarr; 제품 DB 확장
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-700 font-semibold">3. 공공데이터포털 성분사전</p>
                    <p className="text-xs text-gray-500 mt-1">
                      한글 성분명 &rarr; INCI 국제명 매핑 &rarr; EWG 등급 확인 &rarr; 성분 가이드에 활용
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
