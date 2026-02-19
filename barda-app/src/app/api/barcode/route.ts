import { NextRequest, NextResponse } from "next/server";
import { fetchOBFByBarcode } from "@/lib/external-apis";

/**
 * GET /api/barcode?code=8809721512345
 * Open Beauty Facts 바코드 조회 (공개 API)
 * 스캐너 페이지에서 사용
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code || !/^\d{8,14}$/.test(code)) {
    return NextResponse.json(
      { error: "유효한 바코드를 입력해주세요 (8~14자리 숫자)" },
      { status: 400 },
    );
  }

  try {
    const result = await fetchOBFByBarcode(code);

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error ?? "제품을 찾을 수 없습니다", source: "obf" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      product: result.data,
      source: "obf",
      timestamp: result.timestamp,
    });
  } catch {
    return NextResponse.json(
      { error: "바코드 조회 중 오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
