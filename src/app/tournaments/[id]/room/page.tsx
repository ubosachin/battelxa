"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Gamepad2,
  Clock,
  Shield,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Users,
  Trophy,
  ExternalLink,
  Radio,
  CheckCircle2,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SlotAllocationMatrix, SlotRegistration } from "@/components/tournament/SlotAllocationMatrix";
import { RoomCredentialsCard } from "@/components/tournament/RoomCredentialsCard";

interface TournamentData {
  _id: string;
  title: string;
  gameName: string;
  gameSlug: string;
  format: "SOLO" | "DUO" | "SQUAD";
  type: "FREE" | "PAID" | "PRACTICE";
  entryFee: number;
  prizePool: number;
  maxSlots: number;
  registeredSlots: number;
  status: string;
  startTime: string;
  registrationDeadline: string;
  rules?: string;
  bannerUrl?: string;
  roomCredentials?: {
    releaseTime: string;
    released: boolean;
    roomId?: string;
    password?: string;
    notes?: string;
  };
}

export default function TournamentMatchRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [registrations, setRegistrations] = useState<SlotRegistration[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userSlotNumber, setUserSlotNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const res = await fetch(`/api/tournaments/${id}`);
      if (!res.ok) {
        throw new Error("Failed to load match room data");
      }
      const data = await res.json();
      setTournament(data.tournament);
      setRegistrations(data.registrations || []);
      setIsRegistered(data.isUserRegistered || false);
      setUserSlotNumber(data.userSlotNumber || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching room");
    } finally {
      setIsLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh match room state every 15 seconds
    const interval = setInterval(() => {
      loadData();
    }, 15000);
    return () => clearInterval(interval);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08090e] text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-xl bg-lime-500/20 border border-lime-500/40 flex items-center justify-center animate-spin mb-4">
          <Gamepad2 className="h-6 w-6 text-lime-400" />
        </div>
        <h3 className="text-sm font-bold tracking-wider uppercase text-zinc-400">
          Connecting to Match Room Arena...
        </h3>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-[#08090e] text-white flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="h-10 w-10 text-amber-400 mb-3" />
        <h2 className="text-lg font-bold text-white mb-2">Match Room Not Found</h2>
        <p className="text-xs text-zinc-400 max-w-sm mb-6">
          {error || "Unable to locate tournament match room or credentials."}
        </p>
        <Link href={`/tournaments/${id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tournament
          </Button>
        </Link>
      </div>
    );
  }

  const isLive = tournament.status === "LIVE";
  const isCredentialsReleased = tournament.roomCredentials?.released || !!tournament.roomCredentials?.roomId;

  return (
    <div className="min-h-screen bg-[#08090e] text-white pb-20 selection:bg-lime-400 selection:text-black">
      {/* Top Status Header Bar */}
      <header className="border-b border-white/[0.08] bg-[#0c0e17]/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/tournaments/${id}`}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Return to tournament details"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-lime-400 tracking-wider">
                  ARENA CONSOLE
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-xs font-bold text-zinc-300 truncate max-w-[200px] sm:max-w-md">
                  {tournament.title}
                </span>
              </div>
              <div className="text-[10px] text-zinc-500 flex items-center gap-2">
                <span>{tournament.gameName}</span>
                <span>•</span>
                <span className="uppercase">{tournament.format} Match</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
              </span>
              <span className="text-[11px] font-mono text-zinc-300">
                {isLive ? "MATCH LIVE" : isCredentialsReleased ? "ROOM READY" : "COUNTDOWN"}
              </span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => loadData(true)}
              isLoading={refreshing}
              className="text-xs h-8 px-2.5"
              title="Refresh Room State"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Hero Banner with Tournament Stats & Live Status */}
        <section className="rounded-3xl bg-gradient-to-r from-zinc-950 via-[#0e111a] to-zinc-950 border border-white/[0.08] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="lime" className="text-xs font-black uppercase">
                  {tournament.gameName}
                </Badge>
                <Badge variant="violet" className="text-xs font-bold uppercase">
                  {tournament.format} Arena
                </Badge>
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  Prize Pool: <strong className="text-white font-mono">₹{tournament.prizePool}</strong>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                {tournament.title}
              </h1>

              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                Welcome to the BATTLEXA Live Match Room. Ensure you copy the Room ID and Password below, join the in-game custom room, and sit in your designated slot before the match start time.
              </p>
            </div>

            {/* User Slot Callout Card if Registered */}
            {userSlotNumber && (
              <div className="p-5 rounded-2xl bg-zinc-900/90 border-2 border-lime-400/80 shadow-[0_0_30px_rgba(132,204,22,0.2)] text-center shrink-0 min-w-[200px]">
                <span className="text-[10px] font-black uppercase text-lime-400 tracking-wider block mb-1">
                  Your In-Game Seat
                </span>
                <span className="font-mono text-3xl font-black text-white block">
                  SLOT #{userSlotNumber}
                </span>
                <span className="text-[10px] text-zinc-400 mt-1 inline-block">
                  Sit strictly in this slot
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Section 1: Room Credentials Terminal */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Radio className="h-4 w-4 text-lime-400 animate-pulse" />
              1. Lobby Room Credentials
            </h2>
            <span className="text-xs text-zinc-400">
              Auto-syncs with host room updates
            </span>
          </div>

          <RoomCredentialsCard
            tournamentId={tournament._id}
            isRegistered={isRegistered}
            releaseTime={tournament.roomCredentials?.releaseTime || tournament.startTime}
            initialRoomId={tournament.roomCredentials?.roomId}
            initialPassword={tournament.roomCredentials?.password}
            userSlotNumber={userSlotNumber}
            gameName={tournament.gameName}
            onCheckInSuccess={() => loadData(true)}
          />
        </section>

        {/* Section 2: Interactive Slot Matrix */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-400" />
              2. Official Lobby Seat Allocation
            </h2>
            <span className="text-xs text-zinc-400">
              {registrations.length} of {tournament.maxSlots} Slots Occupied
            </span>
          </div>

          <SlotAllocationMatrix
            maxSlots={tournament.maxSlots}
            format={tournament.format}
            gameName={tournament.gameName}
            registrations={registrations}
            userSlotNumber={userSlotNumber}
            isRegistered={isRegistered}
          />
        </section>

        {/* Section 3: Match Protocol & Next Steps */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Rules Card */}
          <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="h-4 w-4 text-lime-400" />
              Custom Room Match Rules
            </h3>
            <ul className="space-y-2 text-xs text-zinc-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-lime-400 shrink-0 mt-0.5" />
                <span><strong>No Emulator Rule:</strong> Only touchscreen mobile devices permitted. Emulators will be kicked by anti-cheat.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-lime-400 shrink-0 mt-0.5" />
                <span><strong>Slot Stealing:</strong> Sitting in other players&apos; assigned slots will result in instant kick with no refunds.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-lime-400 shrink-0 mt-0.5" />
                <span><strong>Screenshot Proof:</strong> Take a clear screenshot of your end-game match stats showing team kills & rank.</span>
              </li>
            </ul>
          </div>

          {/* Post-Match Result Submission Teaser */}
          <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-5 sm:p-6 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                3. Post-Match Verification & Payouts
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Once the custom room concludes, contestants have a 15-minute window to submit match results & screenshots for referee verification.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
              <span>Result Submission:</span>
              <span className="font-bold text-lime-400">Opens After Match End</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
