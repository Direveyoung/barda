"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader, StatusBadge, TableSkeleton } from "@/components/admin/shared";

interface ProductCandidate {
  id: string;
  brand: string;
  name: string;
  category_guess: string | null;
  submit_count: number;
  status: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "대기", approved: "승인", rejected: "거절", auto_promoted: "자동승격",
};

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<ProductCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("pending");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then((data) => setCandidates(data.productCandidates ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = useCallback(async (id: string, status: "approved" | "rejected" | "pending") => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/product-candidates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed");
      setCandidates((prev) => prev.map((pc) => pc.id === id ? { ...pc, status } : pc));
    } catch { /* ignore */ }
    setUpdatingId(null);
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return candidates;
    return candidates.filter((pc) => pc.status === filter);
  }, [candidates, filter]);

  if (error) {
    return <div className="py-12 text-center text-red-500 text-sm">{error}</div>;
  }

  return (
    <div>
      <PageHeader
        title="제품 후보 관리"
        description={`사용자 요청 제품 · 총 ${candidates.length}건`}
      />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["pending", "auto_promoted", "approved", "rejected", "all"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === s
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            {s === "all" ? "전체" : STATUS_LABELS[s] ?? s}
            <span className="ml-1 opacity-70">
              ({s === "all" ? candidates.length : candidates.filter((pc) => pc.status === s).length})
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        {loading ? (
          <TableSkeleton rows={5} />
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">브랜드</th>
                  <th className="text-left py-2 text-gray-500 font-medium">제품명</th>
                  <th className="text-left py-2 text-gray-500 font-medium hidden sm:table-cell">카테고리</th>
                  <th className="text-center py-2 text-gray-500 font-medium w-16">요청수</th>
                  <th className="text-center py-2 text-gray-500 font-medium w-16">상태</th>
                  <th className="text-right py-2 text-gray-500 font-medium w-28">액션</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((pc) => (
                  <tr key={pc.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 text-gray-800 font-medium">{pc.brand || "-"}</td>
                    <td className="py-2.5 text-gray-800">{pc.name || "-"}</td>
                    <td className="py-2.5 text-gray-500 hidden sm:table-cell">{pc.category_guess || "-"}</td>
                    <td className="py-2.5 text-center">
                      <span className={`inline-block min-w-[1.5rem] px-1.5 py-0.5 rounded-full text-xs font-bold ${
                        pc.submit_count >= 3 ? "bg-red-100 text-red-600"
                          : pc.submit_count >= 2 ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-500"
                      }`}>
                        {pc.submit_count}
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      <StatusBadge status={pc.status} label={STATUS_LABELS[pc.status] ?? pc.status} />
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {pc.status !== "approved" && (
                          <button type="button" onClick={() => updateStatus(pc.id, "approved")} disabled={updatingId === pc.id}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50">
                            승인
                          </button>
                        )}
                        {pc.status !== "rejected" && (
                          <button type="button" onClick={() => updateStatus(pc.id, "rejected")} disabled={updatingId === pc.id}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50">
                            거절
                          </button>
                        )}
                        {pc.status !== "pending" && (
                          <button type="button" onClick={() => updateStatus(pc.id, "pending")} disabled={updatingId === pc.id}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-50">
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
            {filter === "all" ? "등록된 제품 후보가 없습니다." : `${STATUS_LABELS[filter] ?? filter} 상태의 후보가 없습니다.`}
          </p>
        )}
      </div>
    </div>
  );
}
