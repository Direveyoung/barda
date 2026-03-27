"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { ALL_PRODUCTS, type Product } from "@/data/products";
import { searchProducts } from "@/lib/search";
import {
  INGREDIENT_DB,
  lookupIngredient,
  getSafetyLevel,
  toEwgScore,
  type IngredientInfo,
} from "@/data/ingredients";
import { type OBFProduct } from "@/lib/external-apis";
import { SAFETY_LEVEL_CONFIG } from "@/lib/constants";

/* ─── Types ─── */

type TabId = "camera" | "manual";

interface ParsedIngredient {
  raw: string;
  info: IngredientInfo | null;
}

interface BarcodeResult {
  product: OBFProduct;
  parsedIngredients: ParsedIngredient[];
}

type CameraState = "idle" | "requesting" | "active" | "denied" | "captured";

/* ─── Helpers ─── */

function parseIngredientsList(text: string): ParsedIngredient[] {
  const raw = text
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return raw.map((name) => {
    const info = lookupIngredient(name);
    return { raw: name, info };
  });
}

function matchProductInDB(brandName: string, productName: string): Product[] {
  const query = `${brandName} ${productName}`.trim();
  if (query.length === 0) return [];
  return searchProducts(query, ALL_PRODUCTS, 5);
}

/* ─── Component ─── */

