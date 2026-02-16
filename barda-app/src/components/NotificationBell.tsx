"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface Notification {
  id: string;
  type: "like" | "comment" | "follow";
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

function formatTimeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);
  if (diffMin < 1) return "방금";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${diffDay}일 전`;
}

const typeIcon: Record<string, string> = {
  like: "❤️",
  comment: "💬",
  follow: "👤",
};

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Load notifications from localStorage
  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    try {
      const data = localStorage.getItem(`barda_notifications_${user.id}`);
      if (data) {
        setNotifications(JSON.parse(data));
      }
    } catch { /* ignore */ }
  }, [user]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    if (!user) return;
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    try {
      localStorage.setItem(
        `barda_notifications_${user.id}`,
        JSON.stringify(updated)
      );
    } catch { /* ignore */ }
  }, [user, notifications]);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) markAllRead();
        }}
        className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-[10px] font-bold flex items-center justify-center rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 max-h-80 overflow-y-auto">
          <div className="px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-800">알림</span>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-xs text-gray-400">아직 알림이 없어요</p>
            </div>
          ) : (
            <div>
              {notifications.slice(0, 20).map((n) => (
                <Link
                  key={n.id}
                  href={n.link}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-start gap-2.5 px-4 py-3 hover:bg-gray-50 transition-colors ${
                    !n.read ? "bg-primary-bg/30" : ""
                  }`}
                >
                  <span className="text-base mt-0.5">{typeIcon[n.type] ?? "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{formatTimeAgo(n.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
