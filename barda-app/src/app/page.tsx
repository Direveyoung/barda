"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import NotificationBell from "@/components/NotificationBell";
import RoutinePostCard, { type RoutinePost } from "@/components/RoutinePostCard";
import Icon from "@/components/Icon";
import { fetchWeather, generateWeatherTips, type WeatherData, type WeatherTip, type DailyForecast } from "@/lib/weather";
import { DAY_NAMES_KO, STORAGE_KEYS, PAGINATION, UI_TIMING } from "@/lib/constants";
import { saveDiary, loadDiary, saveChecklist, saveChallenge, loadChallenge } from "@/lib/user-data-repository";
import { earnPointsClient } from "@/lib/point-repository";
import PointToast from "@/components/PointToast";

/* ─── 요일 이름 ─── */
const DAY_NAMES = DAY_NAMES_KO;

/* ─── 피부 컨디션 옵션 ─── */
const conditionOptions = [
  { icon: "face-happy", label: "좋음", value: "good" },
  { icon: "face-good", label: "보통", value: "normal" },
  { icon: "face-neutral", label: "그저그럭", value: "meh" },
  { icon: "face-worried", label: "별로", value: "bad" },
  { icon: "face-bad", label: "나쁨", value: "terrible" },
];

/* ─── 배너 슬라이드 데이터 ─── */
const BANNERS = [
  { id: 1, gradient: "from-primary/90 to-rose-400/90", title: "내 루틴 무료 분석", subtitle: "성분 충돌 + AM/PM 순서 + 7일 캘린더", cta: "지금 분석하기", href: "/analyze" },
  { id: 2, gradient: "from-violet-500/90 to-indigo-500/90", title: "듀프 파인더", subtitle: "비싼 화장품의 저렴한 대안을 찾아보세요", cta: "대안 찾기", href: "/dupe" },
  { id: 3, gradient: "from-emerald-500/90 to-teal-500/90", title: "성분 가이드 30종", subtitle: "스킨케어 핵심 성분을 한눈에", cta: "가이드 보기", href: "/guide" },
];

/* ─── 인기 카테고리 ─── */
const POPULAR_CATEGORIES = [
  { icon: "drop", label: "토너", href: "/guide" },
  { icon: "bottle", label: "세럼", href: "/guide" },
  { icon: "jar", label: "크림", href: "/guide" },
  { icon: "bubble", label: "클렌저", href: "/guide" },
  { icon: "lightning", label: "앰플", href: "/guide" },
  { icon: "shield", label: "선크림", href: "/guide" },
  { icon: "eye", label: "아이크림", href: "/guide" },
  { icon: "mask", label: "마스크", href: "/guide" },
];

/* ────────────────────────────────────────────────
   비로그인 랜딩 페이지 (화해/파우더룸 스타일)
   ──────────────────────────────────────────────── */
