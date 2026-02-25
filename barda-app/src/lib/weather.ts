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
  /** 7일 예보 (날씨-캘린더 연동) */
  dailyForecast: DailyForecast[] | null;
  /** 바람 속도 (m/s) */
  windSpeed: number | null;
}

export interface WeatherTip {
  icon: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  /** 시간대 태그 (optional) */
  timeTag?: "morning" | "afternoon" | "evening";
}

/** 7일 예보 항목 */
export interface DailyForecast {
  date: string;
  dayLabel: string;
  tempMin: number;
  tempMax: number;
  uvMax: number;
  weatherCode: number;
  icon: string;
  routineAdvice: "retinol_ok" | "retinol_caution" | "exfoliate_ok" | "gentle_only" | "normal";
}

/** 날씨-루틴 교차 분석 */
export interface WeatherRoutineAdvice {
  retinolSafe: boolean;
  exfoliateSafe: boolean;
  reason: string;
  sunscreenReapplyCount: number;
  moistureLevel: "light" | "medium" | "heavy";
  textureAdvice: string;
}

/* ─── Weather code → description mapping ─── */
const WEATHER_DESCRIPTIONS: Record<number, { desc: string; icon: string }> = {
  0: { desc: "맑음", icon: "sun" },
  1: { desc: "대체로 맑음", icon: "sun-cloud" },
  2: { desc: "구름 조금", icon: "partly-cloudy" },
  3: { desc: "흐림", icon: "cloudy" },
  45: { desc: "안개", icon: "foggy" },
  48: { desc: "안개", icon: "foggy" },
  51: { desc: "이슬비", icon: "drizzle" },
  53: { desc: "이슬비", icon: "drizzle" },
  55: { desc: "이슬비", icon: "drizzle" },
  61: { desc: "비", icon: "rainy" },
  63: { desc: "비", icon: "rainy" },
  65: { desc: "폭우", icon: "rainy" },
  71: { desc: "눈", icon: "snowy" },
  73: { desc: "눈", icon: "snowy" },
  75: { desc: "폭설", icon: "snowy" },
  77: { desc: "싸락눈", icon: "snowy" },
  80: { desc: "소나기", icon: "drizzle" },
  81: { desc: "소나기", icon: "drizzle" },
  82: { desc: "폭우", icon: "thunderstorm" },
  85: { desc: "눈", icon: "snowy" },
  86: { desc: "폭설", icon: "snowy" },
  95: { desc: "뇌우", icon: "thunderstorm" },
  96: { desc: "우박", icon: "thunderstorm" },
  99: { desc: "우박", icon: "thunderstorm" },
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

    // Fetch weather + hourly + 7-day forecast in parallel with air quality
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,uv_index&daily=uv_index_max,temperature_2m_min,temperature_2m_max,weather_code&timezone=Asia%2FSeoul&forecast_days=7`;
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
    const weatherInfo = WEATHER_DESCRIPTIONS[weatherCode] ?? { desc: "알 수 없음", icon: "thermometer" };

    // Parse hourly data
    const hourlyTemp: number[] | null = weatherJson.hourly?.temperature_2m
      ? (weatherJson.hourly.temperature_2m as number[]).slice(0, 24).map(Math.round)
      : null;
    const hourlyUV: number[] | null = weatherJson.hourly?.uv_index
      ? (weatherJson.hourly.uv_index as number[]).slice(0, 24).map(Math.round)
      : null;

    // Parse 7-day forecast
    const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];
    let dailyForecast: DailyForecast[] | null = null;
    if (weatherJson.daily?.time) {
      const times = weatherJson.daily.time as string[];
      const tMins = weatherJson.daily.temperature_2m_min as number[];
      const tMaxs = weatherJson.daily.temperature_2m_max as number[];
      const uvMaxs = weatherJson.daily.uv_index_max as number[];
      const wCodes = weatherJson.daily.weather_code as number[];

      dailyForecast = times.map((date: string, i: number) => {
        const d = new Date(date);
        const uvMax = Math.round(uvMaxs[i] ?? 0);
        const tMin = Math.round(tMins[i] ?? 0);
        const code = wCodes[i] ?? 0;
        const info = WEATHER_DESCRIPTIONS[code] ?? { desc: "알 수 없음", icon: "thermometer" };

        // Determine routine advice based on UV + weather
        let routineAdvice: DailyForecast["routineAdvice"] = "normal";
        if (uvMax >= 8 || code >= 95) {
          routineAdvice = "gentle_only";
        } else if (uvMax >= 5) {
          routineAdvice = "retinol_caution";
        } else if (uvMax <= 3 && tMin >= 5) {
          routineAdvice = "retinol_ok";
        }

        return {
          date,
          dayLabel: dayLabels[d.getDay()],
          tempMin: tMin,
          tempMax: Math.round(tMaxs[i] ?? 0),
          uvMax,
          weatherCode: code,
          icon: info.icon,
          routineAdvice,
        };
      });
    }

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
      dailyForecast,
      windSpeed: weatherJson.current?.wind_speed_10m != null
        ? Math.round(weatherJson.current.wind_speed_10m)
        : null,
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
      icon: "red-circle",
      title: "자외선 매우 강함 (UV " + weather.uvIndex + ")",
      description: "SPF50+ PA++++ 선크림 필수! 2시간마다 덧바르세요.",
      priority: "high",
    });
  } else if (weather.uvIndex >= 5) {
    tips.push({
      icon: "orange-circle",
      title: "자외선 강함 (UV " + weather.uvIndex + ")",
      description: "선크림을 꼼꼼히 바르고, 외출 시 모자를 착용하세요.",
      priority: "high",
    });
  } else if (weather.uvIndex >= 3) {
    tips.push({
      icon: "yellow-circle",
      title: "자외선 보통 (UV " + weather.uvIndex + ")",
      description: "선크림은 기본! 흐린 날에도 UV는 침투해요.",
      priority: "medium",
    });
  } else {
    tips.push({
      icon: "green-circle",
      title: "자외선 약함 (UV " + weather.uvIndex + ")",
      description: "자외선이 낮지만 선크림은 습관처럼 바르세요.",
      priority: "low",
    });
  }

  // Retinol/AHA + UV warning
  if ((hasRetinol || hasAHA) && weather.uvIndex >= 3) {
    tips.push({
      icon: "warning",
      title: hasRetinol ? "레티놀 사용자 주의" : "각질케어 사용자 주의",
      description: "광감성 성분 사용 중이라 선크림을 더 꼼꼼히 발라주세요.",
      priority: "high",
    });
  }

  // Temperature tips
  if (weather.temperature <= 5) {
    tips.push({
      icon: "cold-face",
      title: "기온이 낮아요 (" + weather.temperature + "°C)",
      description: "크림을 두껍게 덧발라 피부 장벽을 보호하세요.",
      priority: "high",
    });
  } else if (weather.temperature <= 10) {
    tips.push({
      icon: "jacket",
      title: "쌀쌀한 날씨 (" + weather.temperature + "°C)",
      description: "보습 크림으로 수분 증발을 막아주세요.",
      priority: "medium",
    });
  } else if (weather.temperature >= 30) {
    tips.push({
      icon: "hot-face",
      title: "무더운 날씨 (" + weather.temperature + "°C)",
      description: "가벼운 제형 위주로! 크림 대신 젤이나 로션을 추천해요.",
      priority: "high",
    });
  } else if (weather.temperature >= 25) {
    tips.push({
      icon: "sun",
      title: "따뜻한 날씨 (" + weather.temperature + "°C)",
      description: "산뜻한 제형으로 전환하고, 유분 과다를 조심하세요.",
      priority: "medium",
    });
  }

  // Humidity tips
  if (weather.humidity < 40) {
    tips.push({
      icon: "drop",
      title: "건조한 공기 (습도 " + weather.humidity + "%)",
      description: skinType === "dry"
        ? "건성 피부에 특히 위험! 히알루론산 세럼 + 크림으로 수분 보충하세요."
        : "히알루론산이나 세라마이드로 수분을 채워주세요.",
      priority: weather.humidity < 30 ? "high" : "medium",
    });
  } else if (weather.humidity > 80) {
    tips.push({
      icon: "droplets",
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
      icon: "rainy",
      title: "비 오는 날",
      description: "습도가 높아도 UV는 여전해요. 워터프루프 선크림을 추천합니다.",
      priority: "medium",
    });
  } else if ([71, 73, 75, 77, 85, 86].includes(weather.weatherCode)) {
    tips.push({
      icon: "snowy",
      title: "눈 오는 날",
      description: "눈 반사로 UV가 강해질 수 있어요. 선크림 잊지 마세요!",
      priority: "medium",
    });
  }

  // Fog tips
  if ([45, 48].includes(weather.weatherCode)) {
    tips.push({
      icon: "foggy",
      title: "안개 낀 날",
      description: "미세먼지 주의! 저녁에 꼼꼼한 이중세안을 해주세요.",
      priority: "medium",
    });
  }

  // Skin type specific
  if (skinType === "sensitive" && weather.temperature < 10) {
    tips.push({
      icon: "shield",
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
        icon: "mask-face",
        title: `미세먼지 매우 나쁨 (PM2.5: ${pm25})`,
        description: "외출 자제! 귀가 후 꼼꼼한 이중세안 + 진정 마스크팩을 추천해요.",
        priority: "high",
      });
    } else if (pm25 > 35 || pm10 > 80) {
      tips.push({
        icon: "foggy",
        title: `미세먼지 나쁨 (PM2.5: ${pm25})`,
        description: "외출 후 클렌징을 꼼꼼히! 시카 성분으로 진정 케어하세요.",
        priority: "high",
      });
    } else if (pm25 > 15 || pm10 > 50) {
      tips.push({
        icon: "wind",
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
          icon: "clock",
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
          icon: "thermometer",
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
      icon: "cycle",
      title: "오후 선크림 리터치 시간",
      description: "아침에 바른 선크림 효과가 줄어들 시간이에요. 덧바르세요!",
      priority: "medium",
      timeTag: "afternoon",
    });
  } else {
    // 저녁 시간대
    tips.push({
      icon: "moon",
      title: "저녁 루틴 시작할 시간",
      description: "클렌징 → 토너 → 세럼 → 크림 순서로 케어하세요.",
      priority: "low",
      timeTag: "evening",
    });
    if ((hasRetinol) && (new Date().getDay() % 2 === 0)) {
      tips.push({
        icon: "purple-heart",
        title: "오늘은 레티놀 사용 가능한 날",
        description: "레티놀은 세안 후 피부가 완전히 건조된 상태에서 발라주세요.",
        priority: "medium",
        timeTag: "evening",
      });
    }
  }

  // ── 강풍 TIP ──
  if (weather.windSpeed !== null && weather.windSpeed >= 10) {
    tips.push({
      icon: "wind",
      title: `강풍 주의 (${weather.windSpeed}m/s)`,
      description: "바람이 수분을 빼앗아요. 밤 오일이나 무거운 크림으로 장벽을 보호하세요.",
      priority: "high",
    });
  } else if (weather.windSpeed !== null && weather.windSpeed >= 6) {
    tips.push({
      icon: "leaves",
      title: `바람 부는 날 (${weather.windSpeed}m/s)`,
      description: "바람에 의한 수분 증발 주의. 세라마이드 크림으로 장벽을 강화하세요.",
      priority: "medium",
    });
  }

  // ── 계절별 TIP ──
  switch (weather.season) {
    case "spring":
      tips.push({
        icon: "cherry-blossom",
        title: "봄철 스킨케어",
        description: "꽃가루 + 미세먼지 시즌! 저자극 클렌저 + 진정 토너로 피부를 보호하세요.",
        priority: "medium",
      });
      break;
    case "summer":
      if (weather.humidity > 70 && skinType === "oily") {
        tips.push({
          icon: "ice",
          title: "여름 지성피부 관리",
          description: "클레이 마스크로 주 1~2회 모공 관리, 가벼운 수분젤로 유수분 밸런스를 맞추세요.",
          priority: "medium",
        });
      }
      break;
    case "autumn":
      tips.push({
        icon: "autumn-leaf",
        title: "가을 환절기 주의",
        description: "급격히 건조해지는 시기! 세라마이드 크림으로 장벽을 강화하세요.",
        priority: "medium",
      });
      break;
    case "winter":
      if (skinType === "dry" || skinType === "sensitive") {
        tips.push({
          icon: "scarf",
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

/** Analyze weather conditions against user's active ingredients for routine advice */
export function getWeatherRoutineAdvice(weather: WeatherData): WeatherRoutineAdvice {
  const uvHigh = weather.uvIndex >= 5;
  const uvVeryHigh = weather.uvIndex >= 8;
  const dry = weather.humidity < 40;
  const veryDry = weather.humidity < 30;
  const hot = weather.temperature >= 30;
  const cold = weather.temperature <= 5;
  const windy = (weather.windSpeed ?? 0) >= 8;

  // Retinol safety: UV 5+ → caution, UV 8+ or extreme conditions → unsafe
  const retinolSafe = !uvVeryHigh && !hot;
  const exfoliateSafe = !uvVeryHigh;

  const reasons: string[] = [];
  if (uvVeryHigh) reasons.push("자외선 매우 강함");
  if (hot) reasons.push("고온");
  if (uvHigh && !uvVeryHigh) reasons.push("자외선 강함 (선크림 필수)");

  // Sunscreen reapply count
  let sunscreenReapplyCount = 1; // baseline: morning
  if (weather.uvIndex >= 3) sunscreenReapplyCount = 2;
  if (weather.uvIndex >= 6) sunscreenReapplyCount = 3;
  if (weather.uvIndex >= 8) sunscreenReapplyCount = 4;

  // Moisture level
  let moistureLevel: WeatherRoutineAdvice["moistureLevel"] = "medium";
  if (veryDry || cold || windy) moistureLevel = "heavy";
  else if (hot || weather.humidity > 70) moistureLevel = "light";

  // Texture advice
  let textureAdvice = "기본 크림/로션";
  if (hot && weather.humidity > 70) textureAdvice = "수분 젤/워터 크림 추천";
  else if (hot) textureAdvice = "가벼운 로션/에멀전 추천";
  else if (cold && dry) textureAdvice = "리치 크림 + 페이스 오일 추천";
  else if (cold) textureAdvice = "보습 크림 + 슬리핑팩 추천";
  else if (windy) textureAdvice = "밤/오일 크림으로 장벽 보호";

  return {
    retinolSafe,
    exfoliateSafe,
    reason: reasons.length > 0 ? reasons.join(", ") : "날씨 양호",
    sunscreenReapplyCount,
    moistureLevel,
    textureAdvice,
  };
}
