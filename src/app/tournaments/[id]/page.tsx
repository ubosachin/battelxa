"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { RoomCredentialsCard } from "@/components/tournament/RoomCredentialsCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Trophy,
  Users,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import { GameLogo } from "@/components/shared/GameLogo";

interface PrizeItem {
  rank: number;
  amount: number;
  percentage?: number;
}

interface TournamentDetail {
  _id: string;
  title: string;
  description?: string;
  gameSlug: string;
  gameName?: string;
  format: string;
  type: string;
  entryFee: number;
  prizePool: number;
  maxSlots: number;
  registeredSlots: number;
  startTime: string;
  registrationDeadline: string;
  status: string;
  rules?: string;
  streamUrl?: string;
  region?: string;
  firstPlacePrize?: number;
  killPrize?: number;
  bannerUrl?: string;
  roomReleaseTime?: string;
  roomId?: string;
  roomPassword?: string;
  prizeBreakdown?: PrizeItem[];
  organizerId?: {
    username?: string;
    organizationName?: string;
  };
  roomCredentials?: {
    roomId?: string;
    password?: string;
    notes?: string;
    releaseTime?: string;
  };
}

interface RegistrationItem {
  _id: string;
  slotNumber: number;
  gamerTag?: string;
  inGameId?: string;
  teamName?: string;
  status: string;
  members?: Array<{ gamerTag?: string; inGameId?: string }>;
}

