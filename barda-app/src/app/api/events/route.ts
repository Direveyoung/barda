import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { BatchEventsResponse, ApiError } from "@/lib/api-types";
import { batchEventsSchema, parseWithZod } from "@/lib/api-types";

export async function POST(request: Request): Promise<NextResponse<BatchEventsResponse | ApiError>> {
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Database connection unavailable" },
      { status: 503 },
    );
  }

  const result = parseWithZod(batchEventsSchema, await request.json().catch(() => null));

  if ("error" in result) {
    return NextResponse.json(
      { error: `Invalid request body: ${result.error}` },
      { status: 400 },
    );
  }

  const rows = result.data.events.map((e) => ({
    event_name: e.event_name,
    session_id: e.session_id,
    event_data: e.metadata ?? null,
    created_at: e.created_at,
  }));

  const { error } = await supabase.from("funnel_events").insert(rows);

  if (error) {
    console.error("Failed to insert funnel events:", error);
    return NextResponse.json(
      { error: "Failed to store events" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, count: rows.length });
}
