import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const { supabase } = auth;

  try {
    // Use SECURITY DEFINER function — bypasses RLS, works with anon key
    const { data: stats, error: rpcError } = await supabase.rpc("get_admin_stats");

    if (rpcError) {
      console.error("get_admin_stats RPC error:", rpcError);
      return NextResponse.json(
        { error: "Failed to aggregate admin stats", detail: rpcError.message },
        { status: 500 },
      );
    }

    const s = stats as Record<string, unknown>;

    // --- Search miss details (still needs direct query, public read OK) ---
    const { data: searchMissesRaw } = await supabase
      .from("search_logs")
      .select("query")
      .eq("results_count", 0);

    const missMap = new Map<string, number>();
    for (const row of searchMissesRaw ?? []) {
      const q = (row.query as string)?.toLowerCase().trim();
      if (q) missMap.set(q, (missMap.get(q) ?? 0) + 1);
    }
    const recentSearchMisses = Array.from(missMap.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // --- Product Candidates ---
    const { data: productCandidates } = await supabase
      .from("product_candidates")
      .select("*")
      .order("submit_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(30);

    const totalSearches = Number(s.total_search_logs ?? 0);
    const missedSearches = recentSearchMisses.reduce((sum, r) => sum + r.count, 0);
    const searchHitRate =
      totalSearches > 0
        ? Math.round(((1 - missedSearches / totalSearches) * 100) * 10) / 10
        : 0;

    return NextResponse.json({
      totalUsers: Number(s.total_users ?? 0),
      totalAnalyses: Number(s.total_analyses ?? 0),
      totalPayments: Number(s.total_payments ?? 0),
      totalRevenue: Number(s.total_revenue ?? 0),
      totalPosts: Number(s.total_posts ?? 0),
      totalFeedback: 0,
      totalSearches,
      missedSearches,
      searchHitRate,
      recentSearchMisses,
      funnelData: (s.top_searches as unknown[]) ?? [],
      productCandidates: productCandidates ?? [],
      // Extra DB stats
      totalProducts: Number(s.total_products ?? 0),
      totalBrands: Number(s.total_brands ?? 0),
      totalIngredients: Number(s.total_ingredients ?? 0),
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json(
      { error: "Failed to aggregate admin stats" },
      { status: 500 },
    );
  }
}
