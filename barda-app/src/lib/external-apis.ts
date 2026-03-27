/* ─── External API Connectors ─── */
/* 식약처 OpenAPI + Open Beauty Facts + 공공데이터포털 성분사전 */
/* Production: caching (5 min TTL) + retry with backoff */

import {
  API_URLS,
  API_TIMEOUT_MS,
  HEALTH_CHECK_TIMEOUT_MS,
  CACHE_TTL,
  CACHE_MAX_SIZE,
  CACHE_EVICT_TARGET,
} from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

/* ─── In-memory Cache ─── */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  if (cache.size > CACHE_MAX_SIZE) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (now > v.expiresAt) cache.delete(k);
    }
    if (cache.size > CACHE_EVICT_TARGET) cache.clear();
  }
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL.API });
}

/* ─── Retry helper ─── */

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 2,
): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }
  throw lastError ?? new Error("Fetch failed after retries");
}

/* ─── Types ─── */

/** 식약처 기능성화장품 성분 정보 */
export interface MFDSIngredient {
  ingredientName: string;
  ingredientNameEn: string;
  casNo: string;
  purpose: string;
  maxConcentration: string;
  regulation: string;
}

/** Open Beauty Facts 제품 정보 */
export interface OBFProduct {
  code: string;
  productName: string;
  brand: string;
  ingredientsList: string;
  ingredientsCount: number;
  categories: string;
  imageUrl: string | null;
  countries: string;
}

/** 공공데이터포털 성분 매핑 */
export interface IngredientMapping {
  koreanName: string;
  inciName: string;
  casNo: string;
  ewgScore: number | null;
  category: string;
}

/** API 연동 결과 */
export interface APIResult<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  source: string;
  timestamp: string;
}

/* ─── Error / Success Factory ─── */

function createErrorResult<T>(source: string, error: string): APIResult<T> {
  return { success: false, data: null, error, source, timestamp: new Date().toISOString() };
}

function createSuccessResult<T>(source: string, data: T): APIResult<T> {
  return { success: true, data, error: null, source, timestamp: new Date().toISOString() };
}

/* ─── 1. 식약처 OpenAPI ─── */

/**
 * 식약처 기능성화장품 성분 조회
 * @param ingredientName - 검색할 성분명 (한글)
 * @param serviceKey - 공공데이터포털 인증키
 */
