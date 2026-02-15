/* ─── Types ─── */

export interface Product {
  id: string;
  brand: string;
  name: string;
  categoryId: string;
  active_flags?: string[];
  concentration_level?: "low" | "medium" | "high";
  key_ingredients?: string[];
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
  { id: "banilaco-clean-it-zero", brand: "바닐라코", name: "클린잇제로", categoryId: "oil_cleanser" },
  { id: "manyo-pure-cleansing-oil", brand: "마녀공장", name: "퓨어 클렌징 오일", categoryId: "oil_cleanser" },
  { id: "innisfree-apple-seed-oil", brand: "이니스프리", name: "애플시드 클렌징 오일", categoryId: "oil_cleanser" },
  { id: "roundlab-soybean-oil", brand: "라운드랩", name: "1025 독도 클렌징 오일", categoryId: "oil_cleanser" },
  { id: "hera-sun-mate-cleansing", brand: "헤라", name: "셀에센스 클렌징 오일", categoryId: "oil_cleanser" },
  { id: "heimish-all-clean-balm", brand: "헤이미쉬", name: "올클린 밤", categoryId: "oil_cleanser" },
  { id: "skinfood-black-sugar-oil", brand: "스킨푸드", name: "블랙슈가 클렌징 오일", categoryId: "oil_cleanser" },

  // ── 폼/젤 클렌저 ──
  { id: "cosrx-low-ph-cleanser", brand: "코스알엑스", name: "로우 pH 굿모닝 젤 클렌저", categoryId: "cleanser" },
  { id: "innisfree-green-tea-foam", brand: "이니스프리", name: "그린티 폼 클렌저", categoryId: "cleanser" },
  { id: "roundlab-dokdo-cleanser", brand: "라운드랩", name: "1025 독도 클렌저", categoryId: "cleanser" },
  { id: "sulwhasoo-gentle-foam", brand: "설화수", name: "순행 클렌징 폼", categoryId: "cleanser" },
  { id: "etude-soojung-cleanser", brand: "에뛰드", name: "순정 약산성 클렌저", categoryId: "cleanser" },
  { id: "cerave-foaming-cleanser", brand: "세라비", name: "포밍 클렌저", categoryId: "cleanser" },
  { id: "isntree-sensitive-cleanser", brand: "이즈앤트리", name: "센시티브 밸런싱 클렌저", categoryId: "cleanser" },
  { id: "lrp-effaclar-gel", brand: "라로슈포제", name: "에빠끌라 젤 클렌저", categoryId: "cleanser" },
  { id: "drg-ph-cleansing-gel", brand: "닥터지", name: "레드 블레미쉬 클리어 수딩 클렌저", categoryId: "cleanser" },
  { id: "anua-heartleaf-cleanser", brand: "아누아", name: "어성초 77 클렌징 폼", categoryId: "cleanser" },
  { id: "illiyoon-ceramide-cleanser", brand: "일리윤", name: "세라마이드 아토 젠틀 폼", categoryId: "cleanser" },

  // ── 토너 ──
  { id: "roundlab-dokdo-toner", brand: "라운드랩", name: "1025 독도 토너", categoryId: "toner" },
  { id: "cosrx-propolis-toner", brand: "코스알엑스", name: "풀핏 프로폴리스 시너지 토너", categoryId: "toner" },
  { id: "innisfree-green-tea-toner", brand: "이니스프리", name: "그린티 씨드 토너", categoryId: "toner" },
  { id: "laneige-cream-skin", brand: "라네즈", name: "크림스킨 토너&모이스처라이저", categoryId: "toner" },
  { id: "missha-artemisia-toner", brand: "미샤", name: "개똥쑥 트리트먼트 에센스", categoryId: "toner" },
  { id: "klairs-supple-toner", brand: "디어클레어스", name: "서플 프레퍼레이션 토너", categoryId: "toner" },
  { id: "anua-heartleaf-toner", brand: "아누아", name: "어성초 77 토너", categoryId: "toner" },
  { id: "isntree-hyaluronic-toner", brand: "이즈앤트리", name: "히알루론산 토너", categoryId: "toner" },
  { id: "numbuzin-no3-toner", brand: "넘버즈인", name: "3번 토너", categoryId: "toner" },
  { id: "hanyul-artemisia-toner", brand: "한율", name: "쑥 진정 토너", categoryId: "toner" },
  { id: "skii-treatment-essence", brand: "SK-II", name: "페이셜 트리트먼트 에센스", categoryId: "toner" },
  { id: "torriden-dive-in-toner", brand: "토리든", name: "다이브인 로우 몰큘러 토너", categoryId: "toner" },
  { id: "goodal-green-tangerine-toner", brand: "구달", name: "청귤 비타C 토너", categoryId: "toner", active_flags: ["vitamin_c"], concentration_level: "low" },

