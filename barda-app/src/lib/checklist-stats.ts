/**
 * Checklist Adherence Statistics
 *
 * Reads localStorage checklist data and computes weekly/monthly compliance rates.
 */

import { STORAGE_KEYS } from "@/lib/constants";

/* ─── Types ─── */

export interface ChecklistStats {
  /** Weekly completion rates for last 4 weeks (0~100, newest first) */
  weeklyRates: number[];
  /** AM completion rate this month (0~100) */
  amRate: number;
  /** PM completion rate this month (0~100) */
  pmRate: number;
  /** Overall completion rate this month (0~100) */
  monthlyRate: number;
  /** Current streak (consecutive days) */
  currentStreak: number;
  /** Best streak recorded */
  bestStreak: number;
  /** Total days with any check data */
  totalDays: number;
}

/* ─── Helpers ─── */

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

interface DayData {
  am: boolean[];
  pm: boolean[];
}

function loadDayData(date: string): DayData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.checks(date));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isDayComplete(data: DayData): boolean {
  const amDone = data.am.length > 0 && data.am.some(Boolean);
  const pmDone = data.pm.length > 0 && data.pm.some(Boolean);
  return amDone || pmDone;
}

function dayCompletionRate(data: DayData): { am: number; pm: number } {
  const amTotal = data.am.length || 1;
  const pmTotal = data.pm.length || 1;
  const amDone = data.am.filter(Boolean).length;
  const pmDone = data.pm.filter(Boolean).length;
  return {
    am: (amDone / amTotal) * 100,
    pm: (pmDone / pmTotal) * 100,
  };
}

/* ─── Main ─── */

export function calculateChecklistStats(): ChecklistStats {
  if (typeof window === "undefined") {
    return { weeklyRates: [0, 0, 0, 0], amRate: 0, pmRate: 0, monthlyRate: 0, currentStreak: 0, bestStreak: 0, totalDays: 0 };
  }

  const today = new Date();
  const allData: { date: string; data: DayData }[] = [];

  // Collect last 30 days of data
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = formatDate(d);
    const data = loadDayData(key);
    if (data) {
      allData.push({ date: key, data });
    }
  }

  // Weekly rates (4 weeks, 7 days each)
  const weeklyRates: number[] = [];
  for (let w = 0; w < 4; w++) {
    let completeDays = 0;
    let totalDays = 0;
    for (let d = 0; d < 7; d++) {
      const idx = w * 7 + d;
      const date = new Date(today);
      date.setDate(date.getDate() - idx);
      const key = formatDate(date);
      const data = loadDayData(key);
      totalDays++;
      if (data && isDayComplete(data)) completeDays++;
    }
    weeklyRates.push(totalDays > 0 ? Math.round((completeDays / totalDays) * 100) : 0);
  }

  // AM/PM rates (this month)
  let amSum = 0;
  let pmSum = 0;
  let amCount = 0;
  let pmCount = 0;
  for (const { data } of allData) {
    const rates = dayCompletionRate(data);
    if (data.am.length > 0) { amSum += rates.am; amCount++; }
    if (data.pm.length > 0) { pmSum += rates.pm; pmCount++; }
  }

  // Streak
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const data = loadDayData(formatDate(d));
    if (data && isDayComplete(data)) {
      tempStreak++;
      if (i < 30) currentStreak = tempStreak; // only count from today backwards for "current"
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      if (i === 0) {
        // Today might not be checked yet, continue
        continue;
      }
      if (currentStreak === 0) currentStreak = tempStreak;
      tempStreak = 0;
    }
  }
  bestStreak = Math.max(bestStreak, tempStreak);

  return {
    weeklyRates,
    amRate: amCount > 0 ? Math.round(amSum / amCount) : 0,
    pmRate: pmCount > 0 ? Math.round(pmSum / pmCount) : 0,
    monthlyRate: allData.length > 0 ? Math.round((allData.filter(({ data }) => isDayComplete(data)).length / 30) * 100) : 0,
    currentStreak,
    bestStreak,
    totalDays: allData.length,
  };
}
