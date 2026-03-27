import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { SKIN_TYPE_LABEL } from "@/lib/constants";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const avgScore = parseFloat(searchParams.get("avgScore") ?? "0");
  const streakDays = parseInt(searchParams.get("streakDays") ?? "0", 10);
  const nickname = searchParams.get("nickname") ?? "";
  const skinType = searchParams.get("skinType") ?? "";

  const skinLabel = SKIN_TYPE_LABEL[skinType] ?? skinType;
  const scoreColor =
    avgScore >= 4 ? "#22c55e" : avgScore >= 3 ? "#f59e0b" : avgScore >= 2 ? "#f97316" : "#ef4444";

  const trendText = avgScore >= 4 ? "좋은 상태!" : avgScore >= 3 ? "보통이에요" : "관리가 필요해요";

  return new ImageResponse(
    (
      <div
        style={{
          width: "600px",
          height: "400px",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #f5f3ff 0%, #eff6ff 100%)",
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
          <div style={{ fontSize: "14px", color: "#6b7280" }}>주간 피부 리포트</div>
        </div>

        {/* User info */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {nickname && (
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#1f2937" }}>{nickname}</div>
            )}
            {skinLabel && (
              <div style={{ fontSize: "14px", color: "#6b7280" }}>{skinLabel} 피부</div>
            )}
          </div>

          {/* Score circle */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              border: `4px solid ${scoreColor}`,
              background: "white",
            }}
          >
            <div style={{ fontSize: "28px", fontWeight: 700, color: scoreColor }}>
              {avgScore.toFixed(1)}
            </div>
            <div style={{ fontSize: "10px", color: "#9ca3af" }}>평균</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "12px", flex: 1 }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "white",
              borderRadius: "16px",
              padding: "16px",
            }}
          >
            <div style={{ fontSize: "32px", fontWeight: 700, color: "#7c3aed" }}>{streakDays}</div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>연속 기록일</div>
          </div>
          <div
            style={{
              flex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "white",
              borderRadius: "16px",
              padding: "16px",
            }}
          >
            <div style={{ fontSize: "20px", fontWeight: 700, color: scoreColor }}>{trendText}</div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
              이번 주 피부 상태
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
          <div style={{ fontSize: "11px", color: "#9ca3af" }}>barda.app</div>
          <div style={{ fontSize: "11px", color: "#9ca3af" }}>주간 피부 리포트</div>
        </div>
      </div>
    ),
    { width: 600, height: 400 },
  );
}
