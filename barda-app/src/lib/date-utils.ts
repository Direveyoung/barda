/* ─── Date Utilities ─── */

/** 상대 시간 포맷 (e.g., "방금", "5분 전", "3시간 전", "2일 전") */
export function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "방금";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${diffDay}일 전`;
}

/* ─── Clipboard Utilities ─── */

/** 클립보드에 텍스트 복사 (Clipboard API fallback 포함) */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}

/** Web Share API로 공유 (미지원 시 클립보드 복사 fallback) */
export async function shareOrCopy(text: string): Promise<void> {
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return;
    } catch { /* cancelled */ }
  }
  await copyToClipboard(text);
}
