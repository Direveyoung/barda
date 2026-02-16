"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  category: string;
  desc: string;
  caution: string;
}

const categories = [
  "전체", "안티에이징", "각질케어", "미백/톤업", "보습", "진정", "트러블", "선케어", "클렌징",
];

const ingredients: Ingredient[] = [
  // 안티에이징
  { id: "retinol", name: "레티놀", emoji: "💛", category: "안티에이징", desc: "주름개선, 피부재생, 콜라겐 촉진", caution: "자외선 민감 증가, AHA/BHA와 동시 사용 주의" },
  { id: "retinal", name: "레티날", emoji: "💛", category: "안티에이징", desc: "레티놀보다 강력한 비타민A 유도체, 빠른 효과", caution: "레티놀보다 자극 가능성 높음, 밤 사용 필수" },
  { id: "bakuchiol", name: "바쿠치올", emoji: "🌱", category: "안티에이징", desc: "식물성 레티놀 대안, 항산화 + 주름 개선", caution: "레티놀 대비 순한 편, 민감피부 가능" },
  { id: "peptide", name: "펩타이드", emoji: "🔗", category: "안티에이징", desc: "콜라겐 생성 촉진, 탄력 개선", caution: "구리 펩타이드는 비타민C/레티놀과 분리 사용" },
  { id: "adenosine", name: "아데노신", emoji: "🧬", category: "안티에이징", desc: "주름개선 기능성 성분, 상처 회복 촉진", caution: "특별한 주의 없음, 대부분의 성분과 병용 가능" },
  // 각질케어
  { id: "aha", name: "AHA (글리콜산)", emoji: "🧪", category: "각질케어", desc: "각질 제거, 피부결 개선, 톤 균일화", caution: "레티놀과 같은 날 사용 금지, 선크림 필수" },
  { id: "bha", name: "BHA (살리실산)", emoji: "🫧", category: "각질케어", desc: "모공 속 각질/피지 제거, 블랙헤드 관리", caution: "과도한 사용 시 건조, AHA와 동시 사용 주의" },
  { id: "pha", name: "PHA (글루코노락톤)", emoji: "🟢", category: "각질케어", desc: "AHA보다 순한 각질 제거, 보습력 보유", caution: "민감피부도 사용 가능, 자극 최소화" },
  { id: "lha", name: "LHA (리포하이드록시산)", emoji: "🔬", category: "각질케어", desc: "모공 내 천천히 침투, 지속적 각질 케어", caution: "BHA보다 순하지만 중복 사용 주의" },
  { id: "urea", name: "우레아", emoji: "💎", category: "각질케어", desc: "천연보습인자, 각질 연화 + 보습", caution: "고농도(10%+)는 자극 가능, 저농도 추천" },
  // 미백/톤업
  { id: "vitamin_c", name: "비타민C (L-AA)", emoji: "🍊", category: "미백/톤업", desc: "항산화, 미백, 콜라겐 합성 촉진", caution: "아침 사용 추천, 벤조일퍼옥사이드와 동시 사용 금지" },
  { id: "niacinamide", name: "나이아신아마이드", emoji: "✨", category: "미백/톤업", desc: "피지조절, 미백, 피부장벽 강화", caution: "대부분 안전, 민감피부는 비타민C와 분리 권장" },
  { id: "arbutin", name: "알부틴", emoji: "⚪", category: "미백/톤업", desc: "멜라닌 생성 억제, 미백 효과", caution: "하이드로퀴논 유도체, 고농도 시 자극 주의" },
  { id: "tranexamic_acid", name: "트라넥사믹애시드", emoji: "💊", category: "미백/톤업", desc: "색소침착 개선, 기미/잡티 완화", caution: "대부분 안전, 경구 복용 시 전문의 상담" },
  { id: "kojic_acid", name: "코직산", emoji: "🍄", category: "미백/톤업", desc: "천연 미백 성분, 멜라닌 합성 억제", caution: "산화에 약해 변색 주의, 민감피부 패치 테스트" },
  // 보습
  { id: "hyaluronic_acid", name: "히알루론산", emoji: "💧", category: "보습", desc: "강력한 수분 보유력, 피부 탄력 개선", caution: "건조한 환경에서는 오히려 수분 빼앗길 수 있음, 크림으로 봉인" },
  { id: "ceramide", name: "세라마이드", emoji: "🛡️", category: "보습", desc: "피부장벽 회복, 수분 증발 방지", caution: "특별한 주의 없음, 민감피부 우선 추천" },
  { id: "squalane", name: "스쿠알란", emoji: "🫧", category: "보습", desc: "피부 유사 오일, 보습 + 장벽 강화", caution: "순한 편, 지성피부는 소량 사용 권장" },
  { id: "glycerin", name: "글리세린", emoji: "💦", category: "보습", desc: "수분 끌어오는 보습제, 피부 유연화", caution: "고농도 시 끈적임, 건조환경에서는 크림과 함께" },
  { id: "beta_glucan", name: "베타글루칸", emoji: "🌾", category: "보습", desc: "히알루론산보다 뛰어난 보습력, 진정 효과", caution: "특별한 주의 없음, 모든 피부 타입 사용 가능" },
  // 진정
  { id: "cica", name: "시카 (센텔라)", emoji: "🌿", category: "진정", desc: "피부 진정, 장벽 회복, 트러블 완화", caution: "특별한 주의 없음, 대부분의 성분과 병용 가능" },
  { id: "aloe", name: "알로에 베라", emoji: "🪴", category: "진정", desc: "즉각 진정, 수분 공급, 가벼운 보습", caution: "드물게 알레르기 반응, 패치 테스트 권장" },
  { id: "allantoin", name: "알란토인", emoji: "🤍", category: "진정", desc: "피부 진정, 자극 완화, 각질 연화", caution: "매우 순한 성분, 특별한 주의 없음" },
  { id: "tea_tree", name: "티트리 오일", emoji: "🌲", category: "진정", desc: "항균, 항염, 트러블 스팟 케어", caution: "원액 사용 금지, 반드시 희석/제품화된 형태로" },
  { id: "mugwort", name: "쑥 (아르테미시아)", emoji: "🌱", category: "진정", desc: "한방 진정 성분, 민감 피부 안정화", caution: "대부분 안전, 쑥 알레르기 있으면 주의" },
  // 트러블
  { id: "benzoyl_peroxide", name: "벤조일퍼옥사이드", emoji: "💥", category: "트러블", desc: "여드름균 살균, 트러블 치료", caution: "레티놀/비타민C와 동시 사용 금지, 건조할 수 있음" },
  { id: "azelaic_acid", name: "아젤라산", emoji: "🔸", category: "트러블", desc: "여드름, 주사비, 색소침착 개선", caution: "초기 자극 가능, 사용량 점진적 증가" },
  { id: "sulfur", name: "유황", emoji: "🟡", category: "트러블", desc: "피지 조절, 항균, 각질 제거", caution: "강한 냄새, 건조해질 수 있음" },
  // 선케어
  { id: "zinc_oxide", name: "징크옥사이드", emoji: "☀️", category: "선케어", desc: "물리적 자외선 차단, 민감피부 적합", caution: "백탁 가능, 나노 입자 논란 있으나 안전" },
  { id: "titanium_dioxide", name: "티타늄디옥사이드", emoji: "🌤️", category: "선케어", desc: "물리적 자외선 차단, UVB 특화", caution: "UVA 차단력은 징크옥사이드보다 낮음" },
];

