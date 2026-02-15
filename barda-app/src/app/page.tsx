"use client";

import { useState, useCallback } from "react";
import type { RoutineProduct, AnalysisResult } from "@/lib/analysis";
import { analyzeRoutine } from "@/lib/analysis";
import SkinTypeStep from "@/components/SkinTypeStep";
import ConcernStep from "@/components/ConcernStep";
import ProductStep from "@/components/ProductStep";
import ResultView from "@/components/ResultView";

const STEPS = [
  { label: "피부타입", emoji: "🧴" },
  { label: "고민", emoji: "🎯" },
  { label: "제품등록", emoji: "📦" },
  { label: "분석결과", emoji: "📊" },
];

export default function Home() {
  const [step, setStep] = useState(0);
  const [skinType, setSkinType] = useState("");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [products, setProducts] = useState<RoutineProduct[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleConcernToggle = useCallback((id: string) => {
    setConcerns((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }, []);

  const handleAddProduct = useCallback((product: RoutineProduct) => {
    setProducts((prev) => [...prev, product]);
  }, []);

  const handleRemoveProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleAnalyze = useCallback(() => {
    const analysisResult = analyzeRoutine(products, skinType, concerns);
    setResult(analysisResult);
    setStep(3);
  }, [products, skinType, concerns]);

  const handleReset = useCallback(() => {
    setStep(0);
    setSkinType("");
    setConcerns([]);
    setProducts([]);
    setResult(null);
  }, []);

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">
            BARDA
          </h1>
          <span className="text-xs text-gray-400">바르게 바르다</span>
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
                {s.emoji} {s.label}
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
            onSelect={setSkinType}
            onNext={() => setStep(1)}
          />
        )}

        {step === 1 && (
          <ConcernStep
            selected={concerns}
            onToggle={handleConcernToggle}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}

        {step === 2 && (
          <ProductStep
            products={products}
            onAdd={handleAddProduct}
            onRemove={handleRemoveProduct}
            onNext={handleAnalyze}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && result && (
          <ResultView
            result={result}
            onBack={() => setStep(2)}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-lg mx-auto px-4 pt-8 pb-4 text-center">
        <p className="text-xs text-gray-400">
          BARDA는 일반적인 스킨케어 정보를 제공하며, 전문 의료 조언을 대체하지 않습니다.
        </p>
      </footer>
    </div>
  );
}
