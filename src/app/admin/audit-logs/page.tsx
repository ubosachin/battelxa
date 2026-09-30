"use client";

import React, { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";
import { FileText, Shield } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch("/api/admin/audit-logs");
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Immutable Administrator Audit Logs
        </h1>
        <p className="text-xs text-zinc-400">
          Timestamped security log tracking all privileged administrative actions, approvals, and payout decisions.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-zinc-400">Loading audit records...</div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl bg-[#0e111a] border border-zinc-800 p-10 text-center text-xs text-zinc-500">
          No audit entries recorded yet.
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Admin Email</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-zinc-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-lime-400">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-white font-medium">
                      {log.actorEmail}
                    </td>
                    <td className="py-3 px-4 text-zinc-300">
                      {log.entityType} ({log.entityId.slice(-6)})
                    </td>
                    <td className="py-3 px-4 text-zinc-500 text-[11px]">
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
