"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import { SKIN_TYPE_LABEL, CONCERN_LABEL } from "@/lib/constants";
import { copyToClipboard, shareOrCopy } from "@/lib/date-utils";

interface SkinHelpTemplateProps {
  skinType?: string;
  concerns?: string[];
  recentProducts?: string[];
}

export default function SkinHelpTemplate({
  skinType,
  concerns,
  recentProducts,
}: SkinHelpTemplateProps) {
  const [problemDesc, setProblemDesc] = useState("");
  const [recentChanges, setRecentChanges] = useState("");
  const [hospitalVisit, setHospitalVisit] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const skinLabel = skinType ? SKIN_TYPE_LABEL[skinType] ?? "" : "";
  const concernLabels = (concerns ?? []).map((c) => CONCERN_LABEL[c] ?? c).join(", ");

  function generateTemplate(): string {
    const lines: string[] = [];
    lines.push("--- 피부 도움 요청 ---");
    lines.push("");
    if (skinLabel) lines.push(`피부타입: ${skinLabel}`);
    if (concernLabels) lines.push(`고민: ${concernLabels}`);
    lines.push("");

    if (recentProducts && recentProducts.length > 0) {
      lines.push("현재 루틴:");
      recentProducts.forEach((p, i) => lines.push(`  ${i + 1}. ${p}`));
      lines.push("");
    }

    if (problemDesc.trim()) {
      lines.push(`현재 상태: ${problemDesc.trim()}`);
      lines.push("");
    }

    if (recentChanges.trim()) {
      lines.push(`최근 변경: ${recentChanges.trim()}`);
      lines.push("");
    }

    lines.push(`병원 진료: ${hospitalVisit ? "진료 중/예정" : "아직 안 함"}`);
    lines.push("");
    lines.push("* BARDA 스킨케어 루틴 분석기에서 작성됨");

    return lines.join("\n");
  }

  async function handleCopy() {
    await copyToClipboard(generateTemplate());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    await shareOrCopy(generateTemplate());
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-sm hover:bg-blue-100 transition-colors"
      >
        <Icon name="help-circle" size={18} />
        <span className="font-medium">피부 도움 요청 템플릿 만들기</span>
        <Icon name="chevron-right" size={14} />
      </button>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="help-circle" size={18} />
          <h3 className="font-semibold text-sm text-gray-800">피부 도움 요청</h3>
        </div>
        <button
          onClick={() => setExpanded(false)}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <Icon name="x-circle" size={18} />
        </button>
      </div>

      {/* Auto-filled info */}
      <div className="space-y-1.5 text-xs text-gray-500">
        {skinLabel && (
          <div className="flex gap-2">
            <span className="text-gray-400 w-14">피부타입</span>
            <span className="text-gray-700 font-medium">{skinLabel}</span>
          </div>
        )}
        {concernLabels && (
          <div className="flex gap-2">
            <span className="text-gray-400 w-14">고민</span>
            <span className="text-gray-700">{concernLabels}</span>
          </div>
        )}
        {recentProducts && recentProducts.length > 0 && (
          <div className="flex gap-2">
            <span className="text-gray-400 w-14 shrink-0">루틴</span>
            <span className="text-gray-700">{recentProducts.join(" → ")}</span>
          </div>
        )}
      </div>

      {/* User inputs */}
      <textarea
        value={problemDesc}
        onChange={(e) => setProblemDesc(e.target.value)}
        placeholder="현재 피부 상태를 설명해 주세요 (붉음, 트러블, 건조 등)"
        className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-200"
        rows={2}
      />
      <textarea
        value={recentChanges}
        onChange={(e) => setRecentChanges(e.target.value)}
        placeholder="최근 바꾼 제품이나 습관이 있나요?"
        className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-200"
        rows={2}
      />

      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={hospitalVisit}
          onChange={(e) => setHospitalVisit(e.target.checked)}
          className="rounded"
        />
        병원 진료 중 또는 예정
      </label>

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
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors"
        >
          <Icon name="share" size={14} />
          공유하기
        </button>
      </div>
    </div>
  );
}
