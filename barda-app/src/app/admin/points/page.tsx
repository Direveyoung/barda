"use client";

import { useEffect, useState } from "react";
import { PageHeader, EmptyDBState, StatCard, CardSkeleton, TableSkeleton } from "@/components/admin/shared";

interface PointsUser {
  user_id: string;
  nickname: string;
  balance: number;
  lifetime_earned: number;
  current_streak_days: number;
  longest_streak_days: number;
}

interface PointsAnalytics {
  users: PointsUser[];
  totalPoints: number;
  totalTransactions: number;
  actionDistribution: { action: string; count: number; totalPoints: number }[];
}

const ACTION_LABELS: Record<string, string> = {
  checkin_am: "AM 체크인", checkin_pm: "PM 체크인", diary: "다이어리",
  barcode_scan: "바코드 스캔", ingredient_input: "성분 입력", feedback: "피드백",
  routine_share: "루틴 공유", streak_bonus: "연속 보너스", admin_adjustment: "관리자 조정",
};

export default function AdminPointsPage() {
  const [data, setData] = useState<PointsAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbAvailable, setDbAvailable] = useState(true);

  // Manual adjustment
  const [adjustUserId, setAdjustUserId] = useState("");
  const [adjustPoints, setAdjustPoints] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/points")
      .then((res) => {
        if (res.status === 503) { setDbAvailable(false); return null; }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((d) => { if (d) setData(d); })
      .catch(() => setDbAvailable(false))
      .finally(() => setLoading(false));
  }, []);

  const handleAdjust = async () => {
    if (!adjustUserId || !adjustPoints || !adjustReason) return;
    setAdjusting(true);
    try {
      const res = await fetch("/api/admin/points/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: adjustUserId, points: parseInt(adjustPoints), reason: adjustReason }),
      });
      if (res.ok) {
        setAdjustUserId("");
        setAdjustPoints("");
        setAdjustReason("");
        // Refresh data
        const refreshRes = await fetch("/api/admin/points");
        if (refreshRes.ok) setData(await refreshRes.json());
      }
    } catch { /* ignore */ }
    setAdjusting(false);
  };

  if (!dbAvailable) {
    return (
      <div>
        <PageHeader title="포인트 관리" description="포인트 분석 및 수동 조정" />
        <EmptyDBState label="DB 연결 시 사용 가능" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="포인트 관리" description="리더보드, 분석, 수동 조정" />

      {/* Summary */}
      <section className="mb-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-4"><CardSkeleton /><CardSkeleton /></div>
        ) : data ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="총 포인트 발행" value={data.totalPoints} />
            <StatCard label="총 거래" value={data.totalTransactions} />
            <StatCard label="활성 사용자" value={data.users.length} />
            <StatCard label="최고 잔액" value={data.users[0]?.balance ?? 0} />
          </div>
        ) : null}
      </section>

      {/* Leaderboard */}
      <section className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
        <h3 className="text-sm font-bold text-gray-800 mb-3">리더보드 (Top 20)</h3>
        {loading ? <TableSkeleton rows={5} /> : data && data.users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">#</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">닉네임</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">잔액</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">누적</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500">연속</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500">최장</th>
                </tr>
              </thead>
              <tbody>
                {data.users.slice(0, 20).map((u, i) => (
                  <tr key={u.user_id} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-gray-400 font-medium">{i + 1}</td>
                    <td className="py-2 px-3 text-gray-800">{u.nickname || u.user_id.slice(0, 8)}</td>
                    <td className="py-2 px-3 text-right font-semibold text-primary">{u.balance}P</td>
                    <td className="py-2 px-3 text-right text-gray-500">{u.lifetime_earned}P</td>
                    <td className="py-2 px-3 text-center text-gray-500">{u.current_streak_days}일</td>
                    <td className="py-2 px-3 text-center text-gray-500">{u.longest_streak_days}일</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-4 text-center">데이터 없음</p>
        )}
      </section>

      {/* Action Distribution */}
      {data && data.actionDistribution.length > 0 && (
        <section className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-3">액션별 분포</h3>
          <div className="space-y-2">
            {data.actionDistribution.map((a) => (
              <div key={a.action} className="flex items-center gap-3">
                <span className="w-24 text-xs text-gray-600 text-right shrink-0">{ACTION_LABELS[a.action] ?? a.action}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/70"
                    style={{ width: `${Math.max((a.count / Math.max(...data.actionDistribution.map((x) => x.count))) * 100, 2)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-16 text-right shrink-0">{a.count}건</span>
                <span className="text-xs text-gray-400 w-16 text-right shrink-0">{a.totalPoints}P</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Manual Adjustment */}
      <section className="bg-white rounded-2xl border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">수동 포인트 조정</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            value={adjustUserId}
            onChange={(e) => setAdjustUserId(e.target.value)}
            placeholder="사용자 ID"
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary/50"
          />
          <input
            type="number"
            value={adjustPoints}
            onChange={(e) => setAdjustPoints(e.target.value)}
            placeholder="포인트 (±)"
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary/50"
          />
          <input
            type="text"
            value={adjustReason}
            onChange={(e) => setAdjustReason(e.target.value)}
            placeholder="사유"
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary/50"
          />
          <button
            type="button"
            onClick={handleAdjust}
            disabled={adjusting || !adjustUserId || !adjustPoints || !adjustReason}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-primary text-white disabled:opacity-50 hover:bg-primary-light"
          >
            {adjusting ? "처리 중..." : "조정"}
          </button>
        </div>
      </section>
    </div>
  );
}
