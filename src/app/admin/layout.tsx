"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  UserCog,
  ShieldCheck,
  Trophy,
  Wallet,
  AlertTriangle,
  FileText,
  Lock,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Status: "CHECKING" | "AUTHORIZED" | "UNAUTHORIZED" | "UNAUTHENTICATED"
  const [authStatus, setAuthStatus] = useState<"CHECKING" | "AUTHORIZED" | "UNAUTHORIZED" | "UNAUTHENTICATED">("CHECKING");
  const [currentUsername, setCurrentUsername] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function verifyAdminAccess() {
      try {
        const res = await fetch("/api/auth/me");
        if (!isMounted) return;

        if (res.ok) {
          const data = await res.json();
          if (data.user?.role === "ADMIN") {
            setCurrentUsername(data.user.username);
            setAuthStatus("AUTHORIZED");
          } else if (data.user) {
            setCurrentUsername(data.user.username);
            setAuthStatus("UNAUTHORIZED");
          } else {
            setAuthStatus("UNAUTHENTICATED");
          }
        } else {
          setAuthStatus("UNAUTHENTICATED");
        }
      } catch {
        if (isMounted) setAuthStatus("UNAUTHENTICATED");
      }
    }

    verifyAdminAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  const links = [
    { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "User Directory & Management", href: "/admin/users", icon: UserCog },
    { label: "Organizer Approval", href: "/admin/organizers", icon: ShieldCheck },
    { label: "Payout Clearance", href: "/admin/payouts", icon: Wallet },
    { label: "Tournament Moderation", href: "/admin/tournaments", icon: Trophy },
    { label: "Dispute Resolution", href: "/admin/disputes", icon: AlertTriangle },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
  ];

  // 1. Loading State
  if (authStatus === "CHECKING") {
    return (
      <div className="min-h-screen bg-[#06070a] flex flex-col items-center justify-center text-white p-4">
        <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center animate-pulse mb-4">
          <ShieldAlert className="h-6 w-6 text-red-500 animate-spin" />
        </div>
        <p className="text-xs font-mono tracking-widest uppercase text-zinc-400">
          Verifying Administrator Clearance...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated State (Not logged in at all)
  if (authStatus === "UNAUTHENTICATED") {
    return (
      <div className="min-h-screen bg-[#06070a] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl bg-[#0a0c13] border border-red-900/40 p-6 sm:p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-600/40 text-red-400 mx-auto flex items-center justify-center">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-red-600/20 text-red-400 border border-red-500/30">
              Authentication Required
            </span>
            <h2 className="text-xl font-black text-white">Administrator Portal Locked</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This area is restricted to authorized BATTLEXA administrators. Please sign in with your administrator credentials.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link href={`/login?returnTo=${encodeURIComponent(pathname)}`}>
              <Button variant="danger" className="w-full text-xs font-bold">
                Admin Sign In
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full text-xs text-zinc-400 hover:text-white">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Return to Public Arena
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Unauthorized State (Logged in as normal PLAYER or ORGANIZER, NOT ADMIN)
  if (authStatus === "UNAUTHORIZED") {
    return (
      <div className="min-h-screen bg-[#06070a] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl bg-[#0a0c13] border border-red-600/50 p-6 sm:p-8 text-center space-y-5 shadow-[0_0_50px_rgba(220,38,38,0.15)] relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-600/40 text-red-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-red-600 text-black">
              403 • ACCESS FORBIDDEN
            </span>
            <h2 className="text-xl font-black text-white">Administrative Clearance Denied</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              You are signed in as <strong className="text-white">{currentUsername}</strong>. This account does not possess master administrative privileges.
            </p>
          </div>

          <div className="p-3 bg-red-950/30 rounded-xl border border-red-900/50 text-[11px] text-red-300 text-left">
            <strong>Security Notice:</strong> Unauthorized attempts to access administrative operations, disputes, or financial payouts are monitored and logged.
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link href="/player/dashboard">
              <Button variant="primary" className="w-full text-xs font-bold">
                Return to Player Dashboard
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full text-xs">
                <LogOut className="h-3.5 w-3.5 mr-1" /> Switch to Admin Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized Admin State
  return (
    <div className="min-h-screen bg-[#06070a] flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-[#0a0c13] border-r border-red-950/40 p-4 space-y-6 shrink-0">
        <div className="px-3 pt-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
              Admin Ops
            </span>
          </div>
          <h2 className="text-lg font-black text-white">Battlexa Authority</h2>
          <span className="text-[10px] font-mono text-zinc-500 block truncate">
            Admin: {currentUsername}
          </span>
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
                    ? "bg-red-600 text-white shadow-lg shadow-red-950/40"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
