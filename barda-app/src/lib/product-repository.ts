/**
 * Product Repository — Dual-read layer
 *
 * Tries Supabase DB first, falls back to in-memory data.
 * Consumers call these functions instead of importing ALL_PRODUCTS directly.
 */

import type { Product } from "@/data/products";
import { ALL_PRODUCTS } from "@/data/products";
import { createClient } from "@/lib/supabase/client";

/* ─── Types ─── */

interface DBProduct {
  legacy_id: string;
  brand_name: string;
  name: string;
  category_id: string;
  active_flags: string[] | null;
  concentration_level: string | null;
  key_ingredients: string[] | null;
  tags: string[] | null;
  source: string | null;
  verified: boolean | null;
}

/* ─── Converters ─── */

function dbToProduct(row: DBProduct): Product {
  return {
    id: row.legacy_id,
    brand: row.brand_name,
    name: row.name,
    categoryId: row.category_id,
    active_flags: row.active_flags ?? undefined,
    concentration_level: (row.concentration_level as Product["concentration_level"]) ?? undefined,
    key_ingredients: row.key_ingredients ?? undefined,
    tags: row.tags ?? undefined,
    source: row.source ?? undefined,
    verified: row.verified ?? undefined,
  };
}

/* ─── Cache ─── */

let cachedProducts: Product[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5분

function isCacheValid(): boolean {
  return cachedProducts !== null && Date.now() - cacheTimestamp < CACHE_TTL_MS;
}

/* ─── Public API ─── */

/**
 * Get all products. DB first → in-memory fallback.
 * Results are cached for 5 minutes.
 */
export async function getAllProducts(): Promise<Product[]> {
  if (isCacheValid()) return cachedProducts!;

  try {
    const supabase = createClient();
    if (!supabase) return ALL_PRODUCTS;

    const { data, error } = await supabase
      .from("products")
      .select("legacy_id, brand_name, name, category_id, active_flags, concentration_level, key_ingredients, tags, source, verified")
      .eq("is_active", true)
      .order("brand_name")
      .order("name");

    if (error || !data || data.length === 0) {
      return ALL_PRODUCTS;
    }

    cachedProducts = (data as DBProduct[]).map(dbToProduct);
    cacheTimestamp = Date.now();
    return cachedProducts;
  } catch {
    return ALL_PRODUCTS;
  }
}

/**
 * Get products synchronously (in-memory only).
 * Use this for SSR or when async is not possible.
 */
export function getAllProductsSync(): Product[] {
  return cachedProducts ?? ALL_PRODUCTS;
}

/**
 * Search products by query. Uses cached/in-memory data with the existing search engine.
 */
export async function searchProductsFromDB(
  query: string,
  maxResults = 8,
): Promise<Product[]> {
  const { searchProducts } = await import("@/lib/search");
  const products = await getAllProducts();
  return searchProducts(query, products, maxResults);
}

/**
 * Find a product by legacy ID.
 */
export async function findProductById(id: string): Promise<Product | undefined> {
  const products = await getAllProducts();
  return products.find((p) => p.id === id);
}

/**
 * Invalidate the product cache (e.g., after admin edits).
 */
export function invalidateProductCache(): void {
  cachedProducts = null;
  cacheTimestamp = 0;
}
