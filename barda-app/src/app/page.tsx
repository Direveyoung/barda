"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import NotificationBell from "@/components/NotificationBell";
import RoutinePostCard, { type RoutinePost } from "@/components/RoutinePostCard";
import Icon from "@/components/Icon";
import { fetchWeather, generateWeatherTips, type WeatherData, type WeatherTip, type DailyForecast } from "@/lib/weather";

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
  { icon: "face-happy", label: "좋음", value: "good" },
  { icon: "face-good", label: "보통", value: "normal" },
  { icon: "face-neutral", label: "그저그럭", value: "meh" },
  { icon: "face-worried", label: "별로", value: "bad" },
  { icon: "face-bad", label: "나쁨", value: "terrible" },
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
                icon: "microscope",
                title: "성분 충돌 분석",
                desc: "위험한 조합을 찾아드려요",
              },
              {
                icon: "sun",
                title: "AM/PM 루틴",
                desc: "시간대별 맞춤 순서 제안",
              },
              {
                icon: "calendar",
                title: "7일 캘린더",
                desc: "요일별 자동 루틴 배치",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="bg-white rounded-2xl border border-gray-100 p-4 text-center"
              >
                <div className="mb-2"><Icon name={feat.icon} size={24} /></div>
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

        {/* 스킨케어 도구 모음 */}
        <section className="py-6">
          <h3 className="text-sm font-bold text-gray-800 mb-3">스킨케어 도구</h3>
          <div className="grid grid-cols-3 gap-2">
            <Link
              href="/guide"
              className="bg-white rounded-2xl border border-gray-100 p-3 hover:border-primary/30 transition-colors text-center"
            >
              <span className="block mb-1"><Icon name="book" size={20} /></span>
              <span className="text-[11px] font-semibold text-gray-800 block">성분 가이드</span>
              <p className="text-[9px] text-gray-400 mt-0.5">30종 상세</p>
            </Link>
            <Link
              href="/dupe"
              className="bg-white rounded-2xl border border-gray-100 p-3 hover:border-primary/30 transition-colors text-center"
            >
              <span className="block mb-1"><Icon name="search" size={20} /></span>
              <span className="text-[11px] font-semibold text-gray-800 block">듀프 파인더</span>
              <p className="text-[9px] text-gray-400 mt-0.5">대안 제품</p>
            </Link>
            <Link
              href="/ranking"
              className="bg-white rounded-2xl border border-gray-100 p-3 hover:border-primary/30 transition-colors text-center"
            >
              <span className="block mb-1"><Icon name="medal" size={20} /></span>
              <span className="text-[11px] font-semibold text-gray-800 block">인기 랭킹</span>
              <p className="text-[9px] text-gray-400 mt-0.5">TOP 10</p>
            </Link>
            <Link
              href="/scanner"
              className="bg-white rounded-2xl border border-gray-100 p-3 hover:border-primary/30 transition-colors text-center"
            >
              <span className="block mb-1"><Icon name="camera" size={20} /></span>
              <span className="text-[11px] font-semibold text-gray-800 block">바코드 스캐너</span>
              <p className="text-[9px] text-gray-400 mt-0.5">제품 스캔</p>
            </Link>
            <Link
              href="/ingredient-analysis"
              className="bg-white rounded-2xl border border-gray-100 p-3 hover:border-primary/30 transition-colors text-center"
            >
              <span className="block mb-1"><Icon name="dna" size={20} /></span>
              <span className="text-[11px] font-semibold text-gray-800 block">성분 분석</span>
              <p className="text-[9px] text-gray-400 mt-0.5">AI 분석</p>
            </Link>
            <Link
              href="/drawer"
              className="bg-white rounded-2xl border border-gray-100 p-3 hover:border-primary/30 transition-colors text-center"
            >
              <span className="block mb-1"><Icon name="bottle" size={20} /></span>
              <span className="text-[11px] font-semibold text-gray-800 block">내 서랍</span>
              <p className="text-[9px] text-gray-400 mt-0.5">제품 관리</p>
            </Link>
          </div>
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

  /* ── 오늘의 캘린더 정보 (레티놀 Day / 각질케어 Day / 기본) ── */
  const [todaySchedule, setTodaySchedule] = useState<{
    pmIcon: string;
    pmLabel: string;
    isRetinolDay: boolean;
    isExfoliateDay: boolean;
  } | null>(null);

  /* ── 다이어리 상태 ── */
  const [todayCondition, setTodayCondition] = useState<string | null>(null);
  const [diaryMemo, setDiaryMemo] = useState("");
  const [diarySaved, setDiarySaved] = useState(false);

  /* ── 연속 체크 카운트 ── */
  const [streak, setStreak] = useState(0);

  /* ── 챌린지 진행 상태 ── */
  const [challengeActive, setChallengeActive] = useState(false);
  const [challengeDay, setChallengeDay] = useState(0);
  const [challengeCompleted, setChallengeCompleted] = useState(0);

  /* ── 날씨 기반 루틴 TIP ── */
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherTips, setWeatherTips] = useState<WeatherTip[]>([]);

  /* ── 최근 피드 ── */
  const [recentPosts, setRecentPosts] = useState<RoutinePost[]>([]);

  // Load saved checklist & diary from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

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

        // Load 7-day calendar schedule for today
        const calendarData = parsed.calendar as Array<{
          day: string;
          isRetinolDay: boolean;
          isExfoliateDay: boolean;
          pmIcon: string;
          pmLabel: string;
        }> | undefined;
        if (calendarData && calendarData.length === 7) {
          // Calendar is 월(0)~일(6), JS getDay() is 일(0)~토(6)
          // Map: JS 일(0)→cal 6, 월(1)→cal 0, 화(2)→cal 1, ...
          const jsDay = today.getDay();
          const calIndex = jsDay === 0 ? 6 : jsDay - 1;
          setTodaySchedule(calendarData[calIndex]);
        }
      } catch {
        // ignore
      }
    }
    setRoutineLoaded(true);

    // Load challenge state
    try {
      const challengeData = localStorage.getItem("barda_challenge");
      if (challengeData) {
        const parsed = JSON.parse(challengeData);
        const startDate = new Date(parsed.startDate);
        const daysSince = Math.floor((Date.now() - startDate.getTime()) / 86_400_000);
        if (daysSince < 7) {
          setChallengeActive(true);
          setChallengeDay(daysSince + 1);
          setChallengeCompleted(
            (parsed.completedDays as boolean[]).filter(Boolean).length
          );
        }
      }
    } catch { /* ignore */ }

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

    // Fetch weather data
    fetchWeather().then((data) => {
      if (data) {
        setWeather(data);
        // Get retinol/AHA info from saved routine
        try {
          const saved = localStorage.getItem("barda_last_routine");
          if (saved) {
            const parsed = JSON.parse(saved);
            setWeatherTips(generateWeatherTips(data, parsed.skinType, parsed.hasRetinol, parsed.hasAHA));
          } else {
            setWeatherTips(generateWeatherTips(data));
          }
        } catch {
          setWeatherTips(generateWeatherTips(data));
        }
      }
    });
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

  // Save diary + auto-update challenge
  const saveDiary = useCallback(() => {
    if (!todayCondition) return;
    const todayKey = new Date().toISOString().slice(0, 10);
    localStorage.setItem(
      `barda_diary_${todayKey}`,
      JSON.stringify({ condition: todayCondition, memo: diaryMemo })
    );
    setDiarySaved(true);

    // Auto-complete today's challenge day if active
    try {
      const challengeData = localStorage.getItem("barda_challenge");
      if (challengeData) {
        const parsed = JSON.parse(challengeData);
        const startDate = new Date(parsed.startDate);
        const daysSince = Math.floor((Date.now() - startDate.getTime()) / 86_400_000);
        if (daysSince >= 0 && daysSince < 7 && !parsed.completedDays[daysSince]) {
          parsed.completedDays[daysSince] = true;
          localStorage.setItem("barda_challenge", JSON.stringify(parsed));
          setChallengeCompleted((prev) => prev + 1);
        }
      }
    } catch { /* ignore */ }
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
          <div className="flex items-center gap-1">
            <NotificationBell />
            <span className="text-xs text-gray-500 hidden sm:inline">
              {user?.email?.split("@")[0]}
            </span>
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
              <span className="text-xs font-semibold text-am-deep flex items-center gap-1">
                <Icon name="fire" size={14} /> {streak}일 연속
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

        {/* 날씨 기반 루틴 TIP (고도화) */}
        {weather && weatherTips.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon name={weather.icon} size={16} />
                <span className="text-sm font-semibold text-gray-800">오늘의 날씨 TIP</span>
              </div>
              <span className="text-xs text-gray-400">
                {weather.temperature}°C · {weather.description}
              </span>
            </div>
            {/* Weather summary badges */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                습도 {weather.humidity}%
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                weather.uvIndex >= 6 ? "bg-red-50 text-red-600" :
                weather.uvIndex >= 3 ? "bg-amber-50 text-amber-600" :
                "bg-green-50 text-green-600"
              }`}>
                UV {weather.uvIndex}
              </span>
              {weather.pm25 !== null && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  weather.pm25 > 35 ? "bg-red-50 text-red-600" :
                  weather.pm25 > 15 ? "bg-amber-50 text-amber-600" :
                  "bg-green-50 text-green-600"
                }`}>
                  PM2.5 {weather.pm25}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {weatherTips.slice(0, 4).map((tip, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 px-3 py-2 rounded-xl ${
                    tip.priority === "high"
                      ? "bg-red-50/60"
                      : tip.priority === "medium"
                      ? "bg-amber-50/60"
                      : "bg-gray-50"
                  }`}
                >
                  <span className="mt-0.5"><Icon name={tip.icon} size={16} /></span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-gray-700">{tip.title}</p>
                      {tip.timeTag && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                          tip.timeTag === "morning" ? "bg-amber-100 text-amber-700" :
                          tip.timeTag === "afternoon" ? "bg-orange-100 text-orange-700" :
                          "bg-indigo-100 text-indigo-700"
                        }`}>
                          {tip.timeTag === "morning" ? "아침" : tip.timeTag === "afternoon" ? "오후" : "저녁"}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7일 날씨 예보 */}
        {weather?.dailyForecast && weather.dailyForecast.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="calendar" size={16} />
              <span className="text-sm font-semibold text-gray-800">7일 날씨 예보</span>
              <span className="text-[10px] text-gray-400 ml-auto">루틴 가이드 포함</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
              {weather.dailyForecast.map((day: DailyForecast, i: number) => {
                const isToday = i === 0;
                const adviceColor =
                  day.routineAdvice === "gentle_only" ? "bg-red-100 text-red-600" :
                  day.routineAdvice === "retinol_caution" ? "bg-amber-100 text-amber-600" :
                  day.routineAdvice === "retinol_ok" ? "bg-green-100 text-green-600" :
                  day.routineAdvice === "exfoliate_ok" ? "bg-blue-100 text-blue-600" :
                  "bg-gray-100 text-gray-500";
                const adviceLabel =
                  day.routineAdvice === "gentle_only" ? "저자극" :
                  day.routineAdvice === "retinol_caution" ? "레티놀주의" :
                  day.routineAdvice === "retinol_ok" ? "레티놀OK" :
                  day.routineAdvice === "exfoliate_ok" ? "각질OK" :
                  "일반";
                return (
                  <div
                    key={day.date}
                    className={`flex flex-col items-center min-w-[4.2rem] py-2 px-1.5 rounded-xl transition-colors ${
                      isToday ? "bg-primary/10 ring-1 ring-primary/30" : "bg-gray-50"
                    }`}
                  >
                    <span className={`text-[10px] font-semibold ${isToday ? "text-primary" : "text-gray-500"}`}>
                      {isToday ? "오늘" : `${day.dayLabel}요일`}
                    </span>
                    <span className="my-0.5"><Icon name={day.icon} size={20} /></span>
                    <div className="flex items-center gap-0.5 text-[10px]">
                      <span className="text-blue-500 font-medium">{day.tempMin}°</span>
                      <span className="text-gray-300">/</span>
                      <span className="text-red-400 font-medium">{day.tempMax}°</span>
                    </div>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full mt-1 font-medium ${
                      day.uvMax >= 6 ? "bg-red-50 text-red-500" :
                      day.uvMax >= 3 ? "bg-amber-50 text-amber-500" :
                      "bg-green-50 text-green-500"
                    }`}>
                      UV {day.uvMax}
                    </span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full mt-0.5 font-medium ${adviceColor}`}>
                      {adviceLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 체크리스트 없으면 분석 유도 */}
        {routineLoaded && !hasRoutine && (
          <section className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 text-center">
            <div className="mb-3"><Icon name="bottle" size={30} /></div>
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

        {/* 아침 루틴 체크리스트 */}
        {hasRoutine && checklist.am.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name="sun" size={16} />
                <span className="text-sm font-semibold text-gray-800">아침 루틴</span>
              </div>
              <div className="flex items-center gap-2">
                {todaySchedule && (todaySchedule.isRetinolDay || todaySchedule.isExfoliateDay) && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">
                    선크림 필수
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  {amDone}/{amTotal}
                </span>
              </div>
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

        {/* 저녁 루틴 체크리스트 */}
        {hasRoutine && checklist.pm.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name={todaySchedule?.pmIcon ?? "moon"} size={16} />
                <span className="text-sm font-semibold text-gray-800">저녁 루틴</span>
                {todaySchedule && todaySchedule.pmLabel !== "기본 루틴" && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    todaySchedule.isRetinolDay
                      ? "bg-purple-50 text-purple-600"
                      : "bg-blue-50 text-blue-600"
                  }`}>
                    오늘은 {todaySchedule.pmLabel} Day
                  </span>
                )}
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

        {/* 오늘 피부 컨디션 */}
        <section className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="memo" size={16} />
            <span className="text-sm font-semibold text-gray-800">오늘 피부 컨디션</span>
            {diarySaved && (
              <span className="text-[10px] text-success font-medium bg-green-50 px-2 py-0.5 rounded-full">저장됨</span>
            )}
            {diarySaved && challengeActive && (
              <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">챌린지 Day {challengeDay} 완료!</span>
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
                <Icon name={opt.icon} size={22} />
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

        {/* 스킨케어 도구 모음 */}
        <section className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-800">스킨케어 도구</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Link
              href="/drawer"
              className="bg-white rounded-2xl border border-gray-100 p-3 hover:border-primary/30 transition-colors"
            >
              <span className="block mb-1"><Icon name="bottle" size={20} /></span>
              <span className="text-[11px] font-semibold text-gray-800 block">내 서랍</span>
              <p className="text-[9px] text-gray-400 leading-relaxed mt-0.5">제품 관리</p>
            </Link>
            <Link
              href="/dupe"
              className="bg-white rounded-2xl border border-gray-100 p-3 hover:border-primary/30 transition-colors"
            >
              <span className="block mb-1"><Icon name="search" size={20} /></span>
              <span className="text-[11px] font-semibold text-gray-800 block">듀프 파인더</span>
              <p className="text-[9px] text-gray-400 leading-relaxed mt-0.5">대안 제품</p>
            </Link>
            <Link
              href="/ranking"
              className="bg-white rounded-2xl border border-gray-100 p-3 hover:border-primary/30 transition-colors"
            >
              <span className="block mb-1"><Icon name="medal" size={20} /></span>
              <span className="text-[11px] font-semibold text-gray-800 block">인기 랭킹</span>
              <p className="text-[9px] text-gray-400 leading-relaxed mt-0.5">TOP 10</p>
            </Link>
            <Link
              href="/scanner"
              className="bg-white rounded-2xl border border-gray-100 p-3 hover:border-primary/30 transition-colors"
            >
              <span className="block mb-1"><Icon name="camera" size={20} /></span>
              <span className="text-[11px] font-semibold text-gray-800 block">바코드 스캐너</span>
              <p className="text-[9px] text-gray-400 leading-relaxed mt-0.5">제품 스캔</p>
            </Link>
            <Link
              href="/ingredient-analysis"
              className="bg-white rounded-2xl border border-gray-100 p-3 hover:border-primary/30 transition-colors"
            >
              <span className="block mb-1"><Icon name="dna" size={20} /></span>
              <span className="text-[11px] font-semibold text-gray-800 block">성분 분석</span>
              <p className="text-[9px] text-gray-400 leading-relaxed mt-0.5">AI 분석</p>
            </Link>
            <Link
              href="/challenge"
              className="bg-white rounded-2xl border border-gray-100 p-3 hover:border-primary/30 transition-colors"
            >
              <span className="block mb-1"><Icon name="trophy" size={20} /></span>
              <span className="text-[11px] font-semibold text-gray-800 block">챌린지</span>
              <p className="text-[9px] text-gray-400 leading-relaxed mt-0.5">7일 미션</p>
            </Link>
          </div>
        </section>

        {/* 챌린지 진행 배너 (진행 중일 때만 표시) */}
        {challengeActive && (
          <section className="mb-4">
            <Link
              href="/challenge"
              className="block bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200/50 p-4"
            >
              <div className="flex items-center gap-3">
                <Icon name="trophy" size={24} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">7일 스킨케어 챌린지</p>
                  <div className="mt-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${(challengeCompleted / 7) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-amber-600">
                        Day {challengeDay} · {challengeCompleted}/7
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      피부 컨디션 기록하면 오늘 미션 자동 완료!
                    </p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </Link>
          </section>
        )}

        {/* 최근 피드 */}
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
