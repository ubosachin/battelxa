"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Wallet, Check, X, ShieldAlert } from "lucide-react";

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [actionType, setActionType] = useState<"PROCESSED" | "REJECTED">("PROCESSED");
  const [transactionRef, setTransactionRef] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPayouts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/payouts");
      if (res.ok) {
        const data = await res.json();
        setPayouts(data.payouts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleActionConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout) return;
    setIsProcessing(true);

    try {
      const res = await fetch(`/api/admin/payouts/${selectedPayout._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: actionType,
          transactionReference: transactionRef.trim() || undefined,
          adminNotes: adminNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Action failed" });
        return;
      }

      setMessage({ type: "success", text: `Payout marked as ${actionType}` });
      setSelectedPayout(null);
      setTransactionRef("");
      setAdminNotes("");
      fetchPayouts();
    } catch {
      setMessage({ type: "error", text: "Network error processing payout" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Prize & Revenue Payout Clearance
        </h1>
        <p className="text-xs text-zinc-400">
          Verify banking records and record transfer transaction IDs to release locked player & host balances.
        </p>
      </div>

      {message && (
        <Alert variant={message.type === "success" ? "success" : "error"}>
          {message.text}
        </Alert>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-xs text-zinc-400">Loading payout queue...</div>
      ) : payouts.length === 0 ? (
        <div className="rounded-2xl bg-[#0e111a] border border-zinc-800 p-10 text-center text-xs text-zinc-500">
          No pending payout requests in the queue.
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] divide-y divide-zinc-800/80 overflow-hidden">
          {payouts.map((p) => (
            <div
              key={p._id}
              className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-lime-400">
                    {formatCurrency(p.amount)}
                  </span>
                  <Badge variant="violet">{p.role}</Badge>
                  <Badge
                    variant={
                      p.status === "PROCESSED"
                        ? "lime"
                        : p.status === "REJECTED"
                        ? "red"
                        : "amber"
                    }
                  >
                    {p.status}
                  </Badge>
                </div>
                <div className="text-xs text-zinc-300">
                  Beneficiary: <strong className="text-white">{p.userId?.username || "Warrior"}</strong> (
                  {p.userId?.email || "N/A"})
                </div>
                <div className="text-xs text-zinc-400 font-mono bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 w-fit">
                  {p.payoutMethod === "UPI"
                    ? `UPI VPA: ${p.payoutDetails?.upiId || "N/A"}`
                    : `A/C: ${p.payoutDetails?.accountNumber} | IFSC: ${p.payoutDetails?.ifscCode} | Name: ${p.payoutDetails?.accountHolderName}`}
                </div>
                <div className="text-[11px] text-zinc-500">
                  Requested on: {formatDate(p.requestedAt)}
                </div>
              </div>

              {p.status === "PENDING" && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="lime"
                    onClick={() => {
                      setSelectedPayout(p);
                      setActionType("PROCESSED");
                    }}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" /> Approve & Disburse
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setSelectedPayout(p);
                      setActionType("REJECTED");
                    }}
                  >
                    <X className="h-3.5 w-3.5 mr-1" /> Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!selectedPayout}
        onClose={() => setSelectedPayout(null)}
        title={actionType === "PROCESSED" ? "Confirm Payout Transfer" : "Reject Payout Request"}
        description={`Amount: ₹${selectedPayout?.amount} for ${selectedPayout?.userId?.username}`}
      >
        <form onSubmit={handleActionConfirm} className="space-y-4">
          {actionType === "PROCESSED" ? (
            <Input
              label="Bank / UPI Reference Number (UTR / Ref ID)"
              placeholder="e.g. UPI/391029485729 or IMPS19284759"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              required
            />
          ) : (
            <Input
              label="Reason for Rejection"
              placeholder="e.g. Invalid UPI ID or mismatch in bank account name"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              required
            />
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSelectedPayout(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={actionType === "PROCESSED" ? "lime" : "danger"}
              isLoading={isProcessing}
            >
              {actionType === "PROCESSED" ? "Mark Transferred" : "Reject & Refund"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