export default function ScannerPage() {
  const [activeTab, setActiveTab] = useState<TabId>("camera");

  /* Camera state */
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  /* Barcode lookup */
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);
  const [barcodeResult, setBarcodeResult] = useState<BarcodeResult | null>(null);

  /* Manual input */
  const [manualText, setManualText] = useState("");
  const [manualResults, setManualResults] = useState<ParsedIngredient[]>([]);
  const [manualAnalyzed, setManualAnalyzed] = useState(false);

  /* DB match results */
  const [dbMatches, setDbMatches] = useState<Product[]>([]);

  /* ─── Camera Functions ─── */

  const startCamera = useCallback(async () => {
    setCameraState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState("active");
    } catch {
      setCameraState("denied");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    setCameraState("captured");
    stopCamera();
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setBarcodeInput("");
    setBarcodeError(null);
    setBarcodeResult(null);
    setDbMatches([]);
    startCamera();
  }, [startCamera]);

  /* Cleanup on unmount or tab switch */
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    if (activeTab !== "camera") {
      stopCamera();
      setCameraState("idle");
    }
  }, [activeTab, stopCamera]);

  /* ─── Barcode Lookup ─── */

  const lookupBarcode = useCallback(async () => {
    const code = barcodeInput.trim();
    if (code.length === 0) return;

    setBarcodeLoading(true);
    setBarcodeError(null);
    setBarcodeResult(null);
    setDbMatches([]);

    try {
      const res = await fetch(`/api/barcode?code=${encodeURIComponent(code)}`);

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        setBarcodeError(errorData?.error ?? "제품을 찾을 수 없습니다. 바코드 번호를 확인해 주세요.");
        setBarcodeLoading(false);
        return;
      }

      const data = await res.json();
      const product: OBFProduct = data.product;
      const parsed = parseIngredientsList(product.ingredientsList);
      setBarcodeResult({ product, parsedIngredients: parsed });

      // Try to match in local DB
      const matches = matchProductInDB(product.brand, product.productName);
      setDbMatches(matches);

      // Auto-create product candidate if OBF found it but no DB match
      if (product.productName && matches.length === 0) {
        fetch("/api/product-candidates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand: product.brand || "Unknown",
            name: product.productName,
            category_guess: null,
          }),
        }).catch(() => {/* fire-and-forget */});
      }
    } catch {
      setBarcodeError("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setBarcodeLoading(false);
    }
  }, [barcodeInput]);

  /* ─── Manual Input Analysis ─── */

  const analyzeManualInput = useCallback(() => {
    const results = parseIngredientsList(manualText);
    setManualResults(results);
    setManualAnalyzed(true);
  }, [manualText]);

  /* ─── Stats ─── */

  function getIngredientStats(ingredients: ParsedIngredient[]): {
    total: number;
    recognized: number;
    safe: number;
    moderate: number;
    caution: number;
  } {
    const recognized = ingredients.filter((i) => i.info !== null);
    return {
      total: ingredients.length,
      recognized: recognized.length,
      safe: recognized.filter((i) => getSafetyLevel(i.info!.safetyScore) === "safe").length,
      moderate: recognized.filter((i) => getSafetyLevel(i.info!.safetyScore) === "moderate").length,
      caution: recognized.filter((i) => getSafetyLevel(i.info!.safetyScore) === "caution").length,
    };
  }

  /* ─── Render: Ingredient List ─── */

  function renderIngredientList(ingredients: ParsedIngredient[]) {
    const stats = getIngredientStats(ingredients);

    return (
      <div className="space-y-4">
        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-gray-800">{stats.total}</p>
            <p className="text-[10px] text-gray-400">전체</p>
          </div>
          <div className="bg-green-50 rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-green-600">{stats.safe}</p>
            <p className="text-[10px] text-green-500">안전</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-amber-600">{stats.moderate}</p>
            <p className="text-[10px] text-amber-500">보통</p>
          </div>
          <div className="bg-red-50 rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-red-600">{stats.caution}</p>
            <p className="text-[10px] text-red-500">주의</p>
          </div>
        </div>

        {/* Safety progress bar */}
        {stats.recognized > 0 && (
          <div className="h-2 rounded-full overflow-hidden flex bg-gray-100">
            {stats.safe > 0 && (
              <div
                className="bg-green-400 transition-all duration-500"
                style={{ width: `${(stats.safe / stats.total) * 100}%` }}
              />
            )}
            {stats.moderate > 0 && (
              <div
                className="bg-amber-400 transition-all duration-500"
                style={{ width: `${(stats.moderate / stats.total) * 100}%` }}
              />
            )}
            {stats.caution > 0 && (
              <div
                className="bg-red-400 transition-all duration-500"
                style={{ width: `${(stats.caution / stats.total) * 100}%` }}
              />
            )}
            {stats.total - stats.recognized > 0 && (
              <div
                className="bg-gray-300 transition-all duration-500"
                style={{ width: `${((stats.total - stats.recognized) / stats.total) * 100}%` }}
              />
            )}
          </div>
        )}

        {/* Ingredient list */}
        <div className="space-y-2">
          {ingredients.map((ing, idx) => {
            if (ing.info) {
              const config = SAFETY_LEVEL_CONFIG[getSafetyLevel(ing.info.safetyScore)];
              return (
                <div
                  key={`${ing.raw}-${idx}`}
                  className={`flex items-center gap-3 rounded-xl p-3 ${config.bg} border border-transparent`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${config.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {ing.info.name}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${config.bg} ${config.text}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate">{ing.info.nameEn}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{ing.info.efficacy}</p>
                  </div>
                  <span className={`text-xs font-bold ${config.text} shrink-0`}>
                    {toEwgScore(ing.info.safetyScore)}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={`${ing.raw}-${idx}`}
                className="flex items-center gap-3 rounded-xl p-3 bg-gray-50 border border-gray-100"
              >
                <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-gray-300" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-gray-500 truncate block">{ing.raw}</span>
                  <p className="text-[11px] text-gray-300">DB에 없는 성분</p>
                </div>
                <span className="text-[10px] text-gray-300 shrink-0">-</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ─── Render: DB Match Results ─── */

  function renderDBMatches(matches: Product[]) {
    if (matches.length === 0) return null;

    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <h3 className="text-sm font-bold text-gray-800">BARDA DB에서 찾은 제품</h3>
        <div className="space-y-2">
          {matches.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-primary-bg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400">{product.brand}</p>
                <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                {product.key_ingredients && product.key_ingredients.length > 0 && (
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                    {product.key_ingredients.slice(0, 3).join(", ")}
                  </p>
                )}
              </div>
              <Link
                href="/analyze"
                className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium"
              >
                분석
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ─── Render: Camera Tab ─── */

  function renderCameraTab() {
    return (
      <div className="space-y-4">
        {/* Viewfinder */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-[4/3]">
          {cameraState === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">카메라로 바코드를 촬영하세요</p>
              <button
                type="button"
                onClick={startCamera}
                className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold active:scale-95 transition-transform"
              >
                카메라 시작
              </button>
            </div>
          )}

          {cameraState === "requesting" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">카메라 권한 요청 중...</p>
            </div>
          )}

          {cameraState === "active" && (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              {/* Scan overlay frame */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Semi-transparent overlay */}
                <div className="absolute inset-0 bg-black/30" />
                {/* Clear center window */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] aspect-[3/2]">
                  {/* Cut out the overlay */}
                  <div className="absolute -inset-[200%] bg-black/30" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0)" }} />
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-lg" />
                  {/* Scanning line animation */}
                  <div className="absolute left-1 right-1 h-0.5 bg-primary/70 animate-scan-line" />
                </div>
              </div>
              {/* Capture button */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full bg-white border-4 border-primary shadow-lg flex items-center justify-center active:scale-90 transition-transform"
                >
                  <div className="w-12 h-12 rounded-full bg-primary" />
                </button>
              </div>
            </>
          )}

          {cameraState === "denied" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <p className="text-sm text-gray-300 text-center">
                카메라 접근이 거부되었습니다
              </p>
              <p className="text-xs text-gray-500 text-center">
                브라우저 설정에서 카메라 권한을 허용하거나, 아래에서 바코드 번호를 직접 입력하세요
              </p>
            </div>
          )}

          {cameraState === "captured" && capturedImage && (
            <img
              src={capturedImage}
              alt="촬영된 이미지"
              className="w-full h-full object-cover"
            />
          )}

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* After capture or camera denied: barcode input */}
        {(cameraState === "captured" || cameraState === "denied") && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">바코드 번호 입력</h3>
              {cameraState === "captured" && (
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="text-xs text-primary font-medium"
                >
                  다시 촬영
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400">
              제품 뒷면의 바코드 숫자를 입력하세요 (EAN-13, UPC 등)
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="8801234567890"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter") lookupBarcode();
                }}
              />
              <button
                type="button"
                onClick={lookupBarcode}
                disabled={barcodeLoading || barcodeInput.trim().length === 0}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50 active:scale-95 transition-all"
              >
                {barcodeLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "조회"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Quick barcode input for idle state */}
        {cameraState === "idle" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <h3 className="text-sm font-bold text-gray-800">바코드 번호 직접 입력</h3>
            <p className="text-xs text-gray-400">
              카메라 없이도 바코드 번호로 제품을 조회할 수 있어요
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="8801234567890"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter") lookupBarcode();
                }}
              />
              <button
                type="button"
                onClick={lookupBarcode}
                disabled={barcodeLoading || barcodeInput.trim().length === 0}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50 active:scale-95 transition-all"
              >
                {barcodeLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "조회"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Barcode error */}
        {barcodeError && (
          <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <div>
                <p className="text-sm text-red-600 font-medium">조회 실패</p>
                <p className="text-xs text-red-400 mt-0.5">{barcodeError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Barcode result */}
        {barcodeResult && (
          <div className="space-y-4">
            {/* Product info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
              <div className="flex items-start gap-3">
                {barcodeResult.product.imageUrl && (
                  <img
                    src={barcodeResult.product.imageUrl}
                    alt={barcodeResult.product.productName}
                    className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">{barcodeResult.product.brand || "브랜드 없음"}</p>
                  <p className="text-sm font-bold text-gray-800">
                    {barcodeResult.product.productName || "제품명 없음"}
                  </p>
                  <p className="text-[11px] text-gray-300 mt-0.5">
                    바코드: {barcodeResult.product.code}
                  </p>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            {barcodeResult.parsedIngredients.length > 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                <h3 className="text-sm font-bold text-gray-800">
                  성분 분석 ({barcodeResult.parsedIngredients.length}개)
                </h3>
                {renderIngredientList(barcodeResult.parsedIngredients)}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <p className="text-sm text-gray-400">성분 정보가 없습니다</p>
                <p className="text-xs text-gray-300 mt-1">수동 입력 탭에서 성분을 직접 입력해 보세요</p>
              </div>
            )}

            {/* DB matches */}
            {renderDBMatches(dbMatches)}

            {/* CTA */}
            <Link
              href="/analyze"
              className="block w-full text-center py-3 rounded-xl bg-primary text-white text-sm font-semibold active:scale-[0.98] transition-transform"
            >
              이 제품으로 루틴 분석하기
            </Link>
          </div>
        )}
      </div>
    );
  }

  /* ─── Render: Manual Tab ─── */

  function renderManualTab() {
    return (
      <div className="space-y-4">
        {/* Input area */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-800">성분 목록 입력</h3>
          <p className="text-xs text-gray-400">
            제품 뒷면의 전성분 목록을 복사하여 붙여넣기 하세요. 쉼표(,) 또는 줄바꿈으로 구분됩니다.
          </p>
          <textarea
            value={manualText}
            onChange={(e) => {
              setManualText(e.target.value);
              setManualAnalyzed(false);
            }}
            placeholder={"Water, Glycerin, Niacinamide, Butylene Glycol, Dimethicone, Cetearyl Alcohol, ...\n\n또는\n\n정제수, 글리세린, 나이아신아마이드, 부틸렌글라이콜, ..."}
            className="w-full h-40 px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
          />
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-gray-300">
              {Object.keys(INGREDIENT_DB).length}개 성분 DB 보유
            </p>
            <button
              type="button"
              onClick={analyzeManualInput}
              disabled={manualText.trim().length === 0}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50 active:scale-95 transition-all"
            >
              성분 분석
            </button>
          </div>
        </div>

        {/* Example chips */}
        {!manualAnalyzed && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 px-1">예시 성분 목록 (클릭하여 입력)</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "보습 크림 예시", value: "Water, Glycerin, Hyaluronic Acid, Ceramide NP, Squalane, Shea Butter, Panthenol, Allantoin, Tocopherol, Dimethicone, Phenoxyethanol" },
                { label: "미백 세럼 예시", value: "Water, Niacinamide, Tranexamic Acid, Arbutin, Ascorbyl Glucoside, Glycerin, Butylene Glycol, Beta-Glucan, Panthenol, Adenosine" },
                { label: "레티놀 크림 예시", value: "Water, Retinol, Squalane, Ceramide NP, Tocopherol, Glycerin, Dimethicone, Panthenol, Adenosine, Fragrance, Phenoxyethanol" },
              ].map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => {
                    setManualText(example.value);
                    setManualAnalyzed(false);
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary-bg text-primary border border-primary/20 active:scale-95 transition-transform"
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Analysis results */}
        {manualAnalyzed && manualResults.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <h3 className="text-sm font-bold text-gray-800">
              성분 분석 결과 ({manualResults.length}개)
            </h3>
            {renderIngredientList(manualResults)}

            {/* CTA */}
            <div className="pt-2">
              <Link
                href="/analyze"
                className="block w-full text-center py-3 rounded-xl bg-primary text-white text-sm font-semibold active:scale-[0.98] transition-transform"
              >
                이 제품으로 루틴 분석하기
              </Link>
            </div>
          </div>
        )}

        {manualAnalyzed && manualResults.length === 0 && (
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-400">분석할 성분이 없습니다</p>
            <p className="text-xs text-gray-300 mt-1">쉼표(,)로 구분된 성분 목록을 입력해 주세요</p>
          </div>
        )}
      </div>
    );
  }

  /* ─── Main Render ─── */

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-primary">BARDA</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6">
        {/* Page title */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">성분 스캐너</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            바코드 촬영 또는 성분 입력으로 제품을 분석하세요
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-gray-100 p-1 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab("camera")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "camera"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-400"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            카메라
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "manual"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-400"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            수동 입력
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "camera" ? renderCameraTab() : renderManualTab()}

        {/* Bottom spacer */}
        <div className="h-6" />
      </main>

      {/* Scan line animation style */}
      <style jsx>{`
        @keyframes scanLine {
          0% {
            top: 10%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 90%;
            opacity: 0;
          }
        }
        .animate-scan-line {
          animation: scanLine 2s ease-in-out infinite;
        }
      `}</style>

      <BottomNav />
    </div>
  );
}
