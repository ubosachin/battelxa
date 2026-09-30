"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { User, Shield, Gamepad2, Save, CheckCircle2 } from "lucide-react";

export default function PlayerProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [gamerTag, setGamerTag] = useState("");
  const [freeFireId, setFreeFireId] = useState("");
  const [bgmiId, setBgmiId] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [discordHandle, setDiscordHandle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (data.profile) {
            setGamerTag(data.profile.gamerTag || "");
            setFreeFireId(data.profile.freeFireId || "");
            setBgmiId(data.profile.bgmiId || "");
            setBio(data.profile.bio || "");
            setPhone(data.profile.phone || "");
            setDiscordHandle(data.profile.discordHandle || "");
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/player/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gamerTag,
          freeFireId,
          bgmiId,
          bio,
          phone,
          discordHandle,
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Gamer profile & game IDs saved successfully!" });
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Failed to update profile" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error occurred." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-zinc-400 text-xs">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Gamer Profile & Credentials
        </h1>
        <p className="text-xs text-zinc-400">
          Manage your official in-game IDs. These are used by automated room verifiers to permit your custom lobby slot.
        </p>
      </div>

      {message && (
        <Alert variant={message.type === "success" ? "success" : "error"}>
          {message.text}
        </Alert>
      )}

      <form onSubmit={handleSave} className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-zinc-800">
          <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-violet-600 to-lime-500 flex items-center justify-center text-xl font-black text-black">
            {(gamerTag || user?.username || "P").substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-base text-white">{user?.username}</h3>
            <p className="text-xs text-zinc-400">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-violet-950 text-violet-300 border border-violet-800">
              Role: {user?.role}
            </span>
          </div>
        </div>

        {/* Game Verification IDs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lime-400">
            <Gamepad2 className="h-4 w-4" /> In-Game Character Credentials
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Free Fire MAX UID"
              placeholder="e.g. 192837465"
              value={freeFireId}
              onChange={(e) => setFreeFireId(e.target.value)}
              helperText="Find in FF MAX Profile > UID (numeric string)"
            />
            <Input
              label="BGMI Character ID"
              placeholder="e.g. 5182930491"
              value={bgmiId}
              onChange={(e) => setBgmiId(e.target.value)}
              helperText="Find in BGMI Profile > 10 digit Character ID"
            />
          </div>
        </div>

        {/* Profile info */}
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-400">
            <User className="h-4 w-4" /> Public Contender Info
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Gamer Tag / In-Game Nickname"
              placeholder="e.g. VORTEX_PHOENIX"
              value={gamerTag}
              onChange={(e) => setGamerTag(e.target.value)}
              required
            />
            <Input
              label="Discord Tag"
              placeholder="e.g. warrior#1234"
              value={discordHandle}
              onChange={(e) => setDiscordHandle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Gamer Bio
            </label>
            <textarea
              rows={3}
              placeholder="Tell squads about your playstyle, preferred roles (Assaulter/Sniper/IGL)..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" variant="lime" isLoading={isSaving}>
            <Save className="h-4 w-4 mr-1.5" /> Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
