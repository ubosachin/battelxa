"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  Trophy,
  Wallet,
  AlertTriangle,
  FileText,
  Sliders,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean>(true);

  useEffect(() => {
    async function checkAdminAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user?.role !== "ADMIN") {
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
    }
    checkAdminAuth();
  }, [router]);

  const links = [
    { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Organizer Approval", href: "/admin/organizers", icon: Users },
    { label: "Payout Clearance", href: "/admin/payouts", icon: Wallet },
    { label: "Tournament Moderation", href: "/admin/tournaments", icon: Trophy },
    { label: "Dispute Resolution", href: "/admin/disputes", icon: AlertTriangle },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
  ];

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
          {!isAdmin && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-600/40 text-red-200 text-xs flex items-center justify-between">
              <span>
                Administrative authorization required. Sign in as Admin to perform privileged operations.
              </span>
              <Link href="/login">
                <button className="underline font-bold text-white cursor-pointer">
                  Switch Account
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