export default function GuidePage() {
  const [activeCategory, setActiveCategory] = useState("전체");

  const filtered = activeCategory === "전체"
    ? ingredients
    : ingredients.filter((ing) => ing.category === activeCategory);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-primary">BARDA</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">성분 가이드</h2>
        <p className="text-xs text-gray-400 mb-4">
          스킨케어 핵심 성분 {ingredients.length}종을 알아보세요
        </p>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-3">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 mb-3">{filtered.length}개 성분</p>

        <div className="space-y-3">
          {filtered.map((ing) => (
            <div
              key={ing.id}
              className="bg-white rounded-2xl border border-gray-100 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl shrink-0">{ing.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-800">
                      {ing.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      {ing.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{ing.desc}</p>
                  <div className="flex items-start gap-1.5">
                    <span className="text-xs text-warning shrink-0">⚠️</span>
                    <p className="text-xs text-gray-400">{ing.caution}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Q&A 섹션 CTA */}
        <section className="mt-8 mb-6">
          <div className="bg-primary-bg rounded-2xl p-5 text-center">
            <p className="text-sm font-semibold text-gray-800 mb-2">
              궁금한 성분 조합이 있나요?
            </p>
            <p className="text-xs text-gray-500 mb-4">
              루틴 분석으로 내 제품의 성분 충돌을 확인해 보세요
            </p>
            <Link
              href="/analyze"
              className="inline-block px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-light transition-colors"
            >
              내 루틴 분석하기
            </Link>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