  // ── 토너 패드 ──
  { id: "cosrx-bha-pad", brand: "코스알엑스", name: "원스텝 오리지널 클리어 패드", categoryId: "toner_pad", active_flags: ["bha"], concentration_level: "low", key_ingredients: ["BHA 1%", "버드나무껍질"] },
  { id: "cosrx-aha-pad", brand: "코스알엑스", name: "원스텝 그린 히어로 패드", categoryId: "toner_pad", active_flags: ["aha"], concentration_level: "low" },
  { id: "neogen-bio-peel-wine", brand: "네오젠", name: "바이오필 와인 패드", categoryId: "toner_pad", active_flags: ["aha"], concentration_level: "medium", key_ingredients: ["AHA", "와인 추출물"] },
  { id: "neogen-bio-peel-lemon", brand: "네오젠", name: "바이오필 레몬 패드", categoryId: "toner_pad", active_flags: ["aha", "vitamin_c"], concentration_level: "low" },
  { id: "medicube-zero-pore-pad", brand: "메디큐브", name: "제로모공 패드 2.0", categoryId: "toner_pad", active_flags: ["bha"], concentration_level: "medium", key_ingredients: ["BHA", "AHA", "나이아신아마이드"] },
  { id: "numbuzin-no5-pad", brand: "넘버즈인", name: "5번 패드", categoryId: "toner_pad", active_flags: ["bha"], concentration_level: "low" },
  { id: "somebymi-miracle-toner-pad", brand: "썸바이미", name: "AHA BHA PHA 미라클 토너 패드", categoryId: "toner_pad", active_flags: ["aha", "bha", "pha"], concentration_level: "low" },
  { id: "vt-cica-mild-pad", brand: "VT코스메틱", name: "시카 마일드 토너 패드", categoryId: "toner_pad" },
  { id: "anua-heartleaf-pad", brand: "아누아", name: "어성초 77 토너 패드", categoryId: "toner_pad" },
  { id: "roundlab-birch-pad", brand: "라운드랩", name: "자작나무 수분 토너 패드", categoryId: "toner_pad" },

  // ── 에센스 ──
  { id: "cosrx-snail-essence", brand: "코스알엑스", name: "어드밴스드 스네일 96 에센스", categoryId: "essence", key_ingredients: ["달팽이 뮤신 96%"] },
  { id: "manyo-bifida-essence", brand: "마녀공장", name: "비피다 바이옴 컴플렉스 앰플", categoryId: "essence", key_ingredients: ["비피다", "락토바실러스"] },
  { id: "missha-fte", brand: "미샤", name: "타임레볼루션 FTE", categoryId: "essence" },
  { id: "sulwhasoo-first-care", brand: "설화수", name: "윤조에센스", categoryId: "essence" },
  { id: "iope-stem3", brand: "아이오페", name: "스템III 세럼", categoryId: "essence" },
  { id: "innisfree-green-tea-seed", brand: "이니스프리", name: "그린티 씨드 세럼", categoryId: "essence" },
  { id: "numbuzin-no5-serum", brand: "넘버즈인", name: "5번 세럼", categoryId: "essence" },
  { id: "torriden-dive-in-serum", brand: "토리든", name: "다이브인 세럼", categoryId: "essence", key_ingredients: ["저분자 히알루론산"] },
  { id: "beauty-of-joseon-glow", brand: "조선미녀", name: "광채 세럼", categoryId: "essence", key_ingredients: ["프로폴리스", "나이아신아마이드"] },
  { id: "hera-cell-bio-serum", brand: "헤라", name: "셀 바이오 세럼", categoryId: "essence" },

