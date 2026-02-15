"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import RoutinePostCard, { type RoutinePost } from "@/components/RoutinePostCard";

/* ─── 요일 이름 ─── */
const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

/* ─── 피부타입 라벨 ─── */
const skinTypeLabel: Record<string, string> = {
  dry: "건성",
  oily: "지성",
  combination: "복합성",
  sensitive: "민감성",
  normal: "중성",
};

/* ─── 피부 컨디션 옵션 ─── */
const conditionOptions = [
  { emoji: "😊", label: "좋음", value: "good" },
  { emoji: "🙂", label: "보통", value: "normal" },
  { emoji: "😐", label: "그저그럭", value: "meh" },
  { emoji: "😟", label: "별로", value: "bad" },
  { emoji: "😣", label: "나쁨", value: "terrible" },
];

/* ────────────────────────────────────────────────
   비로그인 랜딩 페이지
   ──────────────────────────────────────────────── */
function LandingHome() {
  const [feedPosts, setFeedPosts] = useState<RoutinePost[]>([]);
  const [totalAnalysis, setTotalAnalysis] = useState(0);

  useEffect(() => {
    // Fetch recent feed posts for preview
    fetch("/api/routines?sort=latest&page=1&limit=3")
      .then((r) => r.json())
      .then((json) => {
        setFeedPosts(json.posts ?? []);
        setTotalAnalysis(json.totalCount ?? 0);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">BARDA</h1>
          <Link
            href="/auth/login"
            className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
          >
            로그인
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4">
        {/* Hero Section */}
        <section className="pt-10 pb-8 text-center">
          <p className="text-sm text-primary font-medium mb-2">바르게 바르다</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
            내 루틴,<br />바르게 바르고 있을까?
          </h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            보유한 화장품을 입력하면<br />
            AM/PM 루틴 순서 + 성분 충돌 경고 + 7일 캘린더를<br />
            한 번에 받아보세요
          </p>
          <Link
            href="/analyze"
            className="inline-block px-8 py-3.5 rounded-2xl bg-primary text-white font-semibold text-sm shadow-lg shadow-primary/25 hover:bg-primary-light transition-colors"
          >
            내 루틴 분석하기
          </Link>
        </section>

        {/* 핵심 기능 3가지 */}
        <section className="py-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                icon: "🔬",
                title: "성분 충돌 분석",
                desc: "위험한 조합을 찾아드려요",
              },
              {
                icon: "☀️🌙",
                title: "AM/PM 루틴",
                desc: "시간대별 맞춤 순서 제안",
              },
              {
                icon: "📅",
                title: "7일 캘린더",
                desc: "요일별 자동 루틴 배치",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="bg-white rounded-2xl border border-gray-100 p-4 text-center"
              >
                <div className="text-2xl mb-2">{feat.icon}</div>
                <p className="text-xs font-semibold text-gray-800 mb-1">
                  {feat.title}
                </p>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 통계 */}
        {totalAnalysis > 0 && (
          <section className="py-4">
            <div className="bg-primary-bg rounded-2xl p-4 text-center">
              <p className="text-xs text-primary/70 mb-1">지금까지</p>
              <p className="text-2xl font-bold text-primary">
                {totalAnalysis.toLocaleString()}개
              </p>
              <p className="text-xs text-primary/70">루틴이 분석되었어요</p>
            </div>
          </section>
        )}

        {/* 실시간 피드 미리보기 */}
        <section className="py-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800">
              최근 공유된 루틴
            </h3>
            <Link
              href="/feed"
              className="text-xs text-primary font-medium"
            >
              전체 보기 →
            </Link>
          </div>
          {feedPosts.length > 0 ? (
            <div className="space-y-3">
              {feedPosts.map((post) => (
                <RoutinePostCard
                  key={post.id}
                  post={post}
                  onLike={() => {}}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <p className="text-sm text-gray-400">
                아직 공유된 루틴이 없어요
              </p>
              <p className="text-xs text-gray-300 mt-1">
                첫 번째로 루틴을 공유해 보세요!
              </p>
            </div>
          )}
        </section>

        {/* 성분 가이드 CTA */}
        <section className="py-6">
          <Link
            href="/guide"
            className="block bg-white rounded-2xl border border-gray-100 p-5 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-am/30 flex items-center justify-center text-lg shrink-0">
                📖
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">
                  성분 가이드
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  레티놀, AHA, 비타민C... 궁금한 성분을 알아보세요
                </p>
              </div>
              <svg
                className="w-5 h-5 text-gray-300 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </div>
          </Link>
        </section>

        {/* 두 번째 CTA */}
        <section className="py-6 pb-10 text-center">
          <p className="text-sm text-gray-500 mb-4">
            지금 바로 내 루틴을 체크해 보세요
          </p>
          <Link
            href="/analyze"
            className="inline-block px-6 py-3 rounded-2xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-colors"
          >
            무료로 분석 시작하기
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-lg mx-auto px-4 pb-4 text-center">
        <p className="text-xs text-gray-400">
          BARDA는 일반적인 스킨케어 정보를 제공하며, 전문 의료 조언을 대체하지 않습니다.
        </p>
      </footer>

      <BottomNav />
    </div>
  );
}

/* ────────────────────────────────────────────────
   로그인 홈 — 오늘의 루틴 체크리스트 + 다이어리
   ──────────────────────────────────────────────── */
function LoggedInHome() {
  const { user, signOut } = useAuth();
  const today = new Date();
  const dayName = DAY_NAMES[today.getDay()];
  const dateStr = `${today.getMonth() + 1}월 ${today.getDate()}일 (${dayName})`;

  /* ── 체크리스트 상태 ── */
  const [checklist, setChecklist] = useState<{
    am: { name: string; checked: boolean }[];
    pm: { name: string; checked: boolean }[];
  }>({ am: [], pm: [] });
  const [routineLoaded, setRoutineLoaded] = useState(false);
  const [hasRoutine, setHasRoutine] = useState(false);

  /* ── 다이어리 상태 ── */
  const [todayCondition, setTodayCondition] = useState<string | null>(null);
  const [diaryMemo, setDiaryMemo] = useState("");
  const [diarySaved, setDiarySaved] = useState(false);

  /* ── 연속 체크 카운트 ── */
  const [streak, setStreak] = useState(0);

  /* ── 최근 피드 ── */
  const [recentPosts, setRecentPosts] = useState<RoutinePost[]>([]);

  // Load saved checklist & diary from localStorage
  useEffect(() => {
    const todayKey = today.toISOString().slice(0, 10);

    // Load last routine analysis result
    const savedRoutine = localStorage.getItem("barda_last_routine");
    if (savedRoutine) {
      try {
        const parsed = JSON.parse(savedRoutine);
        const amProducts = (parsed.amRoutine ?? []).map((p: { name: string }) => ({
          name: p.name,
          checked: false,
        }));
        const pmProducts = (parsed.pmRoutine ?? []).map((p: { name: string }) => ({
          name: p.name,
          checked: false,
        }));

        // Restore today's checked state
        const savedChecks = localStorage.getItem(`barda_checks_${todayKey}`);
        if (savedChecks) {
          const checks = JSON.parse(savedChecks);
          amProducts.forEach((p: { name: string; checked: boolean }, i: number) => {
            if (checks.am?.[i]) p.checked = true;
          });
          pmProducts.forEach((p: { name: string; checked: boolean }, i: number) => {
            if (checks.pm?.[i]) p.checked = true;
          });
        }

        setChecklist({ am: amProducts, pm: pmProducts });
        setHasRoutine(true);
      } catch {
        // ignore
      }
    }
    setRoutineLoaded(true);

    // Load today's diary
    const savedDiary = localStorage.getItem(`barda_diary_${todayKey}`);
    if (savedDiary) {
      try {
        const parsed = JSON.parse(savedDiary);
        setTodayCondition(parsed.condition ?? null);
        setDiaryMemo(parsed.memo ?? "");
        setDiarySaved(true);
      } catch {
        // ignore
      }
    }

    // Calculate streak
    let count = 0;
    const d = new Date(today);
    for (let i = 0; i < 30; i++) {
      const key = d.toISOString().slice(0, 10);
      const checks = localStorage.getItem(`barda_checks_${key}`);
      if (checks) {
        count++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    setStreak(count);

    // Fetch recent feed
    fetch("/api/routines?sort=latest&page=1&limit=3")
      .then((r) => r.json())
      .then((json) => setRecentPosts(json.posts ?? []))
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle checklist item
  const toggleCheck = useCallback(
    (time: "am" | "pm", index: number) => {
      setChecklist((prev) => {
        const updated = { ...prev };
        updated[time] = [...updated[time]];
        updated[time][index] = {
          ...updated[time][index],
          checked: !updated[time][index].checked,
        };

        // Save to localStorage
        const todayKey = new Date().toISOString().slice(0, 10);
        const checks = {
          am: updated.am.map((p) => p.checked),
          pm: updated.pm.map((p) => p.checked),
        };
        localStorage.setItem(`barda_checks_${todayKey}`, JSON.stringify(checks));

        return updated;
      });
    },
    []
  );

  // Save diary
  const saveDiary = useCallback(() => {
    if (!todayCondition) return;
    const todayKey = new Date().toISOString().slice(0, 10);
    localStorage.setItem(
      `barda_diary_${todayKey}`,
      JSON.stringify({ condition: todayCondition, memo: diaryMemo })
    );
    setDiarySaved(true);
  }, [todayCondition, diaryMemo]);

  // Score for last analysis
  const lastScore = (() => {
    try {
      const saved = localStorage.getItem("barda_last_routine");
      if (saved) return JSON.parse(saved).score ?? null;
    } catch { /* ignore */ }
    return null;
  })();

  const amDone = checklist.am.filter((p) => p.checked).length;
  const pmDone = checklist.pm.filter((p) => p.checked).length;
  const amTotal = checklist.am.length;
  const pmTotal = checklist.pm.length;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">BARDA</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:inline">
              {user?.email?.split("@")[0]}
            </span>
            <button
              onClick={() => signOut()}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4">
        {/* 오늘 날짜 + 스트릭 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-lg font-bold text-gray-900">{dateStr}</p>
            <p className="text-xs text-gray-400">오늘의 스킨케어 루틴</p>
          </div>
          {streak > 0 && (
            <div className="bg-am/30 px-3 py-1.5 rounded-full">
              <span className="text-xs font-semibold text-am-deep">
                🔥 {streak}일 연속
              </span>
            </div>
          )}
        </div>

        {/* 루틴 점수 요약 */}
        {lastScore !== null && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex items-center gap-4">
            <div className="relative w-14 h-14">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#F3F4F6" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="#D4726A" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(lastScore / 100) * 314} 314`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">
                {lastScore}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">내 루틴 점수</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {lastScore >= 90 ? "완벽한 루틴!" : lastScore >= 80 ? "좋은 루틴이에요" : lastScore >= 60 ? "조금 더 개선해볼까요?" : "점검이 필요해요"}
              </p>
            </div>
            <Link
              href="/analyze"
              className="text-xs text-primary font-medium shrink-0"
            >
              재분석 →
            </Link>
          </div>
        )}

        {/* 체크리스트 없으면 분석 유도 */}
        {routineLoaded && !hasRoutine && (
          <section className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 text-center">
            <div className="text-3xl mb-3">🧴</div>
            <p className="text-sm font-semibold text-gray-800 mb-2">
              아직 분석한 루틴이 없어요
            </p>
            <p className="text-xs text-gray-400 mb-4">
              루틴을 분석하면 매일 체크리스트가 생겨요
            </p>
            <Link
              href="/analyze"
              className="inline-block px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-light transition-colors"
            >
              내 루틴 분석하기
            </Link>
          </section>
        )}

        {/* ☀️ 아침 루틴 체크리스트 */}
        {hasRoutine && checklist.am.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">☀️</span>
                <span className="text-sm font-semibold text-gray-800">아침 루틴</span>
              </div>
              <span className="text-xs text-gray-400">
                {amDone}/{amTotal}
              </span>
            </div>
            {/* Progress */}
            <div className="h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
              <div
                className="h-full bg-am-deep rounded-full transition-all duration-300"
                style={{ width: amTotal > 0 ? `${(amDone / amTotal) * 100}%` : "0%" }}
              />
            </div>
            <div className="space-y-2">
              {checklist.am.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleCheck("am", i)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                    item.checked
                      ? "bg-am/10 border-am-deep/20"
                      : "bg-white border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      item.checked
                        ? "bg-am-deep border-am-deep"
                        : "border-gray-300"
                    }`}
                  >
                    {item.checked && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      item.checked
                        ? "text-gray-400 line-through"
                        : "text-gray-700"
                    }`}
                  >
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 🌙 저녁 루틴 체크리스트 */}
        {hasRoutine && checklist.pm.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">🌙</span>
                <span className="text-sm font-semibold text-gray-800">저녁 루틴</span>
              </div>
              <span className="text-xs text-gray-400">
                {pmDone}/{pmTotal}
              </span>
            </div>
            {/* Progress */}
            <div className="h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
              <div
                className="h-full bg-pm-deep rounded-full transition-all duration-300"
                style={{ width: pmTotal > 0 ? `${(pmDone / pmTotal) * 100}%` : "0%" }}
              />
            </div>
            <div className="space-y-2">
              {checklist.pm.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleCheck("pm", i)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                    item.checked
                      ? "bg-pm/10 border-pm-deep/20"
                      : "bg-white border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      item.checked
                        ? "bg-pm-deep border-pm-deep"
                        : "border-gray-300"
                    }`}
                  >
                    {item.checked && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      item.checked
                        ? "text-gray-400 line-through"
                        : "text-gray-700"
                    }`}
                  >
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 😊 오늘 피부 컨디션 */}
        <section className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">📝</span>
            <span className="text-sm font-semibold text-gray-800">오늘 피부 컨디션</span>
            {diarySaved && (
              <span className="text-[10px] text-success font-medium bg-green-50 px-2 py-0.5 rounded-full">저장됨</span>
            )}
          </div>
          <div className="flex gap-2 mb-3">
            {conditionOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setTodayCondition(opt.value);
                  setDiarySaved(false);
                }}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all ${
                  todayCondition === opt.value
                    ? "border-primary bg-primary-bg"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-[10px] text-gray-500">{opt.label}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="한줄 메모 (선택)"
              value={diaryMemo}
              onChange={(e) => {
                setDiaryMemo(e.target.value);
                setDiarySaved(false);
              }}
              className="flex-1 px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary/50"
            />
            <button
              type="button"
              onClick={saveDiary}
              disabled={!todayCondition || diarySaved}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-primary text-white disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
            >
              저장
            </button>
          </div>
        </section>

        {/* 📱 최근 피드 */}
        <section className="py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800">새로운 루틴</h3>
            <Link
              href="/feed"
              className="text-xs text-primary font-medium"
            >
              전체 보기 →
            </Link>
          </div>
          {recentPosts.length > 0 ? (
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <RoutinePostCard
                  key={post.id}
                  post={post}
                  onLike={() => {}}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <p className="text-sm text-gray-400">아직 공유된 루틴이 없어요</p>
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

/* ────────────────────────────────────────────────
   메인 홈 — 로그인 상태에 따라 분기
   ──────────────────────────────────────────────── */
export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <LoggedInHome /> : <LandingHome />;
}
