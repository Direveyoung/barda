/**
 * Point Repository — Dual-read layer
 *
 * 포인트 적립/조회/사용 로직.
 * 서버사이드: Supabase 직접 조작 (API route에서 호출)
 * 클라이언트: localStorage 캐시 + API 호출
 */

import { createClient } from "@/lib/supabase/client";
import {
  POINT_ACTIONS,
  POINT_DAILY_CAP,
  STORAGE_KEYS,
  type PointActionType,
} from "@/lib/constants";
import type {
  PointBalanceResponse,
  PointTransactionItem,
  PointHistoryResponse,
} from "@/lib/api-types";

/* ─── Types ─── */

export interface EarnResult {
  earned: number;
  newBalance: number;
  dailyEarned: number;
  reason?: string;
}

/* ─── Client-side: Balance ─── */

export async function getBalance(userId: string): Promise<PointBalanceResponse> {
  const empty: PointBalanceResponse = {
    balance: 0,
    lifetimeEarned: 0,
    lifetimeRedeemed: 0,
    dailyEarned: 0,
    dailyRemaining: POINT_DAILY_CAP,
    currentStreak: 0,
    longestStreak: 0,
  };

  try {
    const supabase = createClient();
    if (!supabase) return loadBalanceFromStorage() ?? empty;

    const { data: row } = await supabase
      .from("user_points")
      .select("balance, lifetime_earned, lifetime_redeemed, current_streak_days, longest_streak_days")
      .eq("user_id", userId)
      .single();

    const today = new Date().toISOString().slice(0, 10);
    const { data: txRows } = await supabase
      .from("point_transactions")
      .select("points")
      .eq("user_id", userId)
      .eq("reference_date", today)
      .gt("points", 0);

    const dailyEarned = (txRows ?? []).reduce((sum, r) => sum + r.points, 0);

    const result: PointBalanceResponse = {
      balance: row?.balance ?? 0,
      lifetimeEarned: row?.lifetime_earned ?? 0,
      lifetimeRedeemed: row?.lifetime_redeemed ?? 0,
      dailyEarned,
      dailyRemaining: Math.max(0, POINT_DAILY_CAP - dailyEarned),
      currentStreak: row?.current_streak_days ?? 0,
      longestStreak: row?.longest_streak_days ?? 0,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.POINTS_BALANCE, JSON.stringify(result));
    }

    return result;
  } catch {
    return loadBalanceFromStorage() ?? empty;
  }
}

function loadBalanceFromStorage(): PointBalanceResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POINTS_BALANCE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/* ─── Client-side: History ─── */

