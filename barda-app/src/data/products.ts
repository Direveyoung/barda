/* ─── Types ─── */

export interface Product {
  id: string;
  brand: string;
  name: string;
  categoryId: string;
  active_flags?: string[];
  concentration_level?: "low" | "medium" | "high";
  key_ingredients?: string[];
  tags?: string[];
  source?: string;
  verified?: boolean;
}

export interface CategoryItem {
  id: string;
  label: string;
  tag?: "active" | "basic";
  time: "am" | "pm" | "both";
  order: number;
  emoji: string;
}

/* ─── Categories ─── */

export const CATEGORIES: Record<string, { label: string; items: CategoryItem[] }> = {
  cleansing: {
    label: "클렌징",
    items: [
      { id: "oil_cleanser", label: "오일/밤 클렌저", time: "both", order: 1, emoji: "🧴" },
      { id: "cleanser", label: "폼/젤 클렌저", time: "both", order: 2, emoji: "🫧" },
    ],
  },
  toner: {
    label: "토너/패드",
    items: [
      { id: "toner", label: "토너", time: "both", order: 3, emoji: "💧" },
      { id: "toner_pad", label: "토너 패드", time: "both", order: 4, emoji: "🧻" },
    ],
  },
  essence: {
    label: "에센스/앰플",
    items: [
      { id: "essence", label: "에센스", time: "both", order: 5, emoji: "✨" },
      { id: "ampoule", label: "앰플", time: "both", order: 6, emoji: "💎" },
    ],
  },
  serum: {
    label: "세럼/액티브",
    items: [
      { id: "vitamin_c", label: "비타민C 세럼", tag: "active", time: "am", order: 7, emoji: "🍊" },
      { id: "niacinamide", label: "나이아신아마이드", time: "both", order: 8, emoji: "⚡" },
      { id: "hyaluronic", label: "히알루론산", time: "both", order: 8, emoji: "💦" },
      { id: "retinol", label: "레티놀", tag: "active", time: "pm", order: 9, emoji: "💜" },
      { id: "aha", label: "AHA", tag: "active", time: "pm", order: 9, emoji: "✨" },
      { id: "bha", label: "BHA", tag: "active", time: "pm", order: 9, emoji: "🔵" },
      { id: "pha", label: "PHA", tag: "active", time: "pm", order: 9, emoji: "🟢" },
    ],
  },
  moisturizer: {
    label: "보습",
    items: [
      { id: "lotion", label: "로션/에멀전", time: "both", order: 10, emoji: "🧴" },
      { id: "cream", label: "크림", time: "both", order: 11, emoji: "🫙" },
      { id: "sleeping_pack", label: "수면팩", time: "pm", order: 12, emoji: "🌙" },
    ],
  },
  sun: {
    label: "선케어",
    items: [
      { id: "sunscreen", label: "선크림", time: "am", order: 13, emoji: "☀️" },
    ],
  },
  special: {
    label: "스페셜",
    items: [
      { id: "eye_cream", label: "아이크림", time: "both", order: 10, emoji: "👁️" },
      { id: "spot_treatment", label: "스팟 트리트먼트", time: "pm", order: 9, emoji: "🎯" },
      { id: "mask_pack", label: "마스크팩", time: "pm", order: 14, emoji: "🎭" },
    ],
  },
};

/* ─── Product Database ─── */

