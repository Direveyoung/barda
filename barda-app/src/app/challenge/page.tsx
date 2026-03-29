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

const DAY_LABELS = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];

const challengeTips = [
  { day: 1, title: "기본 루틴 세팅", desc: "클렌저 → 토너 → 보습 → 선크림, 기본 4단계부터 시작!", icon: "bottle" },
  { day: 2, title: "아침 루틴 집중", desc: "아침은 가볍게! 클렌저 + 토너 + 보습 + 선크림", icon: "sun" },
  { day: 3, title: "저녁 더블 클렌징", desc: "메이크업/선크림 제거를 위해 오일 → 폼 순서로", icon: "moon" },
  { day: 4, title: "보습 강화의 날", desc: "히알루론산 또는 세라마이드 제품으로 보습 레이어링", icon: "drop" },
  { day: 5, title: "액티브 성분 도전", desc: "비타민C(아침) 또는 나이아신아마이드를 추가해 보세요", icon: "sparkle" },
  { day: 6, title: "스페셜 케어 데이", desc: "마스크팩 또는 아이크림으로 집중 케어 시간", icon: "mask" },
  { day: 7, title: "7일 루틴 완성!", desc: "축하해요! 일주일 루틴을 모두 완주했어요", icon: "celebration" },
];

const conditionEmojis: Record<string, string> = {
  good: "face-happy",
  normal: "face-good",
  meh: "face-neutral",
  bad: "face-worried",
  terrible: "face-bad",
};

export default function ChallengePage() {
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<ChallengeState | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState<(DiaryEntry | null)[]>(
    Array(7).fill(null)
  );

  const userId = user?.id ?? "anonymous";

  // Load challenge state + diary entries for each challenge day
  useEffect(() => {
    if (typeof window === "undefined") return;

    loadChallenge(userId).then((data) => {
      if (!data) return;
      setChallenge(data);

      const startDate = new Date(data.startDate);
      const daysSince = Math.floor((Date.now() - startDate.getTime()) / 86_400_000);
      setIsActive(daysSince < 7);

      // Load diary entries for each challenge day
      const promises = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        return loadDiary(userId, key);
      });
      Promise.all(promises).then(setDiaryEntries);
    });
  }, [userId]);

  const startChallenge = useCallback(() => {
    const newChallenge: ChallengeState = {
      startDate: new Date().toISOString().slice(0, 10),
      completedDays: [false, false, false, false, false, false, false],
    };
    setChallenge(newChallenge);
    setIsActive(true);
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
    ? Math.min(7, Math.floor((now - new Date(challenge.startDate).getTime()) / 86_400_000) + 1)
    : 0;

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-primary">BARDA</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6">
        {/* Hero */}
        <div className="text-center mb-6">
          <span className="mb-2 block"><Icon name="trophy" size={36} /></span>
          <h2 className="text-xl font-bold text-gray-900 mb-1">7일 스킨케어 챌린지</h2>
          <p className="text-sm text-gray-500">
            매일 미션을 수행하며 올바른 루틴을 만들어 보세요
          </p>
        </div>

        {!isActive ? (
          /* Challenge not started */
          <div>
            <div className="bg-gradient-to-br from-primary-bg to-orange-50/50 rounded-2xl p-5 mb-6">
              <h3 className="text-sm font-bold text-gray-800 mb-3">챌린지 미션 미리보기</h3>
              <div className="space-y-2.5">
                {challengeTips.map((tip) => (
                  <div key={tip.day} className="flex items-start gap-3">
                    <Icon name={tip.icon} size={20} />
                    <div>
                      <p className="text-xs font-semibold text-gray-700">
                        Day {tip.day}: {tip.title}
                      </p>
                      <p className="text-[11px] text-gray-500">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={startChallenge}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm bg-primary text-white hover:bg-primary-light transition-colors shadow-lg shadow-primary/20"
            >
              챌린지 시작하기
            </button>
          </div>
        ) : (
          /* Active challenge */
          <div>
            {/* Progress */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-800">진행률</span>
                <span className="text-sm font-bold text-primary">
                  {completedCount}/7
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${(completedCount / 7) * 100}%` }}
                />
              </div>
              <div className="flex justify-between">
                {DAY_LABELS.map((label, i) => (
                  <div
                    key={label}
                    className={`text-[10px] font-medium ${
                      i < currentDay
                        ? challenge?.completedDays[i]
                          ? "text-primary"
                          : "text-gray-400"
                        : "text-gray-300"
                    }`}
                  >
                    {challenge?.completedDays[i] ? <Icon name="check" size={12} /> : (i + 1)}
                  </div>
                ))}
              </div>
            </div>

            {/* Day cards */}
            <div className="space-y-3">
              {challengeTips.map((tip, i) => {
                const isToday = i + 1 === currentDay;
                const isPast = i + 1 < currentDay;
                const isCompleted = challenge?.completedDays[i] ?? false;
                const isFuture = i + 1 > currentDay;

                return (
                  <div
                    key={tip.day}
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
                          <span className="text-xs font-bold text-gray-700">
                            Day {tip.day}
                          </span>
                          {isToday && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-white font-medium">
                              오늘
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-600 font-medium">
                              완료
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-gray-800 mb-0.5">
                          {tip.title}
                        </p>
                        <p className="text-xs text-gray-500">{tip.desc}</p>
                        {/* Show diary entry if exists for this day */}
                        {diaryEntries[i] && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-gray-400">
                            <Icon name={conditionEmojis[diaryEntries[i].condition] ?? "face-neutral"} size={16} />
                            <span>피부: {diaryEntries[i].condition === "good" ? "좋음" : diaryEntries[i].condition === "normal" ? "보통" : diaryEntries[i].condition === "meh" ? "그저그럭" : diaryEntries[i].condition === "bad" ? "별로" : "나쁨"}</span>
                            {diaryEntries[i].memo && (
                              <span className="truncate max-w-[120px]">· {diaryEntries[i].memo}</span>
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
            {completedCount === 7 && (
              <div className="mt-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-5 text-center border border-amber-200">
                <span className="mb-2 block"><Icon name="celebration" size={36} /></span>
                <p className="text-sm font-bold text-gray-800 mb-1">
                  7일 챌린지 완료!
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  대단해요! 이제 매일 루틴을 이어가 보세요
                </p>
                <Link
                  href="/"
                  className="inline-block px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold"
                >
                  홈으로 돌아가기
                </Link>
              </div>
            )}

            {/* Restart */}
            <button
              type="button"
              onClick={startChallenge}
              className="w-full mt-4 py-3 text-sm text-gray-400 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              챌린지 다시 시작
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
