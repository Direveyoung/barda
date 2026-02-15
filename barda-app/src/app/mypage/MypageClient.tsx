"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import RoutinePostCard, {
  type RoutinePost,
} from "@/components/RoutinePostCard";
import BottomNav from "@/components/BottomNav";

type TabKey = "analysis" | "shared" | "liked";

const tabs: { key: TabKey; label: string }[] = [
  { key: "analysis", label: "내 분석" },
  { key: "shared", label: "공유한 루틴" },
  { key: "liked", label: "좋아요" },
];

export default function MypageClient() {
  const { user, isLoading: authLoading, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>("analysis");
  const [sharedPosts, setSharedPosts] = useState<RoutinePost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

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

  useEffect(() => {
    if (activeTab === "shared") {
      fetchSharedPosts();
    }
  }, [activeTab, fetchSharedPosts]);

  function handleLike(postId: string) {
    // Like toggle for own posts — update count optimistically
    setSharedPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, like_count: p.like_count + 1 }
          : p
      )
    );
    fetch(`/api/routines/${postId}/like`, { method: "POST" }).catch(() => {
      setSharedPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, like_count: p.like_count - 1 }
            : p
        )
      );
    });
  }

  // Format join date
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
      <div className="min-h-screen pb-20">
        <div className="max-w-lg mx-auto px-4 pt-20 text-center">
          <p className="text-gray-500 text-sm mb-4">
            로그인이 필요합니다
          </p>
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

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* User info */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 rounded-full bg-primary-bg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {user.email}
              </p>
              <p className="text-xs text-gray-400">
                {formatDate(user.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-sm font-medium text-center border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-400 hover:text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "analysis" && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg
              className="w-10 h-10 mb-2 text-gray-300"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.59.659H9.06a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V6.5a2.25 2.25 0 00-2.25-2.25h-9.5A2.25 2.25 0 005 6.5v8"
              />
            </svg>
            <p className="text-sm">분석 내역은 곧 추가됩니다</p>
          </div>
        )}

        {activeTab === "shared" && (
          <div>
            {isLoadingPosts ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse"
                  >
                    <div className="h-4 w-20 bg-gray-200 rounded mb-3" />
                    <div className="flex gap-2 mb-3">
                      <div className="h-5 w-12 bg-gray-100 rounded-full" />
                      <div className="h-5 w-14 bg-gray-100 rounded-full" />
                    </div>
                    <div className="h-10 w-full bg-gray-50 rounded" />
                  </div>
                ))}
              </div>
            ) : sharedPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <p className="text-sm">아직 공유한 루틴이 없어요</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sharedPosts.map((post) => (
                  <RoutinePostCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "liked" && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg
              className="w-10 h-10 mb-2 text-gray-300"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
            <p className="text-sm">좋아요한 루틴은 곧 추가됩니다</p>
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
