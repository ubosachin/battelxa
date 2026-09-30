"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { formatDate } from "@/lib/utils";
import { AlertTriangle, Check, ExternalLink, Shield } from "lucide-react";

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDisputes = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/disputes");
      if (res.ok) {
        const data = await res.json();
        setDisputes(data.disputes || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (id: string, status: "RESOLVED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/admin/disputes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, resolutionNotes: `Referee ruling: Dispute marked ${status}` }),
      });

      if (res.ok) {
        fetchDisputes();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Referee Dispute Investigation Desk
        </h1>
        <p className="text-xs text-zinc-400">
          Review player match complaints, inspect uploaded screenshot proofs, and enforce fair-play decisions.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-zinc-400">Loading disputes...</div>
      ) : disputes.length === 0 ? (
        <div className="rounded-2xl bg-[#0e111a] border border-zinc-800 p-10 text-center text-xs text-zinc-500">
          No open disputes currently pending review.
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] divide-y divide-zinc-800/80 overflow-hidden">
          {disputes.map((d) => (
            <div key={d._id} className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">
                    Case #{d._id.slice(-6)}
                  </span>
                  <Badge variant={d.status === "RESOLVED" ? "lime" : "amber"}>
                    {d.status}
                  </Badge>
                </div>
                <span className="text-[11px] text-zinc-500">
                  Filed on {formatDate(d.createdAt)}
                </span>
              </div>

              <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-xs text-zinc-300">
                <span className="text-zinc-500 uppercase font-bold text-[10px] block mb-1">
                  Report Reason:
                </span>
                {d.reason}
              </div>

              {d.evidenceUrls && d.evidenceUrls.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">
                    Attached Evidence Links:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {d.evidenceUrls.map((url: string, i: number) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-violet-300 font-semibold"
                      >
                        Evidence Proof #{i + 1} <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {d.status === "PENDING" && (
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="lime"
                    onClick={() => handleResolve(d._id, "RESOLVED")}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" /> Uphold & Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleResolve(d._id, "REJECTED")}
                  >
                    Dismiss Dispute
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