export async function fetchMFDSIngredients(
  ingredientName: string,
  serviceKey?: string
): Promise<APIResult<MFDSIngredient[]>> {
  const key = serviceKey ?? process.env.MFDS_API_KEY ?? process.env.PUBLIC_DATA_SERVICE_KEY;

  if (!key) {
    return createErrorResult("mfds", "MFDS_API_KEY 또는 PUBLIC_DATA_SERVICE_KEY 환경변수가 필요합니다");
  }

  const cacheKey = `mfds:${ingredientName}`;
  const cached = getCached<APIResult<MFDSIngredient[]>>(cacheKey);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      serviceKey: key,
      type: "json",
      numOfRows: "20",
      pageNo: "1",
      MTRL_NM: ingredientName,
    });

    const res = await fetchWithRetry(`${API_URLS.MFDS}?${params.toString()}`, {
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });

    if (!res.ok) {
      return createErrorResult("mfds", `HTTP ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    const items = json?.body?.items ?? [];

    const ingredients: MFDSIngredient[] = items.map((item: Record<string, string>) => ({
      ingredientName: item.MTRL_NM ?? "",
      ingredientNameEn: item.MTRL_ENG_NM ?? "",
      casNo: item.CAS_NO ?? "",
      purpose: item.FNCTIONL_CSTC_SE ?? "",
      maxConcentration: item.MXMM_BLND_LMTTNO ?? "",
      regulation: item.ETC_MATTER ?? "",
    }));

    const result = createSuccessResult("mfds", ingredients);
    setCache(cacheKey, result);
    return result;
  } catch (err) {
    return createErrorResult("mfds", err instanceof Error ? err.message : "Unknown error");
  }
}

/* ─── 2. Open Beauty Facts API ─── */

/**
 * Open Beauty Facts 바코드로 제품 조회
 * @param barcode - 제품 바코드
 */
export async function fetchOBFByBarcode(
  barcode: string
): Promise<APIResult<OBFProduct>> {
  const cacheKey = `obf:barcode:${barcode}`;
  const cached = getCached<APIResult<OBFProduct>>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetchWithRetry(
      `${API_URLS.OBF}/api/v2/product/${barcode}.json`,
      { signal: AbortSignal.timeout(API_TIMEOUT_MS) },
    );

    if (!res.ok) {
      return createErrorResult("obf", `HTTP ${res.status}`);
    }

    const json = await res.json();
    if (json.status !== 1 || !json.product) {
      return createErrorResult("obf", "제품을 찾을 수 없습니다");
    }

    const p = json.product;
    const result = createSuccessResult<OBFProduct>("obf", {
      code: p.code ?? barcode,
      productName: p.product_name ?? p.product_name_ko ?? "",
      brand: p.brands ?? "",
      ingredientsList: p.ingredients_text ?? "",
      ingredientsCount: p.ingredients_n ?? 0,
      categories: p.categories ?? "",
      imageUrl: p.image_url ?? null,
      countries: p.countries ?? "",
    });
    setCache(cacheKey, result);
    return result;
  } catch (err) {
    return createErrorResult("obf", err instanceof Error ? err.message : "Unknown error");
  }
}

/**
 * Open Beauty Facts 제품 검색 (브랜드 또는 제품명)
 * @param query - 검색어
 * @param page - 페이지 (기본 1)
 */
export async function searchOBFProducts(
  query: string,
  page: number = 1
): Promise<APIResult<OBFProduct[]>> {
  const cacheKey = `obf:search:${query}:${page}`;
  const cached = getCached<APIResult<OBFProduct[]>>(cacheKey);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      search_terms: query,
      page: String(page),
      page_size: "20",
      json: "1",
    });

    const res = await fetchWithRetry(
      `${API_URLS.OBF}/cgi/search.pl?${params.toString()}`,
      { signal: AbortSignal.timeout(API_TIMEOUT_MS) },
    );

    if (!res.ok) {
      return createErrorResult("obf", `HTTP ${res.status}`);
    }

    const json = await res.json();
    const products: OBFProduct[] = (json.products ?? []).map(
      (p: Record<string, string | number | null>) => ({
        code: (p.code as string) ?? "",
        productName: (p.product_name as string) ?? "",
        brand: (p.brands as string) ?? "",
        ingredientsList: (p.ingredients_text as string) ?? "",
        ingredientsCount: (p.ingredients_n as number) ?? 0,
        categories: (p.categories as string) ?? "",
        imageUrl: (p.image_url as string) ?? null,
        countries: (p.countries as string) ?? "",
      })
    );

    const result = createSuccessResult("obf", products);
    setCache(cacheKey, result);
    return result;
  } catch (err) {
    return createErrorResult("obf", err instanceof Error ? err.message : "Unknown error");
  }
}

/* ─── 3. 공공데이터포털 화장품 성분사전 ─── */

/**
 * 공공데이터포털 성분사전 조회
 * @param ingredientName - 성분명 (한글 또는 INCI)
 * @param serviceKey - 공공데이터포털 인증키
 */
export async function fetchIngredientMapping(
  ingredientName: string,
  serviceKey?: string
): Promise<APIResult<IngredientMapping[]>> {
  const key = serviceKey ?? process.env.INGREDIENT_API_KEY ?? process.env.PUBLIC_DATA_SERVICE_KEY;

  if (!key) {
    return createErrorResult("ingredient_dict", "INGREDIENT_API_KEY 또는 PUBLIC_DATA_SERVICE_KEY 환경변수가 필요합니다");
  }

  const cacheKey = `ingd:${ingredientName}`;
  const cached = getCached<APIResult<IngredientMapping[]>>(cacheKey);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      serviceKey: key,
      type: "json",
      numOfRows: "20",
      pageNo: "1",
      INGD_NM: ingredientName,
    });

    const res = await fetchWithRetry(`${API_URLS.INGREDIENT_DICT}?${params.toString()}`, {
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });

    if (!res.ok) {
      return createErrorResult("ingredient_dict", `HTTP ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    const items = json?.body?.items ?? [];

    const mappings: IngredientMapping[] = items.map(
      (item: Record<string, string | number | null>) => ({
        koreanName: (item.INGD_KR_NM as string) ?? (item.INGD_NM as string) ?? "",
        inciName: (item.INGD_ENG_NM as string) ?? "",
        casNo: (item.CAS_NO as string) ?? "",
        ewgScore: item.EWG_GRADE ? Number(item.EWG_GRADE) : null,
        category: (item.FNCTIONL_CTGY as string) ?? "",
      })
    );

    const result = createSuccessResult("ingredient_dict", mappings);
    setCache(cacheKey, result);
    return result;
  } catch (err) {
    return createErrorResult("ingredient_dict", err instanceof Error ? err.message : "Unknown error");
  }
}

/* ─── Combined Ingredient Lookup ─── */

export interface EnrichedIngredient {
  name: string;
  nameEn: string | null;
  casNo: string | null;
  purpose: string | null;
  maxConcentration: string | null;
  regulation: string | null;
  ewgScore: number | null;
  category: string | null;
  sources: string[];
}

