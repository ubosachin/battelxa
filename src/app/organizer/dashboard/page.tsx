"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Trophy,
  Users,
  Plus,
  Settings,
  Flame,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Upload,
  X,
  CheckCircle2,
  Save,
  ImageIcon,
} from "lucide-react";
import { emitSyncEvent } from "@/lib/sync/sync-events";

interface OrganizerTournamentItem {
  _id: string;
  title: string;
  gameSlug: string;
  gameName: string;
  format: string;
  status: string;
  entryFee: number;
  prizePool: number;
  maxSlots: number;
  registeredSlots: number;
  startTime: string;
}

interface OrganizerStats {
  totalCupsHosted: number;
  totalPrizeDistributed: number;
  activeGladiators: number;
  rating: number;
  organizationName: string;
  logo?: string;
  banner?: string;
  verified: boolean;
}

export default function OrganizerDashboard() {
  const [tournaments, setTournaments] = useState<OrganizerTournamentItem[]>([]);
  const [stats, setStats] = useState<OrganizerStats>({
    totalCupsHosted: 0,
    totalPrizeDistributed: 0,
    activeGladiators: 0,
    rating: 5.0,
    organizationName: "",
    logo: "",
    banner: "",
    verified: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Branding Modal State
  const [isBrandingOpen, setIsBrandingOpen] = useState(false);
  const [editLogo, setEditLogo] = useState("");
  const [editOrgName, setEditOrgName] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [brandingMessage, setBrandingMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadOrganizerData() {
      try {
        const res = await fetch("/api/organizer/stats", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (res.ok) {
          const data = await res.json();
          setTournaments(data.tournaments || []);
          if (data.stats) {
            setStats(data.stats);
            setEditLogo(data.stats.logo || "");
            setEditOrgName(data.stats.organizationName || "");
          }
        }
      } catch (e) {
        console.error("Failed to load organizer data:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrganizerData();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setBrandingMessage({ type: "error", text: "Please select an image file (PNG, JPG, or WebP)." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setBrandingMessage({ type: "error", text: "Logo image size must be under 5MB." });
      return;
    }

    setIsUploadingLogo(true);
    setBrandingMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setEditLogo(data.url);
        setBrandingMessage({
          type: "success",
          text: "New clan logo uploaded! Click Save to apply your organization branding.",
        });
      } else {
        const err = await res.json();
        setBrandingMessage({ type: "error", text: err.error || "Failed to upload logo image" });
      }
    } catch {
      setBrandingMessage({ type: "error", text: "Network error uploading logo image." });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBranding(true);
    setBrandingMessage(null);

    try {
      const res = await fetch("/api/organizer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logo: editLogo,
          organizationName: editOrgName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setBrandingMessage({ type: "error", text: data.error || "Failed to update organization branding" });
        return;
      }

      setStats((prev) => ({
        ...prev,
        logo: editLogo,
        organizationName: editOrgName || prev.organizationName,
      }));
      setBrandingMessage({ type: "success", text: "Organization logo & branding saved successfully!" });
      emitSyncEvent("AUTH_SESSION_CHANGED");
      setTimeout(() => {
        setIsBrandingOpen(false);
      }, 1200);
    } catch {
      setBrandingMessage({ type: "error", text: "Network error occurred." });
    } finally {
      setIsSavingBranding(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Organization Branding & Logo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-r from-violet-950/70 via-[#0e111a] to-zinc-950 border border-violet-500/30">
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative group shrink-0">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-lime-400 p-[2px] shadow-xl">
              <div className="w-full h-full rounded-[14px] bg-zinc-950 flex items-center justify-center overflow-hidden">
                {stats.logo ? (
                  <img
                    src={stats.logo}
                    alt={stats.organizationName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ShieldCheck className="h-8 w-8 text-lime-400" />
                )}
              </div>
            </div>
            {stats.verified && (
              <span
                title="Verified Host"
                className="absolute -bottom-1 -right-1 bg-lime-500 text-black p-0.5 rounded-full ring-2 ring-zinc-950"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
            )}
          </div>

          <div>
            <span className="text-xs font-bold text-lime-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />{" "}
              {stats.organizationName ? `${stats.organizationName} • Verified Host` : "Verified Tournament Host"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
              Organizer Command Center
            </h1>
            <p className="text-xs text-zinc-400 max-w-xl">
              Publish Free Fire MAX and BGMI tournaments, distribute room credentials, and verify match scorecards.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              setEditLogo(stats.logo || "");
              setEditOrgName(stats.organizationName || "");
              setBrandingMessage(null);
              setIsBrandingOpen(true);
            }}
            className="border-violet-500/40 hover:border-lime-500/50"
          >
            <Upload className="h-4 w-4 mr-1.5 text-lime-400" /> Clan Logo & Branding
          </Button>
          <Link href="/organizer/tournaments/create">
            <Button variant="lime" size="md">
              <Plus className="h-4 w-4 mr-1 text-black" /> Create Tournament
            </Button>
          </Link>
        </div>
      </div>

      {/* Live Metric Cards (Zero Hardcoded Data) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#0e111a] border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Total Cups Hosted
          </span>
          <div className="text-2xl font-black text-white">
            {isLoading ? "—" : stats.totalCupsHosted}
          </div>
          <span className="text-[11px] text-zinc-500">
            {stats.totalCupsHosted === 0 ? "No cups hosted yet" : `${stats.totalCupsHosted} tournaments`}
          </span>
        </div>

        <div className="p-5 rounded-xl bg-[#0e111a] border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Total Prize Distributed
          </span>
          <div className="text-2xl font-black text-lime-400">
            {isLoading ? "—" : formatCurrency(stats.totalPrizeDistributed)}
          </div>
          <span className="text-[11px] text-zinc-500">
            {stats.totalPrizeDistributed === 0 ? "No prize disbursed yet" : "100% verified"}
          </span>
        </div>

        <div className="p-5 rounded-xl bg-[#0e111a] border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Active Gladiators
          </span>
          <div className="text-2xl font-black text-violet-400">
            {isLoading ? "—" : stats.activeGladiators}
          </div>
          <span className="text-[11px] text-zinc-500">
            {stats.activeGladiators === 0 ? "No registrations yet" : "Across your lobbies"}
          </span>
        </div>

        <div className="p-5 rounded-xl bg-[#0e111a] border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Host Rating
          </span>
          <div className="text-2xl font-black text-amber-400">
            {isLoading
              ? "—"
              : stats.totalCupsHosted > 0
              ? `${stats.rating.toFixed(1)} / 5.0`
              : "New Host"}
          </div>
          <span className="text-[11px] text-zinc-500">
            {stats.totalCupsHosted > 0 ? "Verified by players" : "Initial standing"}
          </span>
        </div>
      </div>

      {/* Hosted Tournaments Management List */}
      <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-white uppercase tracking-tight flex items-center gap-2">
            <Trophy className="h-4 w-4 text-lime-400" /> My Tournament Arenas
          </h3>
          <Link href="/organizer/tournaments/create">
            <Button size="sm" variant="outline">
              <Plus className="h-3.5 w-3.5 mr-1" /> Host Another Cup
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-zinc-400">Loading tournaments...</div>
        ) : tournaments.length === 0 ? (
          <div className="py-10 text-center text-xs text-zinc-500">
            No tournaments created yet. Click &quot;Create New Tournament&quot; above.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {tournaments.map((t) => (
              <div
                key={t._id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-zinc-900 border border-zinc-800 text-zinc-300">
                      {t.gameName}
                    </span>
                    <Badge variant="violet">{t.format}</Badge>
                    <Badge variant="lime">{t.status}</Badge>
                  </div>
                  <h4 className="font-bold text-sm text-white">{t.title}</h4>
                  <p className="text-[11px] text-zinc-400">
                    Prize Pool: <strong className="text-lime-400">{formatCurrency(t.prizePool)}</strong> • Slots: {t.registeredSlots}/{t.maxSlots} • Kickoff: {formatDate(t.startTime)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/organizer/tournaments/${t._id}/manage`}>
                    <Button size="sm" variant="secondary">
                      <Settings className="h-3.5 w-3.5 mr-1 text-violet-400" /> Manage & Room ID
                    </Button>
                  </Link>
                  <Link href={`/organizer/tournaments/${t._id}/matches`}>
                    <Button size="sm" variant="primary">
                      Score & Results
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Organization Branding Modal */}
      {isBrandingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0c0f18] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">
                <ShieldCheck className="h-5 w-5 text-lime-400" />
                Organization Clan Branding
              </div>
              <button
                type="button"
                onClick={() => setIsBrandingOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {brandingMessage && (
              <Alert variant={brandingMessage.type === "success" ? "success" : "error"}>
                {brandingMessage.text}
              </Alert>
            )}

            <form onSubmit={handleSaveBranding} className="space-y-6">
              {/* Logo Preview & Upload */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr from-violet-600 to-lime-400 p-[2px] shadow-lg">
                      <div className="w-full h-full rounded-[14px] bg-zinc-950 flex items-center justify-center overflow-hidden">
                        {editLogo ? (
                          <img
                            src={editLogo}
                            alt="Clan Logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShieldCheck className="h-8 w-8 text-zinc-600" />
                        )}
                      </div>
                    </div>
                    {editLogo && (
                      <button
                        type="button"
                        onClick={() => setEditLogo("")}
                        title="Remove Logo"
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs shadow-md hover:bg-red-500 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Clan / Organization Logo
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Displays across tournament cards, match rooms, and rankings.
                    </p>
                  </div>
                </div>

                <div>
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={handleLogoUpload}
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    isLoading={isUploadingLogo}
                    onClick={() => logoInputRef.current?.click()}
                    className="text-xs border-violet-500/30 hover:border-lime-500/50"
                  >
                    <Upload className="h-3.5 w-3.5 mr-1.5 text-lime-400" />
                    {editLogo ? "Change Logo" : "Upload Logo"}
                  </Button>
                </div>
              </div>

              {/* Organization Name */}
              <Input
                label="Organization / Clan Name"
                placeholder="e.g. GodLike Esports, Apex Clan"
                value={editOrgName}
                onChange={(e) => setEditOrgName(e.target.value)}
                required
                helperText="Public title displayed on your official tournaments."
              />

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBrandingOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="lime"
                  isLoading={isSavingBranding}
                >
                  <Save className="h-4 w-4 mr-1.5 text-black" /> Save Branding
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
