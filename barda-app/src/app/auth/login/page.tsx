"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type AuthStep = "method" | "phone-input" | "otp-verify";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const { testLogin } = useAuth();

  const [step, setStep] = useState<AuthStep>("method");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  function handleTestLogin() {
    testLogin();
    router.push(next);
    router.refresh();
  }

  function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    if (digits.length <= 11) setPhone(formatPhone(digits));
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) { setError("올바른 휴대폰 번호를 입력해 주세요."); return; }
    setLoading(true); setError("");
    if (!supabase) { setStep("otp-verify"); setCountdown(180); setLoading(false); return; }
    const phoneNumber = `+82${digits.startsWith("0") ? digits.slice(1) : digits}`;
    const { error } = await supabase.auth.signInWithOtp({ phone: phoneNumber });
    if (error) { setError(error.message); } else { setStep("otp-verify"); setCountdown(180); }
    setLoading(false);
  }

  const handleOtpChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp]; newOtp[index] = value.slice(-1); setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  }, [otp]);

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) newOtp[i] = pasted[i];
    setOtp(newOtp); otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) { setError("인증번호 6자리를 모두 입력해 주세요."); return; }
    setLoading(true); setError("");
    const digits = phone.replace(/\D/g, "");
    const phoneNumber = `+82${digits.startsWith("0") ? digits.slice(1) : digits}`;
    if (!supabase) { setError("Supabase가 설정되지 않았습니다. 테스트 로그인을 이용해 주세요."); setLoading(false); return; }
    const { error } = await supabase.auth.verifyOtp({ phone: phoneNumber, token: code, type: "sms" });
    if (error) { setError(error.message); } else { router.push(next); router.refresh(); }
    setLoading(false);
  }

  async function handleResendOtp() {
    if (countdown > 0) return;
    setError(""); setOtp(["", "", "", "", "", ""]);
    const digits = phone.replace(/\D/g, "");
    const phoneNumber = `+82${digits.startsWith("0") ? digits.slice(1) : digits}`;
    if (supabase) {
      const { error } = await supabase.auth.signInWithOtp({ phone: phoneNumber });
      if (error) { setError(error.message); return; }
    }
    setCountdown(180);
  }

  const formatCountdown = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const bgStyle = { background: "linear-gradient(180deg, #FFF5F0 0%, #F0F5FF 100%)" };

  if (step === "otp-verify") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={bgStyle}>
        <div className="max-w-sm w-full">
          <button onClick={() => { setStep("phone-input"); setError(""); setOtp(["", "", "", "", "", ""]); }}
            className="flex items-center gap-1 text-sm text-gray-500 mb-6 hover:text-gray-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            뒤로
          </button>
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-full bg-primary-bg flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">인증번호 입력</h2>
              <p className="text-sm text-gray-500"><strong>{phone}</strong>으로 전송된<br />인증번호 6자리를 입력해 주세요</p>
            </div>
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input key={i} ref={(el) => { otpRefs.current[i] = el; }} type="text" inputMode="numeric"
                    maxLength={1} value={digit} onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-13 text-center text-xl font-bold rounded-xl border-2 border-gray-200 focus:border-primary outline-none transition-colors"
                    autoFocus={i === 0} />
                ))}
              </div>
              <div className="text-center">
                {countdown > 0
                  ? <p className="text-sm text-gray-500">남은 시간 <span className="font-semibold text-primary">{formatCountdown(countdown)}</span></p>
                  : <p className="text-sm text-gray-500">인증번호가 만료되었습니다.</p>}
                <button type="button" onClick={handleResendOtp} disabled={countdown > 0}
                  className="text-sm text-primary font-medium hover:underline mt-1 disabled:text-gray-300 disabled:no-underline">
                  인증번호 재전송
                </button>
              </div>
              {error && <p className="text-xs text-danger text-center px-1">{error}</p>}
              <button type="submit" disabled={loading || otp.join("").length !== 6}
                className="w-full py-3.5 rounded-2xl font-semibold text-white bg-primary hover:bg-primary-light transition-colors disabled:opacity-50">
                {loading ? "확인 중..." : "인증 완료"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (step === "phone-input") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={bgStyle}>
        <div className="max-w-sm w-full">
          <button onClick={() => { setStep("method"); setError(""); }}
            className="flex items-center gap-1 text-sm text-gray-500 mb-6 hover:text-gray-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            뒤로
          </button>
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-primary-bg flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">휴대폰 인증</h2>
              <p className="text-sm text-gray-500">본인 확인을 위해 휴대폰 번호를 입력해 주세요</p>
            </div>
            <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>SMS 인증은 현재 준비 중입니다. 테스트 로그인을 이용해 주세요.</span>
            </div>
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-sm text-gray-500">
                  <span>🇰🇷</span><span>+82</span>
                  <div className="w-px h-5 bg-gray-200 ml-1" />
                </div>
                <input type="tel" value={phone} onChange={handlePhoneChange} placeholder="010-1234-5678"
                  required autoFocus
                  className="w-full pl-24 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-primary outline-none transition-colors text-base" />
              </div>
              {error && <p className="text-xs text-danger px-1">{error}</p>}
              <button type="submit" disabled={loading || phone.replace(/\D/g, "").length < 10}
                className="w-full py-3.5 rounded-2xl font-semibold text-white bg-primary hover:bg-primary-light transition-colors disabled:opacity-50">
                {loading ? "전송 중..." : "인증번호 받기"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={bgStyle}>
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-1">BARDA</h1>
          <p className="text-gray-400 text-sm">바르게 바르다</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">로그인 방법 선택</p>
          <button onClick={() => { setStep("phone-input"); setError(""); }}
            className="w-full flex items-center gap-3 py-3.5 px-4 rounded-2xl font-semibold text-white bg-primary hover:bg-primary-light transition-colors mb-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
            <span className="flex-1 text-left">휴대폰 번호로 시작하기</span>
            <span className="text-xs opacity-70">SMS 인증</span>
          </button>
          <button
            onClick={async () => {
              if (!supabase) return;
              await supabase.auth.signInWithOAuth({ provider: "kakao", options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` } });
            }}
            disabled={!supabase}
            className="w-full flex items-center gap-3 py-3.5 px-4 rounded-2xl font-semibold transition-colors disabled:opacity-50"
            style={{ backgroundColor: "#FEE500", color: "#191919" }}>
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="#191919">
              <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.734 1.81 5.133 4.534 6.502l-.926 3.405c-.082.3.26.547.524.38l4.06-2.674a14.04 14.04 0 001.808.118c5.523 0 10-3.463 10-7.731S17.523 3 12 3z" />
            </svg>
            <span className="flex-1 text-left">카카오로 시작하기</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">테스트 로그인</p>
          </div>
          <p className="text-xs text-gray-400 mb-4">실제 인증 없이 모든 기능을 체험해 보세요.</p>
          <button onClick={handleTestLogin}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-white bg-gray-800 hover:bg-gray-700 transition-colors">
            테스트 계정으로 로그인
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">test@barda.dev · 프리미엄 기능 포함</p>
        </div>

        <div className="text-center mt-5">
          <button onClick={() => router.push("/")} className="text-xs text-gray-400 hover:text-gray-600">
            ← 홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-gray-400 text-sm">로딩 중...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
