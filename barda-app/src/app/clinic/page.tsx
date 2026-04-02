"use client";

export default function ClinicPage() {
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 헤더 */}
      <div className="flex items-center px-4 py-3 border-b border-gray-100 bg-white z-10">
        <div className="flex flex-col">
          <h1 className="text-base font-bold text-gray-900">피부과 찾기</h1>
          <p className="text-xs text-gray-400">전국 피부과 전문의 병원 검색</p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex flex-col flex-1 items-center justify-center px-6 gap-6 bg-gray-50">
        {/* 아이콘 */}
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        </div>

        {/* 텍스트 */}
        <div className="text-center gap-2 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900">전국 피부과 전문의 검색</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            내 주변 피부과를 지도에서 확인하고<br />
            진료과목·후기·예약 정보를 한눈에 보세요.
          </p>
        </div>

        {/* 기능 뱃지 */}
        <div className="flex flex-wrap gap-2 justify-center">
          {["위치 기반 검색", "진료과목 필터", "전화 바로연결", "지도 보기"].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-white border border-gray-200 text-xs text-gray-600 font-medium shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA 버튼 */}
        <a
          href="https://clinic-list.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-xs flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-white font-semibold text-base shadow-md active:scale-95 transition-transform"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          피부과 찾기 열기
        </a>

        <p className="text-xs text-gray-400 text-center">
          외부 서비스로 이동합니다
        </p>
      </div>
    </div>
  );
}
