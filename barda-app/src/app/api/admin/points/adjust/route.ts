import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { z } from "zod";

const adjustSchema = z.object({
  userId: z.string().min(1).max(200),
  points: z.number().int().min(-100000).max(100000),
  reason: z.string().min(1).max(500),
});

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const { supabase } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = adjustSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
  }

  const { userId, points, reason } = parsed.data;

  try {
    // Insert transaction
    const { error: txError } = await supabase.from("point_transactions").insert({
      user_id: userId,
      action: "admin_adjustment",
      points,
      reference_id: `admin_${Date.now()}`,
      reference_date: new Date().toISOString().slice(0, 10),
      metadata: { reason },
    });

    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 500 });
    }

    // Update balance
    if (points > 0) {
      await supabase.rpc("earn_points", {
        p_user_id: userId,
        p_action: "admin_adjustment",
        p_points: points,
        p_reference_id: `admin_${Date.now()}_earn`,
        p_reference_date: new Date().toISOString().slice(0, 10),
      });
    } else if (points < 0) {
      await supabase.rpc("redeem_points", {
        p_user_id: userId,
        p_amount: Math.abs(points),
        p_description: reason,
      });
    }

    return NextResponse.json({ ok: true, adjusted: points });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
