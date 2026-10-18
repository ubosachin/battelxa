"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import {
  Users,
  Plus,
  Key,
  Copy,
  Check,
  Shield,
  Crown,
  User,
  Share2,
  Settings,
  LogOut,
  UserMinus,
  RefreshCw,
  Flame,
  Gamepad2,
  Search,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

interface TeamMember {
  userId: string;
  inGameName: string;
  inGameId: string;
  role: "LEADER" | "CO_LEADER" | "MEMBER";
  joinedAt?: string;
}

interface TeamItem {
  _id: string;
  name: string;
  tag: string;
  game: "FREE_FIRE_MAX" | "BGMI";
  logo?: string;
  bio?: string;
  isOpenRecruiting?: boolean;
  joinCode: string;
  leaderId: string | { _id: string; username?: string };
  members: TeamMember[];
  matchesPlayed?: number;
  matchesWon?: number;
}

interface TeamPreview {
  id: string;
  name: string;
  tag: string;
  game: string;
  logo: string;
  bio: string;
  joinCode: string;
  memberCount: number;
  maxSlots: number;
  isFull: boolean;
  leaderName: string;
  matchesPlayed?: number;
  matchesWon?: number;
}

const EMBLEMS: Record<
  string,
  { label: string; icon: string; border: string; glow: string }
> = {
  dragon: {
    label: "Fire Dragon",
    icon: "🐉",
    border: "border-red-500/50",
    glow: "bg-red-500/10",
  },
  falcon: {
    label: "Apex Falcon",
    icon: "🦅",
    border: "border-cyan-500/50",
    glow: "bg-cyan-500/10",
  },
  wolf: {
    label: "Shadow Wolf",
    icon: "🐺",
    border: "border-violet-500/50",
    glow: "bg-violet-500/10",
  },
  tiger: {
    label: "Bengal Tiger",
    icon: "🐯",
    border: "border-amber-500/50",
    glow: "bg-amber-500/10",
  },
  viper: {
    label: "Cobra Viper",
    icon: "🐍",
    border: "border-emerald-500/50",
    glow: "bg-emerald-500/10",
  },
  skull: {
    label: "Cyber Skull",
    icon: "💀",
    border: "border-lime-500/50",
    glow: "bg-lime-500/10",
  },
};

