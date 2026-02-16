/* ─── Auto-Learning Pipeline ─── */
/* product_candidates 자동 승격 + search_logs 분석 + 커뮤니티 연동 */

import type { SupabaseClient } from "@supabase/supabase-js";

/* ─── Types ─── */

export interface PipelineResult {
  action: string;
  count: number;
  details: string[];
  timestamp: string;
}

export interface WeeklyReport {
  period: { start: string; end: string };
  searchStats: {
    totalSearches: number;
    hitRate: number;
    missedSearches: number;
    topMissedQueries: { query: string; count: number }[];
  };
  candidateStats: {
    newCandidates: number;
    autoPromoted: number;
    manualApproved: number;
    pendingHighDemand: { brand: string; name: string; count: number }[];
  };
  communityStats: {
    newPosts: number;
    uniqueProducts: string[];
    popularProducts: { name: string; count: number }[];
  };
  generatedAt: string;
}

/* ─── 1. 자동 승격 파이프라인 ─── */
/* product_candidates에서 submit_count >= threshold인 항목을 자동 승격 후보로 마킹 */

const AUTO_PROMOTE_THRESHOLD = 3;

/**
 * submit_count >= 3인 pending 후보를 'auto_promoted' 상태로 변경
 * 관리자가 최종 승인할 수 있도록 중간 상태 부여
 */
export async function runAutoPromotePipeline(
  supabase: SupabaseClient
): Promise<PipelineResult> {
  const details: string[] = [];

  // Find candidates with submit_count >= threshold and still pending
  const { data: candidates, error } = await supabase
    .from("product_candidates")
    .select("id, brand, name, submit_count")
    .eq("status", "pending")
    .gte("submit_count", AUTO_PROMOTE_THRESHOLD)
    .order("submit_count", { ascending: false });

  if (error || !candidates) {
    return {
      action: "auto_promote",
      count: 0,
      details: [`Error: ${error?.message ?? "No data"}`],
      timestamp: new Date().toISOString(),
    };
  }

  if (candidates.length === 0) {
    return {
      action: "auto_promote",
      count: 0,
      details: ["No candidates met the auto-promote threshold"],
      timestamp: new Date().toISOString(),
    };
  }

  // Update status to auto_promoted
  const ids = candidates.map((c: { id: string }) => c.id);
  const { error: updateError } = await supabase
    .from("product_candidates")
    .update({ status: "auto_promoted" })
    .in("id", ids);

  if (updateError) {
    details.push(`Update error: ${updateError.message}`);
  } else {
    for (const c of candidates) {
      const candidate = c as { brand: string; name: string; submit_count: number };
      details.push(
        `${candidate.brand} ${candidate.name} (${candidate.submit_count}회 요청) → 자동 승격`
      );
    }
  }

  return {
    action: "auto_promote",
    count: candidates.length,
    details,
    timestamp: new Date().toISOString(),
  };
}

/* ─── 2. 검색 미스 분석 ─── */
/* 주간 미스 Top 20 + 히트율 트렌드 */

/**
 * 주간 검색 미스 리포트 생성
 * @param supabase - Supabase client
 * @param days - 분석 기간 (기본 7일)
 */