export default function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [tournament, setTournament] = useState<TournamentDetail | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [userSlotNumber, setUserSlotNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Registration modal states
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [inGameId, setInGameId] = useState<string>("");
  const [inGameName, setInGameName] = useState<string>("");
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string>("");
  const [joinSuccess, setJoinSuccess] = useState<string>("");

  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadTournamentData() {
      try {
        const res = await fetch(`/api/tournaments/${id}`);
        if (isMounted && res.ok) {
          const data = await res.json();
          setTournament(data.tournament);
          setRegistrations(data.registrations || []);
          setIsRegistered(data.isUserRegistered);
          setUserSlotNumber(data.userSlotNumber);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadTournamentData();
    return () => {
      isMounted = false;
    };
  }, [id, refreshIndex]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError("");
    setJoinSuccess("");

    if (!inGameId.trim()) {
      setJoinError("In-Game ID / UID is strictly required for tournament entry.");
      return;
    }

    try {
      setIsJoining(true);
      const res = await fetch(`/api/tournaments/${id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inGameId: inGameId.trim(),
          inGameName: inGameName.trim() || undefined,
          registrationType: tournament?.format || "SOLO",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setJoinError(data.error || "Failed to register for tournament");
        return;
      }

      setJoinSuccess(`Slot #${data.registration.slotNumber} secured successfully!`);
      setIsRegistered(true);
      setUserSlotNumber(data.registration.slotNumber);

      // Trigger confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        setIsJoinModalOpen(false);
        setRefreshIndex((prev) => prev + 1);
      }, 1500);
    } catch {
      setJoinError("Network error. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-zinc-400">
        <div className="inline-block animate-spin h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full mb-4" />
        <p className="text-sm font-semibold">Loading tournament battlefield...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h2 className="text-2xl font-black text-white">Tournament Not Found</h2>
        <p className="text-xs text-zinc-400">
          This tournament arena does not exist or may have been deleted.
        </p>
        <Link href="/tournaments">
          <Button variant="outline">Back to Tournaments</Button>
        </Link>
      </div>
    );
  }

  const isFull = tournament.registeredSlots >= tournament.maxSlots;
  const isFree = tournament.entryFee === 0 || tournament.type === "FREE";
  const isFF = tournament.gameSlug === "free-fire-max";

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Back Button */}
      <Link
        href="/tournaments"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Tournaments
      </Link>

      {/* Header Banner Card */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0e111a] via-[#141824] to-[#0e111a] border border-white/[0.08] p-6 lg:p-8 overflow-hidden space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GameLogo
              game={tournament.gameSlug}
              variant="badge"
              size="md"
              className="bg-black/80 backdrop-blur-md"
            />
            <Badge variant="violet">{tournament.format}</Badge>
            <Badge variant="zinc">{tournament.type}</Badge>
            <Badge variant="lime" pulse={tournament.status === "LIVE"}>
              {tournament.status}
            </Badge>
          </div>

          {/* Registration Status Pill */}
          {isRegistered && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-lime-500/40 text-xs font-bold text-lime-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Registered • Slot #{userSlotNumber}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            {tournament.title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-lime-400" />
            Hosted by{" "}
            <span className="text-zinc-200 font-semibold">
              {tournament.organizerId?.username || "Verified Host"}
            </span>{" "}
            • Region: {tournament.region}
          </p>
        </div>

        {/* Vital Info Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Total Prize Pool
            </span>
            <span className="text-xl font-black text-lime-400 flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              {formatCurrency(tournament.prizePool)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Entry Fee
            </span>
            <span className="text-xl font-black text-white">
              {isFree ? "FREE ENTRY" : formatCurrency(tournament.entryFee)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Slots Capacity
            </span>
            <span className="text-xl font-bold text-zinc-200">
              {tournament.registeredSlots} / {tournament.maxSlots}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Match Kickoff
            </span>
            <span className="text-sm font-bold text-violet-300">
              {formatDate(tournament.startTime)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          {!isRegistered ? (
            <Button
              size="lg"
              variant={isFull ? "secondary" : "lime"}
              disabled={isFull || tournament.status !== "REGISTRATION_OPEN"}
              onClick={() => setIsJoinModalOpen(true)}
              className="w-full sm:w-auto"
            >
              {isFull
                ? "Slots Full"
                : tournament.status !== "REGISTRATION_OPEN"
                ? `Registration ${tournament.status}`
                : isFree
                ? "Join Tournament (Free)"
                : `Enter Arena (₹${tournament.entryFee})`}
            </Button>
          ) : (
            <div className="text-xs text-lime-400 font-bold bg-lime-950/30 border border-lime-800/40 px-4 py-2.5 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> You are confirmed in this tournament. Scroll down for match credentials.
            </div>
          )}

          <div className="text-xs text-zinc-400">
            Registration closes: <strong className="text-zinc-200">{formatDate(tournament.registrationDeadline)}</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Details + Credentials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3): Credentials, Rules, Joined Rosters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Room Credentials Card */}
          <RoomCredentialsCard
            tournamentId={tournament._id}
            isRegistered={isRegistered}
            releaseTime={tournament.roomCredentials?.releaseTime || tournament.startTime}
            initialRoomId={tournament.roomCredentials?.roomId}
            initialPassword={tournament.roomCredentials?.password}
          />

          {/* Tournament Rules & Regulations */}
          <div className="rounded-xl bg-[#0e111a] border border-white/[0.08] p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-violet-400" /> Rules & Format Guidelines
            </h3>
            <div className="prose prose-invert max-w-none text-xs text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
              {tournament.rules || "Standard esports tournament rules apply. No emulator players allowed. Team teaming with opponents will lead to immediate disqualification."}
            </div>
          </div>

          {/* Registered Slots & Squads */}
          <div className="rounded-xl bg-[#0e111a] border border-white/[0.08] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-lime-400" /> Registered Gladiators ({registrations.length})
              </h3>
              <span className="text-xs text-zinc-500">
                {tournament.maxSlots - registrations.length} slots remaining
              </span>
            </div>

            {registrations.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-4">
                No players registered yet. Be the first to claim Slot #1!
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {registrations.map((reg) => (
                  <div
                    key={reg._id}
                    className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-violet-400 block">
                        Slot #{reg.slotNumber}
                      </span>
                      <span className="font-semibold text-zinc-200">
                        {reg.teamName || reg.members?.[0]?.gamerTag || "Warrior"}
                      </span>
                    </div>
                    <Badge variant="zinc" className="text-[9px]">
                      {reg.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3): Prize Breakdown & Organizer Info */}
        <div className="space-y-6">
          {/* Prize Breakdown Table */}
          <div className="rounded-xl bg-[#0e111a] border border-white/[0.08] p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="h-4 w-4 text-lime-400" /> Prize Distribution
            </h3>

            <div className="space-y-2">
              {tournament.prizeBreakdown && tournament.prizeBreakdown.length > 0 ? (
                tournament.prizeBreakdown.map((p: PrizeItem) => (
                  <div
                    key={p.rank}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs"
                  >
                    <span className="font-bold text-zinc-300">
                      Rank #{p.rank}
                    </span>
                    <div className="text-right">
                      <span className="font-black text-lime-400 block">
                        {formatCurrency(p.amount)}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {p.percentage}% of pool
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-zinc-500 p-2 text-center">
                  Practice Scrim • Recognition & Leaderboard Points
                </div>
              )}
            </div>
          </div>

          {/* Organizer Card */}
          <div className="rounded-xl bg-[#0e111a] border border-white/[0.08] p-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Host Organization
            </h4>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-violet-900/50 flex items-center justify-center text-sm font-bold text-violet-300 border border-violet-700/50">
                {(tournament.organizerId?.username || "B").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h5 className="font-bold text-sm text-white">
                  {tournament.organizerId?.username || "Battlexa Host"}
                </h5>
                <p className="text-[11px] text-lime-400 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="h-3 w-3" /> Verified Organizer
                </p>
              </div>
            </div>
          </div>

          {/* Dispute Link */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/30 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <AlertTriangle className="h-4 w-4" /> Need referee assistance?
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              If an issue occurs during custom room lobby or scoring, players can raise an official dispute with match evidence.
            </p>
            <Link href="/player/support">
              <button className="text-xs font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer">
                Submit Dispute or Ticket
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Join Tournament Modal */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title="Confirm Tournament Registration"
        description={`Lock your slot for ${tournament.title}`}
      >
        <form onSubmit={handleRegister} className="space-y-4">
          {joinError && <Alert variant="error">{joinError}</Alert>}
          {joinSuccess && <Alert variant="success">{joinSuccess}</Alert>}

          <Input
            label={isFF ? "Free Fire UID (Character ID)" : "BGMI Character ID"}
            placeholder={isFF ? "e.g. 1928475920" : "e.g. 5183920194"}
            value={inGameId}
            onChange={(e) => setInGameId(e.target.value)}
            helperText="Make sure this matches your exact in-game account. Room kicks occur if UID differs."
            required
          />

          <Input
            label="In-Game Name / Gamer Tag"
            placeholder="e.g. VORTEX_SNIPER"
            value={inGameName}
            onChange={(e) => setInGameName(e.target.value)}
          />

          <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-400">Entry Fee:</span>
              <span className="font-bold text-white">
                {isFree ? "Free (₹0)" : formatCurrency(tournament.entryFee)}
              </span>
            </div>
            {!isFree && (
              <p className="text-[11px] text-zinc-500">
                Entry fee will be deducted directly from your BATTLEXA arena wallet.
              </p>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsJoinModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="lime"
              isLoading={isJoining}
            >
              Confirm & Lock Slot
            </Button>
          </div>
        </form>
      </Modal>

      {/* Mobile Sticky Quick Join Bar */}
      <div className="md:hidden fixed bottom-14 inset-x-0 z-30 bg-[#0c0f18]/95 backdrop-blur-xl border-t border-white/10 p-3 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
            {isFree ? "Free Entry" : `₹${tournament.entryFee} Entry`}
          </span>
          <div className="text-sm font-extrabold text-lime-400">
            ₹{(tournament.prizePool || 0).toLocaleString()} Pool
          </div>
        </div>

        {!isRegistered ? (
          <Button
            size="sm"
            variant={isFull ? "secondary" : "lime"}
            disabled={isFull || tournament.status !== "REGISTRATION_OPEN"}
            onClick={() => setIsJoinModalOpen(true)}
            className="px-5 py-2 font-bold text-xs"
          >
            {isFull
              ? "Full"
              : tournament.status !== "REGISTRATION_OPEN"
              ? "Closed"
              : isFree
              ? "Join Free"
              : `Join (₹${tournament.entryFee})`}
          </Button>
        ) : (
          <span className="text-xs font-bold text-lime-400 flex items-center gap-1 bg-lime-950/40 border border-lime-500/30 px-3 py-1.5 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        )}
      </div>
    </div>
  );
}
