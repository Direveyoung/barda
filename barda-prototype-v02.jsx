import { useState, useEffect, useRef, useMemo } from "react";

// ─── Korean Popular Products DB (Top 100+) ───
const PRODUCT_DB = [
  // 클렌저
  { id: "p001", name: "이니스프리 그린티 클렌징폼", brand: "이니스프리", categoryId: "cleanser" },
  { id: "p002", name: "코스알엑스 로우pH 굿모닝 클렌저", brand: "코스알엑스", categoryId: "cleanser" },
  { id: "p003", name: "라운드랩 독도 클렌징폼", brand: "라운드랩", categoryId: "cleanser" },
  { id: "p004", name: "토리든 다이브인 클렌징폼", brand: "토리든", categoryId: "cleanser" },
  { id: "p005", name: "아누아 어성초 클렌징폼", brand: "아누아", categoryId: "cleanser" },
  { id: "p006", name: "에뛰드 순정 폼 클렌저", brand: "에뛰드", categoryId: "cleanser" },
  // 오일 클렌저
  { id: "p010", name: "바닐라코 클린잇제로 클렌징밤", brand: "바닐라코", categoryId: "oil_cleanser" },
  { id: "p011", name: "마녀공장 퓨어 클렌징오일", brand: "마녀공장", categoryId: "oil_cleanser" },
  { id: "p012", name: "아누아 어성초 클렌징오일", brand: "아누아", categoryId: "oil_cleanser" },
  { id: "p013", name: "넘버즈인 5번 클렌징오일", brand: "넘버즈인", categoryId: "oil_cleanser" },
  // 토너
  { id: "p020", name: "라운드랩 독도 토너", brand: "라운드랩", categoryId: "toner" },
  { id: "p021", name: "아누아 어성초 77 토너", brand: "아누아", categoryId: "toner" },
  { id: "p022", name: "이니스프리 그린티 씨드 토너", brand: "이니스프리", categoryId: "toner" },
  { id: "p023", name: "에스트라 아토배리어 365 토너", brand: "에스트라", categoryId: "toner" },
  { id: "p024", name: "토리든 다이브인 토너", brand: "토리든", categoryId: "toner" },
  { id: "p025", name: "넘버즈인 1번 맑은 토너", brand: "넘버즈인", categoryId: "toner" },
  // 토너패드
  { id: "p030", name: "아누아 어성초 70 토너패드", brand: "아누아", categoryId: "toner_pad" },
  { id: "p031", name: "넘버즈인 5번 토너패드", brand: "넘버즈인", categoryId: "toner_pad" },
  { id: "p032", name: "메디힐 마데카소사이드 토너패드", brand: "메디힐", categoryId: "toner_pad" },
  { id: "p033", name: "VT 시카 마일드 토너패드", brand: "VT", categoryId: "toner_pad" },
  { id: "p034", name: "구달 청귤 비타C 토너패드", brand: "구달", categoryId: "toner_pad" },
  // 에센스
  { id: "p040", name: "미샤 퍼스트 트리트먼트 에센스", brand: "미샤", categoryId: "essence" },
  { id: "p041", name: "코스알엑스 갈락토미세스 에센스", brand: "코스알엑스", categoryId: "essence" },
  { id: "p042", name: "SK-II 페이셜 트리트먼트 에센스", brand: "SK-II", categoryId: "essence" },
  // 세럼
  { id: "p050", name: "토리든 다이브인 세럼", brand: "토리든", categoryId: "serum" },
  { id: "p051", name: "코스알엑스 히알루론산 세럼", brand: "코스알엑스", categoryId: "serum" },
  { id: "p052", name: "이니스프리 그린티 씨드 세럼", brand: "이니스프리", categoryId: "serum" },
  { id: "p053", name: "넘버즈인 3번 글루타치온 세럼", brand: "넘버즈인", categoryId: "serum" },
  { id: "p054", name: "라운드랩 자작나무 수분 세럼", brand: "라운드랩", categoryId: "serum" },
  // 비타민C
  { id: "p060", name: "클레어스 프레쉬리쥬스드 비타민C 세럼", brand: "클레어스", categoryId: "vitamin_c" },
  { id: "p061", name: "구달 청귤 비타C 세럼", brand: "구달", categoryId: "vitamin_c" },
  { id: "p062", name: "멜라노CC 집중대책 미백 미용액", brand: "로토", categoryId: "vitamin_c" },
  { id: "p063", name: "코스알엑스 비타민C 23 세럼", brand: "코스알엑스", categoryId: "vitamin_c" },
  { id: "p064", name: "넘버즈인 3번 비타민C 세럼", brand: "넘버즈인", categoryId: "vitamin_c" },
  // 레티놀
  { id: "p070", name: "코스알엑스 레티놀 0.1 크림", brand: "코스알엑스", categoryId: "retinol" },
  { id: "p071", name: "이니스프리 레티놀 시카 세럼", brand: "이니스프리", categoryId: "retinol" },
  { id: "p072", name: "넘버즈인 4번 레티놀 세럼", brand: "넘버즈인", categoryId: "retinol" },
  { id: "p073", name: "라로슈포제 레티놀 B3 세럼", brand: "라로슈포제", categoryId: "retinol" },
  { id: "p074", name: "마녀공장 레티놀 탄력 세럼", brand: "마녀공장", categoryId: "retinol" },
  // AHA
  { id: "p080", name: "코스알엑스 AHA 7 화이트헤드 파워리퀴드", brand: "코스알엑스", categoryId: "aha" },
  { id: "p081", name: "디오디너리 AHA 30% + BHA 2% 필링솔루션", brand: "디오디너리", categoryId: "aha" },
  { id: "p082", name: "이즈앤트리 AHA 8% 피부결 앰플", brand: "이즈앤트리", categoryId: "aha" },
  // BHA
  { id: "p085", name: "코스알엑스 BHA 블랙헤드 파워리퀴드", brand: "코스알엑스", categoryId: "bha" },
  { id: "p086", name: "폴라초이스 BHA 리퀴드 엑스폴리언트", brand: "폴라초이스", categoryId: "bha" },
  { id: "p087", name: "썸바이미 AHA BHA PHA 30일 미라클 토너", brand: "썸바이미", categoryId: "bha" },
  // PHA
  { id: "p090", name: "코스알엑스 PHA 모이스처 리뉴얼 파워크림", brand: "코스알엑스", categoryId: "pha" },
  // 나이아신아마이드
  { id: "p095", name: "디오디너리 나이아신아마이드 10% + 아연 1%", brand: "디오디너리", categoryId: "niacinamide" },
  { id: "p096", name: "코스알엑스 나이아신아마이드 15 세럼", brand: "코스알엑스", categoryId: "niacinamide" },
  // 펩타이드
  { id: "p098", name: "코스알엑스 더 펩타이드 세럼", brand: "코스알엑스", categoryId: "peptide" },
  // 아이크림
  { id: "p100", name: "이니스프리 그린티 씨드 아이크림", brand: "이니스프리", categoryId: "eye_cream" },
  { id: "p101", name: "에이에이치씨 텐 레볼루션 아이크림", brand: "AHC", categoryId: "eye_cream" },
  // 크림
  { id: "p110", name: "라운드랩 독도 크림", brand: "라운드랩", categoryId: "cream" },
  { id: "p111", name: "에스트라 아토배리어 365 크림", brand: "에스트라", categoryId: "cream" },
  { id: "p112", name: "일리윤 세라마이드 아토 크림", brand: "일리윤", categoryId: "cream" },
  { id: "p113", name: "닥터지 레드 블레미쉬 클리어 크림", brand: "닥터지", categoryId: "cream" },
  { id: "p114", name: "벨리프 모이스춰라이징 밤", brand: "벨리프", categoryId: "cream" },
  { id: "p115", name: "키엘 울트라 훼이셜 크림", brand: "키엘", categoryId: "cream" },
  { id: "p116", name: "라네즈 워터뱅크 크림", brand: "라네즈", categoryId: "cream" },
  { id: "p117", name: "코스알엑스 어드밴스드 스네일 크림", brand: "코스알엑스", categoryId: "cream" },
  // 로션
  { id: "p120", name: "라운드랩 독도 로션", brand: "라운드랩", categoryId: "lotion" },
  { id: "p121", name: "에스트라 아토배리어 365 로션", brand: "에스트라", categoryId: "lotion" },
  // 시카
  { id: "p125", name: "닥터자르트 시카페어 크림", brand: "닥터자르트", categoryId: "cica" },
  { id: "p126", name: "VT 시카 크림", brand: "VT", categoryId: "cica" },
  { id: "p127", name: "라로슈포제 시카플라스트 밤B5", brand: "라로슈포제", categoryId: "cica" },
  // 선크림
  { id: "p130", name: "비오레 UV 아쿠아리치 워터리 에센스", brand: "비오레", categoryId: "sunscreen" },
  { id: "p131", name: "이니스프리 데일리 UV 디펜스 선크림", brand: "이니스프리", categoryId: "sunscreen" },
  { id: "p132", name: "라운드랩 자작나무 수분 선크림", brand: "라운드랩", categoryId: "sunscreen" },
  { id: "p133", name: "닥터지 그린 마일드 업 선 플러스", brand: "닥터지", categoryId: "sunscreen" },
  { id: "p134", name: "에스트라 아토배리어 365 선크림", brand: "에스트라", categoryId: "sunscreen" },
  { id: "p135", name: "아누아 어성초 선크림", brand: "아누아", categoryId: "sunscreen" },
  { id: "p136", name: "넘버즈인 1번 선크림", brand: "넘버즈인", categoryId: "sunscreen" },
  { id: "p137", name: "스킨아쿠아 톤업 UV 에센스", brand: "스킨아쿠아", categoryId: "sunscreen" },
  // 시트마스크
  { id: "p140", name: "메디힐 N.M.F 아쿠아링 앰플 마스크", brand: "메디힐", categoryId: "sheet_mask" },
  { id: "p141", name: "마녀공장 갈락토미 나이아신 에센스 마스크", brand: "마녀공장", categoryId: "sheet_mask" },
  // 오일
  { id: "p145", name: "클레어스 펀다멘탈 워터리 오일 드롭", brand: "클레어스", categoryId: "oil" },
  // 트러블스팟
  { id: "p150", name: "코스알엑스 아크네 핌플 마스터 패치", brand: "코스알엑스", categoryId: "trouble_spot" },
  { id: "p151", name: "넥스케어 블레미쉬 클리어 커버", brand: "넥스케어", categoryId: "trouble_spot" },
  // 미스트
  { id: "p155", name: "이니스프리 그린티 미스트", brand: "이니스프리", categoryId: "mist" },
  // 수면팩
  { id: "p160", name: "라네즈 워터 슬리핑 마스크", brand: "라네즈", categoryId: "sleeping_pack" },
  { id: "p161", name: "이니스프리 그린티 슬리핑 마스크", brand: "이니스프리", categoryId: "sleeping_pack" },
  // 스크럽
  { id: "p165", name: "스킨푸드 블랙슈가 마스크 워시오프", brand: "스킨푸드", categoryId: "scrub" },
];

