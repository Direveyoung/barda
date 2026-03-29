"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";
import { loadDiaryRange, type DiaryEntry } from "@/lib/user-data-repository";
import { CONDITION_SCORE, CONDITION_LABEL, STORAGE_KEYS } from "@/lib/constants";
import ClinicChecklist from "@/components/ClinicChecklist";

const CONDITION_ICON: Record<string, string> = {
  good: "face-happy",
  normal: "face-good",
  meh: "face-neutral",
  bad: "face-worried",
  terrible: "face-bad",
};

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
}

/* ── SVG Line Chart ── */

function ConditionChart({ data, days }: { data: Record<string, DiaryEntry>; days: number }) {
  const width = 600;
  const height = 200;
  const padX = 40;
  const padY = 20;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const today = new Date();
  const points: { x: number; y: number; date: string; condition: string }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = formatDate(d);
    const entry = data[key];
    if (!entry) continue;

    const score = CONDITION_SCORE[entry.condition] ?? 3;
    const x = padX + ((days - 1 - i) / (days - 1)) * chartW;
    const y = padY + chartH - ((score - 1) / 4) * chartH;
    points.push({ x, y, date: key, condition: entry.condition });
  }

  if (points.length === 0) return null;

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Y-axis labels
  const yLabels = [
    { score: 5, label: "좋음" },
    { score: 3, label: "보통" },
    { score: 1, label: "나쁨" },
  ];

  // X-axis: show every 7th date
  const xLabels: { x: number; label: string }[] = [];
  for (let i = days - 1; i >= 0; i -= 7) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const x = padX + ((days - 1 - i) / (days - 1)) * chartW;
    xLabels.push({ x, label: `${d.getMonth() + 1}/${d.getDate()}` });
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {/* Grid lines */}
      {yLabels.map((yl) => {
        const y = padY + chartH - ((yl.score - 1) / 4) * chartH;
        return (
          <g key={yl.score}>
            <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#f3f4f6" strokeWidth={1} />
            <text x={padX - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#9ca3af">
              {yl.label}
            </text>
          </g>
        );
      })}

      {/* X labels */}
      {xLabels.map((xl) => (
        <text key={xl.label} x={xl.x} y={height - 2} textAnchor="middle" fontSize={9} fill="#9ca3af">
          {xl.label}
        </text>
      ))}

      {/* Area fill */}
      {points.length >= 2 && (
        <polygon
          points={`${points[0].x},${padY + chartH} ${polyline} ${points[points.length - 1].x},${padY + chartH}`}
          fill="url(#areaGrad)"
          opacity={0.3}
        />
      )}

      {/* Line */}
      <polyline points={polyline} fill="none" stroke="#7c3aed" strokeWidth={2} strokeLinejoin="round" />

      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#7c3aed" stroke="white" strokeWidth={1.5} />
      ))}

      {/* Gradient def */}
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── Main Page ── */

