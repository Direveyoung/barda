/**
 * Badge / Achievement System
 *
 * Evaluates badge milestones from localStorage data (streak, diary, drawer, analysis).
 * Pure functions + localStorage persistence.
 */

import { STORAGE_KEYS, BADGE_DEFINITIONS } from "@/lib/constants";
import type { BadgeDefinition } from "@/lib/constants";

/* ─── Types ─── */

export interface EarnedBadge {
  id: string;
  earnedAt: string; // ISO date
}

export interface BadgeState {
  earnedBadges: EarnedBadge[];
  maxStreak: number;
}

export interface BadgeContext {
  currentStreak: number;
  diaryCount: number;
  drawerCount: number;
  hasAnalysis: boolean;
  bestScore: number;
}

/* ─── Persistence ─── */

export function loadBadgeState(): BadgeState {
  if (typeof window === "undefined") return { earnedBadges: [], maxStreak: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BADGES);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { earnedBadges: [], maxStreak: 0 };
}

export function saveBadgeState(state: BadgeState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(state));
  } catch { /* ignore */ }
}

/* ─── Badge Evaluation ─── */

function isEarned(badge: BadgeDefinition, ctx: BadgeContext): boolean {
  switch (badge.id) {
    case "streak_3":
    case "streak_7":
    case "streak_14":
    case "streak_30":
      return ctx.currentStreak >= (badge.threshold ?? 0);
    case "first_analysis":
      return ctx.hasAnalysis;
    case "score_90":
      return ctx.bestScore >= (badge.threshold ?? 90);
    case "diary_7":
    case "diary_30":
      return ctx.diaryCount >= (badge.threshold ?? 0);
    case "drawer_10":
      return ctx.drawerCount >= (badge.threshold ?? 0);
    default:
      return false;
  }
}

/**
 * Evaluate badges and return newly earned ones.
 * Updates maxStreak in state.
 */
export function evaluateBadges(
  ctx: BadgeContext,
  state: BadgeState
): { newBadges: BadgeDefinition[]; updatedState: BadgeState } {
  const earnedIds = new Set(state.earnedBadges.map((b) => b.id));
  const newBadges: BadgeDefinition[] = [];
  const now = new Date().toISOString();

  const updatedState: BadgeState = {
    ...state,
    maxStreak: Math.max(state.maxStreak, ctx.currentStreak),
  };

  for (const badge of BADGE_DEFINITIONS) {
    if (earnedIds.has(badge.id)) continue;
    if (isEarned(badge, ctx)) {
      newBadges.push(badge);
      updatedState.earnedBadges = [
        ...updatedState.earnedBadges,
        { id: badge.id, earnedAt: now },
      ];
    }
  }

  return { newBadges, updatedState };
}

/**
 * Build badge context from localStorage data (synchronous).
 */
export function buildBadgeContext(): BadgeContext {
  if (typeof window === "undefined") {
    return { currentStreak: 0, diaryCount: 0, drawerCount: 0, hasAnalysis: false, bestScore: 0 };
  }

  // Single pass: streak + diary count in one loop
  let currentStreak = 0;
  let streakBroken = false;
  let diaryCount = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);

    // Streak (only until first gap after day 0)
    if (!streakBroken) {
      const data = localStorage.getItem(STORAGE_KEYS.checks(key));
      if (data) {
        currentStreak++;
      } else if (i > 0) {
        streakBroken = true;
      }
    }

    // Diary count
    if (localStorage.getItem(STORAGE_KEYS.diary(key))) {
      diaryCount++;
    }
  }

  // Drawer count
  let drawerCount = 0;
  try {
    const drawer = localStorage.getItem(STORAGE_KEYS.DRAWER);
    if (drawer) {
      drawerCount = JSON.parse(drawer).length ?? 0;
    }
  } catch { /* ignore */ }

  // Analysis
  let hasAnalysis = false;
  let bestScore = 0;
  try {
    const routine = localStorage.getItem(STORAGE_KEYS.LAST_ROUTINE);
    if (routine) {
      hasAnalysis = true;
      bestScore = JSON.parse(routine).score ?? 0;
    }
  } catch { /* ignore */ }

  return { currentStreak, diaryCount, drawerCount, hasAnalysis, bestScore };
}
