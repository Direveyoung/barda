/* ─── Challenge Presets & Daily Tips ─── */

export interface ChallengePreset {
  id: string;
  label: string;
  description: string;
  days: number;
  theme: string;
  icon: string;
}

export interface ChallengeDayTip {
  title: string;
  desc: string;
  icon: string;
}

export const CHALLENGE_PRESETS: ChallengePreset[] = [
  { id: "basic_7",        label: "기본 7일",          description: "스킨케어 기초를 다져요",         days: 7,  theme: "basic",       icon: "trophy" },
  { id: "hydration_14",   label: "보습 집중 14일",     description: "촉촉한 피부를 만들어요",         days: 14, theme: "hydration",   icon: "drop" },
  { id: "brightening_21", label: "브라이트닝 21일",    description: "맑고 밝은 피부를 위해",          days: 21, theme: "brightening", icon: "sparkle" },
  { id: "acne_21",        label: "트러블 케어 21일",   description: "깨끗한 피부를 되찾아요",         days: 21, theme: "acne",        icon: "burst" },
  { id: "antiaging_30",   label: "안티에이징 30일",    description: "탄탄하고 건강한 피부 만들기",     days: 30, theme: "antiaging",   icon: "purple-heart" },
];

/* ─── Per-theme daily tips ─── */

