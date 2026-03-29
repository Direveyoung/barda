"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import BottomNav from "@/components/BottomNav";
import { SKIN_TYPE_LABEL, PAGINATION } from "@/lib/constants";

interface RankedPost {
  id: string;
  user_email_prefix: string;
  skin_type: string;
  score: number;
  rating: number;
  like_count: number;
  comment_count: number;
  comment: string | null;
}

const skinTypeLabel = SKIN_TYPE_LABEL;

const rankIcon = ["gold-medal", "silver-medal", "bronze-medal"];

function anonymize(prefix: string): string {
  if (prefix.length < 2) return prefix + "***";
  return prefix.slice(0, 2) + "***";
}

export default function RankingPage() {
  const [tab, setTab] = useState<"popular" | "score">("popular");
  const [posts, setPosts] = useState<RankedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    queueMicrotask(() => setIsLoading(true));
    const sort = tab === "popular" ? "popular" : "latest";
    fetch(`/api/routines?sort=${sort}&page=1&limit=${PAGINATION.RANKING}`)
      .then((r) => r.json())
      .then((json) => {
        let data: RankedPost[] = json.posts ?? [];
        if (tab === "score") {
          data = [...data].sort((a, b) => b.score - a.score);
        }
        setPosts(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [tab]);

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-primary">BARDA</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">루틴 랭킹</h2>
        <p className="text-xs text-gray-400 mb-4">가장 인기 있는 루틴을 확인해 보세요</p>

        {/* Tab */}
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1 mb-5">
          <button
            type="button"
            onClick={() => setTab("popular")}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === "popular" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"
            }`}
          >
            인기순
          </button>
          <button
            type="button"
            onClick={() => setTab("score")}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === "score" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"
            }`}
          >
            점수순
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                    <div className="h-3 w-16 bg-gray-100 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <Icon name="trophy" size={24} />
            <p className="text-sm">아직 랭킹 데이터가 없어요</p>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map((post, i) => (
              <Link
                key={post.id}
                href={`/feed/${post.id}`}
                className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Rank */}
                <div className="w-8 text-center shrink-0">
                  {i < 3 ? (
                    <Icon name={rankIcon[i]} size={24} />
                  ) : (
                    <span className="text-sm font-bold text-gray-400">{i + 1}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-gray-700">
                      {anonymize(post.user_email_prefix)}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary-bg text-primary font-medium">
                      {skinTypeLabel[post.skin_type] ?? post.skin_type}
                    </span>
                  </div>
                  {post.comment && (
                    <p className="text-xs text-gray-500 truncate">{post.comment}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-primary">{post.score}점</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span><Icon name="heart" size={12} className="text-red-500" /> {post.like_count}</span>
                    <span><Icon name="comment-bubble" size={12} /> {post.comment_count}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
