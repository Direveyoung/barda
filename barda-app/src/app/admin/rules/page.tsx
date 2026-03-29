"use client";

import { useState } from "react";
import { CONFLICT_RULES, MISSING_STEP_RULES } from "@/data/rules";
import Icon from "@/components/Icon";
import { PageHeader, InMemoryBanner, StatusBadge } from "@/components/admin/shared";

const SEVERITY_STYLE: Record<string, { bg: string; text: string }> = {
  critical: { bg: "bg-red-50", text: "border-red-200" },
  high: { bg: "bg-orange-50", text: "border-orange-200" },
  medium: { bg: "bg-yellow-50", text: "border-yellow-200" },
  low: { bg: "bg-gray-50", text: "border-gray-200" },
};

export default function AdminRulesPage() {
  const [activeTab, setActiveTab] = useState<"conflict" | "missing">("conflict");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div>
      <PageHeader
        title="충돌 규칙"
        description={`충돌 ${CONFLICT_RULES.length}개 + 누락 ${MISSING_STEP_RULES.length}개`}
      />

      <InMemoryBanner label="규칙 데이터는 소스코드(rules.ts)에서 관리됩니다" />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-4">
        <button
          type="button"
          onClick={() => setActiveTab("conflict")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "conflict" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          충돌 규칙 ({CONFLICT_RULES.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("missing")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "missing" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          누락 규칙 ({MISSING_STEP_RULES.length})
        </button>
      </div>

      {activeTab === "conflict" ? (
        <div className="space-y-2">
          {CONFLICT_RULES.map((rule) => {
            const style = SEVERITY_STYLE[rule.severity] ?? SEVERITY_STYLE.low;
            const isExpanded = expandedId === rule.id;
            return (
              <div key={rule.id} className={`rounded-2xl border overflow-hidden ${style.bg} ${style.text}`}>
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : rule.id)}
                  className="w-full text-left p-4 flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-bold text-gray-500">{rule.id}</span>
                    <StatusBadge status={rule.severity} label={rule.severity.toUpperCase()} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{rule.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] text-gray-500">
                        [{rule.a.join(", ")}] x [{rule.b.join(", ")}]
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge
                      status={rule.enabled ? "enabled" : "disabled"}
                      label={rule.enabled ? "활성" : "비활성"}
                    />
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-200/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
                      <div>
                        <p className="font-semibold text-gray-500 mb-1">설명</p>
                        <p className="text-gray-700">{rule.description}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-500 mb-1">팁</p>
                        <p className="text-gray-700">{rule.tip}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-500 mb-1">우선순위</p>
                        <p className="text-gray-700">{rule.priority}</p>
                      </div>
                      {rule.isMultiActive && (
                        <div>
                          <p className="font-semibold text-gray-500 mb-1">멀티 액티브</p>
                          <StatusBadge status="enabled" label="Yes" />
                        </div>
                      )}
                      {rule.concentrationModifier && (
                        <div className="sm:col-span-2">
                          <p className="font-semibold text-gray-500 mb-1">농도 보정</p>
                          <div className="flex gap-2">
                            {rule.concentrationModifier.any_high && (
                              <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px]">
                                high → {rule.concentrationModifier.any_high.severity}
                              </span>
                            )}
                            {rule.concentrationModifier.any_medium && (
                              <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-[10px]">
                                medium → {rule.concentrationModifier.any_medium.severity}
                              </span>
                            )}
                            {rule.concentrationModifier.both_low && (
                              <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px]">
                                both_low → {rule.concentrationModifier.both_low.severity}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {rule.skinTypeModifier && (
                        <div className="sm:col-span-2">
                          <p className="font-semibold text-gray-500 mb-1">피부타입 보정</p>
                          <div className="flex gap-2">
                            {Object.entries(rule.skinTypeModifier).map(([type, mod]) => (
                              <span key={type} className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px]">
                                {type}: +{mod.severityBump}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {MISSING_STEP_RULES.map((rule) => (
            <div key={rule.id} className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-gray-500">{rule.id}</span>
                <StatusBadge status={rule.priority} label={rule.priority.toUpperCase()} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    <Icon name="shield" size={14} /> {rule.step}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{rule.why}</p>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">{rule.check}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
