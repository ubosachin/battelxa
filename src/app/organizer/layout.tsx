"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  PlusCircle,
  Wallet,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isVerified, setIsVerified] = useState<boolean>(true);

  useEffect(() => {
    async function checkHost() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user?.role === "ORGANIZER") {
            setIsVerified(data.user.isVerifiedOrganizer ?? true);
          }
        }
      } catch {
        // ignore
      }
    }
    checkHost();
  }, []);

  const links = [
    { label: "Organizer Hub", href: "/organizer/dashboard", icon: LayoutDashboard },
    { label: "Host New Cup", href: "/organizer/tournaments/create", icon: PlusCircle },
    { label: "Host Payouts", href: "/organizer/payouts", icon: Wallet },
    { label: "Verification Status", href: "/organizer/apply", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#08090e] flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-[#0c0f18] border-r border-zinc-800/80 p-4 space-y-6 shrink-0">
        <div className="px-3 pt-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-violet-400">
            Host Control
          </span>
          <h2 className="text-lg font-black text-white">Organizer Console</h2>
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
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {!isVerified && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                <span>
                  Your organizer application is currently under admin compliance review. Once approved, you can host tournaments.
                </span>
              </div>
              <Link href="/organizer/apply">
                <button className="underline font-bold text-amber-300 cursor-pointer">
                  View Application
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
