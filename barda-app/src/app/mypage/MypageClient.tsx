"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import RoutinePostCard, {
  type RoutinePost,
} from "@/components/RoutinePostCard";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import Icon from "@/components/Icon";
import PointsCard from "@/components/PointsCard";
import BadgeCard from "@/components/BadgeCard";
import AdherenceDashboard from "@/components/AdherenceDashboard";
import { SKIN_TYPE_LABEL, STORAGE_KEYS, PAGINATION } from "@/lib/constants";
import { loadBadgeState, buildBadgeContext, evaluateBadges, saveBadgeState } from "@/lib/badge-repository";
import type { EarnedBadge } from "@/lib/badge-repository";

type TabKey = "analysis" | "shared" | "liked" | "diary";

const tabs: { key: TabKey; label: string }[] = [
  { key: "analysis", label: "내 분석" },
  { key: "shared", label: "공유한 루틴" },
  { key: "liked", label: "좋아요" },
  { key: "diary", label: "다이어리" },
];

const conditionIcon: Record<string, string> = {
  good: "face-happy", normal: "face-good", meh: "face-neutral", bad: "face-worried", terrible: "face-bad",
};
const conditionLabel: Record<string, string> = {
  good: "좋음", normal: "보통", meh: "그저그럭", bad: "별로", terrible: "나쁨",
};

const skinTypeLabel = SKIN_TYPE_LABEL;

interface AnalysisHistory {
  score: number;
  skinType: string;
  concerns: string[];
  savedAt: string;
  amRoutine: { name: string }[];
  pmRoutine: { name: string }[];
}

interface DiaryEntry {
  date: string;
  condition: string;
  memo: string;
}

