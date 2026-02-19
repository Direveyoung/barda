/* ─── External API Connectors ─── */
/* 식약처 OpenAPI + Open Beauty Facts + 공공데이터포털 성분사전 */
/* Production: caching (5 min TTL) + retry with backoff */

/* ─── In-memory Cache ─── */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

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
  // Evict if cache grows too large
  if (cache.size > 500) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (now > v.expiresAt) cache.delete(k);
    }
    // Still too big? clear all
    if (cache.size > 400) cache.clear();
  }
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
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
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); // 1s, 2s backoff
      }
    }
  }
  throw lastError ?? new Error("Fetch failed after retries");
}

/* ─── Types ─── */

/** 식약처 기능성화장품 성분 정보 */
export interface MFDSIngredient {
  ingredientName: string;       // 성분명
  ingredientNameEn: string;     // 영문명
  casNo: string;                // CAS 번호
  purpose: string;              // 기능 (미백, 주름개선, 자외선차단 등)
  maxConcentration: string;     // 최대 배합 한도
  regulation: string;           // 규제 사항
}

/** Open Beauty Facts 제품 정보 */
export interface OBFProduct {
  code: string;                 // 바코드
  productName: string;          // 제품명
  brand: string;                // 브랜드
  ingredientsList: string;      // 전성분 목록 (comma-separated)
  ingredientsCount: number;     // 성분 수
  categories: string;           // 카테고리
  imageUrl: string | null;      // 이미지 URL
  countries: string;            // 판매 국가
}

/** 공공데이터포털 성분 매핑 */
export interface IngredientMapping {
  koreanName: string;           // 한국명
  inciName: string;             // INCI 국제명
  casNo: string;                // CAS 번호
  ewgScore: number | null;      // EWG 등급 (1~10)
  category: string;             // 분류 (보습, 미백, 항산화 등)
}

/** API 연동 결과 */
export interface APIResult<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  source: string;
  timestamp: string;
}

/* ─── 1. 식약처 OpenAPI ─── */
/* 기능성화장품 성분 정보 조회 */
/* URL: https://apis.data.go.kr/1471000/CosmeFnctnlMaterialService */

const MFDS_BASE_URL = "https://apis.data.go.kr/1471000/CosmeFnctnlMaterialService/getCosmeFnctnlMaterialList";

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
    return {
      success: false,
      data: null,
      error: "MFDS_API_KEY 또는 PUBLIC_DATA_SERVICE_KEY 환경변수가 필요합니다",
      source: "mfds",
      timestamp: new Date().toISOString(),
    };
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

    const res = await fetchWithRetry(`${MFDS_BASE_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return {
        success: false,
        data: null,
        error: `HTTP ${res.status}: ${res.statusText}`,
        source: "mfds",
        timestamp: new Date().toISOString(),
      };
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

    const result: APIResult<MFDSIngredient[]> = {
      success: true,
      data: ingredients,
      error: null,
      source: "mfds",
      timestamp: new Date().toISOString(),
    };
    setCache(cacheKey, result);
    return result;
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
      source: "mfds",
      timestamp: new Date().toISOString(),
    };
  }
}

/* ─── 2. Open Beauty Facts API ─── */
/* 글로벌 K-뷰티 전성분 DB (무료 오픈소스) */
/* URL: https://world.openbeautyfacts.org/api/v2/ */

const OBF_BASE_URL = "https://world.openbeautyfacts.org";

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
      `${OBF_BASE_URL}/api/v2/product/${barcode}.json`,
      { signal: AbortSignal.timeout(10000) },
    );

    if (!res.ok) {
      return {
        success: false,
        data: null,
        error: `HTTP ${res.status}`,
        source: "obf",
        timestamp: new Date().toISOString(),
      };
    }

    const json = await res.json();
    if (json.status !== 1 || !json.product) {
      return {
        success: false,
        data: null,
        error: "제품을 찾을 수 없습니다",
        source: "obf",
        timestamp: new Date().toISOString(),
      };
    }

    const p = json.product;
    const result: APIResult<OBFProduct> = {
      success: true,
      data: {
        code: p.code ?? barcode,
        productName: p.product_name ?? p.product_name_ko ?? "",
        brand: p.brands ?? "",
        ingredientsList: p.ingredients_text ?? "",
        ingredientsCount: p.ingredients_n ?? 0,
        categories: p.categories ?? "",
        imageUrl: p.image_url ?? null,
        countries: p.countries ?? "",
      },
      error: null,
      source: "obf",
      timestamp: new Date().toISOString(),
    };
    setCache(cacheKey, result);
    return result;
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
      source: "obf",
      timestamp: new Date().toISOString(),
    };
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
      `${OBF_BASE_URL}/cgi/search.pl?${params.toString()}`,
      { signal: AbortSignal.timeout(10000) },
    );

    if (!res.ok) {
      return {
        success: false,
        data: null,
        error: `HTTP ${res.status}`,
        source: "obf",
        timestamp: new Date().toISOString(),
      };
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

    const result: APIResult<OBFProduct[]> = {
      success: true,
      data: products,
      error: null,
      source: "obf",
      timestamp: new Date().toISOString(),
    };
    setCache(cacheKey, result);
    return result;
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
      source: "obf",
      timestamp: new Date().toISOString(),
    };
  }
}

/* ─── 3. 공공데이터포털 화장품 성분사전 ─── */
/* 화장품 전성분 정보 / 성분명 매핑 */
/* URL: https://apis.data.go.kr/1471000/CsmtcsIngdService */

const INGREDIENT_BASE_URL = "https://apis.data.go.kr/1471000/CsmtcsIngdService/getCsmtcsIngdInforList";

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
    return {
      success: false,
      data: null,
      error: "INGREDIENT_API_KEY 또는 PUBLIC_DATA_SERVICE_KEY 환경변수가 필요합니다",
      source: "ingredient_dict",
      timestamp: new Date().toISOString(),
    };
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

    const res = await fetchWithRetry(`${INGREDIENT_BASE_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return {
        success: false,
        data: null,
        error: `HTTP ${res.status}: ${res.statusText}`,
        source: "ingredient_dict",
        timestamp: new Date().toISOString(),
      };
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

    const result: APIResult<IngredientMapping[]> = {
      success: true,
      data: mappings,
      error: null,
      source: "ingredient_dict",
      timestamp: new Date().toISOString(),
    };
    setCache(cacheKey, result);
    return result;
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
      source: "ingredient_dict",
      timestamp: new Date().toISOString(),
    };
  }
}

