import React from "react";
import { ShieldAlert, CheckCircle } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          Terms of Service & Rules of Engagement
        </h1>
        <p className="text-xs text-zinc-400">
          Last updated: January 2026 • Effective for all Free Fire MAX & BGMI Competitions
        </p>
      </div>

      <div className="prose prose-invert max-w-none text-xs text-zinc-300 space-y-6 leading-relaxed bg-[#0e111a] border border-white/[0.08] p-6 lg:p-8 rounded-2xl">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-lime-400">
            1. Skill-Based Competition Policy
          </h2>
          <p>
            BATTLEXA is an esports tournament hosting and matchmaking utility. All competitions hosted on the platform in Free Fire MAX and BGMI are pure games of skill. Success relies entirely on hand-eye coordination, tactical map knowledge, reaction time, and teamwork.
          </p>
          <p className="font-semibold text-zinc-200">
            BATTLEXA does NOT offer gambling, betting, wagering, casino games, or games of chance.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-violet-400">
            2. Anti-Cheat, Hacks & Emulator Strict Policy
          </h2>
          <p>
            The use of scripts, third-party aimbots, wallhacks, APK modifications, speedhacks, or unpermitted PC emulators in mobile tournaments is strictly prohibited. Any player or team discovered violating this rule will face:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Immediate tournament disqualification without refund</li>
            <li>Permanent forfeiture of earned prize money</li>
            <li>Permanent hardware and UID ban from BATTLEXA</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-white">
            3. Room Credentials & Slot Discipline
          </h2>
          <p>
            Custom Room ID and Password are confidential and provided exclusively to verified participants. Players must strictly join their designated slot number. Joining unauthorized slots or leaking room credentials to non-registered players will lead to an instant ban.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-white">
            4. Wallet Transactions & Withdrawals
          </h2>
          <p>
            All entry fees and deposits are processed via Razorpay. Winnings can be withdrawn via UPI or Bank Transfer subject to compliance verification and minimum threshold limits (₹100).
          </p>
        </section>
      </div>
    </div>
  );
}
