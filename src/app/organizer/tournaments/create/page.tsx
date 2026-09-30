"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { GameLogo } from "@/components/shared/GameLogo";
import { Trophy, Gamepad2, Calendar, Shield, Sparkles } from "lucide-react";

export default function CreateTournamentPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [gameSlug, setGameSlug] = useState<"free-fire-max" | "bgmi">("free-fire-max");
  const [format, setFormat] = useState<"SOLO" | "DUO" | "SQUAD">("SQUAD");
  const [type, setType] = useState<"FREE" | "PAID" | "PRACTICE">("PAID");
  const [entryFee, setEntryFee] = useState("50");
  const [prizePool, setPrizePool] = useState("2000");
  const [maxSlots, setMaxSlots] = useState("12");
  const [startTime, setStartTime] = useState(() =>
    new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [registrationDeadline, setRegistrationDeadline] = useState(() =>
    new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [rules, setRules] = useState(
    "1. Strict Fair-Play: Emulators prohibited unless explicitly declared.\n2. Team teaming or griefing results in disqualification.\n3. Room ID & password will unlock 15 minutes before match start.\n4. Take screenshot of scoreboard at match conclusion for prize claim."
  );
  const [streamUrl, setStreamUrl] = useState("");
  const [region, setRegion] = useState("India (South Asia)");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGameChange = (selected: "free-fire-max" | "bgmi") => {
    setGameSlug(selected);
    if (selected === "free-fire-max") {
      setMaxSlots(format === "SOLO" ? "48" : "12");
    } else {
      setMaxSlots(format === "SOLO" ? "100" : "25");
    }
  };

  const handleFormatChange = (selectedFormat: "SOLO" | "DUO" | "SQUAD") => {
    setFormat(selectedFormat);
    if (gameSlug === "free-fire-max") {
      setMaxSlots(selectedFormat === "SOLO" ? "48" : selectedFormat === "DUO" ? "24" : "12");
    } else {
      setMaxSlots(selectedFormat === "SOLO" ? "100" : selectedFormat === "DUO" ? "50" : "25");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const payload = {
        title,
        gameSlug,
        format,
        type,
        entryFee: type === "FREE" ? 0 : parseFloat(entryFee) || 0,
        prizePool: parseFloat(prizePool) || 0,
        maxSlots: parseInt(maxSlots, 10),
        startTime: new Date(startTime).toISOString(),
        registrationDeadline: new Date(registrationDeadline).toISOString(),
        rules,
        streamUrl: streamUrl || undefined,
        region,
      };

      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to publish tournament");
        return;
      }

      router.push(`/organizer/tournaments/${data.tournament._id}/manage`);
    } catch {
      setError("Network error while creating tournament");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Create Tournament Arena
        </h1>
        <p className="text-xs text-zinc-400">
          Configure tournament formats, prize pools, capacity limits, and schedule custom lobbies.
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 lg:p-8 space-y-6"
      >
        {/* Game Title Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
            1. Select Esports Title
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleGameChange("free-fire-max")}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                gameSlug === "free-fire-max"
                  ? "bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/50"
                  : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <GameLogo game="free-fire-max" variant="badge" size="sm" />
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                  48 Slots
                </span>
              </div>
              <h4 className="font-bold text-white text-base mt-2">Free Fire MAX</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Bermuda / Kalahari / Purgatory • Clash Squad & Battle Royale
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleGameChange("bgmi")}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                gameSlug === "bgmi"
                  ? "bg-yellow-950/30 border-yellow-500 shadow-lg shadow-yellow-950/40 ring-1 ring-yellow-500/50"
                  : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <GameLogo game="bgmi" variant="badge" size="sm" />
                <span className="text-[10px] font-bold text-yellow-400 bg-yellow-950/60 px-2 py-0.5 rounded border border-yellow-500/30">
                  100 Slots
                </span>
              </div>
              <h4 className="font-bold text-white text-base mt-2">Battlegrounds Mobile India</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Erangel / Miramar / Sanhok • Classic Squads & Duos
              </p>
            </button>
          </div>
        </div>

        {/* Tournament Name & Format */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Tournament Title"
            placeholder="e.g. Bermuda Friday Night Warzone"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Battle Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["SOLO", "DUO", "SQUAD"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => handleFormatChange(f)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    format === f
                      ? "bg-violet-600 border-violet-500 text-white"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Entry Type, Entry Fee, Prize Pool, Max Slots */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Entry Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "FREE" | "PAID" | "PRACTICE")}
              className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-violet-500"
            >
              <option value="PAID">Cash Entry (Paid)</option>
              <option value="FREE">Free Cup</option>
              <option value="PRACTICE">Daily Practice</option>
            </select>
          </div>

          <Input
            label="Entry Fee (₹)"
            type="number"
            min="0"
            disabled={type === "FREE"}
            value={type === "FREE" ? "0" : entryFee}
            onChange={(e) => setEntryFee(e.target.value)}
            required
          />

          <Input
            label="Prize Pool (₹)"
            type="number"
            min="0"
            value={prizePool}
            onChange={(e) => setPrizePool(e.target.value)}
            required
          />

          <Input
            label="Slot Capacity"
            type="number"
            min="2"
            max="100"
            value={maxSlots}
            onChange={(e) => setMaxSlots(e.target.value)}
            required
          />
        </div>

        {/* Schedule */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Kickoff Date & Time (IST)"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            helperText="Room credentials unlock 15 minutes before this time."
            required
          />

          <Input
            label="Registration Deadline"
            type="datetime-local"
            value={registrationDeadline}
            onChange={(e) => setRegistrationDeadline(e.target.value)}
            helperText="After this deadline, no new registrations are accepted."
            required
          />
        </div>

        {/* Live Stream URL & Region */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Stream Broadcast URL (Optional)"
            placeholder="https://youtube.com/live/..."
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
          />

          <Input
            label="Region / Server"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            required
          />
        </div>

        {/* Rules */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Rules & Anti-Cheat Specifications
          </label>
          <textarea
            rows={4}
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            required
          />
        </div>

        <div className="pt-2 flex justify-end">
          <Button type="submit" variant="lime" size="lg" isLoading={isLoading}>
            <Sparkles className="h-4 w-4 mr-1.5" /> Publish Tournament Arena
          </Button>
        </div>
      </form>
    </div>
  );
}
