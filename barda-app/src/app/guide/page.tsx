"use client";

import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const ingredients = [
  {
    id: "retinol",
    name: "레티놀",
    emoji: "💛",
    category: "안티에이징",
    desc: "주름개선, 피부재생, 콜라겐 촉진",
    caution: "자외선 민감 증가, AHA/BHA와 동시 사용 주의",
  },
  {
    id: "aha",
    name: "AHA (글리콜산)",
    emoji: "🧪",
    category: "각질케어",
    desc: "각질 제거, 피부결 개선, 톤 균일화",
    caution: "레티놀과 같은 날 사용 금지, 선크림 필수",
  },
  {
    id: "bha",
    name: "BHA (살리실산)",
    emoji: "🫧",
    category: "각질케어",
    desc: "모공 속 각질/피지 제거, 블랙헤드 관리",
    caution: "과도한 사용 시 건조, AHA와 동시 사용 주의",
  },
  {
    id: "vitamin_c",
    name: "비타민C (L-AA)",
    emoji: "🍊",
    category: "미백/톤업",
    desc: "항산화, 미백, 콜라겐 합성 촉진",
    caution: "아침 사용 추천, 벤조일퍼옥사이드와 동시 사용 금지",
  },
  {
    id: "niacinamide",
    name: "나이아신아마이드",
    emoji: "✨",
    category: "미백/톤업",
    desc: "피지조절, 미백, 피부장벽 강화",
    caution: "대부분 안전, 민감피부는 비타민C와 분리 권장",
  },
  {
    id: "hyaluronic_acid",
    name: "히알루론산",
    emoji: "💧",
    category: "보습",
    desc: "강력한 수분 보유력, 피부 탄력 개선",
    caution: "건조한 환경에서는 오히려 수분 빼앗길 수 있음, 크림으로 봉인",
  },
  {
    id: "ceramide",
    name: "세라마이드",
    emoji: "🛡️",
    category: "보습",
    desc: "피부장벽 회복, 수분 증발 방지",
    caution: "특별한 주의 없음, 민감피부 우선 추천",
  },
  {
    id: "cica",
    name: "시카 (센텔라)",
    emoji: "🌿",
    category: "진정",
    desc: "피부 진정, 장벽 회복, 트러블 완화",
    caution: "특별한 주의 없음, 대부분의 성분과 병용 가능",
  },
  {
    id: "peptide",
    name: "펩타이드",
    emoji: "🔗",
    category: "안티에이징",
    desc: "콜라겐 생성 촉진, 탄력 개선",
    caution: "구리 펩타이드는 비타민C/레티놀과 분리 사용",
  },
  {
    id: "benzoyl_peroxide",
    name: "벤조일퍼옥사이드",
    emoji: "💥",
    category: "트러블",
    desc: "여드름균 살균, 트러블 치료",
    caution: "레티놀/비타민C와 동시 사용 금지, 건조할 수 있음",
  },
];

export default function GuidePage() {
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
        <p className="text-xs text-gray-400 mb-6">
          스킨케어 핵심 성분 10종을 알아보세요
        </p>

        <div className="space-y-3">
          {ingredients.map((ing) => (
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