  // ── 앰플 ──
  { id: "cnp-propolis-ampoule", brand: "CNP", name: "프로폴리스 에너지 앰플", categoryId: "ampoule", key_ingredients: ["프로폴리스"] },
  { id: "laneige-radian-c", brand: "라네즈", name: "래디언-C 앰플", categoryId: "ampoule", active_flags: ["vitamin_c"], concentration_level: "medium" },
  { id: "drjart-ceramidin-liquid", brand: "닥터자르트", name: "세라마이딘 리퀴드", categoryId: "ampoule", key_ingredients: ["세라마이드"] },
  { id: "isntree-green-tea-ampoule", brand: "이즈앤트리", name: "그린티 프레쉬 앰플", categoryId: "ampoule" },
  { id: "mediheal-tea-tree-ampoule", brand: "메디힐", name: "티트리 카밍 앰플", categoryId: "ampoule" },

  // ── 비타민C 세럼 ──
  { id: "klairs-vitamin-c", brand: "디어클레어스", name: "프레쉬리 쥬스드 비타민 드롭", categoryId: "vitamin_c", concentration_level: "low", key_ingredients: ["아스코르빈산 5%"] },
  { id: "ordinary-vitamin-c-23", brand: "디오디너리", name: "비타민C 서스펜션 23%+HA", categoryId: "vitamin_c", concentration_level: "high", key_ingredients: ["아스코르빈산 23%"] },
  { id: "ordinary-vitamin-c-8", brand: "디오디너리", name: "아스코빅 애시드 8%+알파아르부틴 2%", categoryId: "vitamin_c", concentration_level: "medium", key_ingredients: ["아스코르빈산 8%", "알파아르부틴"] },
  { id: "goodal-vita-c-serum", brand: "구달", name: "청귤 비타C 세럼", categoryId: "vitamin_c", concentration_level: "medium", key_ingredients: ["비타민C"] },
  { id: "obagi-c10", brand: "오바지", name: "C10 세럼", categoryId: "vitamin_c", concentration_level: "medium", key_ingredients: ["아스코르빈산 10%"] },
  { id: "rohto-melano-cc", brand: "멜라노CC", name: "집중대책 미용액", categoryId: "vitamin_c", concentration_level: "medium", key_ingredients: ["비타민C 유도체"] },
  { id: "somebymi-galactomyces-vitc", brand: "썸바이미", name: "갈락토미세스 비타민C 세럼", categoryId: "vitamin_c", concentration_level: "medium" },
  { id: "skinaqua-tone-up-vitc", brand: "스킨아쿠아", name: "비타C 톤업 에센스", categoryId: "vitamin_c", concentration_level: "low" },
  { id: "cellfusion-vitamin-tree", brand: "셀퓨전씨", name: "비타트리 시너지 세럼", categoryId: "vitamin_c", concentration_level: "medium" },
  { id: "lrp-pure-vitamin-c10", brand: "라로슈포제", name: "퓨어 비타민C10 세럼", categoryId: "vitamin_c", concentration_level: "medium", key_ingredients: ["아스코르빈산 10%", "살리실산"] },

  // ── 나이아신아마이드 ──
  { id: "ordinary-niacinamide-10", brand: "디오디너리", name: "나이아신아마이드 10%+징크 1%", categoryId: "niacinamide", concentration_level: "high", key_ingredients: ["나이아신아마이드 10%", "징크"] },
  { id: "cosrx-galactomyces-essence", brand: "코스알엑스", name: "갈락토미세스 95 토너", categoryId: "niacinamide", concentration_level: "medium", key_ingredients: ["갈락토미세스", "나이아신아마이드 2%"] },
  { id: "numbuzin-no3-serum", brand: "넘버즈인", name: "3번 세럼 - 글루타치온", categoryId: "niacinamide", concentration_level: "medium" },
  { id: "beauty-of-joseon-glow-niac", brand: "조선미녀", name: "쌀 + 알파아르부틴 세럼", categoryId: "niacinamide", active_flags: ["alpha_arbutin"], key_ingredients: ["쌀겨수", "알파아르부틴 2%", "나이아신아마이드"] },

