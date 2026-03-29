/**
 * Product Similarity — reusable logic for dupe finder & repurchase recommendations.
 */

import { ALL_PRODUCTS, type Product } from "@/data/products";
import { getBrandPriceTier, getEstimatedPrice } from "@/data/brand-tiers";

/* ─── Types ─── */

export interface SimilarProduct {
  product: Product;
  similarity: number;          // 0–100
  matchedIngredients: string[];
  priceRange: { min: number; max: number };
}

/* ─── Helpers ─── */

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

/* ─── Core ─── */

/**
 * Find products similar to `target` within the same category.
 * Returns up to `limit` results sorted by similarity descending.
 */
export function findSimilarProducts(
  target: Product,
  limit = 5,
  minSimilarity = 20,
): SimilarProduct[] {
  const tIngredients = (target.key_ingredients ?? []).map(normalize);
  if (tIngredients.length === 0) return [];

  const results: SimilarProduct[] = [];

  for (const product of ALL_PRODUCTS) {
    if (product.id === target.id) continue;
    if (product.categoryId !== target.categoryId) continue;

    const pIngredients = (product.key_ingredients ?? []).map(normalize);
    if (pIngredients.length === 0) continue;

    // Ingredient overlap
    const matched: string[] = [];
    for (const tIng of tIngredients) {
      for (let j = 0; j < pIngredients.length; j++) {
        const pIng = pIngredients[j];
        if (tIng === pIng || tIng.includes(pIng) || pIng.includes(tIng)) {
          matched.push(product.key_ingredients?.[j] ?? pIng);
          break;
        }
      }
    }
    if (matched.length === 0) continue;

    const overlapRatio = matched.length / Math.max(tIngredients.length, pIngredients.length);

    // Tag overlap
    const tTags = new Set(target.tags ?? []);
    const pTags = product.tags ?? [];
    let tagOverlap = 0;
    for (const t of pTags) { if (tTags.has(t)) tagOverlap++; }
    const tagScore = tTags.size > 0 ? tagOverlap / tTags.size : 0;

    const similarity = Math.round(overlapRatio * 70 + tagScore * 30);
    if (similarity < minSimilarity) continue;

    const tier = getBrandPriceTier(product.brand);
    results.push({
      product,
      similarity,
      matchedIngredients: matched,
      priceRange: getEstimatedPrice(tier, product.categoryId),
    });
  }

  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, limit);
}