export default function DiaryPage() {
  const { user } = useAuth();
  const [diaryData, setDiaryData] = useState<Record<string, DiaryEntry>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<30 | 7>(30);

  const userId = user?.id ?? "anonymous";

  useEffect(() => {
    const startDate = daysAgo(period - 1);
    const endDate = formatDate(new Date());

    loadDiaryRange(userId, startDate, endDate).then((data) => {
      setDiaryData(data);
      setIsLoading(false);
    });
  }, [userId, period]);

  // Stats
  const entries = Object.entries(diaryData);
  const scores = entries.map(([, e]) => CONDITION_SCORE[e.condition] ?? 3);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const recordDays = entries.length;

  // Trend: compare last 7 vs previous 7
  const today = new Date();
  const last7: number[] = [];
  const prev7: number[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = formatDate(d);
    const entry = diaryData[key];
    if (entry) {
      const score = CONDITION_SCORE[entry.condition] ?? 3;
      if (i < 7) last7.push(score);
      else prev7.push(score);
    }
  }
  const last7Avg = last7.length > 0 ? last7.reduce((a, b) => a + b, 0) / last7.length : 0;
  const prev7Avg = prev7.length > 0 ? prev7.reduce((a, b) => a + b, 0) / prev7.length : 0;
  const trendDirection = last7Avg > prev7Avg + 0.3 ? "up" : last7Avg < prev7Avg - 0.3 ? "down" : "stable";

  // Most frequent condition
  const conditionCounts: Record<string, number> = {};
  for (const [, e] of entries) {
    conditionCounts[e.condition] = (conditionCounts[e.condition] ?? 0) + 1;
  }
  const mostFrequent = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Streak
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const key = daysAgo(i);
    if (diaryData[key]) streak++;
    else break;
  }

  // Profile info for clinic checklist
  const profileRaw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.PROFILE) : null;
  const profile = profileRaw ? JSON.parse(profileRaw) : null;

  // Share handler
  const handleShare = async () => {
    const params = new URLSearchParams({
      avgScore: avgScore.toFixed(1),
      streakDays: String(streak),
      nickname: profile?.nickname ?? "",
      skinType: profile?.skinType ?? "",
    });
    const url = `${window.location.origin}/api/og/weekly-report?${params}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "BARDA 주간 피부 리포트", url });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">피부 다이어리</h1>
          <div className="flex gap-1">
            {([7, 30] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                  period === p ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {p}일
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Icon name="face-neutral" size={36} />
            <p className="text-sm font-medium mt-3 mb-1">기록이 없어요</p>
            <p className="text-xs text-gray-300">홈에서 매일 피부 컨디션을 기록해 보세요</p>
          </div>
        ) : (
          <>
            {/* Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">
                {period}일 컨디션 트렌드
              </h2>
              <ConditionChart data={diaryData} days={period} />
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <p className="text-xl font-bold text-primary">{avgScore.toFixed(1)}</p>
                <p className="text-[10px] text-gray-400">평균 점수</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <p className="text-xl font-bold text-gray-800">{streak}</p>
                <p className="text-[10px] text-gray-400">연속 기록</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <p className="text-xl font-bold text-gray-800">{recordDays}</p>
                <p className="text-[10px] text-gray-400">기록 일수</p>
              </div>
            </div>

            {/* Trend + Frequent */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">주간 트렌드</span>
                <span className={`text-sm font-semibold ${
                  trendDirection === "up" ? "text-green-500" : trendDirection === "down" ? "text-red-500" : "text-gray-500"
                }`}>
                  {trendDirection === "up" ? "↑ 개선 중" : trendDirection === "down" ? "↓ 주의 필요" : "→ 유지 중"}
                </span>
              </div>
              {mostFrequent && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">가장 많은 컨디션</span>
                  <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                    <Icon name={CONDITION_ICON[mostFrequent] ?? "face-neutral"} size={16} />
                    {CONDITION_LABEL[mostFrequent] ?? mostFrequent}
                  </span>
                </div>
              )}
            </div>

            {/* Recent entries */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">최근 기록</h3>
              <div className="space-y-2">
                {entries
                  .sort(([a], [b]) => b.localeCompare(a))
                  .slice(0, 7)
                  .map(([date, entry]) => (
                    <div key={date} className="flex items-center gap-3 py-1.5">
                      <Icon name={CONDITION_ICON[entry.condition] ?? "face-neutral"} size={20} />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-gray-400">{date.slice(5)}</span>
                        <span className="text-xs text-gray-600 ml-2">
                          {CONDITION_LABEL[entry.condition] ?? entry.condition}
                        </span>
                      </div>
                      {entry.memo && (
                        <span className="text-[10px] text-gray-400 truncate max-w-[120px]">{entry.memo}</span>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary-light transition-colors"
            >
              <Icon name="share" size={16} />
              주간 리포트 공유
            </button>

            {/* Clinic Checklist */}
            <ClinicChecklist
              skinType={profile?.skinType}
              concerns={profile?.concerns}
              avgScore={avgScore}
              trendDirection={trendDirection}
            />
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
