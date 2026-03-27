"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import { SKIN_TYPE_LABEL, CONCERN_LABEL } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/date-utils";

/* ─── Types ─── */
interface PostDetail {
  id: string;
  user_email_prefix: string;
  skin_type: string;
  concerns: string[];
  score: number;
  rating: number;
  comment: string | null;
  like_count: number;
  comment_count: number;
  products_json: { name: string; categoryId: string }[];
  created_at: string;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_email?: string;
}

/* ─── Labels ─── */
const skinTypeLabel = SKIN_TYPE_LABEL;
const concernLabel = CONCERN_LABEL;

function anonymize(prefix: string): string {
  if (prefix.length < 2) return prefix + "***";
  return prefix.slice(0, 2) + "***";
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i <= rating ? "text-am-deep" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      ))}
    </span>
  );
}

/* ─── Main Client Component ─── */
export default function RoutineDetailClient({ postId }: { postId: string }) {
  const router = useRouter();
  const { user } = useAuth();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [followedToast, setFollowedToast] = useState(false);

  // Follow this routine — save to localStorage for checklist
  const handleFollowRoutine = useCallback(() => {
    if (!post) return;
    try {
      const routineData = {
        score: post.score,
        skinType: post.skin_type,
        concerns: post.concerns,
        amRoutine: (post.products_json ?? []).map((p) => ({ name: p.name })),
        pmRoutine: (post.products_json ?? []).map((p) => ({ name: p.name })),
        savedAt: new Date().toISOString(),
        followedFrom: post.user_email_prefix,
      };
      localStorage.setItem("barda_last_routine", JSON.stringify(routineData));
      setFollowedToast(true);
      setTimeout(() => setFollowedToast(false), 2500);
    } catch { /* ignore */ }
  }, [post]);

  // Share via Web Share API or clipboard
  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/feed/${postId}`;
    const text = post
      ? `${anonymize(post.user_email_prefix)}님의 스킨케어 루틴 (점수 ${post.score}점) - BARDA`
      : "BARDA 스킨케어 루틴";

    if (navigator.share) {
      try {
        await navigator.share({ title: "BARDA 루틴", text, url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      alert("링크가 복사되었습니다!");
    }
  }, [post, postId]);

  // Fetch post detail
  useEffect(() => {
    async function load() {
      try {
        const [postRes, commentsRes] = await Promise.all([
          fetch(`/api/routines?page=1&limit=50`),
          fetch(`/api/routines/${postId}/comments`),
        ]);

        if (postRes.ok) {
          const postJson = await postRes.json();
          const found = (postJson.posts ?? []).find(
            (p: PostDetail) => p.id === postId
          );
          setPost(found ?? null);
        }

        if (commentsRes.ok) {
          const commentsJson = await commentsRes.json();
          setComments(commentsJson.comments ?? []);
        }
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [postId]);

  // Like toggle
  const handleLike = useCallback(async () => {
    if (!user || !post) return;
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setPost((prev) =>
      prev ? { ...prev, like_count: prev.like_count + (wasLiked ? -1 : 1) } : prev
    );
    try {
      const res = await fetch(`/api/routines/${postId}/like`, { method: "POST" });
      if (!res.ok) throw new Error();
    } catch {
      setIsLiked(wasLiked);
      setPost((prev) =>
        prev ? { ...prev, like_count: prev.like_count + (wasLiked ? 1 : -1) } : prev
      );
    }
  }, [user, post, isLiked, postId]);

  // Submit comment
  const handleSubmitComment = useCallback(async () => {
    if (!commentText.trim() || !user) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/routines/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setComments((prev) => [...prev, json.comment]);
      setCommentText("");
      setPost((prev) =>
        prev ? { ...prev, comment_count: prev.comment_count + 1 } : prev
      );
    } catch (err) {
      console.error("Comment submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [commentText, user, postId]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-16">
        <div className="max-w-lg mx-auto px-4 pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-6 w-24 bg-gray-100 rounded-full" />
              <div className="h-16 w-full bg-gray-50 rounded" />
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen pb-16">
        <div className="max-w-lg mx-auto px-4 pt-20 text-center">
          <p className="text-gray-500 text-sm mb-4">루틴을 찾을 수 없어요</p>
          <button
            onClick={() => router.push("/feed")}
            className="text-sm text-primary font-medium"
          >
            피드로 돌아가기
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-800">루틴 상세</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4">
        {/* Post Detail Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
          {/* User + time */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              {anonymize(post.user_email_prefix)}
            </span>
            <span className="text-xs text-gray-400">
              {formatRelativeTime(post.created_at)}
            </span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-primary-bg text-primary">
              {skinTypeLabel[post.skin_type] ?? post.skin_type}
            </span>
            {post.concerns.map((c) => (
              <span
                key={c}
                className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500"
              >
                {concernLabel[c] ?? c}
              </span>
            ))}
          </div>

          {/* Score + Rating */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">점수</span>
              <span className="text-lg font-bold text-primary">{post.score}</span>
            </div>
            <StarRating rating={post.rating} />
          </div>

          {/* Comment */}
          {post.comment && (
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {post.comment}
            </p>
          )}

          {/* Products */}
          {post.products_json && post.products_json.length > 0 && (
            <div className="border-t border-gray-100 pt-3 mb-3">
              <p className="text-xs font-medium text-gray-500 mb-2">사용 제품</p>
              <div className="flex flex-wrap gap-1.5">
                {post.products_json.map((p, i) => (
                  <span
                    key={i}
                    className="inline-block px-2.5 py-1 text-xs rounded-lg bg-gray-50 text-gray-600"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleLike}
              className="flex items-center gap-1 text-sm transition-colors"
            >
              <svg
                className={`w-5 h-5 ${isLiked ? "text-danger" : "text-gray-400"}`}
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={isLiked ? 0 : 1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              <span className={isLiked ? "text-danger" : "text-gray-400"}>
                {post.like_count}
              </span>
            </button>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
              </svg>
              <span>{post.comment_count}</span>
            </div>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1 text-sm text-gray-400 ml-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Follow Routine CTA */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={handleFollowRoutine}
            className="flex-1 py-3 rounded-xl font-semibold text-sm bg-primary text-white hover:bg-primary-light transition-colors"
          >
            이 루틴 따라하기
          </button>
          <Link
            href="/analyze"
            className="px-5 py-3 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            내 루틴 분석
          </Link>
        </div>

        {/* Comments Section */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">
            댓글 {comments.length > 0 && `(${comments.length})`}
          </h3>

          {comments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <p className="text-sm text-gray-400">아직 댓글이 없어요</p>
              <p className="text-xs text-gray-300 mt-1">첫 번째 댓글을 남겨보세요!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-xl border border-gray-100 px-4 py-3"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-600">
                      {c.user_email
                        ? anonymize(c.user_email.split("@")[0])
                        : anonymize(c.user_id.slice(0, 4))}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {formatRelativeTime(c.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {c.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Input */}
        {user ? (
          <div className="sticky bottom-16 bg-white border-t border-gray-100 p-3 -mx-4">
            <div className="max-w-lg mx-auto flex gap-2">
              <input
                type="text"
                placeholder="댓글을 입력하세요..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
                maxLength={500}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary/50"
              />
              <button
                type="button"
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || isSubmitting}
                className="px-4 py-2.5 text-sm font-medium rounded-xl bg-primary text-white disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
              >
                {isSubmitting ? "..." : "등록"}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-4 text-center mb-4">
            <p className="text-xs text-gray-400 mb-2">댓글을 남기려면 로그인이 필요해요</p>
            <a
              href={`/auth/login?next=/feed/${postId}`}
              className="text-xs text-primary font-medium"
            >
              로그인하기
            </a>
          </div>
        )}
      </main>

      {/* Follow toast */}
      {followedToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-sm px-5 py-2.5 rounded-full shadow-lg animate-fade-up">
          홈 체크리스트에 루틴이 저장되었어요!
        </div>
      )}

      <BottomNav />
    </div>
  );
}
