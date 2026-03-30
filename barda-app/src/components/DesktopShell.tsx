"use client";

export default function DesktopShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Mobile: just render children directly */}
      <div className="md:hidden min-h-screen">
        {children}
      </div>

      {/* Desktop: phone-frame container */}
      <div className="hidden md:flex min-h-screen items-start justify-center py-8"
        style={{ background: "linear-gradient(135deg, #f8f4ff 0%, #fff5f3 50%, #f0f5ff 100%)" }}>
        <div
          className="relative w-[390px] min-h-[844px] bg-white rounded-[40px] overflow-hidden flex flex-col"
          style={{
            boxShadow: "0 0 0 1px #e5e7eb, 0 8px 40px -8px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.06)",
            border: "8px solid #f3f4f6",
          }}
        >
          {/* Status bar mock */}
          <div className="relative flex items-center justify-between px-6 pt-3 pb-1 shrink-0">
            <span className="text-[11px] font-semibold text-gray-700 tabular-nums">9:41</span>
            <div className="w-28 h-5 bg-gray-900 rounded-full absolute left-1/2 -translate-x-1/2 top-2" />
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" viewBox="0 0 24 24">
                <path d="M1.5 8.5a13 13 0 0121 0M5 12a10 10 0 0114 0M8.5 15.5a6 6 0 017 0M12 19h.01" />
              </svg>
              <svg className="w-3.5 h-2.5 text-gray-700" viewBox="0 0 24 12">
                <rect x="0" y="1" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <rect x="1.5" y="2.5" width="14" height="7" rx="1" fill="currentColor"/>
                <path d="M21.5 4.5v3a1.5 1.5 0 000-3z" fill="currentColor"/>
              </svg>
            </div>
          </div>
          {/* Inner scroll area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: "touch" as const }}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
