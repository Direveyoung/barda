import { Product } from '@/data/products';
import { BRAND_ALIASES, PRODUCT_ALIASES } from '@/data/aliases';
import { SEARCH_DEFAULTS } from '@/lib/constants';

/**
 * Normalize a string for comparison: collapse whitespace, remove spaces,
 * and lowercase ASCII characters. Korean characters are left as-is since
 * they have no case distinction.
 */
function normalize(str: string): string {
  return str
    .replace(/\s+/g, '')
    .replace(/[A-Za-z]/g, (ch) => ch.toLowerCase());
}

/**
 * Compute the Levenshtein edit-distance between two strings.
 * Uses a single-row DP approach which is O(min(m,n)) in space
 * and O(m*n) in time -- efficient enough for short search strings.
 */
function levenshtein(a: string, b: string): number {
  // Ensure a is the shorter string to minimize memory usage
  if (a.length > b.length) {
    [a, b] = [b, a];
  }

  const aLen = a.length;
  const bLen = b.length;

  // Early exits
  if (aLen === 0) return bLen;
  if (bLen === 0) return aLen;

  // Previous and current row of distances
  let prev = new Array<number>(aLen + 1);
  let curr = new Array<number>(aLen + 1);

  // Initialize the base row
  for (let i = 0; i <= aLen; i++) {
    prev[i] = i;
  }

  for (let j = 1; j <= bLen; j++) {
    curr[0] = j;

    for (let i = 1; i <= aLen; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[i] = Math.min(
        curr[i - 1] + 1,      // insertion
        prev[i] + 1,          // deletion
        prev[i - 1] + cost,   // substitution
      );
    }

    // Swap rows
    [prev, curr] = [curr, prev];
  }

  // Result is in prev because of the final swap
  return prev[aLen];
}

/**
 * Build a searchable string from a product by concatenating its
 * brand and name. Both fields are normalized.
 */
function productSearchText(product: Product): string {
  return normalize(`${product.brand} ${product.name}`);
}

// ---------------------------------------------------------------------------
// Stage 1: Exact substring match
// ---------------------------------------------------------------------------

/**
 * Returns products whose normalized brand+name contains the
 * normalized query as a substring.
 */
function exactMatch(query: string, products: Product[]): Product[] {
  const nQuery = normalize(query);
  if (nQuery.length === 0) return [];

  return products.filter((product) => {
    const text = productSearchText(product);
    return text.includes(nQuery);
  });
}

// ---------------------------------------------------------------------------
// Stage 2: Alias expansion
// ---------------------------------------------------------------------------

/**
 * Split a Korean/mixed query into meaningful tokens.
 * Splits on whitespace boundaries, then also attempts to match
 * known alias keys greedily against the full (space-collapsed) query.
 */
function expandAliases(query: string): string[] {
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  const expanded: string[] = [];

  for (const token of tokens) {
    const brandExpansion = BRAND_ALIASES[token];
    const productExpansion = PRODUCT_ALIASES[token];

    if (brandExpansion) {
      expanded.push(brandExpansion);
    } else if (productExpansion) {
      expanded.push(productExpansion);
    } else {
      expanded.push(token);
    }
  }

  return expanded;
}

/**
 * Expand aliases in the query, then run exact substring matching
 * with the expanded query.
 */
function aliasMatch(query: string, products: Product[]): Product[] {
  const expanded = expandAliases(query);
  const expandedQuery = expanded.join(' ');

  // If expansion didn't change anything, skip to avoid duplicating Stage 1
  if (normalize(expandedQuery) === normalize(query)) {
    return [];
  }

  return exactMatch(expandedQuery, products);
}

// ---------------------------------------------------------------------------
// Stage 3: Fuzzy match (Levenshtein)
// ---------------------------------------------------------------------------

/**
 * Find products where the Levenshtein distance between the normalized query
 * and any contiguous substring of the product's search text (of the same
 * length as the query +/- threshold) is within the threshold.
 *
 * For efficiency, we compare against the full normalized brand and name
 * individually rather than doing a sliding window, since queries and
 * target strings are both short in practice.
 */
function fuzzyMatch(
  query: string,
  products: Product[],
  threshold: number = SEARCH_DEFAULTS.FUZZY_THRESHOLD,
): Product[] {
  const nQuery = normalize(query);
  if (nQuery.length === 0) return [];

  const results: { product: Product; distance: number }[] = [];

  for (const product of products) {
    const targets = [
      normalize(product.brand),
      normalize(product.name),
    ];

    let bestDistance = Infinity;

    for (const target of targets) {
      // Compare query against the full target
      const fullDist = levenshtein(nQuery, target);
      bestDistance = Math.min(bestDistance, fullDist);

      // Early exit: already within threshold, no need for sliding window
      if (bestDistance <= 1) break;

      // Sliding window: compare query against substrings of similar length
      if (target.length > nQuery.length) {
        const windowSize = nQuery.length;
        for (let i = 0; i <= target.length - windowSize; i++) {
          const substr = target.slice(i, i + windowSize);
          const dist = levenshtein(nQuery, substr);
          if (dist < bestDistance) {
            bestDistance = dist;
            if (bestDistance <= 1) break;
          }
        }
      }

      if (bestDistance <= 1) break;
    }

    if (bestDistance <= threshold) {
      results.push({ product, distance: bestDistance });
    }
  }

  // Sort by distance so closer matches come first
  results.sort((a, b) => a.distance - b.distance);

  return results.map((r) => r.product);
}

// ---------------------------------------------------------------------------
// Main search function
// ---------------------------------------------------------------------------

/**
 * 3-stage search engine:
 *   1. Exact substring match on normalized brand+name
 *   2. Alias expansion then exact match
 *   3. Fuzzy match via Levenshtein distance
 *
 * Results are deduplicated across stages, preserving priority order
 * (exact > alias > fuzzy). Returns at most `maxResults` products.
 */
export function searchProducts(
  query: string,
  products: Product[],
  maxResults: number = SEARCH_DEFAULTS.MAX_RESULTS,
): Product[] {
  const trimmed = query.trim();
  if (trimmed.length === 0) return [];

  const seen = new Set<Product>();
  const results: Product[] = [];

  function addUnique(matches: Product[]): void {
    for (const product of matches) {
      if (results.length >= maxResults) return;
      if (!seen.has(product)) {
        seen.add(product);
        results.push(product);
      }
    }
  }

  // Stage 1: Exact substring match
  addUnique(exactMatch(trimmed, products));

  // Stage 2: Alias expansion
  if (results.length < maxResults) {
    addUnique(aliasMatch(trimmed, products));
  }

  // Stage 3: Fuzzy match
  if (results.length < maxResults) {
    addUnique(fuzzyMatch(trimmed, products));
  }

  return results;
}
