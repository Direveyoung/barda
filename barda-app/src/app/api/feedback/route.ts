import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Database connection unavailable" },
      { status: 503 },
    );
  }

  let conflictRuleId: string;
  let isHelpful: boolean;
  let sessionId: string;

  try {
    const body = await request.json();
    conflictRuleId = body.conflict_rule_id;
    isHelpful = body.is_helpful;
    sessionId = body.session_id;

    if (!conflictRuleId || typeof isHelpful !== "boolean" || !sessionId) {
      throw new Error("Missing required fields");
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body: conflict_rule_id, is_helpful, and session_id are required" },
      { status: 400 },
    );
  }

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
    conflict_rule_id: conflictRuleId,
    is_helpful: isHelpful,
    session_id: sessionId,
    ...(userId ? { user_id: userId } : {}),
  });

  if (error) {
    console.error("Failed to insert feedback:", error);
    return NextResponse.json(
      { error: "Failed to store feedback" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