export async function generateSearchMissReport(
  supabase: SupabaseClient,
  days: number = 7
): Promise<PipelineResult> {
  const details: string[] = [];
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString();

  // Fetch all search logs in the period
  const { data: logs, error } = await supabase
    .from("search_logs")
    .select("query, results_count")
    .gte("created_at", sinceStr);

  if (error || !logs) {
    return {
      action: "search_miss_report",
      count: 0,
      details: [`Error: ${error?.message ?? "No data"}`],
      timestamp: new Date().toISOString(),
    };
  }

  const total = logs.length;
  const misses = logs.filter((l: { results_count: number }) => l.results_count === 0);
  const hitRate = total > 0 ? Math.round(((total - misses.length) / total) * 100 * 10) / 10 : 0;

  // Aggregate miss queries
  const missMap = new Map<string, number>();
  for (const log of misses) {
    const q = ((log as { query: string }).query ?? "").toLowerCase().trim();
    if (q) missMap.set(q, (missMap.get(q) ?? 0) + 1);
  }

  const topMisses = Array.from(missMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  details.push(`기간: 최근 ${days}일`);
  details.push(`총 검색: ${total}건, 미스: ${misses.length}건, 히트율: ${hitRate}%`);
  details.push(`--- Top 20 미스 쿼리 ---`);
  for (const [query, count] of topMisses) {
    details.push(`  "${query}" — ${count}회`);
  }

  return {
    action: "search_miss_report",
    count: topMisses.length,
    details,
    timestamp: new Date().toISOString(),
  };
}

/* ─── 3. 커뮤니티 데이터 → DB 확장 분석 ─── */
/* 피드에서 언급된 제품 중 DB에 없는 것 감지 */

/**
 * 커뮤니티 피드에서 자주 언급되는 제품 분석
 */
export async function analyzeCommunityProducts(
  supabase: SupabaseClient
): Promise<PipelineResult> {
  const details: string[] = [];

  // Fetch recent routine posts with product data
  const { data: posts, error } = await supabase
    .from("routine_posts")
    .select("products, skin_type")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !posts) {
    return {
      action: "community_analysis",
      count: 0,
      details: [`Error: ${error?.message ?? "No data"}`],
      timestamp: new Date().toISOString(),
    };
  }

  // Count product frequency
  const productCounts = new Map<string, number>();
  const skinTypeProducts = new Map<string, Set<string>>();

  for (const post of posts) {
    const products = (post as { products: Array<{ name: string; brand: string }> }).products ?? [];
    const skinType = (post as { skin_type: string }).skin_type ?? "unknown";

    for (const product of products) {
      const key = `${product.brand} ${product.name}`;
      productCounts.set(key, (productCounts.get(key) ?? 0) + 1);

      if (!skinTypeProducts.has(skinType)) {
        skinTypeProducts.set(skinType, new Set());
      }
      skinTypeProducts.get(skinType)?.add(key);
    }
  }

  const topProducts = Array.from(productCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  details.push(`분석된 포스트: ${posts.length}개`);
  details.push(`고유 제품: ${productCounts.size}종`);
  details.push(`--- 인기 제품 Top 20 ---`);
  for (const [product, count] of topProducts) {
    details.push(`  ${product} — ${count}회 언급`);
  }

  details.push(`--- 피부타입별 제품 다양성 ---`);
  for (const [skinType, products] of skinTypeProducts.entries()) {
    details.push(`  ${skinType}: ${products.size}종`);
  }

  return {
    action: "community_analysis",
    count: topProducts.length,
    details,
    timestamp: new Date().toISOString(),
  };
}

/* ─── 4. 종합 주간 리포트 ─── */

export async function generateWeeklyReport(
  supabase: SupabaseClient
): Promise<WeeklyReport> {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const sinceStr = weekAgo.toISOString();

  // --- Search Stats ---
  const { data: searchLogs } = await supabase
    .from("search_logs")
    .select("query, results_count")
    .gte("created_at", sinceStr);

  const allSearches = searchLogs ?? [];
  const missedSearches = allSearches.filter(
    (l: { results_count: number }) => l.results_count === 0
  );
  const hitRate = allSearches.length > 0
    ? Math.round(((allSearches.length - missedSearches.length) / allSearches.length) * 100 * 10) / 10
    : 0;

  const missMap = new Map<string, number>();
  for (const log of missedSearches) {
    const q = ((log as { query: string }).query ?? "").toLowerCase().trim();
    if (q) missMap.set(q, (missMap.get(q) ?? 0) + 1);
  }
  const topMissedQueries = Array.from(missMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([query, count]) => ({ query, count }));

  // --- Candidate Stats ---
  const { data: newCandidatesData } = await supabase
    .from("product_candidates")
    .select("id")
    .gte("created_at", sinceStr);

  const { data: autoPromotedData } = await supabase
    .from("product_candidates")
    .select("id")
    .eq("status", "auto_promoted");

  const { data: approvedData } = await supabase
    .from("product_candidates")
    .select("id")
    .eq("status", "approved")
    .gte("created_at", sinceStr);

  const { data: highDemandData } = await supabase
    .from("product_candidates")
    .select("brand, name, submit_count")
    .eq("status", "pending")
    .gte("submit_count", 2)
    .order("submit_count", { ascending: false })
    .limit(10);

  // --- Community Stats ---
  const { data: newPostsData } = await supabase
    .from("routine_posts")
    .select("products")
    .gte("created_at", sinceStr);

  const communityProducts = new Map<string, number>();
  for (const post of newPostsData ?? []) {
    const products = (post as { products: Array<{ name: string }> }).products ?? [];
    for (const p of products) {
      communityProducts.set(p.name, (communityProducts.get(p.name) ?? 0) + 1);
    }
  }

  const popularProducts = Array.from(communityProducts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  return {
    period: {
      start: weekAgo.toISOString().slice(0, 10),
      end: now.toISOString().slice(0, 10),
    },
    searchStats: {
      totalSearches: allSearches.length,
      hitRate,
      missedSearches: missedSearches.length,
      topMissedQueries,
    },
    candidateStats: {
      newCandidates: newCandidatesData?.length ?? 0,
      autoPromoted: autoPromotedData?.length ?? 0,
      manualApproved: approvedData?.length ?? 0,
      pendingHighDemand: (highDemandData ?? []).map(
        (c: { brand: string; name: string; submit_count: number }) => ({
          brand: c.brand,
          name: c.name,
          count: c.submit_count,
        })
      ),
    },
    communityStats: {
      newPosts: newPostsData?.length ?? 0,
      uniqueProducts: Array.from(communityProducts.keys()),
      popularProducts,
    },
    generatedAt: now.toISOString(),
  };
}

/* ─── SQL 참고: 주간 미스 Top 20 자동 리포트 ─── */
/*
-- Supabase SQL Editor에서 실행 가능한 주간 미스 리포트 쿼리
-- cron으로 매주 월요일 실행 권장

SELECT
  query,
  COUNT(*) as miss_count,
  MIN(created_at) as first_seen,
  MAX(created_at) as last_seen
FROM search_logs
WHERE results_count = 0
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY query
ORDER BY miss_count DESC
LIMIT 20;

-- 후보 자동 승격 쿼리 (submit_count >= 3)
UPDATE product_candidates
SET status = 'auto_promoted'
WHERE status = 'pending'
  AND submit_count >= 3;

-- 히트율 트렌드 (일별)
SELECT
  DATE(created_at) as day,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE results_count > 0) as hits,
  ROUND(COUNT(*) FILTER (WHERE results_count > 0)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as hit_rate
FROM search_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY day DESC;
*/
