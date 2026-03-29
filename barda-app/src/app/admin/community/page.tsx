"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader, EmptyDBState, TableSkeleton, StatusBadge } from "@/components/admin/shared";

interface AdminPost {
  id: string;
  user_email_prefix: string;
  skin_type: string;
  score: number;
  rating: number;
  like_count: number;
  comment_count: number;
  comment: string | null;
  created_at: string;
}

const SKIN_LABEL: Record<string, string> = {
  oily: "지성", dry: "건성", combination: "복합성", sensitive: "민감성", normal: "중성",
};

export default function AdminCommunityPage() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbAvailable, setDbAvailable] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/community/posts")
      .then((res) => {
        if (res.status === 503) { setDbAvailable(false); return null; }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => { if (data) setPosts(data.posts ?? []); })
      .catch(() => setDbAvailable(false))
      .finally(() => setLoading(false));
  }, []);

  const deletePost = useCallback(async (id: string) => {
    if (!confirm("이 게시글을 삭제하시겠습니까?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/community/posts/${id}`, { method: "DELETE" });
      if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch { /* ignore */ }
    setDeletingId(null);
  }, []);

  if (!dbAvailable) {
    return (
      <div>
        <PageHeader title="커뮤니티 관리" description="게시글 및 댓글 관리" />
        <EmptyDBState label="DB 연결 시 사용 가능" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="커뮤니티 관리" description={loading ? "로딩 중..." : `총 ${posts.length}개 게시글`} />

      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        {loading ? <TableSkeleton rows={8} /> : posts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">작성자</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">피부</th>
                  <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">점수</th>
                  <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">평점</th>
                  <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">좋아요</th>
                  <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500">댓글</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">내용</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">날짜</th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-500">액션</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2.5 px-3 text-gray-700">{p.user_email_prefix}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status="low" label={SKIN_LABEL[p.skin_type] ?? p.skin_type} />
                    </td>
                    <td className="py-2.5 px-3 text-center font-medium text-gray-700">{p.score}</td>
                    <td className="py-2.5 px-3 text-center text-gray-500">{p.rating}/5</td>
                    <td className="py-2.5 px-3 text-center text-gray-500">{p.like_count}</td>
                    <td className="py-2.5 px-3 text-center text-gray-500">{p.comment_count}</td>
                    <td className="py-2.5 px-3 text-gray-500 text-xs truncate max-w-[200px] hidden lg:table-cell">{p.comment ?? "-"}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString("ko-KR")}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => deletePost(p.id)}
                        disabled={deletingId === p.id}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-8 text-center">게시글이 없습니다</p>
        )}
      </div>
    </div>
  );
}
