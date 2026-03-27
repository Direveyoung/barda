import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { RoutinePostResponse, ApiError } from "@/lib/api-types";

/** GET /api/routines/[id] — 단일 게시글 조회 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<{ post: RoutinePostResponse } | ApiError>> {
  const { id: postId } = await params;

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database connection unavailable" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("routine_posts")
    .select(
      "id, user_id, skin_type, concerns, score, products_json, comment, rating, like_count, comment_count, created_at, users:user_id ( email )",
    )
    .eq("id", postId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const raw = data as Record<string, unknown>;
  const users = raw.users as { email?: string } | null;
  const email = users?.email ?? "";
  const displayName = email.split("@")[0] || "anonymous";

  const post: RoutinePostResponse = {
    id: raw.id as string,
    user_id: raw.user_id as string,
    skin_type: raw.skin_type as string,
    concerns: raw.concerns as string[],
    score: raw.score as number,
    products_json: raw.products_json,
    comment: (raw.comment as string) ?? null,
    rating: raw.rating as number,
    like_count: raw.like_count as number,
    comment_count: raw.comment_count as number,
    created_at: raw.created_at as string,
    user_email_prefix: displayName,
  };

  return NextResponse.json({ post });
}
