import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Admin session cookie name.
 * Set by POST /api/admin/auth when password is verified client-side.
 */
const SESSION_COOKIE = "barda_admin_session";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "barda2026";

interface AdminAuthResult {
  supabase: SupabaseClient;
  userId: string;
}

/**
 * Verify admin access via HTTP-only cookie (set at /api/admin/auth).
 * Does NOT require Supabase user session — uses password-gate cookie instead.
 */
export async function requireAdmin(): Promise<AdminAuthResult | NextResponse> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get(SESSION_COOKIE)?.value;

  if (!adminSession || adminSession !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Database connection unavailable" },
      { status: 503 },
    );
  }

  return { supabase, userId: "admin" };
}
