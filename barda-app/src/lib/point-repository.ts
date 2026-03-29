/**
 * Point Repository — Dual-read layer
 *
 * 포인트 적립/조회/사용 로직.
 * 서버사이드: Supabase RPC (atomic Postgres 함수) — API route에서 호출
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

/** Supabase client (browser or server) — accepts both createBrowserClient and createServerClient */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClientLike = { from: (...args: any[]) => any; rpc: (...args: any[]) => any };

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

/* ─── Server-side: Earn Points (atomic RPC) ─── */

export async function earnPoints(
  userId: string,
  actionType: PointActionType,
  referenceId?: string,
  externalClient?: SupabaseClientLike,
): Promise<EarnResult> {
  const config = POINT_ACTIONS[actionType];
  if (!config) {
    return { earned: 0, newBalance: 0, dailyEarned: 0, reason: "알 수 없는 액션" };
  }

  try {
    const supabase = externalClient ?? createClient();
    if (!supabase) {
      return { earned: 0, newBalance: 0, dailyEarned: 0, reason: "DB 미연결" };
    }

    const today = new Date().toISOString().slice(0, 10);
    const refId = referenceId ?? `${actionType}:${today}`;

    // 1. 일일 한도 체크 (RPC 호출 전 pre-check)
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

    // 2. 일일 캡 체크 (streak_bonus 제외)
    if (actionType !== "streak_bonus") {
      const { data: allToday } = await supabase
        .from("point_transactions")
        .select("points")
        .eq("user_id", userId)
        .eq("reference_date", today)
        .gt("points", 0);

      const dailyTotal = (allToday ?? []).reduce((sum: number, r: { points: number }) => sum + r.points, 0);
      if (dailyTotal >= POINT_DAILY_CAP) {
        return { earned: 0, newBalance: 0, dailyEarned: dailyTotal, reason: "일일 캡 도달" };
      }
    }

    // 3. Atomic RPC: 트랜잭션 삽입 + user_points upsert + 스트릭 계산 (단일 호출)
    const { data: rpcResult, error: rpcError } = await supabase.rpc("earn_points", {
      p_user_id: userId,
      p_action: actionType,
      p_points: config.points,
      p_reference_id: refId,
      p_reference_date: today,
    });

    if (rpcError) {
      return { earned: 0, newBalance: 0, dailyEarned: 0, reason: rpcError.message };
    }

    const result = rpcResult as {
      earned: number;
      new_balance: number;
      daily_earned: number;
      current_streak: number;
      longest_streak: number;
      reason?: string;
    };

    // 멱등성: 이미 적립된 경우
    if (result.earned === 0) {
      return { earned: 0, newBalance: 0, dailyEarned: 0, reason: result.reason ?? "이미 적립됨" };
    }

    // 4. 30일 스트릭 보너스 자동 지급
    let newBalance = result.new_balance;
    if (
      result.current_streak > 0 &&
      result.current_streak % 30 === 0 &&
      actionType !== "streak_bonus"
    ) {
      const bonusResult = await earnPoints(
        userId,
        "streak_bonus",
        `streak_bonus:${today}:${result.current_streak}`,
        externalClient,
      );
      if (bonusResult.earned > 0) {
        newBalance += bonusResult.earned;
      }
    }

    return {
      earned: result.earned,
      newBalance: newBalance,
      dailyEarned: result.daily_earned,
    };
  } catch {
    return { earned: 0, newBalance: 0, dailyEarned: 0, reason: "서버 오류" };
  }
}

/* ─── Server-side: Redeem Points (atomic RPC) ─── */

export async function redeemPoints(
  userId: string,
  amount: number,
  description: string,
  externalClient?: SupabaseClientLike,
): Promise<{ success: boolean; newBalance?: number; reason?: string }> {
  try {
    const supabase = externalClient ?? createClient();
    if (!supabase) return { success: false, reason: "DB 미연결" };

    // Atomic RPC: SELECT FOR UPDATE + 잔액 차감 + 트랜잭션 기록 (단일 호출)
    const { data: rpcResult, error: rpcError } = await supabase.rpc("redeem_points", {
      p_user_id: userId,
      p_amount: amount,
      p_description: description,
    });

    if (rpcError) {
      return { success: false, reason: rpcError.message };
    }

    const result = rpcResult as { success: boolean; new_balance?: number; reason?: string };

    if (!result.success) {
      return { success: false, reason: result.reason ?? "잔액 부족" };
    }

    return { success: true, newBalance: result.new_balance };
  } catch {
    return { success: false, reason: "서버 오류" };
  }
}

/* ─── Helpers ─── */

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
