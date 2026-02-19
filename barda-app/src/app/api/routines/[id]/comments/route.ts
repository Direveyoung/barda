import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CommentListResponse, CreateCommentResponse, ApiError } from "@/lib/api-types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Database connection unavailable" },
      { status: 503 },
    );
  }

  const { id: postId } = await params;
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const offset = (page - 1) * limit;

  const { data, count, error } = await supabase
    .from("routine_post_comments")
    .select("*", { count: "exact" })
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    comments: data ?? [],
    total: count ?? 0,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Database connection unavailable" },
      { status: 503 },
    );
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  const { id: postId } = await params;

  let content: string;

  try {
    const body = await request.json();
    content = body.content;

    if (typeof content !== "string" || content.length < 1 || content.length > 500) {
      throw new Error("Invalid content length");
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body: content is required (1-500 characters)" },
      { status: 400 },
    );
  }

  const { data: comment, error } = await supabase
    .from("routine_post_comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, comment }, { status: 201 });
}
