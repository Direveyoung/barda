"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import { SKIN_TYPE_LABEL, CONCERN_LABEL } from "@/lib/constants";
import { copyToClipboard, shareOrCopy } from "@/lib/date-utils";

interface ClinicChecklistProps {
  skinType?: string;
  concerns?: string[];
  recentProducts?: string[];
  avgScore?: number;
  trendDirection?: "up" | "down" | "stable";
}

export default function ClinicChecklist({
  skinType,
  concerns,
  recentProducts,
  avgScore,
  trendDirection,
}: ClinicChecklistProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const skinLabel = skinType ? SKIN_TYPE_LABEL[skinType] ?? "" : "";
  const concernLabels = (concerns ?? []).map((c) => CONCERN_LABEL[c] ?? c);

  function generateChecklist(): string {
    const lines: string[] = [];
    lines.push("=== 피부과 방문 체크리스트 ===");
    lines.push("");

    if (skinLabel) lines.push(`▸ 피부타입: ${skinLabel}`);
    if (concernLabels.length > 0) lines.push(`▸ 주요 고민: ${concernLabels.join(", ")}`);
    lines.push("");

    if (recentProducts && recentProducts.length > 0) {
      lines.push("▸ 현재 사용 중인 제품:");
      recentProducts.forEach((p, i) => lines.push(`  ${i + 1}. ${p}`));
      lines.push("");
    }

    if (avgScore !== undefined) {
      const scoreText = avgScore >= 4 ? "양호" : avgScore >= 3 ? "보통" : "좋지 않음";
      lines.push(`▸ 최근 피부 상태: ${scoreText} (${avgScore.toFixed(1)}/5)`);
    }

    if (trendDirection) {
      const trendText = trendDirection === "up" ? "개선 중" : trendDirection === "down" ? "악화 추세" : "유지 중";
      lines.push(`▸ 트렌드: ${trendText}`);
    }

    lines.push("");
    lines.push("▸ 증상 시작 시점: _______________");
    lines.push("▸ 악화/호전 요인: _______________");
    lines.push("▸ 알레르기 이력: _______________");
    lines.push("▸ 복용 중인 약: _______________");
    lines.push("");
    lines.push("* BARDA 스킨케어 루틴 분석기에서 작성됨");

    return lines.join("\n");
  }

  async function handleCopy() {
    await copyToClipboard(generateChecklist());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    await shareOrCopy(generateChecklist());
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm hover:bg-green-100 transition-colors"
      >
        <Icon name="hospital" size={18} />
        <span className="font-medium">피부과 방문 체크리스트</span>
        <Icon name="chevron-right" size={14} />
      </button>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="hospital" size={18} />
          <h3 className="font-semibold text-sm text-gray-800">피부과 방문 체크리스트</h3>
        </div>
        <button
          onClick={() => setExpanded(false)}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <Icon name="x-circle" size={18} />
        </button>
      </div>

      <p className="text-xs text-gray-500">
        피부과 방문 시 가져가면 유용한 정보를 자동으로 정리했어요.
      </p>

      {/* Auto-filled summary */}
      <div className="space-y-1.5 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
        {skinLabel && (
          <div className="flex gap-2">
            <span className="text-gray-400 w-16 shrink-0">피부타입</span>
            <span className="text-gray-700 font-medium">{skinLabel}</span>
          </div>
        )}
        {concernLabels.length > 0 && (
          <div className="flex gap-2">
            <span className="text-gray-400 w-16 shrink-0">고민</span>
            <span className="text-gray-700">{concernLabels.join(", ")}</span>
          </div>
        )}
        {avgScore !== undefined && (
          <div className="flex gap-2">
            <span className="text-gray-400 w-16 shrink-0">피부 상태</span>
            <span className="text-gray-700">{avgScore.toFixed(1)}/5점</span>
          </div>
        )}
        {trendDirection && (
          <div className="flex gap-2">
            <span className="text-gray-400 w-16 shrink-0">트렌드</span>
            <span className={`font-medium ${
              trendDirection === "up" ? "text-green-600" : trendDirection === "down" ? "text-red-500" : "text-gray-600"
            }`}>
              {trendDirection === "up" ? "↑ 개선 중" : trendDirection === "down" ? "↓ 악화 추세" : "→ 유지 중"}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-colors"
        >
          <Icon name="copy" size={14} />
          {copied ? "복사됨!" : "텍스트 복사"}
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium text-sm transition-colors"
        >
          <Icon name="share" size={14} />
          공유하기
        </button>
      </div>
    </div>
  );
}
