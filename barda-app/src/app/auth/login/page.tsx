"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type AuthStep = "method" | "phone-input" | "otp-verify" | "email-form" | "email-sent";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const { testLogin } = useAuth();

  const [step, setStep] = useState<AuthStep>("method");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const supabase = createClient();

  // Countdown timer for OTP resend
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

  // Format phone number as user types
  function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    if (digits.length <= 11) {
      setPhone(formatPhone(digits));
    }
  }

  // Send OTP via Supabase Phone Auth
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("올바른 휴대폰 번호를 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError("");

    if (!supabase) {
      // Graceful fallback: Supabase 미연결 시 OTP 화면으로 이동 (데모)
      setStep("otp-verify");
      setCountdown(180);
      setLoading(false);
      return;
    }

    const phoneNumber = `+82${digits.startsWith("0") ? digits.slice(1) : digits}`;
    const { error } = await supabase.auth.signInWithOtp({ phone: phoneNumber });

    if (error) {
      setError(error.message);
    } else {
      setStep("otp-verify");
      setCountdown(180);
    }
    setLoading(false);
  }

  // Handle OTP input
  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;
      const newOtp = [...otp];
      newOtp[index] = value.slice(-1);
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    },
    [otp],
  );

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  // Handle OTP paste
  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const focusIdx = Math.min(pasted.length, 5);
    otpRefs.current[focusIdx]?.focus();
  }

  // Verify OTP
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setError("인증번호 6자리를 모두 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError("");

    const digits = phone.replace(/\D/g, "");
    const phoneNumber = `+82${digits.startsWith("0") ? digits.slice(1) : digits}`;

    if (!supabase) {
      // Graceful fallback: demo mode
      setError("Supabase가 설정되지 않았습니다. 테스트 로그인을 이용해 주세요.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: code,
      type: "sms",
    });

    if (error) {
      setError(error.message);
    } else {
      router.push(next);
      router.refresh();
    }
    setLoading(false);
  }

  // Resend OTP
  async function handleResendOtp() {
    if (countdown > 0) return;
    setError("");
    setOtp(["", "", "", "", "", ""]);

    const digits = phone.replace(/\D/g, "");
    const phoneNumber = `+82${digits.startsWith("0") ? digits.slice(1) : digits}`;

    if (supabase) {
      const { error } = await supabase.auth.signInWithOtp({ phone: phoneNumber });
      if (error) {
        setError(error.message);
        return;
      }
    }
    setCountdown(180);
  }

  // Email auth
  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setError("Supabase가 설정되지 않았습니다.");
      return;
    }

    setLoading(true);
    setError("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}` },
      });
      if (error) {
        setError(error.message);
      } else {
        setStep("email-sent");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push(next);
        router.refresh();
      }
    }
    setLoading(false);
  }

  // Google OAuth
  async function handleGoogleLogin() {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
      },
    });
  }

  // Kakao OAuth (준비 중)
  async function handleKakaoLogin() {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
      },
    });
  }

  const formatCountdown = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // ─── Email Sent Screen ───
  if (step === "email-sent") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-primary-bg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            이메일을 확인해 주세요
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            <strong>{email}</strong>로 인증 링크를 보냈어요.
            <br />
            이메일을 확인하고 링크를 클릭해 주세요.
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-primary hover:underline"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // ─── OTP Verify Screen ───
  if (step === "otp-verify") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          {/* Back button */}
          <button
            onClick={() => { setStep("phone-input"); setError(""); setOtp(["", "", "", "", "", ""]); }}
            className="flex items-center gap-1 text-sm text-gray-500 mb-6 hover:text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            뒤로
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary-bg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">인증번호 입력</h2>
            <p className="text-sm text-gray-500">
              <strong>{phone}</strong>으로 전송된<br />인증번호 6자리를 입력해 주세요
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            {/* OTP Input */}
            <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-gray-200 focus:border-primary outline-none transition-colors"
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {/* Timer + Resend */}
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-gray-500">
                  남은 시간 <span className="font-semibold text-primary">{formatCountdown(countdown)}</span>
                </p>
              ) : (
                <p className="text-sm text-gray-500">인증번호가 만료되었습니다.</p>
              )}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0}
                className="text-sm text-primary font-medium hover:underline mt-1 disabled:text-gray-300 disabled:no-underline"
              >
                인증번호 재전송
              </button>
            </div>

            {error && (
              <p className="text-xs text-danger text-center px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || otp.join("").length !== 6}
              className="w-full py-3.5 rounded-2xl font-semibold text-white bg-primary hover:bg-primary-light transition-colors disabled:opacity-50"
            >
              {loading ? "확인 중..." : "인증 완료"}
            </button>
          </form>

          {!supabase && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 text-center">
              Supabase가 설정되지 않았습니다. 테스트 로그인을 이용해 주세요.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Phone Input Screen ───
  if (step === "phone-input") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          {/* Back button */}
          <button
            onClick={() => { setStep("method"); setError(""); }}
            className="flex items-center gap-1 text-sm text-gray-500 mb-6 hover:text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            뒤로
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary-bg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">휴대폰 인증</h2>
            <p className="text-sm text-gray-500">
              본인 확인을 위해 휴대폰 번호를 입력해 주세요
            </p>
          </div>

          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-sm text-gray-500">
                <span>🇰🇷</span>
                <span>+82</span>
                <div className="w-px h-5 bg-gray-200 ml-1" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="010-1234-5678"
                required
                autoFocus
                className="w-full pl-24 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-primary outline-none transition-colors text-base"
              />
            </div>

            {error && (
              <p className="text-xs text-danger px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || phone.replace(/\D/g, "").length < 10}
              className="w-full py-3.5 rounded-2xl font-semibold text-white bg-primary hover:bg-primary-light transition-colors disabled:opacity-50"
            >
              {loading ? "전송 중..." : "인증번호 받기"}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
            인증번호는 SMS로 발송되며,<br />
            통신사 사정에 따라 수십 초 정도 지연될 수 있습니다.
          </p>

          {!supabase && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 text-center">
              Supabase가 설정되지 않았습니다. 테스트 로그인을 이용해 주세요.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Email Form Screen ───
  if (step === "email-form") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          {/* Back button */}
          <button
            onClick={() => { setStep("method"); setError(""); }}
            className="flex items-center gap-1 text-sm text-gray-500 mb-6 hover:text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            뒤로
          </button>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary mb-1">BARDA</h1>
            <p className="text-gray-500 text-sm">이메일로 {isSignUp ? "회원가입" : "로그인"}</p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
              required
              autoFocus
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-primary outline-none transition-colors text-sm"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 (6자 이상)"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-primary outline-none transition-colors text-sm"
            />

            {error && (
              <p className="text-xs text-danger px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !supabase}
              className="w-full py-3 rounded-2xl font-semibold text-white bg-primary hover:bg-primary-light transition-colors disabled:opacity-50"
            >
              {loading ? "처리 중..." : isSignUp ? "회원가입" : "로그인"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            {isSignUp ? "이미 계정이 있으신가요?" : "계정이 없으신가요?"}{" "}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              className="text-primary font-medium hover:underline"
            >
              {isSignUp ? "로그인" : "회원가입"}
            </button>
          </p>

          {!supabase && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 text-center">
              Supabase가 설정되지 않았습니다. .env.local 파일을 확인해 주세요.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Method Selection Screen (default) ───
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-primary mb-1">BARDA</h1>
          <p className="text-gray-500 text-sm">바르게 바르다</p>
        </div>

        {/* Primary: Phone Auth */}
        <button
          onClick={() => { setStep("phone-input"); setError(""); }}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-white bg-primary hover:bg-primary-light transition-colors mb-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
          </svg>
          휴대폰 번호로 시작하기
        </button>

        {/* Kakao Login */}
        <button
          onClick={handleKakaoLogin}
          disabled={!supabase}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold transition-colors mb-3 disabled:opacity-50"
          style={{ backgroundColor: "#FEE500", color: "#191919" }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#191919">
            <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.734 1.81 5.133 4.534 6.502l-.926 3.405c-.082.3.26.547.524.38l4.06-2.674a14.04 14.04 0 001.808.118c5.523 0 10-3.463 10-7.731S17.523 3 12 3z" />
          </svg>
          카카오로 시작하기
        </button>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={!supabase}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-3 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google로 시작하기
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">또는</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Email login link */}
        <button
          onClick={() => { setStep("email-form"); setError(""); }}
          className="w-full py-3 rounded-2xl border-2 border-gray-200 font-medium text-gray-600 hover:bg-gray-50 transition-colors text-sm"
        >
          이메일로 로그인
        </button>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/")}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            ← 홈으로 돌아가기
          </button>
        </div>

        {!supabase && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 text-center">
            Supabase가 설정되지 않았습니다. .env.local 파일을 확인해 주세요.
          </div>
        )}

        {/* Test Login — development only */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">개발용</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <button
              onClick={handleTestLogin}
              className="w-full py-3 rounded-2xl font-semibold text-white bg-gray-800 hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              테스트 계정으로 로그인
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">
              test@barda.dev · 프리미엄 기능 포함
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-400 text-sm">로딩 중...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
