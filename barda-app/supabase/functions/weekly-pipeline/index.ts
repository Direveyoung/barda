/**
 * Weekly Pipeline Edge Function
 *
 * Runs automated data maintenance tasks:
 * 1. Auto-promote product candidates (submit_count >= 3)
 * 2. Generate search miss report
 * 3. Store results in pipeline_runs table
 *
 * Schedule: Weekly (configured via Supabase Dashboard or pg_cron)
 * Invoke: supabase functions invoke weekly-pipeline
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ error: "Missing environment variables" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const results: Record<string, unknown> = {};

  // 1. Auto-promote product candidates with submit_count >= 3
  try {
    const { data: candidates } = await supabase
      .from("product_candidates")
      .select("id, brand, name, submit_count")
      .eq("status", "pending")
      .gte("submit_count", 3);

    if (candidates && candidates.length > 0) {
      const ids = candidates.map((c: { id: string }) => c.id);
      await supabase
        .from("product_candidates")
        .update({ status: "auto_promoted" })
        .in("id", ids);

      results.auto_promote = {
        promoted: candidates.length,
        candidates: candidates.map((c: { brand: string; name: string }) => `${c.brand} ${c.name}`),
      };
    } else {
      results.auto_promote = { promoted: 0 };
    }
  } catch (err) {
    results.auto_promote = { error: String(err) };
  }

  // 2. Search miss analysis (last 7 days)
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data: misses } = await supabase
      .from("search_logs")
      .select("query, results_count")
      .eq("results_count", 0)
      .gte("created_at", sevenDaysAgo);

    if (misses && misses.length > 0) {
      // Count frequency of missed queries
      const freq: Record<string, number> = {};
      for (const m of misses) {
        const q = (m as { query: string }).query.toLowerCase().trim();
        freq[q] = (freq[q] ?? 0) + 1;
      }

      const topMisses = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([query, count]) => ({ query, count }));

      results.search_miss = {
        totalMisses: misses.length,
        uniqueQueries: Object.keys(freq).length,
        topMisses,
      };
    } else {
      results.search_miss = { totalMisses: 0 };
    }
  } catch (err) {
    results.search_miss = { error: String(err) };
  }

  // 3. Basic stats
  try {
    const { count: totalUsers } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true });
    const { count: totalProducts } = await supabase
      .from("product_candidates")
      .select("*", { count: "exact", head: true });

    results.stats = {
      totalUsers: totalUsers ?? 0,
      totalCandidates: totalProducts ?? 0,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    results.stats = { error: String(err) };
  }

  // Store results
  try {
    await supabase.from("pipeline_runs").insert({
      run_type: "weekly_report",
      results,
    });
  } catch {
    // Best effort
  }

  return new Response(JSON.stringify({ success: true, results }), {
    headers: { "Content-Type": "application/json" },
  });
});