function generateTips(theme: string, totalDays: number): ChallengeDayTip[] {
  const tips: ChallengeDayTip[] = [];

  if (theme === "basic") {
    const base: ChallengeDayTip[] = [
      { title: "기본 루틴 세팅",     desc: "클렌저 → 토너 → 보습 → 선크림, 기본 4단계부터 시작!", icon: "bottle" },
      { title: "아침 루틴 집중",     desc: "아침은 가볍게! 클렌저 + 토너 + 보습 + 선크림", icon: "sun" },
      { title: "저녁 더블 클렌징",   desc: "메이크업/선크림 제거를 위해 오일 → 폼 순서로", icon: "moon" },
      { title: "보습 강화의 날",     desc: "히알루론산 또는 세라마이드 제품으로 보습 레이어링", icon: "drop" },
      { title: "액티브 성분 도전",   desc: "비타민C(아침) 또는 나이아신아마이드를 추가해 보세요", icon: "sparkle" },
      { title: "스페셜 케어 데이",   desc: "마스크팩 또는 아이크림으로 집중 케어 시간", icon: "mask" },
      { title: "7일 루틴 완성!",     desc: "축하해요! 일주일 루틴을 모두 완주했어요", icon: "celebration" },
    ];
    return base.slice(0, totalDays);
  }

  if (theme === "hydration") {
    const pool: ChallengeDayTip[] = [
      { title: "수분 체크",          desc: "피부 당김 체크 — 기본 토너부터 충분히 적셔주세요", icon: "drop" },
      { title: "히알루론산 도입",    desc: "젖은 피부에 히알루론산 세럼을 발라 수분을 잡아주세요", icon: "beaker" },
      { title: "세라마이드 장벽",    desc: "세라마이드 크림으로 수분 증발을 막아주세요", icon: "shield" },
      { title: "미스트 습관",        desc: "낮에 2~3번 미스트를 뿌려 수분을 보충하세요", icon: "drop" },
      { title: "수면팩 나이트",      desc: "자기 전 수면팩으로 밤새 수분 집중 공급", icon: "moon" },
      { title: "마스크팩 데이",      desc: "시트 마스크로 15분 집중 보습 시간", icon: "mask" },
      { title: "오일 레이어링",      desc: "크림 위에 페이셜 오일로 수분을 봉인하세요", icon: "bottle" },
    ];
    for (let i = 0; i < totalDays; i++) tips.push(pool[i % pool.length]);
    return tips;
  }

  if (theme === "brightening") {
    const pool: ChallengeDayTip[] = [
      { title: "비타민C 시작",       desc: "아침 토너 후 비타민C 세럼을 발라주세요", icon: "sparkle" },
      { title: "선크림 필수",        desc: "미백 케어 중 선크림은 2시간마다 덧바르세요", icon: "sun" },
      { title: "나이아신아마이드",   desc: "저녁에 나이아신아마이드로 톤업 + 피지 조절", icon: "beaker" },
      { title: "각질 관리",          desc: "주 1회 AHA/PHA로 묵은 각질을 부드럽게 제거", icon: "sparkle" },
      { title: "아르부틴 집중",      desc: "잡티 부위에 아르부틴 세럼을 집중 도포", icon: "target" },
      { title: "마스크 부스팅",      desc: "브라이트닝 마스크로 유효 성분 집중 흡수", icon: "mask" },
      { title: "수분 베이스",        desc: "히알루론산으로 수분을 채우면 성분 흡수가 좋아져요", icon: "drop" },
    ];
    for (let i = 0; i < totalDays; i++) tips.push(pool[i % pool.length]);
    return tips;
  }

  if (theme === "acne") {
    const pool: ChallengeDayTip[] = [
      { title: "순한 클렌징",        desc: "약산성 클렌저로 피부 장벽을 지키며 세안하세요", icon: "bubble" },
      { title: "BHA 도입",           desc: "BHA(살리실산)로 모공 속 피지를 녹여주세요", icon: "beaker" },
      { title: "진정 토너",          desc: "티트리 또는 시카 성분 토너로 염증을 진정시키세요", icon: "leaf" },
      { title: "가벼운 보습",        desc: "논코메도제닉 젤크림으로 유수분 밸런스를 맞추세요", icon: "jar" },
      { title: "스팟 케어",          desc: "트러블 부위에만 스팟 트리트먼트를 도포하세요", icon: "target" },
      { title: "손 대지 않기 챌린지", desc: "하루 동안 의식적으로 얼굴을 만지지 않아 보세요", icon: "hand" },
      { title: "베개 커버 교체",     desc: "깨끗한 베개 커버가 트러블 예방의 시작이에요", icon: "sparkle" },
    ];
    for (let i = 0; i < totalDays; i++) tips.push(pool[i % pool.length]);
    return tips;
  }

  if (theme === "antiaging") {
    const pool: ChallengeDayTip[] = [
      { title: "레티놀 시작",        desc: "저녁 토너 후 레티놀을 소량부터 시작하세요 (주 2~3회)", icon: "purple-heart" },
      { title: "선크림 철저히",      desc: "안티에이징의 기본! 선크림을 꼼꼼히 발라주세요", icon: "sun" },
      { title: "펩타이드 세럼",      desc: "콜라겐 생성을 돕는 펩타이드로 탄력을 채워주세요", icon: "beaker" },
      { title: "아이크림 케어",      desc: "눈가 주름은 전용 아이크림으로 집중 관리하세요", icon: "eye" },
      { title: "아데노신 보습",      desc: "아데노신 함유 크림으로 주름 개선 + 보습 동시에", icon: "jar" },
      { title: "마스크팩 집중",      desc: "콜라겐 또는 펩타이드 마스크로 탄력을 올려주세요", icon: "mask" },
      { title: "레티놀 쉬는 날",     desc: "오늘은 레티놀 쉬고, 진정 + 보습에 집중하세요", icon: "leaf" },
    ];
    for (let i = 0; i < totalDays; i++) tips.push(pool[i % pool.length]);
    return tips;
  }

  // Fallback
  for (let i = 0; i < totalDays; i++) {
    tips.push({ title: `Day ${i + 1}`, desc: "오늘도 루틴을 완수하세요!", icon: "sparkle" });
  }
  return tips;
}

export function getChallengeTips(presetId: string): ChallengeDayTip[] {
  const preset = CHALLENGE_PRESETS.find((p) => p.id === presetId);
  if (!preset) return generateTips("basic", 7);
  return generateTips(preset.theme, preset.days);
}
