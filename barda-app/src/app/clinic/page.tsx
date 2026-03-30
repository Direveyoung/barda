"use client";

import { useState } from "react";

export default function ClinicPage() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex items-center px-4 py-3 border-b border-gray-100 bg-white z-10">
        <div className="flex flex-col">
          <h1 className="text-base font-bold text-gray-900">피부과 찾기</h1>
          <p className="text-xs text-gray-400">전국 피부과 전문의 병원 검색</p>
        </div>
        <a href="https://clinic-list.vercel.app" target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors">
          새 창
        </a>
      </div>
      <div className="relative flex-1 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
            <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
            <p className="text-sm text-gray-500">피부과 정보를 불러오는 중...</p>
          </div>
        )}
        <iframe src="https://clinic-list.vercel.app" className="w-full h-full border-none" title="전국 피부과 전문의 병원 리스트" onLoad={() => setIsLoading(false)} allow="geolocation" />
      </div>
    </div>
  );
}