// ─── Categories ───
const SKIN_TYPES = [
  { id: "dry", label: "건성", emoji: "🏜️", desc: "세안 후 당김" },
  { id: "oily", label: "지성", emoji: "✨", desc: "T존 번들거림" },
  { id: "combination", label: "복합성", emoji: "🔀", desc: "부위별 다름" },
  { id: "sensitive", label: "민감성", emoji: "🌸", desc: "쉽게 붉어짐" },
];

const CONCERNS = [
  { id: "trouble", label: "트러블", emoji: "🔴" },
  { id: "pigment", label: "잡티·색소", emoji: "🟤" },
  { id: "aging", label: "탄력·주름", emoji: "🔃" },
  { id: "flaking", label: "각질", emoji: "🧴" },
  { id: "moisture", label: "보습", emoji: "💧" },
  { id: "pore", label: "모공", emoji: "⚫" },
];

const CATEGORIES = {
  basic: { label: "기초 케어", items: [
    { id: "cleanser", label: "폼클렌저", order: 1, time: "both" },
    { id: "oil_cleanser", label: "오일클렌저", order: 0, time: "pm" },
    { id: "toner", label: "토너", order: 2, time: "both" },
    { id: "toner_pad", label: "토너패드", order: 2, time: "both" },
    { id: "essence", label: "에센스", order: 3, time: "both" },
    { id: "serum", label: "세럼", order: 4, time: "both" },
    { id: "eye_cream", label: "아이크림", order: 5, time: "both" },
    { id: "cream", label: "크림", order: 6, time: "both" },
    { id: "lotion", label: "로션", order: 6, time: "both" },
    { id: "oil", label: "페이셜오일", order: 7, time: "pm" },
    { id: "mist", label: "미스트", order: 2.5, time: "both" },
  ]},
  active: { label: "기능성 액티브", items: [
    { id: "vitamin_c", label: "비타민C", order: 4, time: "am", tag: "active" },
    { id: "retinol", label: "레티놀", order: 4, time: "pm", tag: "active" },
    { id: "aha", label: "AHA제품", order: 2.5, time: "pm", tag: "active" },
    { id: "bha", label: "BHA제품", order: 2.5, time: "pm", tag: "active" },
    { id: "pha", label: "PHA제품", order: 2.5, time: "pm", tag: "active" },
    { id: "niacinamide", label: "나이아신아마이드", order: 4, time: "both", tag: "active" },
    { id: "peptide", label: "펩타이드", order: 4, time: "both", tag: "active" },
  ]},
  trouble: { label: "트러블 케어", items: [
    { id: "bpo", label: "벤조일퍼옥사이드", order: 4, time: "both", tag: "active" },
    { id: "trouble_spot", label: "트러블스팟", order: 7, time: "pm" },
    { id: "cica", label: "시카제품", order: 4, time: "both" },
  ]},
  etc: { label: "기타", items: [
    { id: "sunscreen", label: "선크림", order: 8, time: "am" },
    { id: "sheet_mask", label: "시트마스크", order: 4.5, time: "pm" },
    { id: "scrub", label: "스크럽/필링", order: 1.5, time: "pm", tag: "active" },
    { id: "sleeping_pack", label: "수면팩", order: 8, time: "pm" },
  ]},
};

