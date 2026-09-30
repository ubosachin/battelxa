"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/utils";
import { Bell, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export default function PlayerNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadNotifications() {
      try {
        const res = await fetch("/api/notifications");
        if (isMounted && res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadNotifications();
    return () => {
      isMounted = false;
    };
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            In-App Notifications Hub
          </h1>
          <p className="text-xs text-zinc-400">
            Real-time updates regarding tournament slots, credentials release, and wallet payouts.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead}>
          <Check className="h-4 w-4 mr-1 text-lime-400" /> Mark All Read
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-zinc-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl bg-[#0e111a] border border-zinc-800 p-10 text-center space-y-3">
          <Bell className="h-8 w-8 text-zinc-600 mx-auto" />
          <h3 className="font-bold text-white text-base">No Notifications</h3>
          <p className="text-xs text-zinc-400">
            You&apos;re all caught up! Match announcements will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] divide-y divide-zinc-800/80 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                n.isRead ? "opacity-70" : "bg-violet-950/20"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">{n.title}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                    {n.type}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-xl">
                  {n.message}
                </p>
                {n.link && (
                  <Link
                    href={n.link}
                    className="inline-flex items-center gap-1 text-xs text-lime-400 hover:text-lime-300 font-semibold pt-1"
                  >
                    View match details <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>

              <span className="text-[11px] text-zinc-500 shrink-0">
                {formatTimeAgo(n.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
