"use client";

import { useEffect, useState } from "react";

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
  brand_name?: string;
  product_name?: string;
  category?: string;
  submitted_by?: string;
  created_at: string;
}

interface AdminStats {
  totalUsers: number;
  totalAnalyses: number;
  totalPayments: number;
  totalRevenue: number;
  totalPosts: number;
  totalFeedback: number;
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
}: {
  label: string;
  value: number;
  format?: "number" | "currency";
}) {
  const display =
    format === "currency"
      ? `${value.toLocaleString("ko-KR")}원`
      : value.toLocaleString("ko-KR");

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{display}</p>
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

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setStats(data))
      .catch((err) => setError(err.message));
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

        {/* ---- Two-column: Search Misses + Funnel ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Search Misses */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              검색 미스
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              사용자가 검색했지만 DB에 없는 제품 (상위 10개)
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
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            제품 후보
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            사용자가 제출한 승인 대기 제품 (최근 20개)
          </p>
          {stats ? (
            stats.productCandidates.length > 0 ? (
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
                      <th className="text-right py-2 text-gray-500 font-medium">
                        등록일
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.productCandidates.map((pc) => (
                      <tr
                        key={pc.id}
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td className="py-2 text-gray-800">
                          {pc.brand_name ?? "-"}
                        </td>
                        <td className="py-2 text-gray-800">
                          {pc.product_name ?? "-"}
                        </td>
                        <td className="py-2 text-gray-500 hidden sm:table-cell">
                          {pc.category ?? "-"}
                        </td>
                        <td className="py-2 text-right text-gray-500">
                          {new Date(pc.created_at).toLocaleDateString("ko-KR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">
                등록된 제품 후보가 없습니다.
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
