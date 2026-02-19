/* ─── Weather-based Skincare Tips ─── */
/* Uses Open-Meteo API (free, no API key needed) */

export interface WeatherData {
  temperature: number;
  humidity: number;
  uvIndex: number;
  weatherCode: number;
  description: string;
  icon: string;
  /** 미세먼지 PM2.5 (µg/m³), null if unavailable */
  pm25: number | null;
  /** 미세먼지 PM10 (µg/m³), null if unavailable */
  pm10: number | null;
  /** 시간대별 기온 (0~23시), null if unavailable */
  hourlyTemp: number[] | null;
  /** 시간대별 UV 인덱스 (0~23시), null if unavailable */
  hourlyUV: number[] | null;
  /** 현재 계절 */
  season: "spring" | "summer" | "autumn" | "winter";
}

export interface WeatherTip {
  emoji: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  /** 시간대 태그 (optional) */
  timeTag?: "morning" | "afternoon" | "evening";
}

/* ─── Weather code → description mapping ─── */
const WEATHER_DESCRIPTIONS: Record<number, { desc: string; icon: string }> = {
  0: { desc: "맑음", icon: "☀️" },
  1: { desc: "대체로 맑음", icon: "🌤️" },
  2: { desc: "구름 조금", icon: "⛅" },
  3: { desc: "흐림", icon: "☁️" },
  45: { desc: "안개", icon: "🌫️" },
  48: { desc: "안개", icon: "🌫️" },
  51: { desc: "이슬비", icon: "🌦️" },
  53: { desc: "이슬비", icon: "🌦️" },
  55: { desc: "이슬비", icon: "🌦️" },
  61: { desc: "비", icon: "🌧️" },
  63: { desc: "비", icon: "🌧️" },
  65: { desc: "폭우", icon: "🌧️" },
  71: { desc: "눈", icon: "🌨️" },
  73: { desc: "눈", icon: "🌨️" },
  75: { desc: "폭설", icon: "🌨️" },
  77: { desc: "싸락눈", icon: "🌨️" },
  80: { desc: "소나기", icon: "🌦️" },
  81: { desc: "소나기", icon: "🌦️" },
  82: { desc: "폭우", icon: "⛈️" },
  85: { desc: "눈", icon: "🌨️" },
  86: { desc: "폭설", icon: "🌨️" },
  95: { desc: "뇌우", icon: "⛈️" },
  96: { desc: "우박", icon: "⛈️" },
  99: { desc: "우박", icon: "⛈️" },
};

/* ─── Seoul default coordinates ─── */
const DEFAULT_LAT = 37.5665;
const DEFAULT_LON = 126.978;

/* ─── Cache key ─── */
const CACHE_KEY = "barda_weather";
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface CachedWeather {
  data: WeatherData;
  timestamp: number;
}

/** Determine season from month */
function getSeason(month: number): WeatherData["season"] {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

/** Try to get user's location, fallback to Seoul */
function getLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve({ lat: DEFAULT_LAT, lon: DEFAULT_LON }),
      { timeout: 5000 }
    );
  });
}

/** Fetch weather data from Open-Meteo API (enhanced with hourly + air quality) */
export async function fetchWeather(): Promise<WeatherData | null> {
  if (typeof window === "undefined") return null;

  // Check cache first
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed: CachedWeather = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL) {
        return parsed.data;
      }
    }
  } catch { /* ignore */ }

  try {
    const { lat, lon } = await getLocation();

    // Fetch weather + hourly forecast in parallel with air quality
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&hourly=temperature_2m,uv_index&daily=uv_index_max&timezone=Asia%2FSeoul&forecast_days=1`;
    const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10&timezone=Asia%2FSeoul`;

    const [weatherRes, airRes] = await Promise.all([
      fetch(weatherUrl, { signal: AbortSignal.timeout(8000) }),
      fetch(airUrl, { signal: AbortSignal.timeout(8000) }).catch(() => null),
    ]);

    if (!weatherRes.ok) return null;
    const weatherJson = await weatherRes.json();

    // Air quality (optional, may fail)
    let pm25: number | null = null;
    let pm10: number | null = null;
    if (airRes?.ok) {
      try {
        const airJson = await airRes.json();
        pm25 = airJson.current?.pm2_5 != null ? Math.round(airJson.current.pm2_5) : null;
        pm10 = airJson.current?.pm10 != null ? Math.round(airJson.current.pm10) : null;
      } catch { /* ignore */ }
    }

    const weatherCode = weatherJson.current?.weather_code ?? 0;
    const weatherInfo = WEATHER_DESCRIPTIONS[weatherCode] ?? { desc: "알 수 없음", icon: "🌡️" };

    // Parse hourly data
    const hourlyTemp: number[] | null = weatherJson.hourly?.temperature_2m
      ? (weatherJson.hourly.temperature_2m as number[]).slice(0, 24).map(Math.round)
      : null;
    const hourlyUV: number[] | null = weatherJson.hourly?.uv_index
      ? (weatherJson.hourly.uv_index as number[]).slice(0, 24).map(Math.round)
      : null;

    const data: WeatherData = {
      temperature: Math.round(weatherJson.current?.temperature_2m ?? 0),
      humidity: Math.round(weatherJson.current?.relative_humidity_2m ?? 0),
      uvIndex: Math.round(weatherJson.daily?.uv_index_max?.[0] ?? 0),
      weatherCode,
      description: weatherInfo.desc,
      icon: weatherInfo.icon,
      pm25,
      pm10,
      hourlyTemp,
      hourlyUV,
      season: getSeason(new Date().getMonth() + 1),
    };

    // Cache the result
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    } catch { /* ignore */ }

    return data;
  } catch {
    return null;
  }
}

