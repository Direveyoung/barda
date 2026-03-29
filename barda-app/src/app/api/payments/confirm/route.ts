import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ConfirmPaymentResponse, ApiError } from "@/lib/api-types";
import { confirmPaymentSchema, parseWithZod } from "@/lib/api-types";
import { API_URLS, PAYMENT } from "@/lib/constants";

export async function POST(request: Request): Promise<NextResponse<ConfirmPaymentResponse | ApiError>> {
  const secretKey = process.env.TOSS_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      { error: "결제 서비스가 아직 설정되지 않았습니다. (TOSS_SECRET_KEY not configured)" },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Database connection unavailable" },
      { status: 503 },
    );
  }

  /* ---- Authenticate user ---- */
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "인증이 필요합니다." },
      { status: 401 },
    );
  }

  /* ---- Parse & validate body ---- */
  const result = parseWithZod(confirmPaymentSchema, await request.json().catch(() => null));

  if ("error" in result) {
    return NextResponse.json(
      { error: `Invalid request body: ${result.error}` },
      { status: 400 },
    );
  }

  const { paymentKey, orderId, amount } = result.data;

  /* ---- Server-side amount validation ---- */
  if (amount !== PAYMENT.PREMIUM_PRICE) {
    return NextResponse.json(
      { error: "결제 금액이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  /* ---- Idempotency check: prevent duplicate payments ---- */
  const { data: existingPayment } = await supabase
    .from("payments")
    .select("id")
    .eq("order_id", orderId)
    .eq("status", "success")
    .limit(1);

  if (existingPayment && existingPayment.length > 0) {
    return NextResponse.json(
      { error: "이미 처리된 결제입니다." },
      { status: 409 },
    );
  }

  /* ---- Confirm with Toss ---- */
  const basicAuth = Buffer.from(`${secretKey}:`).toString("base64");

  const tossRes = await fetch(
    API_URLS.TOSS_CONFIRM,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    },
  );

  const tossData = await tossRes.json();

  if (!tossRes.ok) {
    // Mask sensitive Toss error details — only return error code and message
    const maskedDetail = {
      code: tossData?.code ?? "UNKNOWN",
      message: tossData?.message ?? "결제 승인 실패",
    };
    return NextResponse.json(
      { error: "결제 승인에 실패했습니다.", detail: maskedDetail },
      { status: tossRes.status },
    );
  }

  /* ---- Save payment record ---- */
  const { error: insertError } = await supabase.from("payments").insert({
    user_id: user.id,
    order_id: orderId,
    payment_key: paymentKey,
    amount,
    status: "success",
    provider: "toss",
    raw_response: tossData,
  });

  if (insertError) {
    console.error("Failed to save payment record:", insertError);
    // Payment was confirmed by Toss but DB insert failed — log and continue
  }

  /* ---- Mark user routines as paid ---- */
  const { error: updateError } = await supabase
    .from("user_routines")
    .update({ is_paid: true })
    .eq("user_id", user.id);

  if (updateError) {
    console.error("Failed to update user_routines:", updateError);
  }

  return NextResponse.json({ success: true, payment: tossData });
}