  // ── 히알루론산 ──
  { id: "isntree-ha-toner", brand: "이즈앤트리", name: "히알루론산 토너", categoryId: "hyaluronic", key_ingredients: ["히알루론산"] },
  { id: "ordinary-ha", brand: "디오디너리", name: "히알루론산 2%+B5", categoryId: "hyaluronic", key_ingredients: ["히알루론산 2%", "판테놀"] },
  { id: "torriden-dive-in-ha", brand: "토리든", name: "다이브인 저분자 히알루론산 세럼", categoryId: "hyaluronic", key_ingredients: ["5가지 히알루론산"] },
  { id: "laneige-water-bank-serum", brand: "라네즈", name: "워터뱅크 블루 HA 세럼", categoryId: "hyaluronic" },
  { id: "cosrx-hyaluronic-serum", brand: "코스알엑스", name: "히알루론산 인텐시브 크림", categoryId: "hyaluronic" },

  // ── 레티놀 ──
  { id: "ordinary-retinol-05", brand: "디오디너리", name: "레티놀 0.5% in 스쿠알란", categoryId: "retinol", concentration_level: "medium", key_ingredients: ["레티놀 0.5%", "스쿠알란"] },
  { id: "ordinary-retinol-1", brand: "디오디너리", name: "레티놀 1% in 스쿠알란", categoryId: "retinol", concentration_level: "high", key_ingredients: ["레티놀 1%", "스쿠알란"] },
  { id: "ordinary-granactive-retinoid", brand: "디오디너리", name: "그래낵티브 레티노이드 2%", categoryId: "retinol", concentration_level: "medium", key_ingredients: ["HPR 2%"] },
  { id: "cosrx-retinol-cream", brand: "코스알엑스", name: "더 레티놀 0.1 크림", categoryId: "retinol", concentration_level: "low", key_ingredients: ["레티놀 0.1%"] },
  { id: "innisfree-retinol-cica", brand: "이니스프리", name: "레티놀 시카 흔적 앰플", categoryId: "retinol", concentration_level: "medium" },
  { id: "drg-retinol-serum", brand: "닥터지", name: "레드 블레미쉬 클리어 수딩 크림", categoryId: "retinol", concentration_level: "low" },
  { id: "lrp-retinol-b3", brand: "라로슈포제", name: "레티놀 B3 세럼", categoryId: "retinol", concentration_level: "medium", key_ingredients: ["레티놀", "나이아신아마이드"] },
  { id: "paula-retinol-treatment", brand: "폴라초이스", name: "1% 레티놀 트리트먼트", categoryId: "retinol", concentration_level: "high", key_ingredients: ["레티놀 1%"] },
  { id: "iope-retigen", brand: "아이오페", name: "레티젠 크림", categoryId: "retinol", concentration_level: "medium" },
  { id: "ahc-real-retinol", brand: "AHC", name: "리얼 레티놀 앰플", categoryId: "retinol", concentration_level: "medium" },

  // ── AHA ──
  { id: "cosrx-aha-7-whitehead", brand: "코스알엑스", name: "AHA 7 화이트헤드 파워 리퀴드", categoryId: "aha", concentration_level: "medium", key_ingredients: ["글리콜산 7%"] },
  { id: "ordinary-glycolic-7", brand: "디오디너리", name: "글리콜산 7% 토닝 솔루션", categoryId: "aha", concentration_level: "medium", key_ingredients: ["글리콜산 7%"] },
  { id: "ordinary-aha-30-bha-2", brand: "디오디너리", name: "AHA 30%+BHA 2% 필링 솔루션", categoryId: "aha", active_flags: ["bha"], concentration_level: "high", key_ingredients: ["AHA 30%", "BHA 2%"] },
  { id: "paula-aha-8", brand: "폴라초이스", name: "스킨 퍼펙팅 8% AHA 젤", categoryId: "aha", concentration_level: "medium", key_ingredients: ["글리콜산 8%"] },
  { id: "isntree-aha-8", brand: "이즈앤트리", name: "클리어 스킨 8% AHA 에센스", categoryId: "aha", concentration_level: "medium" },