export default function MypageClient() {
  const { user, isLoading: authLoading, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>("analysis");
  const [sharedPosts, setSharedPosts] = useState<RoutinePost[]>([]);
  const [likedPosts, setLikedPosts] = useState<RoutinePost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [badges, setBadges] = useState<EarnedBadge[]>([]);

  // Load analysis history + diary from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LAST_ROUTINE);
      if (saved) {
        const parsed = JSON.parse(saved);
        setAnalysisHistory([parsed]);
      }
    } catch { /* ignore */ }

    const entries: DiaryEntry[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      try {
        const data = localStorage.getItem(STORAGE_KEYS.diary(key));
        if (data) {
          const parsed = JSON.parse(data);
          entries.push({ date: key, condition: parsed.condition, memo: parsed.memo ?? "" });
        }
      } catch { /* ignore */ }
    }
    setDiaryEntries(entries);

    // Evaluate badges
    const ctx = buildBadgeContext();
    const state = loadBadgeState();
    const { updatedState } = evaluateBadges(ctx, state);
    saveBadgeState(updatedState);
    setBadges(updatedState.earnedBadges);
  }, []);

  const fetchSharedPosts = useCallback(async () => {
    if (!user) return;
    setIsLoadingPosts(true);
    try {
      const params = new URLSearchParams();
      params.set("userId", user.id);
      const res = await fetch(`/api/routines?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setSharedPosts(json.posts ?? []);
    } catch (err) {
      console.error("Fetch shared posts error:", err);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [user]);

  const fetchLikedPosts = useCallback(async () => {
    if (!user) return;
    setIsLoadingPosts(true);
    try {
      const res = await fetch(`/api/routines?sort=popular&page=1&limit=${PAGINATION.LIKED_POSTS}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setLikedPosts(json.posts ?? []);
    } catch (err) {
      console.error("Fetch liked posts error:", err);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "shared") fetchSharedPosts();
    if (activeTab === "liked") fetchLikedPosts();
  }, [activeTab, fetchSharedPosts, fetchLikedPosts]);

  function handleLike(postId: string) {
    const update = (setter: (fn: (prev: RoutinePost[]) => RoutinePost[]) => void) => {
      setter((prev) => prev.map((p) => p.id === postId ? { ...p, like_count: p.like_count + 1 } : p));
      fetch(`/api/routines/${postId}/like`, { method: "POST" }).catch(() => {
        setter((prev) => prev.map((p) => p.id === postId ? { ...p, like_count: p.like_count - 1 } : p));
      });
    };
    if (activeTab === "shared") update(setSharedPosts);
    if (activeTab === "liked") update(setLikedPosts);
  }

  function formatDate(dateStr: string | undefined): string {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 가입`;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pb-16">
        <div className="max-w-lg mx-auto px-4 pt-20 text-center">
          <p className="text-gray-500 text-sm mb-4">로그인이 필요합니다</p>
          <a
            href="/auth/login"
            className="inline-block px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-light transition-colors"
          >
            로그인하기
          </a>
        </div>
        <BottomNav />
      </div>
    );
  }

  const PostSkeleton = () => (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse">
          <div className="h-4 w-20 bg-gray-200 rounded mb-3" />
          <div className="flex gap-2 mb-3">
            <div className="h-5 w-12 bg-gray-100 rounded-full" />
            <div className="h-5 w-14 bg-gray-100 rounded-full" />
          </div>
          <div className="h-10 w-full bg-gray-50 rounded" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* User info */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 rounded-full bg-primary-bg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{user.email}</p>
              <p className="text-xs text-gray-400">{formatDate(user.created_at)}</p>
            </div>
            <Link
              href="/mypage/profile"
              className="px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              프로필 설정
            </Link>
          </div>
        </div>

        {/* Points Card */}
        <PointsCard />

        {/* Badges */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
            <Icon name="trophy" size={14} /> 배지
          </h3>
          <BadgeCard earnedBadges={badges} />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-xs font-medium text-center border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-400 hover:text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: 내 분석 */}
        {activeTab === "analysis" && (
          <div>
            {analysisHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <svg className="w-10 h-10 mb-2 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.59.659H9.06a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V6.5a2.25 2.25 0 00-2.25-2.25h-9.5A2.25 2.25 0 005 6.5v8" />
                </svg>
                <p className="text-sm mb-3">아직 분석 내역이 없어요</p>
                <Link href="/analyze" className="text-xs text-primary font-medium">
                  루틴 분석하러 가기 →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {analysisHistory.map((h, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="relative w-14 h-14">
                        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                          <circle cx="60" cy="60" r="50" fill="none" stroke="#F3F4F6" strokeWidth="8" />
                          <circle cx="60" cy="60" r="50" fill="none" stroke="#D4726A" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(h.score / 100) * 314} 314`} />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">{h.score}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-bg text-primary font-medium">
                            {skinTypeLabel[h.skinType] ?? h.skinType}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {h.savedAt ? new Date(h.savedAt).toLocaleDateString("ko-KR") : "최근 분석"}
                        </p>
                      </div>
                      <Link href="/analyze" className="text-xs text-primary font-medium">재분석 →</Link>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-amber-50/50 rounded-xl p-2.5">
                        <p className="text-[10px] text-gray-400 mb-1 flex items-center gap-0.5"><Icon name="sun" size={12} /> 아침</p>
                        <p className="text-xs text-gray-600">{h.amRoutine?.length ?? 0}개 제품</p>
                      </div>
                      <div className="bg-purple-50/50 rounded-xl p-2.5">
                        <p className="text-[10px] text-gray-400 mb-1 flex items-center gap-0.5"><Icon name="moon" size={12} /> 저녁</p>
                        <p className="text-xs text-gray-600">{h.pmRoutine?.length ?? 0}개 제품</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: 공유한 루틴 */}
        {activeTab === "shared" && (
          <div>
            {isLoadingPosts ? <PostSkeleton /> : sharedPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <p className="text-sm">아직 공유한 루틴이 없어요</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sharedPosts.map((post) => (
                  <RoutinePostCard key={post.id} post={post} onLike={handleLike} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: 좋아요 */}
        {activeTab === "liked" && (
          <div>
            {isLoadingPosts ? <PostSkeleton /> : likedPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <svg className="w-10 h-10 mb-2 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                <p className="text-sm">좋아요한 루틴이 없어요</p>
                <Link href="/feed" className="text-xs text-primary font-medium mt-2">피드 둘러보기 →</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {likedPosts.map((post) => (
                  <RoutinePostCard key={post.id} post={post} onLike={handleLike} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: 다이어리 */}
        {activeTab === "diary" && (
          <div>
            <AdherenceDashboard />
            {diaryEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <span className="mb-2 text-gray-300"><Icon name="memo" size={24} /></span>
                <p className="text-sm mb-1">아직 기록이 없어요</p>
                <p className="text-xs text-gray-300">홈에서 매일 피부 컨디션을 기록해 보세요</p>
              </div>
            ) : (
              <div className="space-y-2">
                {diaryEntries.map((entry) => (
                  <div key={entry.date} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
                    <Icon name={conditionIcon[entry.condition] ?? "face-neutral"} size={20} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">{entry.date}</span>
                        <span className="text-[10px] text-gray-400">{conditionLabel[entry.condition] ?? entry.condition}</span>
                      </div>
                      {entry.memo && <p className="text-xs text-gray-500 mt-0.5 truncate">{entry.memo}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sign out */}
        <div className="mt-10 mb-6">
          <button
            type="button"
            onClick={signOut}
            className="w-full py-3 text-sm text-gray-400 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
