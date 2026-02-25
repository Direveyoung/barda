import { NextRequest, NextResponse } from "next/server";
import { lookupIngredientEnriched, type EnrichedIngredient, type APIResult } from "@/lib/external-apis";

interface LookupResponse {
  ingredient: EnrichedIngredient;
  timestamp: string;
}

interface LookupError {
  error: string;
}

/**
 * GET /api/ingredients/lookup?name=나이아신아마이드
 * 외부 API(식약처 + 공공데이터포털)에서 성분 정보 조회
 * 결과는 서버 메모리에 5분 캐싱
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<LookupResponse | LookupError>> {
  const name = request.nextUrl.searchParams.get("name")?.trim();

  if (!name || name.length < 1 || name.length > 100) {
    return NextResponse.json(
      { error: "name 파라미터가 필요합니다 (1~100자)" },
      { status: 400 },
    );
  }

  try {
    const result: APIResult<EnrichedIngredient> = await lookupIngredientEnriched(name);

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error ?? "성분 정보를 찾지 못했습니다" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ingredient: result.data,
      timestamp: result.timestamp,
    });
  } catch {
    return NextResponse.json(
      { error: "성분 조회 중 오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