function LandingHome() {
  const [feedPosts, setFeedPosts] = useState<RoutinePost[]>([]);
  const [totalAnalysis, setTotalAnalysis] = useState(0);
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    fetch(`/api/routines?sort=latest&page=1&limit=${PAGINATION.LANDING_FEED}`)
      .then((r) => r.json())
      .then((json) => {
        setFeedPosts(json.posts ?? []);
        setTotalAnalysis(json.totalCount ?? 0);
      })
      .catch(() => {});
  }, []);

  // Auto-rotate banner
  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % BANNERS.length);
    }, UI_TIMING.BANNER_ROTATE);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen pb-16 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-primary">BARDA</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
            >
              로그인
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto">
        {/* Hero Banner Carousel */}
        <section className="px-4 pt-4">
          <div className="relative overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${bannerIndex * 100}%)` }}
            >
              {BANNERS.map((banner) => (
                <Link
                  key={banner.id}
                  href={banner.href}
                  className={`w-full shrink-0 bg-gradient-to-r ${banner.gradient} p-6 pb-7`}
                >
                  <p className="text-white/80 text-xs font-medium mb-1">BARDA</p>
                  <h2 className="text-white text-lg font-bold mb-1">{banner.title}</h2>
                  <p className="text-white/70 text-xs mb-4">{banner.subtitle}</p>
                  <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-xl">
                    {banner.cta} →
                  </span>
                </Link>
              ))}
            </div>
            {/* Banner indicators */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
              {BANNERS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setBannerIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === bannerIndex ? "bg-white w-4" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Quick Menu — 4+4 Grid */}
        <section className="px-4 pt-5">
          <div className="grid grid-cols-4 gap-y-4">
            {POPULAR_CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:border-primary/30 group-hover:shadow-md transition-all">
                  <Icon name={cat.icon} size={22} />
                </div>
                <span className="text-xs text-gray-600 font-medium">{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="h-2 bg-gray-100/80 mt-5" />

        {/* 핵심 기능 — 횡스크롤 카드 */}
        <section className="pt-5 pb-2">
          <div className="px-4 flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-gray-900">루틴 분석</h3>
            <Link href="/analyze" className="text-xs text-primary font-medium">자세히 →</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-3 scrollbar-hide">
            {[
              { icon: "microscope", title: "성분 충돌 분석", desc: "위험한 조합을 자동으로 찾아드려요", color: "bg-rose-50 text-rose-600" },
              { icon: "sun", title: "AM/PM 루틴 순서", desc: "시간대별 최적의 바르는 순서 제안", color: "bg-amber-50 text-amber-600" },
              { icon: "calendar", title: "7일 캘린더", desc: "요일별 자동 루틴 배치", color: "bg-blue-50 text-blue-600" },
            ].map((feat) => (
              <Link
                key={feat.title}
                href="/analyze"
                className="shrink-0 w-40 bg-white rounded-2xl border border-gray-100 p-3.5 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className={`w-9 h-9 rounded-xl ${feat.color} flex items-center justify-center mb-3`}>
                  <Icon name={feat.icon} size={18} />
                </div>
                <p className="text-sm font-bold text-gray-800 mb-1">{feat.title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{feat.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 통계 배너 */}
        {totalAnalysis > 0 && (
          <section className="px-4 pb-4">
            <div className="bg-gradient-to-r from-primary-bg to-rose-50 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon name="chart" size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">
                  {totalAnalysis.toLocaleString()}개 루틴 분석 완료
                </p>
                <p className="text-xs text-gray-400">바르다 유저들이 함께 만든 데이터</p>
              </div>
            </div>
          </section>
        )}

        {/* Divider */}
        <div className="h-2 bg-gray-100/80" />

        {/* 스킨케어 도구 모음 */}
        <section className="px-4 pt-5 pb-3">
          <h3 className="text-[15px] font-bold text-gray-900 mb-3">스킨케어 도구</h3>
          <div className="space-y-2">
            {[
              { icon: "dna", title: "AI 성분 분석", desc: "제품의 성분 안전도를 분석해요", href: "/ingredient-analysis", badge: "AI" },
              { icon: "cycle", title: "듀프 파인더", desc: "비슷한 성분의 저렴한 대안 제품 찾기", href: "/dupe", badge: "NEW" },
              { icon: "camera", title: "바코드 스캐너", desc: "바코드를 스캔하면 제품 정보가 바로!", href: "/scanner", badge: null },
              { icon: "bottle", title: "내 서랍", desc: "보유한 제품을 등록하고 관리해요", href: "/drawer", badge: null },
              { icon: "book", title: "성분 가이드", desc: "스킨케어 핵심 성분 30종 사전", href: "/guide", badge: null },
            ].map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="flex items-center gap-3.5 bg-white rounded-2xl border border-gray-100 p-3.5 hover:border-primary/30 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <Icon name={tool.icon} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-gray-800">{tool.title}</p>
                    {tool.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        tool.badge === "AI" ? "bg-violet-100 text-violet-600" : "bg-primary-bg text-primary"
                      }`}>
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{tool.desc}</p>
                </div>
                <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="h-2 bg-gray-100/80" />

        {/* 커뮤니티 미리보기 */}
        <section className="px-4 pt-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-gray-900">커뮤니티</h3>
            <Link href="/feed" className="text-xs text-primary font-medium">전체 보기 →</Link>
          </div>
          {feedPosts.length > 0 ? (
            <div className="space-y-2.5">
              {feedPosts.map((post) => (
                <RoutinePostCard key={post.id} post={post} onLike={() => {}} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <Icon name="comment-bubble" size={28} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">아직 공유된 루틴이 없어요</p>
              <p className="text-xs text-gray-300 mt-1">첫 번째로 루틴을 공유해 보세요!</p>
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="h-2 bg-gray-100/80" />

        {/* 랭킹 미리보기 */}
        <section className="px-4 pt-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-gray-900">인기 랭킹</h3>
            <Link href="/ranking" className="text-xs text-primary font-medium">전체 보기 →</Link>
          </div>
          <Link
            href="/ranking"
            className="block bg-gradient-to-r from-amber-50 to-yellow-50/50 rounded-2xl border border-amber-100/50 p-4 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-1">
                <Icon name="gold-medal" size={28} />
                <Icon name="silver-medal" size={24} className="opacity-80" />
                <Icon name="bronze-medal" size={22} className="opacity-60" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">루틴 랭킹 TOP 10</p>
                <p className="text-xs text-gray-400 mt-0.5">가장 인기 있는 루틴을 확인해 보세요</p>
              </div>
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </Link>
        </section>

        {/* CTA 배너 */}
        <section className="px-4 pt-3 pb-8">
          <div className="bg-gray-900 rounded-2xl p-6 text-center">
            <p className="text-white/60 text-xs mb-1">500+ 제품 DB</p>
            <p className="text-white text-base font-bold mb-2">
              지금 바로 내 루틴을 체크해 보세요
            </p>
            <p className="text-white/50 text-xs mb-4">
              무료 분석 · 성분 충돌 경고 · AM/PM 순서
            </p>
            <Link
              href="/analyze"
              className="inline-block px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-light transition-colors"
            >
              무료로 분석 시작하기
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-lg mx-auto px-4 pb-4 text-center">
        <p className="text-xs text-gray-400">
          BARDA는 일반적인 스킨케어 정보를 제공하며,<br />전문 의료 조언을 대체하지 않습니다.
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
  const { user } = useAuth();
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

  /* ── 포인트 토스트 ── */
  const [pointToast, setPointToast] = useState<{ points: number; label: string } | null>(null);

  /* ── 최근 피드 ── */
  const [recentPosts, setRecentPosts] = useState<RoutinePost[]>([]);

  const userId = user?.id ?? "anonymous";

  // Load saved checklist & diary
  useEffect(() => {
    if (typeof window === "undefined") return;

    const todayKey = today.toISOString().slice(0, 10);

    // Load last routine analysis result (session cache — stays in localStorage)
    const savedRoutine = localStorage.getItem(STORAGE_KEYS.LAST_ROUTINE);
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

        // Restore today's checked state from localStorage (fast)
        const savedChecks = localStorage.getItem(STORAGE_KEYS.checks(todayKey));
        if (savedChecks) {
          const checks = JSON.parse(savedChecks);
          amProducts.forEach((p: { name: string; checked: boolean }, i: number) => {
            if (checks.am?.[i]) p.checked = true;
          });
          pmProducts.forEach((p: { name: string; checked: boolean }, i: number) => {
            if (checks.pm?.[i]) p.checked = true;
          });
        }

        // Load 7-day calendar schedule for today
        const calendarData = parsed.calendar as Array<{
          day: string;
          isRetinolDay: boolean;
          isExfoliateDay: boolean;
          pmIcon: string;
          pmLabel: string;
        }> | undefined;
        let schedule: { day: string; isRetinolDay: boolean; isExfoliateDay: boolean; pmIcon: string; pmLabel: string } | null = null;
        if (calendarData && calendarData.length === 7) {
          const jsDay = today.getDay();
          const calIndex = jsDay === 0 ? 6 : jsDay - 1;
          schedule = calendarData[calIndex];
        }

        const cl = { am: amProducts, pm: pmProducts };
        queueMicrotask(() => {
          setChecklist(cl);
          setHasRoutine(true);
          if (schedule) setTodaySchedule(schedule);
        });
      } catch {
        // ignore
      }
    }
    queueMicrotask(() => setRoutineLoaded(true));

    // Load challenge state (dual-read)
    loadChallenge(userId).then((data) => {
      if (!data) return;
      const startDate = new Date(data.startDate);
      const daysSince = Math.floor((Date.now() - startDate.getTime()) / 86_400_000);
      if (daysSince < 7) {
        setChallengeActive(true);
        setChallengeDay(daysSince + 1);
        setChallengeCompleted(data.completedDays.filter(Boolean).length);
      }
    });

    // Load today's diary (dual-read)
    loadDiary(userId, todayKey).then((entry) => {
      if (!entry) return;
      setTodayCondition(entry.condition);
      setDiaryMemo(entry.memo);
      setDiarySaved(true);
    });

    // Calculate streak from localStorage (fast local check)
    let count = 0;
    const d = new Date(today);
    for (let i = 0; i < 30; i++) {
      const key = d.toISOString().slice(0, 10);
      const checks = localStorage.getItem(STORAGE_KEYS.checks(key));
      if (checks) {
        count++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    const streakCount = count;
    queueMicrotask(() => setStreak(streakCount));

    // Fetch recent feed
    fetch(`/api/routines?sort=latest&page=1&limit=${PAGINATION.LANDING_FEED}`)
      .then((r) => r.json())
      .then((json) => setRecentPosts(json.posts ?? []))
      .catch(() => {});

    // Fetch weather data
    fetchWeather().then((data) => {
      if (data) {
        setWeather(data);
        try {
          const saved = localStorage.getItem(STORAGE_KEYS.LAST_ROUTINE);
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
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

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

        // Save to DB + localStorage
        const todayKey = new Date().toISOString().slice(0, 10);
        const amChecks = updated.am.map((p) => p.checked);
        const pmChecks = updated.pm.map((p) => p.checked);
        saveChecklist(userId, todayKey, amChecks, pmChecks);

        // 포인트 적립: AM/PM 체크리스트 모두 완료 시
        if (amChecks.length > 0 && amChecks.every(Boolean)) {
          earnPointsClient("checkin_am", `checkin_am:${todayKey}`, (pts) =>
            setPointToast({ points: pts, label: "AM 루틴 완료" }),
          );
        }
        if (pmChecks.length > 0 && pmChecks.every(Boolean)) {
          earnPointsClient("checkin_pm", `checkin_pm:${todayKey}`, (pts) =>
            setPointToast({ points: pts, label: "PM 루틴 완료" }),
          );
        }

        return updated;
      });
    },
    [userId]
  );

  // Save diary + auto-update challenge
  const handleSaveDiary = useCallback(() => {
    if (!todayCondition) return;
    const todayKey = new Date().toISOString().slice(0, 10);
    saveDiary(userId, todayKey, { condition: todayCondition, memo: diaryMemo });
    setDiarySaved(true);

    // 포인트 적립: 다이어리 기록
    earnPointsClient("diary", `diary:${todayKey}`, (pts) =>
      setPointToast({ points: pts, label: "다이어리 기록" }),
    );

    // Auto-complete today's challenge day if active
    loadChallenge(userId).then((data) => {
      if (!data) return;
      const startDate = new Date(data.startDate);
      const daysSince = Math.floor((Date.now() - startDate.getTime()) / 86_400_000);
      if (daysSince >= 0 && daysSince < 7 && !data.completedDays[daysSince]) {
        data.completedDays[daysSince] = true;
        saveChallenge(userId, data);
        setChallengeCompleted((prev) => prev + 1);
      }
    });
  }, [todayCondition, diaryMemo, userId]);

  // Score for last analysis
  const lastScore = (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LAST_ROUTINE);
      if (saved) return JSON.parse(saved).score ?? null;
    } catch { /* ignore */ }
    return null;
  })();

  const amDone = checklist.am.filter((p) => p.checked).length;
  const pmDone = checklist.pm.filter((p) => p.checked).length;
  const amTotal = checklist.am.length;
  const pmTotal = checklist.pm.length;

  return (
    <div className="min-h-screen pb-16 overflow-x-hidden">
      {/* 포인트 토스트 */}
      {pointToast && (
        <PointToast
          points={pointToast.points}
          label={pointToast.label}
          onDismiss={() => setPointToast(null)}
        />
      )}

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
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                습도 {weather.humidity}%
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                weather.uvIndex >= 6 ? "bg-red-50 text-red-600" :
                weather.uvIndex >= 3 ? "bg-amber-50 text-amber-600" :
                "bg-green-50 text-green-600"
              }`}>
                UV {weather.uvIndex}
              </span>
              {weather.pm25 !== null && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
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
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{tip.description}</p>
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
              <span className="text-xs text-gray-400 ml-auto">루틴 가이드 포함</span>
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
                    <span className={`text-xs font-semibold ${isToday ? "text-primary" : "text-gray-500"}`}>
                      {isToday ? "오늘" : `${day.dayLabel}요일`}
                    </span>
                    <span className="my-0.5"><Icon name={day.icon} size={20} /></span>
                    <div className="flex items-center gap-0.5 text-xs">
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
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">
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
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
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
              <span className="text-xs text-success font-medium bg-green-50 px-2 py-0.5 rounded-full">저장됨</span>
            )}
            {diarySaved && challengeActive && (
              <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">챌린지 Day {challengeDay} 완료!</span>
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
                <span className="text-xs text-gray-500">{opt.label}</span>
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
              onClick={handleSaveDiary}
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
              <span className="text-xs font-semibold text-gray-800 block">내 서랍</span>
              <p className="text-[9px] text-gray-400 leading-relaxed mt-0.5">제품 관리</p>
            </Link>
            <Link
              href="/dupe"
              className="bg-white rounded-2xl border border-gray-100 p-3 hover:border-primary/30 transition-colors"
            >
              <span className="block mb-1"><Icon name="search" size={20} /></span>
              <span className="text-xs font-semibold text-gray-800 block">듀프 파인더</span>
              <p className="text-[9px] text-gray-400 leading-relaxed mt-0.5">대안 제품</p>
            </Link>
            <Link
              href="/ranking"
              className="bg-white rounded-2xl border border-gray-100 p-3 hover:border-primary/30 transition-colors"
            >
              <span className="block mb-1"><Icon name="medal" size={20} /></span>
              <span className="text-xs font-semibold text-gray-800 block">인기 랭킹</span>
              <p className="text-[9px] text-gray-400 leading-relaxed mt-0.5">TOP 10</p>
            </Link>
            <Link
              href="/scanner"
              className="bg-white rounded-2xl border border-gray-100 p-3 hover:border-primary/30 transition-colors"
            >
              <span className="block mb-1"><Icon name="camera" size={20} /></span>
              <span className="text-xs font-semibold text-gray-800 block">바코드 스캐너</span>
              <p className="text-[9px] text-gray-400 leading-relaxed mt-0.5">제품 스캔</p>
            </Link>
            <Link
              href="/ingredient-analysis"
              className="bg-white rounded-2xl border border-gray-100 p-3 hover:border-primary/30 transition-colors"
            >
              <span className="block mb-1"><Icon name="dna" size={20} /></span>
              <span className="text-xs font-semibold text-gray-800 block">성분 분석</span>
              <p className="text-[9px] text-gray-400 leading-relaxed mt-0.5">AI 분석</p>
            </Link>
            <Link
              href="/challenge"
              className="bg-white rounded-2xl border border-gray-100 p-3 hover:border-primary/30 transition-colors"
            >
              <span className="block mb-1"><Icon name="trophy" size={20} /></span>
              <span className="text-xs font-semibold text-gray-800 block">챌린지</span>
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
                      <span className="text-xs font-semibold text-amber-600">
                        Day {challengeDay} · {challengeCompleted}/7
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
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
