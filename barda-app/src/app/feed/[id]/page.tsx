import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import RoutineDetailClient from "./RoutineDetailClient";

const skinTypeLabel: Record<string, string> = {
  dry: "건성", oily: "지성", combination: "복합성",
  sensitive: "민감성", normal: "중성",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const defaultMeta: Metadata = {
    title: "루틴 상세 — BARDA",
    description: "스킨케어 루틴을 확인해 보세요",
    openGraph: {
      title: "루틴 상세 — BARDA",
      description: "스킨케어 루틴을 확인해 보세요",
      type: "article",
      locale: "ko_KR",
    },
  };

  try {
    const supabase = await createClient();
    if (!supabase) return defaultMeta;

    const { data } = await supabase
      .from("routine_posts")
      .select("skin_type, score, concerns, comment, users:user_id ( email )")
      .eq("id", id)
      .single();

    if (!data) return defaultMeta;

    const raw = data as Record<string, unknown>;
    const users = raw.users as { email?: string } | null;
    const email = users?.email ?? "";
    const prefix = email.split("@")[0] || "anonymous";
    const displayName = prefix.length < 2 ? prefix + "***" : prefix.slice(0, 2) + "***";
    const skinLabel = skinTypeLabel[raw.skin_type as string] ?? (raw.skin_type as string);
    const score = raw.score as number;

    const title = `${displayName}님의 ${skinLabel} 루틴 (${score}점) — BARDA`;
    const description = (raw.comment as string) ??
      `${skinLabel} 피부 타입의 스킨케어 루틴을 확인해 보세요. 점수 ${score}점`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        locale: "ko_KR",
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
    };
  } catch {
    return defaultMeta;
  }
}

export default async function RoutineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RoutineDetailClient postId={id} />;
}
