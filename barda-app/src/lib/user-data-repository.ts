/**
 * User Data Repository — Dual-read layer
 *
 * Persists user data (profile, diary, checklist, drawer, challenge, sensitivities)
 * to Supabase DB first, falls back to localStorage.
 * On save: writes to both DB and localStorage for offline resilience.
 */

import { createClient } from "@/lib/supabase/client";
import { STORAGE_KEYS } from "@/lib/constants";

/* ─── Types ─── */

export interface ProfileData {
  nickname: string;
  skinType: string;
  concerns: string[];
  kakaoNickname?: string;
}

export interface DiaryEntry {
  condition: string;
  memo: string;
}

export interface DrawerItem {
  productId: string;
  brand: string;
  name: string;
  categoryId: string;
  openedDate: string | null;
  status: "unopened" | "using" | "finished";
  addedAt: string;
}

export interface ChallengeState {
  startDate: string;
  completedDays: boolean[];
  presetId?: string;
  duration?: number;
}

export interface IngredientSensitivity {
  ingredientName: string;
  severity: "mild" | "moderate" | "severe";
  reactionNote?: string;
}

/* ─── Profile ─── */

export async function saveProfile(userId: string, data: ProfileData): Promise<void> {
  // Always save to localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data));
  }

  try {
    const supabase = createClient();
    if (!supabase) return;

    await supabase.from("user_profiles").upsert({
      user_id: userId,
      nickname: data.nickname,
      skin_type: data.skinType,
      concerns: data.concerns,
      kakao_nickname: data.kakaoNickname ?? null,
      onboarding_complete: true,
    });
  } catch {
    // DB failed, localStorage is the fallback
  }
}

export async function loadProfile(userId: string): Promise<ProfileData | null> {
  try {
    const supabase = createClient();
    if (supabase) {
      const { data } = await supabase
        .from("user_profiles")
        .select("nickname, skin_type, concerns, kakao_nickname")
        .eq("user_id", userId)
        .single();

      if (data) {
        const profile: ProfileData = {
          nickname: data.nickname ?? "",
          skinType: data.skin_type ?? "",
          concerns: data.concerns ?? [],
          kakaoNickname: data.kakao_nickname ?? undefined,
        };
        // Sync to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
        }
        return profile;
      }
    }
  } catch {
    // Fall through to localStorage
  }

  // Fallback: localStorage
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/* ─── Diary ─── */

export async function saveDiary(userId: string, date: string, entry: DiaryEntry): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.diary(date), JSON.stringify(entry));
  }

  try {
    const supabase = createClient();
    if (!supabase) return;

    await supabase.from("user_skin_diary").upsert({
      user_id: userId,
      date,
      condition: entry.condition,
      memo: entry.memo,
    });
  } catch {
    // localStorage fallback
  }
}

export async function loadDiary(userId: string, date: string): Promise<DiaryEntry | null> {
  try {
    const supabase = createClient();
    if (supabase) {
      const { data } = await supabase
        .from("user_skin_diary")
        .select("condition, memo")
        .eq("user_id", userId)
        .eq("date", date)
        .single();

      if (data) {
        const entry: DiaryEntry = { condition: data.condition, memo: data.memo ?? "" };
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.diary(date), JSON.stringify(entry));
        }
        return entry;
      }
    }
  } catch {
    // Fall through
  }

  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.diary(date));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function loadDiaryRange(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<Record<string, DiaryEntry>> {
  const result: Record<string, DiaryEntry> = {};

  try {
    const supabase = createClient();
    if (supabase) {
      const { data } = await supabase
        .from("user_skin_diary")
        .select("date, condition, memo")
        .eq("user_id", userId)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date");

      if (data && data.length > 0) {
        for (const row of data) {
          const entry: DiaryEntry = { condition: row.condition, memo: row.memo ?? "" };
          result[row.date] = entry;
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEYS.diary(row.date), JSON.stringify(entry));
          }
        }
        return result;
      }
    }
  } catch {
    // Fall through to localStorage
  }

  // Fallback: iterate date range in localStorage
  if (typeof window !== "undefined") {
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.diary(key));
        if (raw) result[key] = JSON.parse(raw);
      } catch { /* ignore */ }
    }
  }

  return result;
}

/* ─── Checklist ─── */

export async function saveChecklist(
  userId: string,
  date: string,
  amChecks: boolean[],
  pmChecks: boolean[],
): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.checks(date), JSON.stringify({ am: amChecks, pm: pmChecks }));
  }

  try {
    const supabase = createClient();
    if (!supabase) return;

    await supabase.from("user_checklist_logs").upsert({
      user_id: userId,
      date,
      am_checks: amChecks,
      pm_checks: pmChecks,
    });
  } catch {
    // localStorage fallback
  }
}

/* ─── Drawer ─── */

