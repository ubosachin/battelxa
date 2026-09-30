"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { ShieldAlert, Upload, Send, CheckCircle2 } from "lucide-react";

export default function PlayerSupportPage() {
  const [tournamentId, setTournamentId] = useState("");
  const [reason, setReason] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    if (!tournamentId.trim()) {
      setMessage({
        type: "error",
        text: "Please provide a valid Tournament ID to file a dispute.",
      });
      setIsSubmitting(false);
      return;
    }

    if (!evidenceUrl.trim()) {
      setMessage({
        type: "error",
        text: "Please provide a screenshot or recording evidence URL (Imgur, Cloudinary, Drive).",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/matches/general/disputes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId: tournamentId.trim(),
          reason,
          evidenceUrls: [evidenceUrl.trim()],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to submit dispute" });
        return;
      }

      setMessage({
        type: "success",
        text: "Dispute submitted to referee desk! Case #DSP-" + Date.now().toString().slice(-5),
      });
      setReason("");
      setEvidenceUrl("");
    } catch {
      setMessage({ type: "error", text: "Network error submitting dispute" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Fair Play & Dispute Desk
        </h1>
        <p className="text-xs text-zinc-400">
          Encountered emulator bypass, hacker scripts, or incorrect score placement? Submit evidence for referee investigation.
        </p>
      </div>

      {message && (
        <Alert variant={message.type === "success" ? "success" : "error"}>
          {message.text}
        </Alert>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 lg:p-8 space-y-5"
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
          <ShieldAlert className="h-4 w-4" /> Official Dispute Filing
        </div>

        <Input
          label="Tournament ID or Match Title"
          placeholder="e.g. Free Fire Bermuda Masters or ID string"
          value={tournamentId}
          onChange={(e) => setTournamentId(e.target.value)}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Dispute Details & Specific Violation
          </label>
          <textarea
            rows={4}
            placeholder="Explain the incident (e.g. Opponent in Slot 6 was using emulator or spectator ghosting)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            required
          />
        </div>

        <Input
          label="Screenshot / Screen Recording URL"
          placeholder="https://cloudinary.com/... or Google Drive / Imgur link"
          value={evidenceUrl}
          onChange={(e) => setEvidenceUrl(e.target.value)}
          helperText="Referees require unedited scoreboard screenshots or clip evidence to overturn results."
          required
        />

        <div className="pt-2 flex justify-end">
          <Button type="submit" variant="lime" isLoading={isSubmitting}>
            <Send className="h-4 w-4 mr-1.5" /> Submit to Referee Team
          </Button>
        </div>
      </form>
    </div>
  );
}
