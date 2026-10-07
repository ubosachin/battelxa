"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  Trophy,
  Gamepad2,
  Wallet,
  User,
  Users,
  LayoutDashboard,
  PlusCircle,
  CreditCard,
  ShieldAlert,
  Scale,
  FileText,
} from "lucide-react";
import { subscribeToSyncEvents } from "@/lib/sync/sync-events";

interface UserSession {
  id: string;
  email: string;
  username: string;
  role: "PLAYER" | "ORGANIZER" | "ADMIN";
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isHighlight?: boolean;
  badge?: string;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchMe() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!isMounted) return;
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (data.wallet) {
            setBalance(data.wallet.balance);
          }
        } else {
          setUser(null);
        }
      } catch {
        if (isMounted) setUser(null);
      }
    }

    fetchMe();

    const unsubscribe = subscribeToSyncEvents((payload) => {
      if (
        payload.type === "AUTH_SESSION_CHANGED" ||
        payload.type === "ORGANIZER_STATUS_CHANGED" ||
        payload.type === "USER_ROLE_UPDATED"
      ) {
        fetchMe();
      }
    });

    const handleFocus = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchMe();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchMe();
      }
    }, 5000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [pathname]);

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(12);
      } catch {}
    }
  };

  const getNavItems = (): NavItem[] => {
    if (!user) {
      return [
        { id: "home", label: "Arena", href: "/", icon: Flame },
        { id: "tournaments", label: "Cups", href: "/tournaments", icon: Trophy },
        { id: "games", label: "Games", href: "/games", icon: Gamepad2, isHighlight: true },
        { id: "leaderboard", label: "Ranks", href: "/leaderboard", icon: Users },
        { id: "login", label: "Sign In", href: "/login", icon: User },
      ];
    }

    if (user.role === "ADMIN") {
      return [
        { id: "admin-home", label: "Home", href: "/", icon: Flame },
        { id: "admin-overview", label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
        {
          id: "admin-tournaments",
          label: "Manage",
          href: "/admin/tournaments",
          icon: Trophy,
          isHighlight: true,
        },
        { id: "admin-payouts", label: "Payouts", href: "/admin/payouts", icon: CreditCard },
        { id: "admin-disputes", label: "Disputes", href: "/admin/disputes", icon: Scale },
      ];
    }

    if (user.role === "ORGANIZER") {
      return [
        { id: "org-home", label: "Home", href: "/", icon: Flame },
        { id: "org-hub", label: "Hub", href: "/organizer/dashboard", icon: LayoutDashboard },
        {
          id: "org-create",
          label: "Host Cup",
          href: "/organizer/tournaments/create",
          icon: PlusCircle,
          isHighlight: true,
        },
        { id: "org-payouts", label: "Earnings", href: "/organizer/payouts", icon: Wallet },
        { id: "org-profile", label: "Profile", href: "/organizer/apply", icon: User },
      ];
    }

    // Default: PLAYER role
    return [
      { id: "player-home", label: "Home", href: "/", icon: Flame },
      { id: "player-tournaments", label: "Cups", href: "/tournaments", icon: Trophy },
      {
        id: "player-matches",
        label: "My Games",
        href: user ? "/player/tournaments" : "/login",
        icon: Gamepad2,
      },
      {
        id: "user-wallet",
        label: "Wallet",
        href: user ? "/player/wallet" : "/login",
        icon: Wallet,
        badge: balance !== null ? `₹${balance}` : undefined,
      },
      {
        id: "user-profile",
        label: user ? "Profile" : "Login",
        href: user ? "/player/profile" : "/login",
        icon: User,
      },
    ];
  };

  const navItems = getNavItems();
  const role = user?.role ? user.role.toUpperCase() : null;

  const activeColorClass =
    role === "ADMIN"
      ? "text-red-400 font-bold"
      : role === "ORGANIZER"
      ? "text-violet-400 font-bold"
      : "text-lime-400 font-bold";

  const activeIndicatorClass =
    role === "ADMIN"
      ? "bg-red-500 shadow-[0_0_8px_#ef4444]"
      : role === "ORGANIZER"
      ? "bg-violet-500 shadow-[0_0_8px_#8b5cf6]"
      : "bg-lime-400 shadow-[0_0_8px_#84cc16]";

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0a0d17]/95 backdrop-blur-2xl border-t border-white/[0.08] shadow-[0_-8px_32px_rgba(0,0,0,0.85)] pb-[env(safe-area-inset-bottom,0.5rem)] pt-1.5"
    >
      <div className="grid grid-cols-5 h-14 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          if (item.isHighlight) {
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={triggerHaptic}
                className="relative -top-3 flex flex-col items-center justify-center group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-lime-500 to-emerald-400 flex items-center justify-center text-black shadow-[0_0_20px_rgba(132,204,22,0.6)] group-active:scale-95 transition-transform">
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold text-lime-400 mt-1 uppercase tracking-wider">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={triggerHaptic}
              className={`flex flex-col items-center justify-center py-1 transition-all relative ${
                isActive
                  ? activeColorClass
                  : "text-zinc-400 hover:text-zinc-200 active:scale-95"
              }`}
            >
              {/* Active top glow indicator */}
              {isActive && (
                <span className={`absolute -top-1.5 w-6 h-0.5 rounded-full ${activeIndicatorClass}`} />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.75]"
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3 text-[9px] font-extrabold px-1 py-0.2 bg-violet-600 text-white rounded-full border border-violet-400/30">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-1 tracking-tight ${
                  isActive ? "font-bold" : "text-zinc-400 font-medium"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