  // ── BHA ──
  { id: "cosrx-bha-liquid", brand: "코스알엑스", name: "BHA 블랙헤드 파워 리퀴드", categoryId: "bha", concentration_level: "medium", key_ingredients: ["BHA 4%"] },
  { id: "paula-bha-2", brand: "폴라초이스", name: "스킨 퍼펙팅 2% BHA 리퀴드", categoryId: "bha", concentration_level: "medium", key_ingredients: ["살리실산 2%"] },
  { id: "ordinary-salicylic-2", brand: "디오디너리", name: "살리실산 2% 솔루션", categoryId: "bha", concentration_level: "medium", key_ingredients: ["살리실산 2%"] },
  { id: "somebymi-aha-bha-pha-toner", brand: "썸바이미", name: "AHA/BHA/PHA 30일 미라클 토너", categoryId: "bha", active_flags: ["aha", "pha"], concentration_level: "low" },
  { id: "innisfree-bija-serum", brand: "이니스프리", name: "비자 트러블 스킨", categoryId: "bha", concentration_level: "low" },

  // ── PHA ──
  { id: "cosrx-pha-moisture-renewal", brand: "코스알엑스", name: "PHA 모이스처 리뉴얼 파워 크림", categoryId: "pha", concentration_level: "low" },
  { id: "cnp-invisible-peeling-booster", brand: "CNP", name: "인비저블 필링 부스터", categoryId: "pha", concentration_level: "medium", key_ingredients: ["PHA", "살리실산"] },

  // ── 로션/에멀전 ──
  { id: "innisfree-green-tea-lotion", brand: "이니스프리", name: "그린티 씨드 로션", categoryId: "lotion" },
  { id: "laneige-water-bank-emulsion", brand: "라네즈", name: "워터뱅크 블루 에멀전", categoryId: "lotion" },
  { id: "sulwhasoo-essential-emulsion", brand: "설화수", name: "자음 유액", categoryId: "lotion" },
  { id: "missha-revolution-lotion", brand: "미샤", name: "타임레볼루션 로션", categoryId: "lotion" },
  { id: "iope-derma-emulsion", brand: "아이오페", name: "더마 리페어 에멀전", categoryId: "lotion" },

