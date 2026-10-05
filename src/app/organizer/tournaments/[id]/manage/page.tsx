"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  Settings,
  Key,
  Users,
  Clock,
  Shield,
  Save,
  Download,
  Flame,
  ArrowRight,
  Gamepad2,
  Radio,
} from "lucide-react";
import { MatchBroadcastModal } from "@/components/tournament/MatchBroadcastModal";

interface RegistrationMember {
  userId?: string;
  gamerTag?: string;
  inGameId?: string;
  inGameName?: string;
}

interface ManageRegistration {
  _id: string;
  slotNumber: number;
  teamName?: string;
  status: string;
  members?: RegistrationMember[];
}

interface ManageTournament {
  _id: string;
  title: string;
  gameName: string;
  slug?: string;
  status: string;
  startTime: string;
  registeredSlots: number;
  maxSlots: number;
  roomCredentials?: {
    roomId?: string;
    password?: string;
    notes?: string;
    releaseTime?: string;
  };
}

export default function OrganizerManageTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [tournament, setTournament] = useState<ManageTournament | null>(null);
  const [registrations, setRegistrations] = useState<ManageRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Room Credentials State
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");
  const [isSavingCreds, setIsSavingCreds] = useState(false);
  const [credsMessage, setCredsMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Status transition state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [refreshIndex, setRefreshIndex] = useState(0);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [notifyOnSave, setNotifyOnSave] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTournament() {
      try {
        const res = await fetch(`/api/tournaments/${id}`);
        if (isMounted && res.ok) {
          const data = await res.json();
          setTournament(data.tournament);
          setRegistrations(data.registrations || []);
          if (data.tournament?.roomCredentials) {
            setRoomId(data.tournament.roomCredentials.roomId || "");
            setPassword(data.tournament.roomCredentials.password || "");
            setNotes(data.tournament.roomCredentials.notes || "");
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadTournament();
    return () => {
      isMounted = false;
    };
  }, [id, refreshIndex]);

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCreds(true);
    setCredsMessage(null);

    try {
      const res = await fetch(`/api/tournaments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCredentials: {
            roomId: roomId.trim(),
            password: password.trim(),
            notes: notes.trim(),
            released: true,
          },
          notifyPlayers: notifyOnSave,
        }),
      });

      if (res.ok) {
        setCredsMessage({
          type: "success",
          text: notifyOnSave
            ? "Room credentials saved & broadcasted to Discord and Email!"
            : "Room credentials saved successfully!",
        });
        setRefreshIndex((prev) => prev + 1);
      } else {
        const err = await res.json();
        setCredsMessage({ type: "error", text: err.error || "Failed to save room credentials" });
      }
    } catch {
      setCredsMessage({ type: "error", text: "Network error saving credentials" });
    } finally {
      setIsSavingCreds(false);
    }
  };

  const handleStatusChange = async (targetStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/tournaments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });

      if (res.ok) {
        setRefreshIndex((prev) => prev + 1);
      } else {
        const err = await res.json();
        alert(err.error || "Status update failed");
      }
    } catch {
      alert("Network error updating tournament status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const exportRosterCSV = () => {
    const headers = "Slot,Team/Player,InGameID,Status\n";
    const rows = registrations
      .map(
        (r) =>
          `${r.slotNumber},"${r.teamName || r.members?.[0]?.gamerTag || "Unknown"}","${
            r.members?.[0]?.inGameId || "N/A"
          }",${r.status}`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roster-${tournament?.slug || "tournament"}.csv`;
    a.click();
  };

  if (isLoading) {
    return <div className="py-12 text-center text-xs text-zinc-400">Loading management panel...</div>;
  }

  if (!tournament) {
    return <div className="py-12 text-center text-xs text-zinc-400">Tournament not found</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0e111a] border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-violet-950 text-violet-300 border border-violet-800">
              {tournament.gameName}
            </span>
            <Badge variant="lime">{tournament.status}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
            {tournament.title}
          </h1>
          <p className="text-xs text-zinc-400">
            Kickoff: {formatDate(tournament.startTime)} • Slots: {tournament.registeredSlots}/{tournament.maxSlots}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsBroadcastModalOpen(true)}
            className="border-violet-500/40 hover:border-violet-450 text-violet-300 hover:text-white"
          >
            <Radio className="h-4 w-4 mr-1 text-violet-400 animate-pulse" /> Broadcast Match Alert
          </Button>
          <Link href={`/organizer/tournaments/${id}/matches`}>
            <Button variant="lime" size="sm">
              <Flame className="h-4 w-4 mr-1 text-black" /> Enter Match Results & Evidence
            </Button>
          </Link>
          <Link href={`/tournaments/${id}`} target="_blank">
            <Button variant="outline" size="sm">
              Public Page
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Room Credentials & Status Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Room ID & Password Vault Config */}
          <form
            onSubmit={handleSaveCredentials}
            className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lime-400">
                <Key className="h-4 w-4" /> Custom Lobby Room ID & Password
              </div>
              <span className="text-[11px] text-zinc-500">
                Encrypted on server until scheduled reveal
              </span>
            </div>

            {credsMessage && (
              <Alert variant={credsMessage.type === "success" ? "success" : "error"}>
                {credsMessage.text}
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Custom Match Room ID"
                placeholder="e.g. 8492019"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
              />
              <Input
                label="Custom Match Room Password"
                placeholder="e.g. 1234 or leave blank"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Input
              label="Lobby Host Instructions / Notes"
              placeholder="e.g. Squads must sit in their designated slot number. 10 minute grace period."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <label className="flex items-start sm:items-center gap-3 cursor-pointer text-xs text-zinc-300 bg-black/40 border border-white/5 rounded-xl p-3 hover:border-violet-500/30 transition-colors">
              <input
                type="checkbox"
                checked={notifyOnSave}
                onChange={(e) => setNotifyOnSave(e.target.checked)}
                className="mt-0.5 sm:mt-0 h-4 w-4 rounded accent-lime-400 cursor-pointer"
              />
              <span>
                Broadcast Room ID & Password to all registered players via{" "}
                <strong className="text-violet-400">Discord Embed</strong> &{" "}
                <strong className="text-lime-400">Email</strong> immediately upon saving
              </span>
            </label>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-zinc-400">
                Scheduled Release:{" "}
                <strong className="text-zinc-200">
                  {formatDate(tournament.roomCredentials?.releaseTime || tournament.startTime)}
                </strong>
              </span>
              <Button type="submit" variant="lime" size="sm" isLoading={isSavingCreds}>
                <Save className="h-3.5 w-3.5 mr-1" /> Save Credentials
              </Button>
            </div>
          </form>

          {/* Roster & Participant Slot Grid */}
          <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-violet-400" /> Participant Slot Map ({registrations.length})
              </h3>
              <div className="flex items-center gap-2">
                <Link href={`/tournaments/${id}/room`} target="_blank">
                  <Button size="sm" variant="secondary">
                    <Gamepad2 className="h-3.5 w-3.5 mr-1" /> Live Arena Room
                  </Button>
                </Link>
                <Button size="sm" variant="outline" onClick={exportRosterCSV}>
                  <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
                </Button>
              </div>
            </div>

            {registrations.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">
                No gladiators have registered for this tournament yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Slot</th>
                      <th className="py-2.5 px-3">Participant / Clan</th>
                      <th className="py-2.5 px-3">In-Game ID</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-xs">
                    {registrations.map((r) => (
                      <tr key={r._id}>
                        <td className="py-2.5 px-3 font-bold text-lime-400">
                          Slot #{r.slotNumber}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-white">
                          {r.teamName || r.members?.[0]?.gamerTag || "Warrior"}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-zinc-300">
                          {r.members?.[0]?.inGameId || "N/A"}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant="lime" className="text-[9px]">
                            {r.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3): Status Transition Controls */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Settings className="h-4 w-4 text-violet-400" /> Tournament State Controller
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Advance the tournament through official stages according to the tournament state machine.
            </p>

            <div className="space-y-2">
              <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-xs flex justify-between items-center">
                <span className="text-zinc-400">Current Phase:</span>
                <Badge variant="lime">{tournament.status}</Badge>
              </div>

              {tournament.status === "REGISTRATION_OPEN" && (
                <Button
                  className="w-full"
                  variant="secondary"
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange("REGISTRATION_CLOSED")}
                >
                  Close Registrations
                </Button>
              )}

              {tournament.status === "REGISTRATION_CLOSED" && (
                <Button
                  className="w-full"
                  variant="lime"
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange("CHECK_IN")}
                >
                  Open Player Check-In
                </Button>
              )}

              {tournament.status === "CHECK_IN" && (
                <Button
                  className="w-full"
                  variant="primary"
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange("LIVE")}
                >
                  Mark Tournament LIVE
                </Button>
              )}

              {tournament.status === "LIVE" && (
                <Link href={`/organizer/tournaments/${id}/matches`} className="block">
                  <Button className="w-full" variant="lime">
                    Submit Scores & Finish
                  </Button>
                </Link>
              )}

              {["REGISTRATION_OPEN", "REGISTRATION_CLOSED", "CHECK_IN"].includes(tournament.status) && (
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => {
                    if (confirm("Are you sure? This will refund all player entry fees automatically.")) {
                      handleStatusChange("CANCELLED");
                    }
                  }}
                  className="w-full py-2 text-center text-xs font-bold text-red-400 hover:bg-red-950/40 rounded-lg border border-red-800/40 cursor-pointer mt-3"
                >
                  Cancel Tournament & Refund Players
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {tournament && (
        <MatchBroadcastModal
          isOpen={isBroadcastModalOpen}
          onClose={() => setIsBroadcastModalOpen(false)}
          tournamentId={tournament._id}
          tournamentTitle={tournament.title}
          gameName={tournament.gameName}
          initialRoomId={roomId}
          initialPassword={password}
          initialNotes={notes}
          registeredSlots={registrations.length || tournament.registeredSlots}
          onBroadcastSuccess={() => setRefreshIndex((prev) => prev + 1)}
        />
      )}
    </div>
  );
}
