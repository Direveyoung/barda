"use client";

import { useMemo } from "react";
import Link from "next/link";
import { SKIN_TYPE_LABEL, CONCERN_LABEL } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/date-utils";

export interface RoutinePost {
  id: string;
  user_email_prefix: string;
  skin_type: string;
  concerns: string[];
  score: number;
  rating: number;
  comment: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
}

interface RoutinePostCardProps {
  post: RoutinePost;
  onLike: (id: string) => void;
  isLiked?: boolean;
}

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

export default function RoutinePostCard({
  post,
  onLike,
  isLiked,
}: RoutinePostCardProps) {
  const timeAgo = useMemo(
    () => formatRelativeTime(post.created_at),
    [post.created_at]
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      {/* Header: user + time */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">
          {anonymize(post.user_email_prefix)}
        </span>
        <span className="text-xs text-gray-400">{timeAgo}</span>
      </div>

      {/* Clickable area for detail page */}
      <Link href={`/feed/${post.id}`} className="block">

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-primary-bg text-primary">
          {SKIN_TYPE_LABEL[post.skin_type] ?? post.skin_type}
        </span>
        {post.concerns.map((c) => (
          <span
            key={c}
            className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500"
          >
            {CONCERN_LABEL[c] ?? c}
          </span>
        ))}
      </div>

      {/* Score + Rating */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs text-gray-400">
          점수 <span className="font-semibold text-gray-700">{post.score}</span>
        </span>
        <StarRating rating={post.rating} />
      </div>

      {/* Comment */}
      {post.comment && (
        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
          {post.comment}
        </p>
      )}

      </Link>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
        {/* Like button */}
        <button
          type="button"
          onClick={() => onLike(post.id)}
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

        {/* Comment count */}
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
            />
          </svg>
          <span>{post.comment_count}</span>
        </div>
      </div>
    </div>
  );
}
