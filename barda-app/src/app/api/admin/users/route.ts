import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const { supabase } = auth;

  try {
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("user_id, nickname, skin_type, concerns, onboarding_complete, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!profiles) return NextResponse.json({ users: [] });

    // Try to join with user_points
    const userIds = profiles.map((p) => p.user_id);
    const { data: points } = await supabase
      .from("user_points")
      .select("user_id, balance")
      .in("user_id", userIds);

    const pointsMap = new Map((points ?? []).map((p) => [p.user_id, p.balance]));

    const users = profiles.map((p) => ({
      ...p,
      balance: pointsMap.get(p.user_id) ?? 0,
    }));

    return NextResponse.json({ users, total: users.length });
  } catch {
    return NextResponse.json({ users: [] });
  }
}
