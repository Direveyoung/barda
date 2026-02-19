import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ConfirmPaymentResponse, ApiError } from "@/lib/api-types";
import { isNonEmptyString, isPositiveNumber } from "@/lib/api-types";

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

  /* ---- Parse body ---- */
  let paymentKey: string;
  let orderId: string;
  let amount: number;

  try {
    const body = await request.json();
    paymentKey = body.paymentKey;
    orderId = body.orderId;
    amount = body.amount;

    if (!isNonEmptyString(paymentKey) || !isNonEmptyString(orderId) || !isPositiveNumber(amount)) {
      throw new Error("Missing required fields");
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body: paymentKey, orderId, and amount are required" },
      { status: 400 },
    );
  }

  /* ---- Confirm with Toss ---- */
  const basicAuth = Buffer.from(`${secretKey}:`).toString("base64");

  const tossRes = await fetch(
    "https://api.tosspayments.com/v1/payments/confirm",
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
    return NextResponse.json(
      { error: "결제 승인에 실패했습니다.", detail: tossData },
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
