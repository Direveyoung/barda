import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const { supabase } = auth;

  try {
    // --- Total Users ---
    // Try auth.admin first; fall back to distinct user_id from routine_posts
    let totalUsers = 0;
    try {
      const { data: adminList } =
        await supabase.auth.admin.listUsers({ perPage: 1 });
      totalUsers = (adminList as { total?: number })?.total ?? 0;
    } catch {
      const { count } = await supabase
        .from("routine_posts")
        .select("user_id", { count: "exact", head: true });
      totalUsers = count ?? 0;
    }

    // --- Total Analyses ---
    const { count: totalAnalyses } = await supabase
      .from("user_routines")
      .select("*", { count: "exact", head: true });

    // --- Payments (success only) ---
    const { count: totalPayments } = await supabase
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("status", "success");

    const { data: revenueRow } = await supabase
      .from("payments")
      .select("amount")
      .eq("status", "success");

    const totalRevenue = (revenueRow ?? []).reduce(
      (sum: number, r: { amount: number }) => sum + (r.amount ?? 0),
      0,
    );

    // --- Total Posts ---
    const { count: totalPosts } = await supabase
      .from("routine_posts")
      .select("*", { count: "exact", head: true });

    // --- Total Feedback ---
    const { count: totalFeedback } = await supabase
      .from("report_feedback")
      .select("*", { count: "exact", head: true });

    // --- Search Stats ---
    const { count: totalSearches } = await supabase
      .from("search_logs")
      .select("*", { count: "exact", head: true });

    const { count: missedSearches } = await supabase
      .from("search_logs")
      .select("*", { count: "exact", head: true })
      .eq("results_count", 0);

    const searchHitRate =
      (totalSearches ?? 0) > 0
        ? Math.round(
            ((1 - (missedSearches ?? 0) / (totalSearches ?? 1)) * 100) * 10
          ) / 10
        : 0;

    // --- Recent Search Misses (top 10 queries with 0 results) ---
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

    // --- Funnel Data (event_name → count) ---
    const { data: funnelRaw } = await supabase
      .from("funnel_events")
      .select("event_name");

    const funnelMap = new Map<string, number>();
    for (const row of funnelRaw ?? []) {
      const name = row.event_name as string;
      if (name) funnelMap.set(name, (funnelMap.get(name) ?? 0) + 1);
    }
    const funnelData = Array.from(funnelMap.entries()).map(
      ([event_name, count]) => ({ event_name, count }),
    );

    // --- Product Candidates (latest 30, sorted by submit_count) ---
    const { data: productCandidates } = await supabase
      .from("product_candidates")
      .select("*")
      .order("submit_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(30);

    return NextResponse.json({
      totalUsers,
      totalAnalyses: totalAnalyses ?? 0,
      totalPayments: totalPayments ?? 0,
      totalRevenue,
      totalPosts: totalPosts ?? 0,
      totalFeedback: totalFeedback ?? 0,
      totalSearches: totalSearches ?? 0,
      missedSearches: missedSearches ?? 0,
      searchHitRate,
      recentSearchMisses,
      funnelData,
      productCandidates: productCandidates ?? [],
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json(
      { error: "Failed to aggregate admin stats" },
      { status: 500 },
    );
  }
}
