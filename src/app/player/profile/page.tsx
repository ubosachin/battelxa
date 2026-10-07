"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { User, Shield, Gamepad2, Save, CheckCircle2, Upload, X, Camera } from "lucide-react";
import { emitSyncEvent } from "@/lib/sync/sync-events";

interface ProfileUser {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
}

export default function PlayerProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [gamerTag, setGamerTag] = useState("");
  const [freeFireId, setFreeFireId] = useState("");
  const [bgmiId, setBgmiId] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [discordHandle, setDiscordHandle] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            setAvatar(data.profile.avatar || data.user?.avatar || "");
          } else if (data.user?.avatar) {
            setAvatar(data.user.avatar);
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select an image file (PNG, JPG, or WebP)." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size must be under 5MB." });
      return;
    }

    setIsUploadingAvatar(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAvatar(data.url);
        setMessage({
          type: "success",
          text: "Avatar image uploaded successfully! Click 'Save Changes' to update your profile.",
        });
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Failed to upload avatar" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to upload image due to network error." });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

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
          avatar,
        }),
      });

      if (res.ok) {
        emitSyncEvent("AUTH_SESSION_CHANGED");
        setMessage({ type: "success", text: "Gamer profile & avatar saved successfully!" });
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
          Manage your official in-game IDs and contender avatar. These are used across tournament rosters and leaderboards.
        </p>
      </div>

      {message && (
        <Alert variant={message.type === "success" ? "success" : "error"}>
          {message.text}
        </Alert>
      )}

      <form onSubmit={handleSave} className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="h-18 w-18 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-lime-400 p-[2px] shadow-lg shrink-0">
                <div className="w-full h-full rounded-[14px] bg-zinc-950 flex items-center justify-center overflow-hidden">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Player Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-black text-black bg-gradient-to-tr from-violet-600 to-lime-500">
                      {(gamerTag || user?.username || "P").substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar("")}
                  title="Remove avatar"
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs shadow-md hover:bg-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                {user?.username}
                {avatar && (
                  <span className="text-[10px] font-bold text-lime-400 bg-lime-950/60 border border-lime-500/30 px-1.5 py-0.5 rounded">
                    Custom Avatar
                  </span>
                )}
              </h3>
              <p className="text-xs text-zinc-400">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-violet-950 text-violet-300 border border-violet-800">
                Role: {user?.role}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={isUploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs border-violet-500/30 hover:border-lime-500/50"
            >
              <Upload className="h-3.5 w-3.5 mr-1.5 text-lime-400" />
              {avatar ? "Change Photo" : "Upload Profile Photo"}
            </Button>
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
