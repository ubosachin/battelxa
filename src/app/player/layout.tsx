"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Wallet,
  User,
  Bell,
  HelpCircle,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOnboarded, setIsOnboarded] = useState<boolean>(true);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);

  useEffect(() => {
    async function checkAuthAndOnboarding() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (!data.user) {
            router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
            return;
          }
          if (data.user && data.user.isOnboarded === false) {
            setIsOnboarded(false);
          }
        } else {
          router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
        }
      } catch (err) {
        console.error("Failed to check auth status", err);
      }
    }

    if (pathname !== "/player/onboarding") {
      checkAuthAndOnboarding();
    }
  }, [pathname, router]);

  // If on onboarding page, render full screen without player sidebar
  if (pathname === "/player/onboarding") {
    return <div className="min-h-screen bg-[#08090e]">{children}</div>;
  }

  const links = [
    { label: "Overview", shortLabel: "Overview", href: "/player/dashboard", icon: LayoutDashboard },
    { label: "My Tournaments", shortLabel: "Matches", href: "/player/tournaments", icon: Trophy },
    { label: "My Squads", shortLabel: "Squads", href: "/player/teams", icon: Users },
    { label: "Wallet & Payouts", shortLabel: "Wallet", href: "/player/wallet", icon: Wallet },
    { label: "Gamer Profile", shortLabel: "Profile", href: "/player/profile", icon: User },
    { label: "Notifications", shortLabel: "Alerts", href: "/player/notifications", icon: Bell },
    { label: "Disputes & Support", shortLabel: "Support", href: "/player/support", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-[#08090e] flex flex-col md:flex-row">
      {/* Desktop Sidebar (Sticky, Left) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0c0f18] border-r border-zinc-800/80 p-4 space-y-6 shrink-0 md:sticky md:top-20 md:h-[calc(100vh-5rem)] overflow-y-auto">
        <div className="px-3 pt-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-lime-400">
            Player HQ
          </span>
          <h2 className="text-lg font-black text-white">Contender Portal</h2>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-900/30"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sticky Sub-Navbar (Horizontal scrolling pills, 48px height) */}
      <div className="md:hidden sticky top-16 z-30 w-full bg-[#0c0f18]/95 backdrop-blur-xl border-b border-zinc-800 shadow-md">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-3 py-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 active:scale-95 ${
                  isActive
                    ? "bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.5)] border border-violet-500"
                    : "bg-zinc-900/90 text-zinc-400 hover:text-white border border-white/5 hover:bg-zinc-800"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{link.shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto pb-[calc(6rem+env(safe-area-inset-bottom,0px))] md:pb-8 flex flex-col">
        {!isOnboarded && !bannerDismissed && (
          <div className="max-w-6xl mx-auto w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-lime-950/70 via-zinc-900 to-violet-950/50 border border-lime-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-lime-400/20 border border-lime-400/40 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-lime-400" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">
                  Gladiator Setup Incomplete
                </h4>
                <p className="text-[11px] sm:text-xs text-zinc-400">
                  Link your Free Fire UID / BGMI Character ID to ensure automated tournament room slot verification.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/player/onboarding"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-400 hover:bg-lime-300 text-black text-xs font-black uppercase tracking-wider transition-colors shadow-md"
              >
                Complete Setup <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto w-full flex-1">{children}</div>
      </main>
    </div>
  );
}

