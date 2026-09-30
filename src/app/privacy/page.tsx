import React from "react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          Privacy & Data Protection Policy
        </h1>
        <p className="text-xs text-zinc-400">
          Last updated: January 2026 • Security & Confidentiality Commitment
        </p>
      </div>

      <div className="prose prose-invert max-w-none text-xs text-zinc-300 space-y-6 leading-relaxed bg-[#0e111a] border border-white/[0.08] p-6 lg:p-8 rounded-2xl">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-lime-400">
            1. Information We Collect
          </h2>
          <p>
            To provide fair-play esports matchmaking, we collect your email address, chosen username, in-game Character IDs (Free Fire UID / BGMI Character ID), match screenshots submitted for dispute resolution, and payment order receipts.
          </p>
          <p className="font-semibold text-zinc-200">
            We do NOT store or retain credit/debit card numbers or CVVs. All sensitive financial transactions are tokenized securely through Razorpay PCI-DSS compliant infrastructure.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-violet-400">
            2. How Information is Used
          </h2>
          <p>
            Your information is used solely for tournament matchmaking, slot assignment, match room access release, referee dispute investigations, and wallet ledger prize disbursements. We do not sell or monetize player data with third-party advertisers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-white">
            3. Data Retention & Deletion
          </h2>
          <p>
            Users may request full deletion of their gaming profile and match records at any time by contacting our privacy officer at privacy@battlexa.gg.
          </p>
        </section>
      </div>
    </div>
  );
}
