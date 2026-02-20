import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import DesktopShell from "@/components/DesktopShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "BARDA — 바르게 바르다",
  description:
    "내가 가진 화장품을 입력하면, AM/PM 루틴 순서 + 위험 조합 경고 + 7일 캘린더를 한 번에",
  openGraph: {
    title: "BARDA — 바르게 바르다",
    description:
      "내가 가진 화장품을 입력하면, AM/PM 루틴 순서부터 위험 조합까지 한 번에",
    locale: "ko_KR",
    type: "website",
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
