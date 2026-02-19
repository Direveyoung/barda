import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
  RoutinePostListResponse,
  RoutinePostResponse,
  CreateRoutinePostRequest,
  CreateRoutinePostResponse,
  ApiError,
} from "@/lib/api-types";
import { isNonEmptyString, isStringArray } from "@/lib/api-types";

export async function GET(request: NextRequest): Promise<NextResponse<RoutinePostListResponse | ApiError>> {
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Database connection unavailable" },
      { status: 503 },
    );
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));
  const skinType = searchParams.get("skin_type") ?? searchParams.get("skinType");
  const concern = searchParams.get("concern");
  const searchQ = searchParams.get("q");
  const userId = searchParams.get("userId");
  const sort = searchParams.get("sort") ?? "latest";
  const offset = (page - 1) * limit;

  let query = supabase
    .from("routine_posts")
    .select(
      "id, user_id, skin_type, concerns, score, products_json, comment, rating, like_count, comment_count, created_at, users:user_id ( email )",
      { count: "exact" },
    );

  if (skinType) {
    query = query.eq("skin_type", skinType);
  }

  if (concern) {
    query = query.contains("concerns", [concern]);
  }

  if (searchQ) {
    query = query.ilike("comment", `%${searchQ}%`);
  }

  if (userId) {
    query = query.eq("user_id", userId);
  }

  if (sort === "popular") {
    query = query.order("like_count", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("Failed to fetch routine posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch routine posts" },
      { status: 500 },
    );
  }

  const posts: RoutinePostResponse[] = (data ?? []).map((post) => {
    const raw = post as Record<string, unknown>;
    const users = raw.users as { email?: string } | null;
    const email = users?.email ?? "";
    const displayName = email.split("@")[0] || "anonymous";

    return {
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
  });

  return NextResponse.json({
    posts,
    total: count ?? 0,
    page,
    limit,
  });
}

export async function POST(request: Request): Promise<NextResponse<CreateRoutinePostResponse | ApiError>> {
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

  let parsed: CreateRoutinePostRequest;

  try {
    const body = await request.json();
    if (
      !isNonEmptyString(body.skin_type) ||
      !isStringArray(body.concerns) ||
      typeof body.score !== "number" ||
      !body.products_json ||
      typeof body.rating !== "number"
    ) {
      throw new Error("Missing required fields");
    }
    parsed = body as CreateRoutinePostRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body: skin_type, concerns, score, products_json, and rating are required" },
      { status: 400 },
    );
  }

  const { data: post, error } = await supabase
    .from("routine_posts")
    .insert({
      user_id: user.id,
      skin_type: parsed.skin_type,
      concerns: parsed.concerns,
      score: parsed.score,
      products_json: parsed.products_json,
      comment: parsed.comment ?? null,
      rating: parsed.rating,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create routine post:", error);
    return NextResponse.json(
      { error: "Failed to create routine post" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, post }, { status: 201 });
}
