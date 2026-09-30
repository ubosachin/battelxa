"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { ShieldCheck, CheckCircle2, Clock, Upload } from "lucide-react";

export default function OrganizerApplyPage() {
  const [organizationName, setOrganizationName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [upiId, setUpiId] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [status, setStatus] = useState<"PENDING" | "APPROVED" | "NOT_APPLIED">("NOT_APPLIED");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user?.isVerifiedOrganizer) {
            setStatus("APPROVED");
          } else if (data.user?.role === "ORGANIZER") {
            setStatus("PENDING");
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    setMessage(null);

    try {
      const res = await fetch("/api/organizer/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationName,
          description,
          phone,
          website,
          upiId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Application submission failed" });
        return;
      }

      setStatus("PENDING");
      setMessage({
        type: "success",
        text: "Application submitted! Admin verification typically completes within 24 hours.",
      });
    } catch {
      setMessage({ type: "error", text: "Network error submitting application" });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Organizer Verification Portal
        </h1>
        <p className="text-xs text-zinc-400">
          Verified organizers enjoy elevated tournament slots, official badge certification, and automated revenue payouts.
        </p>
      </div>

      {status === "APPROVED" ? (
        <div className="p-8 rounded-2xl bg-emerald-950/40 border border-lime-500/40 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-lime-500/20 text-lime-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-black text-white">
            You Are a Certified BATTLEXA Organizer
          </h2>
          <p className="text-xs text-zinc-300 max-w-md mx-auto">
            Your host credentials and payouts are fully verified. You can create public cups, collect entry fees, and distribute prize money.
          </p>
        </div>
      ) : status === "PENDING" ? (
        <div className="p-8 rounded-2xl bg-amber-950/30 border border-amber-600/40 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
            <Clock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-black text-white">
            Application Under Compliance Review
          </h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Our referee compliance team is reviewing your organization profile and tournament track record. You will receive an in-app notification once verified.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 lg:p-8 space-y-5"
        >
          {message && (
            <Alert variant={message.type === "success" ? "success" : "error"}>
              {message.text}
            </Alert>
          )}

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lime-400">
            <ShieldCheck className="h-4 w-4" /> Organizer Application Details
          </div>

          <Input
            label="Organization / Clan Name"
            placeholder="e.g. Apex Esports India"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Host Experience & Community Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe your previous experience hosting Free Fire MAX or BGMI scrims, social channels, and Discord server..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone / WhatsApp"
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="Discord Server or Website URL"
              placeholder="https://discord.gg/yourclan"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <Input
            label="Organizer UPI ID (for Tournament Revenue Payouts)"
            placeholder="host@upi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            helperText="Where entry fee shares will be disbursed upon tournament completion."
            required
          />

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="lime" isLoading={isApplying}>
              Submit Application
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
