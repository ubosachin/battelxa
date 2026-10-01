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
  LayoutDashboard,
  PlusCircle,
  CreditCard,
  ShieldAlert,
  Scale,
  FileText,
} from "lucide-react";

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
    async function fetchMe() {
      try {
        const res = await fetch("/api/auth/me");
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
        setUser(null);
      }
    }
    fetchMe();
  }, [pathname]);

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // Ignore if restricted
      }
    }
  };

  // Build navigation items based on active role
  const getNavItems = (): NavItem[] => {
    const role = user?.role ? user.role.toUpperCase() : null;

    if (role === "ADMIN") {
      return [
        { id: "admin-home", label: "Home", href: "/", icon: Flame },
        { id: "admin-tourneys", label: "Tourneys", href: "/admin/tournaments", icon: Trophy },
        { id: "admin-dash", label: "Admin", href: "/admin/dashboard", icon: ShieldAlert },
        { id: "admin-disputes", label: "Disputes", href: "/admin/disputes", icon: Scale },
        { id: "admin-logs", label: "Logs", href: "/admin/audit-logs", icon: FileText },
      ];
    }

    if (role === "ORGANIZER") {
      return [
        { id: "org-home", label: "Home", href: "/", icon: Flame },
        { id: "org-matches", label: "Matches", href: "/tournaments", icon: Trophy },
        { id: "org-dash", label: "Dashboard", href: "/organizer/dashboard", icon: LayoutDashboard },
        { id: "org-host", label: "Host", href: "/organizer/tournaments/create", icon: PlusCircle, isHighlight: true },
        { id: "org-payouts", label: "Payouts", href: "/organizer/payouts", icon: CreditCard },
      ];
    }

    // Default: PLAYER or GUEST
    return [
      { id: "user-home", label: "Home", href: "/", icon: Flame },
      { id: "user-explore", label: "Explore", href: "/tournaments", icon: Trophy },
      {
        id: "user-matches",
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
              : pathname.startsWith(item.href);

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
                  ? "text-lime-400"
                  : "text-zinc-400 hover:text-zinc-200 active:scale-95"
              }`}
            >
              {/* Active top glow indicator */}
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-0.5 rounded-full bg-lime-400 shadow-[0_0_8px_#84cc16]" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.75]"
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3 text-[9px] font-extrabold px-1 py-0.2 bg-violet-600/90 text-white rounded-full border border-violet-400/30">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-1 tracking-tight font-medium ${
                  isActive ? "font-bold text-lime-400" : "text-zinc-400"
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
