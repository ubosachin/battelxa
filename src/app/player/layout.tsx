"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Wallet,
  User,
  Bell,
  HelpCircle,
} from "lucide-react";

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const links = [
    { label: "Overview", href: "/player/dashboard", icon: LayoutDashboard },
    { label: "My Tournaments", href: "/player/tournaments", icon: Trophy },
    { label: "My Squads", href: "/player/teams", icon: Users },
    { label: "Wallet & Payouts", href: "/player/wallet", icon: Wallet },
    { label: "Gamer Profile", href: "/player/profile", icon: User },
    { label: "Notifications", href: "/player/notifications", icon: Bell },
    { label: "Disputes & Support", href: "/player/support", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-[#08090e] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0c0f18] border-r border-zinc-800/80 p-4 space-y-6 shrink-0">
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
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
