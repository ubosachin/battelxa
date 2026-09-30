"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { Ban } from "lucide-react";

interface AdminTournamentItem {
  _id: string;
  title: string;
  gameName: string;
  prizePool: number;
  registeredSlots: number;
  maxSlots: number;
  status: string;
}

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<AdminTournamentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadTournaments() {
      try {
        const res = await fetch("/api/tournaments?limit=50");
        if (isMounted && res.ok) {
          const data = await res.json();
          setTournaments(data.tournaments || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadTournaments();
    return () => {
      isMounted = false;
    };
  }, [refreshIndex]);

  const handleCancelTournament = async (id: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to cancel "${title}"? This will execute automated refunds to all registered players.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/tournaments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (res.ok) {
        setRefreshIndex((prev) => prev + 1);
      } else {
        alert("Failed to cancel tournament");
      }
    } catch {
      alert("Network error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Tournament Moderation & Supervision
        </h1>
        <p className="text-xs text-zinc-400">
          Supervise active battlegrounds, investigate complaints, and intervene when fair play guidelines are breached.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-zinc-400">Loading tournaments...</div>
      ) : (
        <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Game</th>
                  <th className="py-3 px-4">Prize Pool</th>
                  <th className="py-3 px-4">Slots</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {tournaments.map((t) => (
                  <tr key={t._id} className="hover:bg-zinc-800/30">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {t.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-zinc-900 border border-zinc-800 text-zinc-300">
                        {t.gameName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-lime-400">
                      {formatCurrency(t.prizePool)}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">
                      {t.registeredSlots} / {t.maxSlots}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="lime" className="text-[9px]">
                        {t.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/tournaments/${t._id}`} target="_blank">
                          <Button size="sm" variant="secondary">
                            View
                          </Button>
                        </Link>
                        {t.status !== "CANCELLED" && t.status !== "COMPLETED" && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleCancelTournament(t._id, t.title)}
                          >
                            <Ban className="h-3 w-3 mr-1" /> Force Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
