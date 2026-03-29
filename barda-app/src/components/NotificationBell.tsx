"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Icon from "@/components/Icon";
import { formatRelativeTime } from "@/lib/date-utils";
import { STORAGE_KEYS, NOTIFICATION_DISPLAY_MAX } from "@/lib/constants";

interface Notification {
  id: string;
  type: "like" | "comment" | "follow";
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

const typeIconName: Record<string, { name: string; className: string }> = {
  like: { name: "heart", className: "text-red-500" },
  comment: { name: "comment-bubble", className: "text-blue-500" },
  follow: { name: "person", className: "text-gray-600" },
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
      const data = localStorage.getItem(STORAGE_KEYS.notifications(user.id));
      if (data) {
        const parsed = JSON.parse(data) as Notification[];
        queueMicrotask(() => setNotifications(parsed));
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
        STORAGE_KEYS.notifications(user.id),
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
          <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-xs font-bold flex items-center justify-center rounded-full">
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
              {notifications.slice(0, NOTIFICATION_DISPLAY_MAX).map((n) => (
                <Link
                  key={n.id}
                  href={n.link}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-start gap-2.5 px-4 py-3 hover:bg-gray-50 transition-colors ${
                    !n.read ? "bg-primary-bg/30" : ""
                  }`}
                >
                  <span className="mt-0.5">
                    <Icon
                      name={typeIconName[n.type]?.name ?? "bell"}
                      size={14}
                      className={typeIconName[n.type]?.className ?? "text-gray-500"}
                    />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(n.createdAt)}</p>
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
