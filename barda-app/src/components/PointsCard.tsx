"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { POINT_DAILY_CAP, STORAGE_KEYS } from "@/lib/constants";
import type { PointBalanceResponse } from "@/lib/api-types";

export default function PointsCard() {
  const [data, setData] = useState<PointBalanceResponse | null>(null);

  useEffect(() => {
    // localStorage에서 캐시 즉시 렌더
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.POINTS_BALANCE);
      if (cached) setData(JSON.parse(cached));
    } catch { /* ignore */ }

    // API에서 최신 데이터 fetch
    fetch("/api/points")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && "balance" in json) {
          setData(json);
          localStorage.setItem(STORAGE_KEYS.POINTS_BALANCE, JSON.stringify(json));
        }
      })
      .catch(() => { /* 오프라인 fallback */ });
  }, []);

  if (!data) return null;

  const dailyPct = Math.min(100, (data.dailyEarned / POINT_DAILY_CAP) * 100);

  return (
    <Link
      href="/points"
      className="block bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/15 p-4 mb-4 hover:shadow-sm transition-shadow"
    >
      {/* 상단: 잔액 + 스트릭 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="trophy" size={16} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 leading-none mb-0.5">내 포인트</p>
            <p className="text-lg font-bold text-gray-900">{data.balance.toLocaleString()}P</p>
          </div>
        </div>

        {data.currentStreak > 0 && (
          <div className="flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full">
            <Icon name="fire" size={14} />
            <span className="text-xs font-semibold text-amber-600">{data.currentStreak}일 연속</span>
          </div>
        )}
      </div>

      {/* 하단: 오늘 적립 프로그레스 */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${dailyPct}%` }}
            />
          </div>
        </div>
        <span className="text-[10px] text-gray-400 whitespace-nowrap">
          오늘 +{data.dailyEarned}P / {POINT_DAILY_CAP}P
        </span>
      </div>
    </Link>
  );
}
