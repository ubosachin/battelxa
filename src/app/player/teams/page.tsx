"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { Users, Plus, Key, Copy, Check, Shield } from "lucide-react";

interface TeamMember {
  userId: string;
  inGameName: string;
  inGameId: string;
  role: string;
}

interface TeamItem {
  _id: string;
  name: string;
  tag: string;
  game: string;
  joinCode: string;
  leaderId: string;
  members: TeamMember[];
}

export default function PlayerTeamsPage() {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  // Create team state
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [game, setGame] = useState("FREE_FIRE_MAX");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Join team state
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadTeams() {
      try {
        const res = await fetch("/api/teams");
        if (isMounted && res.ok) {
          const data = await res.json();
          setTeams(data.teams || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadTeams();
    return () => {
      isMounted = false;
    };
  }, [refreshIndex]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError("");

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, tag, game }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Failed to create team");
        return;
      }

      setIsCreateOpen(false);
      setName("");
      setTag("");
      setRefreshIndex((prev) => prev + 1);
    } catch {
      setCreateError("Network error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    setJoinError("");

    try {
      const res = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setJoinError(data.error || "Failed to join team");
        return;
      }

      setIsJoinOpen(false);
      setJoinCode("");
      setRefreshIndex((prev) => prev + 1);
    } catch {
      setJoinError("Network error");
    } finally {
      setIsJoining(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            My Esports Squads & Clans
          </h1>
          <p className="text-xs text-zinc-400">
            Form competitive 4-player rosters for Free Fire MAX and BGMI tournaments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsJoinOpen(true)}
          >
            <Key className="h-4 w-4 mr-1 text-violet-400" /> Enter Invite Code
          </Button>
          <Button
            variant="lime"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1 text-black" /> Create New Squad
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-zinc-400">Loading squads...</div>
      ) : teams.length === 0 ? (
        <div className="rounded-2xl bg-[#0e111a] border border-zinc-800 p-10 text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-zinc-800 text-zinc-400">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-white text-base">You are not in any squads yet</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Create a clan or squad, generate an invite code, and invite your teammates to register for Squad tournaments together.
          </p>
          <Button variant="lime" size="sm" onClick={() => setIsCreateOpen(true)}>
            Create Your Squad
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team) => (
            <div
              key={team._id}
              className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 space-y-4 hover:border-violet-500/40 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800">
                      [{team.tag}]
                    </span>
                    <span className="text-[11px] font-bold text-zinc-400">
                      {team.game === "FREE_FIRE_MAX" ? "Free Fire MAX" : "BGMI"}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">
                    {team.name}
                  </h3>
                </div>

                {/* Squad Invite Code */}
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">
                    Squad Join Code
                  </span>
                  <button
                    onClick={() => copyCode(team.joinCode)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 font-mono text-xs font-bold text-lime-400 hover:border-lime-500/40 cursor-pointer"
                  >
                    {copiedCode === team.joinCode ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-lime-400" /> Copied!
                      </>
                    ) : (
                      <>
                        {team.joinCode} <Copy className="h-3 w-3 text-zinc-500" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Members Roster */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Roster ({team.members.length}/5)
                </span>
                <div className="space-y-1.5">
                  {team.members.map((m: TeamMember, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-violet-400" />
                        <span className="font-semibold text-white">
                          {m.inGameName}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          (ID: {m.inGameId})
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-lime-400">
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Assemble New Esports Squad"
        description="Pick your clan name, clan tag, and primary game title."
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
          {createError && <Alert variant="error">{createError}</Alert>}

          <Input
            label="Squad / Team Name"
            placeholder="e.g. Vortex Gladiators"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Clan Tag (3-6 characters)"
            placeholder="e.g. VTX"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            maxLength={6}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Primary Game Arena
            </label>
            <select
              value={game}
              onChange={(e) => setGame(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-violet-500"
            >
              <option value="FREE_FIRE_MAX">Free Fire MAX</option>
              <option value="BGMI">Battlegrounds Mobile India (BGMI)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="lime" isLoading={isCreating}>
              Create Squad
            </Button>
          </div>
        </form>
      </Modal>

      {/* Join Team Modal */}
      <Modal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        title="Enter Squad Join Code"
        description="Ask your team captain for the 6-character code."
      >
        <form onSubmit={handleJoinTeam} className="space-y-4">
          {joinError && <Alert variant="error">{joinError}</Alert>}

          <Input
            label="6-Character Join Code"
            placeholder="e.g. 7X9K2P"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            required
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsJoinOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="lime" isLoading={isJoining}>
              Join Squad
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
