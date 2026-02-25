"use client";

import { useCallback, useEffect, useState } from "react";
import RoutinePostCard, {
  type RoutinePost,
} from "@/components/RoutinePostCard";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";

const skinTypes = [
  { value: "", label: "전체" },
  { value: "dry", label: "건성" },
  { value: "oily", label: "지성" },
  { value: "combination", label: "복합성" },
  { value: "sensitive", label: "민감성" },
  { value: "normal", label: "중성" },
] as const;

const concerns = [
  { value: "acne", label: "여드름" },
  { value: "wrinkle", label: "주름" },
  { value: "pigmentation", label: "색소침착" },
  { value: "dryness", label: "건조" },
  { value: "sensitivity", label: "민감" },
  { value: "pore", label: "모공" },
  { value: "blackhead", label: "블랙헤드" },
  { value: "redness", label: "홍조" },
  { value: "darkCircle", label: "다크서클" },
] as const;

const PAGE_SIZE = 10;

export default function FeedClient() {
  const { user } = useAuth();

  const [posts, setPosts] = useState<RoutinePost[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [skinTypeFilter, setSkinTypeFilter] = useState("");
  const [concernFilter, setConcernFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sort, setSort] = useState<"latest" | "popular">("latest");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchPosts = useCallback(
    async (pageNum: number, replace: boolean) => {
      const params = new URLSearchParams();
      if (skinTypeFilter) params.set("skin_type", skinTypeFilter);
      if (concernFilter) params.set("concern", concernFilter);
      if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
      params.set("sort", sort);
      params.set("page", String(pageNum + 1));
      params.set("limit", String(PAGE_SIZE));

      try {
        const res = await fetch(`/api/routines?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch routines");

        const json = await res.json();
        const data: RoutinePost[] = json.posts ?? [];

        setPosts((prev) => (replace ? data : [...prev, ...data]));
        setHasMore(data.length === PAGE_SIZE);
      } catch (err) {
        console.error("Fetch posts error:", err);
      }
    },
    [skinTypeFilter, concernFilter, debouncedQuery, sort]
  );

  // Initial load & filter/sort changes
  useEffect(() => {
    setIsLoading(true);
    setPage(0);
    fetchPosts(0, true).finally(() => setIsLoading(false));
  }, [fetchPosts]);

  // Load more
  async function handleLoadMore() {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    setPage(nextPage);
    await fetchPosts(nextPage, false);
    setIsLoadingMore(false);
  }

  // Like toggle
  async function handleLike(postId: string) {
    if (!user) return;

    const wasLiked = likedIds.has(postId);

    // Optimistic update
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (wasLiked) next.delete(postId);
      else next.add(postId);
      return next;
    });

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, like_count: p.like_count + (wasLiked ? -1 : 1) }
          : p
      )
    );

    try {
      const res = await fetch(`/api/routines/${postId}/like`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Like failed");
    } catch {
      // Revert on failure
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.add(postId);
        else next.delete(postId);
        return next;
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, like_count: p.like_count + (wasLiked ? 1 : -1) }
            : p
        )
      );
    }
  }

  const hasActiveFilter = skinTypeFilter || concernFilter || debouncedQuery;

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Page title */}
        <h1 className="text-xl font-bold text-gray-800 mb-4">커뮤니티 피드</h1>

        {/* Search bar */}
        <div className="relative mb-3">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder="루틴 검색 (키워드, 제품명...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-primary/50 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Skin type filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {skinTypes.map((st) => (
            <button
              key={st.value}
              type="button"
              onClick={() => setSkinTypeFilter(st.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                skinTypeFilter === st.value
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Concern filter pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide mt-2 mb-2">
          {concerns.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setConcernFilter(concernFilter === c.value ? "" : c.value)}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                concernFilter === c.value
                  ? "bg-gray-700 text-white border-gray-700"
                  : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Sort toggle + active filter indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSort("latest")}
              className={`text-xs font-medium ${
                sort === "latest" ? "text-gray-800" : "text-gray-400"
              }`}
            >
              최신순
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={() => setSort("popular")}
              className={`text-xs font-medium ${
                sort === "popular" ? "text-gray-800" : "text-gray-400"
              }`}
            >
              인기순
            </button>
          </div>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={() => {
                setSkinTypeFilter("");
                setConcernFilter("");
                setSearchQuery("");
              }}
              className="text-[11px] text-primary font-medium"
            >
              필터 초기화
            </button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          /* Loading skeleton */
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                  <div className="h-3 w-12 bg-gray-100 rounded" />
                </div>
                <div className="flex gap-2 mb-3">
                  <div className="h-5 w-12 bg-gray-100 rounded-full" />
                  <div className="h-5 w-14 bg-gray-100 rounded-full" />
                </div>
                <div className="h-4 w-24 bg-gray-100 rounded mb-2" />
                <div className="h-10 w-full bg-gray-50 rounded" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg
              className="w-12 h-12 mb-3 text-gray-300"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <p className="text-sm">아직 공유된 루틴이 없어요</p>
          </div>
        ) : (
          /* Posts list */
          <div className="space-y-4">
            {posts.map((post) => (
              <RoutinePostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                isLiked={likedIds.has(post.id)}
              />
            ))}

            {/* Load more */}
            {hasMore && (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="w-full py-3 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {isLoadingMore ? "불러오는 중..." : "더 보기"}
              </button>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
