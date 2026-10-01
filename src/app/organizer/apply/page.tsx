"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Trophy,
  Gamepad2,
  Users,
  Sparkles,
  Phone,
  Globe,
  Wallet,
  Edit3,
} from "lucide-react";

interface ExistingProfile {
  _id: string;
  organizationName: string;
  description: string;
  phone?: string;
  website?: string;
  upiId?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  verifiedByAdmin: boolean;
  rejectionReason?: string;
  tournamentsHosted?: number;
  createdAt?: string;
}

export default function OrganizerApplyPage() {
  const [organizationName, setOrganizationName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [upiId, setUpiId] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [existingProfile, setExistingProfile] = useState<ExistingProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadStatus = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/organizer/apply");
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setExistingProfile(data.profile);
          setOrganizationName(data.profile.organizationName || "");
          setDescription(data.profile.description || "");
          setPhone(data.profile.phone || "");
          setWebsite(data.profile.website || "");
          setUpiId(data.profile.upiId || "");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms && !existingProfile) {
      setMessage({
        type: "error",
        text: "Please agree to the BATTLEXA Fair Play and Organizer Guidelines.",
      });
      return;
    }

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

      setExistingProfile(data.profile);
      setIsEditing(false);
      setMessage({
        type: "success",
        text: "Organization application submitted! BATTLEXA administrators will review your credentials.",
      });
    } catch {
      setMessage({ type: "error", text: "Network error submitting application" });
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-zinc-400">
        <div className="inline-block animate-spin h-7 w-7 border-2 border-violet-500 border-t-transparent rounded-full mb-3" />
        <p className="text-xs font-semibold uppercase tracking-wider">Verifying Organization Credentials...</p>
      </div>
    );
  }

  const isApproved = existingProfile?.status === "APPROVED";
  const isPending = existingProfile?.status === "PENDING";
  const isRejected = existingProfile?.status === "REJECTED";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-violet-400" />
          <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">
            Esports Clan & Host Desk
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Create & Register Your Organization
        </h1>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Create your esports clan or organization. Once submitted, our Admin team audits your profile. Upon approval, you become the official <strong>Organization Admin / Host</strong> with full access to create custom rooms, scrims, and tournaments.
        </p>
      </div>

      {message && (
        <Alert variant={message.type === "success" ? "success" : "error"}>
          {message.text}
        </Alert>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. APPROVED STATE                                          */}
      {/* ────────────────────────────────────────────────────────── */}
      {isApproved && !isEditing && (
        <div className="rounded-2xl bg-gradient-to-br from-emerald-950/60 via-[#0e111a] to-zinc-950 border border-lime-500/50 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-lime-500/20 border border-lime-500/40 text-lime-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-lime-500/20 text-lime-400 border border-lime-500/30">
                Verified Organization Admin
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                {existingProfile.organizationName}
              </h2>
              <p className="text-xs text-zinc-300">
                Host authority verified by BATTLEXA Administration.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-black/40 border border-zinc-800 text-xs">
            <div>
              <div className="text-zinc-500 text-[10px] uppercase font-bold">Contact Phone</div>
              <div className="font-semibold text-white mt-0.5">{existingProfile.phone || "—"}</div>
            </div>
            <div>
              <div className="text-zinc-500 text-[10px] uppercase font-bold">Discord / Website</div>
              <div className="font-semibold text-violet-400 truncate mt-0.5">
                {existingProfile.website || "—"}
              </div>
            </div>
            <div>
              <div className="text-zinc-500 text-[10px] uppercase font-bold">Prize UPI ID</div>
              <div className="font-mono text-lime-400 font-semibold mt-0.5">
                {existingProfile.upiId || "—"}
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link href="/organizer/dashboard" className="w-full sm:w-auto">
              <Button variant="lime" className="w-full sm:w-auto text-xs font-bold">
                <Trophy className="h-4 w-4 mr-1.5 text-black" /> Open Host Console
              </Button>
            </Link>
            <Link href="/organizer/tournaments/create" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto text-xs font-bold">
                <Gamepad2 className="h-4 w-4 mr-1.5 text-violet-400" /> Host New Tournament / Scrim
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto text-xs"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1" /> Update Profile
            </Button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. PENDING REVIEW STATE                                    */}
      {/* ────────────────────────────────────────────────────────── */}
      {isPending && !isEditing && (
        <div className="rounded-2xl bg-gradient-to-br from-amber-950/40 via-[#0e111a] to-zinc-950 border border-amber-500/40 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Application Under Admin Audit
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                {existingProfile.organizationName}
              </h2>
              <p className="text-xs text-zinc-300">
                Submitted for administrative review. Expected turnaround: &lt; 24 hours.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-zinc-800 text-xs text-zinc-400 space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-400" /> What happens next?
            </div>
            <p>
              1. Our referee compliance team audits your clan name, contact details, and community track record.
            </p>
            <p>
              2. Once approved, your account is immediately granted the <strong>ORGANIZER</strong> role.
            </p>
            <p>
              3. You will be able to create custom rooms, host Free Fire MAX & BGMI scrims, collect entry fees, and disburse prize money.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-zinc-500">Need to make adjustments?</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-xs"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit Submitted Details
            </Button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. REJECTED STATE                                          */}
      {/* ────────────────────────────────────────────────────────── */}
      {isRejected && !isEditing && (
        <div className="rounded-2xl bg-gradient-to-br from-red-950/40 via-[#0e111a] to-zinc-950 border border-red-500/50 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-red-600 text-black">
                Application Declined by Admin
              </span>
              <h2 className="text-xl font-black text-white mt-1">
                {existingProfile.organizationName}
              </h2>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-200 space-y-1">
            <div className="font-bold text-red-300">Admin Rejection Feedback:</div>
            <p className="leading-relaxed">
              {existingProfile.rejectionReason || "Application did not meet platform verification standards."}
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="font-bold text-xs"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1" /> Correct Details & Re-Submit Application
            </Button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. CREATION / EDITING FORM                                 */}
      {/* ────────────────────────────────────────────────────────── */}
      {(!existingProfile || isEditing) && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 lg:p-8 space-y-6 shadow-xl"
        >
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lime-400">
              <ShieldCheck className="h-4 w-4" />
              {isEditing ? "Update Organization Application" : "New Organization Registration"}
            </div>
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Cancel Editing
              </button>
            )}
          </div>

          {/* Org Name */}
          <Input
            label="Organization / Clan Name"
            placeholder="e.g. GodLike Esports, Apex Clan, Team Velocity"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            required
            helperText="The public branding under which your tournaments and scrims will be listed."
          />

          {/* Description & Experience */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
              Host Background & Community Experience
            </label>
            <textarea
              rows={4}
              placeholder="Describe your previous experience managing competitive scrims, active Discord/WhatsApp player count, YouTube streaming presence, and why your clan should be verified..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 leading-relaxed"
              required
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone / WhatsApp"
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              helperText="For admin verification & urgent match dispute calls."
            />

            <Input
              label="Discord Server / Social Channel URL"
              placeholder="https://discord.gg/yourclan"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              helperText="Link to your public clan community or YouTube."
            />
          </div>

          {/* UPI ID */}
          <Input
            label="Host Payout UPI ID"
            placeholder="clanlead@okhdfcbank"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            required
            helperText="Where entry fee revenue shares will be disbursed after tournament completion."
          />

          {/* Terms Checkbox */}
          <div className="p-4 rounded-xl bg-black/40 border border-zinc-800 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-lime-500 focus:ring-lime-500"
              />
              <span className="text-xs text-zinc-300 leading-relaxed select-none">
                I agree to the <strong>BATTLEXA Host & Fair Play Guidelines</strong>. I pledge to release match room credentials strictly on time, maintain honest anti-cheat adjudication, and promptly report tournament standings.
              </span>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-zinc-500">
              Submitted applications are reviewed by Admin within 24 hours.
            </span>
            <Button
              type="submit"
              variant="lime"
              isLoading={isApplying}
              className="font-bold text-xs"
            >
              {isEditing ? "Submit Updated Application" : "Submit Organization Application"}
            </Button>
          </div>
        </form>
      )}

      {/* Perks Info Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <div className="p-4 rounded-xl bg-[#0e111a] border border-white/[0.06] space-y-1.5">
          <div className="flex items-center gap-2 text-lime-400 font-bold text-xs uppercase tracking-wider">
            <Trophy className="h-4 w-4" /> Host Custom Cups
          </div>
          <p className="text-[11px] text-zinc-400">
            Publish Free Fire MAX and BGMI tournaments with custom slot limits and entry fees.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0e111a] border border-white/[0.06] space-y-1.5">
          <div className="flex items-center gap-2 text-violet-400 font-bold text-xs uppercase tracking-wider">
            <Users className="h-4 w-4" /> Clan Authority
          </div>
          <p className="text-[11px] text-zinc-400">
            Get an official verified badge beside your organization name and on tournament brackets.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0e111a] border border-white/[0.06] space-y-1.5">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Wallet className="h-4 w-4" /> Automated Revenue
          </div>
          <p className="text-[11px] text-zinc-400">
            Earn your host revenue share disbursed directly to your registered UPI address.
          </p>
        </div>
      </div>
    </div>
  );
}