export const ALL_PRODUCTS: Product[] = [
  // ── 오일/밤 클렌저 ──
  { id: "banilaco-clean-it-zero", brand: "바닐라코", name: "클린잇제로", categoryId: "oil_cleanser", key_ingredients: ["셰릴 오일", "토코페롤"], tags: ["올리브영베스트", "저자극"], source: "manual_v1", verified: true },
  { id: "manyo-pure-cleansing-oil", brand: "마녀공장", name: "퓨어 클렌징 오일", categoryId: "oil_cleanser", key_ingredients: ["호호바 오일", "아르간 오일"], tags: ["올리브영베스트", "저자극"], source: "manual_v1", verified: true },
  { id: "innisfree-apple-seed-oil", brand: "이니스프리", name: "애플시드 클렌징 오일", categoryId: "oil_cleanser", key_ingredients: ["사과씨 오일", "올리브 오일"], tags: ["저자극"], source: "manual_v1", verified: true },
  { id: "roundlab-soybean-oil", brand: "라운드랩", name: "1025 독도 클렌징 오일", categoryId: "oil_cleanser", key_ingredients: ["대두 오일", "해양심층수"], tags: ["올리브영베스트", "저자극"], source: "manual_v1", verified: true },
  { id: "hera-sun-mate-cleansing", brand: "헤라", name: "셀에센스 클렌징 오일", categoryId: "oil_cleanser", key_ingredients: ["식물성 오일", "비타민E"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "heimish-all-clean-balm", brand: "헤이미쉬", name: "올클린 밤", categoryId: "oil_cleanser", key_ingredients: ["시어버터", "코코넛 오일"], tags: ["올리브영베스트", "저자극"], source: "manual_v1", verified: true },
  { id: "skinfood-black-sugar-oil", brand: "스킨푸드", name: "블랙슈가 클렌징 오일", categoryId: "oil_cleanser", key_ingredients: ["흑설탕", "식물성 오일"], tags: ["각질"], source: "manual_v1", verified: true },
  { id: "dalba-white-truffle-oil", brand: "달바", name: "화이트 트러플 클렌징 오일", categoryId: "oil_cleanser", key_ingredients: ["화이트 트러플", "올리브 오일"], tags: ["올리브영베스트", "안티에이징"], source: "manual_v1", verified: true },
  { id: "beplain-greenful-oil", brand: "비플레인", name: "그린풀 클렌징 오일", categoryId: "oil_cleanser", key_ingredients: ["녹차씨 오일", "올리브 오일"], tags: ["저자극", "진정"], source: "manual_v1", verified: true },

  // ── 폼/젤 클렌저 ──
  { id: "cosrx-low-ph-cleanser", brand: "코스알엑스", name: "로우 pH 굿모닝 젤 클렌저", categoryId: "cleanser", key_ingredients: ["약산성 pH 5.5", "티트리 오일"], tags: ["올리브영베스트", "저자극", "트러블"], source: "manual_v1", verified: true },
  { id: "innisfree-green-tea-foam", brand: "이니스프리", name: "그린티 폼 클렌저", categoryId: "cleanser", key_ingredients: ["녹차", "아미노산 계면활성제"], tags: ["수분", "저자극"], source: "manual_v1", verified: true },
  { id: "roundlab-dokdo-cleanser", brand: "라운드랩", name: "1025 독도 클렌저", categoryId: "cleanser", key_ingredients: ["해양심층수", "약산성 pH 5.5"], tags: ["올리브영베스트", "저자극", "수분"], source: "manual_v1", verified: true },
  { id: "sulwhasoo-gentle-foam", brand: "설화수", name: "순행 클렌징 폼", categoryId: "cleanser", key_ingredients: ["인삼", "약산성"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "etude-soojung-cleanser", brand: "에뛰드", name: "순정 약산성 클렌저", categoryId: "cleanser", key_ingredients: ["약산성 pH 5.5", "판테놀"], tags: ["저자극", "진정"], source: "manual_v1", verified: true },
  { id: "cerave-foaming-cleanser", brand: "세라비", name: "포밍 클렌저", categoryId: "cleanser", key_ingredients: ["세라마이드", "나이아신아마이드", "히알루론산"], tags: ["저자극", "보습강화"], source: "manual_v1", verified: true },
  { id: "isntree-sensitive-cleanser", brand: "이즈앤트리", name: "센시티브 밸런싱 클렌저", categoryId: "cleanser", key_ingredients: ["판테놀", "센텔라"], tags: ["저자극", "진정"], source: "manual_v1", verified: true },
  { id: "lrp-effaclar-gel", brand: "라로슈포제", name: "에빠끌라 젤 클렌저", categoryId: "cleanser", key_ingredients: ["살리실산", "징크 피도넥트"], tags: ["트러블", "피지조절"], source: "manual_v1", verified: true },
  { id: "drg-ph-cleansing-gel", brand: "닥터지", name: "레드 블레미쉬 클리어 수딩 클렌저", categoryId: "cleanser", key_ingredients: ["시카", "살리실산"], tags: ["트러블", "진정"], source: "manual_v1", verified: true },
  { id: "anua-heartleaf-cleanser", brand: "아누아", name: "어성초 77 클렌징 폼", categoryId: "cleanser", key_ingredients: ["어성초 77%", "약산성"], tags: ["올리브영베스트", "진정", "트러블"], source: "manual_v1", verified: true },
  { id: "illiyoon-ceramide-cleanser", brand: "일리윤", name: "세라마이드 아토 젠틀 폼", categoryId: "cleanser", key_ingredients: ["세라마이드", "약산성"], tags: ["저자극", "보습강화"], source: "manual_v1", verified: true },
  { id: "bioderma-sensibio-gel", brand: "바이오더마", name: "센시비오 젤 무쌍", categoryId: "cleanser", key_ingredients: ["D.A.F. 컴플렉스", "코코넛 유래 계면활성제"], tags: ["저자극", "진정"], source: "manual_v1", verified: true },
  { id: "primera-mild-cleanser", brand: "프리메라", name: "마일드 콤포팅 클렌저", categoryId: "cleanser", key_ingredients: ["시드 콤플렉스", "알란토인"], tags: ["저자극", "진정"], source: "manual_v1", verified: true },
  { id: "beplain-greenful-cleanser", brand: "비플레인", name: "그린풀 클렌저", categoryId: "cleanser", key_ingredients: ["녹차", "약산성 pH 5.5"], tags: ["저자극", "수분"], source: "manual_v1", verified: true },
  { id: "dewytree-cica-cleanser", brand: "듀이트리", name: "시카 로우 pH 클렌저", categoryId: "cleanser", key_ingredients: ["시카", "약산성 pH 5.5"], tags: ["저자극", "진정"], source: "manual_v1", verified: true },
  { id: "one-thing-centella-cleanser", brand: "원씽", name: "센텔라 수딩 클렌저", categoryId: "cleanser", key_ingredients: ["센텔라", "약산성"], tags: ["저자극", "진정"], source: "manual_v1", verified: true },

  // ── 토너 ──
  { id: "roundlab-dokdo-toner", brand: "라운드랩", name: "1025 독도 토너", categoryId: "toner", key_ingredients: ["해양심층수", "히알루론산"], tags: ["올리브영베스트", "수분", "저자극"], source: "manual_v1", verified: true },
  { id: "cosrx-propolis-toner", brand: "코스알엑스", name: "풀핏 프로폴리스 시너지 토너", categoryId: "toner", key_ingredients: ["프로폴리스 72.6%", "꿀"], tags: ["수분", "진정"], source: "manual_v1", verified: true },
  { id: "innisfree-green-tea-toner", brand: "이니스프리", name: "그린티 씨드 토너", categoryId: "toner", key_ingredients: ["녹차 씨", "히알루론산"], tags: ["수분"], source: "manual_v1", verified: true },
  { id: "laneige-cream-skin", brand: "라네즈", name: "크림스킨 토너&모이스처라이저", categoryId: "toner", key_ingredients: ["백차", "세라마이드"], tags: ["올리브영베스트", "보습강화"], source: "manual_v1", verified: true },
  { id: "missha-artemisia-toner", brand: "미샤", name: "개똥쑥 트리트먼트 에센스", categoryId: "toner", key_ingredients: ["개똥쑥 추출물 95%"], tags: ["진정", "저자극"], source: "manual_v1", verified: true },
  { id: "klairs-supple-toner", brand: "디어클레어스", name: "서플 프레퍼레이션 토너", categoryId: "toner", key_ingredients: ["히알루론산", "센텔라"], tags: ["수분", "저자극", "진정"], source: "manual_v1", verified: true },
  { id: "anua-heartleaf-toner", brand: "아누아", name: "어성초 77 토너", categoryId: "toner", key_ingredients: ["어성초 77%", "판테놀"], tags: ["올리브영베스트", "진정", "트러블"], source: "manual_v1", verified: true },
  { id: "isntree-hyaluronic-toner", brand: "이즈앤트리", name: "히알루론산 토너", categoryId: "toner", key_ingredients: ["히알루론산 50%"], tags: ["수분", "보습강화"], source: "manual_v1", verified: true },
  { id: "numbuzin-no3-toner", brand: "넘버즈인", name: "3번 토너", categoryId: "toner", key_ingredients: ["갈락토미세스", "나이아신아마이드"], tags: ["올리브영베스트", "미백", "톤업"], source: "manual_v1", verified: true },
  { id: "hanyul-artemisia-toner", brand: "한율", name: "쑥 진정 토너", categoryId: "toner", key_ingredients: ["쑥 추출물", "병풀"], tags: ["진정", "저자극"], source: "manual_v1", verified: true },
  { id: "skii-treatment-essence", brand: "SK-II", name: "페이셜 트리트먼트 에센스", categoryId: "toner", key_ingredients: ["피테라 90%"], tags: ["미백", "안티에이징"], source: "manual_v1", verified: true },
  { id: "torriden-dive-in-toner", brand: "토리든", name: "다이브인 로우 몰큘러 토너", categoryId: "toner", key_ingredients: ["5가지 히알루론산"], tags: ["올리브영베스트", "수분", "보습강화"], source: "manual_v1", verified: true },
  { id: "goodal-green-tangerine-toner", brand: "구달", name: "청귤 비타C 토너", categoryId: "toner", active_flags: ["vitamin_c"], concentration_level: "low", key_ingredients: ["비타민C", "청귤"], tags: ["미백", "톤업"], source: "manual_v1", verified: true },
  { id: "one-thing-centella-toner", brand: "원씽", name: "센텔라 아시아티카 추출물", categoryId: "toner", key_ingredients: ["센텔라 아시아티카"], tags: ["진정", "저자극"], source: "manual_v1", verified: true },
  { id: "mamonde-rose-toner", brand: "마몽드", name: "로즈 워터 토너", categoryId: "toner", key_ingredients: ["다마스크 장미수 90.89%"], tags: ["수분", "톤업"], source: "manual_v1", verified: true },
  { id: "beplain-chamomile-toner", brand: "비플레인", name: "캐모마일 pH 밸런싱 토너", categoryId: "toner", key_ingredients: ["캐모마일", "약산성 pH"], tags: ["저자극", "진정"], source: "manual_v1", verified: true },
  { id: "dalba-white-truffle-mist", brand: "달바", name: "화이트 트러플 미스트 세럼", categoryId: "toner", key_ingredients: ["화이트 트러플", "나이아신아마이드"], tags: ["올리브영베스트", "미백", "수분"], source: "manual_v1", verified: true },
  { id: "abib-heartleaf-toner", brand: "아비브", name: "어성초 카밍 토너 핏", categoryId: "toner", key_ingredients: ["어성초", "판테놀"], tags: ["올리브영베스트", "진정", "저자극"], source: "manual_v1", verified: true },

  // ── 토너 패드 ──
  { id: "cosrx-bha-pad", brand: "코스알엑스", name: "원스텝 오리지널 클리어 패드", categoryId: "toner_pad", active_flags: ["bha"], concentration_level: "low", key_ingredients: ["BHA 1%", "버드나무껍질"], tags: ["올리브영베스트", "모공", "각질"], source: "manual_v1", verified: true },
  { id: "cosrx-aha-pad", brand: "코스알엑스", name: "원스텝 그린 히어로 패드", categoryId: "toner_pad", active_flags: ["aha"], concentration_level: "low", key_ingredients: ["AHA", "녹차"], tags: ["각질", "톤업"], source: "manual_v1", verified: true },
  { id: "neogen-bio-peel-wine", brand: "네오젠", name: "바이오필 와인 패드", categoryId: "toner_pad", active_flags: ["aha"], concentration_level: "medium", key_ingredients: ["AHA", "와인 추출물"], tags: ["각질", "톤업", "안티에이징"], source: "manual_v1", verified: true },
  { id: "neogen-bio-peel-lemon", brand: "네오젠", name: "바이오필 레몬 패드", categoryId: "toner_pad", active_flags: ["aha", "vitamin_c"], concentration_level: "low", key_ingredients: ["AHA", "비타민C", "레몬"], tags: ["각질", "미백"], source: "manual_v1", verified: true },
  { id: "medicube-zero-pore-pad", brand: "메디큐브", name: "제로모공 패드 2.0", categoryId: "toner_pad", active_flags: ["bha"], concentration_level: "medium", key_ingredients: ["BHA", "AHA", "나이아신아마이드"], tags: ["올리브영베스트", "모공", "피지조절"], source: "manual_v1", verified: true },
  { id: "numbuzin-no5-pad", brand: "넘버즈인", name: "5번 패드", categoryId: "toner_pad", active_flags: ["bha"], concentration_level: "low", key_ingredients: ["BHA", "판테놀"], tags: ["올리브영베스트", "모공", "저자극"], source: "manual_v1", verified: true },
  { id: "somebymi-miracle-toner-pad", brand: "썸바이미", name: "AHA BHA PHA 미라클 토너 패드", categoryId: "toner_pad", active_flags: ["aha", "bha", "pha"], concentration_level: "low", key_ingredients: ["AHA", "BHA", "PHA"], tags: ["각질", "트러블"], source: "manual_v1", verified: true },
  { id: "vt-cica-mild-pad", brand: "VT코스메틱", name: "시카 마일드 토너 패드", categoryId: "toner_pad", key_ingredients: ["시카", "판테놀"], tags: ["진정", "저자극"], source: "manual_v1", verified: true },
  { id: "anua-heartleaf-pad", brand: "아누아", name: "어성초 77 토너 패드", categoryId: "toner_pad", key_ingredients: ["어성초 77%", "위치하젤"], tags: ["올리브영베스트", "진정", "모공"], source: "manual_v1", verified: true },
  { id: "roundlab-birch-pad", brand: "라운드랩", name: "자작나무 수분 토너 패드", categoryId: "toner_pad", key_ingredients: ["자작나무 수액", "히알루론산"], tags: ["올리브영베스트", "수분"], source: "manual_v1", verified: true },
  { id: "goodal-apple-aha-pad", brand: "구달", name: "사과 AHA 클리어링 패드", categoryId: "toner_pad", active_flags: ["aha"], concentration_level: "low", key_ingredients: ["AHA", "사과 추출물"], tags: ["각질", "톤업"], source: "manual_v1", verified: true },
  { id: "abib-heartleaf-pad", brand: "아비브", name: "어성초 카밍 토너 패드", categoryId: "toner_pad", key_ingredients: ["어성초", "판테놀"], tags: ["올리브영베스트", "진정", "저자극"], source: "manual_v1", verified: true },

  // ── 에센스 ──
  { id: "cosrx-snail-essence", brand: "코스알엑스", name: "어드밴스드 스네일 96 에센스", categoryId: "essence", key_ingredients: ["달팽이 뮤신 96%"], tags: ["올리브영베스트", "수분", "진정"], source: "manual_v1", verified: true },
  { id: "manyo-bifida-essence", brand: "마녀공장", name: "비피다 바이옴 컴플렉스 앰플", categoryId: "essence", key_ingredients: ["비피다", "락토바실러스"], tags: ["올리브영베스트", "안티에이징"], source: "manual_v1", verified: true },
  { id: "missha-fte", brand: "미샤", name: "타임레볼루션 FTE", categoryId: "essence", key_ingredients: ["발효 효모 추출물 95%"], tags: ["미백", "안티에이징"], source: "manual_v1", verified: true },
  { id: "sulwhasoo-first-care", brand: "설화수", name: "윤조에센스", categoryId: "essence", key_ingredients: ["JAUM 밸런싱 콤플렉스", "인삼"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "iope-stem3", brand: "아이오페", name: "스템III 세럼", categoryId: "essence", key_ingredients: ["줄기세포 추출물", "나이아신아마이드"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "innisfree-green-tea-seed", brand: "이니스프리", name: "그린티 씨드 세럼", categoryId: "essence", key_ingredients: ["녹차씨 오일", "녹차 추출물"], tags: ["수분"], source: "manual_v1", verified: true },
  { id: "numbuzin-no5-serum", brand: "넘버즈인", name: "5번 세럼", categoryId: "essence", key_ingredients: ["판테놀", "히알루론산"], tags: ["올리브영베스트", "수분", "진정"], source: "manual_v1", verified: true },
  { id: "torriden-dive-in-serum", brand: "토리든", name: "다이브인 세럼", categoryId: "essence", key_ingredients: ["저분자 히알루론산"], tags: ["올리브영베스트", "수분", "보습강화"], source: "manual_v1", verified: true },
  { id: "beauty-of-joseon-glow", brand: "조선미녀", name: "광채 세럼", categoryId: "essence", key_ingredients: ["프로폴리스", "나이아신아마이드"], tags: ["올리브영베스트", "미백", "톤업"], source: "manual_v1", verified: true },
  { id: "hera-cell-bio-serum", brand: "헤라", name: "셀 바이오 세럼", categoryId: "essence", key_ingredients: ["바이오 리페어 콤플렉스"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "one-thing-galactomyces", brand: "원씽", name: "갈락토미세스 발효 여과물", categoryId: "essence", key_ingredients: ["갈락토미세스 발효 여과물 98.5%"], tags: ["미백", "톤업"], source: "manual_v1", verified: true },
  { id: "abib-yuja-essence", brand: "아비브", name: "유자 에센스 칼로리 에디션", categoryId: "essence", key_ingredients: ["유자", "비타민C"], tags: ["올리브영베스트", "미백", "톤업"], source: "manual_v1", verified: true },
  { id: "beplain-artemisia-essence", brand: "비플레인", name: "아르테미시아 에센스", categoryId: "essence", key_ingredients: ["쑥 추출물"], tags: ["진정", "저자극"], source: "manual_v1", verified: true },
  { id: "dewytree-ultra-vitalizing-snail", brand: "듀이트리", name: "울트라 바이탈라이징 달팽이 에센스", categoryId: "essence", key_ingredients: ["달팽이 뮤신", "히알루론산"], tags: ["수분", "안티에이징"], source: "manual_v1", verified: true },

  // ── 앰플 ──
  { id: "cnp-propolis-ampoule", brand: "CNP", name: "프로폴리스 에너지 앰플", categoryId: "ampoule", key_ingredients: ["프로폴리스"], tags: ["올리브영베스트", "진정", "수분"], source: "manual_v1", verified: true },
  { id: "laneige-radian-c", brand: "라네즈", name: "래디언-C 앰플", categoryId: "ampoule", active_flags: ["vitamin_c"], concentration_level: "medium", key_ingredients: ["비타민C", "비타민E"], tags: ["미백", "톤업"], source: "manual_v1", verified: true },
  { id: "drjart-ceramidin-liquid", brand: "닥터자르트", name: "세라마이딘 리퀴드", categoryId: "ampoule", key_ingredients: ["세라마이드"], tags: ["보습강화", "저자극"], source: "manual_v1", verified: true },
  { id: "isntree-green-tea-ampoule", brand: "이즈앤트리", name: "그린티 프레쉬 앰플", categoryId: "ampoule", key_ingredients: ["녹차", "나이아신아마이드"], tags: ["진정", "수분"], source: "manual_v1", verified: true },
  { id: "mediheal-tea-tree-ampoule", brand: "메디힐", name: "티트리 카밍 앰플", categoryId: "ampoule", key_ingredients: ["티트리", "센텔라"], tags: ["트러블", "진정"], source: "manual_v1", verified: true },
  { id: "one-thing-hyaluronic-ampoule", brand: "원씽", name: "히알루론산 콤플렉스 앰플", categoryId: "ampoule", key_ingredients: ["히알루론산", "판테놀"], tags: ["수분", "보습강화"], source: "manual_v1", verified: true },
  { id: "dalba-white-truffle-serum", brand: "달바", name: "화이트 트러플 퍼스트 스프레이 세럼", categoryId: "ampoule", key_ingredients: ["화이트 트러플", "나이아신아마이드"], tags: ["올리브영베스트", "안티에이징", "미백"], source: "manual_v1", verified: true },
  { id: "beplain-cicaful-ampoule", brand: "비플레인", name: "시카풀 앰플", categoryId: "ampoule", key_ingredients: ["시카", "마데카소사이드"], tags: ["진정", "트러블"], source: "manual_v1", verified: true },
  { id: "abib-collagen-ampoule", brand: "아비브", name: "콜라겐 아이 크림 앰플 튜브", categoryId: "ampoule", key_ingredients: ["콜라겐", "펩타이드"], tags: ["안티에이징"], source: "manual_v1", verified: true },

  // ── 비타민C 세럼 ──
  { id: "klairs-vitamin-c", brand: "디어클레어스", name: "프레쉬리 쥬스드 비타민 드롭", categoryId: "vitamin_c", concentration_level: "low", key_ingredients: ["아스코르빈산 5%"], tags: ["미백", "톤업", "저자극"], source: "manual_v1", verified: true },
  { id: "ordinary-vitamin-c-23", brand: "디오디너리", name: "비타민C 서스펜션 23%+HA", categoryId: "vitamin_c", concentration_level: "high", key_ingredients: ["아스코르빈산 23%"], tags: ["미백", "안티에이징"], source: "manual_v1", verified: true },
  { id: "ordinary-vitamin-c-8", brand: "디오디너리", name: "아스코빅 애시드 8%+알파아르부틴 2%", categoryId: "vitamin_c", concentration_level: "medium", key_ingredients: ["아스코르빈산 8%", "알파아르부틴"], tags: ["미백", "톤업"], source: "manual_v1", verified: true },
  { id: "goodal-vita-c-serum", brand: "구달", name: "청귤 비타C 세럼", categoryId: "vitamin_c", concentration_level: "medium", key_ingredients: ["비타민C", "청귤"], tags: ["올리브영베스트", "미백", "톤업"], source: "manual_v1", verified: true },
  { id: "obagi-c10", brand: "오바지", name: "C10 세럼", categoryId: "vitamin_c", concentration_level: "medium", key_ingredients: ["아스코르빈산 10%"], tags: ["미백", "안티에이징"], source: "manual_v1", verified: true },
  { id: "rohto-melano-cc", brand: "멜라노CC", name: "집중대책 미용액", categoryId: "vitamin_c", concentration_level: "medium", key_ingredients: ["비타민C 유도체"], tags: ["올리브영베스트", "미백"], source: "manual_v1", verified: true },
  { id: "somebymi-galactomyces-vitc", brand: "썸바이미", name: "갈락토미세스 비타민C 세럼", categoryId: "vitamin_c", concentration_level: "medium", key_ingredients: ["갈락토미세스", "비타민C"], tags: ["미백", "톤업"], source: "manual_v1", verified: true },
  { id: "skinaqua-tone-up-vitc", brand: "스킨아쿠아", name: "비타C 톤업 에센스", categoryId: "vitamin_c", concentration_level: "low", key_ingredients: ["비타민C 유도체", "히알루론산"], tags: ["톤업", "수분"], source: "manual_v1", verified: true },
  { id: "cellfusion-vitamin-tree", brand: "셀퓨전씨", name: "비타트리 시너지 세럼", categoryId: "vitamin_c", concentration_level: "medium", key_ingredients: ["비타민C", "비타민E", "페룰산"], tags: ["미백", "안티에이징"], source: "manual_v1", verified: true },
  { id: "lrp-pure-vitamin-c10", brand: "라로슈포제", name: "퓨어 비타민C10 세럼", categoryId: "vitamin_c", concentration_level: "medium", key_ingredients: ["아스코르빈산 10%", "살리실산"], tags: ["미백", "트러블"], source: "manual_v1", verified: true },
  { id: "beauty-of-joseon-vitc", brand: "조선미녀", name: "광채 세럼 비타민C", categoryId: "vitamin_c", concentration_level: "medium", key_ingredients: ["비타민C", "글루타치온"], tags: ["올리브영베스트", "미백", "톤업"], source: "manual_v1", verified: true },
  { id: "numbuzin-no2-vitc", brand: "넘버즈인", name: "2번 비타민C 세럼", categoryId: "vitamin_c", concentration_level: "medium", key_ingredients: ["비타민C 유도체", "글루타치온"], tags: ["올리브영베스트", "미백"], source: "manual_v1", verified: true },

  // ── 나이아신아마이드 ──
  { id: "ordinary-niacinamide-10", brand: "디오디너리", name: "나이아신아마이드 10%+징크 1%", categoryId: "niacinamide", concentration_level: "high", key_ingredients: ["나이아신아마이드 10%", "징크"], tags: ["모공", "피지조절"], source: "manual_v1", verified: true },
  { id: "cosrx-galactomyces-essence", brand: "코스알엑스", name: "갈락토미세스 95 토너", categoryId: "niacinamide", concentration_level: "medium", key_ingredients: ["갈락토미세스", "나이아신아마이드 2%"], tags: ["미백", "톤업"], source: "manual_v1", verified: true },
  { id: "numbuzin-no3-serum", brand: "넘버즈인", name: "3번 세럼 - 글루타치온", categoryId: "niacinamide", concentration_level: "medium", key_ingredients: ["글루타치온", "나이아신아마이드"], tags: ["올리브영베스트", "미백", "톤업"], source: "manual_v1", verified: true },
  { id: "beauty-of-joseon-glow-niac", brand: "조선미녀", name: "쌀 + 알파아르부틴 세럼", categoryId: "niacinamide", active_flags: ["alpha_arbutin"], key_ingredients: ["쌀겨수", "알파아르부틴 2%", "나이아신아마이드"], tags: ["올리브영베스트", "미백"], source: "manual_v1", verified: true },
  { id: "some-by-mi-yuja-niacin", brand: "썸바이미", name: "유자 나이아신 브라이트닝 세럼", categoryId: "niacinamide", concentration_level: "medium", key_ingredients: ["유자", "나이아신아마이드"], tags: ["미백", "톤업"], source: "manual_v1", verified: true },
  { id: "one-thing-niacinamide", brand: "원씽", name: "나이아신아마이드 10% 세럼", categoryId: "niacinamide", concentration_level: "high", key_ingredients: ["나이아신아마이드 10%"], tags: ["모공", "미백"], source: "manual_v1", verified: true },

  // ── 히알루론산 ──
  { id: "isntree-ha-toner", brand: "이즈앤트리", name: "히알루론산 토너", categoryId: "hyaluronic", key_ingredients: ["히알루론산"], tags: ["수분", "보습강화"], source: "manual_v1", verified: true },
  { id: "ordinary-ha", brand: "디오디너리", name: "히알루론산 2%+B5", categoryId: "hyaluronic", key_ingredients: ["히알루론산 2%", "판테놀"], tags: ["수분", "보습강화"], source: "manual_v1", verified: true },
  { id: "torriden-dive-in-ha", brand: "토리든", name: "다이브인 저분자 히알루론산 세럼", categoryId: "hyaluronic", key_ingredients: ["5가지 히알루론산"], tags: ["올리브영베스트", "수분", "보습강화"], source: "manual_v1", verified: true },
  { id: "laneige-water-bank-serum", brand: "라네즈", name: "워터뱅크 블루 HA 세럼", categoryId: "hyaluronic", key_ingredients: ["히알루론산", "블루 비오틱스"], tags: ["수분"], source: "manual_v1", verified: true },
  { id: "cosrx-hyaluronic-serum", brand: "코스알엑스", name: "히알루론산 인텐시브 크림", categoryId: "hyaluronic", key_ingredients: ["히알루론산", "판테놀"], tags: ["수분", "보습강화"], source: "manual_v1", verified: true },
  { id: "one-thing-ha-complex", brand: "원씽", name: "히알루론산 콤플렉스", categoryId: "hyaluronic", key_ingredients: ["6중 히알루론산"], tags: ["수분", "보습강화"], source: "manual_v1", verified: true },
  { id: "abib-ha-serum", brand: "아비브", name: "히알루론산 에센스", categoryId: "hyaluronic", key_ingredients: ["히알루론산", "판테놀"], tags: ["수분", "저자극"], source: "manual_v1", verified: true },
  { id: "eucerin-ha-filler-serum", brand: "유세린", name: "히알루론 필러 세럼", categoryId: "hyaluronic", key_ingredients: ["히알루론산", "글리세린"], tags: ["안티에이징", "보습강화"], source: "manual_v1", verified: true },
  { id: "primera-miracle-seed-essence", brand: "프리메라", name: "미라클 시드 에센스", categoryId: "hyaluronic", key_ingredients: ["연꽃씨앗 추출물", "히알루론산"], tags: ["수분", "안티에이징"], source: "manual_v1", verified: true },

  // ── 레티놀 ──
  { id: "ordinary-retinol-05", brand: "디오디너리", name: "레티놀 0.5% in 스쿠알란", categoryId: "retinol", concentration_level: "medium", key_ingredients: ["레티놀 0.5%", "스쿠알란"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "ordinary-retinol-1", brand: "디오디너리", name: "레티놀 1% in 스쿠알란", categoryId: "retinol", concentration_level: "high", key_ingredients: ["레티놀 1%", "스쿠알란"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "ordinary-granactive-retinoid", brand: "디오디너리", name: "그래낵티브 레티노이드 2%", categoryId: "retinol", concentration_level: "medium", key_ingredients: ["HPR 2%"], tags: ["안티에이징", "저자극"], source: "manual_v1", verified: true },
  { id: "cosrx-retinol-cream", brand: "코스알엑스", name: "더 레티놀 0.1 크림", categoryId: "retinol", concentration_level: "low", key_ingredients: ["레티놀 0.1%"], tags: ["안티에이징", "저자극"], source: "manual_v1", verified: true },
  { id: "innisfree-retinol-cica", brand: "이니스프리", name: "레티놀 시카 흔적 앰플", categoryId: "retinol", concentration_level: "medium", key_ingredients: ["레티놀", "시카"], tags: ["안티에이징", "진정"], source: "manual_v1", verified: true },
  { id: "drg-retinol-serum", brand: "닥터지", name: "레드 블레미쉬 클리어 수딩 크림", categoryId: "retinol", concentration_level: "low", key_ingredients: ["레티놀", "시카"], tags: ["안티에이징", "트러블"], source: "manual_v1", verified: true },
  { id: "lrp-retinol-b3", brand: "라로슈포제", name: "레티놀 B3 세럼", categoryId: "retinol", concentration_level: "medium", key_ingredients: ["레티놀", "나이아신아마이드"], tags: ["안티에이징", "미백"], source: "manual_v1", verified: true },
  { id: "paula-retinol-treatment", brand: "폴라초이스", name: "1% 레티놀 트리트먼트", categoryId: "retinol", concentration_level: "high", key_ingredients: ["레티놀 1%"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "iope-retigen", brand: "아이오페", name: "레티젠 크림", categoryId: "retinol", concentration_level: "medium", key_ingredients: ["레티놀", "펩타이드"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "ahc-real-retinol", brand: "AHC", name: "리얼 레티놀 앰플", categoryId: "retinol", concentration_level: "medium", key_ingredients: ["레티놀", "히알루론산"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "numbuzin-no4-retinol", brand: "넘버즈인", name: "4번 레티놀 앰플", categoryId: "retinol", concentration_level: "medium", key_ingredients: ["레티놀", "바쿠치올"], tags: ["올리브영베스트", "안티에이징"], source: "manual_v1", verified: true },

  // ── AHA ──
  { id: "cosrx-aha-7-whitehead", brand: "코스알엑스", name: "AHA 7 화이트헤드 파워 리퀴드", categoryId: "aha", concentration_level: "medium", key_ingredients: ["글리콜산 7%"], tags: ["각질", "톤업"], source: "manual_v1", verified: true },
  { id: "ordinary-glycolic-7", brand: "디오디너리", name: "글리콜산 7% 토닝 솔루션", categoryId: "aha", concentration_level: "medium", key_ingredients: ["글리콜산 7%"], tags: ["각질", "톤업"], source: "manual_v1", verified: true },
  { id: "ordinary-aha-30-bha-2", brand: "디오디너리", name: "AHA 30%+BHA 2% 필링 솔루션", categoryId: "aha", active_flags: ["bha"], concentration_level: "high", key_ingredients: ["AHA 30%", "BHA 2%"], tags: ["각질", "모공"], source: "manual_v1", verified: true },
  { id: "paula-aha-8", brand: "폴라초이스", name: "스킨 퍼펙팅 8% AHA 젤", categoryId: "aha", concentration_level: "medium", key_ingredients: ["글리콜산 8%"], tags: ["각질", "톤업"], source: "manual_v1", verified: true },
  { id: "isntree-aha-8", brand: "이즈앤트리", name: "클리어 스킨 8% AHA 에센스", categoryId: "aha", concentration_level: "medium", key_ingredients: ["글리콜산 8%"], tags: ["각질"], source: "manual_v1", verified: true },
  { id: "tiam-aura-milk-peeling", brand: "티아엠", name: "아우라 밀크 필링 젤", categoryId: "aha", concentration_level: "low", key_ingredients: ["젖산", "글리콜산"], tags: ["각질", "톤업", "저자극"], source: "manual_v1", verified: true },

  // ── BHA ──
  { id: "cosrx-bha-liquid", brand: "코스알엑스", name: "BHA 블랙헤드 파워 리퀴드", categoryId: "bha", concentration_level: "medium", key_ingredients: ["BHA 4%"], tags: ["올리브영베스트", "모공", "트러블"], source: "manual_v1", verified: true },
  { id: "paula-bha-2", brand: "폴라초이스", name: "스킨 퍼펙팅 2% BHA 리퀴드", categoryId: "bha", concentration_level: "medium", key_ingredients: ["살리실산 2%"], tags: ["모공", "트러블", "각질"], source: "manual_v1", verified: true },
  { id: "ordinary-salicylic-2", brand: "디오디너리", name: "살리실산 2% 솔루션", categoryId: "bha", concentration_level: "medium", key_ingredients: ["살리실산 2%"], tags: ["모공", "트러블"], source: "manual_v1", verified: true },
  { id: "somebymi-aha-bha-pha-toner", brand: "썸바이미", name: "AHA/BHA/PHA 30일 미라클 토너", categoryId: "bha", active_flags: ["aha", "pha"], concentration_level: "low", key_ingredients: ["AHA", "BHA", "PHA"], tags: ["각질", "트러블"], source: "manual_v1", verified: true },
  { id: "innisfree-bija-serum", brand: "이니스프리", name: "비자 트러블 스킨", categoryId: "bha", concentration_level: "low", key_ingredients: ["비자 오일", "살리실산"], tags: ["트러블", "진정"], source: "manual_v1", verified: true },
  { id: "isntree-bha-toner", brand: "이즈앤트리", name: "클리어 스킨 BHA 토너", categoryId: "bha", concentration_level: "low", key_ingredients: ["BHA", "살리실산"], tags: ["모공", "트러블"], source: "manual_v1", verified: true },

  // ── PHA ──
  { id: "cosrx-pha-moisture-renewal", brand: "코스알엑스", name: "PHA 모이스처 리뉴얼 파워 크림", categoryId: "pha", concentration_level: "low", key_ingredients: ["PHA", "히알루론산"], tags: ["각질", "보습강화", "저자극"], source: "manual_v1", verified: true },
  { id: "cnp-invisible-peeling-booster", brand: "CNP", name: "인비저블 필링 부스터", categoryId: "pha", concentration_level: "medium", key_ingredients: ["PHA", "살리실산"], tags: ["올리브영베스트", "각질", "모공"], source: "manual_v1", verified: true },
  { id: "neogen-pha-gauze-peeling", brand: "네오젠", name: "데르마로지 리얼 PHA 거즈 필링", categoryId: "pha", concentration_level: "low", key_ingredients: ["PHA 글루코노락톤"], tags: ["각질", "저자극"], source: "manual_v1", verified: true },
  { id: "isntree-pha-peeling-toner", brand: "이즈앤트리", name: "클리어 스킨 PHA 필링 토너", categoryId: "pha", concentration_level: "low", key_ingredients: ["PHA", "글루코노락톤"], tags: ["각질", "저자극", "수분"], source: "manual_v1", verified: true },
  { id: "beplain-pha-peeling-gel", brand: "비플레인", name: "PHA 필링 젤", categoryId: "pha", concentration_level: "low", key_ingredients: ["PHA", "센텔라"], tags: ["각질", "저자극", "진정"], source: "manual_v1", verified: true },

  // ── 로션/에멀전 ──
  { id: "innisfree-green-tea-lotion", brand: "이니스프리", name: "그린티 씨드 로션", categoryId: "lotion", key_ingredients: ["녹차씨 오일", "히알루론산"], tags: ["수분"], source: "manual_v1", verified: true },
  { id: "laneige-water-bank-emulsion", brand: "라네즈", name: "워터뱅크 블루 에멀전", categoryId: "lotion", key_ingredients: ["히알루론산", "블루 비오틱스"], tags: ["수분"], source: "manual_v1", verified: true },
  { id: "sulwhasoo-essential-emulsion", brand: "설화수", name: "자음 유액", categoryId: "lotion", key_ingredients: ["인삼", "한방 성분"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "missha-revolution-lotion", brand: "미샤", name: "타임레볼루션 로션", categoryId: "lotion", key_ingredients: ["발효 효모", "나이아신아마이드"], tags: ["미백", "안티에이징"], source: "manual_v1", verified: true },
  { id: "iope-derma-emulsion", brand: "아이오페", name: "더마 리페어 에멀전", categoryId: "lotion", key_ingredients: ["마데카소사이드", "판테놀"], tags: ["저자극", "진정"], source: "manual_v1", verified: true },
  { id: "cerave-daily-lotion", brand: "세라비", name: "데일리 모이스처라이징 로션", categoryId: "lotion", key_ingredients: ["세라마이드", "히알루론산", "나이아신아마이드"], tags: ["보습강화", "저자극"], source: "manual_v1", verified: true },
  { id: "etude-soojung-emulsion", brand: "에뛰드", name: "순정 10프리 모이스트 에멀전", categoryId: "lotion", key_ingredients: ["판테놀", "마데카소사이드"], tags: ["저자극", "진정"], source: "manual_v1", verified: true },
  { id: "primera-alpine-berry-emulsion", brand: "프리메라", name: "알파인 베리 워터리 에멀전", categoryId: "lotion", key_ingredients: ["알파인 베리", "히알루론산"], tags: ["수분"], source: "manual_v1", verified: true },
  { id: "ohui-miracle-emulsion", brand: "오휘", name: "미라클 모이스처 에멀전", categoryId: "lotion", key_ingredients: ["아쿠아 콤플렉스", "히알루론산"], tags: ["수분", "안티에이징"], source: "manual_v1", verified: true },
  { id: "mamonde-ceramide-emulsion", brand: "마몽드", name: "세라마이드 인텐시브 에멀전", categoryId: "lotion", key_ingredients: ["세라마이드", "스쿠알란"], tags: ["보습강화", "저자극"], source: "manual_v1", verified: true },

  // ── 크림 ──
  { id: "cosrx-snail-cream", brand: "코스알엑스", name: "어드밴스드 스네일 92 올인원 크림", categoryId: "cream", key_ingredients: ["달팽이 뮤신 92%"], tags: ["올리브영베스트", "수분", "진정"], source: "manual_v1", verified: true },
  { id: "laneige-water-sleeping-mask", brand: "라네즈", name: "워터 슬리핑 마스크", categoryId: "cream", key_ingredients: ["히알루론산", "미네랄"], tags: ["수분", "보습강화"], source: "manual_v1", verified: true },
  { id: "sulwhasoo-ginseng-cream", brand: "설화수", name: "자음생 크림", categoryId: "cream", key_ingredients: ["인삼", "한방 성분"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "belif-aqua-bomb", brand: "벨리프", name: "아쿠아 밤", categoryId: "cream", key_ingredients: ["허브 콤플렉스", "히알루론산"], tags: ["수분"], source: "manual_v1", verified: true },
  { id: "belif-moisturizing-bomb", brand: "벨리프", name: "모이스처라이징 밤", categoryId: "cream", key_ingredients: ["시어버터", "히알루론산"], tags: ["보습강화"], source: "manual_v1", verified: true },
  { id: "drjart-ceramidin-cream", brand: "닥터자르트", name: "세라마이딘 크림", categoryId: "cream", key_ingredients: ["세라마이드", "판테놀"], tags: ["보습강화", "저자극"], source: "manual_v1", verified: true },
  { id: "innisfree-green-tea-cream", brand: "이니스프리", name: "그린티 씨드 크림", categoryId: "cream", key_ingredients: ["녹차씨 오일", "녹차"], tags: ["수분"], source: "manual_v1", verified: true },
  { id: "illiyoon-ceramide-cream", brand: "일리윤", name: "세라마이드 아토 컨센트레이트 크림", categoryId: "cream", key_ingredients: ["세라마이드"], tags: ["올리브영베스트", "보습강화", "저자극"], source: "manual_v1", verified: true },
  { id: "lrp-cicaplast-b5", brand: "라로슈포제", name: "시카플라스트 밤 B5+", categoryId: "cream", key_ingredients: ["판테놀 5%", "마데카소사이드"], tags: ["진정", "저자극"], source: "manual_v1", verified: true },
  { id: "etude-soon-jung-cream", brand: "에뛰드", name: "순정 2x 배리어 인텐시브 크림", categoryId: "cream", key_ingredients: ["판테놀", "마데카소사이드"], tags: ["올리브영베스트", "저자극", "진정"], source: "manual_v1", verified: true },
  { id: "aestura-atobarrier-365", brand: "에스트라", name: "아토배리어 365 크림", categoryId: "cream", key_ingredients: ["세라마이드", "MLE"], tags: ["올리브영베스트", "보습강화", "저자극"], source: "manual_v1", verified: true },
  { id: "roundlab-birch-cream", brand: "라운드랩", name: "자작나무 수분 크림", categoryId: "cream", key_ingredients: ["자작나무 수액", "히알루론산"], tags: ["올리브영베스트", "수분"], source: "manual_v1", verified: true },
  { id: "vt-cica-cream", brand: "VT코스메틱", name: "시카크림", categoryId: "cream", key_ingredients: ["시카", "나이아신아마이드"], tags: ["진정", "트러블"], source: "manual_v1", verified: true },
  { id: "hera-black-cushion-cream", brand: "헤라", name: "에이지 리버스 크림", categoryId: "cream", key_ingredients: ["펩타이드", "레티놀"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "nature-republic-aloe", brand: "네이처리퍼블릭", name: "수딩앤모이스처 알로에 92% 젤", categoryId: "cream", key_ingredients: ["알로에 베라 92%"], tags: ["수분", "진정"], source: "manual_v1", verified: true },
  { id: "kiehls-ultra-facial", brand: "키엘", name: "울트라 페이셜 크림", categoryId: "cream", key_ingredients: ["스쿠알란", "글리세린"], tags: ["보습강화"], source: "manual_v1", verified: true },
  { id: "clinique-moisture-surge", brand: "크리니크", name: "모이스처 서지 100H", categoryId: "cream", key_ingredients: ["히알루론산", "알로에"], tags: ["수분", "보습강화"], source: "manual_v1", verified: true },
  { id: "derma-cica-cream", brand: "더마토리", name: "하이포알러제닉 시카 크림", categoryId: "cream", key_ingredients: ["시카", "마데카소사이드"], tags: ["저자극", "진정"], source: "manual_v1", verified: true },
  { id: "manyo-bifida-cream", brand: "마녀공장", name: "비피다 바이옴 크림", categoryId: "cream", key_ingredients: ["비피다", "세라마이드"], tags: ["안티에이징", "보습강화"], source: "manual_v1", verified: true },
  { id: "avene-cicalfate", brand: "아벤느", name: "시칼파트+ 리페어 크림", categoryId: "cream", key_ingredients: ["시카", "구리아연"], tags: ["진정", "저자극"], source: "manual_v1", verified: true },
  { id: "vichy-mineral-89-cream", brand: "비쉬", name: "미네랄 89 크림", categoryId: "cream", key_ingredients: ["미네랄 워터", "히알루론산"], tags: ["수분", "보습강화"], source: "manual_v1", verified: true },
  { id: "cerave-moisturizing-cream", brand: "세라비", name: "모이스처라이징 크림", categoryId: "cream", key_ingredients: ["세라마이드", "히알루론산"], tags: ["보습강화", "저자극"], source: "manual_v1", verified: true },
  { id: "one-thing-cica-cream", brand: "원씽", name: "센텔라 수딩 크림", categoryId: "cream", key_ingredients: ["센텔라", "마데카소사이드"], tags: ["진정", "저자극"], source: "manual_v1", verified: true },
  { id: "beplain-cicaful-cream", brand: "비플레인", name: "시카풀 크림", categoryId: "cream", key_ingredients: ["시카", "마데카소사이드", "판테놀"], tags: ["올리브영베스트", "진정", "트러블"], source: "manual_v1", verified: true },
  { id: "dewytree-cica-cream", brand: "듀이트리", name: "시카 100 수딩 크림", categoryId: "cream", key_ingredients: ["시카", "센텔라"], tags: ["진정", "저자극"], source: "manual_v1", verified: true },
  { id: "eucerin-original-cream", brand: "유세린", name: "오리지널 모이스처라이징 크림", categoryId: "cream", key_ingredients: ["유레아", "세라마이드"], tags: ["보습강화"], source: "manual_v1", verified: true },
  { id: "abib-cica-cream", brand: "아비브", name: "시카 크림 카밍 튜브", categoryId: "cream", key_ingredients: ["시카", "세라마이드"], tags: ["올리브영베스트", "진정", "저자극"], source: "manual_v1", verified: true },

  // ── 수면팩 ──
  { id: "laneige-sleeping-mask", brand: "라네즈", name: "워터 슬리핑 마스크 EX", categoryId: "sleeping_pack", key_ingredients: ["히알루론산", "스쿠알란"], tags: ["올리브영베스트", "수분", "보습강화"], source: "manual_v1", verified: true },
  { id: "innisfree-green-tea-sleeping", brand: "이니스프리", name: "그린티 슬리핑 마스크", categoryId: "sleeping_pack", key_ingredients: ["녹차", "히알루론산"], tags: ["수분"], source: "manual_v1", verified: true },
  { id: "cosrx-honey-sleeping", brand: "코스알엑스", name: "얼티밋 허니 오버나이트 마스크", categoryId: "sleeping_pack", key_ingredients: ["꿀", "프로폴리스"], tags: ["수분", "보습강화"], source: "manual_v1", verified: true },
  { id: "sulwhasoo-overnight-mask", brand: "설화수", name: "여윤 슬리핑 마스크", categoryId: "sleeping_pack", key_ingredients: ["인삼", "한방 성분"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "laneige-lip-sleeping-mask", brand: "라네즈", name: "립 슬리핑 마스크", categoryId: "sleeping_pack", key_ingredients: ["비타민C", "베리"], tags: ["올리브영베스트", "보습강화"], source: "manual_v1", verified: true },
  { id: "cosrx-rice-sleeping-mask", brand: "코스알엑스", name: "얼티밋 나이아신아마이드 라이스 마스크", categoryId: "sleeping_pack", key_ingredients: ["나이아신아마이드", "쌀"], tags: ["미백", "톤업"], source: "manual_v1", verified: true },
  { id: "mamonde-rose-sleeping", brand: "마몽드", name: "로즈 워터 슬리핑 마스크", categoryId: "sleeping_pack", key_ingredients: ["장미수", "히알루론산"], tags: ["수분"], source: "manual_v1", verified: true },
  { id: "etude-collagen-sleeping", brand: "에뛰드", name: "모이스트풀 콜라겐 슬리핑 마스크", categoryId: "sleeping_pack", key_ingredients: ["콜라겐", "히알루론산"], tags: ["보습강화", "안티에이징"], source: "manual_v1", verified: true },

  // ── 선크림 ──
  { id: "beauty-of-joseon-sun", brand: "조선미녀", name: "맑은 쌀 선크림", categoryId: "sunscreen", key_ingredients: ["쌀겨수", "프로바이오틱스"], tags: ["올리브영베스트", "톤업", "저자극"], source: "manual_v1", verified: true },
  { id: "roundlab-birch-sun", brand: "라운드랩", name: "자작나무 수분 선크림", categoryId: "sunscreen", key_ingredients: ["자작나무 수액", "화학 자외선 차단제"], tags: ["올리브영베스트", "수분"], source: "manual_v1", verified: true },
  { id: "isntree-ha-watery-sun", brand: "이즈앤트리", name: "히알루론산 워터리 선젤", categoryId: "sunscreen", key_ingredients: ["히알루론산", "화학 자외선 차단제"], tags: ["올리브영베스트", "수분"], source: "manual_v1", verified: true },
  { id: "missha-sun-essence", brand: "미샤", name: "올 어라운드 세이프 블록 에센스 선", categoryId: "sunscreen", key_ingredients: ["화학 자외선 차단제"], tags: ["저자극"], source: "manual_v1", verified: true },
  { id: "lrp-anthelios-uvmune", brand: "라로슈포제", name: "안뗄리오스 UVmune 400 플루이드", categoryId: "sunscreen", key_ingredients: ["메록실 400", "화학 자외선 차단제"], tags: ["저자극"], source: "manual_v1", verified: true },
  { id: "innisfree-daily-uv", brand: "이니스프리", name: "데일리 UV 디펜스 선크림", categoryId: "sunscreen", key_ingredients: ["화학 자외선 차단제", "녹차"], tags: ["수분"], source: "manual_v1", verified: true },
  { id: "skin1004-centella-sun", brand: "스킨1004", name: "마다가스카르 센텔라 에어핏 선크림", categoryId: "sunscreen", key_ingredients: ["센텔라", "화학 자외선 차단제"], tags: ["올리브영베스트", "진정", "저자극"], source: "manual_v1", verified: true },
  { id: "anessa-perfect-uv", brand: "아네사", name: "퍼펙트 UV 선스킨 밀크", categoryId: "sunscreen", key_ingredients: ["징크옥사이드", "화학 자외선 차단제"], tags: ["올리브영베스트"], source: "manual_v1", verified: true },
  { id: "biore-aqua-rich", brand: "비오레", name: "UV 아쿠아리치 워터리 에센스", categoryId: "sunscreen", key_ingredients: ["히알루론산", "화학 자외선 차단제"], tags: ["올리브영베스트", "수분"], source: "manual_v1", verified: true },
  { id: "cellfusion-toneup-sun", brand: "셀퓨전씨", name: "톤업 선크림", categoryId: "sunscreen", key_ingredients: ["징크옥사이드", "나이아신아마이드"], tags: ["톤업", "저자극"], source: "manual_v1", verified: true },
  { id: "ahc-natural-perfection-sun", brand: "AHC", name: "내추럴 퍼펙션 선스틱", categoryId: "sunscreen", key_ingredients: ["화학 자외선 차단제", "히알루론산"], tags: ["수분"], source: "manual_v1", verified: true },
  { id: "etude-sunprise-mild", brand: "에뛰드", name: "순프라이즈 마일드 에어리 피니쉬", categoryId: "sunscreen", key_ingredients: ["화학 자외선 차단제", "판테놀"], tags: ["저자극"], source: "manual_v1", verified: true },
  { id: "torriden-dive-in-sun", brand: "토리든", name: "다이브인 워터리 선크림", categoryId: "sunscreen", key_ingredients: ["히알루론산", "화학 자외선 차단제"], tags: ["올리브영베스트", "수분"], source: "manual_v1", verified: true },
  { id: "vt-cica-sun", brand: "VT코스메틱", name: "시카 데일리 수딩 선크림", categoryId: "sunscreen", key_ingredients: ["시카", "징크옥사이드"], tags: ["진정", "저자극"], source: "manual_v1", verified: true },
  { id: "dermatory-allergy-sun", brand: "더마토리", name: "하이포알러제닉 선크림", categoryId: "sunscreen", key_ingredients: ["징크옥사이드", "판테놀"], tags: ["저자극"], source: "manual_v1", verified: true },
  { id: "canmake-mermaid-uv", brand: "캔메이크", name: "머메이드 스킨 젤 UV", categoryId: "sunscreen", key_ingredients: ["화학 자외선 차단제", "히알루론산"], tags: ["수분", "톤업"], source: "manual_v1", verified: true },
  { id: "numbuzin-no1-sun", brand: "넘버즈인", name: "1번 선크림", categoryId: "sunscreen", key_ingredients: ["화학 자외선 차단제", "히알루론산"], tags: ["올리브영베스트", "수분"], source: "manual_v1", verified: true },
  { id: "bioderma-photoderm-max", brand: "바이오더마", name: "포토덤 맥스 플루이드", categoryId: "sunscreen", key_ingredients: ["화학 자외선 차단제"], tags: ["저자극"], source: "manual_v1", verified: true },
  { id: "dalba-waterfull-sun", brand: "달바", name: "워터풀 에센스 선크림", categoryId: "sunscreen", key_ingredients: ["화학 자외선 차단제", "히알루론산"], tags: ["올리브영베스트", "수분"], source: "manual_v1", verified: true },
  { id: "abib-quick-sunstick", brand: "아비브", name: "퀵 선스틱 프로텍션 바", categoryId: "sunscreen", key_ingredients: ["화학 자외선 차단제", "히알루론산"], tags: ["올리브영베스트"], source: "manual_v1", verified: true },

  // ── 아이크림 ──
  { id: "innisfree-green-tea-eye", brand: "이니스프리", name: "그린티 씨드 아이크림", categoryId: "eye_cream", key_ingredients: ["녹차씨 오일", "카페인"], tags: ["수분"], source: "manual_v1", verified: true },
  { id: "sulwhasoo-eye-cream", brand: "설화수", name: "자음생 아이크림", categoryId: "eye_cream", key_ingredients: ["인삼", "한방 성분"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "ahc-eye-cream", brand: "AHC", name: "텐 레볼루션 리얼 아이크림", categoryId: "eye_cream", key_ingredients: ["펩타이드", "히알루론산"], tags: ["올리브영베스트", "안티에이징"], source: "manual_v1", verified: true },
  { id: "drjart-ceramidin-eye", brand: "닥터자르트", name: "세라마이딘 아이크림", categoryId: "eye_cream", key_ingredients: ["세라마이드", "판테놀"], tags: ["보습강화"], source: "manual_v1", verified: true },
  { id: "belif-eye-bomb", brand: "벨리프", name: "모이스처라이징 아이 밤", categoryId: "eye_cream", key_ingredients: ["히알루론산", "카페인"], tags: ["수분"], source: "manual_v1", verified: true },
  { id: "kiehls-creamy-eye", brand: "키엘", name: "크리미 아이 트리트먼트", categoryId: "eye_cream", key_ingredients: ["아보카도 오일", "시어버터"], tags: ["보습강화"], source: "manual_v1", verified: true },
  { id: "hera-age-away-eye", brand: "헤라", name: "에이지 어웨이 모더닝 아이크림", categoryId: "eye_cream", key_ingredients: ["펩타이드", "레티놀"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "ordinary-caffeine-eye", brand: "디오디너리", name: "카페인 5%+EGCG 아이 세럼", categoryId: "eye_cream", key_ingredients: ["카페인 5%", "EGCG"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "primera-organience-eye", brand: "프리메라", name: "오가니언스 아이크림", categoryId: "eye_cream", key_ingredients: ["시드 콤플렉스", "카페인"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "beauty-of-joseon-eye", brand: "조선미녀", name: "인삼 아이크림", categoryId: "eye_cream", key_ingredients: ["인삼", "레티놀"], tags: ["올리브영베스트", "안티에이징"], source: "manual_v1", verified: true },

  // ── 스팟 트리트먼트 ──
  { id: "cosrx-pimple-patch", brand: "코스알엑스", name: "아크네 핌플 마스터 패치", categoryId: "spot_treatment", key_ingredients: ["하이드로콜로이드"], tags: ["올리브영베스트", "트러블"], source: "manual_v1", verified: true },
  { id: "some-by-mi-miracle-patch", brand: "썸바이미", name: "30 데이즈 미라클 클리어 스팟 패치", categoryId: "spot_treatment", key_ingredients: ["하이드로콜로이드", "티트리"], tags: ["트러블"], source: "manual_v1", verified: true },
  { id: "innisfree-bija-spot", brand: "이니스프리", name: "비자 트러블 스팟 에센스", categoryId: "spot_treatment", key_ingredients: ["비자 오일", "살리실산"], tags: ["트러블"], source: "manual_v1", verified: true },
  { id: "nexcare-blemish-patch", brand: "넥스케어", name: "블레미쉬 클리어 커버", categoryId: "spot_treatment", key_ingredients: ["하이드로콜로이드"], tags: ["올리브영베스트", "트러블"], source: "manual_v1", verified: true },
  { id: "medicube-red-spot-patch", brand: "메디큐브", name: "레드 스팟 패치", categoryId: "spot_treatment", key_ingredients: ["살리실산", "티트리"], tags: ["올리브영베스트", "트러블"], source: "manual_v1", verified: true },
  { id: "cosrx-centella-blemish", brand: "코스알엑스", name: "센텔라 블레미쉬 크림", categoryId: "spot_treatment", key_ingredients: ["센텔라", "마데카소사이드"], tags: ["트러블", "진정"], source: "manual_v1", verified: true },
  { id: "isntree-blemish-spot", brand: "이즈앤트리", name: "스팟 세이버 앰플", categoryId: "spot_treatment", key_ingredients: ["나이아신아마이드", "알파아르부틴"], tags: ["미백", "트러블"], source: "manual_v1", verified: true },

  // ── 마스크팩 ──
  { id: "mediheal-tea-tree-mask", brand: "메디힐", name: "티트리 케어 솔루션 마스크", categoryId: "mask_pack", key_ingredients: ["티트리", "센텔라"], tags: ["올리브영베스트", "트러블", "진정"], source: "manual_v1", verified: true },
  { id: "mediheal-nme-mask", brand: "메디힐", name: "N.M.F 아쿠아링 마스크", categoryId: "mask_pack", key_ingredients: ["히알루론산", "NMF"], tags: ["올리브영베스트", "수분"], source: "manual_v1", verified: true },
  { id: "innisfree-green-tea-mask", brand: "이니스프리", name: "마이 리얼 스퀴즈 마스크 그린티", categoryId: "mask_pack", key_ingredients: ["녹차"], tags: ["수분"], source: "manual_v1", verified: true },
  { id: "drjart-ceramidin-mask", brand: "닥터자르트", name: "세라마이딘 마스크", categoryId: "mask_pack", key_ingredients: ["세라마이드", "판테놀"], tags: ["보습강화", "저자극"], source: "manual_v1", verified: true },
  { id: "abib-gummy-mask", brand: "아비브", name: "구미 시트 마스크 히알루론산", categoryId: "mask_pack", key_ingredients: ["히알루론산"], tags: ["올리브영베스트", "수분"], source: "manual_v1", verified: true },
  { id: "papa-recipe-honey-mask", brand: "파파레서피", name: "봄비 꿀 마스크", categoryId: "mask_pack", key_ingredients: ["꿀", "프로폴리스"], tags: ["수분", "진정"], source: "manual_v1", verified: true },
  { id: "sulwhasoo-first-care-mask", brand: "설화수", name: "퍼스트케어 액티베이팅 마스크", categoryId: "mask_pack", key_ingredients: ["인삼", "JAUM 콤플렉스"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "mediheal-collagen-mask", brand: "메디힐", name: "콜라겐 임팩트 에센셜 마스크", categoryId: "mask_pack", key_ingredients: ["콜라겐", "히알루론산"], tags: ["안티에이징", "보습강화"], source: "manual_v1", verified: true },
  { id: "vt-cica-daily-mask", brand: "VT코스메틱", name: "시카 데일리 수딩 마스크", categoryId: "mask_pack", key_ingredients: ["시카", "판테놀"], tags: ["진정", "저자극"], source: "manual_v1", verified: true },
  { id: "torriden-dive-in-mask", brand: "토리든", name: "다이브인 마스크", categoryId: "mask_pack", key_ingredients: ["5가지 히알루론산"], tags: ["올리브영베스트", "수분"], source: "manual_v1", verified: true },
  { id: "beauty-of-joseon-mask", brand: "조선미녀", name: "쌀 워터 쉬트 마스크", categoryId: "mask_pack", key_ingredients: ["쌀겨수", "나이아신아마이드"], tags: ["미백", "톤업"], source: "manual_v1", verified: true },
  { id: "klairs-midnight-mask", brand: "디어클레어스", name: "미드나이트 블루 카밍 시트 마스크", categoryId: "mask_pack", key_ingredients: ["에리스로마이신", "센텔라"], tags: ["진정", "저자극"], source: "manual_v1", verified: true },

  // ── 추가 제품 (카테고리 혼합) ──
  { id: "cosrx-centella-toner", brand: "코스알엑스", name: "센텔라 워터 알코올프리 토너", categoryId: "toner", key_ingredients: ["센텔라", "판테놀"], tags: ["진정", "저자극"], source: "manual_v1", verified: true },
  { id: "isntree-aloe-gel", brand: "이즈앤트리", name: "알로에 수딩 젤 80%", categoryId: "cream", key_ingredients: ["알로에 베라 80%"], tags: ["진정", "수분"], source: "manual_v1", verified: true },
  { id: "skin1004-centella-ampoule", brand: "스킨1004", name: "마다가스카르 센텔라 앰플", categoryId: "ampoule", key_ingredients: ["센텔라 추출물"], tags: ["올리브영베스트", "진정"], source: "manual_v1", verified: true },
  { id: "goodal-green-tangerine-serum", brand: "구달", name: "청귤 비타C 다크스팟 세럼", categoryId: "vitamin_c", concentration_level: "medium", key_ingredients: ["비타민C", "청귤"], tags: ["미백", "톤업"], source: "manual_v1", verified: true },
  { id: "numbuzin-no1-essence", brand: "넘버즈인", name: "1번 에센스", categoryId: "essence", key_ingredients: ["갈락토미세스", "나이아신아마이드"], tags: ["올리브영베스트", "미백", "톤업"], source: "manual_v1", verified: true },
  { id: "anua-heartleaf-cream", brand: "아누아", name: "어성초 77 수딩 크림", categoryId: "cream", key_ingredients: ["어성초 77%", "판테놀"], tags: ["올리브영베스트", "진정", "트러블"], source: "manual_v1", verified: true },
  { id: "manyo-galactomy-essence", brand: "마녀공장", name: "갈락토미 나이아신 에센스", categoryId: "essence", key_ingredients: ["갈락토미세스", "나이아신아마이드"], tags: ["올리브영베스트", "미백", "톤업"], source: "manual_v1", verified: true },
  { id: "roundlab-mugwort-cream", brand: "라운드랩", name: "쑥 진정 크림", categoryId: "cream", key_ingredients: ["쑥 추출물", "마데카소사이드"], tags: ["진정", "저자극"], source: "manual_v1", verified: true },
  { id: "lrp-effaclar-duo", brand: "라로슈포제", name: "에빠끌라 듀오+ 크림", categoryId: "cream", active_flags: ["niacinamide"], key_ingredients: ["나이아신아마이드", "살리실산"], tags: ["트러블", "모공"], source: "manual_v1", verified: true },
  { id: "anua-niacinamide-serum", brand: "아누아", name: "나이아신아마이드 10% 세럼", categoryId: "niacinamide", concentration_level: "high", key_ingredients: ["나이아신아마이드 10%"], tags: ["올리브영베스트", "모공", "미백"], source: "manual_v1", verified: true },
  { id: "cosrx-aha-bha-toner", brand: "코스알엑스", name: "AHA/BHA 클래리파잉 트리트먼트 토너", categoryId: "toner", active_flags: ["aha", "bha"], concentration_level: "low", key_ingredients: ["AHA", "BHA"], tags: ["각질", "모공"], source: "manual_v1", verified: true },
  { id: "hera-black-serum", brand: "헤라", name: "블랙 세럼", categoryId: "essence", key_ingredients: ["블랙 티 추출물", "펩타이드"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "laneige-retinol-eye", brand: "라네즈", name: "퍼펙트 리뉴 래디언스 아이크림", categoryId: "eye_cream", active_flags: ["retinol"], concentration_level: "low", key_ingredients: ["레티놀", "히알루론산"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "ordinary-azelaic-10", brand: "디오디너리", name: "아젤라인산 10% 서스펜션", categoryId: "spot_treatment", concentration_level: "medium", key_ingredients: ["아젤라인산 10%"], tags: ["트러블", "톤업"], source: "manual_v1", verified: true },
  { id: "ordinary-niacinamide-5", brand: "디오디너리", name: "나이아신아마이드 5%", categoryId: "niacinamide", concentration_level: "medium", key_ingredients: ["나이아신아마이드 5%"], tags: ["모공", "미백"], source: "manual_v1", verified: true },
  { id: "missha-vita-c-ampoule", brand: "미샤", name: "비타C 플러스 앰플", categoryId: "vitamin_c", concentration_level: "medium", key_ingredients: ["비타민C", "나이아신아마이드"], tags: ["미백"], source: "manual_v1", verified: true },
  { id: "drjart-cicapair-cream", brand: "닥터자르트", name: "시카페어 크림", categoryId: "cream", key_ingredients: ["센텔라", "시카"], tags: ["진정", "저자극"], source: "manual_v1", verified: true },
  { id: "nature-republic-snail", brand: "네이처리퍼블릭", name: "슈퍼 아쿠아 맥스 수분 크림", categoryId: "cream", key_ingredients: ["히알루론산", "바오밥 나무"], tags: ["수분"], source: "manual_v1", verified: true },
  { id: "skinfood-royal-honey", brand: "스킨푸드", name: "로열허니 프로폴리스 에센스", categoryId: "essence", key_ingredients: ["프로폴리스", "꿀"], tags: ["수분", "진정"], source: "manual_v1", verified: true },
  { id: "cnp-mugener-ampoule", brand: "CNP", name: "뮤제너 앰플", categoryId: "ampoule", key_ingredients: ["뮤신", "히알루론산"], tags: ["수분", "진정"], source: "manual_v1", verified: true },
  { id: "vt-reedle-shot-300", brand: "VT코스메틱", name: "리들샷 300", categoryId: "ampoule", key_ingredients: ["실리카", "마이크로니들"], tags: ["올리브영베스트", "안티에이징"], source: "manual_v1", verified: true },
  { id: "anua-peach-serum", brand: "아누아", name: "복숭아 70 나이아신아마이드 세럼", categoryId: "niacinamide", concentration_level: "medium", key_ingredients: ["복숭아 추출물 70%", "나이아신아마이드"], tags: ["올리브영베스트", "미백", "톤업"], source: "manual_v1", verified: true },
  { id: "isntree-tw-real-bifida", brand: "이즈앤트리", name: "TW-REAL 비피다 앰플", categoryId: "ampoule", key_ingredients: ["비피다"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "etude-moistfull-cream", brand: "에뛰드", name: "모이스트풀 콜라겐 크림", categoryId: "cream", key_ingredients: ["콜라겐", "바오밥 나무"], tags: ["수분", "안티에이징"], source: "manual_v1", verified: true },
  { id: "drjart-vital-hydra", brand: "닥터자르트", name: "바이탈 하이드라 솔루션 크림", categoryId: "cream", key_ingredients: ["히알루론산", "판테놀"], tags: ["수분", "보습강화"], source: "manual_v1", verified: true },
  { id: "roundlab-pine-serum", brand: "라운드랩", name: "소나무 진정 시카 세럼", categoryId: "essence", key_ingredients: ["소나무", "시카"], tags: ["진정"], source: "manual_v1", verified: true },

  // ── 추가 확장 제품 (v2) ──
  // 클렌저
  { id: "the-face-shop-rice-cleanser", brand: "더페이스샵", name: "쌀수 브라이트 폼 클렌저", categoryId: "cleanser", key_ingredients: ["쌀겨수", "약산성"], tags: ["미백", "저자극"], source: "manual_v1", verified: true },
  { id: "holika-aloe-cleanser", brand: "홀리카홀리카", name: "알로에 클렌징 폼", categoryId: "cleanser", key_ingredients: ["알로에 베라", "약산성"], tags: ["진정", "수분"], source: "manual_v1", verified: true },
  // 토너
  { id: "the-face-shop-yehwadam-toner", brand: "더페이스샵", name: "예화담 첫번째 에센스", categoryId: "toner", key_ingredients: ["한방 추출물", "인삼"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "dewytree-ha-toner", brand: "듀이트리", name: "히알루론산 딥 마이크로 토너", categoryId: "toner", key_ingredients: ["히알루론산", "판테놀"], tags: ["수분", "보습강화"], source: "manual_v1", verified: true },
  { id: "skin1004-centella-toner", brand: "스킨1004", name: "센텔라 토닝 토너", categoryId: "toner", key_ingredients: ["센텔라", "나이아신아마이드"], tags: ["진정", "톤업"], source: "manual_v1", verified: true },
  // 에센스
  { id: "beauty-of-joseon-calming", brand: "조선미녀", name: "진정 세럼", categoryId: "essence", key_ingredients: ["쑥", "녹차"], tags: ["올리브영베스트", "진정"], source: "manual_v1", verified: true },
  { id: "primera-repair-seed", brand: "프리메라", name: "리페어 시드 오일", categoryId: "essence", key_ingredients: ["시드 오일", "히알루론산"], tags: ["보습강화"], source: "manual_v1", verified: true },
  { id: "ohui-miracle-moisture", brand: "오휘", name: "미라클 모이스처 에센스", categoryId: "essence", key_ingredients: ["히알루론산", "펩타이드"], tags: ["수분", "안티에이징"], source: "manual_v1", verified: true },
  // 앰플
  { id: "manyo-v-collagen-ampoule", brand: "마녀공장", name: "V 콜라겐 하트핏 앰플", categoryId: "ampoule", key_ingredients: ["콜라겐", "펩타이드"], tags: ["올리브영베스트", "안티에이징"], source: "manual_v1", verified: true },
  { id: "dewytree-ac-dew-ampoule", brand: "듀이트리", name: "AC DEW 캄 앰플", categoryId: "ampoule", key_ingredients: ["히알루론산", "센텔라"], tags: ["진정", "트러블"], source: "manual_v1", verified: true },
  // 비타민C
  { id: "skin1004-vitc-serum", brand: "스킨1004", name: "비타민C 브라이트닝 세럼", categoryId: "vitamin_c", concentration_level: "medium", key_ingredients: ["비타민C 유도체", "센텔라"], tags: ["미백", "진정"], source: "manual_v1", verified: true },
  { id: "by-wishtrend-pure-vitc-21", brand: "바이위시트렌드", name: "퓨어 비타민C 21.5 세럼", categoryId: "vitamin_c", concentration_level: "high", key_ingredients: ["아스코르빈산 21.5%"], tags: ["미백", "안티에이징"], source: "manual_v1", verified: true },
  // 나이아신아마이드
  { id: "torriden-cellmazing-niac", brand: "토리든", name: "셀마이징 나이아신아마이드 세럼", categoryId: "niacinamide", concentration_level: "medium", key_ingredients: ["나이아신아마이드 5%", "판테놀"], tags: ["모공", "미백"], source: "manual_v1", verified: true },
  { id: "dr-ceuracle-niacinamide", brand: "닥터시라보", name: "나이아신아마이드 5% 세럼", categoryId: "niacinamide", concentration_level: "medium", key_ingredients: ["나이아신아마이드 5%"], tags: ["모공", "피지조절"], source: "manual_v1", verified: true },
  // 히알루론산
  { id: "dewytree-ultra-ha-serum", brand: "듀이트리", name: "울트라 히알루론산 세럼", categoryId: "hyaluronic", key_ingredients: ["히알루론산", "판테놀"], tags: ["수분", "보습강화"], source: "manual_v1", verified: true },
  { id: "skin1004-ha-barrier-serum", brand: "스킨1004", name: "히알루론산 배리어 세럼", categoryId: "hyaluronic", key_ingredients: ["히알루론산", "세라마이드"], tags: ["수분", "보습강화"], source: "manual_v1", verified: true },
  // 레티놀
  { id: "beauty-of-joseon-retinal", brand: "조선미녀", name: "레티날 아이 세럼", categoryId: "retinol", concentration_level: "low", key_ingredients: ["레티날", "인삼"], tags: ["올리브영베스트", "안티에이징"], source: "manual_v1", verified: true },
  { id: "skin1004-retinol-serum", brand: "스킨1004", name: "마다가스카르 센텔라 레티놀 세럼", categoryId: "retinol", concentration_level: "low", key_ingredients: ["레티놀", "센텔라"], tags: ["안티에이징", "진정"], source: "manual_v1", verified: true },
  // 크림
  { id: "torriden-balanceful-cream", brand: "토리든", name: "밸런스풀 시카 크림", categoryId: "cream", key_ingredients: ["시카", "세라마이드"], tags: ["올리브영베스트", "진정", "저자극"], source: "manual_v1", verified: true },
  { id: "primera-repair-cream", brand: "프리메라", name: "알파인 베리 워터리 크림", categoryId: "cream", key_ingredients: ["알파인 베리", "히알루론산"], tags: ["수분"], source: "manual_v1", verified: true },
  { id: "numbuzin-no2-cream", brand: "넘버즈인", name: "2번 크림", categoryId: "cream", key_ingredients: ["글루타치온", "나이아신아마이드"], tags: ["올리브영베스트", "미백", "톤업"], source: "manual_v1", verified: true },
  { id: "the-face-shop-rice-cream", brand: "더페이스샵", name: "쌀수 브라이트닝 크림", categoryId: "cream", key_ingredients: ["쌀겨수", "나이아신아마이드"], tags: ["미백", "톤업"], source: "manual_v1", verified: true },
  { id: "dalba-white-truffle-cream", brand: "달바", name: "화이트 트러플 너리싱 크림", categoryId: "cream", key_ingredients: ["화이트 트러플", "시어버터"], tags: ["올리브영베스트", "안티에이징", "보습강화"], source: "manual_v1", verified: true },
  // 로션
  { id: "torriden-dive-in-lotion", brand: "토리든", name: "다이브인 로우 몰큘러 로션", categoryId: "lotion", key_ingredients: ["저분자 히알루론산", "판테놀"], tags: ["수분", "보습강화"], source: "manual_v1", verified: true },
  { id: "roundlab-dokdo-lotion", brand: "라운드랩", name: "1025 독도 로션", categoryId: "lotion", key_ingredients: ["해양심층수", "히알루론산"], tags: ["올리브영베스트", "수분"], source: "manual_v1", verified: true },
  // 수면팩
  { id: "beauty-of-joseon-sleeping", brand: "조선미녀", name: "인삼 슬리핑 마스크", categoryId: "sleeping_pack", key_ingredients: ["인삼", "프로폴리스"], tags: ["안티에이징", "보습강화"], source: "manual_v1", verified: true },
  // 선크림
  { id: "beplain-clean-ocean-sun", brand: "비플레인", name: "클린 오션 선크림", categoryId: "sunscreen", key_ingredients: ["징크옥사이드", "센텔라"], tags: ["저자극", "진정"], source: "manual_v1", verified: true },
  { id: "skin1004-centella-air-sun", brand: "스킨1004", name: "센텔라 에어핏 선 플루이드", categoryId: "sunscreen", key_ingredients: ["센텔라", "화학 자외선 차단제"], tags: ["올리브영베스트", "진정"], source: "manual_v1", verified: true },
  { id: "round-lab-dokdo-sun", brand: "라운드랩", name: "1025 독도 라이트 선크림", categoryId: "sunscreen", key_ingredients: ["해양심층수", "화학 자외선 차단제"], tags: ["올리브영베스트", "수분"], source: "manual_v1", verified: true },
  // 아이크림
  { id: "innisfree-retinol-eye", brand: "이니스프리", name: "레티놀 시카 아이크림", categoryId: "eye_cream", active_flags: ["retinol"], concentration_level: "low", key_ingredients: ["레티놀", "시카"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "numbuzin-no4-eye-cream", brand: "넘버즈인", name: "4번 아이크림", categoryId: "eye_cream", key_ingredients: ["레티놀", "펩타이드"], tags: ["올리브영베스트", "안티에이징"], source: "manual_v1", verified: true },
  // 마스크팩
  { id: "numbuzin-no3-mask", brand: "넘버즈인", name: "3번 토너 마스크", categoryId: "mask_pack", key_ingredients: ["갈락토미세스", "나이아신아마이드"], tags: ["올리브영베스트", "미백", "톤업"], source: "manual_v1", verified: true },
  { id: "one-thing-centella-mask", brand: "원씽", name: "센텔라 마스크팩", categoryId: "mask_pack", key_ingredients: ["센텔라"], tags: ["진정", "저자극"], source: "manual_v1", verified: true },
  // 스팟
  { id: "vt-cica-spot-patch", brand: "VT코스메틱", name: "시카 스팟 패치", categoryId: "spot_treatment", key_ingredients: ["시카", "하이드로콜로이드"], tags: ["트러블", "진정"], source: "manual_v1", verified: true },
  // PHA
  { id: "one-thing-pha-toner", brand: "원씽", name: "PHA 토너", categoryId: "pha", concentration_level: "low", key_ingredients: ["PHA 글루코노락톤"], tags: ["각질", "저자극"], source: "manual_v1", verified: true },
  // BHA
  { id: "one-thing-bha-toner", brand: "원씽", name: "BHA 토너", categoryId: "bha", concentration_level: "low", key_ingredients: ["살리실산"], tags: ["모공", "트러블"], source: "manual_v1", verified: true },
  // AHA
  { id: "one-thing-aha-toner", brand: "원씽", name: "AHA 토너", categoryId: "aha", concentration_level: "low", key_ingredients: ["글리콜산"], tags: ["각질", "톤업"], source: "manual_v1", verified: true },
  // 토너패드
  { id: "one-thing-cica-pad", brand: "원씽", name: "시카 토너 패드", categoryId: "toner_pad", key_ingredients: ["센텔라", "판테놀"], tags: ["진정", "저자극"], source: "manual_v1", verified: true },
  { id: "skin1004-centella-pad", brand: "스킨1004", name: "센텔라 토닝 패드", categoryId: "toner_pad", key_ingredients: ["센텔라", "나이아신아마이드"], tags: ["진정", "톤업"], source: "manual_v1", verified: true },
  // 오일클렌저
  { id: "one-thing-cleansing-oil", brand: "원씽", name: "센텔라 클렌징 오일", categoryId: "oil_cleanser", key_ingredients: ["센텔라", "호호바 오일"], tags: ["저자극"], source: "manual_v1", verified: true },
  // 추가 크림
  { id: "skin1004-centella-cream", brand: "스킨1004", name: "마다가스카르 센텔라 크림", categoryId: "cream", key_ingredients: ["센텔라 아시아티카", "마데카소사이드"], tags: ["올리브영베스트", "진정", "저자극"], source: "manual_v1", verified: true },
  { id: "manyo-galactomy-cream", brand: "마녀공장", name: "갈락토미 나이아신 수분 크림", categoryId: "cream", key_ingredients: ["갈락토미세스", "나이아신아마이드"], tags: ["미백", "수분"], source: "manual_v1", verified: true },
  // 에센스 추가
  { id: "dalba-peptide-serum", brand: "달바", name: "펩타이드 노워시 플라워 세럼", categoryId: "essence", key_ingredients: ["펩타이드", "꽃 추출물"], tags: ["안티에이징"], source: "manual_v1", verified: true },
  { id: "tamburins-perfume-serum", brand: "탬버린즈", name: "퍼퓸 시카 세럼", categoryId: "essence", key_ingredients: ["시카", "히알루론산"], tags: ["진정", "수분"], source: "manual_v1", verified: true },
  // 선크림 추가
  { id: "espoir-water-splash-sun", brand: "에스쁘아", name: "워터 스플래쉬 선크림", categoryId: "sunscreen", key_ingredients: ["화학 자외선 차단제", "히알루론산"], tags: ["수분", "톤업"], source: "manual_v1", verified: true },
  { id: "dr-ceuracle-cica-sun", brand: "닥터시라보", name: "시카 래핑 선크림", categoryId: "sunscreen", key_ingredients: ["시카", "화학 자외선 차단제"], tags: ["진정", "저자극"], source: "manual_v1", verified: true },
  // 추가 크림
  { id: "happybath-cera-cream", brand: "해피바스", name: "오리지널 세라마이드 크림", categoryId: "cream", key_ingredients: ["세라마이드", "히알루론산"], tags: ["보습강화", "저자극"], source: "manual_v1", verified: true },
];