function PlayerTeamsContent() {
  const searchParams = useSearchParams();
  const directJoinCode = searchParams.get("join");

  const [activeTab, setActiveTab] = useState<"MY_SQUADS" | "DISCOVER">("MY_SQUADS");
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [publicTeams, setPublicTeams] = useState<TeamItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshIndex, setRefreshIndex] = useState(0);

  // Discover Filters
  const [gameFilter, setGameFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Create Squad Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [game, setGame] = useState<"FREE_FIRE_MAX" | "BGMI">("FREE_FIRE_MAX");
  const [bio, setBio] = useState("");
  const [logo, setLogo] = useState<string>("dragon");
  const [isOpenRecruiting, setIsOpenRecruiting] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Join Squad Modal
  const [isJoinOpen, setIsJoinOpen] = useState(() => Boolean(directJoinCode && directJoinCode.trim().length === 6));
  const [joinCode, setJoinCode] = useState(() => (directJoinCode && directJoinCode.trim().length === 6 ? directJoinCode.trim().toUpperCase() : ""));
  const [previewTeam, setPreviewTeam] = useState<TeamPreview | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");

  // Manage / Settings Modal
  const [manageTeam, setManageTeam] = useState<TeamItem | null>(null);
  const [editBio, setEditBio] = useState("");
  const [editLogo, setEditLogo] = useState("dragon");
  const [editRecruiting, setEditRecruiting] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Confirm Action Modals
  const [confirmKick, setConfirmKick] = useState<{ teamId: string; member: TeamMember } | null>(null);
  const [confirmLeave, setConfirmLeave] = useState<TeamItem | null>(null);
  const [confirmDisband, setConfirmDisband] = useState<TeamItem | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // Feedback Toasts
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Load User & Squads
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        // 1. Get current user session
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          if (isMounted && meData.user) {
            setCurrentUserId(meData.user.id);
          }
        }

        // 2. Fetch Squads
        const teamsRes = await fetch("/api/teams?scope=all");
        if (isMounted && teamsRes.ok) {
          const data = await teamsRes.json();
          setTeams(data.teams || []);
          setPublicTeams(data.publicTeams || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [refreshIndex]);

  const fetchPreview = useCallback(async (code: string) => {
    if (code.length !== 6) {
      setPreviewTeam(null);
      return;
    }
    setIsPreviewLoading(true);
    setJoinError("");
    try {
      const res = await fetch(`/api/teams/preview?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (res.ok && data.preview) {
        setPreviewTeam(data.preview);
      } else {
        setPreviewTeam(null);
        setJoinError(data.error || "Squad not found with this code");
      }
    } catch {
      setPreviewTeam(null);
      setJoinError("Network error while searching for squad");
    } finally {
      setIsPreviewLoading(false);
    }
  }, []);

  // Handle direct join code from URL params
  useEffect(() => {
    if (!directJoinCode || directJoinCode.trim().length !== 6) return;
    const cleanCode = directJoinCode.trim().toUpperCase();
    let isMounted = true;

    async function loadDirectPreview() {
      setIsPreviewLoading(true);
      try {
        const res = await fetch(`/api/teams/preview?code=${encodeURIComponent(cleanCode)}`);
        const data = await res.json();
        if (isMounted) {
          if (res.ok && data.preview) {
            setPreviewTeam(data.preview);
          } else {
            setJoinError(data.error || "Squad not found with this code");
          }
        }
      } catch {
        if (isMounted) {
          setJoinError("Network error while searching for squad");
        }
      } finally {
        if (isMounted) {
          setIsPreviewLoading(false);
        }
      }
    }

    void loadDirectPreview();
    return () => {
      isMounted = false;
    };
  }, [directJoinCode]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError("");

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          tag: tag.trim().toUpperCase(),
          game,
          bio: bio.trim(),
          logo,
          isOpenRecruiting,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Failed to create squad");
        return;
      }

      setIsCreateOpen(false);
      setName("");
      setTag("");
      setBio("");
      setLogo("dragon");
      setRefreshIndex((prev) => prev + 1);
    } catch {
      setCreateError("Network error while assembling squad");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    setJoinError("");
    setJoinSuccess("");

    try {
      const res = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode: joinCode.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setJoinError(data.error || "Failed to join squad");
        return;
      }

      setJoinSuccess(data.message || "Enlisted successfully!");
      setTimeout(() => {
        setIsJoinOpen(false);
        setJoinCode("");
        setPreviewTeam(null);
        setJoinSuccess("");
        setActiveTab("MY_SQUADS");
        setRefreshIndex((prev) => prev + 1);
      }, 1200);
    } catch {
      setJoinError("Network error while joining squad");
    } finally {
      setIsJoining(false);
    }
  };

  const openSettings = (team: TeamItem) => {
    setManageTeam(team);
    setEditBio(team.bio || "");
    setEditLogo(team.logo || "dragon");
    setEditRecruiting(team.isOpenRecruiting ?? true);
    setSettingsMessage(null);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manageTeam) return;
    setIsSavingSettings(true);
    setSettingsMessage(null);

    try {
      const res = await fetch(`/api/teams/${manageTeam._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: editBio.trim(),
          logo: editLogo,
          isOpenRecruiting: editRecruiting,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSettingsMessage({ type: "error", text: data.error || "Failed to update settings" });
        return;
      }

      setSettingsMessage({ type: "success", text: "Squad settings updated successfully!" });
      setTimeout(() => {
        setManageTeam(null);
        setRefreshIndex((prev) => prev + 1);
      }, 1000);
    } catch {
      setSettingsMessage({ type: "error", text: "Network error" });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleRegenerateCode = async () => {
    if (!manageTeam) return;
    setIsSavingSettings(true);
    setSettingsMessage(null);

    try {
      const res = await fetch(`/api/teams/${manageTeam._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REGENERATE_CODE" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSettingsMessage({ type: "error", text: data.error || "Failed to regenerate code" });
        return;
      }

      setSettingsMessage({
        type: "success",
        text: `New Squad Code: ${data.joinCode} (Old code revoked)`,
      });
      setRefreshIndex((prev) => prev + 1);
    } catch {
      setSettingsMessage({ type: "error", text: "Network error" });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleKickMember = async () => {
    if (!confirmKick) return;
    setIsActionLoading(true);
    setActionError("");

    try {
      const res = await fetch(
        `/api/teams/${confirmKick.teamId}/members/${confirmKick.member.userId}/kick`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Failed to eject player");
        return;
      }

      setConfirmKick(null);
      setRefreshIndex((prev) => prev + 1);
    } catch {
      setActionError("Network error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLeaveSquad = async () => {
    if (!confirmLeave) return;
    setIsActionLoading(true);
    setActionError("");

    try {
      const res = await fetch(`/api/teams/${confirmLeave._id}/leave`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Failed to leave squad");
        return;
      }

      setConfirmLeave(null);
      setRefreshIndex((prev) => prev + 1);
    } catch {
      setActionError("Network error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDisbandSquad = async () => {
    if (!confirmDisband) return;
    setIsActionLoading(true);
    setActionError("");

    try {
      const res = await fetch(`/api/teams/${confirmDisband._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Failed to disband squad");
        return;
      }

      setConfirmDisband(null);
      setRefreshIndex((prev) => prev + 1);
    } catch {
      setActionError("Network error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const shareSquad = async (team: TeamItem) => {
    const shareUrl = `${window.location.origin}/player/teams?join=${team.joinCode}`;
    const shareText = `Join my esports squad [${team.tag}] ${team.name} on BATTLEXA! Use Join Code: ${team.joinCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join [${team.tag}] ${team.name} on BATTLEXA`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(team._id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Filter public discover squads
  const filteredPublicTeams = publicTeams.filter((t) => {
    if (gameFilter !== "all" && t.game !== gameFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchTag = t.tag.toLowerCase().includes(q);
      const matchBio = t.bio?.toLowerCase().includes(q);
      if (!matchName && !matchTag && !matchBio) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lime-400">
            <Users className="h-4 w-4" />
            <span>Clan & Squad Command HQ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-0.5">
            Esports Squads & Clans
          </h1>
          <p className="text-xs text-zinc-400 max-w-xl">
            Form competitive rosters, enlist squadmates via encrypted join codes, and lock team slots in Free Fire MAX & BGMI Tournaments.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setJoinCode("");
              setPreviewTeam(null);
              setJoinError("");
              setIsJoinOpen(true);
            }}
            className="border-violet-500/40 text-violet-300 hover:bg-violet-950/40"
          >
            <Key className="h-3.5 w-3.5 mr-1 text-violet-400" /> Enter Invite Code
          </Button>
          <Button
            variant="lime"
            size="sm"
            onClick={() => {
              setCreateError("");
              setIsCreateOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1 text-black" /> Assemble Squad
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-white/[0.08] pb-1">
        <button
          onClick={() => setActiveTab("MY_SQUADS")}
          className={`flex items-center gap-2 pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "MY_SQUADS"
              ? "border-lime-400 text-lime-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>My Enlisted Squads</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300 font-mono">
            {teams.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("DISCOVER")}
          className={`flex items-center gap-2 pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "DISCOVER"
              ? "border-violet-400 text-violet-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Search className="h-4 w-4" />
          <span>Recruiting Clans</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-violet-950 text-violet-300 font-mono border border-violet-800/40">
            {publicTeams.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MY SQUADS                                                         */}
      {/* ========================================================================= */}
      {activeTab === "MY_SQUADS" && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-lime-400" /> Loading your battle rosters...
            </div>
          ) : teams.length === 0 ? (
            <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-8 sm:p-12 text-center space-y-4 max-w-xl mx-auto shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-lime-500/20 border border-lime-400/30 text-lime-400 flex items-center justify-center mx-auto text-2xl">
                🛡️
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  You Have No Active Squads Yet
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Gladiators fight fiercest together. Create your clan to lock slots in Duo &amp; Squad cups, or enter a Captain&apos;s invite code to enlist!
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  variant="lime"
                  size="sm"
                  onClick={() => setIsCreateOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-1 text-black" /> Create Your Squad
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsJoinOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <Key className="h-4 w-4 mr-1 text-violet-400" /> Enter 6-Digit Code
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              {teams.map((team) => {
                const isLeader =
                  typeof team.leaderId === "string"
                    ? team.leaderId === currentUserId
                    : team.leaderId?._id === currentUserId;

                const callerMember = team.members.find(
                  (m) => m.userId.toString() === currentUserId
                );
                const isCoLeader = callerMember?.role === "CO_LEADER";
                const canManage = isLeader || isCoLeader;

                const emblem = EMBLEMS[team.logo || "dragon"] || EMBLEMS.dragon;

                return (
                  <div
                    key={team._id}
                    className="rounded-2xl bg-[#0e111a] border border-white/[0.08] hover:border-violet-500/40 transition-all p-5 sm:p-6 space-y-5 shadow-xl flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Top ambient banner line */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-600 via-lime-400 to-indigo-500" />

                    <div className="space-y-4">
                      {/* Squad Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${emblem.border} ${emblem.glow} shadow-md shrink-0`}
                          >
                            {emblem.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800">
                                [{team.tag}]
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                                {team.game === "FREE_FIRE_MAX" ? (
                                  <>
                                    <Flame className="h-3 w-3 text-orange-400 fill-orange-400" /> Free Fire MAX
                                  </>
                                ) : (
                                  <>
                                    <Gamepad2 className="h-3 w-3 text-yellow-400" /> BGMI
                                  </>
                                )}
                              </span>
                            </div>
                            <h3 className="text-lg font-black text-white mt-1 leading-tight">
                              {team.name}
                            </h3>
                          </div>
                        </div>

                        {/* Leader & Settings Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {canManage && (
                            <button
                              onClick={() => openSettings(team)}
                              title="Squad Settings"
                              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
                            >
                              <Settings className="h-4 w-4" />
                            </button>
                          )}
                          {!isLeader && (
                            <button
                              onClick={() => setConfirmLeave(team)}
                              title="Leave Squad"
                              className="p-2 rounded-xl bg-red-950/40 hover:bg-red-950 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                            >
                              <LogOut className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Bio / Motto */}
                      {team.bio && (
                        <p className="text-xs text-zinc-300 italic bg-black/30 p-2.5 rounded-xl border border-zinc-800/80 leading-relaxed">
                          &ldquo;{team.bio}&rdquo;
                        </p>
                      )}

                      {/* Join Code & Quick Share Strip */}
                      <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest shrink-0">
                            Join Code:
                          </span>
                          <button
                            onClick={() => copyCode(team.joinCode)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/50 border border-lime-500/30 font-mono text-xs font-black text-lime-400 hover:border-lime-400 transition-colors cursor-pointer"
                          >
                            {copiedCode === team.joinCode ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-lime-400" /> Copied!
                              </>
                            ) : (
                              <>
                                {team.joinCode} <Copy className="h-3 w-3 text-zinc-400" />
                              </>
                            )}
                          </button>
                        </div>

                        <button
                          onClick={() => shareSquad(team)}
                          className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-violet-300 hover:text-white bg-violet-950/60 hover:bg-violet-900/60 border border-violet-500/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          <span>{copiedLink === team._id ? "Link Copied!" : "Share Invite"}</span>
                        </button>
                      </div>

                      {/* Roster Table */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                          <span>Gladiator Roster ({team.members.length}/5)</span>
                          <span className="text-[10px] text-zinc-500 normal-case font-normal">
                            Max 4 Active + 1 Sub
                          </span>
                        </div>

                        <div className="divide-y divide-zinc-800/80 rounded-xl bg-black/40 border border-zinc-800/80 overflow-hidden">
                          {team.members.map((m, idx) => {
                            const isMe = m.userId.toString() === currentUserId;
                            const isMemberLeader = m.role === "LEADER";
                            const isMemberCoLeader = m.role === "CO_LEADER";

                            return (
                              <div
                                key={idx}
                                className="p-2.5 sm:p-3 flex items-center justify-between gap-3 text-xs"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                                    {isMemberLeader ? (
                                      <Crown className="h-4 w-4 text-amber-400" />
                                    ) : isMemberCoLeader ? (
                                      <Shield className="h-4 w-4 text-violet-400" />
                                    ) : (
                                      <User className="h-4 w-4 text-zinc-400" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-white truncate">
                                        {m.inGameName}
                                      </span>
                                      {isMe && (
                                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-lime-950 text-lime-400 border border-lime-500/30">
                                          YOU
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-zinc-500 font-mono block truncate">
                                      UID: {m.inGameId}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span
                                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                      isMemberLeader
                                        ? "bg-amber-950/80 text-amber-300 border-amber-600/40"
                                        : isMemberCoLeader
                                        ? "bg-violet-950/80 text-violet-300 border-violet-600/40"
                                        : "bg-zinc-800 text-zinc-400 border-zinc-700/50"
                                    }`}
                                  >
                                    {m.role}
                                  </span>

                                  {/* Leader Member Management Actions */}
                                  {isLeader && !isMemberLeader && (
                                    <button
                                      onClick={() => setConfirmKick({ teamId: team._id, member: m })}
                                      title="Eject Player from Roster"
                                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                                    >
                                      <UserMinus className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Squad Card Footer */}
                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                      <span className="text-[11px] font-semibold text-zinc-500">
                        {team.isOpenRecruiting ? "🟢 Open Recruiting" : "🔒 Invite-Only"}
                      </span>

                      {isLeader && (
                        <button
                          onClick={() => setConfirmDisband(team)}
                          className="text-[11px] font-bold text-red-400 hover:text-red-300 underline transition-colors cursor-pointer"
                        >
                          Disband Clan
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DISCOVER RECRUITING CLANS                                         */}
      {/* ========================================================================= */}
      {activeTab === "DISCOVER" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-[#0e111a] border border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search squads by clan name, tag, or playstyle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setGameFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  gameFilter === "all"
                    ? "bg-violet-600 text-white"
                    : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                All Arenas
              </button>
              <button
                onClick={() => setGameFilter("FREE_FIRE_MAX")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  gameFilter === "FREE_FIRE_MAX"
                    ? "bg-orange-600 text-white"
                    : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                Free Fire
              </button>
              <button
                onClick={() => setGameFilter("BGMI")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  gameFilter === "BGMI"
                    ? "bg-yellow-600 text-black"
                    : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                BGMI
              </button>
            </div>
          </div>

          {/* Public Squads Grid */}
          {filteredPublicTeams.length === 0 ? (
            <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-12 text-center space-y-3">
              <Users className="h-8 w-8 text-zinc-600 mx-auto" />
              <h3 className="font-bold text-white text-base">No Open Squads Matching Criteria</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                No clans are currently advertising open slots with these filters. Be the first to create one!
              </p>
              <Button variant="lime" size="sm" onClick={() => setIsCreateOpen(true)}>
                Assemble Your Own Squad
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPublicTeams.map((squad) => {
                const emblem = EMBLEMS[squad.logo || "dragon"] || EMBLEMS.dragon;
                const isFull = squad.members.length >= 5;

                return (
                  <div
                    key={squad._id}
                    className="p-5 rounded-2xl bg-[#0e111a] border border-white/[0.08] hover:border-violet-500/40 transition-all flex flex-col justify-between space-y-4 shadow-lg"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border ${emblem.border} ${emblem.glow}`}
                          >
                            {emblem.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-violet-950 text-violet-300 border border-violet-800">
                                [{squad.tag}]
                              </span>
                              <span className="text-[10px] font-bold text-zinc-400">
                                {squad.game === "FREE_FIRE_MAX" ? "Free Fire MAX" : "BGMI"}
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-white mt-0.5 truncate max-w-[170px]">
                              {squad.name}
                            </h4>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono font-bold text-lime-400 bg-lime-950/60 border border-lime-500/30 px-2 py-0.5 rounded-full shrink-0">
                          {squad.members.length}/5 Slots
                        </span>
                      </div>

                      {squad.bio && (
                        <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed bg-black/30 p-2 rounded-lg border border-zinc-800/80">
                          &ldquo;{squad.bio}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-zinc-500">
                        Code: <strong className="text-zinc-300">{squad.joinCode}</strong>
                      </span>

                      <Button
                        size="sm"
                        variant="lime"
                        disabled={isFull}
                        onClick={() => {
                          setJoinCode(squad.joinCode);
                          setIsJoinOpen(true);
                          fetchPreview(squad.joinCode);
                        }}
                        className="text-xs px-3 py-1 font-bold"
                      >
                        {isFull ? "Roster Full" : "Enlist Now"} <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE SQUAD                                                     */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Assemble New Esports Squad"
        description="Pick your clan identity, tag, and primary battle title."
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
          {createError && <Alert variant="error">{createError}</Alert>}

          {/* Emblem Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Select Squad Crest
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {Object.entries(EMBLEMS).map(([key, item]) => {
                const isSelected = logo === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setLogo(key)}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      isSelected
                        ? "bg-violet-600/30 border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                        : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-[10px] font-bold text-zinc-300 truncate w-full">
                      {item.label.split(" ")[1] || item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Squad / Clan Name"
            placeholder="e.g. Vortex Gladiators"
            value={name}
            onChange={(e) => setName(e.target.value)}
            helperText="3-30 characters. Must be unique across BATTLEXA."
            required
          />

          <Input
            label="Clan Tag (2-6 uppercase letters/digits)"
            placeholder="e.g. VTX"
            value={tag}
            onChange={(e) => setTag(e.target.value.toUpperCase())}
            maxLength={6}
            helperText="Appears before player names in tournament rosters: [VTX] Warrior."
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Primary Competitive Arena
            </label>
            <select
              value={game}
              onChange={(e) => setGame(e.target.value as "FREE_FIRE_MAX" | "BGMI")}
              className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-violet-500"
            >
              <option value="FREE_FIRE_MAX">Free Fire MAX</option>
              <option value="BGMI">Battlegrounds Mobile India (BGMI)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Squad Bio / Playstyle Motto (Optional)
            </label>
            <textarea
              rows={2}
              maxLength={200}
              placeholder="e.g. Aggressive rusher squad aiming for National Tier-1 scrims. Daily practice."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="openRecruiting"
              checked={isOpenRecruiting}
              onChange={(e) => setIsOpenRecruiting(e.target.checked)}
              className="rounded bg-zinc-900 border-zinc-800 text-lime-500 focus:ring-lime-500 h-4 w-4"
            />
            <label htmlFor="openRecruiting" className="text-xs text-zinc-300 select-none cursor-pointer">
              List this squad in the public Clan Recruitment directory
            </label>
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
              Assemble Squad
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: JOIN SQUAD VIA CODE                                             */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isJoinOpen}
        onClose={() => {
          setIsJoinOpen(false);
          setPreviewTeam(null);
          setJoinError("");
          setJoinSuccess("");
        }}
        title="Enlist in Esports Squad"
        description="Enter the 6-character squad join code provided by the Captain."
      >
        <form onSubmit={handleJoinTeam} className="space-y-4">
          {joinError && <Alert variant="error">{joinError}</Alert>}
          {joinSuccess && <Alert variant="success">{joinSuccess}</Alert>}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              6-Character Squad Join Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 7X9K2P"
                maxLength={6}
                value={joinCode}
                onChange={(e) => {
                  const upper = e.target.value.toUpperCase();
                  setJoinCode(upper);
                  if (upper.length === 6) {
                    fetchPreview(upper);
                  } else {
                    setPreviewTeam(null);
                  }
                }}
                className="flex-1 px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm font-mono font-bold tracking-widest text-lime-400 placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                required
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fetchPreview(joinCode)}
                disabled={joinCode.length !== 6 || isPreviewLoading}
              >
                {isPreviewLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "Preview"
                )}
              </Button>
            </div>
          </div>

          {/* Squad Live Preview Card */}
          {previewTeam && (
            <div className="p-4 rounded-xl bg-zinc-900/90 border border-violet-500/40 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {EMBLEMS[previewTeam.logo]?.icon || "🐉"}
                  </span>
                  <div>
                    <span className="text-xs font-black text-white block">
                      [{previewTeam.tag}] {previewTeam.name}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Arena: {previewTeam.game === "FREE_FIRE_MAX" ? "Free Fire MAX" : "BGMI"}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold text-lime-400 bg-lime-950/80 px-2 py-0.5 rounded border border-lime-500/30">
                  {previewTeam.memberCount}/5 Members
                </span>
              </div>

              {previewTeam.bio && (
                <p className="text-[11px] text-zinc-300 italic bg-black/40 p-2 rounded border border-zinc-800">
                  &ldquo;{previewTeam.bio}&rdquo;
                </p>
              )}

              <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-800">
                <span>Captain: <strong className="text-white">{previewTeam.leaderName}</strong></span>
                <span>Matches Won: <strong className="text-lime-400">{previewTeam.matchesWon}</strong></span>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsJoinOpen(false);
                setPreviewTeam(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="lime"
              isLoading={isJoining}
              disabled={joinCode.length !== 6}
            >
              Enlist into Squad
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: SQUAD SETTINGS (LEADER / CO-LEADER)                             */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(manageTeam)}
        onClose={() => setManageTeam(null)}
        title={`Squad Command Settings: [${manageTeam?.tag}]`}
        description="Update clan emblem, motto, recruitment visibility, or cycle join code."
      >
        {manageTeam && (
          <form onSubmit={handleSaveSettings} className="space-y-4">
            {settingsMessage && (
              <Alert variant={settingsMessage.type === "error" ? "error" : "success"}>
                {settingsMessage.text}
              </Alert>
            )}

            {/* Emblem Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Squad Crest Emblem
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {Object.entries(EMBLEMS).map(([key, item]) => {
                  const isSelected = editLogo === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setEditLogo(key)}
                      className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        isSelected
                          ? "bg-violet-600/30 border-violet-400 shadow-md"
                          : "bg-zinc-900 border-zinc-800"
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-[10px] font-bold text-zinc-300 truncate w-full">
                        {item.label.split(" ")[1] || item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Squad Bio / Playstyle Motto
              </label>
              <textarea
                rows={2}
                maxLength={200}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="editRecruiting"
                checked={editRecruiting}
                onChange={(e) => setEditRecruiting(e.target.checked)}
                className="rounded bg-zinc-900 border-zinc-800 text-lime-500 focus:ring-lime-500 h-4 w-4"
              />
              <label htmlFor="editRecruiting" className="text-xs text-zinc-300 select-none cursor-pointer">
                Recruitment active in public clan directory
              </label>
            </div>

            {/* Security: Cycle Join Code */}
            <div className="p-3 rounded-xl bg-black/40 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Security: Cycle Join Code
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    If this squad&apos;s code leaked, invalidate previous codes immediately.
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateCode}
                  disabled={isSavingSettings}
                  className="text-xs shrink-0"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" /> Cycle Code
                </Button>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setManageTeam(null)}
              >
                Close
              </Button>
              <Button type="submit" variant="lime" isLoading={isSavingSettings}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* CONFIRMATION MODALS                                                       */}
      {/* ========================================================================= */}
      {/* 1. Kick Member */}
      <Modal
        isOpen={Boolean(confirmKick)}
        onClose={() => setConfirmKick(null)}
        title="Confirm Member Ejection"
        description="Are you sure you want to remove this player from your squad roster?"
      >
        <div className="space-y-4">
          {actionError && <Alert variant="error">{actionError}</Alert>}
          <p className="text-xs text-zinc-300">
            Player <strong className="text-white">{confirmKick?.member.inGameName}</strong> (UID: {confirmKick?.member.inGameId}) will be ejected immediately.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setConfirmKick(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleKickMember}
              isLoading={isActionLoading}
            >
              Eject Player
            </Button>
          </div>
        </div>
      </Modal>

      {/* 2. Leave Squad */}
      <Modal
        isOpen={Boolean(confirmLeave)}
        onClose={() => setConfirmLeave(null)}
        title="Leave Squad"
        description="Are you sure you want to depart from this squad?"
      >
        <div className="space-y-4">
          {actionError && <Alert variant="error">{actionError}</Alert>}
          <p className="text-xs text-zinc-300">
            You will forfeit your slot in [<strong>{confirmLeave?.tag}</strong>] {confirmLeave?.name}. You will need a new invite code to re-join.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setConfirmLeave(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleLeaveSquad}
              isLoading={isActionLoading}
            >
              Leave Squad
            </Button>
          </div>
        </div>
      </Modal>

      {/* 3. Disband Squad */}
      <Modal
        isOpen={Boolean(confirmDisband)}
        onClose={() => setConfirmDisband(null)}
        title="Disband Clan Permanently"
        description="This action cannot be undone."
      >
        <div className="space-y-4">
          {actionError && <Alert variant="error">{actionError}</Alert>}
          <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/50 text-xs text-red-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Permanent Clan Deletion</span>
            </div>
            <p>
              Disbanding [<strong>{confirmDisband?.tag}</strong>] {confirmDisband?.name} will permanently remove the clan roster and notify all teammates.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setConfirmDisband(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDisbandSquad}
              isLoading={isActionLoading}
            >
              Disband Clan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function PlayerTeamsPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-xs text-zinc-400">Loading squads...</div>}>
      <PlayerTeamsContent />
    </Suspense>
  );
}
