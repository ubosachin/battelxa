import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { GameLogo } from "@/components/shared/GameLogo";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Trophy, Users, Clock, Flame, ShieldCheck } from "lucide-react";

export interface TournamentCardData {
  _id: string;
  title: string;
  gameSlug: string;
  gameName: string;
  format: "SOLO" | "DUO" | "SQUAD";
  type: "FREE" | "PAID" | "PRACTICE";
  entryFee: number;
  prizePool: number;
  maxSlots: number;
  registeredSlots: number;
  status: string;
  startTime: string | Date;
  organizerName?: string;
  isFeatured?: boolean;
}

export function TournamentCard({ tournament }: { tournament: TournamentCardData }) {
  const isFree = tournament.entryFee === 0 || tournament.type === "FREE";
  const slotPercentage = Math.min(
    100,
    Math.round((tournament.registeredSlots / tournament.maxSlots) * 100)
  );

  const statusVariant = (status: string) => {
    switch (status) {
      case "LIVE":
        return { variant: "red" as const, label: "Live Now", pulse: true };
      case "CHECK_IN":
        return { variant: "amber" as const, label: "Check-in Open", pulse: true };
      case "REGISTRATION_OPEN":
        return { variant: "lime" as const, label: "Registration Open", pulse: false };
      case "REGISTRATION_CLOSED":
        return { variant: "zinc" as const, label: "Reg. Closed", pulse: false };
      case "COMPLETED":
        return { variant: "zinc" as const, label: "Finished", pulse: false };
      default:
        return { variant: "violet" as const, label: status, pulse: false };
    }
  };

  const statusInfo = statusVariant(tournament.status);
  const isFreeFire = tournament.gameSlug === "free-fire-max";

  return (
    <div className="group relative rounded-xl bg-[#0e111a] border border-white/[0.08] hover:border-violet-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-950/20 flex flex-col justify-between overflow-hidden">
      {/* Top Banner Accent with Proper Game Logo */}
      <div
        className={`h-28 w-full relative flex items-start justify-between p-3 bg-gradient-to-br ${
          isFreeFire
            ? "from-[#450a0a]/90 via-[#7c2d12]/70 to-[#0e111a]"
            : "from-[#451a03]/90 via-[#1e293b]/90 to-[#0e111a]"
        }`}
      >
        {/* Game Icon Tag with Proper Official Logo */}
        <div className="flex items-center gap-1.5 z-10">
          <GameLogo
            game={tournament.gameSlug}
            variant="badge"
            size="sm"
            className="bg-black/85 backdrop-blur-md border border-white/10"
          />
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-black/85 text-zinc-300 border border-white/10 uppercase backdrop-blur-md">
            {tournament.format}
          </span>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-1.5 z-10">
          {tournament.isFeatured && (
            <div className="flex items-center gap-1 bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
              <Flame className="h-3 w-3 fill-white" /> Featured
            </div>
          )}
          <Badge variant={statusInfo.variant} pulse={statusInfo.pulse}>
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-base text-white group-hover:text-violet-300 transition-colors line-clamp-1">
            {tournament.title}
          </h3>
          <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-lime-400" />
            Hosted by{" "}
            <span className="text-zinc-200 font-medium">
              {tournament.organizerName || "Verified Partner"}
            </span>
          </p>
        </div>

        {/* Prize Pool and Entry Fee */}
        <div className="grid grid-cols-2 gap-2 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/80">
          <div>
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Prize Pool
            </span>
            <span className="text-sm font-black text-lime-400 flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5" />
              {formatCurrency(tournament.prizePool)}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Entry Fee
            </span>
            <span
              className={`text-sm font-bold ${
                isFree ? "text-lime-400 uppercase font-black" : "text-white"
              }`}
            >
              {isFree ? "Free Entry" : formatCurrency(tournament.entryFee)}
            </span>
          </div>
        </div>

        {/* Slots & Timing */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-zinc-500" /> Slots Filled
            </span>
            <span className="font-bold text-zinc-200">
              {tournament.registeredSlots}/{tournament.maxSlots}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                slotPercentage >= 90 ? "bg-red-500" : "bg-lime-500"
              }`}
              style={{ width: `${slotPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-violet-400" /> Match Date
            </span>
            <span className="font-medium text-zinc-300">
              {formatDate(tournament.startTime)}
            </span>
          </div>
        </div>

        {/* View / Join Button */}
        <Link href={`/tournaments/${tournament._id}`} className="block w-full pt-1">
          <button className="w-full py-2.5 px-4 rounded-lg bg-zinc-800 group-hover:bg-violet-600 text-zinc-100 group-hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer">
            View & Enter Arena
          </button>
        </Link>
      </div>
    </div>
  );
}
