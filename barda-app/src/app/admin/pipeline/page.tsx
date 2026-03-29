"use client";

import { useCallback, useState } from "react";
import { PageHeader } from "@/components/admin/shared";

interface PipelineResult {
  action: string;
  count: number;
  details: string[];
  timestamp: string;
}

interface WeeklyReport {
  period: { start: string; end: string };
  searchStats: { totalSearches: number; hitRate: number; missedSearches: number; topMissedQueries: { query: string; count: number }[] };
  candidateStats: { newCandidates: number; autoPromoted: number; manualApproved: number; pendingHighDemand: { brand: string; name: string; count: number }[] };
  communityStats: { newPosts: number; uniqueProducts: string[]; popularProducts: { name: string; count: number }[] };
  generatedAt: string;
}

export default function AdminPipelinePage() {
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [pipelineRunning, setPipelineRunning] = useState<string | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkImportResult, setBulkImportResult] = useState<{ processed: number; succeeded: number; failed: number } | null>(null);

  const runPipeline = useCallback(async (action: string) => {
    setPipelineRunning(action);
    setPipelineResult(null);
    setWeeklyReport(null);
    try {
      const res = await fetch("/api/admin/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (action === "weekly_report") setWeeklyReport(data);
      else setPipelineResult(data);
    } catch (err) {
      setPipelineResult({ action, count: 0, details: [`Error: ${err instanceof Error ? err.message : "Unknown"}`], timestamp: new Date().toISOString() });
    }
    setPipelineRunning(null);
  }, []);

  return (
    <div>
      <PageHeader title="파이프라인" description="자동 학습 파이프라인 관리" />

      {/* Architecture Diagram */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h3 className="text-sm font-bold text-gray-800 mb-4">아키텍처</h3>
        <div className="overflow-x-auto">
          <div className="min-w-[600px] space-y-3 text-sm font-mono">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-700 font-bold mb-2">[1] 수집</p>
              <div className="grid grid-cols-3 gap-3">
                {[["유저 검색", "search_logs"], ["직접 입력", "product_candidates"], ["커뮤니티", "routine_posts"]].map(([label, table]) => (
                  <div key={table} className="bg-white rounded-lg p-3 border border-blue-100 text-center">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="font-semibold text-gray-800">{table}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center text-gray-400">&#x25BC; &#x25BC; &#x25BC;</div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-purple-700 font-bold mb-2">[2] 분석</p>
              <div className="grid grid-cols-3 gap-3">
                {[["미스 분석", "Top 20 리포트"], ["자동 승격", "submit_count ≥ 3"], ["커뮤니티 분석", "인기 제품 추출"]].map(([label, desc]) => (
                  <div key={label} className="bg-white rounded-lg p-3 border border-purple-100 text-center">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="font-semibold text-gray-800 text-xs">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center text-gray-400">&#x25BC; &#x25BC; &#x25BC;</div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-700 font-bold mb-2">[3] 실행</p>
              <div className="grid grid-cols-3 gap-3">
                {[["DB 확장", "products 업데이트"], ["별칭 추가", "aliases 업데이트"], ["주간 리포트", "종합 현황"]].map(([label, desc]) => (
                  <div key={label} className="bg-white rounded-lg p-3 border border-green-100 text-center">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="font-semibold text-gray-800 text-xs">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline Actions */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h3 className="text-sm font-bold text-gray-800 mb-4">파이프라인 실행</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { action: "auto_promote", label: "자동 승격", desc: "submit_count ≥ 3 후보 자동 승격", color: "hover:border-blue-300 hover:bg-blue-50" },
            { action: "search_miss", label: "미스 분석", desc: "주간 검색 미스 Top 20 리포트", color: "hover:border-purple-300 hover:bg-purple-50" },
            { action: "community", label: "커뮤니티 분석", desc: "인기 제품 + 피부타입별 다양성", color: "hover:border-green-300 hover:bg-green-50" },
            { action: "weekly_report", label: "주간 리포트", desc: "종합 주간 현황 리포트 생성", color: "hover:border-orange-300 hover:bg-orange-50" },
          ].map((item) => (
            <button
              key={item.action}
              type="button"
              onClick={() => runPipeline(item.action)}
              disabled={!!pipelineRunning}
              className={`p-4 rounded-xl border border-gray-200 transition-colors text-left disabled:opacity-50 ${item.color}`}
            >
              <p className="font-semibold text-gray-800 text-sm">
                {pipelineRunning === item.action ? "실행 중..." : item.label}
              </p>
              <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Bulk Import */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h3 className="text-sm font-bold text-gray-800 mb-2">성분 벌크 임포트</h3>
        <p className="text-xs text-gray-400 mb-4">MFDS API에서 주요 성분 규제 데이터를 조회합니다.</p>
        <button
          type="button"
          disabled={bulkImporting}
          onClick={async () => {
            setBulkImporting(true);
            setBulkImportResult(null);
            try {
              const res = await fetch("/api/admin/import-ingredients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ingredients: ["나이아신아마이드", "레티놀", "아르부틴", "아데노신", "살리실산", "글리콜산", "히알루론산", "세라마이드", "판테놀", "비타민C", "트라넥삼산", "글루타치온", "펩타이드", "센텔라", "알란토인"],
                }),
              });
              if (res.ok) setBulkImportResult(await res.json());
            } catch { /* ignore */ }
            setBulkImporting(false);
          }}
          className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50 hover:bg-primary-light transition-colors"
        >
          {bulkImporting ? "임포트 중..." : "주요 성분 15종 임포트"}
        </button>
        {bulkImportResult && (
          <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
            처리: {bulkImportResult.processed}건 / 성공: {bulkImportResult.succeeded}건 / 실패: {bulkImportResult.failed}건
          </div>
        )}
      </section>

      {/* Results */}
      {pipelineResult && (
        <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800">실행 결과</h3>
            <span className="text-xs text-gray-400">{new Date(pipelineResult.timestamp).toLocaleString("ko-KR")}</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{pipelineResult.action}</span>
            <span className="text-sm text-gray-600">처리: {pipelineResult.count}건</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            {pipelineResult.details.map((d, i) => (
              <p key={i} className="text-xs text-gray-600 font-mono leading-relaxed">{d}</p>
            ))}
          </div>
        </section>
      )}

      {weeklyReport && (
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">주간 리포트</h3>
            <span className="text-xs text-gray-400">{weeklyReport.period.start} ~ {weeklyReport.period.end}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-blue-700 mb-2">검색 통계</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>총 검색: {weeklyReport.searchStats.totalSearches}건</p>
                <p>히트율: {weeklyReport.searchStats.hitRate}%</p>
                <p>미스: {weeklyReport.searchStats.missedSearches}건</p>
              </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-purple-700 mb-2">제품 후보</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>신규: {weeklyReport.candidateStats.newCandidates}건</p>
                <p>자동 승격: {weeklyReport.candidateStats.autoPromoted}건</p>
                <p>수동 승인: {weeklyReport.candidateStats.manualApproved}건</p>
              </div>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-700 mb-2">커뮤니티</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>신규 포스트: {weeklyReport.communityStats.newPosts}건</p>
                <p>고유 제품: {weeklyReport.communityStats.uniqueProducts.length}종</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
