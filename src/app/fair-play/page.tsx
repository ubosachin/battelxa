import React from "react";
import Link from "next/link";
import { ShieldCheck, AlertOctagon, Smartphone, Camera, Ban, Award, FileQuestion } from "lucide-react";

export const metadata = {
  title: "Fair Play & Anti-Cheat Rules | BATTLEXA",
  description:
    "Official Anti-Cheat standards, emulator restrictions, match verification requirements, and dispute resolution guidelines for BATTLEXA esports tournaments.",
};

export default function FairPlayPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="h-3.5 w-3.5" /> Zero-Tolerance Combat Integrity
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
          Fair Play & Anti-Cheat Policy
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
          Integrity is the bedrock of BATTLEXA. Every contender deserves a fair battlefield governed by transparent, strictly enforced rules.
        </p>
      </div>

      {/* Main Content Box */}
      <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 sm:p-8 lg:p-10 shadow-2xl space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        {/* Anti-Cheat Zero Tolerance */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-red-400 font-bold text-base sm:text-lg uppercase tracking-wide">
            <AlertOctagon className="h-5 w-5 shrink-0" />
            <span>1. Zero-Tolerance Hack & Modification Policy</span>
          </div>
          <p>
            Any player detected utilizing illicit third-party tools, injection files, or memory modifications will be subjected to an <strong className="text-red-400">immediate permanent platform hardware & UID ban</strong>. Prohibited modifications include, but are not limited to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
            <li><strong>Aimbots / Auto-Aim / Silent Aim</strong> or unauthorized crosshair manipulation scripts.</li>
            <li><strong>Wallhacks, ESP (Extra Sensory Perception)</strong>, antenna hacks, or entity radar trackers.</li>
            <li><strong>Speed Hacks, High Jump</strong>, water flight, or vehicle trajectory modifications.</li>
            <li><strong>No-Recoil scripts, macro key-binds</strong>, or automated shooting triggers via external hardware.</li>
            <li>Config files (Active.sav or obb modifications) that remove grass, smoke, trees, or textures.</li>
          </ul>
        </section>

        {/* Device & Emulator Rules */}
        <section className="space-y-3 p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center gap-2 text-lime-400 font-bold text-sm sm:text-base uppercase tracking-wider">
            <Smartphone className="h-4 w-4 shrink-0" />
            <span>2. Device Integrity: Mobile Only vs. Emulator Allowed</span>
          </div>
          <p>
            Unless explicitly designated as an <strong className="text-white">“EMULATOR ALLOWED”</strong> bracket by the tournament host in the match overview:
          </p>
          <div className="p-3.5 rounded-lg bg-black/40 border border-lime-500/20 text-xs space-y-2">
            <div className="flex items-center gap-2 text-lime-400 font-bold">
              <span>Touchscreen Mobile Devices Only (Android & iOS)</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              PC Emulators (BlueStacks, Gameloop, LDPlayer, Nox, MSI App Player, etc.) or peripheral converters (keyboard/mouse adapters, cronus, controllers) are strictly banned in standard mobile brackets.
            </p>
          </div>
          <p className="text-[11px] text-zinc-400">
            Organizers utilize internal game spectator heuristics and UID platform tags to detect emulator signatures. Violators forfeit their slots immediately with zero refund.
          </p>
        </section>

        {/* Room Slot Code Discipline */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-base sm:text-lg uppercase tracking-wide">
            <Ban className="h-5 w-5 shrink-0" />
            <span>3. Slot Discipline & Room Leakage</span>
          </div>
          <p>
            When Room ID and Password are automatically delivered to your BATTLEXA Contender Vault:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-300 text-xs">
            <li>
              You must occupy <strong className="text-white">only the designated slot number</strong> assigned to your registration ticket in the tournament lobby.
            </li>
            <li>
              Occupying another player’s or squad’s reserved slot without consent will lead to an immediate in-game kick by the match referee.
            </li>
            <li>
              <strong className="text-amber-300">Room Code Leakage:</strong> Sharing room credentials with unregistered third parties will lead to permanent account suspension and loss of wallet balance.
            </li>
          </ul>
        </section>

        {/* Screenshot Proof & Results Verification */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-violet-400 font-bold text-base sm:text-lg uppercase tracking-wide">
            <Camera className="h-5 w-5 shrink-0" />
            <span>4. Match Verification & Screenshot Submission</span>
          </div>
          <p>
            To guarantee instant, dispute-free payout settlements:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-zinc-300 text-xs">
            <li>
              All squad captains and solo contenders must take a clear, uncropped screenshot of the final in-game scoreboard showing:
              <ul className="list-disc pl-5 pt-1 space-y-0.5 text-zinc-400">
                <li>Total Team Kills</li>
                <li>Final Placement / Rank (e.g. #1 Booyah or Winner Winner Chicken Dinner)</li>
                <li>Player In-Game Names (IGN) matching your BATTLEXA profile</li>
              </ul>
            </li>
            <li>
              Screenshots must be uploaded within <strong className="text-white">15 minutes</strong> of match conclusion via the tournament details dashboard.
            </li>
            <li>
              Organizers verify the official host match logs before the automated smart contract / wallet ledger disburses winnings.
            </li>
          </ol>
        </section>

        {/* Collusion & Teaming */}
        <section className="space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
            5. Collusion, Teaming & Match Fixing
          </h2>
          <p>
            Teaming up with rival squads in solo or duo cups, intentional feed kills to inflate kill multipliers, or agreeing to pre-determined placements constitutes fraud.
          </p>
          <p className="text-zinc-400 text-xs">
            All involved participants will have their payouts frozen, tournament placement revoked, and accounts flagged on the platform-wide anti-fraud registry.
          </p>
        </section>

        {/* Dispute Resolution */}
        <section className="space-y-3 pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-lime-400 font-bold text-sm sm:text-base uppercase tracking-wider">
            <Award className="h-4 w-4 shrink-0" />
            <span>6. Referee Dispute Resolution Window</span>
          </div>
          <p>
            If you suspect a rival player violated tournament rules, file an official dispute ticket within <strong>30 minutes</strong> of match conclusion through <Link href="/contact" className="text-lime-400 underline hover:text-white">Player Support</Link>.
          </p>
          <p className="text-zinc-400 text-xs">
            Disputes must be accompanied by video proof (screen recording or match death replay) demonstrating the infraction. Official platform referees investigate all claims with final, binding authority.
          </p>
        </section>
      </div>

      {/* Navigation footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800 text-xs text-zinc-400">
        <Link href="/terms" className="hover:text-white transition-colors">
          Terms of Service
        </Link>
        <Link href="/legality" className="hover:text-white transition-colors">
          Legality & Skill Exemption
        </Link>
        <Link href="/refund-policy" className="hover:text-white transition-colors">
          Refund Policy
        </Link>
        <Link href="/contact" className="hover:text-white transition-colors">
          File a Referee Dispute
        </Link>
      </div>
    </div>
  );
}
