"use client";

import Icon from "@/components/Icon";
import { PAYMENT } from "@/lib/constants";

interface Props {
  children: React.ReactNode;
  isLocked: boolean;
  ctaText?: string;
  onUnlock: () => void;
}

export default function BlurOverlay({
  children,
  isLocked,
  ctaText,
  onUnlock,
}: Props) {
  if (!isLocked) return <>{children}</>;

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 rounded-2xl">
        <span className="mb-2"><Icon name="lock" size={24} /></span>
        <p className="text-sm font-semibold text-gray-700 mb-1">
          {ctaText ?? "전체 분석 결과 보기"}
        </p>
        <p className="text-xs text-gray-500 mb-3">{PAYMENT.DISPLAY_TEXT}</p>
        <button
          onClick={onUnlock}
          className="px-6 py-2.5 rounded-2xl font-semibold text-white bg-primary hover:bg-primary-light transition-colors text-sm"
        >
          잠금 해제하기
        </button>
      </div>
    </div>
  );
}
