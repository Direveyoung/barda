import { NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "barda2026";
const SESSION_COOKIE = "barda_admin_session";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 60 * 60 * 24, // 24h
  path: "/",
};

/** POST /api/admin/auth — verify password and set session cookie */
export async function POST(request: Request) {
  let password = "";
  try {
    const body = await request.json();
    password = body?.password ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, ADMIN_PASSWORD, COOKIE_OPTIONS);
  return response;
}

/** DELETE /api/admin/auth — clear session cookie (logout) */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
