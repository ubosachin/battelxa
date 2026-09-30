"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Shield,
  AlertTriangle,
  User,
  Sparkles,
  LayoutGrid,
  ListFilter,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export interface SlotMember {
  userId?: string;
  gamerTag?: string;
  inGameId?: string;
}

export interface SlotRegistration {
  _id?: string;
  userId?: string;
  slotNumber: number;
  teamName?: string;
  teamTag?: string;
  status: string;
  members?: SlotMember[];
  checkedInAt?: string;
  registeredAt?: string;
}

interface SlotAllocationMatrixProps {
  maxSlots: number;
  format?: string;
  gameName?: string;
  registrations: SlotRegistration[];
  userSlotNumber?: number | null;
  currentUserId?: string;
  onSelectSlot?: (slotNumber: number) => void;
  isRegistered?: boolean;
}

export function SlotAllocationMatrix({
  maxSlots,
  format,
  gameName,
  registrations,
  userSlotNumber,
  currentUserId,
  isRegistered,
}: SlotAllocationMatrixProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "OCCUPIED" | "VACANT" | "MY_SLOT">("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");
  const [copiedRoster, setCopiedRoster] = useState(false);

  // Map registrations by slot number for O(1) lookup
  const slotMap = useMemo(() => {
    const map = new Map<number, SlotRegistration>();
    registrations.forEach((reg) => {
      if (reg.slotNumber && reg.status !== "CANCELLED") {
        map.set(reg.slotNumber, reg);
      }
    });
    return map;
  }, [registrations]);

  // Generate complete slot array from 1 to maxSlots
  const allSlots = useMemo(() => {
    const slots = [];
    for (let i = 1; i <= maxSlots; i++) {
      const reg = slotMap.get(i);
      const isUserSlot =
        userSlotNumber === i ||
        (currentUserId && reg?.userId === currentUserId) ||
        (currentUserId && reg?.members?.some((m) => m.userId === currentUserId));

      slots.push({
        slotNumber: i,
        registration: reg || null,
        isOccupied: !!reg,
        isUserSlot: !!isUserSlot,
      });
    }
    return slots;
  }, [maxSlots, slotMap, userSlotNumber, currentUserId]);

  // Filter slots based on search and tab filter
  const filteredSlots = useMemo(() => {
    return allSlots.filter((slot) => {
      // Tab filter
      if (filterType === "OCCUPIED" && !slot.isOccupied) return false;
      if (filterType === "VACANT" && slot.isOccupied) return false;
      if (filterType === "MY_SLOT" && !slot.isUserSlot) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchSlot = `slot ${slot.slotNumber}`.includes(q) || `${slot.slotNumber}` === q;
      if (matchSlot) return true;

      if (slot.registration) {
        if (slot.registration.teamName?.toLowerCase().includes(q)) return true;
        if (slot.registration.teamTag?.toLowerCase().includes(q)) return true;
        if (
          slot.registration.members?.some(
            (m) =>
              (m.gamerTag && m.gamerTag.toLowerCase().includes(q)) ||
              (m.inGameId && m.inGameId.toLowerCase().includes(q))
          )
        ) {
          return true;
        }
      }
      return false;
    });
  }, [allSlots, filterType, searchQuery]);

  const occupiedCount = registrations.length;
  const vacantCount = Math.max(0, maxSlots - occupiedCount);

  // Copy Discord & Tournament Host formatted roster
  const copyDiscordRoster = () => {
    const displayGame = (gameName || "Esports").toUpperCase();
    let text = `🎮 **${displayGame} TOURNAMENT SLOT ROSTER**\n`;
    text += `Format: ${format || "SQUAD"} | Total Slots: ${maxSlots} | Confirmed: ${occupiedCount}\n`;
    text += `────────────────────────────\n`;

    allSlots.forEach((s) => {
      if (s.registration) {
        const name =
          s.registration.teamName ||
          s.registration.members?.[0]?.gamerTag ||
          "Warrior";
        const tag = s.registration.teamTag ? `[${s.registration.teamTag}] ` : "";
        const checkStatus = s.registration.status === "CHECKED_IN" ? "✅" : "⏳";
        text += `Slot ${String(s.slotNumber).padStart(2, "0")}: ${checkStatus} ${tag}${name}\n`;
      } else {
        text += `Slot ${String(s.slotNumber).padStart(2, "0")}: ⚪ VACANT\n`;
      }
    });

    navigator.clipboard.writeText(text);
    setCopiedRoster(true);
    setTimeout(() => setCopiedRoster(false), 2500);
  };

  return (
    <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-5 sm:p-6 space-y-6 shadow-xl relative overflow-hidden">
      {/* Background ambient neon glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-lime-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Stats & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.08] relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-lime-500/10 text-lime-400">
              <Users className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-black text-white tracking-wide uppercase">
              Match Lobby Slot Matrix
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              {format} • {maxSlots} Slots
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Official in-game lobby seat allocation. Contestants must sit in their designated slot number.
          </p>
        </div>

        {/* Counter Stats & Copy Roster */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            <span>{occupiedCount} Claimed</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-500">{vacantCount} Open</span>
          </div>

          <button
            onClick={copyDiscordRoster}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            title="Copy formatted slot list for Discord or WhatsApp"
          >
            {copiedRoster ? (
              <>
                <Check className="h-3.5 w-3.5 text-lime-400" />
                <span className="text-lime-400">Roster Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Export Roster</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* User Allocated Slot Alert Banner if registered */}
      {userSlotNumber && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-lime-950/40 via-zinc-900/90 to-zinc-900 border-2 border-lime-500/60 shadow-[0_0_25px_rgba(132,204,22,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-lime-500/20 border border-lime-500/50 flex flex-col items-center justify-center font-black text-lime-400 shrink-0">
              <span className="text-[9px] uppercase tracking-tighter text-lime-300">SLOT</span>
              <span className="text-xl leading-none">#{userSlotNumber}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-white">YOUR DESIGNATED ARENA SEAT</h4>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-lime-400 text-black animate-pulse">
                  ASSIGNED
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                When room credentials unlock, join the custom room and switch immediately to{" "}
                <strong className="text-lime-400 font-bold">Slot #{userSlotNumber}</strong>. Sitting in other slots risks disqualification.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-[11px] font-semibold text-lime-400/90 bg-lime-950/60 px-3 py-1.5 rounded-lg border border-lime-800/40 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Slot Reserved
            </span>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 overflow-x-auto">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              filterType === "ALL"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            All Slots ({allSlots.length})
          </button>
          <button
            onClick={() => setFilterType("OCCUPIED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              filterType === "OCCUPIED"
                ? "bg-lime-500/20 text-lime-400 border border-lime-500/30"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Claimed ({occupiedCount})
          </button>
          <button
            onClick={() => setFilterType("VACANT")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              filterType === "VACANT"
                ? "bg-zinc-800 text-zinc-300"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Vacant ({vacantCount})
          </button>
          {userSlotNumber && (
            <button
              onClick={() => setFilterType("MY_SLOT")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                filterType === "MY_SLOT"
                  ? "bg-lime-500 text-black font-black"
                  : "text-lime-400 hover:text-lime-300"
              }`}
            >
              My Slot (#{userSlotNumber})
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search team, IGN, slot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-500/50"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("GRID")}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === "GRID"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              title="Grid Matrix View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("LIST")}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === "LIST"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              title="List Table View"
            >
              <ListFilter className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MATRIX VIEW */}
      {viewMode === "GRID" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 relative z-10">
          {filteredSlots.length === 0 ? (
            <div className="col-span-full py-12 text-center text-zinc-500 text-xs">
              No slots match your search or filter.
            </div>
          ) : (
            filteredSlots.map((slot) => {
              const reg = slot.registration;
              const isUser = slot.isUserSlot;

              if (!reg) {
                // VACANT SLOT CARD
                return (
                  <div
                    key={`slot-${slot.slotNumber}`}
                    className="p-3.5 rounded-xl border border-dashed border-zinc-800/80 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors flex flex-col justify-between min-h-[105px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-black text-zinc-500">
                        SLOT #{String(slot.slotNumber).padStart(2, "0")}
                      </span>
                      <span className="text-[9px] font-semibold text-zinc-600 uppercase tracking-wider">
                        OPEN
                      </span>
                    </div>

                    <div className="text-center py-2">
                      <span className="text-xs font-medium text-zinc-600">
                        Empty Slot
                      </span>
                    </div>

                    <div className="text-[10px] text-zinc-600 text-right">
                      Awaiting Gladiator
                    </div>
                  </div>
                );
              }

              // CLAIMED SLOT CARD
              const teamTitle =
                reg.teamName ||
                reg.members?.[0]?.gamerTag ||
                `Team ${slot.slotNumber}`;
              const isCheckedIn = reg.status === "CHECKED_IN";

              return (
                <div
                  key={`slot-${slot.slotNumber}`}
                  className={`p-3.5 rounded-xl transition-all relative flex flex-col justify-between min-h-[115px] ${
                    isUser
                      ? "bg-gradient-to-br from-lime-950/40 via-zinc-900 to-zinc-900/90 border-2 border-lime-400 shadow-[0_0_20px_rgba(132,204,22,0.2)]"
                      : "bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  {/* Slot Top Bar */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-mono font-black px-2 py-0.5 rounded ${
                          isUser
                            ? "bg-lime-400 text-black"
                            : "bg-zinc-800 text-violet-400 border border-zinc-700"
                        }`}
                      >
                        SLOT #{String(slot.slotNumber).padStart(2, "0")}
                      </span>
                      {isUser && (
                        <span className="text-[9px] font-black text-lime-400 uppercase tracking-tight flex items-center gap-0.5">
                          <Sparkles className="h-2.5 w-2.5" /> YOU
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isCheckedIn
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}
                    >
                      {isCheckedIn ? (
                        <>
                          <CheckCircle2 className="h-2.5 w-2.5" /> READY
                        </>
                      ) : (
                        <>
                          <Clock className="h-2.5 w-2.5" /> CONFIRMED
                        </>
                      )}
                    </span>
                  </div>

                  {/* Team / Player Info */}
                  <div className="space-y-1 my-1">
                    <div className="flex items-center gap-1.5">
                      {reg.teamTag && (
                        <span className="text-[10px] font-black text-violet-400 bg-violet-950/60 px-1.5 py-0.5 rounded border border-violet-800/40">
                          {reg.teamTag}
                        </span>
                      )}
                      <h4
                        className={`text-xs font-bold truncate ${
                          isUser ? "text-lime-300 font-black" : "text-zinc-100"
                        }`}
                        title={teamTitle}
                      >
                        {teamTitle}
                      </h4>
                    </div>

                    {/* Squad Members / IGNs */}
                    {reg.members && reg.members.length > 0 && (
                      <div className="text-[10px] text-zinc-400 truncate flex items-center gap-1">
                        <User className="h-2.5 w-2.5 text-zinc-500 shrink-0" />
                        <span className="truncate">
                          {reg.members.map((m) => m.gamerTag || "Warrior").join(", ")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer In-Game ID hint */}
                  <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10px] text-zinc-500">
                    <span>
                      {format === "SQUAD"
                        ? `${reg.members?.length || 4} Warriors`
                        : format === "DUO"
                        ? `${reg.members?.length || 2} Warriors`
                        : "Solo Contender"}
                    </span>
                    {reg.members?.[0]?.inGameId && (
                      <span className="font-mono text-[9px] text-zinc-400">
                        UID: {reg.members[0].inGameId.slice(0, 4)}***
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* LIST / TABLE VIEW */
        <div className="rounded-xl border border-zinc-800 overflow-hidden relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/90 text-zinc-400 border-b border-zinc-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Slot #</th>
                  <th className="py-2.5 px-3">Team / Gladiator</th>
                  <th className="py-2.5 px-3">Roster Members</th>
                  <th className="py-2.5 px-3">Game UID</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/40">
                {filteredSlots.map((slot) => {
                  const reg = slot.registration;
                  const isUser = slot.isUserSlot;

                  if (!reg) {
                    return (
                      <tr key={`list-slot-${slot.slotNumber}`} className="text-zinc-600">
                        <td className="py-2.5 px-3 font-mono font-bold">
                          #{String(slot.slotNumber).padStart(2, "0")}
                        </td>
                        <td className="py-2.5 px-3 italic">Open Slot</td>
                        <td className="py-2.5 px-3">—</td>
                        <td className="py-2.5 px-3 font-mono">—</td>
                        <td className="py-2.5 px-3">
                          <span className="text-[9px] text-zinc-600 uppercase font-semibold">
                            Vacant
                          </span>
                        </td>
                      </tr>
                    );
                  }

                  const isCheckedIn = reg.status === "CHECKED_IN";
                  return (
                    <tr
                      key={`list-slot-${slot.slotNumber}`}
                      className={`transition-colors ${
                        isUser
                          ? "bg-lime-950/30 text-white font-semibold"
                          : "hover:bg-zinc-900/40 text-zinc-300"
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-black text-violet-400">
                        #{String(slot.slotNumber).padStart(2, "0")}
                        {isUser && (
                          <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-lime-400 text-black font-black">
                            YOU
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          {reg.teamTag && (
                            <span className="text-[9px] font-bold text-violet-400 bg-violet-950 px-1 py-0.5 rounded">
                              [{reg.teamTag}]
                            </span>
                          )}
                          <span className={isUser ? "text-lime-300 font-bold" : "text-zinc-100"}>
                            {reg.teamName || reg.members?.[0]?.gamerTag || "Warrior"}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-400">
                        {reg.members?.map((m) => m.gamerTag || "Warrior").join(", ") || "—"}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-400">
                        {reg.members?.[0]?.inGameId ? `${reg.members[0].inGameId.slice(0, 4)}***` : "—"}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            isCheckedIn
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {isCheckedIn ? "Ready ⚡" : "Confirmed"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fair Play Slot Rule Notice */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 flex items-start gap-2.5 relative z-10">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <strong className="text-zinc-200">Strict Slot Hygiene Rule:</strong> In custom esports rooms, sitting in another team&apos;s slot will cause immediate kick by the referee. Ensure all teammates join the exact assigned slot number before the room timer expires.
        </div>
      </div>
    </div>
  );
}
