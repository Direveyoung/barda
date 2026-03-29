"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";
import Link from "next/link";
import {
  saveChallenge, loadChallenge, loadDiary,
  type ChallengeState, type DiaryEntry,
} from "@/lib/user-data-repository";
import { CHALLENGE_PRESETS, getChallengeTips, type ChallengeDayTip, type ChallengePreset } from "@/data/challenges";
import { CONDITION_LABEL } from "@/lib/constants";

const conditionIcons: Record<string, string> = {
  good: "face-happy", normal: "face-good", meh: "face-neutral",
  bad: "face-worried", terrible: "face-bad",
};

export default function ChallengePage() {
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<ChallengeState | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState<(DiaryEntry | null)[]>([]);
  const [tips, setTips] = useState<ChallengeDayTip[]>([]);
  const [previewPreset, setPreviewPreset] = useState<ChallengePreset | null>(null);

  const userId = user?.id ?? "anonymous";

  const duration = challenge?.duration ?? 7;

  // Load challenge state + diary entries
  useEffect(() => {
    if (typeof window === "undefined") return;

    loadChallenge(userId).then((data) => {
      if (!data) return;
      setChallenge(data);

      const dur = data.duration ?? 7;
      const startDate = new Date(data.startDate);
      const daysSince = Math.floor((Date.now() - startDate.getTime()) / 86_400_000);
      setIsActive(daysSince < dur);

      setTips(getChallengeTips(data.presetId ?? "basic_7"));

      const promises = Array.from({ length: dur }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        return loadDiary(userId, d.toISOString().slice(0, 10));
      });
      Promise.all(promises).then(setDiaryEntries);
    });
  }, [userId]);

  const startChallenge = useCallback((preset: ChallengePreset) => {
    const newChallenge: ChallengeState = {
      startDate: new Date().toISOString().slice(0, 10),
      completedDays: Array(preset.days).fill(false),
      presetId: preset.id,
      duration: preset.days,
    };
    setChallenge(newChallenge);
    setIsActive(true);
    setTips(getChallengeTips(preset.id));
    setDiaryEntries(Array(preset.days).fill(null));
    setPreviewPreset(null);
    saveChallenge(userId, newChallenge);
  }, [userId]);

  const toggleDay = useCallback((dayIndex: number) => {
    if (!challenge) return;
    const updated = {
      ...challenge,
      completedDays: challenge.completedDays.map((d, i) =>
        i === dayIndex ? !d : d
      ),
    };
    setChallenge(updated);
    saveChallenge(userId, updated);
  }, [challenge, userId]);

  const completedCount = challenge?.completedDays.filter(Boolean).length ?? 0;
  const [now] = useState(() => Date.now());
  const currentDay = challenge
    ? Math.min(duration, Math.floor((now - new Date(challenge.startDate).getTime()) / 86_400_000) + 1)
    : 0;

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-primary">BARDA</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6">
        {/* Hero */}
        <div className="text-center mb-6">
          <span className="mb-2 block">
            <Icon name={challenge?.presetId ? (CHALLENGE_PRESETS.find((p) => p.id === challenge.presetId)?.icon ?? "trophy") : "trophy"} size={36} />
          </span>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {isActive && challenge?.presetId
              ? CHALLENGE_PRESETS.find((p) => p.id === challenge.presetId)?.label ?? "스킨케어 챌린지"
              : "스킨케어 챌린지"}
          </h2>
          <p className="text-sm text-gray-500">
            매일 미션을 수행하며 올바른 루틴을 만들어 보세요
          </p>
        </div>

        {!isActive ? (
          /* Challenge selection */
          <div>
            {/* Preset cards */}
            <div className="space-y-3 mb-6">
              {CHALLENGE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setPreviewPreset(previewPreset?.id === preset.id ? null : preset)}
                  className={`w-full text-left rounded-2xl p-4 border transition-all ${
                    previewPreset?.id === preset.id
                      ? "bg-primary-bg border-primary/30 shadow-sm"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Icon name={preset.icon} size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">{preset.label}</p>
                      <p className="text-xs text-gray-500">{preset.description}</p>
                    </div>
                    <span className="text-xs font-semibold text-primary bg-primary-bg px-2 py-1 rounded-lg">
                      {preset.days}일
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Preview tips for selected preset */}
            {previewPreset && (
              <div className="bg-gradient-to-br from-primary-bg to-orange-50/50 rounded-2xl p-5 mb-6">
                <h3 className="text-sm font-bold text-gray-800 mb-3">미션 미리보기</h3>
                <div className="space-y-2.5 max-h-48 overflow-y-auto">
                  {getChallengeTips(previewPreset.id).slice(0, 7).map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Icon name={tip.icon} size={16} />
                      <div>
                        <p className="text-xs font-semibold text-gray-700">Day {i + 1}: {tip.title}</p>
                        <p className="text-xs text-gray-500">{tip.desc}</p>
                      </div>
                    </div>
                  ))}
                  {previewPreset.days > 7 && (
                    <p className="text-xs text-gray-400 text-center">... 외 {previewPreset.days - 7}일</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => startChallenge(previewPreset)}
                  className="w-full mt-4 py-3 rounded-2xl font-semibold text-sm bg-primary text-white hover:bg-primary-light transition-colors shadow-lg shadow-primary/20"
                >
                  {previewPreset.label} 시작하기
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Active challenge */
          <div>
            {/* Progress */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-800">진행률</span>
                <span className="text-sm font-bold text-primary">
                  {completedCount}/{duration}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${(completedCount / duration) * 100}%` }}
                />
              </div>
              {duration <= 14 && (
                <div className="flex justify-between">
                  {Array.from({ length: duration }, (_, i) => (
                    <div
                      key={i}
                      className={`text-xs font-medium ${
                        i < currentDay
                          ? challenge?.completedDays[i] ? "text-primary" : "text-gray-400"
                          : "text-gray-300"
                      }`}
                    >
                      {challenge?.completedDays[i] ? <Icon name="check" size={12} /> : (i + 1)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Day cards */}
            <div className="space-y-3">
              {tips.map((tip, i) => {
                const isToday = i + 1 === currentDay;
                const isPast = i + 1 < currentDay;
                const isCompleted = challenge?.completedDays[i] ?? false;
                const isFuture = i + 1 > currentDay;

                return (
                  <div
                    key={i}
                    className={`rounded-2xl p-4 border transition-all ${
                      isToday
                        ? "bg-primary-bg border-primary/20 shadow-sm"
                        : isCompleted
                          ? "bg-green-50 border-green-200"
                          : isFuture
                            ? "bg-gray-50 border-gray-100 opacity-60"
                            : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon name={tip.icon} size={20} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-700">Day {i + 1}</span>
                          {isToday && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-white font-medium">오늘</span>
                          )}
                          {isCompleted && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600 font-medium">완료</span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-gray-800 mb-0.5">{tip.title}</p>
                        <p className="text-xs text-gray-500">{tip.desc}</p>
                        {diaryEntries[i] && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400">
                            <Icon name={conditionIcons[diaryEntries[i]!.condition] ?? "face-neutral"} size={16} />
                            <span>피부: {CONDITION_LABEL[diaryEntries[i]!.condition] ?? diaryEntries[i]!.condition}</span>
                            {diaryEntries[i]!.memo && (
                              <span className="truncate max-w-[120px]">· {diaryEntries[i]!.memo}</span>
                            )}
                          </div>
                        )}
                      </div>
                      {(isToday || isPast) && !isFuture && (
                        <button
                          type="button"
                          onClick={() => toggleDay(i)}
                          className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            isCompleted
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-gray-300 hover:border-primary"
                          }`}
                        >
                          {isCompleted && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Completion */}
            {completedCount === duration && (
              <div className="mt-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-5 text-center border border-amber-200">
                <span className="mb-2 block"><Icon name="celebration" size={36} /></span>
                <p className="text-sm font-bold text-gray-800 mb-1">
                  {duration}일 챌린지 완료!
                </p>
                <p className="text-xs text-gray-500 mb-3">대단해요! 이제 매일 루틴을 이어가 보세요</p>
                <Link href="/" className="inline-block px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold">
                  홈으로 돌아가기
                </Link>
              </div>
            )}

            {/* Restart */}
            <button
              type="button"
              onClick={() => { setIsActive(false); setChallenge(null); }}
              className="w-full mt-4 py-3 text-sm text-gray-400 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              다른 챌린지 선택하기
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
