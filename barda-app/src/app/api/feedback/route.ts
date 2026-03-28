import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiOk, ApiError } from "@/lib/api-types";
import { feedbackSchema, parseWithZod } from "@/lib/api-types";
import { earnPoints } from "@/lib/point-repository";

export async function POST(request: Request): Promise<NextResponse<ApiOk | ApiError>> {
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Database connection unavailable" },
      { status: 503 },
    );
  }

  const result = parseWithZod(feedbackSchema, await request.json().catch(() => null));

  if ("error" in result) {
    return NextResponse.json(
      { error: `Invalid request body: ${result.error}` },
      { status: 400 },
    );
  }

  const { conflict_rule_id, is_helpful, session_id } = result.data;

  // Optionally attach user_id if the user is authenticated
  let userId: string | null = null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // Anonymous is fine — continue without user_id
  }

  const { error } = await supabase.from("report_feedback").insert({
    conflict_rule_id,
    is_helpful,
    session_id,
    ...(userId ? { user_id: userId } : {}),
  });

  if (error) {
    console.error("Failed to insert feedback:", error);
    return NextResponse.json(
      { error: "Failed to store feedback" },
      { status: 500 },
    );
  }

  // 포인트 적립: 피드백 기여 (fire-and-forget, server client 전달)
  if (userId) {
    earnPoints(userId, "feedback", `feedback:${conflict_rule_id}:${session_id}`, supabase).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