  // ── 크림 ──
  { id: "cosrx-snail-cream", brand: "코스알엑스", name: "어드밴스드 스네일 92 올인원 크림", categoryId: "cream", key_ingredients: ["달팽이 뮤신 92%"] },
  { id: "laneige-water-sleeping-mask", brand: "라네즈", name: "워터 슬리핑 마스크", categoryId: "cream" },
  { id: "sulwhasoo-ginseng-cream", brand: "설화수", name: "자음생 크림", categoryId: "cream" },
  { id: "belif-aqua-bomb", brand: "벨리프", name: "아쿠아 밤", categoryId: "cream" },
  { id: "belif-moisturizing-bomb", brand: "벨리프", name: "모이스처라이징 밤", categoryId: "cream" },
  { id: "drjart-ceramidin-cream", brand: "닥터자르트", name: "세라마이딘 크림", categoryId: "cream", key_ingredients: ["세라마이드", "판테놀"] },
  { id: "innisfree-green-tea-cream", brand: "이니스프리", name: "그린티 씨드 크림", categoryId: "cream" },
  { id: "illiyoon-ceramide-cream", brand: "일리윤", name: "세라마이드 아토 컨센트레이트 크림", categoryId: "cream", key_ingredients: ["세라마이드"] },
  { id: "lrp-cicaplast-b5", brand: "라로슈포제", name: "시카플라스트 밤 B5+", categoryId: "cream", key_ingredients: ["판테놀 5%", "마데카소사이드"] },
  { id: "etude-soon-jung-cream", brand: "에뛰드", name: "순정 2x 배리어 인텐시브 크림", categoryId: "cream", key_ingredients: ["판테놀", "마데카소사이드"] },
  { id: "aestura-atobarrier-365", brand: "에스트라", name: "아토배리어 365 크림", categoryId: "cream", key_ingredients: ["세라마이드", "MLE"] },
  { id: "roundlab-birch-cream", brand: "라운드랩", name: "자작나무 수분 크림", categoryId: "cream" },
  { id: "vt-cica-cream", brand: "VT코스메틱", name: "시카크림", categoryId: "cream", key_ingredients: ["시카", "나이아신아마이드"] },
  { id: "hera-black-cushion-cream", brand: "헤라", name: "에이지 리버스 크림", categoryId: "cream" },
  { id: "nature-republic-aloe", brand: "네이처리퍼블릭", name: "수딩앤모이스처 알로에 92% 젤", categoryId: "cream" },
  { id: "kiehls-ultra-facial", brand: "키엘", name: "울트라 페이셜 크림", categoryId: "cream" },
  { id: "clinique-moisture-surge", brand: "크리니크", name: "모이스처 서지 100H", categoryId: "cream" },
  { id: "derma-cica-cream", brand: "더마토리", name: "하이포알러제닉 시카 크림", categoryId: "cream" },
  { id: "manyo-bifida-cream", brand: "마녀공장", name: "비피다 바이옴 크림", categoryId: "cream" },
  { id: "avene-cicalfate", brand: "아벤느", name: "시칼파트+ 리페어 크림", categoryId: "cream", key_ingredients: ["시카", "구리아연"] },
  { id: "vichy-mineral-89-cream", brand: "비쉬", name: "미네랄 89 크림", categoryId: "cream" },
  { id: "cerave-moisturizing-cream", brand: "세라비", name: "모이스처라이징 크림", categoryId: "cream", key_ingredients: ["세라마이드", "히알루론산"] },

  // ── 수면팩 ──
  { id: "laneige-sleeping-mask", brand: "라네즈", name: "워터 슬리핑 마스크 EX", categoryId: "sleeping_pack" },
  { id: "innisfree-green-tea-sleeping", brand: "이니스프리", name: "그린티 슬리핑 마스크", categoryId: "sleeping_pack" },
  { id: "cosrx-honey-sleeping", brand: "코스알엑스", name: "얼티밋 허니 오버나이트 마스크", categoryId: "sleeping_pack" },
  { id: "sulwhasoo-overnight-mask", brand: "설화수", name: "여윤 슬리핑 마스크", categoryId: "sleeping_pack" },

  // ── 선크림 ──
  { id: "beauty-of-joseon-sun", brand: "조선미녀", name: "맑은 쌀 선크림", categoryId: "sunscreen", key_ingredients: ["쌀겨수", "프로바이오틱스"] },
  { id: "roundlab-birch-sun", brand: "라운드랩", name: "자작나무 수분 선크림", categoryId: "sunscreen" },
  { id: "isntree-ha-watery-sun", brand: "이즈앤트리", name: "히알루론산 워터리 선젤", categoryId: "sunscreen" },
  { id: "missha-sun-essence", brand: "미샤", name: "올 어라운드 세이프 블록 에센스 선", categoryId: "sunscreen" },
  { id: "lrp-anthelios-uvmune", brand: "라로슈포제", name: "안뗄리오스 UVmune 400 플루이드", categoryId: "sunscreen" },
  { id: "innisfree-daily-uv", brand: "이니스프리", name: "데일리 UV 디펜스 선크림", categoryId: "sunscreen" },
  { id: "skin1004-centella-sun", brand: "스킨1004", name: "마다가스카르 센텔라 에어핏 선크림", categoryId: "sunscreen" },
  { id: "anessa-perfect-uv", brand: "아네사", name: "퍼펙트 UV 선스킨 밀크", categoryId: "sunscreen" },
  { id: "biore-aqua-rich", brand: "비오레", name: "UV 아쿠아리치 워터리 에센스", categoryId: "sunscreen" },
  { id: "cellfusion-toneup-sun", brand: "셀퓨전씨", name: "톤업 선크림", categoryId: "sunscreen" },
  { id: "ahc-natural-perfection-sun", brand: "AHC", name: "내추럴 퍼펙션 선스틱", categoryId: "sunscreen" },
  { id: "etude-sunprise-mild", brand: "에뛰드", name: "순프라이즈 마일드 에어리 피니쉬", categoryId: "sunscreen" },
  { id: "torriden-dive-in-sun", brand: "토리든", name: "다이브인 워터리 선크림", categoryId: "sunscreen" },
  { id: "vt-cica-sun", brand: "VT코스메틱", name: "시카 데일리 수딩 선크림", categoryId: "sunscreen" },
  { id: "dermatory-allergy-sun", brand: "더마토리", name: "하이포알러제닉 선크림", categoryId: "sunscreen" },
  { id: "canmake-mermaid-uv", brand: "캔메이크", name: "머메이드 스킨 젤 UV", categoryId: "sunscreen" },

