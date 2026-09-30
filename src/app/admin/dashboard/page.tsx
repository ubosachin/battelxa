"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import {
  ShieldAlert,
  Users,
  Trophy,
  Wallet,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
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
    totalUsers: 240,
    totalTournaments: 48,
    activeTournaments: 6,
    pendingOrganizers: 3,
    pendingPayouts: 2,
    pendingDisputes: 1,
    totalVolume: 350000,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          if (data.stats) setStats(data.stats);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950/60 via-[#0e111a] to-zinc-950 border border-red-500/30 space-y-1">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-400" />
          <span className="text-xs font-bold text-red-400 uppercase tracking-widest">
            High Security Operations
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Admin Moderation & Governance
        </h1>
        <p className="text-xs text-zinc-400">
          Oversight over user verification, tournament integrity, financial ledgers, and dispute rulings.
        </p>
      </div>

      {/* Top 4 Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#0e111a] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Volume</span>
            <TrendingUp className="h-4 w-4 text-lime-400" />
          </div>
          <div className="text-2xl font-black text-lime-400">
            {formatCurrency(stats.totalVolume)}
          </div>
          <div className="text-[11px] text-zinc-500">Processed through Razorpay</div>
        </div>

        <div className="p-5 rounded-xl bg-[#0e111a] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Registered Users</span>
            <Users className="h-4 w-4 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.totalUsers}</div>
          <div className="text-[11px] text-zinc-500">Players & Organizers</div>
        </div>

        <div className="p-5 rounded-xl bg-[#0e111a] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Tournaments Hosted</span>
            <Trophy className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats.totalTournaments}
          </div>
          <div className="text-[11px] text-zinc-500">
            {stats.activeTournaments} active now
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#0e111a] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Pending Payouts</span>
            <Wallet className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {stats.pendingPayouts}
          </div>
          <div className="text-[11px] text-zinc-500">Awaiting bank transfer</div>
        </div>
      </div>

      {/* Action Center Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#0e111a] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Organizer Applications</h3>
            <span className="px-2 py-0.5 rounded text-xs font-black bg-amber-950 text-amber-300 border border-amber-800">
              {stats.pendingOrganizers} Pending
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Review applicant hosting credentials, verify community background, and grant organizer badges.
          </p>
          <Link href="/admin/organizers" className="block">
            <Button variant="secondary" size="sm" className="w-full">
              Review Hosts <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-[#0e111a] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Prize & Revenue Payouts</h3>
            <span className="px-2 py-0.5 rounded text-xs font-black bg-lime-950 text-lime-400 border border-lime-800">
              {stats.pendingPayouts} To Disburse
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Verify recipient UPI VPAs and NEFT bank account details before releasing locked balances.
          </p>
          <Link href="/admin/payouts" className="block">
            <Button variant="lime" size="sm" className="w-full">
              Process Disbursements <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-[#0e111a] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Referee Dispute Desk</h3>
            <span className="px-2 py-0.5 rounded text-xs font-black bg-red-950 text-red-300 border border-red-800">
              {stats.pendingDisputes} Open
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Inspect match scoreboard screenshots and gameplay recordings for emulator or teaming infractions.
          </p>
          <Link href="/admin/disputes" className="block">
            <Button variant="secondary" size="sm" className="w-full">
              Open Dispute Portal <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
