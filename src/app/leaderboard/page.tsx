"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Medal, Loader2, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  userId?: string;
  gamerTag: string;
  game: string;
  earnings: number;
  matchesPlayed: number;
  matchesWon: number;
  kills: number;
  winRate: string;
  rankTitle: string;
}

export default function LeaderboardPage() {
  const [selectedGame, setSelectedGame] = useState<string>("all");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        const res = await fetch(`/api/leaderboard?game=${selectedGame}`);
        if (!res.ok) throw new Error("Failed to load leaderboard");
        const data = await res.json();
        if (isMounted) {
          setLeaderboard(data.leaderboard || []);
        }
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
        if (isMounted) {
          setLeaderboard([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchLeaderboard();
    return () => {
      isMounted = false;
    };
  }, [selectedGame]);

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lime-400">
          <Trophy className="h-4 w-4" /> Hall of Champions
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          Platform Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
          Top esports contenders ranked by verified tournament earnings and battlefield finishes across Free Fire MAX and BGMI.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-zinc-900/80 p-1.5 rounded-xl border border-zinc-800 w-fit">
        <button
          onClick={() => setSelectedGame("all")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            selectedGame === "all"
              ? "bg-violet-600 text-white shadow-lg"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          All Games
        </button>
        <button
          onClick={() => setSelectedGame("free-fire-max")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            selectedGame === "free-fire-max"
              ? "bg-amber-500 text-black shadow-lg"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Free Fire MAX
        </button>
        <button
          onClick={() => setSelectedGame("bgmi")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            selectedGame === "bgmi"
              ? "bg-cyan-500 text-black shadow-lg"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          BGMI
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
            <p className="text-xs text-zinc-400">Loading champion rankings...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-violet-600/20 text-violet-400 mx-auto flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Contender Rankings Yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Leaderboard rankings populate automatically as players compete and secure victories in verified tournaments.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Rank</th>
                  <th className="py-4 px-6">Player / Gamer Tag</th>
                  <th className="py-4 px-6">Game Arena</th>
                  <th className="py-4 px-6">Total Earnings</th>
                  <th className="py-4 px-6">Wins / Matches</th>
                  <th className="py-4 px-6">Total Kills</th>
                  <th className="py-4 px-6">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs text-zinc-200">
                {leaderboard.map((player) => {
                  const isFirst = player.rank === 1;
                  const isSecond = player.rank === 2;
                  const isThird = player.rank === 3;

                  return (
                    <tr
                      key={player.gamerTag + player.rank}
                      className="hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-4 px-6 font-bold">
                        {isFirst ? (
                          <span className="flex items-center gap-1.5 text-amber-400">
                            <Medal className="h-5 w-5" /> #1
                          </span>
                        ) : isSecond ? (
                          <span className="flex items-center gap-1.5 text-zinc-300">
                            <Medal className="h-5 w-5" /> #2
                          </span>
                        ) : isThird ? (
                          <span className="flex items-center gap-1.5 text-amber-600">
                            <Medal className="h-5 w-5" /> #3
                          </span>
                        ) : (
                          <span className="text-zinc-500 pl-2">#{player.rank}</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-800 flex items-center justify-center font-black text-xs text-white">
                            {player.gamerTag.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white block">
                              {player.gamerTag}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {player.rankTitle}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-300">
                          {player.game}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-black text-lime-400 text-sm">
                        {formatCurrency(player.earnings)}
                      </td>

                      <td className="py-4 px-6 text-zinc-300">
                        {player.matchesWon} / {player.matchesPlayed}
                      </td>

                      <td className="py-4 px-6 font-semibold text-white">
                        {player.kills}
                      </td>

                      <td className="py-4 px-6 text-violet-300 font-bold">
                        {player.winRate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
