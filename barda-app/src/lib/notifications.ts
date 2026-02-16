/**
 * Client-side notification helpers.
 * Stores notifications in localStorage per user.
 * In the future, this can be replaced with a server-side push system.
 */

export interface NotificationData {
  type: "like" | "comment" | "follow";
  message: string;
  link: string;
}

export function pushNotification(userId: string, notification: NotificationData) {
  if (typeof window === "undefined") return;

  try {
    const key = `barda_notifications_${userId}`;
    const existing = JSON.parse(localStorage.getItem(key) ?? "[]");

    const newNotif = {
      id: crypto.randomUUID(),
      ...notification,
      read: false,
      createdAt: new Date().toISOString(),
    };

    // Keep max 50 notifications
    const updated = [newNotif, ...existing].slice(0, 50);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}

export function getUnreadCount(userId: string): number {
  if (typeof window === "undefined") return 0;

  try {
    const key = `barda_notifications_${userId}`;
    const data = JSON.parse(localStorage.getItem(key) ?? "[]");
    return data.filter((n: { read: boolean }) => !n.read).length;
  } catch {
    return 0;
  }
}
