import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { lookupIngredientEnriched } from "@/lib/external-apis";
import { z } from "zod";

const importSchema = z.object({
  ingredients: z.array(z.string().min(1).max(100)).min(1).max(50),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = importSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { ingredients } = parsed.data;
  let succeeded = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const name of ingredients) {
    try {
      const result = await lookupIngredientEnriched(name);
      if (result.success) {
        succeeded++;
      } else {
        failed++;
        errors.push(`${name}: ${result.error ?? "not found"}`);
      }
    } catch (err) {
      failed++;
      errors.push(`${name}: ${err instanceof Error ? err.message : "unknown error"}`);
    }

    // Rate limit: 1 second between requests
    if (ingredients.indexOf(name) < ingredients.length - 1) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return NextResponse.json({
    processed: ingredients.length,
    succeeded,
    failed,
    errors: errors.slice(0, 20),
    timestamp: new Date().toISOString(),
  });
}
