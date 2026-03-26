/**
 * Ingredient Repository — Dual-read layer
 *
 * Tries Supabase DB first, falls back to in-memory INGREDIENT_DB.
 */

import type { IngredientInfo } from "@/data/ingredients";
import { INGREDIENT_DB } from "@/data/ingredients";
import { createClient } from "@/lib/supabase/client";

/* ─── Types ─── */

interface DBIngredient {
  name_ko: string;
  name_en: string | null;
  category: string;
  safety_score: number | null;
  efficacy: string | null;
  caution: string | null;
  skin_types: string[] | null;
}

interface DBInteraction {
  interaction_type: string;
  partner: { name_ko: string };
}

/* ─── Cache ─── */

let cachedDB: Record<string, IngredientInfo> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

function isCacheValid(): boolean {
  return cachedDB !== null && Date.now() - cacheTimestamp < CACHE_TTL_MS;
}

/* ─── Public API ─── */

/**
 * Get the full ingredient database. DB first → in-memory fallback.
 */
export async function getIngredientDB(): Promise<Record<string, IngredientInfo>> {
  if (isCacheValid()) return cachedDB!;

  try {
    const supabase = createClient();
    if (!supabase) return INGREDIENT_DB;

    const { data: ingredients, error } = await supabase
      .from("ingredients")
      .select("name_ko, name_en, category, safety_score, efficacy, caution, skin_types");

    if (error || !ingredients || ingredients.length === 0) {
      return INGREDIENT_DB;
    }

    // Fetch interactions
    const { data: interactions } = await supabase
      .from("ingredient_interactions")
      .select("ingredient_a_id, ingredient_b_id, interaction_type, a:ingredient_a_id(name_ko), b:ingredient_b_id(name_ko)");

    // Build interaction maps
    const synergyMap: Record<string, string[]> = {};
    const conflictMap: Record<string, string[]> = {};

    if (interactions) {
      for (const row of interactions) {
        const r = row as Record<string, unknown>;
        const a = (r.a as { name_ko: string })?.name_ko;
        const b = (r.b as { name_ko: string })?.name_ko;
        const type = r.interaction_type as string;

        if (!a || !b) continue;

        const map = type === "synergy" ? synergyMap : conflictMap;
        if (!map[a]) map[a] = [];
        if (!map[b]) map[b] = [];
        map[a].push(b);
        map[b].push(a);
      }
    }

    // Build the result
    const result: Record<string, IngredientInfo> = {};
    for (const row of ingredients as DBIngredient[]) {
      result[row.name_ko] = {
        name: row.name_ko,
        nameEn: row.name_en ?? "",
        category: row.category as IngredientInfo["category"],
        safetyScore: row.safety_score ?? 3,
        efficacy: row.efficacy ?? "",
        caution: row.caution ?? "",
        goodWith: synergyMap[row.name_ko] ?? [],
        avoidWith: conflictMap[row.name_ko] ?? [],
        skinTypes: row.skin_types ?? [],
      };
    }

    cachedDB = result;
    cacheTimestamp = Date.now();
    return cachedDB;
  } catch {
    return INGREDIENT_DB;
  }
}

/**
 * Get ingredient DB synchronously (in-memory only).
 */
export function getIngredientDBSync(): Record<string, IngredientInfo> {
  return cachedDB ?? INGREDIENT_DB;
}

/**
 * Invalidate cache.
 */
export function invalidateIngredientCache(): void {
  cachedDB = null;
  cacheTimestamp = 0;
}
