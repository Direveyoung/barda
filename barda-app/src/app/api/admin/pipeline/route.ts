import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  runAutoPromotePipeline,
  generateSearchMissReport,
  analyzeCommunityProducts,
  generateWeeklyReport,
} from "@/lib/pipeline";

/**
 * POST /api/admin/pipeline
 * 관리자 전용: 파이프라인 작업 실행
 *
 * body: { action: "auto_promote" | "search_miss" | "community" | "weekly_report", days?: number }
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const { supabase } = auth;

  try {
    const body = await request.json();
    const { action, days } = body as { action: string; days?: number };

    switch (action) {
      case "auto_promote": {
        const result = await runAutoPromotePipeline(supabase);
        return NextResponse.json(result);
      }

      case "search_miss": {
        const result = await generateSearchMissReport(supabase, days ?? 7);
        return NextResponse.json(result);
      }

      case "community": {
        const result = await analyzeCommunityProducts(supabase);
        return NextResponse.json(result);
      }

      case "weekly_report": {
        const report = await generateWeeklyReport(supabase);
        return NextResponse.json(report);
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }
  } catch (err) {
    console.error("Pipeline error:", err);
    return NextResponse.json(
      { error: "Pipeline execution failed" },
      { status: 500 },
    );
  }
}
