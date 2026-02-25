"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { RoutineProduct, AnalysisResult } from "@/lib/analysis";
import { analyzeRoutine } from "@/lib/analysis";
import { useAuth } from "@/contexts/AuthContext";
import { requestPayment } from "@/lib/payments";
import { trackEvent } from "@/lib/events";
import SkinTypeStep from "@/components/SkinTypeStep";
import ConcernStep from "@/components/ConcernStep";
import ProductStep from "@/components/ProductStep";
import ResultView from "@/components/ResultView";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";

const STEPS = [
  { label: "피부타입", icon: "bottle" },
  { label: "고민", icon: "target" },
  { label: "제품등록", icon: "package" },
  { label: "분석결과", icon: "chart" },
];

function AnalyzeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isPaid, signOut } = useAuth();
  const [step, setStep] = useState(0);
  const [skinType, setSkinType] = useState("");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [products, setProducts] = useState<RoutineProduct[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [paymentToast, setPaymentToast] = useState<"success" | "fail" | null>(null);

  // Handle payment callback query params
  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      setPaymentToast("success");
      trackEvent("payment_completed");
      window.history.replaceState({}, "", "/analyze");
      setTimeout(() => setPaymentToast(null), 4000);
    } else if (payment === "fail") {
      setPaymentToast("fail");
      window.history.replaceState({}, "", "/analyze");
      setTimeout(() => setPaymentToast(null), 4000);
    }
  }, [searchParams]);

  // Track wizard start
  useEffect(() => {
    trackEvent("wizard_start");
  }, []);

  const handleConcernToggle = useCallback((id: string) => {
    setConcerns((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }, []);

  const handleAddProduct = useCallback((product: RoutineProduct) => {
    setProducts((prev) => [...prev, product]);
    trackEvent("product_added", { productId: product.id, brand: product.brand });
  }, []);

  const handleRemoveProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleAnalyze = useCallback(() => {
    trackEvent("analysis_started", { productCount: products.length });
    const analysisResult = analyzeRoutine(products, skinType, concerns);
    setResult(analysisResult);
    setStep(3);
    trackEvent("result_viewed", { score: analysisResult.score, conflictCount: analysisResult.conflicts.length });
  }, [products, skinType, concerns]);

  const handleReset = useCallback(() => {
    setStep(0);
    setSkinType("");
    setConcerns([]);
    setProducts([]);
    setResult(null);
    trackEvent("wizard_start");
  }, []);

  const handlePaymentRequest = useCallback(() => {
    if (!user) {
      router.push("/auth/login?next=/analyze&action=pay");
      return;
    }
    trackEvent("payment_initiated");
    const orderId = `BARDA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    requestPayment(orderId, 9900, "BARDA 프리미엄 분석", user.email ?? undefined);
  }, [user, router]);

  const handleSkinTypeSelect = useCallback(
    (type: string) => {
      setSkinType(type);
      trackEvent("skin_type_selected", { skinType: type });
    },
    []
  );

  const handleStepNext = useCallback(
    (nextStep: number) => {
      if (nextStep === 2 && concerns.length > 0) {
        trackEvent("concerns_selected", { concerns });
      }
      setStep(nextStep);
    },
    [concerns]
  );

  return (
    <div className="min-h-screen pb-16">
      {/* Payment Toast */}
      {paymentToast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-lg font-semibold text-sm transition-all animate-fade-up ${
            paymentToast === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {paymentToast === "success"
            ? "결제 완료! 전체 분석 결과를 확인하세요."
            : "결제에 실패했습니다. 다시 시도해 주세요."}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1
            className="text-xl font-bold text-primary cursor-pointer"
            onClick={() => router.push("/")}
          >
            BARDA
          </h1>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 hidden sm:inline">
                  {user.email?.split("@")[0]}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push("/auth/login")}
                className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
              >
                로그인
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-lg mx-auto px-4 pt-4 pb-2">
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`h-1 w-full rounded-full transition-colors ${
                  i <= step ? "bg-primary" : "bg-gray-200"
                }`}
              />
              <span
                className={`text-[10px] ${
                  i <= step ? "text-primary font-semibold" : "text-gray-400"
                }`}
              >
                <Icon name={s.icon} size={14} /> {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <main className="max-w-lg mx-auto px-4 pt-4">
        {step === 0 && (
          <SkinTypeStep
            selected={skinType}
            onSelect={handleSkinTypeSelect}
            onNext={() => handleStepNext(1)}
          />
        )}

        {step === 1 && (
          <ConcernStep
            selected={concerns}
            onToggle={handleConcernToggle}
            onNext={() => handleStepNext(2)}
            onBack={() => setStep(0)}
          />
        )}

        {step === 2 && (
          <ProductStep
            products={products}
            skinType={skinType}
            concerns={concerns}
            onAdd={handleAddProduct}
            onRemove={handleRemoveProduct}
            onNext={handleAnalyze}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && result && (
          <ResultView
            result={result}
            isPaid={isPaid}
            skinType={skinType}
            concerns={concerns}
            products={products}
            onBack={() => setStep(2)}
            onReset={handleReset}
            onPaymentRequest={handlePaymentRequest}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-lg mx-auto px-4 pt-8 pb-4 text-center">
        <p className="text-xs text-gray-400">
          BARDA는 일반적인 스킨케어 정보를 제공하며, 전문 의료 조언을 대체하지 않습니다.
        </p>
      </footer>

      <BottomNav />
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense>
      <AnalyzeContent />
    </Suspense>
  );
}