  // ── 아이크림 ──
  { id: "innisfree-green-tea-eye", brand: "이니스프리", name: "그린티 씨드 아이크림", categoryId: "eye_cream" },
  { id: "sulwhasoo-eye-cream", brand: "설화수", name: "자음생 아이크림", categoryId: "eye_cream" },
  { id: "ahc-eye-cream", brand: "AHC", name: "텐 레볼루션 리얼 아이크림", categoryId: "eye_cream" },
  { id: "drjart-ceramidin-eye", brand: "닥터자르트", name: "세라마이딘 아이크림", categoryId: "eye_cream" },
  { id: "belif-eye-bomb", brand: "벨리프", name: "모이스처라이징 아이 밤", categoryId: "eye_cream" },

  // ── 스팟 트리트먼트 ──
  { id: "cosrx-pimple-patch", brand: "코스알엑스", name: "아크네 핌플 마스터 패치", categoryId: "spot_treatment" },
  { id: "some-by-mi-miracle-patch", brand: "썸바이미", name: "30 데이즈 미라클 클리어 스팟 패치", categoryId: "spot_treatment" },
  { id: "innisfree-bija-spot", brand: "이니스프리", name: "비자 트러블 스팟 에센스", categoryId: "spot_treatment" },
  { id: "nexcare-blemish-patch", brand: "넥스케어", name: "블레미쉬 클리어 커버", categoryId: "spot_treatment" },

  // ── 마스크팩 ──
  { id: "mediheal-tea-tree-mask", brand: "메디힐", name: "티트리 케어 솔루션 마스크", categoryId: "mask_pack" },
  { id: "mediheal-nme-mask", brand: "메디힐", name: "N.M.F 아쿠아링 마스크", categoryId: "mask_pack" },
  { id: "innisfree-green-tea-mask", brand: "이니스프리", name: "마이 리얼 스퀴즈 마스크 그린티", categoryId: "mask_pack" },
  { id: "drjart-ceramidin-mask", brand: "닥터자르트", name: "세라마이딘 마스크", categoryId: "mask_pack" },
  { id: "abib-gummy-mask", brand: "아비브", name: "구미 시트 마스크 히알루론산", categoryId: "mask_pack" },
  { id: "papa-recipe-honey-mask", brand: "파파레서피", name: "봄비 꿀 마스크", categoryId: "mask_pack" },
  { id: "sulwhasoo-first-care-mask", brand: "설화수", name: "퍼스트케어 액티베이팅 마스크", categoryId: "mask_pack" },