export async function saveDrawerItems(userId: string, items: DrawerItem[]): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.DRAWER, JSON.stringify(items));
  }

  try {
    const supabase = createClient();
    if (!supabase) return;

    // Delete all then re-insert (simpler than diff)
    await supabase.from("user_drawer_items").delete().eq("user_id", userId);

    if (items.length > 0) {
      await supabase.from("user_drawer_items").insert(
        items.map((item) => ({
          user_id: userId,
          product_id: item.productId,
          brand: item.brand,
          name: item.name,
          category_id: item.categoryId,
          opened_date: item.openedDate,
          status: item.status,
          added_at: item.addedAt,
        })),
      );
    }
  } catch {
    // localStorage fallback
  }
}

export async function loadDrawerItems(userId: string): Promise<DrawerItem[]> {
  try {
    const supabase = createClient();
    if (supabase) {
      const { data } = await supabase
        .from("user_drawer_items")
        .select("product_id, brand, name, category_id, opened_date, status, added_at")
        .eq("user_id", userId)
        .order("added_at", { ascending: false });

      if (data && data.length > 0) {
        const items: DrawerItem[] = data.map((row) => ({
          productId: row.product_id,
          brand: row.brand,
          name: row.name,
          categoryId: row.category_id,
          openedDate: row.opened_date,
          status: row.status,
          addedAt: row.added_at,
        }));
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.DRAWER, JSON.stringify(items));
        }
        return items;
      }
    }
  } catch {
    // Fall through
  }

  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DRAWER);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/* ─── Challenge ─── */

export async function saveChallenge(userId: string, state: ChallengeState): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.CHALLENGE, JSON.stringify(state));
  }

  try {
    const supabase = createClient();
    if (!supabase) return;

    const isComplete = state.completedDays.every(Boolean);
    await supabase.from("user_challenges").upsert({
      user_id: userId,
      start_date: state.startDate,
      completed_days: state.completedDays,
      is_complete: isComplete,
    });
  } catch {
    // localStorage fallback
  }
}

export async function loadChallenge(userId: string): Promise<ChallengeState | null> {
  try {
    const supabase = createClient();
    if (supabase) {
      const { data } = await supabase
        .from("user_challenges")
        .select("start_date, completed_days")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        const state: ChallengeState = {
          startDate: data.start_date,
          completedDays: data.completed_days,
        };
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.CHALLENGE, JSON.stringify(state));
        }
        return state;
      }
    }
  } catch {
    // Fall through
  }

  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHALLENGE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/* ─── Ingredient Sensitivities (Dual-read: Supabase → localStorage) ─── */

function loadSensitivitiesLocal(): IngredientSensitivity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SENSITIVITIES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSensitivitiesLocal(items: IngredientSensitivity[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.SENSITIVITIES, JSON.stringify(items));
  } catch { /* ignore */ }
}

export async function saveSensitivity(userId: string, sensitivity: IngredientSensitivity): Promise<void> {
  // Always save to localStorage
  const current = loadSensitivitiesLocal();
  const idx = current.findIndex((s) => s.ingredientName === sensitivity.ingredientName);
  if (idx >= 0) {
    current[idx] = sensitivity;
  } else {
    current.push(sensitivity);
  }
  saveSensitivitiesLocal(current);

  // Also try Supabase
  try {
    const supabase = createClient();
    if (!supabase) return;

    await supabase.from("user_ingredient_sensitivities").upsert({
      user_id: userId,
      ingredient_name: sensitivity.ingredientName,
      severity: sensitivity.severity,
      reaction_note: sensitivity.reactionNote ?? null,
    });
  } catch {
    // localStorage already saved — OK
  }
}

export async function loadSensitivities(userId: string): Promise<IngredientSensitivity[]> {
  // Try Supabase first
  try {
    const supabase = createClient();
    if (supabase) {
      const { data } = await supabase
        .from("user_ingredient_sensitivities")
        .select("ingredient_name, severity, reaction_note")
        .eq("user_id", userId);

      if (data && data.length > 0) {
        const items = data.map((row) => ({
          ingredientName: row.ingredient_name as string,
          severity: row.severity as IngredientSensitivity["severity"],
          reactionNote: (row.reaction_note as string | null) ?? undefined,
        }));
        // Sync to localStorage
        saveSensitivitiesLocal(items);
        return items;
      }
    }
  } catch {
    // Fall through to localStorage
  }

  // Fallback: localStorage
  return loadSensitivitiesLocal();
}

/** Synchronous load from localStorage only (for analysis engine) */
export function loadSensitivitiesSync(): IngredientSensitivity[] {
  return loadSensitivitiesLocal();
}

export async function deleteSensitivity(userId: string, ingredientName: string): Promise<void> {
  // Always remove from localStorage
  const current = loadSensitivitiesLocal();
  saveSensitivitiesLocal(current.filter((s) => s.ingredientName !== ingredientName));

  // Also try Supabase
  try {
    const supabase = createClient();
    if (!supabase) return;

    await supabase
      .from("user_ingredient_sensitivities")
      .delete()
      .eq("user_id", userId)
      .eq("ingredient_name", ingredientName);
  } catch {
    // localStorage already updated — OK
  }
}
