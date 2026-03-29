import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import DesktopShell from "@/components/DesktopShell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://barda.vercel.app"),
  title: "BARDA — 바르게 바르다",
  description:
    "내가 가진 화장품을 입력하면, AM/PM 루틴 순서 + 위험 조합 경고 + 7일 캘린더를 한 번에",
  openGraph: {
    title: "BARDA — 바르게 바르다",
    description:
      "내가 가진 화장품을 입력하면, AM/PM 루틴 순서부터 위험 조합까지 한 번에",
    locale: "ko_KR",
    type: "website",
    siteName: "BARDA",
  },
  twitter: {
    card: "summary_large_image",
    title: "BARDA — 바르게 바르다",
    description: "K-뷰티 스킨케어 루틴 분석기 — 성분 충돌 경고 + 7일 캘린더",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AuthProvider>
          <DesktopShell>{children}</DesktopShell>
        </AuthProvider>
      </body>
    </html>
  );
}
