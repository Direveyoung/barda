import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Validate that the redirect path is safe (relative path only, no open redirect).
 */
function sanitizeRedirectPath(path: string): string {
  // Must start with / and must not contain protocol-relative URLs (//) or backslash
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    path.includes("\0")
  ) {
    return "/";
  }
  // Strip any scheme-like patterns (e.g., /http://evil.com)
  try {
    const url = new URL(path, "http://localhost");
    if (url.hostname !== "localhost") return "/";
  } catch {
    return "/";
  }
  return path;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeRedirectPath(searchParams.get("next") ?? "/");

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
