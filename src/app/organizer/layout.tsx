"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  PlusCircle,
  Wallet,
  ShieldCheck,
  AlertCircle,
  Lock,
  ArrowRight,
  Flame,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { subscribeToSyncEvents } from "@/lib/sync/sync-events";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Status: "CHECKING" | "AUTHORIZED" | "PLAYER_RESTRICTED" | "UNAUTHENTICATED"
  const [authStatus, setAuthStatus] = useState<"CHECKING" | "AUTHORIZED" | "PLAYER_RESTRICTED" | "UNAUTHENTICATED">("CHECKING");
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");
  const [isRechecking, setIsRechecking] = useState<boolean>(false);

  const checkHostAuth = async (silent = false) => {
    try {
      if (!silent) setIsRechecking(true);
      const res = await fetch("/api/auth/me", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (!data || !data.user) {
          setAuthStatus("UNAUTHENTICATED");
          return;
        }

        const role = (data.user.role || "").toUpperCase();
        setUsername(data.user.username);

        // Check if verified organizer through role, profile, or flag
        const isApproved =
          role === "ORGANIZER" ||
          role === "ADMIN" ||
          Boolean(data.user.isVerifiedOrganizer) ||
          data.organizerProfile?.status === "APPROVED" ||
          Boolean(data.organizerProfile?.verifiedByAdmin);

        if (isApproved) {
          setIsVerified(true);
          setAuthStatus("AUTHORIZED");
        } else {
          // Contender without verified clearance
          setAuthStatus("PLAYER_RESTRICTED");
        }
      } else {
        setAuthStatus("UNAUTHENTICATED");
      }
    } catch {
      setAuthStatus("UNAUTHENTICATED");
    } finally {
      if (!silent) setIsRechecking(false);
    }
  };

  useEffect(() => {
    checkHostAuth(true);

    // Cross-tab and in-tab real-time listener for instant role/session sync
    const unsubscribe = subscribeToSyncEvents((payload) => {
      if (
        payload.type === "AUTH_SESSION_CHANGED" ||
        payload.type === "ORGANIZER_STATUS_CHANGED" ||
        payload.type === "USER_ROLE_UPDATED"
      ) {
        checkHostAuth(true);
      }
    });

    const handleFocus = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        checkHostAuth(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      unsubscribe();
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [pathname]);

  const links = [
    { label: "Organizer Hub", shortLabel: "Host Hub", href: "/organizer/dashboard", icon: LayoutDashboard },
    { label: "Host New Cup", shortLabel: "Host Cup", href: "/organizer/tournaments/create", icon: PlusCircle },
    { label: "Host Payouts", shortLabel: "Payouts", href: "/organizer/payouts", icon: Wallet },
    { label: "Verification Status", shortLabel: "Status", href: "/organizer/apply", icon: ShieldCheck },
  ];

  // Allow everyone to see the application page /organizer/apply
  const isApplyPage = pathname === "/organizer/apply";

  // 1. Loading State
  if (authStatus === "CHECKING" && !isApplyPage) {
    return (
      <div className="min-h-screen bg-[#08090e] flex flex-col items-center justify-center text-white p-4">
        <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/30 flex items-center justify-center animate-pulse mb-4">
          <LayoutDashboard className="h-6 w-6 text-violet-400 animate-spin" />
        </div>
        <p className="text-xs font-mono tracking-widest uppercase text-zinc-400">
          Loading Host Console...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated State (Not logged in)
  if (authStatus === "UNAUTHENTICATED" && !isApplyPage) {
    return (
      <div className="min-h-screen bg-[#08090e] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl bg-[#0c0f18] border border-violet-900/40 p-6 sm:p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-violet-950/60 border border-violet-600/40 text-violet-400 mx-auto flex items-center justify-center">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-violet-600/20 text-violet-300 border border-violet-500/30">
              Host Login Required
            </span>
            <h2 className="text-xl font-black text-white">Organizer Console Locked</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sign in with your organizer account to host tournaments, manage match rooms, and access payouts.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link href={`/login?returnTo=${encodeURIComponent(pathname)}`}>
              <Button variant="primary" className="w-full text-xs font-bold">
                Host Sign In
              </Button>
            </Link>
            <Link href="/organizer/apply">
              <Button variant="outline" className="w-full text-xs">
                Apply to Become an Organizer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Player Restricted State (Regular contender trying to view host management)
  if (authStatus === "PLAYER_RESTRICTED" && !isApplyPage) {
    return (
      <div className="min-h-screen bg-[#08090e] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl bg-[#0c0f18] border border-violet-500/40 p-6 sm:p-8 text-center space-y-5 shadow-[0_0_50px_rgba(139,92,246,0.15)]">
          <div className="w-16 h-16 rounded-2xl bg-violet-950/60 border border-violet-500/40 text-violet-400 mx-auto flex items-center justify-center">
            <Flame className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-violet-600 text-white font-mono">
              HOST VERIFICATION REQUIRED
            </span>
            <h2 className="text-xl font-black text-white">Join the BATTLEXA Host Hub</h2>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Hello <strong className="text-lime-400">{username}</strong>! You are currently registered as a Contender. To host tournaments and earn prize commission, apply for verified organizer clearance.
            </p>
          </div>

          <div className="p-3.5 bg-violet-950/30 rounded-xl border border-violet-800/40 text-xs text-zinc-300 text-left space-y-1.5">
            <div className="font-bold text-violet-300">Organizer Privileges:</div>
            <ul className="list-disc list-inside text-[11px] text-zinc-400 space-y-1">
              <li>Create Free Fire & BGMI cups with custom prize pools</li>
              <li>Live Room ID & Password allocation controls</li>
              <li>Dedicated host earnings & automated bank withdrawals</li>
            </ul>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Button
              variant="outline"
              onClick={() => checkHostAuth(false)}
              disabled={isRechecking}
              className="w-full text-xs font-bold border-violet-500/40 text-violet-300 hover:bg-violet-950/40 flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRechecking ? "animate-spin" : ""}`} />
              {isRechecking ? "Checking Approval..." : "Re-check Approval Status"}
            </Button>
            <Link href="/organizer/apply">
              <Button variant="primary" className="w-full text-xs font-bold">
                Apply for Organizer Status <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
            <Link href="/player/dashboard">
              <Button variant="outline" className="w-full text-xs">
                Back to Player Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized Organizer (or applying)
  return (
    <div className="min-h-screen bg-[#08090e] flex flex-col md:flex-row">
      {/* Desktop Sidebar (Sticky, Left) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0c0f18] border-r border-zinc-800/80 p-4 space-y-6 shrink-0 md:sticky md:top-20 md:h-[calc(100vh-5rem)] overflow-y-auto">
        <div className="px-3 pt-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-violet-400">
            Host Control
          </span>
          <h2 className="text-lg font-black text-white mt-0.5">Organizer Console</h2>
          {username && (
            <span className="text-[11px] font-mono text-zinc-500 block truncate mt-0.5">
              Host: {username}
            </span>
          )}
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
                    ? "bg-violet-600 text-white shadow-md shadow-violet-900/30"
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
      <div className="md:hidden sticky top-16 z-30 w-full bg-[#0c0f18]/95 backdrop-blur-xl border-b border-violet-950/50 shadow-md">
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
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto pb-[calc(6rem+env(safe-area-inset-bottom,0px))] md:pb-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {!isVerified && !isApplyPage && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                <span>
                  Your organizer application is currently under admin compliance review. Once approved, you can publish paid tournaments.
                </span>
              </div>
              <Link href="/organizer/apply">
                <button className="underline font-bold text-amber-300 cursor-pointer shrink-0 ml-2">
                  View Status
                </button>
              </Link>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
