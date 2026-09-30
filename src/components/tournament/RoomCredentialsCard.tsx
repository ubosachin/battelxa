"use client";

import React, { useState, useEffect } from "react";
import { Lock, Unlock, Copy, Check, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface RoomCredentialsProps {
  tournamentId: string;
  isRegistered: boolean;
  releaseTime: string;
  initialRoomId?: string;
  initialPassword?: string;
}

export function RoomCredentialsCard({
  tournamentId,
  isRegistered,
  releaseTime,
  initialRoomId,
  initialPassword,
}: RoomCredentialsProps) {
  const [roomId, setRoomId] = useState<string>(initialRoomId || "");
  const [password, setPassword] = useState<string>(initialPassword || "");
  const [isUnlocked, setIsUnlocked] = useState<boolean>(!!initialRoomId);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCredentials = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/tournaments/${tournamentId}/room-credentials`);
      if (res.ok) {
        const data = await res.json();
        if (data.roomId) {
          setRoomId(data.roomId);
          setPassword(data.password || "");
          setIsUnlocked(true);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId]);

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

  if (!isRegistered) {
    return (
      <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-5 text-center">
        <div className="inline-flex p-3 rounded-full bg-zinc-800/80 text-zinc-400 mb-3">
          <Lock className="h-6 w-6" />
        </div>
        <h4 className="font-bold text-sm text-zinc-200">Room Credentials Locked</h4>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
          Custom match Room ID and Password will only be visible to confirmed registered participants.
        </p>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="rounded-xl bg-violet-950/20 border border-violet-800/40 p-5 text-center space-y-3">
        <div className="inline-flex p-3 rounded-full bg-violet-900/30 text-violet-400">
          <Clock className="h-6 w-6 animate-pulse" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-white">Room Credentials Countdown</h4>
          <p className="text-xs text-zinc-400 mt-1">
            Custom room details will be revealed 15 minutes before match start.
          </p>
        </div>
        <div className="inline-block px-4 py-2 rounded-lg bg-zinc-900 border border-violet-500/30 font-mono text-lg font-black text-lime-400">
          {timeLeft || "Calculating..."}
        </div>
        <div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchCredentials}
            isLoading={isLoading}
          >
            Check Release Status
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-emerald-950/20 border border-lime-500/40 p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-lime-500/20">
        <div className="flex items-center gap-2">
          <Unlock className="h-5 w-5 text-lime-400" />
          <h4 className="font-bold text-sm text-white uppercase tracking-wider">
            Match Lobby Credentials
          </h4>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-lime-500 text-black">
          RELEASED
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-zinc-900/90 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-zinc-400 block uppercase">
              Room ID
            </span>
            <span className="text-base font-mono font-bold text-white tracking-widest">
              {roomId || "TBA"}
            </span>
          </div>
          {roomId && (
            <button
              onClick={() => copyToClipboard(roomId, "room")}
              className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              {copiedField === "room" ? (
                <Check className="h-4 w-4 text-lime-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        <div className="p-3 bg-zinc-900/90 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-zinc-400 block uppercase">
              Room Password
            </span>
            <span className="text-base font-mono font-bold text-lime-400 tracking-widest">
              {password || "No Password"}
            </span>
          </div>
          {password && (
            <button
              onClick={() => copyToClipboard(password, "pass")}
              className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
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

      <div className="flex items-start gap-2 p-2.5 rounded bg-amber-950/30 border border-amber-800/30 text-[11px] text-amber-300">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        <span>
          Do NOT share these credentials with anyone. Joining unauthorized slots or leaking credentials will result in an immediate tournament ban and forfeit of prizes.
        </span>
      </div>
    </div>
  );
}
