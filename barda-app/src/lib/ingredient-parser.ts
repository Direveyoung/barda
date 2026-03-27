/**
 * Ingredient Text Parser
 *
 * Parses full ingredient text (전성분) into individual ingredient names.
 * Attempts to match each against the known INGREDIENT_DB.
 */

import { INGREDIENT_DB } from "@/data/ingredients";

/**
 * Tokenize full ingredient text into individual ingredient names.
 * Handles comma, semicolon, and slash separators. Trims whitespace and parentheticals.
 */
export function parseIngredientText(text: string): string[] {
  if (!text.trim()) return [];

  return text
    .split(/[,;/|]/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0 && token.length < 100)
    .map((token) => {
      // Remove trailing parenthetical notes like "(정제수)" or "(CI 77891)"
      return token.replace(/\s*\([^)]*\)\s*$/, "").trim();
    })
    .filter((token) => token.length > 0);
}

interface MatchResult {
  parsed: string[];
  matched: string[];
  unmatched: string[];
  matchRate: number;
}

/**
 * Parse ingredient text and match against INGREDIENT_DB.
 * Returns parsed tokens, matched/unmatched lists, and match rate.
 */
export function matchIngredients(text: string): MatchResult {
  const parsed = parseIngredientText(text);
  if (parsed.length === 0) {
    return { parsed: [], matched: [], unmatched: [], matchRate: 0 };
  }

  const dbKeys = new Set(Object.keys(INGREDIENT_DB));
  const dbEnNames = new Map<string, string>();
  for (const [key, info] of Object.entries(INGREDIENT_DB)) {
    if (info.nameEn) {
      dbEnNames.set(info.nameEn.toLowerCase(), key);
    }
  }

  const matched: string[] = [];
  const unmatched: string[] = [];

  for (const token of parsed) {
    const lower = token.toLowerCase();

    // Try exact Korean match
    if (dbKeys.has(token)) {
      matched.push(token);
      continue;
    }

    // Try English name match (case-insensitive)
    let found = false;
    for (const [enName, koKey] of dbEnNames) {
      if (lower.includes(enName) || enName.includes(lower)) {
        matched.push(koKey);
        found = true;
        break;
      }
    }

    if (!found) {
      // Try partial Korean match
      const partialMatch = [...dbKeys].find(
        (key) => token.includes(key) || key.includes(token),
      );
      if (partialMatch) {
        matched.push(partialMatch);
      } else {
        unmatched.push(token);
      }
    }
  }

  const uniqueMatched = [...new Set(matched)];
  return {
    parsed,
    matched: uniqueMatched,
    unmatched,
    matchRate: parsed.length > 0 ? uniqueMatched.length / parsed.length : 0,
  };
}
