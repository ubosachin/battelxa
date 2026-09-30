"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Lock,
  Unlock,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  Volume2,
  VolumeX,
  ExternalLink,
  Gamepad2,
  HelpCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface RoomCredentialsProps {
  tournamentId: string;
  isRegistered: boolean;
  releaseTime: string;
  initialRoomId?: string;
  initialPassword?: string;
  userSlotNumber?: number | null;
  registrationStatus?: "CONFIRMED" | "CHECKED_IN" | "WAITLIST" | "CANCELLED";
  gameName?: string;
  onCheckInSuccess?: () => void;
}

export function RoomCredentialsCard({
  tournamentId,
  isRegistered,
  releaseTime,
  initialRoomId,
  initialPassword,
  userSlotNumber,
  registrationStatus = "CONFIRMED",
  gameName = "Free Fire MAX / BGMI",
  onCheckInSuccess,
}: RoomCredentialsProps) {
  const [roomId, setRoomId] = useState<string>(initialRoomId || "");
  const [password, setPassword] = useState<string>(initialPassword || "");
  const [notes, setNotes] = useState<string>("");
  const [isUnlocked, setIsUnlocked] = useState<boolean>(!!initialRoomId);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(registrationStatus === "CHECKED_IN");
  const [isCheckingIn, setIsCheckingIn] = useState<boolean>(false);
  const [checkInMsg, setCheckInMsg] = useState<string | null>(null);

  const hasPlayedSound = useRef<boolean>(false);

  // Play browser Web Audio chime on unlock
  const playUnlockSound = useCallback(() => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // AudioContext muted/unsupported
    }
  }, [soundEnabled]);

  const fetchCredentials = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/tournaments/${tournamentId}/room-credentials`);
      if (res.ok) {
        const data = await res.json();
        if (data.roomId && data.roomId !== "TBA") {
          setRoomId(data.roomId);
          setPassword(data.password || "");
          setNotes(data.notes || "");
          setIsUnlocked(true);
          if (!hasPlayedSound.current) {
            playUnlockSound();
            hasPlayedSound.current = true;
          }
        }
      }
    } catch (e) {
      console.error("Error fetching room credentials:", e);
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId, playUnlockSound]);

  // Handle Player Ready Check / Check-In
  const handleCheckIn = async () => {
    try {
      setIsCheckingIn(true);
      setCheckInMsg(null);
      const res = await fetch(`/api/tournaments/${tournamentId}/check-in`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setIsCheckedIn(true);
        setCheckInMsg("Checked In! Your seat is locked.");
        onCheckInSuccess?.();
      } else {
        setCheckInMsg(data.error || "Failed to check in");
      }
    } catch {
      setCheckInMsg("Network error checking in");
    } finally {
      setIsCheckingIn(false);
    }
  };

  useEffect(() => {
    const target = new Date(releaseTime).getTime();
    if (isNaN(target)) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft("Unlocked Now");
        if (isRegistered && !isUnlocked) {
          fetchCredentials();
        }
      } else {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft(
          `${hours > 0 ? `${hours}h ` : ""}${minutes}m ${seconds}s`
        );

        // Auto-poll if under 2 minutes to ensure real-time update
        if (difference < 120000 && isRegistered && !isUnlocked) {
          fetchCredentials();
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [releaseTime, isRegistered, isUnlocked, fetchCredentials]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyBoth = () => {
    const combined = `🎮 BATTLEXA Match Room\nRoom ID: ${roomId}\nPassword: ${password || "None"}\n${userSlotNumber ? `My Slot: #${userSlotNumber}` : ""}`;
    navigator.clipboard.writeText(combined);
    setCopiedField("both");
    setTimeout(() => setCopiedField(null), 2000);
  };

  // State 1: Not Registered
  if (!isRegistered) {
    return (
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-6 text-center space-y-3 relative overflow-hidden">
        <div className="inline-flex p-3 rounded-2xl bg-zinc-800/80 text-zinc-400">
          <Lock className="h-6 w-6" />
        </div>
        <h4 className="font-bold text-sm text-zinc-200 uppercase tracking-wide">
          Match Room Credentials Encrypted
        </h4>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Custom match Room ID and Password will only be visible to confirmed registered participants once unlocked by the tournament host.
        </p>
      </div>
    );
  }

  // State 2: Registered, Locked (Countdown active)
  if (!isUnlocked) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-violet-950/30 via-zinc-900 to-zinc-900/90 border border-violet-800/40 p-5 sm:p-6 space-y-5 relative overflow-hidden shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
              <Clock className="h-5 w-5 animate-pulse" />
            </span>
            <div>
              <h4 className="font-black text-sm text-white tracking-wide uppercase">
                Lobby Credentials Countdown
              </h4>
              <p className="text-xs text-zinc-400">
                Credentials reveal 15 minutes before the match start time.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? "Mute alert chime" : "Enable sound chime"}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-lime-400" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Live Big Clock & Assigned Slot Badge */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
          <div className="text-center sm:text-left">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-0.5">
              Live Release Timer
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-black text-lime-400 tracking-wider">
              {timeLeft || "Calculating..."}
            </span>
          </div>

          {userSlotNumber && (
            <div className="px-4 py-2 rounded-lg bg-zinc-900 border border-lime-500/30 text-center">
              <span className="text-[9px] font-bold text-lime-400 block uppercase tracking-wider">
                Assigned Seat
              </span>
              <span className="font-mono font-black text-lg text-white">
                Slot #{userSlotNumber}
              </span>
            </div>
          )}
        </div>

        {/* Check-In Action & Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div>
            {isCheckedIn ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800/40">
                <ShieldCheck className="h-4 w-4" /> Ready & Checked In
              </span>
            ) : (
              <Button
                size="sm"
                variant="primary"
                onClick={handleCheckIn}
                isLoading={isCheckingIn}
                className="w-full sm:w-auto text-xs"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1 text-black" />
                Check In Now (Ready Up)
              </Button>
            )}
            {checkInMsg && (
              <span className="text-[11px] text-zinc-400 ml-2">{checkInMsg}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchCredentials}
              isLoading={isLoading}
              className="text-xs"
            >
              Refresh Status
            </Button>
            <Link href={`/tournaments/${tournamentId}/room`}>
              <Button size="sm" variant="secondary" className="text-xs">
                <Gamepad2 className="h-3.5 w-3.5 mr-1" />
                Match Arena
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 3: UNLOCKED! (Credentials Revealed)
  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-950/30 via-zinc-900 to-zinc-900 border-2 border-lime-500/50 p-5 sm:p-6 space-y-5 shadow-[0_0_30px_rgba(132,204,22,0.15)] relative overflow-hidden">
      {/* Header with Status Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-lime-400/20 text-lime-400">
            <Unlock className="h-5 w-5" />
          </span>
          <div>
            <h4 className="font-black text-sm text-white uppercase tracking-wider">
              Lobby Room Credentials Live
            </h4>
            <p className="text-xs text-zinc-400">
              Join custom room immediately and confirm your designated slot.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-lime-400 text-black animate-pulse uppercase">
            LIVE UNLOCKED
          </span>
          <button
            onClick={copyBoth}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copiedField === "both" ? (
              <>
                <Check className="h-3.5 w-3.5 text-lime-400" />
                <span className="text-lime-400">Copied All!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy All</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Assigned Slot Highlight Banner */}
      {userSlotNumber && (
        <div className="p-3 rounded-xl bg-lime-950/40 border border-lime-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-black px-2.5 py-1 rounded bg-lime-400 text-black">
              SLOT #{userSlotNumber}
            </span>
            <span className="text-xs font-bold text-white">
              Sit in Slot #{userSlotNumber} inside the custom room!
            </span>
          </div>
          <span className="text-[10px] text-lime-400 font-semibold uppercase hidden sm:inline">
            Strict Slot Discipline
          </span>
        </div>
      )}

      {/* Credential Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* ROOM ID */}
        <div className="p-4 bg-zinc-950/90 rounded-xl border border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">
              Custom Room ID
            </span>
            <span className="text-xl font-mono font-black text-white tracking-widest select-all">
              {roomId || "TBA"}
            </span>
          </div>
          {roomId && (
            <button
              onClick={() => copyToClipboard(roomId, "room")}
              className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Copy Room ID"
            >
              {copiedField === "room" ? (
                <Check className="h-4 w-4 text-lime-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* PASSWORD */}
        <div className="p-4 bg-zinc-950/90 rounded-xl border border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">
              Room Password
            </span>
            <span className="text-xl font-mono font-black text-lime-400 tracking-widest select-all">
              {password || "No Password"}
            </span>
          </div>
          {password && (
            <button
              onClick={() => copyToClipboard(password, "pass")}
              className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Copy Password"
            >
              {copiedField === "pass" ? (
                <Check className="h-4 w-4 text-lime-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Host Notes if present */}
      {notes && (
        <div className="p-3 bg-zinc-900/80 rounded-lg border border-zinc-800 text-xs text-zinc-300">
          <strong className="text-violet-400">Host Instructions:</strong> {notes}
        </div>
      )}

      {/* In-Game Instructions Accordion Toggle */}
      <div className="pt-1">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 font-semibold transition-colors cursor-pointer"
        >
          <HelpCircle className="h-3.5 w-3.5 text-lime-400" />
          <span>{showGuide ? "Hide in-game join guide" : "How to join custom room in game?"}</span>
        </button>

        {showGuide && (
          <div className="mt-3 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2.5 text-xs text-zinc-300 animate-in fade-in duration-200">
            <h5 className="font-bold text-white flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-violet-400" />
              Quick Join Steps for {gameName}:
            </h5>
            <ol className="list-decimal list-inside space-y-1.5 text-zinc-300 leading-relaxed">
              <li>Open your game ({gameName}) and tap on the <strong>Game Mode / Map</strong> selector.</li>
              <li>Select <strong>Custom Room</strong> tab from the bottom or side menu.</li>
              <li>Paste the <strong>Room ID ({roomId})</strong> into the Room Search bar.</li>
              <li>Enter the <strong>Password ({password || "None"})</strong> when prompted.</li>
              <li>Once inside the lobby, immediately find and click on <strong>Slot #{userSlotNumber || "your assigned slot"}</strong> to take your seat.</li>
              <li>Ready up and wait for host to start the match!</li>
            </ol>
          </div>
        )}
      </div>

      {/* Dedicated Live Room Navigation CTA */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.08]">
        <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span>Never leak credentials. Unauthorized players will be kicked instantly.</span>
        </div>

        <Link href={`/tournaments/${tournamentId}/room`} className="w-full sm:w-auto">
          <Button size="sm" variant="primary" className="w-full sm:w-auto text-xs">
            Open Fullscreen Match Console <ExternalLink className="h-3 w-3 ml-1.5 text-black" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
