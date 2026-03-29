import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BARDA - 바르게 바르다",
    short_name: "BARDA",
    description: "K-뷰티 스킨케어 루틴 분석기 — 성분 충돌 경고 + AM/PM 순서 + 7일 캘린더",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#D4726A",
    icons: [
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
  };
}
