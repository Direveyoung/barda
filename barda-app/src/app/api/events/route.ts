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

  let events: Array<{
    event_name: string;
    session_id: string;
    metadata?: Record<string, unknown>;
    created_at: string;
  }>;

  try {
    const body = await request.json();
    events = body.events;

    if (!Array.isArray(events) || events.length === 0) {
      throw new Error("events must be a non-empty array");
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body: expected { events: [...] }" },
      { status: 400 },
    );
  }

  const rows = events.map((e) => ({
    event_name: e.event_name,
    session_id: e.session_id,
    metadata: e.metadata ?? null,
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
