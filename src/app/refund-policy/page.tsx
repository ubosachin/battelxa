import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          Refund & Cancellation Policy
        </h1>
        <p className="text-xs text-zinc-400">
          Last updated: January 2026 • 100% Guaranteed Fair Tournament Operations
        </p>
      </div>

      <div className="prose prose-invert max-w-none text-xs text-zinc-300 space-y-6 leading-relaxed bg-[#0e111a] border border-white/[0.08] p-6 lg:p-8 rounded-2xl">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-lime-400">
            1. Tournament Cancellation by Organizer
          </h2>
          <p>
            If a tournament is cancelled by the host or platform administrators due to technical issues, game server maintenance, or failure to meet minimum required squads:
          </p>
          <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-lime-400 font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            100% of the tournament entry fee is automatically refunded back to your BATTLEXA arena wallet immediately.
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-violet-400">
            2. Player Withdrawal Prior to Registration Deadline
          </h2>
          <p>
            Players who cancel their registration prior to the published registration deadline are eligible for a full refund back to their wallet balance. Once the registration deadline passes or custom room credentials have been unlocked, refunds cannot be granted as slot allocation is locked.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
            3. Server Outage or Custom Room Failure
          </h2>
          <p>
            In the rare event of official game server outages (e.g. Krafton / Garena regional maintenance) where custom matches cannot proceed, the tournament will either be rescheduled or full refunds issued within 2 hours of referee review.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-red-400">
            4. Cheating & Rule Violations (No Refund)
          </h2>
          <p>
            Players or squads disqualified for hacking, emulator usage in mobile cups, teaming with opposing squads, or abusive behavior in match lobbies are strictly non-refundable and forfeit any pending prize money.
          </p>
        </section>
      </div>
    </div>
  );
}