const CONFLICT_RULES = [
  { id: "B01", a: ["retinol"], b: ["aha"], severity: "high", title: "레티놀 × AHA", message: "같은 날 사용하면 피부 자극이 심해질 수 있어요.", suggestion: "레티놀과 AHA를 번갈아 사용해 보세요. (예: 레티놀 화·목, AHA 수·토)" },
  { id: "B02", a: ["retinol"], b: ["bha"], severity: "medium", title: "레티놀 × BHA", message: "민감피부는 자극이 될 수 있어요.", suggestion: "민감피부라면 분리 사용을, 지성피부는 저농도로 주의하며 사용 가능해요." },
  { id: "B03", a: ["retinol"], b: ["bpo"], severity: "high", title: "레티놀 × 벤조일퍼옥사이드", message: "동시 사용 시 레티놀이 분해되어 효과가 없어져요.", suggestion: "아침에 벤조일퍼옥사이드, 저녁에 레티놀로 분리해 주세요." },
  { id: "B04", a: ["retinol"], b: ["vitamin_c"], severity: "medium", title: "레티놀 × 비타민C", message: "pH 차이로 서로의 효능이 감소할 수 있어요.", suggestion: "아침에 비타민C, 저녁에 레티놀로 나눠 사용하면 완벽해요!" },
  { id: "B05", a: ["aha", "bha"], b: ["vitamin_c"], severity: "medium", title: "각질케어 × 비타민C", message: "민감피부에 자극이 될 수 있어요.", suggestion: "시간차를 두거나 번갈아 사용해 보세요." },
  { id: "B06", a: ["aha"], b: ["bha"], severity: "medium", title: "AHA × BHA", message: "동시 사용 시 과도한 각질제거로 피부장벽이 약해질 수 있어요.", suggestion: "하나만 선택하거나 번갈아 사용하는 게 안전해요." },
  { id: "B07", a: ["bpo"], b: ["vitamin_c"], severity: "high", title: "벤조일퍼옥사이드 × 비타민C", message: "비타민C를 산화시켜 효능이 완전히 무력화돼요.", suggestion: "절대 동시 사용 금지! AM/PM으로 완전 분리해 주세요." },
  { id: "B10", a: ["retinol"], b: ["scrub"], severity: "high", title: "레티놀 × 물리적 각질제거", message: "피부장벽이 심하게 손상될 수 있어요.", suggestion: "같은 날 절대 사용하지 마세요. 최소 하루 간격을 두세요." },
  { id: "B15", a: ["aha","bha","pha","retinol","vitamin_c","bpo","scrub"], b: [], severity: "high", isMultiActive: true, title: "🚨 욕심 루틴 경고", message: "강한 액티브 성분 3종 이상을 동시에 사용하고 있어요.", suggestion: "하루에 액티브는 1~2종이 적당해요. 나머지는 다른 날로 분배해 보세요." },
];

