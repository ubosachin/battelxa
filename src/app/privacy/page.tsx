import React from "react";
import Link from "next/link";
import { Shield, Lock, Eye, Database, CheckCircle2, UserCheck } from "lucide-react";

export const metadata = {
  title: "Privacy & Data Protection Policy | BATTLEXA",
  description:
    "How BATTLEXA collects, secures, encrypts, and processes your personal gaming data under the Digital Personal Data Protection Act (DPDPA).",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-wider">
          <Shield className="h-3.5 w-3.5" /> Confidentiality & Data Security
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
          We respect your privacy and are committed to safeguarding the personal and competitive information you share with us.
        </p>
      </div>

      {/* Main Content Box */}
      <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 sm:p-8 lg:p-10 shadow-2xl space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        {/* Intro */}
        <section className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider text-lime-400">
            1. Commitment to Player Privacy
          </h2>
          <p>
            This Privacy Policy describes how BATTLEXA (“we”, “us”, or “our”) collects, stores, processes, and protects your information when you access our web application, play in tournaments, or utilize our gaming wallet. We adhere to the provisions of the <strong className="text-white">Digital Personal Data Protection Act, 2023 (DPDPA)</strong> of India and standard global data security protocols.
          </p>
        </section>

        {/* What We Collect */}
        <section className="space-y-3 p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center gap-2 text-violet-400 font-bold text-sm sm:text-base uppercase tracking-wider">
            <Database className="h-4 w-4 shrink-0" />
            <span>2. Categories of Information We Collect</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-black/40 border border-white/[0.05] space-y-1">
              <span className="text-white font-bold">Profile & Identity Data</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Email address, chosen username, avatar selection, and linked OAuth identifiers (Google OpenID / Discord ID).
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-black/40 border border-white/[0.05] space-y-1">
              <span className="text-white font-bold">Game Character Credentials</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Free Fire UID, BGMI Character ID, in-game name (IGN), and competitive playstyle preferences.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-black/40 border border-white/[0.05] space-y-1">
              <span className="text-white font-bold">Transaction & Ledger Data</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Razorpay payment order IDs, wallet balance ledgers, deposit receipts, and withdrawal destination UPI IDs / bank account details.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-black/40 border border-white/[0.05] space-y-1">
              <span className="text-white font-bold">Match Verification Records</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Scoreboard screenshots, referee match dispute submissions, match logs, and recorded kills/points.
              </p>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 pt-1">
            <strong className="text-lime-400">Card Data Security:</strong> BATTLEXA never stores, views, or logs full debit/credit card numbers or CVVs. All payment transactions are encrypted and tokenized via PCI-DSS Level 1 compliant infrastructure (Razorpay).
          </p>
        </section>

        {/* How We Use It */}
        <section className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider text-white">
            3. How We Use Your Data
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-zinc-300">
            <li>To verify player identity and assign tournament lobby slots.</li>
            <li>To automatically deliver encrypted Custom Room IDs and Passwords.</li>
            <li>To authenticate scores, resolve referee disputes, and detect illegal emulators or hacking software.</li>
            <li>To process instant wallet disbursements, UPI transfers, and statutory tax certificates (TDS).</li>
            <li>To send critical operational notifications regarding match timings and room opening alerts.</li>
          </ul>
        </section>

        {/* No Selling of Data */}
        <section className="space-y-2">
          <div className="p-4 rounded-xl bg-lime-950/20 border border-lime-500/30 text-lime-200 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-lime-400 text-sm">
              <Lock className="h-4 w-4" /> Strict Zero-Spam & No-Sale Guarantee
            </div>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              We DO NOT sell, rent, or lease your personal data or phone number to third-party telemarketers or external advertisers. Your gaming profile is utilized solely for your competitive journey on BATTLEXA.
            </p>
          </div>
        </section>

        {/* Cookies */}
        <section className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider text-white">
            4. Cookies & Session Storage
          </h2>
          <p>
            We utilize secure, encrypted HTTP-only session cookies to keep you signed in securely and remember your tournament preferences. We do not use intrusive tracking cookies across external websites.
          </p>
        </section>

        {/* Player Rights */}
        <section className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider text-white">
            5. Your Data Rights & Deletion Requests
          </h2>
          <p>
            Under the Digital Personal Data Protection Act, you have the right to review, update, or request the permanent deletion of your personal data and gaming profile from BATTLEXA databases.
          </p>
          <p className="text-zinc-400 text-xs">
            To submit an account erasure request, email our Data Protection Officer at <strong className="text-white">privacy@battlexa.gg</strong>. Requests are verified and processed within 7 business days, with any unspent wallet balance safely returned to source.
          </p>
        </section>
      </div>

      {/* Navigation footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800 text-xs text-zinc-400">
        <Link href="/terms" className="hover:text-white transition-colors">
          Terms of Service
        </Link>
        <Link href="/refund-policy" className="hover:text-white transition-colors">
          Refund Policy
        </Link>
        <Link href="/legality" className="hover:text-white transition-colors">
          Skill Gaming Legality
        </Link>
        <Link href="/contact" className="hover:text-white transition-colors">
          Privacy Officer Contact
        </Link>
      </div>
    </div>
  );
}
