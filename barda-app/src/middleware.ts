import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

/* ── Rate limit configuration per API route ── */
const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/events":              { max: 10, windowMs: 60_000 },
  "/api/payments/confirm":    { max: 3,  windowMs: 60_000 },
  "/api/barcode":             { max: 20, windowMs: 60_000 },
  "/api/points":              { max: 20, windowMs: 60_000 },
  "/api/admin/points/adjust": { max: 5,  windowMs: 60_000 },
  "/api/routines":            { max: 10, windowMs: 60_000 },
};
const DEFAULT_API_LIMIT = { max: 30, windowMs: 60_000 };

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* ── API Rate Limiting (runs even without Supabase) ── */
  if (pathname.startsWith("/api/")) {
    const ip = getClientIP(request);
    const config = RATE_LIMITS[pathname] ?? DEFAULT_API_LIMIT;
    const result = rateLimit(`${ip}:${pathname}`, config.max, config.windowMs);

    if (!result.success) {
      return NextResponse.json(
        { error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }
  }

  // Allow test users (cookie set by testLogin()) — bypass Supabase auth
  if (request.cookies.get("barda_test_user")?.value === "true") {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Graceful fallback: no Supabase → pass through
  if (!url || !key) return NextResponse.next();

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /admin — redirect to login if not authenticated
  if (request.nextUrl.pathname.startsWith("/admin") && !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Protect /mypage — redirect to login if not authenticated
  if (request.nextUrl.pathname.startsWith("/mypage") && !user) {
    return NextResponse.redirect(
      new URL(
        `/auth/login?next=${encodeURIComponent(request.nextUrl.pathname)}`,
        request.url
      )
    );
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
