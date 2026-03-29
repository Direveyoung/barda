"use client";

import { useCallback, useState } from "react";
import { PageHeader } from "@/components/admin/shared";

interface APIHealth {
  mfds: { available: boolean; hasKey: boolean };
  obf: { available: boolean; hasKey: boolean };
  ingredientDict: { available: boolean; hasKey: boolean };
}

function StatusDot({ ok }: { ok: boolean }) {
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${ok ? "bg-green-400" : "bg-red-400"}`} />;
}

export default function AdminApiHealthPage() {
  const [apiHealth, setApiHealth] = useState<APIHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [testTarget, setTestTarget] = useState<"mfds" | "obf" | "ingredient">("obf");
  const [testQuery, setTestQuery] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/external-apis");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setApiHealth(data.health);
    } catch { setApiHealth(null); }
    setLoading(false);
  }, []);

  const testAPI = useCallback(async () => {
    if (!testQuery.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/external-apis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api: testTarget, query: testQuery.trim() }),
      });
      setTestResult(JSON.stringify(await res.json(), null, 2));
    } catch (err) {
      setTestResult(`Error: ${err instanceof Error ? err.message : "Unknown"}`);
    }
    setTesting(false);
  }, [testQuery, testTarget]);

  return (
    <div>
      <PageHeader title="외부 API" description="외부 API 상태 모니터링 및 테스트" />

      {/* Health Check */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800">API 상태</h3>
          <button
            type="button"
            onClick={fetchHealth}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "확인 중..." : "상태 확인"}
          </button>
        </div>

        {apiHealth ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { key: "mfds" as const, label: "식약처 OpenAPI", desc: "기능성화장품 성분 조회" },
              { key: "obf" as const, label: "Open Beauty Facts", desc: "글로벌 K-뷰티 DB" },
              { key: "ingredientDict" as const, label: "성분사전", desc: "공공데이터포털 매핑" },
            ].map((api) => (
              <div key={api.key} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <StatusDot ok={apiHealth[api.key].available} />
                  <p className="font-semibold text-gray-800 text-sm">{api.label}</p>
                </div>
                <p className="text-xs text-gray-500">{api.desc}</p>
                <p className="text-xs text-gray-400 mt-1">
                  API 키: {api.key === "obf" ? "불필요" : apiHealth[api.key].hasKey ? "설정됨" : "미설정"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">&quot;상태 확인&quot; 버튼을 눌러주세요</p>
        )}
      </section>

      {/* Test Console */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h3 className="text-sm font-bold text-gray-800 mb-4">API 테스트</h3>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <select
            value={testTarget}
            onChange={(e) => setTestTarget(e.target.value as "mfds" | "obf" | "ingredient")}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
          >
            <option value="mfds">식약처 (성분명)</option>
            <option value="obf">Open Beauty Facts (제품)</option>
            <option value="ingredient">성분사전 (매핑)</option>
          </select>
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && testAPI()}
            placeholder={testTarget === "mfds" ? "나이아신아마이드" : testTarget === "obf" ? "innisfree" : "히알루론산"}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={testAPI}
            disabled={testing || !testQuery.trim()}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white disabled:opacity-50 shrink-0"
          >
            {testing ? "조회 중..." : "테스트"}
          </button>
        </div>

        {testResult && (
          <div className="bg-gray-50 rounded-lg p-4 max-h-80 overflow-y-auto">
            <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap break-all">{testResult}</pre>
          </div>
        )}
      </section>

      {/* Integration Flow */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-gray-800 mb-4">API 연동 플로우</h3>
        <div className="space-y-3 text-sm">
          {[
            { title: "1. 식약처 OpenAPI", desc: "성분명 입력 → 기능성화장품 성분 DB 조회 → 배합한도/규제 확인 → 분석 엔진에 반영" },
            { title: "2. Open Beauty Facts", desc: "바코드/제품명 검색 → 전성분 목록 조회 → 미등록 제품 자동 보강 → 제품 DB 확장" },
            { title: "3. 공공데이터포털 성분사전", desc: "한글 성분명 → INCI 국제명 매핑 → EWG 등급 확인 → 성분 가이드에 활용" },
          ].map((item) => (
            <div key={item.title} className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-700 font-semibold">{item.title}</p>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