const FREQ_OPTIONS = [
  { id: "daily", label: "매일" },
  { id: "often", label: "주3~4회" },
  { id: "sometimes", label: "주1~2회" },
  { id: "rarely", label: "가끔" },
];

function getAllCategories() {
  const all = [];
  Object.values(CATEGORIES).forEach(g => g.items.forEach(i => all.push(i)));
  return all;
}
function findCategory(id) { return getAllCategories().find(c => c.id === id); }

function checkConflicts(products) {
  const productIds = products.map(p => p.categoryId);
  const conflicts = [];
  CONFLICT_RULES.forEach(rule => {
    if (rule.isMultiActive) {
      const ap = products.filter(p => findCategory(p.categoryId)?.tag === "active");
      if (ap.length >= 3) conflicts.push({ ...rule, involvedProducts: ap.map(p => p.name) });
    } else {
      const hasA = rule.a.some(id => productIds.includes(id));
      const hasB = rule.b.some(id => productIds.includes(id));
      if (hasA && hasB) {
        const inv = [...products.filter(p => rule.a.includes(p.categoryId)), ...products.filter(p => rule.b.includes(p.categoryId))];
        conflicts.push({ ...rule, involvedProducts: inv.map(p => p.name) });
      }
    }
  });
  return conflicts;
}

// ─── Enhanced AM/PM Routine Generation ───
function generateRoutine(products, skinType, concerns) {
  const hasSunscreen = products.some(p => p.categoryId === "sunscreen");
  const hasRetinol = products.some(p => p.categoryId === "retinol");
  const hasAHA = products.some(p => ["aha", "bha", "pha"].includes(p.categoryId));
  const hasVitC = products.some(p => p.categoryId === "vitamin_c");
  const hasOilCleanser = products.some(p => p.categoryId === "oil_cleanser");
  const conflicts = checkConflicts(products);

  // AM: exclude PM-only products, prioritize lightweight
  const amProducts = products
    .filter(p => { const c = findCategory(p.categoryId); return c && (c.time === "am" || c.time === "both"); })
    .sort((a, b) => (findCategory(a.categoryId)?.order || 0) - (findCategory(b.categoryId)?.order || 0));

  // PM: exclude AM-only products, include actives
  const pmProducts = products
    .filter(p => { const c = findCategory(p.categoryId); return c && (c.time === "pm" || c.time === "both"); })
    .sort((a, b) => (findCategory(a.categoryId)?.order || 0) - (findCategory(b.categoryId)?.order || 0));

  // ─── AM/PM Tips (differentiation even with few products) ───
  const amTips = [];
  const pmTips = [];

  // AM-specific tips
  if (hasSunscreen) amTips.push("☀️ 선크림은 외출 20분 전, 500원 동전 크기만큼 충분히 발라주세요.");
  if (hasVitC) amTips.push("🍊 비타민C는 아침에 사용하면 선크림과 시너지로 자외선 방어력이 올라가요.");
  if (!hasVitC && (concerns.includes("pigment") || concerns.includes("aging"))) {
    amTips.push("💡 잡티·탄력 고민이면 아침 세럼 단계에 비타민C를 추가해 보세요.");
  }
  amTips.push("🧊 아침에는 가벼운 제형 위주로! 무거운 크림보다 로션이나 젤이 화장 밀림을 방지해요.");
  if (skinType === "oily") amTips.push("🪞 지성피부는 아침 클렌징을 가볍게, 토너로 피지 정돈 후 가벼운 보습이면 충분해요.");

  // PM-specific tips
  if (hasOilCleanser) pmTips.push("🫧 오일클렌저 → 폼클렌저 이중세안으로 메이크업·선크림 잔여물을 깨끗하게 제거해 주세요.");
  else pmTips.push("💡 저녁에는 오일클렌저로 이중세안하면 모공 속 노폐물까지 깔끔해져요.");
  if (hasRetinol) pmTips.push("🌙 레티놀은 반드시 저녁에만! 피부 재생이 활발한 밤에 효과가 극대화돼요.");
  if (hasAHA) pmTips.push("✨ 각질케어(AHA/BHA)는 저녁 루틴에서 토너 후 사용하고, 다음 날 아침 선크림 필수예요.");
  pmTips.push("🛏️ 저녁에는 두꺼운 크림이나 오일로 수분을 꽉 잠가주세요. 밤 사이 수분 증발을 막아요.");
  if (skinType === "dry") pmTips.push("🧴 건성피부는 크림 위에 페이셜오일이나 수면팩을 덧바르면 다음 날 촉촉함이 달라요.");
  if (skinType === "sensitive") pmTips.push("🌸 민감피부는 저녁에도 자극 성분을 최소화하고, 시카·세라마이드 위주로 장벽을 회복해 주세요.");

  // ─── Missing Step Recommendations ───
  const missingSteps = [];
  if (!hasSunscreen) missingSteps.push({ step: "선크림", why: "자외선은 피부 노화의 80%를 차지해요. 아침 루틴의 마지막은 항상 선크림!", priority: "critical" });
  if (!products.some(p => ["cream", "lotion"].includes(p.categoryId))) missingSteps.push({ step: "보습 크림/로션", why: "수분을 잠가주는 보습제가 없으면 앞 단계 제품이 다 날아가요.", priority: "high" });
  if (!products.some(p => ["cleanser", "oil_cleanser"].includes(p.categoryId))) missingSteps.push({ step: "클렌저", why: "깨끗한 세안 없이는 어떤 성분도 피부에 흡수되기 어려워요.", priority: "high" });
  if (hasRetinol && !hasSunscreen) missingSteps.push({ step: "선크림 (레티놀 사용 시 필수!)", why: "레티놀은 피부를 자외선에 민감하게 만들어요. 선크림은 선택이 아닌 필수!", priority: "critical" });

  // ─── Weekly Calendar ───
  const weekDays = ["월", "화", "수", "목", "금", "토", "일"];
  const calendar = weekDays.map((day, i) => {
    const isRetinolDay = hasRetinol && [1, 3, 5].includes(i); // 화, 목, 토
    const isExfoliateDay = hasAHA && [2, 6].includes(i); // 수, 일
    let pmLabel = "기본 루틴";
    let pmEmoji = "🌙";
    if (isRetinolDay) { pmLabel = "레티놀 Day"; pmEmoji = "💜"; }
    else if (isExfoliateDay) { pmLabel = "각질케어 Day"; pmEmoji = "✨"; }
    return { day, pmLabel, pmEmoji, isRetinolDay, isExfoliateDay };
  });

  // ─── Score ───
  let score = 100;
  if (!hasSunscreen) score -= 25;
  score -= conflicts.filter(c => c.severity === "high").length * 15;
  score -= conflicts.filter(c => c.severity === "medium").length * 8;
  if (products.filter(p => findCategory(p.categoryId)?.tag === "active").length >= 3) score -= 10;
  if (products.length > 10) score -= 5;
  if (missingSteps.some(m => m.priority === "critical")) score -= 10;
  score = Math.max(0, Math.min(100, score));

  return { amProducts, pmProducts, conflicts, score, hasSunscreen, hasRetinol, hasAHA, amTips, pmTips, missingSteps, calendar };
}

