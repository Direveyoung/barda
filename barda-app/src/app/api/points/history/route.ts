import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PointHistoryResponse, PointTransactionItem, ApiError } from "@/lib/api-types";
import { POINT_ACTIONS, type PointActionType } from "@/lib/constants";

/* GET /api/points/history?page=1&limit=20 — 포인트 이력 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<PointHistoryResponse | ApiError>> {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10) || 20));
  const from = (page - 1) * limit;

  const { data, count } = await supabase
    .from("point_transactions")
    .select("id, action, points, reference_id, created_at", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  const transactions: PointTransactionItem[] = (data ?? []).map((row) => ({
    id: row.id,
    action: row.action,
    points: row.points,
    referenceId: row.reference_id,
    description: getLabel(row.action),
    createdAt: row.created_at,
  }));

  return NextResponse.json({
    transactions,
    total: count ?? 0,
    page,
    limit,
  });
}

function getLabel(action: string): string {
  const config = POINT_ACTIONS[action as PointActionType];
  if (config) return config.label;
  if (action === "redeem") return "포인트 사용";
  return action;
}