  // ── 추가 제품 (카테고리 혼합) ──
  { id: "cosrx-centella-toner", brand: "코스알엑스", name: "센텔라 워터 알코올프리 토너", categoryId: "toner" },
  { id: "isntree-aloe-gel", brand: "이즈앤트리", name: "알로에 수딩 젤 80%", categoryId: "cream" },
  { id: "skin1004-centella-ampoule", brand: "스킨1004", name: "마다가스카르 센텔라 앰플", categoryId: "ampoule", key_ingredients: ["센텔라 추출물"] },
  { id: "goodal-green-tangerine-serum", brand: "구달", name: "청귤 비타C 다크스팟 세럼", categoryId: "vitamin_c", concentration_level: "medium" },
  { id: "numbuzin-no1-essence", brand: "넘버즈인", name: "1번 에센스", categoryId: "essence" },
  { id: "anua-heartleaf-cream", brand: "아누아", name: "어성초 77 수딩 크림", categoryId: "cream" },
  { id: "manyo-galactomy-essence", brand: "마녀공장", name: "갈락토미 나이아신 에센스", categoryId: "essence", key_ingredients: ["갈락토미세스", "나이아신아마이드"] },
  { id: "roundlab-mugwort-cream", brand: "라운드랩", name: "쑥 진정 크림", categoryId: "cream" },
  { id: "lrp-effaclar-duo", brand: "라로슈포제", name: "에빠끌라 듀오+ 크림", categoryId: "cream", active_flags: ["niacinamide"], key_ingredients: ["나이아신아마이드", "살리실산"] },
  { id: "anua-niacinamide-serum", brand: "아누아", name: "나이아신아마이드 10% 세럼", categoryId: "niacinamide", concentration_level: "high" },
  { id: "cosrx-aha-bha-toner", brand: "코스알엑스", name: "AHA/BHA 클래리파잉 트리트먼트 토너", categoryId: "toner", active_flags: ["aha", "bha"], concentration_level: "low" },
  { id: "hera-black-serum", brand: "헤라", name: "블랙 세럼", categoryId: "essence" },
  { id: "laneige-retinol-eye", brand: "라네즈", name: "퍼펙트 리뉴 래디언스 아이크림", categoryId: "eye_cream", active_flags: ["retinol"], concentration_level: "low" },
  { id: "ordinary-azelaic-10", brand: "디오디너리", name: "아젤라인산 10% 서스펜션", categoryId: "spot_treatment", concentration_level: "medium" },
  { id: "ordinary-niacinamide-5", brand: "디오디너리", name: "나이아신아마이드 5%", categoryId: "niacinamide", concentration_level: "medium" },
  { id: "missha-vita-c-ampoule", brand: "미샤", name: "비타C 플러스 앰플", categoryId: "vitamin_c", concentration_level: "medium" },
  { id: "drjart-cicapair-cream", brand: "닥터자르트", name: "시카페어 크림", categoryId: "cream", key_ingredients: ["센텔라", "시카"] },
  { id: "nature-republic-snail", brand: "네이처리퍼블릭", name: "슈퍼 아쿠아 맥스 수분 크림", categoryId: "cream" },
  { id: "skinfood-royal-honey", brand: "스킨푸드", name: "로열허니 프로폴리스 에센스", categoryId: "essence", key_ingredients: ["프로폴리스", "꿀"] },
  { id: "cnp-mugener-ampoule", brand: "CNP", name: "뮤제너 앰플", categoryId: "ampoule" },
  { id: "vt-reedle-shot-300", brand: "VT코스메틱", name: "리들샷 300", categoryId: "ampoule", key_ingredients: ["실리카", "마이크로니들"] },
  { id: "anua-peach-serum", brand: "아누아", name: "복숭아 70 나이아신아마이드 세럼", categoryId: "niacinamide", concentration_level: "medium" },
  { id: "isntree-tw-real-bifida", brand: "이즈앤트리", name: "TW-REAL 비피다 앰플", categoryId: "ampoule", key_ingredients: ["비피다"] },
  { id: "etude-moistfull-cream", brand: "에뛰드", name: "모이스트풀 콜라겐 크림", categoryId: "cream" },
  { id: "drjart-vital-hydra", brand: "닥터자르트", name: "바이탈 하이드라 솔루션 크림", categoryId: "cream" },
  { id: "roundlab-pine-serum", brand: "라운드랩", name: "소나무 진정 시카 세럼", categoryId: "essence" },
];
