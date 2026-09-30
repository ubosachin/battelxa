import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GameLogo } from "@/components/shared/GameLogo";
import { Gamepad2, Trophy, Users, Shield, ArrowRight } from "lucide-react";

export default function GamesPage() {
  return (
    <div className="min-h-screen py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lime-400">
          <Gamepad2 className="h-4 w-4" /> Official Supported Titles
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          Game Arenas & Formats
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
          BATTLEXA provides customized tournament scoring engines, slot management, and credential distribution specifically calibrated for the mobile battle royale ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Free Fire MAX */}
        <div className="rounded-2xl bg-[#0e111a] border border-amber-500/30 overflow-hidden flex flex-col justify-between shadow-2xl shadow-orange-950/20">
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <GameLogo game="free-fire-max" size="lg" variant="badge" />
              <Badge variant="lime">Active Scrims</Badge>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase">
                Free Fire MAX Arena
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Featuring fast-paced 48-player custom lobbies across Bermuda, Purgatory, and Kalahari. Compete in Solo Survival, Duo Fire, or 4v4 Squad Clash.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                <span className="text-zinc-500 block uppercase font-bold text-[10px]">
                  Player Limit
                </span>
                <span className="font-bold text-white text-sm">48 Players / 12 Squads</span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                <span className="text-zinc-500 block uppercase font-bold text-[10px]">
                  Verification ID
                </span>
                <span className="font-bold text-amber-400 text-sm">Free Fire UID (Digits)</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-zinc-400">
              <h4 className="font-bold text-zinc-200 uppercase text-[11px]">
                Supported Formats & Scoring:
              </h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Solo: 1st Place (12 pts) + 1 pt per kill</li>
                <li>Squad: 1st Place (12 pts), 2nd Place (9 pts), 3rd Place (8 pts) + 1 pt per kill</li>
                <li>Strict anti-hack & emulator detection rules enforced</li>
              </ul>
            </div>
          </div>

          <div className="p-6 bg-zinc-900/60 border-t border-zinc-800/80 flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold">
              Daily Scrims starting every hour
            </span>
            <Link href="/tournaments?game=free-fire-max">
              <Button variant="primary" size="sm" className="bg-amber-500 hover:bg-amber-400 text-black border-none font-bold">
                Browse FF Tournaments <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* BGMI */}
        <div className="rounded-2xl bg-[#0e111a] border border-yellow-500/30 overflow-hidden flex flex-col justify-between shadow-2xl shadow-yellow-950/20">
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <GameLogo game="bgmi" size="lg" variant="badge" />
              <Badge variant="lime">Tier 1 & 2 Cups</Badge>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase">
                Battlegrounds Mobile India
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                The flagship tactical battle royale. 100 players parachuting into Erangel and Miramar. Real-time slot locking for 25 squads with timed credential broadcast.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                <span className="text-zinc-500 block uppercase font-bold text-[10px]">
                  Player Limit
                </span>
                <span className="font-bold text-white text-sm">100 Players / 25 Squads</span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                <span className="text-zinc-500 block uppercase font-bold text-[10px]">
                  Verification ID
                </span>
                <span className="font-bold text-cyan-400 text-sm">Character ID (10 Digits)</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-zinc-400">
              <h4 className="font-bold text-zinc-200 uppercase text-[11px]">
                Supported Formats & Scoring:
              </h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>BGIS Standard 10-Point Scoring System</li>
                <li>1st (10 pts), 2nd (6 pts), 3rd (5 pts), 4th (4 pts), 5th (3 pts) + 1 pt / finish</li>
                <li>Screenshot result submission with finish count validation</li>
              </ul>
            </div>
          </div>

          <div className="p-6 bg-zinc-900/60 border-t border-zinc-800/80 flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold">
              National weekend invitationals active
            </span>
            <Link href="/tournaments?game=bgmi">
              <Button variant="primary" size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-black border-none font-bold">
                Browse BGMI Tournaments <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
