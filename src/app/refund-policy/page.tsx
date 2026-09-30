import React from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, RefreshCw, Clock, Ban, DollarSign } from "lucide-react";

export const metadata = {
  title: "Refund & Cancellation Policy | BATTLEXA",
  description:
    "Official refund, cancellation, and transaction dispute policies for tournament entries and wallet balances on BATTLEXA.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-400 text-xs font-bold uppercase tracking-wider">
          <RefreshCw className="h-3.5 w-3.5" /> 100% Fair & Transparent Financial Protection
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
          Refund & Cancellation Policy
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
          Clear, automated policies protecting your entry fees and wallet balance in the event of match cancellations or technical disruptions.
        </p>
      </div>

      {/* Main Content Box */}
      <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 sm:p-8 lg:p-10 shadow-2xl space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        {/* Scenario 1: Host Cancellation */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-lime-400 font-bold text-base sm:text-lg uppercase tracking-wide">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>1. Tournament Cancellation by Organizer or Platform</span>
          </div>
          <p>
            If a tournament is cancelled by the host or platform administrators due to low squad turnout, technical issues, or scheduling conflicts:
          </p>
          <div className="p-4 rounded-xl bg-lime-950/20 border border-lime-500/30 text-lime-200 text-xs space-y-1 font-semibold">
            <p>
              100% of the tournament entry fee is automatically refunded back to each participant&apos;s BATTLEXA arena wallet immediately without any cancellation deduction.
            </p>
          </div>
        </section>

        {/* Scenario 2: Player Withdrawal */}
        <section className="space-y-3 p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center gap-2 text-violet-400 font-bold text-sm sm:text-base uppercase tracking-wider">
            <Clock className="h-4 w-4 shrink-0" />
            <span>2. Voluntary Player Withdrawal Before Deadline</span>
          </div>
          <p>
            Players or squad captains who decide to withdraw their registration <strong className="text-white">prior to the published Registration Deadline</strong> are entitled to a full, instant refund of their entry fee back to their arena wallet balance.
          </p>
          <div className="p-3.5 rounded-lg bg-black/40 border border-white/[0.05] text-[11px] text-zinc-400 space-y-1">
            <span className="text-amber-400 font-bold">Important Slot Locking Notice:</span>
            <p>
              Once the registration deadline passes or custom match credentials (Room ID & Password) have been unlocked in the Contender Vault, refunds can no longer be processed because that slot was permanently reserved and denied to other contenders.
            </p>
          </div>
        </section>

        {/* Scenario 3: Game Outage */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-base sm:text-lg uppercase tracking-wide">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>3. Official Publisher Server Outages (Krafton / Garena)</span>
          </div>
          <p>
            In the rare event of widespread game server downtime, emergency publisher maintenance patches, or game login failures preventing custom matches from taking place:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-300 text-xs">
            <li>The tournament host may announce an official reschedule window within 24 hours.</li>
            <li>If the match cannot be rescheduled or players cannot attend the revised time, 100% entry fee refunds will be credited within 2 hours of referee review.</li>
          </ul>
        </section>

        {/* Scenario 4: Anti-Cheat Disqualification */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-red-400 font-bold text-base sm:text-lg uppercase tracking-wide">
            <Ban className="h-5 w-5 shrink-0" />
            <span>4. Disqualifications for Cheating & Violations (Zero Refund)</span>
          </div>
          <p>
            Strict non-refundable penalties apply to any participant or squad disqualified for:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400 text-xs">
            <li>Use of prohibited third-party aimbots, ESP, config files, or illegal PC emulators in mobile cups.</li>
            <li>Leaking Room ID & Password to non-registered players.</li>
            <li>Occupying unauthorized slots or teaming with rival squads.</li>
          </ul>
          <p className="text-xs text-red-400 font-semibold pt-1">
            Disqualified users forfeit their entry fee, prize allocations, and wallet balance without recourse.
          </p>
        </section>

        {/* Scenario 5: Wallet Deposit Reversals */}
        <section className="space-y-3 p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center gap-2 text-lime-400 font-bold text-sm sm:text-base uppercase tracking-wider">
            <DollarSign className="h-4 w-4 shrink-0" />
            <span>5. Payment Gateway (Razorpay) Refund Processing Timelines</span>
          </div>
          <p className="text-xs text-zinc-300">
            For users requesting a direct refund of unused deposited funds back to their original payment source (Credit/Debit Card, UPI, Netbanking):
          </p>
          <div className="p-3.5 rounded-lg bg-black/40 border border-white/[0.05] space-y-1.5 text-xs text-zinc-300">
            <p><strong>Wallet Balance Refunds:</strong> Processed instantly inside BATTLEXA.</p>
            <p><strong>Bank / UPI Source Reversals:</strong> Processed via Razorpay within 24 hours. Banking networks typically credit your account within <strong>3 to 5 business days</strong> depending on your issuing bank.</p>
          </div>
        </section>

        {/* Support */}
        <section className="space-y-2 pt-2 border-t border-zinc-800">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider text-white">
            6. How to Request a Refund Review
          </h2>
          <p className="text-zinc-400 text-xs">
            If you experienced an uncredited payment or a tournament cancellation dispute, reach out to our billing team at <strong className="text-white">support@battlexa.gg</strong> with your Transaction ID or Tournament Ticket Number. We respond to all billing inquiries within 2 hours.
          </p>
        </section>
      </div>

      {/* Navigation footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800 text-xs text-zinc-400">
        <Link href="/terms" className="hover:text-white transition-colors">
          Terms of Service
        </Link>
        <Link href="/privacy" className="hover:text-white transition-colors">
          Privacy Policy
        </Link>
        <Link href="/fair-play" className="hover:text-white transition-colors">
          Fair Play Rules
        </Link>
        <Link href="/contact" className="hover:text-white transition-colors">
          Contact Billing Support
        </Link>
      </div>
    </div>
  );
}
