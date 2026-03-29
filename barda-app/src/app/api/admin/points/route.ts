import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const { supabase } = auth;

  try {
    // Leaderboard
    const { data: pointUsers } = await supabase
      .from("user_points")
      .select("user_id, balance, lifetime_earned, lifetime_redeemed, current_streak_days, longest_streak_days")
      .order("balance", { ascending: false })
      .limit(50);

    // Get nicknames
    const userIds = (pointUsers ?? []).map((u) => u.user_id);
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("user_id, nickname")
      .in("user_id", userIds);

    const nickMap = new Map((profiles ?? []).map((p) => [p.user_id, p.nickname]));

    const users = (pointUsers ?? []).map((u) => ({
      ...u,
      nickname: nickMap.get(u.user_id) ?? "",
    }));

    // Aggregate totals
    const totalPoints = users.reduce((sum, u) => sum + (u.lifetime_earned ?? 0), 0);

    // Action distribution
    const { data: distribution } = await supabase
      .from("point_transactions")
      .select("action, points")
      .order("created_at", { ascending: false })
      .limit(1000);

    const actionMap = new Map<string, { count: number; totalPoints: number }>();
    for (const row of distribution ?? []) {
      const existing = actionMap.get(row.action) ?? { count: 0, totalPoints: 0 };
      existing.count++;
      existing.totalPoints += Math.abs(row.points ?? 0);
      actionMap.set(row.action, existing);
    }

    const actionDistribution = Array.from(actionMap.entries())
      .map(([action, data]) => ({ action, ...data }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      users,
      totalPoints,
      totalTransactions: (distribution ?? []).length,
      actionDistribution,
    });
  } catch {
    return NextResponse.json({ users: [], totalPoints: 0, totalTransactions: 0, actionDistribution: [] });
  }
}
