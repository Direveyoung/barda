"use client";

import { useState } from "react";
import { CHALLENGE_PRESETS, getChallengeTips } from "@/data/challenges";
import Icon from "@/components/Icon";
import { PageHeader, InMemoryBanner, StatusBadge } from "@/components/admin/shared";

export default function AdminChallengesPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div>
      <PageHeader
        title="챌린지 프리셋"
        description={`총 ${CHALLENGE_PRESETS.length}개 프리셋`}
      />

      <InMemoryBanner label="챌린지 데이터는 소스코드(challenges.ts)에서 관리됩니다" />

      <div className="space-y-3">
        {CHALLENGE_PRESETS.map((preset) => {
          const isExpanded = expandedId === preset.id;
          const tips = getChallengeTips(preset.id);

          return (
            <div key={preset.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : preset.id)}
                className="w-full text-left p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Icon name={preset.icon} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">{preset.label}</span>
                    <span className="text-xs font-semibold text-primary bg-primary-bg px-2 py-0.5 rounded-lg">{preset.days}일</span>
                  </div>
                  <p className="text-xs text-gray-500">{preset.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status="low" label={preset.theme} />
                  <span className="text-xs text-gray-400 font-mono">{preset.id}</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mt-3 mb-2">일별 미션 ({tips.length}일)</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2 rounded-xl bg-gray-50">
                        <Icon name={tip.icon} size={14} />
                        <div>
                          <p className="text-xs font-semibold text-gray-700">Day {i + 1}: {tip.title}</p>
                          <p className="text-xs text-gray-500">{tip.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
