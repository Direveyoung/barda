"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { POINT_DAILY_CAP, POINT_ACTION_ICON } from "@/lib/constants";
import type { PointBalanceResponse, PointTransactionItem } from "@/lib/api-types";

export default function PointsPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<PointBalanceResponse | null>(null);
  const [transactions, setTransactions] = useState<PointTransactionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/points")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => { if (json) setBalance(json); })
      .catch(() => {});
  }, []);

  const fetchHistory = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/points/history?page=${p}&limit=20`);
      if (!res.ok) return;
      const json = await res.json();
      setTransactions(json.transactions ?? []);
      setTotal(json.total ?? 0);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    if (user) fetchHistory(page);
  }, [user, page, fetchHistory]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  function formatTime(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "방금";
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}시간 전`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}일 전`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/mypage" className="p-1 -ml-1 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">포인트</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* 잔액 카드 */}
        {balance && (
          <div className="bg-gradient-to-br from-primary to-primary-light rounded-2xl p-5 text-white">
            <p className="text-xs opacity-70 mb-1">보유 포인트</p>
            <p className="text-3xl font-bold mb-3">{balance.balance.toLocaleString()}P</p>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/15 rounded-xl py-2">
                <p className="text-lg font-bold">{balance.lifetimeEarned.toLocaleString()}</p>
                <p className="text-[10px] opacity-70">총 적립</p>
              </div>
              <div className="bg-white/15 rounded-xl py-2">
                <p className="text-lg font-bold">{balance.currentStreak}</p>
                <p className="text-[10px] opacity-70">연속 기록</p>
              </div>
              <div className="bg-white/15 rounded-xl py-2">
                <p className="text-lg font-bold">{balance.longestStreak}</p>
                <p className="text-[10px] opacity-70">최장 기록</p>
              </div>
            </div>

            {/* 오늘 프로그레스 */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] opacity-70 mb-1">
                <span>오늘 적립</span>
                <span>{balance.dailyEarned}/{POINT_DAILY_CAP}P</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${Math.min(100, (balance.dailyEarned / POINT_DAILY_CAP) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 적립 방법 안내 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">포인트 적립 방법</h2>
          <div className="space-y-2.5">
            {[
              { icon: "sun", label: "루틴 체크인 (AM/PM)", points: "20P/일" },
              { icon: "memo", label: "피부 컨디션 기록", points: "10P/일" },
              { icon: "camera", label: "바코드 스캔 등록", points: "50P/회" },
              { icon: "beaker", label: "전성분 입력", points: "100P/회" },
              { icon: "thumbs-up", label: "충돌 피드백", points: "10P/회" },
              { icon: "share", label: "루틴 공유", points: "30P/일" },
              { icon: "fire", label: "30일 연속 보너스", points: "+300P" },
            ].map((item) => (
              <div key={item.icon} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <Icon name={item.icon} size={14} />
                </div>
                <span className="flex-1 text-xs text-gray-600">{item.label}</span>
                <span className="text-xs font-semibold text-primary">{item.points}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 이력 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">포인트 내역</h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="sparkle" size={24} />
              <p className="text-sm text-gray-400 mt-2">아직 포인트 내역이 없어요</p>
              <p className="text-xs text-gray-300 mt-1">루틴 체크인으로 첫 포인트를 받아보세요!</p>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      <Icon name={POINT_ACTION_ICON[tx.action] ?? "sparkle"} size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700">{tx.description}</p>
                      <p className="text-[10px] text-gray-400">{formatTime(tx.createdAt)}</p>
                    </div>
                    <span className={`text-sm font-bold ${tx.points > 0 ? "text-primary" : "text-gray-500"}`}>
                      {tx.points > 0 ? "+" : ""}{tx.points}P
                    </span>
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1 text-xs rounded-lg border border-gray-200 disabled:opacity-30"
                  >
                    이전
                  </button>
                  <span className="text-xs text-gray-400">{page}/{totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1 text-xs rounded-lg border border-gray-200 disabled:opacity-30"
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* 리워드 교환 (향후) */}
        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="money" size={16} />
            <h3 className="text-sm font-semibold text-amber-800">리워드 교환</h3>
          </div>
          <p className="text-xs text-amber-600">3,000P로 메가커피 아메리카노 쿠폰과 교환할 수 있어요. (준비 중)</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