export async function getHistory(
  userId: string,
  page = 1,
  limit = 20,
): Promise<PointHistoryResponse> {
  const empty: PointHistoryResponse = { transactions: [], total: 0, page, limit };

  try {
    const supabase = createClient();
    if (!supabase) return empty;

    const from = (page - 1) * limit;

    const { data, count } = await supabase
      .from("point_transactions")
      .select("id, action, points, reference_id, created_at, metadata", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    const transactions: PointTransactionItem[] = (data ?? []).map((row) => ({
      id: row.id,
      action: row.action,
      points: row.points,
      referenceId: row.reference_id,
      description: getActionLabel(row.action),
      createdAt: row.created_at,
    }));

    return { transactions, total: count ?? 0, page, limit };
  } catch {
    return empty;
  }
}

/* ─── Server-side: Earn Points ─── */

export async function earnPoints(
  userId: string,
  actionType: PointActionType,
  referenceId?: string,
): Promise<EarnResult> {
  const config = POINT_ACTIONS[actionType];
  if (!config) {
    return { earned: 0, newBalance: 0, dailyEarned: 0, reason: "알 수 없는 액션" };
  }

  try {
    const supabase = createClient();
    if (!supabase) {
      return { earned: 0, newBalance: 0, dailyEarned: 0, reason: "DB 미연결" };
    }

    const today = new Date().toISOString().slice(0, 10);
    const refId = referenceId ?? `${actionType}:${today}`;

    // 1. 오늘 해당 액션 횟수 체크 (일일 한도)
    const { data: todayActions } = await supabase
      .from("point_transactions")
      .select("id")
      .eq("user_id", userId)
      .eq("action", actionType)
      .eq("reference_date", today)
      .gt("points", 0);

    if ((todayActions?.length ?? 0) >= config.dailyLimit) {
      return { earned: 0, newBalance: 0, dailyEarned: 0, reason: "일일 한도 초과" };
    }

    // 2. 전체 일일 적립 합산 (일일 캡 체크) — streak_bonus는 캡 제외
    if (actionType !== "streak_bonus") {
      const { data: allToday } = await supabase
        .from("point_transactions")
        .select("points")
        .eq("user_id", userId)
        .eq("reference_date", today)
        .gt("points", 0);

      const dailyTotal = (allToday ?? [])
        .filter((r) => r.points > 0)
        .reduce((sum, r) => sum + r.points, 0);

      if (dailyTotal >= POINT_DAILY_CAP) {
        return { earned: 0, newBalance: 0, dailyEarned: dailyTotal, reason: "일일 캡 도달" };
      }
    }

    // 3. 트랜잭션 삽입 (멱등성: unique index가 중복 방지)
    const { error: insertError } = await supabase
      .from("point_transactions")
      .insert({
        user_id: userId,
        action: actionType,
        points: config.points,
        reference_id: refId,
        reference_date: today,
      });

    if (insertError) {
      // 유니크 제약 위반 = 이미 적립됨
      if (insertError.code === "23505") {
        return { earned: 0, newBalance: 0, dailyEarned: 0, reason: "이미 적립됨" };
      }
      return { earned: 0, newBalance: 0, dailyEarned: 0, reason: insertError.message };
    }

    // 4. user_points 업데이트 (upsert + atomic increment)
    const { data: existing } = await supabase
      .from("user_points")
      .select("balance, lifetime_earned, current_streak_days, longest_streak_days, last_earn_date")
      .eq("user_id", userId)
      .single();

    let newBalance: number;
    let newStreak: number;
    let longestStreak: number;

    if (existing) {
      newBalance = existing.balance + config.points;
      const streakInfo = calculateStreak(
        existing.last_earn_date,
        existing.current_streak_days,
        existing.longest_streak_days,
        today,
      );
      newStreak = streakInfo.current;
      longestStreak = streakInfo.longest;

      await supabase
        .from("user_points")
        .update({
          balance: newBalance,
          lifetime_earned: existing.lifetime_earned + config.points,
          current_streak_days: newStreak,
          longest_streak_days: longestStreak,
          last_earn_date: today,
        })
        .eq("user_id", userId);
    } else {
      newBalance = config.points;
      newStreak = 1;
      longestStreak = 1;

      await supabase
        .from("user_points")
        .insert({
          user_id: userId,
          balance: config.points,
          lifetime_earned: config.points,
          current_streak_days: 1,
          longest_streak_days: 1,
          last_earn_date: today,
        });
    }

    // 5. 30일 스트릭 보너스 자동 지급
    if (newStreak > 0 && newStreak % 30 === 0 && actionType !== "streak_bonus") {
      const bonusResult = await earnPoints(userId, "streak_bonus", `streak_bonus:${today}:${newStreak}`);
      if (bonusResult.earned > 0) {
        newBalance += bonusResult.earned;
      }
    }

    // 일일 적립 합산 재계산
    const { data: finalToday } = await supabase
      .from("point_transactions")
      .select("points")
      .eq("user_id", userId)
      .eq("reference_date", today)
      .gt("points", 0);

    const finalDailyEarned = (finalToday ?? []).reduce((sum, r) => sum + r.points, 0);

    return { earned: config.points, newBalance, dailyEarned: finalDailyEarned };
  } catch {
    return { earned: 0, newBalance: 0, dailyEarned: 0, reason: "서버 오류" };
  }
}

/* ─── Server-side: Redeem Points ─── */

export async function redeemPoints(
  userId: string,
  amount: number,
  description: string,
): Promise<{ success: boolean; newBalance?: number; reason?: string }> {
  try {
    const supabase = createClient();
    if (!supabase) return { success: false, reason: "DB 미연결" };

    const { data: row } = await supabase
      .from("user_points")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (!row || row.balance < amount) {
      return { success: false, reason: "잔액 부족" };
    }

    const today = new Date().toISOString().slice(0, 10);

    await supabase
      .from("point_transactions")
      .insert({
        user_id: userId,
        action: "redeem",
        points: -amount,
        reference_id: `redeem:${today}:${Date.now()}`,
        reference_date: today,
        metadata: { description },
      });

    const newBalance = row.balance - amount;
    await supabase
      .from("user_points")
      .update({
        balance: newBalance,
        lifetime_redeemed: row.balance - newBalance + amount, // approximate
      })
      .eq("user_id", userId);

    return { success: true, newBalance };
  } catch {
    return { success: false, reason: "서버 오류" };
  }
}

/* ─── Helpers ─── */

function calculateStreak(
  lastEarnDate: string | null,
  currentStreak: number,
  longestStreak: number,
  today: string,
): { current: number; longest: number } {
  if (!lastEarnDate) return { current: 1, longest: Math.max(1, longestStreak) };

  const last = new Date(lastEarnDate);
  const now = new Date(today);
  const diffMs = now.getTime() - last.getTime();
  const diffDays = Math.round(diffMs / 86_400_000);

  if (diffDays === 0) {
    // 같은 날 → 스트릭 유지
    return { current: currentStreak, longest: longestStreak };
  }
  if (diffDays === 1) {
    // 연속 → 스트릭 증가
    const newStreak = currentStreak + 1;
    return { current: newStreak, longest: Math.max(newStreak, longestStreak) };
  }
  // 끊김 → 리셋
  return { current: 1, longest: Math.max(1, longestStreak) };
}

function getActionLabel(action: string): string {
  const config = POINT_ACTIONS[action as PointActionType];
  if (config) return config.label;
  if (action === "redeem") return "포인트 사용";
  return action;
}

/* ─── Client Helper: Fire-and-forget ─── */

export function earnPointsClient(
  action: string,
  referenceId?: string,
  onSuccess?: (earned: number) => void,
): void {
  fetch("/api/points", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, reference_id: referenceId }),
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data?.earned > 0 && onSuccess) onSuccess(data.earned);
    })
    .catch(() => {
      /* 포인트 적립 실패가 앱을 깨뜨리면 안 됨 */
    });
}
