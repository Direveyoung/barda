/**
 * BARDA DB Seed Generator
 *
 * Reads in-memory data from src/data/*.ts and generates SQL INSERT statements
 * for brands, products, ingredients, and ingredient_interactions tables.
 *
 * Usage: npx tsx supabase/seed/generate-seed.ts > supabase/seed/seed.sql
 */

import { ALL_PRODUCTS } from "../../src/data/products";
import { INGREDIENT_DB } from "../../src/data/ingredients";
import { BRAND_ALIASES } from "../../src/data/aliases";

/* ─── Helpers ─── */

function esc(s: string): string {
  return s.replace(/'/g, "''");
}

function arrLiteral(arr: string[]): string {
  if (!arr || arr.length === 0) return "'{}'";
  return `'{${arr.map((v) => `"${esc(v)}"`).join(",")}}'`;
}

function nullOrStr(val: string | undefined): string {
  return val ? `'${esc(val)}'` : "NULL";
}

function nullOrNum(val: number | undefined): string {
  return val !== undefined ? String(val) : "NULL";
}

function nullOrBool(val: boolean | undefined): string {
  return val !== undefined ? String(val) : "NULL";
}

/* ─── 1. Brands ─── */

const brandNames = [...new Set(ALL_PRODUCTS.map((p) => p.brand))].sort();

// Build brand → aliases map from BRAND_ALIASES (reverse: alias → canonical)
const brandAliasMap: Record<string, string[]> = {};
for (const [alias, canonical] of Object.entries(BRAND_ALIASES)) {
  if (!brandAliasMap[canonical]) brandAliasMap[canonical] = [];
  brandAliasMap[canonical].push(alias);
}

// Guess country and price tier from brand name
function guessBrandMeta(brand: string): { country: string; priceTier: string } {
  const premium = ["SK-II", "설화수", "헤라", "후", "랑콤", "에스티로더"];
  const luxury = ["라메르"];
  const global = [
    "세라비", "바이오더마", "라로슈포제", "디오디너리", "오바지",
    "멜라노CC", "스킨아쿠아", "키엘", "클리니크", "에스티로더", "랑콤",
    "SK-II", "Tatcha", "Drunk Elephant", "Paula's Choice",
    "Sunday Riley", "Glow Recipe", "Murad", "Supergoop",
  ];

  const isGlobal = global.some((g) => brand.includes(g));
  const isLuxury = luxury.some((l) => brand.includes(l));
  const isPremium = premium.some((p) => brand.includes(p));

  return {
    country: isGlobal ? "글로벌" : "한국",
    priceTier: isLuxury ? "luxury" : isPremium ? "premium" : isGlobal ? "midrange" : "midrange",
  };
}

const lines: string[] = [];

lines.push("-- ============================================================");
lines.push("-- BARDA Seed Data (auto-generated)");
lines.push(`-- Generated: ${new Date().toISOString()}`);
lines.push(`-- Brands: ${brandNames.length}, Products: ${ALL_PRODUCTS.length}, Ingredients: ${Object.keys(INGREDIENT_DB).length}`);
lines.push("-- ============================================================");
lines.push("");
lines.push("BEGIN;");
lines.push("");

// Insert brands
lines.push("-- ── Brands ──");
for (const brand of brandNames) {
  const { country, priceTier } = guessBrandMeta(brand);
  const aliases = brandAliasMap[brand] ?? [];
  lines.push(
    `INSERT INTO brands (name_ko, country, price_tier, aliases) VALUES ('${esc(brand)}', '${country}', '${priceTier}', ${arrLiteral(aliases)}) ON CONFLICT (name_ko) DO NOTHING;`,
  );
}

lines.push("");

/* ─── 2. Products ─── */

lines.push("-- ── Products ──");
lines.push("-- Uses CTE to resolve brand_id from brand name");
lines.push("");

for (const p of ALL_PRODUCTS) {
  lines.push(
    `INSERT INTO products (legacy_id, brand_id, brand_name, name, category_id, active_flags, concentration_level, key_ingredients, tags, source, verified)` +
      ` VALUES ('${esc(p.id)}', (SELECT id FROM brands WHERE name_ko = '${esc(p.brand)}'), '${esc(p.brand)}', '${esc(p.name)}', '${esc(p.categoryId)}', ${arrLiteral(p.active_flags ?? [])}, ${nullOrStr(p.concentration_level)}, ${arrLiteral(p.key_ingredients ?? [])}, ${arrLiteral(p.tags ?? [])}, ${nullOrStr(p.source)}, ${nullOrBool(p.verified)})` +
      ` ON CONFLICT (legacy_id) DO NOTHING;`,
  );
}

lines.push("");

/* ─── 3. Ingredients ─── */

lines.push("-- ── Ingredients ──");

for (const [key, info] of Object.entries(INGREDIENT_DB)) {
  lines.push(
    `INSERT INTO ingredients (name_ko, name_en, category, safety_score, efficacy, caution, skin_types)` +
      ` VALUES ('${esc(key)}', '${esc(info.nameEn)}', '${esc(info.category)}', ${nullOrNum(info.safetyScore)}, '${esc(info.efficacy)}', '${esc(info.caution)}', ${arrLiteral(info.skinTypes)})` +
      ` ON CONFLICT (name_ko) DO NOTHING;`,
  );
}

lines.push("");

/* ─── 4. Ingredient Interactions ─── */

lines.push("-- ── Ingredient Interactions (synergy + conflict) ──");

const processedPairs = new Set<string>();

for (const [key, info] of Object.entries(INGREDIENT_DB)) {
  // goodWith → synergy
  for (const partner of info.goodWith) {
    const pairKey = [key, partner].sort().join("|");
    if (processedPairs.has(pairKey)) continue;
    processedPairs.add(pairKey);

    lines.push(
      `INSERT INTO ingredient_interactions (ingredient_a_id, ingredient_b_id, interaction_type)` +
        ` VALUES ((SELECT id FROM ingredients WHERE name_ko = '${esc(key)}'), (SELECT id FROM ingredients WHERE name_ko = '${esc(partner)}'), 'synergy')` +
        ` ON CONFLICT (ingredient_a_id, ingredient_b_id) DO NOTHING;`,
    );
  }

  // avoidWith → conflict
  for (const partner of info.avoidWith) {
    const pairKey = [key, partner].sort().join("|");
    if (processedPairs.has(pairKey)) continue;
    processedPairs.add(pairKey);

    lines.push(
      `INSERT INTO ingredient_interactions (ingredient_a_id, ingredient_b_id, interaction_type)` +
        ` VALUES ((SELECT id FROM ingredients WHERE name_ko = '${esc(key)}'), (SELECT id FROM ingredients WHERE name_ko = '${esc(partner)}'), 'conflict')` +
        ` ON CONFLICT (ingredient_a_id, ingredient_b_id) DO NOTHING;`,
    );
  }
}

lines.push("");
lines.push("COMMIT;");
lines.push("");

// Output
process.stdout.write(lines.join("\n"));