/** Generate skincare tips based on weather data and user's skin type */
export function generateWeatherTips(
  weather: WeatherData,
  skinType?: string,
  hasRetinol?: boolean,
  hasAHA?: boolean
): WeatherTip[] {
  const tips: WeatherTip[] = [];

  // UV Index tips
  if (weather.uvIndex >= 8) {
    tips.push({
      emoji: "🔴",
      title: "자외선 매우 강함 (UV " + weather.uvIndex + ")",
      description: "SPF50+ PA++++ 선크림 필수! 2시간마다 덧바르세요.",
      priority: "high",
    });
  } else if (weather.uvIndex >= 5) {
    tips.push({
      emoji: "🟠",
      title: "자외선 강함 (UV " + weather.uvIndex + ")",
      description: "선크림을 꼼꼼히 바르고, 외출 시 모자를 착용하세요.",
      priority: "high",
    });
  } else if (weather.uvIndex >= 3) {
    tips.push({
      emoji: "🟡",
      title: "자외선 보통 (UV " + weather.uvIndex + ")",
      description: "선크림은 기본! 흐린 날에도 UV는 침투해요.",
      priority: "medium",
    });
  } else {
    tips.push({
      emoji: "🟢",
      title: "자외선 약함 (UV " + weather.uvIndex + ")",
      description: "자외선이 낮지만 선크림은 습관처럼 바르세요.",
      priority: "low",
    });
  }

  // Retinol/AHA + UV warning
  if ((hasRetinol || hasAHA) && weather.uvIndex >= 3) {
    tips.push({
      emoji: "⚠️",
      title: hasRetinol ? "레티놀 사용자 주의" : "각질케어 사용자 주의",
      description: "광감성 성분 사용 중이라 선크림을 더 꼼꼼히 발라주세요.",
      priority: "high",
    });
  }

  // Temperature tips
  if (weather.temperature <= 5) {
    tips.push({
      emoji: "🥶",
      title: "기온이 낮아요 (" + weather.temperature + "°C)",
      description: "크림을 두껍게 덧발라 피부 장벽을 보호하세요.",
      priority: "high",
    });
  } else if (weather.temperature <= 10) {
    tips.push({
      emoji: "🧥",
      title: "쌀쌀한 날씨 (" + weather.temperature + "°C)",
      description: "보습 크림으로 수분 증발을 막아주세요.",
      priority: "medium",
    });
  } else if (weather.temperature >= 30) {
    tips.push({
      emoji: "🥵",
      title: "무더운 날씨 (" + weather.temperature + "°C)",
      description: "가벼운 제형 위주로! 크림 대신 젤이나 로션을 추천해요.",
      priority: "high",
    });
  } else if (weather.temperature >= 25) {
    tips.push({
      emoji: "☀️",
      title: "따뜻한 날씨 (" + weather.temperature + "°C)",
      description: "산뜻한 제형으로 전환하고, 유분 과다를 조심하세요.",
      priority: "medium",
    });
  }

  // Humidity tips
  if (weather.humidity < 40) {
    tips.push({
      emoji: "💧",
      title: "건조한 공기 (습도 " + weather.humidity + "%)",
      description: skinType === "dry"
        ? "건성 피부에 특히 위험! 히알루론산 세럼 + 크림으로 수분 보충하세요."
        : "히알루론산이나 세라마이드로 수분을 채워주세요.",
      priority: weather.humidity < 30 ? "high" : "medium",
    });
  } else if (weather.humidity > 80) {
    tips.push({
      emoji: "💦",
      title: "습한 공기 (습도 " + weather.humidity + "%)",
      description: skinType === "oily"
        ? "지성 피부는 유분 과다 주의! BHA 토너 패드로 모공 관리하세요."
        : "가벼운 수분 제품 위주로 사용하세요.",
      priority: "medium",
    });
  }

  // Rain/Snow tips
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weather.weatherCode)) {
    tips.push({
      emoji: "🌧️",
      title: "비 오는 날",
      description: "습도가 높아도 UV는 여전해요. 워터프루프 선크림을 추천합니다.",
      priority: "medium",
    });
  } else if ([71, 73, 75, 77, 85, 86].includes(weather.weatherCode)) {
    tips.push({
      emoji: "❄️",
      title: "눈 오는 날",
      description: "눈 반사로 UV가 강해질 수 있어요. 선크림 잊지 마세요!",
      priority: "medium",
    });
  }

  // Fog tips
  if ([45, 48].includes(weather.weatherCode)) {
    tips.push({
      emoji: "🌫️",
      title: "안개 낀 날",
      description: "미세먼지 주의! 저녁에 꼼꼼한 이중세안을 해주세요.",
      priority: "medium",
    });
  }

  // Skin type specific
  if (skinType === "sensitive" && weather.temperature < 10) {
    tips.push({
      emoji: "🛡️",
      title: "민감피부 장벽 보호",
      description: "추운 날에는 시카/세라마이드 크림으로 장벽을 강화하세요.",
      priority: "high",
    });
  }

  // ── 미세먼지 TIP ──
  if (weather.pm25 !== null || weather.pm10 !== null) {
    const pm25 = weather.pm25 ?? 0;
    const pm10 = weather.pm10 ?? 0;
    if (pm25 > 75 || pm10 > 150) {
      tips.push({
        emoji: "😷",
        title: `미세먼지 매우 나쁨 (PM2.5: ${pm25})`,
        description: "외출 자제! 귀가 후 꼼꼼한 이중세안 + 진정 마스크팩을 추천해요.",
        priority: "high",
      });
    } else if (pm25 > 35 || pm10 > 80) {
      tips.push({
        emoji: "🌫️",
        title: `미세먼지 나쁨 (PM2.5: ${pm25})`,
        description: "외출 후 클렌징을 꼼꼼히! 시카 성분으로 진정 케어하세요.",
        priority: "high",
      });
    } else if (pm25 > 15 || pm10 > 50) {
      tips.push({
        emoji: "💨",
        title: `미세먼지 보통 (PM2.5: ${pm25})`,
        description: "저녁 이중세안으로 모공 속 미세먼지를 제거해 주세요.",
        priority: "medium",
      });
    }
  }

  // ── 시간대별 TIP ──
  const hour = new Date().getHours();
  if (hour < 12) {
    // 아침 시간대
    if (weather.hourlyUV) {
      const afternoonUV = Math.max(...weather.hourlyUV.slice(11, 15));
      if (afternoonUV >= 6) {
        tips.push({
          emoji: "🕐",
          title: `오후에 UV ${afternoonUV}까지 올라갈 예정`,
          description: "점심 외출 전 선크림을 한 번 더 덧바르세요!",
          priority: "high",
          timeTag: "morning",
        });
      }
    }
    if (weather.hourlyTemp) {
      const afternoonMax = Math.max(...weather.hourlyTemp.slice(12, 18));
      const tempDiff = afternoonMax - weather.temperature;
      if (tempDiff >= 10) {
        tips.push({
          emoji: "🌡️",
          title: `일교차 ${tempDiff}°C 주의`,
          description: "아침엔 보습 크림, 오후엔 가벼운 제형으로 조절하세요.",
          priority: "medium",
          timeTag: "morning",
        });
      }
    }
  } else if (hour < 18) {
    // 오후 시간대
    tips.push({
      emoji: "🔄",
      title: "오후 선크림 리터치 시간",
      description: "아침에 바른 선크림 효과가 줄어들 시간이에요. 덧바르세요!",
      priority: "medium",
      timeTag: "afternoon",
    });
  } else {
    // 저녁 시간대
    tips.push({
      emoji: "🌙",
      title: "저녁 루틴 시작할 시간",
      description: "클렌징 → 토너 → 세럼 → 크림 순서로 케어하세요.",
      priority: "low",
      timeTag: "evening",
    });
    if ((hasRetinol) && (new Date().getDay() % 2 === 0)) {
      tips.push({
        emoji: "💜",
        title: "오늘은 레티놀 사용 가능한 날",
        description: "레티놀은 세안 후 피부가 완전히 건조된 상태에서 발라주세요.",
        priority: "medium",
        timeTag: "evening",
      });
    }
  }

  // ── 계절별 TIP ──
  switch (weather.season) {
    case "spring":
      tips.push({
        emoji: "🌸",
        title: "봄철 스킨케어",
        description: "꽃가루 + 미세먼지 시즌! 저자극 클렌저 + 진정 토너로 피부를 보호하세요.",
        priority: "medium",
      });
      break;
    case "summer":
      if (weather.humidity > 70 && skinType === "oily") {
        tips.push({
          emoji: "🧊",
          title: "여름 지성피부 관리",
          description: "클레이 마스크로 주 1~2회 모공 관리, 가벼운 수분젤로 유수분 밸런스를 맞추세요.",
          priority: "medium",
        });
      }
      break;
    case "autumn":
      tips.push({
        emoji: "🍂",
        title: "가을 환절기 주의",
        description: "급격히 건조해지는 시기! 세라마이드 크림으로 장벽을 강화하세요.",
        priority: "medium",
      });
      break;
    case "winter":
      if (skinType === "dry" || skinType === "sensitive") {
        tips.push({
          emoji: "🧣",
          title: "겨울 집중 보습",
          description: "수분크림 → 오일 → 슬리핑팩 레이어링으로 수분 증발을 막으세요.",
          priority: "high",
        });
      }
      break;
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  tips.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return tips.slice(0, 6); // max 6 tips (expanded from 4)
}
