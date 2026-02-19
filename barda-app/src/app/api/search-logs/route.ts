import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
  SearchStatsResponse,
  MissedSearchesResponse,
  ApiOk,
  ApiError,
} from "@/lib/api-types";
import { isNonEmptyString } from "@/lib/api-types";

// POST: Log a search query (tracks hits and misses)
export async function POST(request: NextRequest): Promise<NextResponse<ApiOk | ApiError>> {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ ok: true }); // graceful degradation
  }

  let query: string;
  let results_count: number;
  let selected_product_id: string | null;
  let fell_through: boolean;

  try {
    const body = await request.json();
    query = body.query;
    results_count = body.results_count ?? 0;
    selected_product_id = body.selected_product_id ?? null;
    fell_through = body.fell_through ?? false;

    if (!isNonEmptyString(query)) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Get user if logged in (optional)
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from("search_logs").insert({
    user_id: user?.id ?? null,
    query: query.trim().toLowerCase(),
    results_count,
    selected_product_id,
  });

  return NextResponse.json({ ok: true });
}

// GET: Search stats for admin (top missed queries, hit rate)
export async function GET(request: NextRequest): Promise<NextResponse<SearchStatsResponse | MissedSearchesResponse | ApiError>> {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }

  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") ?? "stats";

  if (type === "missed") {
    // Top 20 queries with 0 results
    const { data } = await supabase
      .from("search_logs")
      .select("query")
      .eq("results_count", 0)
      .order("created_at", { ascending: false })
      .limit(200);

    // Aggregate by query
    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      const q = (row as { query: string }).query;
      counts[q] = (counts[q] ?? 0) + 1;
    }

    const missed = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([query, count]) => ({ query, count }));

    return NextResponse.json({ missed });
  }

  // Overall stats
  const { count: totalSearches } = await supabase
    .from("search_logs")
    .select("*", { count: "exact", head: true });

  const { count: missedSearches } = await supabase
    .from("search_logs")
    .select("*", { count: "exact", head: true })
    .eq("results_count", 0);

  const total = totalSearches ?? 0;
  const missed = missedSearches ?? 0;
  const hitRate = total > 0 ? Math.round(((total - missed) / total) * 100) : 0;

  return NextResponse.json({
    totalSearches: total,
    missedSearches: missed,
    hitRate,
  });
}
