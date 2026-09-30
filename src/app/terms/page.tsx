import React from "react";
import Link from "next/link";
import { ShieldCheck, Scale, FileText, AlertTriangle, CheckCircle2, DollarSign, Lock, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Terms of Service & Rules of Engagement | BATTLEXA",
  description:
    "Official terms and conditions, user agreement, wallet policies, and tournament rules governing the BATTLEXA platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-wider">
          <FileText className="h-3.5 w-3.5" /> User Agreement & Platform Bylaws
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
          Please read these Terms of Service carefully before creating an account or participating in any esports tournaments on BATTLEXA.
        </p>
      </div>

      {/* Main Content Box */}
      <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 sm:p-8 lg:p-10 shadow-2xl space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        {/* Intro */}
        <section className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider text-lime-400">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing BATTLEXA (the “Platform”), registering an account, depositing funds, or registering for tournaments, you acknowledge that you have read, understood, and agreed to be legally bound by these Terms of Service, along with our <Link href="/privacy" className="text-lime-400 underline hover:text-white">Privacy Policy</Link>, <Link href="/refund-policy" className="text-lime-400 underline hover:text-white">Refund Policy</Link>, and <Link href="/fair-play" className="text-lime-400 underline hover:text-white">Fair Play Rules</Link>.
          </p>
          <p>
            If you do not agree with any provision of these terms, you must immediately cease accessing and using the Platform.
          </p>
        </section>

        {/* Skill Gaming */}
        <section className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider text-violet-400">
            2. Skill-Based Nature & No-Gambling Covenant
          </h2>
          <p>
            BATTLEXA functions strictly as an esports tournament automation, lobby management, and competitive matchmaking service. All matches hosted in Battle Royale video games (such as <strong className="text-white">Free Fire MAX</strong> and <strong className="text-white">BGMI</strong>) are games of pure skill, mental focus, tactical acumen, and lightning-fast reflexes.
          </p>
          <div className="p-3.5 bg-black/40 rounded-xl border border-violet-500/20 text-xs space-y-1">
            <p className="text-zinc-200 font-semibold">
              BATTLEXA DOES NOT OFFER OR FACILITATE GAMBLING, BETTING, CASINO WAGERING, OR GAMES OF CHANCE.
            </p>
            <p className="text-zinc-400 text-[11px]">
              No element of random drawing, lottery, or chance determines match results. All prize pool distributions strictly follow skill-based scoreboards (total verified kills and placement finish).
            </p>
          </div>
        </section>

        {/* Eligibility & Territories */}
        <section className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider text-white">
            3. Eligibility, Age & Geographic Restrictions
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-zinc-300">
            <li>You must be at least <strong className="text-white">18 years of age</strong> (or possess explicit verifiable consent from a parent/guardian) to enter cash prize tournaments.</li>
            <li>You must provide accurate and truthful personal information, including valid Free Fire UIDs / BGMI Character IDs that you legally own.</li>
            <li>
              In compliance with local gaming statutes, residents of <strong className="text-white">Assam, Odisha, Telangana, Andhra Pradesh, Nagaland, and Sikkim</strong> are restricted from entering paid prize pool tournaments. They may freely play in all non-cash Free Scrims.
            </li>
          </ul>
        </section>

        {/* Account Security */}
        <section className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider text-white">
            4. Account Registration & Credential Confidentiality
          </h2>
          <p>
            You are exclusively responsible for preserving the confidentiality of your account credentials (password, linked Google/Discord sessions). Any action taken through your account will be deemed to have been executed by you.
          </p>
          <p>
            You agree never to sell, transfer, or share your BATTLEXA profile, tournament tickets, or room slot keys with any third party.
          </p>
        </section>

        {/* Wallet & Payments */}
        <section className="space-y-3 p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center gap-2 text-lime-400 font-bold text-sm sm:text-base uppercase tracking-wider">
            <DollarSign className="h-4 w-4 shrink-0" />
            <span>5. Financial Ledger, Razorpay Gateway & Tax Compliance</span>
          </div>
          <div className="space-y-2 text-xs">
            <p>
              <strong className="text-white">Deposits:</strong> All user wallet top-ups are processed via authorized PCI-DSS compliant payment gateways (Razorpay). Funds added are exclusively earmarked for tournament participation.
            </p>
            <p>
              <strong className="text-white">Withdrawals:</strong> Winnings can be transferred to verified Indian UPI IDs or Bank Accounts. The minimum withdrawal threshold is ₹100.
            </p>
            <p>
              <strong className="text-white">Tax Deductions (TDS):</strong> As mandated under <strong className="text-lime-300">Section 194BA of the Indian Income Tax Act</strong>, applicable Tax Deducted at Source (TDS) will be computed and withheld from net winnings at the prevailing statutory rate prior to release, and certificates of deduction issued accordingly.
            </p>
          </div>
        </section>

        {/* Anti-Cheat */}
        <section className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider text-red-400">
            6. Fair Play Violations & Penalties
          </h2>
          <p>
            Violations of our Anti-Cheat code (including aimbots, wallhacks, PC emulators in mobile cups, room code leakage, teaming, or abusive toxicity) result in immediate slot disqualification, forfeiture of prizes, and permanent UID ban without refund.
          </p>
        </section>

        {/* Organizer Escrows */}
        <section className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider text-white">
            7. Organizer Conduct & Prize Pool Escrow
          </h2>
          <p>
            Tournament hosts must guarantee the integrity of custom match lobbies. Prize pools collected for community tournaments are held securely in platform escrow and disbursed automatically only upon referee confirmation of official in-game scores and screenshot verification.
          </p>
        </section>

        {/* Disclaimer of Warranties */}
        <section className="space-y-2 pt-2 border-t border-zinc-800">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider text-zinc-400">
            8. Limitation of Liability & Third-Party Outages
          </h2>
          <p className="text-zinc-400 text-xs">
            BATTLEXA is provided on an “as is” and “as available” basis. BATTLEXA cannot be held liable for match interruptions stemming from telecommunication network packet loss, personal device crashes, or third-party game server maintenance enacted by Garena, Krafton, or Apple/Google.
          </p>
        </section>

        {/* Governing Law */}
        <section className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider text-zinc-400">
            9. Governing Law & Dispute Jurisdiction
          </h2>
          <p className="text-zinc-400 text-xs">
            These Terms of Service are governed by and construed in accordance with the laws of the Republic of India. Any legal dispute or arbitration arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in India.
          </p>
        </section>
      </div>

      {/* Navigation footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800 text-xs text-zinc-400">
        <Link href="/privacy" className="hover:text-white transition-colors">
          Privacy Policy
        </Link>
        <Link href="/refund-policy" className="hover:text-white transition-colors">
          Refund Policy
        </Link>
        <Link href="/legality" className="hover:text-white transition-colors">
          Skill Gaming Legality
        </Link>
        <Link href="/fair-play" className="hover:text-white transition-colors">
          Fair Play Code
        </Link>
      </div>
    </div>
  );
}
