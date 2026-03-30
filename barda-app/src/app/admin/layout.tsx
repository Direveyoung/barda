"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import AdminNav, { AdminMobileNav } from "@/components/admin/AdminNav";

const STORAGE_KEY = "barda_admin_authed";
const ADMIN_PW = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "barda2026";

function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [show, setShow] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pw === ADMIN_PW) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      onSuccess();
    } else {
      setError(true);
      setPw("");
      setTimeout(() => setError(false), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-gray-900">BARDA</span>
          <span className="ml-2 text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Admin</span>
          <p className="text-sm text-gray-500 mt-2">관리자 페이지입니다</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="관리자 비밀번호"
              autoFocus
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors outline-none pr-10
                ${error ? "border-red-400 bg-red-50 text-red-700" : "border-gray-200 focus:border-gray-400 bg-gray-50"}`}
            />
            <button type="button" onClick={() => setShow(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
              {show ? "숨김" : "표시"}
            </button>
          </div>
          {error && <p className="text-xs text-red-500 text-center">비밀번호가 틀렸습니다</p>}
          <button type="submit" disabled={!pw}
            className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            로그인
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-6">
          관리자 계정이 필요하시면 pm.younga@gmail.com으로 문의해주세요
        </p>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    setAuthed(stored === "1");
  }, []);

  if (authed === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return <PasswordGate onSuccess={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-xl font-bold text-primary">BARDA</Link>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { sessionStorage.removeItem(STORAGE_KEY); setAuthed(false); }}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors">
              로그아웃
            </button>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              사이트로 돌아가기
            </Link>
          </div>
        </div>
      </header>
      <AdminMobileNav />
      <div className="flex">
        <AdminNav />
        <main className="flex-1 min-w-0 p-4 sm:p-6 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