const severityConfig = {
  critical: { bg: "#FEE2E2", border: "#FCA5A5", text: "#991B1B", label: "필수" },
  high: { bg: "#FEF3C7", border: "#FCD34D", text: "#92400E", label: "높음" },
  medium: { bg: "#FEF9C3", border: "#FDE047", text: "#854D0E", label: "중간" },
};

// ─── Product Search Component ───
function ProductSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const ref = useRef(null);

  const results = useMemo(() => {
    if (query.length < 1) return [];
    const q = query.toLowerCase();
    return PRODUCT_DB.filter(p =>
      p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowResults(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <input
          placeholder="제품명 또는 브랜드 검색 (예: 라운드랩, 토리든...)"
          value={query}
          onChange={e => { setQuery(e.target.value); setShowResults(true); }}
          onFocus={() => query.length >= 1 && setShowResults(true)}
          style={{ paddingLeft: 40 }}
        />
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#9CA3AF" }}>🔍</span>
      </div>
      {showResults && results.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
          background: "white", borderRadius: 12, marginTop: 4,
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)", border: "1px solid #E5E7EB",
          maxHeight: 280, overflowY: "auto",
        }}>
          {results.map(p => {
            const cat = findCategory(p.categoryId);
            return (
              <div key={p.id} onClick={() => { onSelect(p); setQuery(""); setShowResults(false); }}
                style={{
                  padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #F3F4F6",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#FFF5F0"}
                onMouseLeave={e => e.currentTarget.style.background = "white"}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1F2937" }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>{p.brand}</div>
                </div>
                <span style={{
                  fontSize: 11, color: "#D4726A", background: "#FFF1EE",
                  padding: "3px 8px", borderRadius: 6, fontWeight: 600, whiteSpace: "nowrap",
                }}>{cat?.label}</span>
              </div>
            );
          })}
        </div>
      )}
      {showResults && query.length >= 1 && results.length === 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
          background: "white", borderRadius: 12, marginTop: 4, padding: "16px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)", border: "1px solid #E5E7EB",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 8 }}>
            검색 결과가 없어요 😅
          </div>
          <div style={{ fontSize: 12, color: "#D4726A", fontWeight: 600 }}>
            아래에서 카테고리를 직접 선택해 주세요 ↓
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main App ───
export default function BardaApp() {
  const [step, setStep] = useState(0);
  const [skinType, setSkinType] = useState(null);
  const [concerns, setConcerns] = useState([]);
  const [products, setProducts] = useState([]);
  const [manualMode, setManualMode] = useState(false);
  const [manualProduct, setManualProduct] = useState({ name: "", categoryId: "", frequency: "daily" });
  const [result, setResult] = useState(null);
  const [animateIn, setAnimateIn] = useState(false);
  const [activeTab, setActiveTab] = useState("routine"); // routine | calendar

  useEffect(() => { setAnimateIn(true); const t = setTimeout(() => setAnimateIn(false), 500); return () => clearTimeout(t); }, [step]);

  const toggleConcern = id => setConcerns(prev => prev.includes(id) ? prev.filter(c => c !== id) : prev.length < 2 ? [...prev, id] : prev);

  const addFromSearch = (dbProduct) => {
    setProducts(prev => [...prev, { id: Date.now(), name: dbProduct.name, categoryId: dbProduct.categoryId, frequency: "daily", brand: dbProduct.brand }]);
  };

  const addManualProduct = () => {
    if (!manualProduct.categoryId) return;
    setProducts(prev => [...prev, {
      id: Date.now(),
      name: manualProduct.name || findCategory(manualProduct.categoryId)?.label,
      categoryId: manualProduct.categoryId,
      frequency: manualProduct.frequency,
    }]);
    setManualProduct({ name: "", categoryId: "", frequency: "daily" });
    setManualMode(false);
  };

  const removeProduct = id => setProducts(prev => prev.filter(p => p.id !== id));
  const generateResult = () => { setResult(generateRoutine(products, skinType, concerns)); setStep(4); };

  const scoreColor = s => s >= 80 ? "#059669" : s >= 60 ? "#D97706" : "#DC2626";
  const scoreLabel = s => s >= 90 ? "완벽한 루틴! ✨" : s >= 80 ? "좋은 루틴이에요 👍" : s >= 60 ? "개선하면 더 좋아져요 💪" : "루틴 점검이 필요해요 🔧";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(165deg, #FFF5F0 0%, #FFF0F5 35%, #F5F0FF 70%, #F0F5FF 100%)", fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .fade-in { animation: fadeUp 0.5s ease-out; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scoreReveal { from { stroke-dashoffset: 283; } }
        .hover-lift { transition: all 0.2s ease; cursor: pointer; }
        .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); }
        .btn-primary { background: linear-gradient(135deg, #E8927C 0%, #D4726A 100%); color: white; border: none; padding: 14px 32px; border-radius: 14px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 15px rgba(212,114,106,0.3); font-family: inherit; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(212,114,106,0.4); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .btn-secondary { background: white; color: #6B7280; border: 1.5px solid #E5E7EB; padding: 10px 20px; border-radius: 12px; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .btn-secondary:hover { border-color: #D4726A; color: #D4726A; }
        input, select { width: 100%; padding: 12px 16px; border: 1.5px solid #E5E7EB; border-radius: 12px; font-size: 15px; font-family: inherit; background: white; outline: none; transition: border 0.2s; }
        input:focus, select:focus { border-color: #D4726A; }
        .tab-btn { padding: 10px 20px; border: none; background: none; font-size: 14px; font-weight: 600; cursor: pointer; border-bottom: 2.5px solid transparent; color: #9CA3AF; transition: all 0.2s; font-family: inherit; }
        .tab-btn.active { color: #D4726A; border-bottom-color: #D4726A; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", background: "linear-gradient(135deg, #D4726A, #C2574F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>BARDA</span>
          <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 500 }}>바르게 바르다</span>
        </div>
        {step > 0 && step < 4 && (
          <div style={{ display: "flex", gap: 6 }}>
            {[1,2,3].map(s => <div key={s} style={{ width: s === step ? 24 : 8, height: 8, borderRadius: 4, background: s <= step ? "linear-gradient(135deg, #E8927C, #D4726A)" : "#E5E7EB", transition: "all 0.3s" }} />)}
          </div>
        )}
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px 40px" }} className={animateIn ? "fade-in" : ""}>

        {/* STEP 0: Landing */}
        {step === 0 && (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ width: 100, height: 100, borderRadius: 28, margin: "0 auto 28px", background: "linear-gradient(135deg, #FECDD3, #E8927C)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, boxShadow: "0 12px 40px rgba(212,114,106,0.25)" }}>🧴</div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "#1F2937", marginBottom: 12, letterSpacing: "-0.5px" }}>내 루틴,<br/>바르게 바르고 있을까?</h1>
            <p style={{ fontSize: 16, color: "#6B7280", lineHeight: 1.6, marginBottom: 40 }}>가지고 있는 화장품을 검색하면<br/>AM/PM 루틴 순서부터 위험 조합까지<br/>한 번에 알려드려요</p>
            <button className="btn-primary" onClick={() => setStep(1)} style={{ fontSize: 18, padding: "16px 48px", borderRadius: 16 }}>내 루틴 체크하기 →</button>
            <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 16 }}>무료로 3개 제품까지 체크 가능</p>
          </div>
        )}

        {/* STEP 1: Skin Type */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1F2937", marginBottom: 6 }}>피부타입을 알려주세요</h2>
            <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 24 }}>하나만 선택해 주세요</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {SKIN_TYPES.map(type => (
                <div key={type.id} className="hover-lift" onClick={() => setSkinType(type.id)} style={{ padding: "20px 16px", borderRadius: 16, textAlign: "center", background: skinType === type.id ? "linear-gradient(135deg, #FFF1EE, #FECDD3)" : "white", border: skinType === type.id ? "2px solid #E8927C" : "2px solid transparent", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{type.emoji}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#1F2937" }}>{type.label}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{type.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end" }}>
              <button className="btn-primary" disabled={!skinType} onClick={() => setStep(2)}>다음 →</button>
            </div>
          </div>
        )}

        {/* STEP 2: Concerns */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1F2937", marginBottom: 6 }}>피부 고민을 선택해 주세요</h2>
            <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 24 }}>최대 2개까지 선택 가능</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {CONCERNS.map(c => (
                <div key={c.id} className="hover-lift" onClick={() => toggleConcern(c.id)} style={{ padding: "16px 10px", borderRadius: 14, textAlign: "center", background: concerns.includes(c.id) ? "linear-gradient(135deg, #FFF1EE, #FECDD3)" : "white", border: concerns.includes(c.id) ? "2px solid #E8927C" : "2px solid transparent", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{c.emoji}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1F2937" }}>{c.label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between" }}>
              <button className="btn-secondary" onClick={() => setStep(1)}>← 이전</button>
              <button className="btn-primary" disabled={concerns.length === 0} onClick={() => setStep(3)}>다음 →</button>
            </div>
          </div>
        )}

        {/* STEP 3: Products */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1F2937", marginBottom: 6 }}>보유 제품을 등록해 주세요</h2>
            <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 20 }}>제품명을 검색하거나, 직접 카테고리를 선택해도 돼요</p>

            {/* Search */}
            <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", marginBottom: 12 }}>
              <ProductSearch onSelect={addFromSearch} />
              <div style={{ textAlign: "center", margin: "12px 0 0" }}>
                <button onClick={() => setManualMode(!manualMode)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#D4726A", fontWeight: 600, fontFamily: "inherit" }}>
                  {manualMode ? "검색으로 돌아가기 ↑" : "제품이 검색에 없나요? 직접 입력 →"}
                </button>
              </div>
            </div>

            {/* Manual input */}
            {manualMode && (
              <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1F2937", marginBottom: 12 }}>직접 입력</div>
                <input placeholder="제품명 (선택)" value={manualProduct.name} onChange={e => setManualProduct({...manualProduct, name: e.target.value})} style={{ marginBottom: 10 }} />
                <select value={manualProduct.categoryId} onChange={e => setManualProduct({...manualProduct, categoryId: e.target.value})} style={{ marginBottom: 10, color: manualProduct.categoryId ? "#1F2937" : "#9CA3AF" }}>
                  <option value="">카테고리 선택 *</option>
                  {Object.entries(CATEGORIES).map(([key, group]) => (
                    <optgroup key={key} label={group.label}>
                      {group.items.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
                    </optgroup>
                  ))}
                </select>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                  {FREQ_OPTIONS.map(f => (
                    <button key={f.id} onClick={() => setManualProduct({...manualProduct, frequency: f.id})} style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid", borderColor: manualProduct.frequency === f.id ? "#D4726A" : "#E5E7EB", background: manualProduct.frequency === f.id ? "#FFF1EE" : "white", color: manualProduct.frequency === f.id ? "#D4726A" : "#6B7280", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                      {f.label}
                    </button>
                  ))}
                </div>
                <button className="btn-primary" onClick={addManualProduct} disabled={!manualProduct.categoryId} style={{ width: "100%", padding: 12 }}>+ 제품 추가</button>
              </div>
            )}

            {/* Product list */}
            {products.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 8 }}>등록된 제품 ({products.length}개)</div>
                {products.map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "white", borderRadius: 12, padding: "12px 16px", marginBottom: 6, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1F2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                        <span style={{ fontSize: 11, color: "#D4726A", background: "#FFF1EE", padding: "2px 8px", borderRadius: 6, fontWeight: 500 }}>{findCategory(p.categoryId)?.label}</span>
                        {p.brand && <span style={{ fontSize: 11, color: "#6B7280", background: "#F3F4F6", padding: "2px 8px", borderRadius: 6 }}>{p.brand}</span>}
                      </div>
                    </div>
                    <button onClick={() => removeProduct(p.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#D1D5DB", padding: "4px 8px", marginLeft: 8 }}>×</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button className="btn-secondary" onClick={() => setStep(2)}>← 이전</button>
              <button className="btn-primary" disabled={products.length === 0} onClick={generateResult}>루틴 분석하기 ✨</button>
            </div>
          </div>
        )}

        {/* STEP 4: Result */}
        {step === 4 && result && (
          <div>
            {/* Score */}
            <div style={{ textAlign: "center", background: "white", borderRadius: 20, padding: "32px 20px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", marginBottom: 20 }}>
              <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 16px" }}>
                <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#F3F4F6" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke={scoreColor(result.score)} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(result.score / 100) * 314} 314`} style={{ animation: "scoreReveal 1.5s ease-out" }} />
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: 36, fontWeight: 800, color: scoreColor(result.score) }}>{result.score}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1F2937" }}>{scoreLabel(result.score)}</div>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4 }}>{SKIN_TYPES.find(s => s.id === skinType)?.label} · 제품 {products.length}개 분석</div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1.5px solid #E5E7EB", marginBottom: 16 }}>
              <button className={`tab-btn ${activeTab === "routine" ? "active" : ""}`} onClick={() => setActiveTab("routine")}>루틴 분석</button>
              <button className={`tab-btn ${activeTab === "calendar" ? "active" : ""}`} onClick={() => setActiveTab("calendar")}>주간 캘린더</button>
            </div>

            {activeTab === "routine" && (
              <>
                {/* Missing Steps */}
                {result.missingSteps.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#1F2937", marginBottom: 8 }}>📋 빠진 필수 단계</div>
                    {result.missingSteps.map((m, i) => (
                      <div key={i} style={{ background: m.priority === "critical" ? "#FEE2E2" : "#FEF3C7", borderRadius: 12, padding: "12px 14px", marginBottom: 6, border: `1px solid ${m.priority === "critical" ? "#FCA5A5" : "#FCD34D"}` }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: m.priority === "critical" ? "#991B1B" : "#92400E" }}>+ {m.step}</div>
                        <div style={{ fontSize: 12, color: m.priority === "critical" ? "#991B1B" : "#92400E", marginTop: 2, lineHeight: 1.4 }}>{m.why}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* AM Routine */}
                <div style={{ background: "white", borderRadius: 18, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ background: "linear-gradient(135deg, #FEF3C7, #FDE68A)", borderRadius: 10, padding: "6px 12px", fontSize: 20 }}>☀️</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#1F2937" }}>아침 루틴 (AM)</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 14, paddingLeft: 52 }}>가볍게, 보호 중심으로</div>
                  {result.amProducts.length === 0 ? (
                    <p style={{ fontSize: 14, color: "#9CA3AF" }}>아침 루틴 제품이 없어요</p>
                  ) : result.amProducts.map((p, i) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < result.amProducts.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #E8927C, #D4726A)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#1F2937" }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: "#9CA3AF" }}>{findCategory(p.categoryId)?.label}</div>
                      </div>
                    </div>
                  ))}
                  {!result.hasSunscreen && (
                    <div style={{ marginTop: 12, padding: "10px 14px", background: "#FEE2E2", borderRadius: 10, fontSize: 13, color: "#991B1B", fontWeight: 600 }}>⚠️ 선크림을 꼭 추가해 주세요!</div>
                  )}
                  {/* AM Tips */}
                  <div style={{ marginTop: 14, background: "#FFFBEB", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#92400E", marginBottom: 8 }}>☀️ 아침 루틴 TIP</div>
                    {result.amTips.slice(0, 3).map((tip, i) => (
                      <div key={i} style={{ fontSize: 12, color: "#78716C", lineHeight: 1.5, marginBottom: 4 }}>{tip}</div>
                    ))}
                  </div>
                </div>

                {/* PM Routine */}
                <div style={{ background: "white", borderRadius: 18, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ background: "linear-gradient(135deg, #DDD6FE, #C4B5FD)", borderRadius: 10, padding: "6px 12px", fontSize: 20 }}>🌙</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#1F2937" }}>저녁 루틴 (PM)</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 14, paddingLeft: 52 }}>집중 케어, 회복 중심으로</div>
                  {result.pmProducts.length === 0 ? (
                    <p style={{ fontSize: 14, color: "#9CA3AF" }}>저녁 루틴 제품이 없어요</p>
                  ) : result.pmProducts.map((p, i) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < result.pmProducts.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #A78BFA, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#1F2937" }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: "#9CA3AF" }}>{findCategory(p.categoryId)?.label}</div>
                      </div>
                    </div>
                  ))}
                  {/* PM Tips */}
                  <div style={{ marginTop: 14, background: "#F3E8FF", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#6B21A8", marginBottom: 8 }}>🌙 저녁 루틴 TIP</div>
                    {result.pmTips.slice(0, 3).map((tip, i) => (
                      <div key={i} style={{ fontSize: 12, color: "#78716C", lineHeight: 1.5, marginBottom: 4 }}>{tip}</div>
                    ))}
                  </div>
                </div>

                {/* Conflicts */}
                {result.conflicts.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#1F2937", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      <span>⚡</span> 충돌 경고 ({result.conflicts.length}건)
                    </div>
                    {result.conflicts.map((c, i) => {
                      const cfg = severityConfig[c.severity];
                      return (
                        <div key={i} style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "white", background: c.severity === "high" ? "#DC2626" : "#D97706", padding: "2px 8px", borderRadius: 6 }}>{cfg.label}</span>
                            <span style={{ fontSize: 15, fontWeight: 700, color: cfg.text }}>{c.title}</span>
                          </div>
                          <div style={{ fontSize: 13, color: cfg.text, lineHeight: 1.5, marginBottom: 4 }}>{c.message}</div>
                          <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 8 }}>관련 제품: {c.involvedProducts?.join(", ")}</div>
                          <div style={{ fontSize: 13, color: cfg.text, background: "rgba(255,255,255,0.6)", borderRadius: 8, padding: "8px 12px", lineHeight: 1.4 }}>💡 {c.suggestion}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Calendar Tab */}
            {activeTab === "calendar" && (
              <div style={{ background: "white", borderRadius: 18, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1F2937", marginBottom: 4 }}>📅 7일 루틴 캘린더</div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 16 }}>요일별로 다른 저녁 루틴을 추천해요</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                  {result.calendar.map((d, i) => (
                    <div key={i} style={{ textAlign: "center", padding: "8px 2px", borderRadius: 12, background: d.isRetinolDay ? "#F3E8FF" : d.isExfoliateDay ? "#FEF3C7" : "#F9FAFB" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 4 }}>{d.day}</div>
                      <div style={{ fontSize: 18, marginBottom: 2 }}>{d.pmEmoji}</div>
                      <div style={{ fontSize: 9, fontWeight: 600, color: d.isRetinolDay ? "#7C3AED" : d.isExfoliateDay ? "#D97706" : "#9CA3AF", lineHeight: 1.2 }}>{d.pmLabel}</div>
                    </div>
                  ))}
                </div>
                {(result.hasRetinol || result.hasAHA) && (
                  <div style={{ marginTop: 16, fontSize: 12, color: "#6B7280", lineHeight: 1.6, background: "#F9FAFB", borderRadius: 10, padding: 12 }}>
                    {result.hasRetinol && <div>💜 <b>레티놀 Day</b>: 저녁 루틴에서 레티놀 사용. 다음 날 아침 선크림 필수!</div>}
                    {result.hasAHA && <div>✨ <b>각질케어 Day</b>: AHA/BHA 사용일. 레티놀과 겹치지 않게 배치했어요.</div>}
                    <div>🌙 <b>기본 루틴</b>: 액티브 없이 보습 중심으로 피부 쉬는 날.</div>
                  </div>
                )}
                {!result.hasRetinol && !result.hasAHA && (
                  <div style={{ marginTop: 12, fontSize: 13, color: "#9CA3AF", textAlign: "center", lineHeight: 1.5 }}>
                    현재 액티브 성분이 적어서 매일 같은 루틴이에요.<br/>
                    레티놀이나 각질케어 제품을 추가하면<br/>요일별 맞춤 캘린더가 생성돼요! ✨
                  </div>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <div style={{ background: "#F9FAFB", borderRadius: 12, padding: 14, marginBottom: 20, border: "1px solid #E5E7EB" }}>
              <div style={{ fontSize: 11, color: "#9CA3AF", lineHeight: 1.6 }}>
                📋 본 서비스는 일반적인 뷰티 가이드이며 의학적 진단이나 치료를 대체하지 않습니다. 피부 자극이나 이상 반응이 있으면 사용을 중단하고 전문의와 상담하세요.
              </div>
            </div>

            {/* CTA */}
            <div style={{ textAlign: "center" }}>
              <button className="btn-primary" onClick={() => { setStep(0); setProducts([]); setSkinType(null); setConcerns([]); setResult(null); setActiveTab("routine"); }} style={{ width: "100%", marginBottom: 10 }}>처음부터 다시하기</button>
              <p style={{ fontSize: 12, color: "#9CA3AF" }}>BARDA · 바르게 바르다 · Prototype v0.2</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
