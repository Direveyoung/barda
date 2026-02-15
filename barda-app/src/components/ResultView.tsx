"use client";

import { useState } from "react";
import type { AnalysisResult, RoutineProduct } from "@/lib/analysis";
import {
  scoreColor,
  scoreLabel,
  severityConfig,
  findCategory,
} from "@/lib/analysis";

interface Props {
  result: AnalysisResult;
  onBack: () => void;
  onReset: () => void;
}

/* ─── Score Ring ─── */

function ScoreRing({ score }: { score: number }) {
  const color = scoreColor(score);
  const circumference = 2 * Math.PI * 50;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center py-6">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="animate-score"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold" style={{ color }}>
            {score}
          </span>
          <span className="text-xs text-gray-500">/ 100</span>
        </div>
      </div>
      <span
        className="mt-2 text-lg font-semibold"
        style={{ color }}
      >
        {scoreLabel(score)}
      </span>
    </div>
  );
}

/* ─── Routine Card ─── */

function RoutineCard({
  title,
  emoji,
  bgClass,
  products,
  tips,
}: {
  title: string;
  emoji: string;
  bgClass: string;
  products: RoutineProduct[];
  tips: string[];
}) {
  return (
    <div className={`rounded-2xl p-5 ${bgClass}`}>
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        {emoji} {title}
      </h3>
      {products.length === 0 ? (
        <p className="text-sm text-gray-500">해당 시간대 제품이 없어요</p>
      ) : (
        <div className="space-y-2 mb-4">
          {products.map((product, idx) => {
            const cat = findCategory(product.categoryId);
            return (
              <div
                key={product.id}
                className="flex items-center gap-3 bg-white/70 rounded-xl px-4 py-3"
              >
                <span className="text-sm font-bold text-gray-400 w-6">
                  {idx + 1}
                </span>
                <span className="text-lg">{cat?.emoji ?? "📦"}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {product.brand} {product.name}
                  </div>
                  <div className="text-xs text-gray-400">{cat?.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tips.length > 0 && (
        <div className="space-y-2 mt-3 pt-3 border-t border-white/50">
          {tips.map((tip, i) => (
            <div key={i} className="flex gap-2 text-sm text-gray-600">
              <span className="shrink-0">💡</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Conflict Card ─── */

function ConflictCard({
  conflict,
}: {
  conflict: AnalysisResult["conflicts"][0];
}) {
  const config = severityConfig(conflict.severity);
  return (
    <div
      className="rounded-2xl p-4 border"
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="px-2 py-0.5 rounded-full text-xs font-bold text-white shrink-0"
          style={{ backgroundColor: config.badge }}
        >
          {config.label}
        </span>
        <div className="flex-1">
          <h4
            className="font-semibold text-sm mb-1"
            style={{ color: config.text }}
          >
            {conflict.rule.title}
          </h4>
          <p className="text-xs mb-2" style={{ color: config.text }}>
            {conflict.rule.description}
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            {conflict.involvedProducts.map((name) => (
              <span
                key={name}
                className="px-2 py-0.5 rounded-full text-xs bg-white/50"
                style={{ color: config.text }}
              >
                {name}
              </span>
            ))}
          </div>
          <div
            className="text-xs flex gap-1 items-start"
            style={{ color: config.text }}
          >
            <span>✅</span>
            <span>{conflict.rule.tip}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Missing Step Card ─── */

function MissingStepCard({
  step,
}: {
  step: AnalysisResult["missingSteps"][0];
}) {
  const isCritical = step.priority === "critical";
  return (
    <div
      className={`rounded-2xl p-4 border ${
        isCritical
          ? "bg-red-50 border-red-200"
          : "bg-amber-50 border-amber-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{isCritical ? "🚨" : "⚠️"}</span>
        <div>
          <h4
            className={`font-semibold text-sm mb-1 ${
              isCritical ? "text-red-800" : "text-amber-800"
            }`}
          >
            {step.step}
          </h4>
          <p
            className={`text-xs ${
              isCritical ? "text-red-600" : "text-amber-600"
            }`}
          >
            {step.why}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Calendar ─── */

function WeekCalendar({
  calendar,
}: {
  calendar: AnalysisResult["calendar"];
}) {
  return (
    <div className="rounded-2xl bg-white p-5 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        📅 7일 루틴 캘린더
      </h3>
      <div className="grid grid-cols-7 gap-1.5">
        {calendar.map((day) => (
          <div
            key={day.day}
            className="flex flex-col items-center gap-1 p-2 rounded-xl bg-gray-50"
          >
            <span className="text-xs font-semibold text-gray-500">
              {day.day}
            </span>
            <span className="text-xl">{day.pmEmoji}</span>
            <span className="text-[10px] text-gray-500 text-center leading-tight">
              {day.pmLabel}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500">🌙 기본 루틴</span>
        <span className="text-xs text-gray-500">💜 레티놀 데이</span>
        <span className="text-xs text-gray-500">✨ 각질케어 데이</span>
      </div>
    </div>
  );
}

/* ─── Main ResultView ─── */

export default function ResultView({ result, onBack, onReset }: Props) {
  const [activeTab, setActiveTab] = useState<"am" | "pm">("am");

  return (
    <div className="animate-fade-up space-y-5">
      {/* Score */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <ScoreRing score={result.score} />
      </div>

      {/* AM/PM Toggle */}
      <div className="flex gap-2 bg-gray-100 rounded-2xl p-1">
        <button
          onClick={() => setActiveTab("am")}
          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === "am"
              ? "bg-am text-amber-800 shadow-sm"
              : "text-gray-500"
          }`}
        >
          ☀️ 아침 루틴
        </button>
        <button
          onClick={() => setActiveTab("pm")}
          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === "pm"
              ? "bg-pm text-purple-800 shadow-sm"
              : "text-gray-500"
          }`}
        >
          🌙 저녁 루틴
        </button>
      </div>

      {activeTab === "am" ? (
        <RoutineCard
          title="아침 루틴"
          emoji="☀️"
          bgClass="bg-gradient-to-br from-amber-50 to-yellow-50"
          products={result.amProducts}
          tips={result.amTips}
        />
      ) : (
        <RoutineCard
          title="저녁 루틴"
          emoji="🌙"
          bgClass="bg-gradient-to-br from-purple-50 to-violet-50"
          products={result.pmProducts}
          tips={result.pmTips}
        />
      )}

      {/* Conflicts */}
      {result.conflicts.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">
            ⚠️ 주의가 필요한 조합 ({result.conflicts.length})
          </h3>
          <div className="space-y-3">
            {result.conflicts.map((conflict) => (
              <ConflictCard key={conflict.rule.id} conflict={conflict} />
            ))}
          </div>
        </div>
      )}

      {/* Missing Steps */}
      {result.missingSteps.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">
            📋 빠진 단계
          </h3>
          <div className="space-y-3">
            {result.missingSteps.map((step) => (
              <MissingStepCard key={step.id} step={step} />
            ))}
          </div>
        </div>
      )}

      {/* Calendar */}
      {(result.hasRetinol || result.hasAHA) && (
        <WeekCalendar calendar={result.calendar} />
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-2xl font-semibold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          제품 수정하기
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-3.5 rounded-2xl font-semibold text-white bg-primary hover:bg-primary-light transition-colors"
        >
          처음부터 다시
        </button>
      </div>
    </div>
  );
}
