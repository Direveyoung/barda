import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
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

  const { data: existingLike, error: fetchError } = await supabase
    .from("routine_post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    console.error("Failed to check existing like:", fetchError);
    return NextResponse.json(
      { error: "Failed to process like" },
      { status: 500 },
    );
  }

  if (existingLike) {
    const { error: deleteError } = await supabase
      .from("routine_post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Failed to remove like:", deleteError);
      return NextResponse.json(
        { error: "Failed to remove like" },
        { status: 500 },
      );
    }

    return NextResponse.json({ liked: false });
  }

  const { error: insertError } = await supabase
    .from("routine_post_likes")
    .insert({ post_id: postId, user_id: user.id });

  if (insertError) {
    console.error("Failed to add like:", insertError);
    return NextResponse.json(
      { error: "Failed to add like" },
      { status: 500 },
    );
  }

  return NextResponse.json({ liked: true });
}
