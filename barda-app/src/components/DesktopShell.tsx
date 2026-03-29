"use client";

import { useEffect, useState } from "react";
import { APP_URL } from "@/lib/constants";

/* ─── QR Code SVG Component ─── */
/* Generates a simple visual QR-like pattern. In production, replace with real QR. */
function QRCode({ url, size = 140 }: { url: string; size?: number }) {
  // Simple deterministic pattern from URL hash
  const cells = 21;
  const cellSize = size / cells;
  const grid: boolean[][] = [];

  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0;
  }

  // Seed-based pseudo-random
  let seed = Math.abs(hash);
  function nextRand() {
    seed = (seed * 16807 + 0) % 2147483647;
    return seed / 2147483647;
  }

  for (let r = 0; r < cells; r++) {
    grid[r] = [];
    for (let c = 0; c < cells; c++) {
      grid[r][c] = false;
    }
  }

  // Finder patterns (3 corners)
  const finderPositions = [
    [0, 0],
    [0, cells - 7],
    [cells - 7, 0],
  ];
  for (const [sr, sc] of finderPositions) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6) grid[sr + r][sc + c] = true;
        else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) grid[sr + r][sc + c] = true;
      }
    }
  }

  // Fill data area with pseudo-random pattern
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if (!grid[r][c]) {
        grid[r][c] = nextRand() > 0.55;
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
      <rect width={size} height={size} fill="white" />
      {grid.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#1F2937"
              rx={0.5}
            />
          ) : null
        )
      )}
    </svg>
  );
}

export default function DesktopShell({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    function check() {
      setIsDesktop(window.innerWidth >= 768);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Mobile: render normally
  if (!isDesktop) {
    return <>{children}</>;
  }

  // Desktop: phone mockup + QR sidebar
  return (
    <div className="desktop-shell">
      {/* Left: Branding + QR */}
      <div className="desktop-sidebar">
        <div className="sidebar-content">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary tracking-tight">BARDA</h1>
            <p className="text-sm text-gray-500 mt-1">바르게 바르다</p>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
              내 스킨케어 루틴,<br />
              바르게 바르고 있을까?
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              500+ 제품 DB, AI 성분 분석,<br />
              AM/PM 루틴 순서까지 한 번에
            </p>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <QRCode url={APP_URL} size={120} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 mb-1">
                  QR 코드를 스캔하세요
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  모바일에서 더 편리하게<br />
                  BARDA를 이용할 수 있어요
                </p>
              </div>
            </div>
          </div>

          {/* App Store buttons (placeholder) */}
          <div className="flex gap-3 mt-5">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-medium hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              App Store
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-medium hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302-2.533-2.533 2.533-2.451zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
              </svg>
              Google Play
            </button>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-8">
            <p className="text-[11px] text-gray-400 leading-relaxed">
              BARDA는 일반적인 스킨케어 정보를 제공하며,<br />
              전문 의료 조언을 대체하지 않습니다.
            </p>
            <p className="text-[11px] text-gray-300 mt-2">
              &copy; 2026 BARDA. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Phone Mockup */}
      <div className="desktop-phone-area">
        <div className="phone-mockup">
          {/* Phone notch */}
          <div className="phone-notch">
            <div className="phone-notch-inner" />
          </div>
          {/* Phone content */}
          <div className="phone-screen">
            {children}
          </div>
          {/* Phone bottom bar */}
          <div className="phone-home-indicator" />
        </div>
      </div>
    </div>
  );
}
