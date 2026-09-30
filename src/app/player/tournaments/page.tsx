"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Trophy, Clock, Lock, ExternalLink, Calendar } from "lucide-react";

export default function PlayerTournamentsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTournaments() {
      try {
        const res = await fetch("/api/player/tournaments");
        if (res.ok) {
          const data = await res.json();
          setRegistrations(data.registrations || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadTournaments();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            My Registered Tournaments
          </h1>
          <p className="text-xs text-zinc-400">
            View your allocated slots, room credential release timers, and match history.
          </p>
        </div>
        <Link href="/tournaments">
          <Button variant="lime" size="sm">
            Find New Battleground
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-zinc-400 text-xs">
          Loading tournaments...
        </div>
      ) : registrations.length === 0 ? (
        <div className="rounded-2xl bg-[#0e111a] border border-zinc-800 p-10 text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-zinc-800 text-zinc-400">
            <Trophy className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-white text-base">No Active Registrations</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            You haven't joined any tournament cups yet. Pick a Free Fire MAX or BGMI battleground to get started!
          </p>
          <Link href="/tournaments">
            <Button variant="lime" size="sm">
              Explore Available Tournaments
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {registrations.map((reg) => {
            const t = reg.tournamentId || {};
            const isFF = t.gameSlug === "free-fire-max";
            return (
              <div
                key={reg._id}
                className="rounded-xl bg-[#0e111a] border border-white/[0.08] p-5 space-y-4 hover:border-violet-500/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        isFF ? "bg-amber-500 text-black" : "bg-cyan-400 text-black"
                      }`}
                    >
                      {t.gameName || (isFF ? "Free Fire MAX" : "BGMI")}
                    </span>
                    <h3 className="font-bold text-base text-white mt-1.5 line-clamp-1">
                      {t.title || "Custom Esports Arena Match"}
                    </h3>
                  </div>
                  <Badge variant="lime">Slot #{reg.slotNumber}</Badge>
                </div>

                <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      <Clock className="h-3.5 w-3.5 text-violet-400" /> Start Time:
                    </span>
                    <span className="font-semibold">
                      {t.startTime ? formatDate(t.startTime) : "Scheduled Soon"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="text-zinc-400">Status:</span>
                    <span className="font-bold text-lime-400">{t.status || "CONFIRMED"}</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">
                    Registered: {formatDate(reg.registeredAt)}
                  </span>
                  <Link href={`/tournaments/${t._id || reg.tournamentId}`}>
                    <Button size="sm" variant="secondary">
                      Room Details <ExternalLink className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
