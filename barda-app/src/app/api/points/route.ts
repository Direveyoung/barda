import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { earnPointsSchema, parseWithZod } from "@/lib/api-types";
import type { PointBalanceResponse, EarnPointsResponse, ApiError } from "@/lib/api-types";
import { earnPoints } from "@/lib/point-repository";
import { POINT_ACTIONS, POINT_DAILY_CAP, type PointActionType } from "@/lib/constants";

/* GET /api/points — 포인트 잔액 조회 */
export async function GET(): Promise<NextResponse<PointBalanceResponse | ApiError>> {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: row } = await supabase
    .from("user_points")
    .select("balance, lifetime_earned, lifetime_redeemed, current_streak_days, longest_streak_days")
    .eq("user_id", user.id)
    .single();

  const today = new Date().toISOString().slice(0, 10);
  const { data: txRows } = await supabase
    .from("point_transactions")
    .select("points")
    .eq("user_id", user.id)
    .eq("reference_date", today)
    .gt("points", 0);

  const dailyEarned = (txRows ?? []).reduce((sum, r) => sum + r.points, 0);

  return NextResponse.json({
    balance: row?.balance ?? 0,
    lifetimeEarned: row?.lifetime_earned ?? 0,
    lifetimeRedeemed: row?.lifetime_redeemed ?? 0,
    dailyEarned,
    dailyRemaining: Math.max(0, POINT_DAILY_CAP - dailyEarned),
    currentStreak: row?.current_streak_days ?? 0,
    longestStreak: row?.longest_streak_days ?? 0,
  });
}

/* POST /api/points — 포인트 적립 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<EarnPointsResponse | ApiError>> {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseWithZod(earnPointsSchema, body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { action, reference_id } = parsed.data;

  // 유효한 액션인지 확인
  if (!(action in POINT_ACTIONS)) {
    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }

  const result = await earnPoints(user.id, action as PointActionType, reference_id, supabase);

  if (result.earned === 0 && result.reason) {
    return NextResponse.json({ ok: true, earned: 0, newBalance: result.newBalance, dailyEarned: result.dailyEarned });
  }

  return NextResponse.json({
    ok: true,
    earned: result.earned,
    newBalance: result.newBalance,
    dailyEarned: result.dailyEarned,
  });
}
