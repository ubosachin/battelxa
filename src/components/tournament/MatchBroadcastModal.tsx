"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Send,
  X,
  Mail,
  MessageSquare,
  Bell,
  Key,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Eye,
  Sparkles,
} from "lucide-react";

interface MatchBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  tournamentTitle: string;
  gameName?: string;
  initialRoomId?: string;
  initialPassword?: string;
  initialNotes?: string;
  registeredSlots?: number;
  discordWebhookUrl?: string;
  onBroadcastSuccess?: () => void;
}

export function MatchBroadcastModal({
  isOpen,
  onClose,
  tournamentId,
  tournamentTitle,
  gameName = "Battle Royale",
  initialRoomId = "",
  initialPassword = "",
  initialNotes = "",
  registeredSlots = 0,
  discordWebhookUrl = "",
  onBroadcastSuccess,
}: MatchBroadcastModalProps) {
  const [broadcastType, setBroadcastType] = useState<"CREDENTIALS" | "UPDATE" | "ANNOUNCEMENT">(
    initialRoomId ? "CREDENTIALS" : "UPDATE"
  );
  const [title, setTitle] = useState(
    initialRoomId
      ? "Match Room ID & Password Released! 🔑"
      : "Important Match Update & Instructions"
  );
  const [message, setMessage] = useState(
    initialRoomId
      ? "The custom room has been created. Gladiators must enter the lobby and take their assigned slot number immediately."
      : "Please review the updated schedule and match lobby guidelines."
  );

  const [includeCredentials, setIncludeCredentials] = useState(true);
  const [roomId, setRoomId] = useState(initialRoomId);
  const [password, setPassword] = useState(initialPassword);
  const [notes, setNotes] = useState(initialNotes || "Sit strictly in your assigned slot. Emulators are strictly barred.");

  const [sendEmail, setSendEmail] = useState(true);
  const [sendDiscord, setSendDiscord] = useState(true);
  const [sendInApp, setSendInApp] = useState(true);

  const [webhookUrl, setWebhookUrl] = useState(discordWebhookUrl);
  const [activeTab, setActiveTab] = useState<"CONFIG" | "PREVIEW_DISCORD" | "PREVIEW_EMAIL">("CONFIG");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultSummary, setResultSummary] = useState<{
    success: boolean;
    totalRegistered: number;
    emailsSent: number;
    discordWebhookDelivered: boolean;
    inAppDelivered: number;
    channels: string[];
    logs: string[];
  } | null>(null);

  useEffect(() => {
    if (initialRoomId) {
      setRoomId(initialRoomId);
      setIncludeCredentials(true);
      setBroadcastType("CREDENTIALS");
      setTitle("Match Room ID & Password Released! 🔑");
    }
    if (initialPassword) setPassword(initialPassword);
    if (initialNotes) setNotes(initialNotes);
    if (discordWebhookUrl) setWebhookUrl(discordWebhookUrl);
  }, [initialRoomId, initialPassword, initialNotes, discordWebhookUrl]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResultSummary(null);

    const channels: ("EMAIL" | "DISCORD" | "IN_APP")[] = [];
    if (sendEmail) channels.push("EMAIL");
    if (sendDiscord) channels.push("DISCORD");
    if (sendInApp) channels.push("IN_APP");

    if (channels.length === 0) {
      alert("Please select at least one delivery channel (Email, Discord, or In-App).");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          type: broadcastType,
          includeCredentials,
          credentials: includeCredentials
            ? {
                roomId: roomId.trim(),
                password: password.trim(),
                notes: notes.trim(),
              }
            : undefined,
          channels,
          customDiscordWebhookUrl: webhookUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.result) {
        setResultSummary(data.result);
        if (onBroadcastSuccess) onBroadcastSuccess();
      } else {
        alert(data.error || "Failed to dispatch broadcast");
      }
    } catch {
      alert("Network error dispatching broadcast.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-2xl bg-[#0b0f19] border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-gradient-to-r from-emerald-950/40 via-zinc-900/60 to-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                Broadcast Match Alert
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Discord & Email Embed
                </span>
              </h2>
              <p className="text-xs text-zinc-400 truncate max-w-md">
                {tournamentTitle} ({registeredSlots} Registered Gladiators)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/[0.08] bg-zinc-950/50 px-6 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("CONFIG")}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "CONFIG"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            ⚙️ Message & Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PREVIEW_DISCORD")}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "PREVIEW_DISCORD"
                ? "border-[#5865F2] text-[#5865F2]"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Discord Embed Preview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PREVIEW_EMAIL")}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "PREVIEW_EMAIL"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Email Template Preview
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {resultSummary ? (
            <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase">
                  Broadcast Dispatched Successfully!
                </h3>
                <p className="text-xs text-zinc-300 mt-1">
                  Alerts delivered to all {resultSummary.totalRegistered} registered players.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/[0.08]">
                  <div className="text-lg font-black text-emerald-400">
                    {resultSummary.emailsSent}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-zinc-400">
                    Emails Sent
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/[0.08]">
                  <div className="text-lg font-black text-[#5865F2]">
                    {resultSummary.discordWebhookDelivered ? "Delivered" : "Simulated"}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-zinc-400">
                    Discord Embed
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/[0.08]">
                  <div className="text-lg font-black text-amber-400">
                    {resultSummary.inAppDelivered}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-zinc-400">
                    In-App Alerts
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setResultSummary(null)}
                >
                  Send Another Alert
                </Button>
                <Button size="sm" onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          ) : activeTab === "CONFIG" ? (
            <form id="broadcast-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Broadcast Type Selector */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Notification Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBroadcastType("CREDENTIALS");
                      setIncludeCredentials(true);
                      setTitle("Match Room ID & Password Released! 🔑");
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      broadcastType === "CREDENTIALS"
                        ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                        : "bg-zinc-900/60 border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Key className="w-4 h-4" />
                    Room ID & Pass
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBroadcastType("UPDATE");
                      setTitle("Important Match Update");
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      broadcastType === "UPDATE"
                        ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                        : "bg-zinc-900/60 border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Match Update
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBroadcastType("ANNOUNCEMENT");
                      setTitle("Gladiator Announcement");
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      broadcastType === "ANNOUNCEMENT"
                        ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                        : "bg-zinc-900/60 border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Announcement
                  </button>
                </div>
              </div>

              {/* Title & Message */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Announcement Headline
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Match Room ID & Password Released! 🔑"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Instructions / Message Body
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="Enter instructions for players regarding match lobby, timing, or rules..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 resize-none"
                  />
                </div>
              </div>

              {/* Room Credentials Section */}
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCredentials}
                      onChange={(e) => setIncludeCredentials(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    Include Room ID & Password in Embed
                  </label>
                  <span className="text-[10px] text-zinc-400">
                    High-contrast credentials embed box
                  </span>
                </div>

                {includeCredentials && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Room ID
                      </label>
                      <input
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="e.g. 8492019"
                        className="w-full px-3 py-2 rounded-lg bg-black border border-white/[0.12] text-emerald-400 font-mono text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Password
                      </label>
                      <input
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="e.g. ffmax"
                        className="w-full px-3 py-2 rounded-lg bg-black border border-white/[0.12] text-emerald-400 font-mono text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Lobby Slot Guidelines
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Sit strictly in your designated slot number."
                        className="w-full px-3 py-1.5 rounded-lg bg-black border border-white/[0.12] text-zinc-300 text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Channels */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Delivery Channels
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      sendEmail
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                        : "bg-zinc-900 border-white/[0.06] text-zinc-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> Email
                      </div>
                      <div className="text-[10px] text-zinc-400">HTML embed</div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      sendDiscord
                        ? "bg-[#5865F2]/10 border-[#5865F2]/40 text-[#5865F2]"
                        : "bg-zinc-900 border-white/[0.06] text-zinc-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={sendDiscord}
                      onChange={(e) => setSendDiscord(e.target.checked)}
                      className="rounded accent-[#5865F2]"
                    />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> Discord
                      </div>
                      <div className="text-[10px] text-zinc-400">Rich Webhook/DM</div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      sendInApp
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                        : "bg-zinc-900 border-white/[0.06] text-zinc-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={sendInApp}
                      onChange={(e) => setSendInApp(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5" /> In-App
                      </div>
                      <div className="text-[10px] text-zinc-400">Bell Notification</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Optional Discord Webhook Input */}
              {sendDiscord && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Discord Webhook URL (Optional / Custom Channel)
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/[0.08] text-xs font-mono text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#5865F2]"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Leave blank to use the system default webhook or direct Discord notifications.
                  </p>
                </div>
              )}
            </form>
          ) : activeTab === "PREVIEW_DISCORD" ? (
            /* Discord Embed Preview */
            <div className="p-4 rounded-xl bg-[#2B2D31] border border-white/[0.06] font-sans text-xs space-y-2">
              <div className="text-[11px] font-bold text-zinc-400 flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Discord Message Simulation Preview
              </div>

              <div className="p-4 rounded-lg bg-[#1E1F22] border-l-4 border-emerald-500 space-y-3">
                <div className="text-sm font-black text-white hover:underline cursor-pointer flex items-center gap-1.5">
                  ⚔️ [BATTLEXA] {title} — {tournamentTitle}
                </div>
                <div className="text-zinc-300 text-xs whitespace-pre-line">{message}</div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-zinc-400">🎮 Game:</span>{" "}
                    <strong className="text-white">{gameName}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400">👥 Format:</span>{" "}
                    <strong className="text-white">TOURNAMENT / SCRIM</strong>
                  </div>
                </div>

                {includeCredentials && (roomId || password) && (
                  <div className="p-2.5 rounded bg-[#111214] border border-white/[0.06] grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-zinc-400">
                        🔐 Room ID
                      </div>
                      <div className="font-mono text-emerald-400 font-bold">{roomId || "TBA"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-zinc-400">
                        🔑 Password
                      </div>
                      <div className="font-mono text-emerald-400 font-bold">{password || "None"}</div>
                    </div>
                    {notes && (
                      <div className="col-span-2 text-[10px] text-zinc-400 italic">
                        ⚠️ {notes}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-[10px] text-[#5865F2] font-semibold flex items-center gap-1">
                  🔗 Click here to enter match vault &rarr;
                </div>

                <div className="text-[9px] text-zinc-500 border-t border-white/[0.04] pt-2">
                  BATTLEXA Tournament Engine • Automated Scrim Delivery • Today at {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          ) : (
            /* Email Template Preview */
            <div className="p-4 rounded-xl bg-black border border-white/[0.08] text-xs space-y-3">
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                HTML Email Embed Preview (Gladiator Personal View)
              </div>

              <div className="p-4 rounded-xl bg-[#0d111c] border border-white/[0.08] space-y-3">
                <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-black text-center text-sm">
                  ⚔️ BATTLEXA OFFICIAL NOTIFICATION
                  <div className="text-xs font-normal opacity-90">{title}</div>
                </div>

                <div className="p-3 rounded bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
                  <div className="text-white font-bold">{tournamentTitle}</div>
                  <div className="text-[11px] text-zinc-400">Game: {gameName}</div>
                </div>

                <div className="p-3 rounded bg-emerald-500/10 border-l-2 border-emerald-500 text-zinc-300 text-xs">
                  {message}
                </div>

                {includeCredentials && (roomId || password) && (
                  <div className="p-3 rounded-xl bg-[#131926] border border-emerald-500 text-center space-y-2">
                    <div className="text-[10px] uppercase font-black text-emerald-400">
                      🔐 Official Match Room Access
                    </div>
                    <div className="flex justify-center gap-4 text-xs">
                      <div>
                        <div className="text-[9px] text-zinc-500 uppercase">Room ID</div>
                        <div className="font-mono font-black text-white bg-black px-2 py-1 rounded">
                          {roomId || "TBA"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-zinc-500 uppercase">Password</div>
                        <div className="font-mono font-black text-white bg-black px-2 py-1 rounded">
                          {password || "None"}
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-amber-400 font-bold">
                      🎯 Your Assigned Slot: Slot #1
                    </div>
                  </div>
                )}

                <div className="text-center pt-2">
                  <span className="inline-block px-4 py-2 rounded bg-emerald-500 text-white font-bold text-xs">
                    Enter Tournament Arena Room &rarr;
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!resultSummary && (
          <div className="px-6 py-4 border-t border-white/[0.08] bg-zinc-950/80 flex items-center justify-between">
            <div className="text-xs text-zinc-400 flex items-center gap-1.5">
              <span>Audience:</span>
              <strong className="text-white">
                {registeredSlots} Registered Player{registeredSlots !== 1 ? "s" : ""}
              </strong>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                form="broadcast-form"
                size="sm"
                variant="primary"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2"
              >
                {isSubmitting ? (
                  "Dispatching..."
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Dispatch to Discord & Email
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
