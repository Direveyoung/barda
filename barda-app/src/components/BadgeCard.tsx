"use client";

import { BADGE_DEFINITIONS } from "@/lib/constants";
import type { EarnedBadge } from "@/lib/badge-repository";
import Icon from "@/components/Icon";

interface Props {
  earnedBadges: EarnedBadge[];
  compact?: boolean;
}

const CATEGORY_LABEL: Record<string, string> = {
  streak: "연속 체크인",
  analysis: "분석",
  diary: "다이어리",
  drawer: "서랍",
};

export default function BadgeCard({ earnedBadges, compact = false }: Props) {
  const earnedIds = new Set(earnedBadges.map((b) => b.id));

  if (compact) {
    const earned = BADGE_DEFINITIONS.filter((b) => earnedIds.has(b.id));
    if (earned.length === 0) return null;
    return (
      <div className="flex gap-1.5 flex-wrap">
        {earned.map((badge) => (
          <span
            key={badge.id}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold"
          >
            <Icon name={badge.icon} size={12} /> {badge.label}
          </span>
        ))}
      </div>
    );
  }

  // Group by category
  const categories = [...new Set(BADGE_DEFINITIONS.map((b) => b.category))];

  return (
    <div className="space-y-4">
      {categories.map((cat) => {
        const badges = BADGE_DEFINITIONS.filter((b) => b.category === cat);
        return (
          <div key={cat}>
            <h4 className="text-xs font-semibold text-gray-500 mb-2">
              {CATEGORY_LABEL[cat] ?? cat}
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {badges.map((badge) => {
                const isEarned = earnedIds.has(badge.id);
                const earned = earnedBadges.find((b) => b.id === badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                      isEarned
                        ? "bg-amber-50 border-amber-200"
                        : "bg-gray-50 border-gray-100 opacity-40"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isEarned ? "bg-amber-100" : "bg-gray-200"
                    }`}>
                      {isEarned ? (
                        <Icon name={badge.icon} size={20} />
                      ) : (
                        <Icon name="lock" size={16} />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-center leading-tight text-gray-700">
                      {badge.label}
                    </span>
                    {earned && (
                      <span className="text-[9px] text-gray-400">
                        {earned.earnedAt.slice(5, 10)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
