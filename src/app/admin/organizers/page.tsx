"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { ShieldCheck, Check, X, ShieldAlert, Phone, Globe } from "lucide-react";

export default function AdminOrganizersPage() {
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchOrganizers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/organizers");
      if (res.ok) {
        const data = await res.json();
        setOrganizers(data.organizers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const handleUpdateStatus = async (id: string, status: "APPROVED" | "REJECTED" | "SUSPENDED") => {
    try {
      const res = await fetch(`/api/admin/organizers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setActionMessage(`Organizer status changed to ${status}`);
        fetchOrganizers();
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Organizer Verification & Compliance
        </h1>
        <p className="text-xs text-zinc-400">
          Review clan reputations, authorize tournament publishing permissions, and enforce host guidelines.
        </p>
      </div>

      {actionMessage && <Alert variant="success">{actionMessage}</Alert>}

      {isLoading ? (
        <div className="py-12 text-center text-xs text-zinc-400">Loading organizers...</div>
      ) : organizers.length === 0 ? (
        <div className="rounded-2xl bg-[#0e111a] border border-zinc-800 p-10 text-center text-xs text-zinc-500">
          No organizer applications currently pending review.
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] divide-y divide-zinc-800/80 overflow-hidden">
          {organizers.map((org) => (
            <div
              key={org._id}
              className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white">
                    {org.organizationName}
                  </h3>
                  <Badge
                    variant={
                      org.status === "APPROVED"
                        ? "lime"
                        : org.status === "REJECTED"
                        ? "red"
                        : "amber"
                    }
                  >
                    {org.status}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-300 max-w-xl">
                  {org.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-400 pt-1">
                  {org.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-lime-400" /> {org.phone}
                    </span>
                  )}
                  {org.website && (
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-violet-400 hover:underline"
                    >
                      <Globe className="h-3 w-3" /> Channel / Discord
                    </a>
                  )}
                  <span>
                    UPI Payout:{" "}
                    <strong className="text-white">{org.upiId || "None"}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {org.status !== "APPROVED" && (
                  <Button
                    size="sm"
                    variant="lime"
                    onClick={() => handleUpdateStatus(org._id, "APPROVED")}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" /> Approve Host
                  </Button>
                )}
                {org.status !== "REJECTED" && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleUpdateStatus(org._id, "REJECTED")}
                  >
                    <X className="h-3.5 w-3.5 mr-1" /> Reject
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
