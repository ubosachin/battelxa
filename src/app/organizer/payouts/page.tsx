"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Wallet, ShieldCheck, Clock, ArrowUpRight } from "lucide-react";

interface WalletData {
  balance: number;
  lockedBalance: number;
}

interface PayoutRequestItem {
  _id: string;
  amount: number;
  payoutMethod: string;
  requestedAt: string;
  status: string;
}

export default function OrganizerPayoutsPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequestItem[]>([]);
  const [amount, setAmount] = useState("500");
  const [upiId, setUpiId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadPayoutData() {
      try {
        const res = await fetch("/api/wallet");
        if (isMounted && res.ok) {
          const data = await res.json();
          setWallet(data.wallet);
          setPayoutRequests(data.payoutRequests || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadPayoutData();
    return () => {
      isMounted = false;
    };
  }, [refreshIndex]);

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 100) {
      setMessage({ type: "error", text: "Minimum payout request is ₹100" });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          payoutMethod: "UPI",
          upiId: upiId.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Payout request failed" });
        return;
      }

      setMessage({
        type: "success",
        text: "Organizer revenue payout request queued for admin disbursement.",
      });
      setRefreshIndex((prev) => prev + 1);
    } catch {
      setMessage({ type: "error", text: "Network error requesting payout" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Host Revenue & Payouts
        </h1>
        <p className="text-xs text-zinc-400">
          Disburse your organizer tournament commission earnings directly to your UPI ID.
        </p>
      </div>

      {message && (
        <Alert variant={message.type === "success" ? "success" : "error"}>
          {message.text}
        </Alert>
      )}

      {/* Balance card */}
      <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-lime-400">
            Available Revenue Balance
          </span>
          <div className="text-3xl sm:text-4xl font-black text-white mt-1">
            {formatCurrency(wallet?.balance || 0)}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Pending Admin Clearance: {formatCurrency(wallet?.lockedBalance || 0)}
          </p>
        </div>

        <form onSubmit={handlePayoutSubmit} className="flex flex-col sm:flex-row items-end gap-3">
          <Input
            label="Withdrawal Amount (₹)"
            type="number"
            min="100"
            max={wallet?.balance || 50000}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <Input
            label="Host UPI ID"
            placeholder="host@okhdfcbank"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            required
          />
          <Button type="submit" variant="lime" isLoading={isSubmitting} className="shrink-0">
            <ArrowUpRight className="h-4 w-4 mr-1 text-black" /> Request Payout
          </Button>
        </form>
      </div>

      {/* History table */}
      <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 space-y-4">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-violet-400" /> Revenue Payout Records
        </h3>

        {payoutRequests.length === 0 ? (
          <p className="text-xs text-zinc-500 py-6 text-center">
            No payout requests filed yet.
          </p>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {payoutRequests.map((p) => (
              <div
                key={p._id}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white block">
                    {formatCurrency(p.amount)} via {p.payoutMethod}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Requested on {formatDate(p.requestedAt)}
                  </span>
                </div>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
