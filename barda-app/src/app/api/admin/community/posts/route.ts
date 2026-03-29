import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const { supabase } = auth;

  try {
    const { data } = await supabase
      .from("routine_posts")
      .select("id, user_id, skin_type, score, rating, like_count, comment_count, comment, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!data) return NextResponse.json({ posts: [] });

    // Get user email prefixes
    const userIds = [...new Set(data.map((p) => p.user_id))];
    const { data: users } = await supabase.auth.admin.listUsers();

    const emailMap = new Map<string, string>();
    if (users?.users) {
      for (const u of users.users) {
        if (userIds.includes(u.id) && u.email) {
          const prefix = u.email.split("@")[0];
          emailMap.set(u.id, prefix.length > 3 ? prefix.slice(0, 2) + "***" : prefix);
        }
      }
    }

    const posts = data.map((p) => ({
      ...p,
      user_email_prefix: emailMap.get(p.user_id) ?? "unknown",
    }));

    return NextResponse.json({ posts, total: posts.length });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}

