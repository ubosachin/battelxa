"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/utils";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // ignore in offline/unauth mode
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok && isMounted) {
          const data = await res.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch {
        // ignore in offline/unauth mode
      }
    }

    load();
    const interval = setInterval(load, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-lime-500 text-[10px] font-bold text-black ring-2 ring-[#08090e]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#0e111a] border border-zinc-800 shadow-2xl p-4 z-50 text-zinc-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-white">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-900/60 text-violet-300 font-semibold border border-violet-700/40">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-lime-400 hover:text-lime-300 flex items-center gap-1 cursor-pointer"
                >
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/50 mt-2">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`py-2.5 px-1.5 transition-colors rounded-lg ${
                      n.isRead ? "opacity-75" : "bg-violet-950/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-xs font-semibold text-zinc-200">
                        {n.title}
                      </h5>
                      <span className="text-[10px] text-zinc-500 shrink-0">
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-snug">
                      {n.message}
                    </p>
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 mt-1.5"
                      >
                        View details <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
