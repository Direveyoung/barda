"use client";

import { useEffect, useState } from "react";
import { calculateChecklistStats, type ChecklistStats } from "@/lib/checklist-stats";
import Icon from "@/components/Icon";

function ProgressRing({ rate, color, label }: { rate: number; color: string; label: string }) {
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (rate / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="#F3F4F6" strokeWidth="5" />
          <circle
            cx="32" cy="32" r={r} fill="none"
            stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">
          {rate}%
        </span>
      </div>
      <span className="text-[10px] text-gray-500 mt-1">{label}</span>
    </div>
  );
}

export default function AdherenceDashboard() {
  const [stats, setStats] = useState<ChecklistStats | null>(null);

  useEffect(() => {
    setStats(calculateChecklistStats());
  }, []);

  if (!stats || stats.totalDays === 0) return null;

  const weekLabels = ["이번 주", "2주 전", "3주 전", "4주 전"];
  const maxRate = Math.max(...stats.weeklyRates, 1);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
      <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-1.5">
        <Icon name="chart" size={14} /> 루틴 준수율
      </h3>

      {/* Weekly bar chart */}
      <div className="flex items-end gap-2 h-20 mb-4">
        {stats.weeklyRates.map((rate, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] font-semibold text-gray-600">{rate}%</span>
            <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: "48px" }}>
              <div
                className="absolute bottom-0 w-full rounded-t-lg bg-primary/80 transition-all"
                style={{ height: `${(rate / maxRate) * 100}%`, minHeight: rate > 0 ? "4px" : "0" }}
              />
            </div>
            <span className="text-[9px] text-gray-400">{weekLabels[i]}</span>
          </div>
        ))}
      </div>

      {/* AM/PM rings */}
      <div className="flex justify-center gap-8 mb-4 pt-2 border-t border-gray-100">
        <ProgressRing rate={stats.amRate} color="#F59E0B" label="AM 루틴" />
        <ProgressRing rate={stats.pmRate} color="#8B5CF6" label="PM 루틴" />
        <ProgressRing rate={stats.monthlyRate} color="#D4726A" label="이번 달" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-800">{stats.currentStreak}</p>
          <p className="text-[10px] text-gray-400">현재 연속</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-800">{stats.bestStreak}</p>
          <p className="text-[10px] text-gray-400">최장 연속</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-800">{stats.totalDays}</p>
          <p className="text-[10px] text-gray-400">총 기록일</p>
        </div>
      </div>
    </div>
  );
}
