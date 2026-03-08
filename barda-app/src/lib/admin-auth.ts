import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Admin emails allowed to access admin API endpoints.
 * In production, this should be managed via a Supabase `admins` table or RLS policies.
 */
const ADMIN_EMAILS = new Set([
  "test@barda.dev",
  // Add more admin emails here
]);

interface AdminAuthResult {
  supabase: SupabaseClient;
  userId: string;
}

/**
 * Verify that the current request is from an authenticated admin user.
 * Returns the supabase client and userId on success, or a NextResponse error on failure.
 */
export async function requireAdmin(): Promise<AdminAuthResult | NextResponse> {
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Database connection unavailable" },
      { status: 503 },
    );
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  if (!user.email || !ADMIN_EMAILS.has(user.email)) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 },
    );
  }

  return { supabase, userId: user.id };
}
