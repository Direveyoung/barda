import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";
import type {
  ProductCandidateResponse,
  ProductCandidateListResponse,
  ApiOk,
  ApiError,
} from "@/lib/api-types";
import { productCandidateSchema, updateCandidateSchema, parseWithZod, sanitizeString } from "@/lib/api-types";

// POST: Submit a new product candidate (user direct input)
export async function POST(request: NextRequest): Promise<NextResponse<ProductCandidateResponse | ApiError>> {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }

  const result = parseWithZod(productCandidateSchema, await request.json().catch(() => null));

  if ("error" in result) {
    return NextResponse.json(
      { error: `Invalid request body: ${result.error}` },
      { status: 400 },
    );
  }

  const brand = sanitizeString(result.data.brand.trim());
  const name = sanitizeString(result.data.name.trim());
  const category_guess = result.data.category_guess ?? null;

  const { data: { user } } = await supabase.auth.getUser();

  // Check if same product already submitted → increment submit_count
  const { data: existing } = await supabase
    .from("product_candidates")
    .select("id, submit_count")
    .ilike("brand", brand)
    .ilike("name", name)
    .limit(1);

  if (existing && existing.length > 0) {
    const row = existing[0] as { id: string; submit_count: number };
    await supabase
      .from("product_candidates")
      .update({ submit_count: row.submit_count + 1 })
      .eq("id", row.id);

    return NextResponse.json({ ok: true, action: "incremented", id: row.id });
  }

  // New candidate
  const { data: inserted, error } = await supabase
    .from("product_candidates")
    .insert({
      user_id: user?.id ?? null,
      brand,
      name,
      category_guess,
      submit_count: 1,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to insert product candidate:", error);
    return NextResponse.json(
      { error: "Failed to submit product" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, action: "created", id: inserted?.id });
}

// GET: List product candidates (admin)
export async function GET(request: NextRequest): Promise<NextResponse<ProductCandidateListResponse | ApiError>> {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth as NextResponse<ApiError>;
  const { supabase } = auth;

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status") ?? "pending";
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") ?? "30", 10) || 30));

  let query = supabase
    .from("product_candidates")
    .select("*")
    .order("submit_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch candidates" },
      { status: 500 }
    );
  }

  return NextResponse.json({ candidates: data ?? [] });
}

// PATCH: Update candidate status (admin: promote or reject)
export async function PATCH(request: NextRequest): Promise<NextResponse<ApiOk | ApiError>> {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth as NextResponse<ApiError>;
  const { supabase } = auth;

  const result = parseWithZod(updateCandidateSchema, await request.json().catch(() => null));

  if ("error" in result) {
    return NextResponse.json(
      { error: `Invalid request body: ${result.error}` },
      { status: 400 },
    );
  }

  const { id, status } = result.data;

  const { error } = await supabase
    .from("product_candidates")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Failed to update candidate:", error);
    return NextResponse.json(
      { error: "Failed to update candidate" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
