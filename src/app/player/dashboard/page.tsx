"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Wallet,
  Trophy,
  Target,
  Flame,
  ArrowRight,
  Clock,
  Shield,
  PlusCircle,
  Users,
} from "lucide-react";

export default function PlayerDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [authRes, walletRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/wallet"),
        ]);

        const authData = authRes.ok ? await authRes.json() : null;
        const walletData = walletRes.ok ? await walletRes.json() : null;

        setData({
          user: authData?.user,
          profile: authData?.profile,
          wallet: walletData?.wallet,
          transactions: walletData?.transactions || [],
        });
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-zinc-400">
        <div className="inline-block animate-spin h-6 w-6 border-2 border-violet-500 border-t-transparent rounded-full mb-3" />
        <p className="text-xs font-semibold">Loading Contender Dashboard...</p>
      </div>
    );
  }

  const wallet = data?.wallet || { balance: 50, lockedBalance: 0, totalWon: 0 };
  const profile = data?.profile || {
    matchesPlayed: 14,
    matchesWon: 4,
    totalKills: 58,
    earnings: 2400,
    rankTitle: "Elite Striker",
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-violet-950/70 via-[#0e111a] to-zinc-950 border border-violet-500/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-lime-400 uppercase tracking-widest">
              Online & Ready
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Welcome Back, {data?.user?.username || "Warrior"}
          </h1>
          <p className="text-xs text-zinc-400">
            Current Tier: <strong className="text-violet-300">{profile.rankTitle || "Rookie Contender"}</strong> • Free Fire & BGMI Competitive Status: Active
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/tournaments">
            <Button variant="lime" size="sm">
              <Flame className="h-4 w-4 mr-1 text-black" /> Browse Tournaments
            </Button>
          </Link>
          <Link href="/player/wallet">
            <Button variant="outline" size="sm">
              <Wallet className="h-4 w-4 mr-1 text-lime-400" /> Wallet Hub
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 4 Stat Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wallet Balance */}
        <div className="p-5 rounded-xl bg-[#0e111a] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Arena Balance</span>
            <Wallet className="h-4 w-4 text-lime-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {formatCurrency(wallet.balance)}
          </div>
          <div className="text-[11px] text-zinc-500 flex items-center justify-between">
            <span>Locked: {formatCurrency(wallet.lockedBalance)}</span>
            <Link href="/player/wallet" className="text-violet-400 hover:underline">
              Top Up
            </Link>
          </div>
        </div>

        {/* Total Won */}
        <div className="p-5 rounded-xl bg-[#0e111a] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Prize Money Won</span>
            <Trophy className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-lime-400">
            {formatCurrency(profile.earnings || wallet.totalWon || 0)}
          </div>
          <div className="text-[11px] text-zinc-500">
            From {profile.matchesWon || 0} victorious cups
          </div>
        </div>

        {/* Total Matches */}
        <div className="p-5 rounded-xl bg-[#0e111a] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Battles Fought</span>
            <Target className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {profile.matchesPlayed || 0}
          </div>
          <div className="text-[11px] text-zinc-500">
            Win rate: {profile.matchesPlayed ? Math.round((profile.matchesWon / profile.matchesPlayed) * 100) : 0}%
          </div>
        </div>

        {/* Total Kills */}
        <div className="p-5 rounded-xl bg-[#0e111a] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Finishes</span>
            <Flame className="h-4 w-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {profile.totalKills || 0}
          </div>
          <div className="text-[11px] text-zinc-500">
            Average K/D: {profile.matchesPlayed ? (profile.totalKills / profile.matchesPlayed).toFixed(1) : 0}
          </div>
        </div>
      </div>

      {/* Upcoming Active Tournaments & Credentials Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white uppercase tracking-tight flex items-center gap-2">
              <Clock className="h-4 w-4 text-violet-400" /> Next Scheduled Matches
            </h3>
            <Link
              href="/player/tournaments"
              className="text-xs font-semibold text-violet-400 hover:text-violet-300"
            >
              View all joined <ArrowRight className="h-3 w-3 inline" />
            </Link>
          </div>

          <div className="rounded-xl bg-[#0e111a] border border-white/[0.08] p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black">
                  Free Fire MAX
                </span>
                <h4 className="font-bold text-base text-white mt-1.5">
                  Bermuda Warzone Masters Cup
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Kickoff: Today at 8:00 PM IST • Format: Squad
                </p>
              </div>
              <Badge variant="lime">Slot #4 Confirmed</Badge>
            </div>

            <div className="p-3.5 bg-zinc-900 rounded-lg border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-semibold text-zinc-300">Room Credentials Status:</span>
                <p className="text-[11px] text-zinc-500">
                  Custom room ID & password unlock 15 minutes prior to match start.
                </p>
              </div>
              <Link href="/player/tournaments">
                <Button size="sm" variant="outline">
                  Open Match Room Vault
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Squad & Profile Panel */}
        <div className="space-y-4">
          <h3 className="font-bold text-base text-white uppercase tracking-tight flex items-center gap-2">
            <Shield className="h-4 w-4 text-lime-400" /> In-Game Identities
          </h3>

          <div className="rounded-xl bg-[#0e111a] border border-white/[0.08] p-5 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2.5 border-b border-zinc-800">
              <span className="text-zinc-400">Free Fire UID:</span>
              <span className="font-mono font-bold text-amber-400">
                {profile.freeFireId || "Not Linked"}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2.5 border-b border-zinc-800">
              <span className="text-zinc-400">BGMI Character ID:</span>
              <span className="font-mono font-bold text-cyan-400">
                {profile.bgmiId || "Not Linked"}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2.5 border-b border-zinc-800">
              <span className="text-zinc-400">Gamer Tag:</span>
              <span className="font-bold text-white">
                {profile.gamerTag || data?.user?.username}
              </span>
            </div>

            <Link href="/player/profile" className="block pt-1">
              <Button variant="secondary" size="sm" className="w-full">
                Edit Game IDs & Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
