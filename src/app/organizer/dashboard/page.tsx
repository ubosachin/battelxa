"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Trophy,
  Users,
  Plus,
  Settings,
  Flame,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";

interface OrganizerTournamentItem {
  _id: string;
  title: string;
  gameSlug: string;
  gameName: string;
  format: string;
  status: string;
  entryFee: number;
  prizePool: number;
  maxSlots: number;
  registeredSlots: number;
  startTime: string;
}

export default function OrganizerDashboard() {
  const [tournaments, setTournaments] = useState<OrganizerTournamentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrganizerTournaments() {
      try {
        const res = await fetch("/api/tournaments?limit=20");
        if (res.ok) {
          const data = await res.json();
          setTournaments(data.tournaments || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrganizerTournaments();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-violet-950/70 via-[#0e111a] to-zinc-950 border border-violet-500/30">
        <div>
          <span className="text-xs font-bold text-lime-400 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" /> Verified Tournament Host
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
            Organizer Command Center
          </h1>
          <p className="text-xs text-zinc-400">
            Publish Free Fire MAX and BGMI tournaments, distribute room credentials, and verify match scorecards.
          </p>
        </div>

        <Link href="/organizer/tournaments/create">
          <Button variant="lime" size="lg">
            <Plus className="h-4 w-4 mr-1 text-black" /> Create New Tournament
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#0e111a] border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Total Cups Hosted
          </span>
          <div className="text-2xl font-black text-white">12</div>
          <span className="text-[11px] text-zinc-500">Free Fire & BGMI</span>
        </div>

        <div className="p-5 rounded-xl bg-[#0e111a] border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Total Prize Distributed
          </span>
          <div className="text-2xl font-black text-lime-400">₹85,000</div>
          <span className="text-[11px] text-zinc-500">100% verified</span>
        </div>

        <div className="p-5 rounded-xl bg-[#0e111a] border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Active Gladiators
          </span>
          <div className="text-2xl font-black text-violet-400">480+</div>
          <span className="text-[11px] text-zinc-500">Across lobbies</span>
        </div>

        <div className="p-5 rounded-xl bg-[#0e111a] border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Host Rating
          </span>
          <div className="text-2xl font-black text-amber-400">4.9 / 5.0</div>
          <span className="text-[11px] text-zinc-500">Verified by players</span>
        </div>
      </div>

      {/* Hosted Tournaments Management List */}
      <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-white uppercase tracking-tight flex items-center gap-2">
            <Trophy className="h-4 w-4 text-lime-400" /> My Tournament Arenas
          </h3>
          <Link href="/organizer/tournaments/create">
            <Button size="sm" variant="outline">
              <Plus className="h-3.5 w-3.5 mr-1" /> Host Another Cup
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-zinc-400">Loading tournaments...</div>
        ) : tournaments.length === 0 ? (
          <div className="py-10 text-center text-xs text-zinc-500">
            No tournaments created yet. Click &quot;Create New Tournament&quot; above.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {tournaments.map((t) => (
              <div
                key={t._id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-zinc-900 border border-zinc-800 text-zinc-300">
                      {t.gameName}
                    </span>
                    <Badge variant="violet">{t.format}</Badge>
                    <Badge variant="lime">{t.status}</Badge>
                  </div>
                  <h4 className="font-bold text-sm text-white">{t.title}</h4>
                  <p className="text-[11px] text-zinc-400">
                    Prize Pool: <strong className="text-lime-400">{formatCurrency(t.prizePool)}</strong> • Slots: {t.registeredSlots}/{t.maxSlots} • Kickoff: {formatDate(t.startTime)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/organizer/tournaments/${t._id}/manage`}>
                    <Button size="sm" variant="secondary">
                      <Settings className="h-3.5 w-3.5 mr-1 text-violet-400" /> Manage & Room ID
                    </Button>
                  </Link>
                  <Link href={`/organizer/tournaments/${t._id}/matches`}>
                    <Button size="sm" variant="primary">
                      Score & Results
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
