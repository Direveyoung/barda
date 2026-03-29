"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import { COMMUNITY, SKIN_TYPE_LABEL } from "@/lib/constants";
import { copyToClipboard } from "@/lib/date-utils";

interface KakaoOpenChatProps {
  nickname?: string;
  skinType?: string;
}

export default function KakaoOpenChat({ nickname, skinType }: KakaoOpenChatProps) {
  const [copied, setCopied] = useState(false);

  const skinLabel = skinType ? SKIN_TYPE_LABEL[skinType] ?? skinType : "";
  const kakaoNickname = skinLabel && nickname ? `${skinLabel} ${nickname}` : "";

  const handleCopyNickname = async () => {
    if (!kakaoNickname) return;
    await copyToClipboard(kakaoNickname);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon name="chat" size={20} />
        <h3 className="font-semibold text-sm text-gray-800">뒤집어지는 피부 소통방</h3>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 leading-relaxed">
        피부 관리 노하우를 공유하고, 같은 피부타입 사용자들과 소통해요.
        카카오톡 오픈채팅에서 만나요!
      </p>

      {/* Nickname Copy */}
      {kakaoNickname && (
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-100">
          <span className="text-xs text-gray-400 shrink-0">카톡 닉네임</span>
          <span className="text-sm font-medium text-gray-800 flex-1 truncate">{kakaoNickname}</span>
          <button
            onClick={handleCopyNickname}
            className="shrink-0 text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            {copied ? "복사됨!" : "복사"}
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <a
          href={COMMUNITY.KAKAO_OPEN_CHAT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-sm transition-colors"
        >
          <Icon name="chat" size={16} />
          오픈톡 입장
        </a>
        <a
          href={COMMUNITY.CLINIC_LIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm transition-colors"
        >
          <Icon name="hospital" size={16} />
          피부과 찾기
        </a>
      </div>
    </div>
  );
}
