"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Globe,
  Wallet,
  User,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";

interface OrganizerApplicant {
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
  createdAt: string;
  userId?: {
    _id: string;
    username: string;
    email: string;
    role: string;
    avatar?: string;
    createdAt?: string;
  } | null;
}

interface StatsData {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function AdminOrganizersPage() {
  const [organizers, setOrganizers] = useState<OrganizerApplicant[]>([]);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING"); // Default to pending queue for admins!
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Rejection Modal State
  const [rejectingOrg, setRejectingOrg] = useState<OrganizerApplicant | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  const loadOrganizers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/organizers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrganizers(data.organizers || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
      setActionMessage({ type: "error", text: "Failed to load organizer applications" });
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadOrganizers();
  }, [loadOrganizers]);

  const handleUpdateStatus = async (
    id: string,
    status: "APPROVED" | "REJECTED" | "SUSPENDED" | "PENDING",
    reason?: string
  ) => {
    try {
      setActionMessage(null);
      const res = await fetch(`/api/admin/organizers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectionReason: reason }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionMessage({ type: "error", text: data.error || "Failed to update organization status." });
        return;
      }

      setActionMessage({
        type: "success",
        text: `Organization ${status === "APPROVED" ? "approved! User granted Host role." : `marked as ${status}.`}`,
      });
      loadOrganizers();
    } catch {
      setActionMessage({ type: "error", text: "Network error processing organization audit." });
    }
  };

  const handleConfirmRejection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingOrg) return;

    setIsSubmittingReject(true);
    await handleUpdateStatus(rejectingOrg._id, "REJECTED", rejectionReason.trim());
    setIsSubmittingReject(false);
    setRejectingOrg(null);
    setRejectionReason("");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950/60 via-[#0e111a] to-zinc-950 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-red-400" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-widest">
              Authority Desk
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Organization Audits & Host Approvals
          </h1>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Review community organizations created by players. When you approve an application, the creator is automatically granted the <strong>ORGANIZER</strong> role with authority to host scrims and tournaments.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => loadOrganizers()}
          className="self-start sm:self-auto shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh List
        </Button>
      </div>

      {actionMessage && (
        <Alert variant={actionMessage.type === "success" ? "success" : "error"}>
          {actionMessage.text}
        </Alert>
      )}

      {/* Directory Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setStatusFilter("ALL")}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            statusFilter === "ALL"
              ? "bg-zinc-800/80 border-white/30 ring-1 ring-white/20"
              : "bg-[#0e111a] border-white/[0.08] hover:border-white/20"
          }`}
        >
          <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
            Total Applications
          </div>
          <div className="text-2xl font-black text-white mt-1">{stats.total}</div>
          <div className="text-[11px] text-zinc-500">All registered clans</div>
        </div>

        <div
          onClick={() => setStatusFilter("PENDING")}
          className={`cursor-pointer p-4 rounded-xl border transition-all relative overflow-hidden ${
            statusFilter === "PENDING"
              ? "bg-amber-950/40 border-amber-500/50 ring-1 ring-amber-500/30"
              : "bg-[#0e111a] border-white/[0.08] hover:border-amber-500/30"
          }`}
        >
          {stats.pending > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          )}
          <div className="text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Pending Audit
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">{stats.pending}</div>
          <div className="text-[11px] text-zinc-400">Awaiting your approval</div>
        </div>

        <div
          onClick={() => setStatusFilter("APPROVED")}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            statusFilter === "APPROVED"
              ? "bg-lime-950/40 border-lime-500/50 ring-1 ring-lime-500/30"
              : "bg-[#0e111a] border-white/[0.08] hover:border-lime-500/30"
          }`}
        >
          <div className="text-lime-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Verified Hosts
          </div>
          <div className="text-2xl font-black text-lime-400 mt-1">{stats.approved}</div>
          <div className="text-[11px] text-zinc-400">Authorized to host cups</div>
        </div>

        <div
          onClick={() => setStatusFilter("REJECTED")}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            statusFilter === "REJECTED"
              ? "bg-red-950/40 border-red-500/50 ring-1 ring-red-500/30"
              : "bg-[#0e111a] border-white/[0.08] hover:border-red-500/30"
          }`}
        >
          <div className="text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5" /> Rejected
          </div>
          <div className="text-2xl font-black text-red-400 mt-1">{stats.rejected}</div>
          <div className="text-[11px] text-zinc-500">Non-compliant applications</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0e111a] border border-white/[0.08] flex flex-col md:flex-row items-center gap-3">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by organization name, creator username, email, phone, or UPI ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Status Pill Tabs */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-zinc-800 w-full md:w-auto overflow-x-auto">
          {[
            { id: "PENDING", label: `Pending (${stats.pending})` },
            { id: "APPROVED", label: `Approved (${stats.approved})` },
            { id: "REJECTED", label: `Rejected (${stats.rejected})` },
            { id: "ALL", label: `All (${stats.total})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? "bg-red-600 text-white shadow-sm shadow-red-950"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Application Cards List */}
      {isLoading ? (
        <div className="py-20 text-center text-zinc-400">
          <div className="inline-block animate-spin h-7 w-7 border-2 border-red-500 border-t-transparent rounded-full mb-3" />
          <p className="text-xs font-semibold tracking-wider uppercase">Auditing Organizations...</p>
        </div>
      ) : organizers.length === 0 ? (
        <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Organization Applications Found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {statusFilter === "PENDING"
              ? "All caught up! There are currently no pending organization applications awaiting audit."
              : "No organization profiles match your current search and filter parameters."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {organizers.map((org) => {
            const isApproved = org.status === "APPROVED";
            const isPending = org.status === "PENDING";
            const isRejected = org.status === "REJECTED";

            return (
              <div
                key={org._id}
                className={`rounded-2xl p-6 bg-[#0e111a] border transition-all space-y-5 ${
                  isPending
                    ? "border-amber-500/40 shadow-lg shadow-amber-950/20"
                    : isApproved
                    ? "border-lime-500/30"
                    : "border-white/[0.08]"
                }`}
              >
                {/* Top Strip */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-xl font-black text-white tracking-tight">
                        {org.organizationName}
                      </h2>
                      <Badge
                        variant={
                          isApproved ? "lime" : isRejected ? "red" : "amber"
                        }
                      >
                        {isPending && "⏳ "}
                        {isApproved && "🛡️ VERIFIED HOST"}
                        {isRejected && "❌ REJECTED"}
                        {org.status === "SUSPENDED" && "⚠️ SUSPENDED"}
                        {isPending && "PENDING AUDIT"}
                      </Badge>
                      <span className="text-[11px] text-zinc-500">
                        Submitted: {new Date(org.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed max-w-3xl whitespace-pre-line bg-black/30 p-3 rounded-xl border border-zinc-800/80">
                      {org.description || "No description provided."}
                    </p>
                  </div>

                  {/* Creator Info Box */}
                  <div className="shrink-0 p-3.5 rounded-xl bg-black/40 border border-zinc-800 text-xs space-y-1 min-w-[220px]">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                      <User className="h-3 w-3 text-red-400" /> Applicant User
                    </div>
                    <div className="font-bold text-white text-sm">
                      {org.userId?.username || "Unknown Contender"}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate">
                      {org.userId?.email || "No email"}
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 text-[10px]">
                      <span className="text-zinc-500">Current Role:</span>
                      <span className="font-mono uppercase font-bold text-red-400">
                        {org.userId?.role || "PLAYER"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact & Payment Verification Strip */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-2 border-t border-zinc-800/80 text-xs">
                  {org.phone && (
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Phone className="h-3.5 w-3.5 text-lime-400" />
                      <span className="font-semibold">Phone:</span>
                      <a
                        href={`https://wa.me/${org.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-lime-400 hover:underline"
                      >
                        {org.phone}
                      </a>
                    </div>
                  )}

                  {org.website && (
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Globe className="h-3.5 w-3.5 text-violet-400" />
                      <span className="font-semibold">Community / Discord:</span>
                      <a
                        href={org.website.startsWith("http") ? org.website : `https://${org.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-400 hover:underline flex items-center gap-1"
                      >
                        Open Link <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <Wallet className="h-3.5 w-3.5 text-amber-400" />
                    <span className="font-semibold">Host UPI Payout:</span>
                    <span className="font-mono text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      {org.upiId || "None provided"}
                    </span>
                  </div>
                </div>

                {/* Rejection Note Warning */}
                {isRejected && org.rejectionReason && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-900 text-xs text-red-300 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                    <div>
                      <strong>Audit Rejection Reason:</strong> {org.rejectionReason}
                    </div>
                  </div>
                )}

                {/* Audit Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/80">
                  <div className="text-[11px] text-zinc-500">
                    Organization ID: <span className="font-mono text-zinc-400">{org._id}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Approve Action */}
                    {!isApproved && (
                      <Button
                        size="sm"
                        variant="lime"
                        onClick={() => handleUpdateStatus(org._id, "APPROVED")}
                        className="font-bold text-xs"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Approve & Grant Host Role
                      </Button>
                    )}

                    {/* Reject Action */}
                    {!isRejected && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setRejectingOrg(org);
                          setRejectionReason(org.rejectionReason || "");
                        }}
                        className="font-bold text-xs"
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Reject Application
                      </Button>
                    )}

                    {/* Suspend Action (for currently approved hosts) */}
                    {isApproved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(org._id, "SUSPENDED")}
                        className="text-xs text-amber-400 hover:text-amber-300 border-amber-500/30"
                      >
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                        Suspend Privileges
                      </Button>
                    )}

                    {/* Reset to Pending (for rejected or suspended) */}
                    {(isRejected || org.status === "SUSPENDED") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUpdateStatus(org._id, "PENDING")}
                        className="text-xs text-zinc-400 hover:text-white"
                      >
                        Reset to Pending
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* REJECTION REASON MODAL                                     */}
      {/* ────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(rejectingOrg)}
        onClose={() => setRejectingOrg(null)}
        title={`Reject Organization: ${rejectingOrg?.organizationName || ""}`}
        maxWidth="md"
      >
        <form onSubmit={handleConfirmRejection} className="space-y-4">
          <p className="text-xs text-zinc-400">
            Specify a clear rejection reason. This message will be sent to the applicant user so they understand why the application was declined and can make appropriate corrections.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
              Audit Explanation / Rejection Reason
            </label>
            <textarea
              rows={4}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete community proof, invalid UPI ID for prize disbursement, or insufficient hosting experience..."
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Quick preset chips */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Quick Suggestions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Insufficient community track record or invalid Discord link",
                "Invalid or unreachable UPI ID provided for payouts",
                "Duplicate clan organization or unverified clan identity",
                "Please provide verifiable scrim hosting history and re-apply",
              ].map((suggestion) => (
                <button
                  type="button"
                  key={suggestion}
                  onClick={() => setRejectionReason(suggestion)}
                  className="text-[10px] bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded-md transition-colors text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRejectingOrg(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={isSubmittingReject}
              className="font-bold"
            >
              Confirm Rejection & Demote Role
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
