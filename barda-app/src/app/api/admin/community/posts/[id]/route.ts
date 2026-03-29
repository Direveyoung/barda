import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const { supabase } = auth;

  const { id } = await params;

  try {
    // Delete comments first (referential integrity)
    await supabase.from("routine_post_comments").delete().eq("post_id", id);
    await supabase.from("routine_post_likes").delete().eq("post_id", id);
    await supabase.from("routine_posts").delete().eq("id", id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
