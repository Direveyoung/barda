"use client";

import Link from "next/link";
import AdminNav, { AdminMobileNav } from "@/components/admin/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-xl font-bold text-primary">BARDA</Link>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            사이트로 돌아가기
          </Link>
        </div>
      </header>

      {/* Mobile nav */}
      <AdminMobileNav />

      {/* Body: sidebar + content */}
      <div className="flex">
        <AdminNav />
        <main className="flex-1 min-w-0 p-4 sm:p-6 max-w-6xl">
          {children}
        </main>
      </div>
    </div>
  );
}
