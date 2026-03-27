/**
 * Funnel event tracking.
 *
 * Events are buffered in memory and flushed to `/api/events` periodically
 * or when the page is about to unload.
 */

import { STORAGE_KEYS, EVENT_FLUSH_INTERVAL_MS } from "@/lib/constants";

/* ---------- Event types ---------- */

export type FunnelEventName =
  | "wizard_start"
  | "skin_type_selected"
  | "concerns_selected"
  | "product_search"
  | "product_added"
  | "analysis_started"
  | "result_viewed"
  | "paywall_shown"
  | "payment_initiated"
  | "payment_completed"
  | "feedback_submitted";

interface QueuedEvent {
  event_name: string;
  session_id: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

/* ---------- Session ID ---------- */

export function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let id = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, id);
  }
  return id;
}

/* ---------- Event buffer ---------- */

let buffer: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

function ensureFlushTimer() {
  if (flushTimer !== null) return;

  flushTimer = setInterval(() => {
    flushEvents();
  }, EVENT_FLUSH_INTERVAL_MS);

  if (typeof window !== "undefined") {
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        flushEvents();
      }
    });

    window.addEventListener("beforeunload", () => {
      flushEvents();
    });
  }
}

/* ---------- Public API ---------- */

export function trackEvent(
  eventName: FunnelEventName | string,
  metadata?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;

  buffer.push({
    event_name: eventName,
    session_id: getSessionId(),
    metadata,
    created_at: new Date().toISOString(),
  });

  ensureFlushTimer();
}

export function flushEvents(): void {
  if (buffer.length === 0) return;

  const events = [...buffer];
  buffer = [];

  // Use sendBeacon for reliability during page unload; fall back to fetch.
  const payload = JSON.stringify({ events });

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const sent = navigator.sendBeacon(
      "/api/events",
      new Blob([payload], { type: "application/json" }),
    );
    if (sent) return;
  }

  // Fallback: fire-and-forget fetch
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // Silently ignore — analytics should never break the app.
  });
}
