"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";

const skinTypes = [
  { value: "dry", label: "건성", icon: "desert" },
  { value: "oily", label: "지성", icon: "drop" },
  { value: "combination", label: "복합성", icon: "cycle" },
  { value: "sensitive", label: "민감성", icon: "cherry-blossom" },
  { value: "normal", label: "중성", icon: "sparkle" },
];

const allConcerns = [
  { value: "acne", label: "여드름" },
  { value: "wrinkle", label: "주름" },
  { value: "pigmentation", label: "색소침착" },
  { value: "dryness", label: "건조" },
  { value: "sensitivity", label: "민감" },
  { value: "pore", label: "모공" },
  { value: "blackhead", label: "블랙헤드" },
  { value: "redness", label: "홍조" },
  { value: "darkCircle", label: "다크서클" },
];

interface ProfileData {
  nickname: string;
  skinType: string;
  concerns: string[];
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [profile, setProfile] = useState<ProfileData>({
    nickname: "",
    skinType: "",
    concerns: [],
  });
  const [saved, setSaved] = useState(false);

  // Load profile from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const data = localStorage.getItem("barda_profile");
      if (data) {
        const parsed = JSON.parse(data);
        setProfile({
          nickname: parsed.nickname ?? "",
          skinType: parsed.skinType ?? "",
          concerns: parsed.concerns ?? [],
        });
      } else if (user?.email) {
        setProfile((prev) => ({
          ...prev,
          nickname: user.email!.split("@")[0],
        }));
      }
    } catch { /* ignore */ }
  }, [user]);

  const toggleConcern = useCallback((value: string) => {
    setProfile((prev) => ({
      ...prev,
      concerns: prev.concerns.includes(value)
        ? prev.concerns.filter((c) => c !== value)
        : prev.concerns.length < 5
          ? [...prev.concerns, value]
          : prev.concerns,
    }));
  }, []);

  const handleSave = useCallback(() => {
    try {
      localStorage.setItem("barda_profile", JSON.stringify(profile));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
  }, [profile]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push("/auth/login?next=/mypage/profile");
    return null;
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-800">프로필 설정</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        {/* Nickname */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            닉네임
          </label>
          <input
            type="text"
            value={profile.nickname}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, nickname: e.target.value.slice(0, 20) }))
            }
            placeholder="닉네임을 입력하세요"
            maxLength={20}
            className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary/50"
          />
          <p className="text-xs text-gray-400 mt-1">
            {profile.nickname.length}/20
          </p>
        </div>

        {/* Email (readonly) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            이메일
          </label>
          <div className="w-full px-4 py-3 text-sm rounded-xl bg-gray-50 text-gray-500 border border-gray-100">
            {user.email}
          </div>
        </div>

        {/* Skin Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            피부 타입
          </label>
          <div className="grid grid-cols-3 gap-2">
            {skinTypes.map((st) => (
              <button
                key={st.value}
                type="button"
                onClick={() =>
                  setProfile((prev) => ({
                    ...prev,
                    skinType: prev.skinType === st.value ? "" : st.value,
                  }))
                }
                className={`py-3 rounded-xl text-sm font-medium border transition-colors ${
                  profile.skinType === st.value
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="mr-1"><Icon name={st.icon} size={16} /></span>
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Concerns */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            피부 고민 <span className="text-xs text-gray-400 font-normal">(최대 5개)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {allConcerns.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => toggleConcern(c.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  profile.concerns.includes(c.value)
                    ? "bg-gray-700 text-white border-gray-700"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm bg-primary text-white hover:bg-primary-light transition-colors"
        >
          {saved ? "저장되었습니다!" : "저장하기"}
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