export async function lookupIngredientEnriched(
  ingredientName: string,
): Promise<APIResult<EnrichedIngredient>> {
  const cacheKey = `enriched:${ingredientName}`;
  const cached = getCached<APIResult<EnrichedIngredient>>(cacheKey);
  if (cached) return cached;

  const [mfdsResult, dictResult] = await Promise.all([
    fetchMFDSIngredients(ingredientName).catch(() => null),
    fetchIngredientMapping(ingredientName).catch(() => null),
  ]);

  const sources: string[] = [];
  let nameEn: string | null = null;
  let casNo: string | null = null;
  let purpose: string | null = null;
  let maxConcentration: string | null = null;
  let regulation: string | null = null;
  let ewgScore: number | null = null;
  let category: string | null = null;

  if (mfdsResult?.success && mfdsResult.data && mfdsResult.data.length > 0) {
    const m = mfdsResult.data[0];
    nameEn = m.ingredientNameEn || null;
    casNo = m.casNo || null;
    purpose = m.purpose || null;
    maxConcentration = m.maxConcentration || null;
    regulation = m.regulation || null;
    sources.push("mfds");
  }

  if (dictResult?.success && dictResult.data && dictResult.data.length > 0) {
    const d = dictResult.data[0];
    if (!nameEn) nameEn = d.inciName || null;
    if (!casNo) casNo = d.casNo || null;
    ewgScore = d.ewgScore;
    category = d.category || null;
    sources.push("ingredient_dict");
  }

  if (sources.length === 0) {
    return createErrorResult("enriched", "외부 API에서 성분 정보를 찾지 못했습니다");
  }

  const enrichedData: EnrichedIngredient = {
    name: ingredientName,
    nameEn,
    casNo,
    purpose,
    maxConcentration,
    regulation,
    ewgScore,
    category,
    sources,
  };

  // Fire-and-forget: persist enrichment data to DB
  saveEnrichedToDB(enrichedData).catch(() => {/* ignore */});

  const result = createSuccessResult<EnrichedIngredient>("enriched", enrichedData);
  setCache(cacheKey, result);
  return result;
}

async function saveEnrichedToDB(enriched: EnrichedIngredient): Promise<void> {
  try {
    const supabase = createClient();
    if (!supabase) return;

    await supabase.from("ingredients").upsert(
      {
        name_ko: enriched.name,
        name_en: enriched.nameEn,
        cas_no: enriched.casNo,
        regulation_status: enriched.regulation,
        max_concentration: enriched.maxConcentration,
        regulation_source: enriched.sources.join(","),
        regulation_updated_at: new Date().toISOString(),
      },
      { onConflict: "name_ko" },
    );
  } catch {
    // Best-effort, don't block user
  }
}

/* ─── API 상태 체크 ─── */

export interface APIHealthStatus {
  mfds: { available: boolean; hasKey: boolean };
  obf: { available: boolean; hasKey: boolean };
  ingredientDict: { available: boolean; hasKey: boolean };
}

const HEALTH_CHECK_INGREDIENT = "나이아신아마이드";

/** Check all API availability (with actual connectivity test) */
export async function checkAPIHealth(): Promise<APIHealthStatus> {
  const publicKey = process.env.PUBLIC_DATA_SERVICE_KEY;
  const mfdsKey = process.env.MFDS_API_KEY ?? publicKey;
  const ingredientKey = process.env.INGREDIENT_API_KEY ?? publicKey;

  const [obfOk, mfdsOk, ingredientOk] = await Promise.all([
    fetch(`${API_URLS.OBF}/api/v2/product/0.json`, { signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS) })
      .then(res => res.ok || res.status === 404)
      .catch(() => false),
    mfdsKey
      ? fetch(`${API_URLS.MFDS}?${new URLSearchParams({ serviceKey: mfdsKey, type: "json", numOfRows: "1", pageNo: "1", MTRL_NM: HEALTH_CHECK_INGREDIENT })}`, { signal: AbortSignal.timeout(API_TIMEOUT_MS) })
          .then(res => res.ok)
          .catch(() => false)
      : Promise.resolve(false),
    ingredientKey
      ? fetch(`${API_URLS.INGREDIENT_DICT}?${new URLSearchParams({ serviceKey: ingredientKey, type: "json", numOfRows: "1", pageNo: "1", INGD_NM: HEALTH_CHECK_INGREDIENT })}`, { signal: AbortSignal.timeout(API_TIMEOUT_MS) })
          .then(res => res.ok)
          .catch(() => false)
      : Promise.resolve(false),
  ]);

  return {
    mfds: { available: mfdsOk, hasKey: !!mfdsKey },
    obf: { available: obfOk, hasKey: true },
    ingredientDict: { available: ingredientOk, hasKey: !!ingredientKey },
  };
}
