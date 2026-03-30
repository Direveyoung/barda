import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/products — 공개 제품 검색 API (Supabase → local fallback)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200);

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ products: [], source: "unavailable" }, { status: 503 });
  }

  let query = supabase
    .from("products")
    .select(
      "id,legacy_id,name,brand_name,category_id,active_flags,concentration_level,key_ingredients,tags,source,verified"
    )
    .eq("is_active", true)
    .limit(limit);

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,brand_name.ilike.%${search}%,legacy_id.ilike.%${search}%`
    );
  }
  if (category) {
    query = query.eq("category_id", category);
  }
  if (!search) {
    query = query.order("brand_name").order("name");
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ products: [], source: "error", error: error.message }, { status: 500 });
  }

  // Map DB fields to frontend Product shape
  const products = (data ?? []).map((p) => ({
    id: p.legacy_id,
    brand: p.brand_name,
    name: p.name,
    categoryId: p.category_id,
    active_flags: p.active_flags ?? [],
    concentration_level: p.concentration_level,
    key_ingredients: p.key_ingredients ?? [],
    tags: p.tags ?? [],
    source: p.source,
    verified: p.verified,
  }));

  return NextResponse.json(
    { products, source: "supabase" },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