/* ─── Combined Ingredient Lookup ─── */
/* Queries both MFDS + ingredient dict in parallel, merges results */

export interface EnrichedIngredient {
  name: string;
  nameEn: string | null;
  casNo: string | null;
  purpose: string | null;          // 기능성 용도 (MFDS)
  maxConcentration: string | null;  // 최대 배합한도 (MFDS)
  regulation: string | null;        // 규제 사항 (MFDS)
  ewgScore: number | null;          // EWG 등급 (ingredient dict)
  category: string | null;          // 성분 분류 (ingredient dict)
  sources: string[];                // data sources used
}

export async function lookupIngredientEnriched(
  ingredientName: string,
): Promise<APIResult<EnrichedIngredient>> {
  const cacheKey = `enriched:${ingredientName}`;
  const cached = getCached<APIResult<EnrichedIngredient>>(cacheKey);
  if (cached) return cached;

  // Fire both APIs in parallel (graceful if either fails)
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

  // Extract from MFDS
  if (mfdsResult?.success && mfdsResult.data && mfdsResult.data.length > 0) {
    const m = mfdsResult.data[0];
    nameEn = m.ingredientNameEn || null;
    casNo = m.casNo || null;
    purpose = m.purpose || null;
    maxConcentration = m.maxConcentration || null;
    regulation = m.regulation || null;
    sources.push("mfds");
  }

  // Extract from ingredient dict
  if (dictResult?.success && dictResult.data && dictResult.data.length > 0) {
    const d = dictResult.data[0];
    if (!nameEn) nameEn = d.inciName || null;
    if (!casNo) casNo = d.casNo || null;
    ewgScore = d.ewgScore;
    category = d.category || null;
    sources.push("ingredient_dict");
  }

  if (sources.length === 0) {
    return {
      success: false,
      data: null,
      error: "외부 API에서 성분 정보를 찾지 못했습니다",
      source: "enriched",
      timestamp: new Date().toISOString(),
    };
  }

  const result: APIResult<EnrichedIngredient> = {
    success: true,
    data: {
      name: ingredientName,
      nameEn,
      casNo,
      purpose,
      maxConcentration,
      regulation,
      ewgScore,
      category,
      sources,
    },
    error: null,
    source: "enriched",
    timestamp: new Date().toISOString(),
  };
  setCache(cacheKey, result);
  return result;
}

/* ─── API 상태 체크 ─── */

export interface APIHealthStatus {
  mfds: { available: boolean; hasKey: boolean };
  obf: { available: boolean; hasKey: boolean };
  ingredientDict: { available: boolean; hasKey: boolean };
}

/** Check all API availability (with actual connectivity test) */
export async function checkAPIHealth(): Promise<APIHealthStatus> {
  const publicKey = process.env.PUBLIC_DATA_SERVICE_KEY;
  const mfdsKey = process.env.MFDS_API_KEY ?? publicKey;
  const ingredientKey = process.env.INGREDIENT_API_KEY ?? publicKey;

  // Test all APIs in parallel
  const [obfOk, mfdsOk, ingredientOk] = await Promise.all([
    // OBF: no key, just check reachability
    fetch(`${OBF_BASE_URL}/api/v2/product/0.json`, { signal: AbortSignal.timeout(5000) })
      .then(res => res.ok || res.status === 404)
      .catch(() => false),
    // MFDS: test with a known ingredient if key exists
    mfdsKey
      ? fetch(`${MFDS_BASE_URL}?${new URLSearchParams({ serviceKey: mfdsKey, type: "json", numOfRows: "1", pageNo: "1", MTRL_NM: "나이아신아마이드" })}`, { signal: AbortSignal.timeout(8000) })
          .then(res => res.ok)
          .catch(() => false)
      : Promise.resolve(false),
    // Ingredient dict: test with known ingredient if key exists
    ingredientKey
      ? fetch(`${INGREDIENT_BASE_URL}?${new URLSearchParams({ serviceKey: ingredientKey, type: "json", numOfRows: "1", pageNo: "1", INGD_NM: "나이아신아마이드" })}`, { signal: AbortSignal.timeout(8000) })
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
