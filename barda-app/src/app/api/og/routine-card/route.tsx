import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { SKIN_TYPE_LABEL } from "@/lib/constants";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const skinType = searchParams.get("skinType") ?? "";
  const score = parseInt(searchParams.get("score") ?? "0", 10);
  const productsRaw = searchParams.get("products") ?? "";
  const nickname = searchParams.get("nickname") ?? "";

  const products = productsRaw ? productsRaw.split("|").slice(0, 8) : [];
  const skinLabel = SKIN_TYPE_LABEL[skinType] ?? skinType;

  const scoreColor =
    score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444";

  return new ImageResponse(
    (
      <div
        style={{
          width: "600px",
          height: "400px",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #faf5ff 0%, #f0f9ff 100%)",
          padding: "32px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div
            style={{
              background: "#7c3aed",
              color: "white",
              borderRadius: "12px",
              padding: "6px 14px",
              fontSize: "16px",
              fontWeight: 700,
            }}
          >
            BARDA
          </div>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>스킨케어 루틴 분석</div>
        </div>

        {/* User info + Score */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {nickname && (
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#1f2937" }}>{nickname}</div>
            )}
            {skinLabel && (
              <div style={{ fontSize: "14px", color: "#6b7280" }}>{skinLabel} 피부</div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              border: `4px solid ${scoreColor}`,
              background: "white",
            }}
          >
            <div style={{ fontSize: "28px", fontWeight: 700, color: scoreColor }}>{score}</div>
            <div style={{ fontSize: "10px", color: "#9ca3af" }}>점</div>
          </div>
        </div>

        {/* Products */}
        {products.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              flex: 1,
              overflow: "hidden",
            }}
          >
            <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px" }}>루틴 구성</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {products.map((p, i) => (
                <div
                  key={i}
                  style={{
                    background: "white",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "12px",
                    color: "#374151",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  {p}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
          <div style={{ fontSize: "11px", color: "#9ca3af" }}>barda.app</div>
          <div style={{ fontSize: "11px", color: "#9ca3af" }}>K-Beauty 루틴 분석기</div>
        </div>
      </div>
    ),
    {
      width: 600,
      height: 400,
    },
  );
}
