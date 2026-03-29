import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  checkAPIHealth,
  fetchMFDSIngredients,
  searchOBFProducts,
  fetchIngredientMapping,
} from "@/lib/external-apis";

/**
 * GET /api/admin/external-apis
 * 외부 API 상태 체크 (헬스 체크) — 관리자 전용
 */
export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const health = await checkAPIHealth();
    return NextResponse.json({ health, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("API health check error:", err);
    return NextResponse.json(
      { error: "Health check failed" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/external-apis
 * 외부 API 테스트 쿼리 실행 — 관리자 전용
 *
 * body: { api: "mfds" | "obf" | "ingredient", query: string }
 */
export async function POST(request: NextRequest) {
  const postAuth = await requireAdmin();
  if (postAuth instanceof NextResponse) return postAuth;

  try {
    const body = await request.json();
    const { api, query } = body as { api: string; query: string };

    if (!query || !api) {
      return NextResponse.json(
        { error: "api and query are required" },
        { status: 400 },
      );
    }

    switch (api) {
      case "mfds": {
        const result = await fetchMFDSIngredients(query);
        return NextResponse.json(result);
      }

      case "obf": {
        const result = await searchOBFProducts(query);
        return NextResponse.json(result);
      }

      case "ingredient": {
        const result = await fetchIngredientMapping(query);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          { error: "지원하지 않는 API입니다." },
          { status: 400 },
        );
    }
  } catch (err) {
    console.error("External API test error:", err);
    return NextResponse.json(
      { error: "API test failed" },
      { status: 500 },
    );
  }
}
