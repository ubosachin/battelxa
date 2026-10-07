"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import {
  ShieldAlert,
  Users,
  UserCog,
  Trophy,
  Wallet,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Radio,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalTournaments: number;
  activeTournaments: number;
  pendingOrganizers: number;
  pendingPayouts: number;
  pendingDisputes: number;
  totalVolume: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalTournaments: 0,
    activeTournaments: 0,
    pendingOrganizers: 0,
    pendingPayouts: 0,
    pendingDisputes: 0,
    totalVolume: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/stats", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.stats) setStats(data.stats);
        }
      } catch (e) {
        console.error("Failed to load admin stats:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-red-50 via-white to-orange-50 border border-red-200 dark:from-red-950/60 dark:via-[#0e111a] dark:to-zinc-950 dark:border-red-500/30 space-y-1 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
          <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">
            High Security Operations
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Admin Moderation & Governance
        </h1>
        <p className="text-xs text-slate-600 dark:text-zinc-400">
          Oversight over user verification, tournament integrity, financial ledgers, and dispute rulings.
        </p>
      </div>

      {/* Top 4 Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/[0.08] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Volume</span>
            <TrendingUp className="h-4 w-4 text-lime-600 dark:text-lime-400" />
          </div>
          <div className="text-2xl font-black text-lime-600 dark:text-lime-400">
            {isLoading ? "—" : formatCurrency(stats.totalVolume)}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-500">Processed through Razorpay</span>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/[0.08] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Registered Users</span>
            <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {isLoading ? "—" : stats.totalUsers}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-500">Players & Organizers</span>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/[0.08] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Tournaments Hosted</span>
            <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {isLoading ? "—" : stats.totalTournaments}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-500">
            {isLoading ? "Checking active..." : `${stats.activeTournaments} active now`}
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/[0.08] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Pending Payouts</span>
            <Wallet className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {isLoading ? "—" : stats.pendingPayouts}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-500">Awaiting disbursement</span>
        </div>
      </div>

      {/* Action Center Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0e111a] border border-red-200 dark:border-red-500/20 hover:border-red-400 dark:hover:border-red-500/40 transition-all space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <UserCog className="h-4 w-4 text-red-600 dark:text-red-400" /> User Directory
            </h3>
            <span className="px-2 py-0.5 rounded text-xs font-black bg-red-100 text-red-800 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
              Master Control
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            Create users, edit details, update Free Fire / BGMI IDs, adjust wallet funds, and ban suspicious accounts.
          </p>
          <Link href="/admin/users" className="block">
            <Button variant="danger" size="sm" className="w-full">
              Manage Users <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/[0.08] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Organizer Applications</h3>
            <span className="px-2 py-0.5 rounded text-xs font-black bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
              {stats.pendingOrganizers} Pending
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            Review applicant hosting credentials, verify community background, and grant organizer badges.
          </p>
          <Link href="/admin/organizers" className="block">
            <Button variant="secondary" size="sm" className="w-full">
              Review Hosts <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/[0.08] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Prize & Revenue Payouts</h3>
            <span className="px-2 py-0.5 rounded text-xs font-black bg-lime-100 text-lime-900 border border-lime-300 dark:bg-lime-950 dark:text-lime-400 dark:border-lime-800">
              {stats.pendingPayouts} To Disburse
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            Verify recipient UPI VPAs and NEFT bank account details before releasing locked balances.
          </p>
          <Link href="/admin/payouts" className="block">
            <Button variant="lime" size="sm" className="w-full">
              Process Disbursements <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/[0.08] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Referee Dispute Desk</h3>
            <span className="px-2 py-0.5 rounded text-xs font-black bg-red-100 text-red-800 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
              {stats.pendingDisputes} Open
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            Inspect match scoreboard screenshots and gameplay recordings for emulator or teaming infractions.
          </p>
          <Link href="/admin/disputes" className="block">
            <Button variant="secondary" size="sm" className="w-full">
              Open Dispute Portal <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Broadcast Dispatch Hub Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-50 via-white to-lime-50 border border-violet-200 dark:from-violet-950/40 dark:via-[#0e111a] dark:to-lime-950/20 dark:border-violet-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-violet-600 dark:text-violet-400 animate-pulse" />
            <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">
              Emergency & Match Alert Hub
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Broadcast to Discord Embed & Email
          </h3>
          <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-2xl">
            Dispatch urgent match updates, custom lobby Room ID & Password, schedule changes, or slot allocations directly to all registered participants with Discord rich embeds and dark gaming HTML emails.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/admin/tournaments">
            <Button variant="lime" size="sm">
              <Radio className="h-3.5 w-3.5 mr-1 text-black" />
              Manage & Broadcast Tournaments
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
