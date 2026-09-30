import React from "react";
import Link from "next/link";
import { ShieldCheck, Scale, AlertTriangle, CheckCircle2, FileText, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Legality & Skill-Based Gaming Disclaimer | BATTLEXA",
  description:
    "Legal status and regulatory compliance of competitive esports tournaments hosted on BATTLEXA under Indian law.",
};

export default function LegalityPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-400 text-xs font-bold uppercase tracking-wider">
          <Scale className="h-3.5 w-3.5" /> 100% Legal & Constitutional Compliance
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
          Legality & Skill-Based Gaming
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
          Comprehensive legal declaration regarding competitive esports tournaments hosted on BATTLEXA in compliance with Indian Constitutional jurisprudence.
        </p>
      </div>

      {/* Main Content Box */}
      <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 sm:p-8 lg:p-10 shadow-2xl space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        {/* Supreme Court Exemption */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-lime-400 font-bold text-base sm:text-lg uppercase tracking-wide">
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <span>1. Games of Mere Skill vs. Gambling</span>
          </div>
          <p>
            Under Section 12 of the Public Gambling Act, 1867, and consistent state enactments across India, games of <strong className="text-white">“mere skill”</strong> are explicitly exempt from all anti-gambling and betting prohibitions.
          </p>
          <p>
            The Hon’ble Supreme Court of India in landmark precedents, including <em>State of Bombay v. R.M.D. Chamarbaugwala (1957)</em> and <em>K.R. Lakshmanan v. State of Tamil Nadu (1996)</em>, has settled that competitions where success depends upon a substantial degree of skill, knowledge, attention, experience, and adroitness do not constitute gambling and are protected under <strong className="text-white">Article 19(1)(g)</strong> of the Constitution of India (Freedom to practice any profession, occupation, trade or business).
          </p>
        </section>

        {/* Why Esports is 100% Skill */}
        <section className="space-y-3 p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
            2. Demonstrable Elements of Skill in BATTLEXA Tournaments
          </h2>
          <p>
            Tournaments hosted on BATTLEXA in Battle Royale titles (<strong className="text-white">Free Fire MAX</strong> and <strong className="text-white">BGMI</strong>) require exceptional human capabilities, including:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.05] space-y-1">
              <span className="text-lime-400 font-bold text-xs">Tactical Spatial Awareness</span>
              <p className="text-[11px] text-zinc-400">Map rotations, safe-zone positioning, high-ground control, and obstacle cover management.</p>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.05] space-y-1">
              <span className="text-lime-400 font-bold text-xs">Sub-Second Reflexes</span>
              <p className="text-[11px] text-zinc-400">Crosshair placement, recoil pattern control, drag-headshot mechanics, and instantaneous target acquisition.</p>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.05] space-y-1">
              <span className="text-violet-400 font-bold text-xs">Squad Synergy & Comms</span>
              <p className="text-[11px] text-zinc-400">In-game leading (IGL), role distribution (Fragger, Sniper, Support), and coordinated utility pushes.</p>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.05] space-y-1">
              <span className="text-violet-400 font-bold text-xs">Resource Management</span>
              <p className="text-[11px] text-zinc-400">Ammunition conservation, medkit prioritization, and gloo wall / smoke grenade allocation under fire.</p>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 pt-1">
            Chance or luck plays no decisive role in the tournament outcomes. The victor is determined solely by tactical mastery and combat skill.
          </p>
        </section>

        {/* Territory Restrictions */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-base sm:text-lg uppercase tracking-wide">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>3. Territorial Restrictions within India</span>
          </div>
          <p>
            While skill gaming is federally protected across most Indian jurisdictions, specific state legislation in certain territories contains idiosyncratic restrictions regarding real-money participation.
          </p>
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs space-y-2">
            <p className="font-bold">
              Residents of the following Indian states are strictly prohibited from participating in cash entry fee tournaments on BATTLEXA:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-300">
              <li><strong className="text-white">Assam</strong></li>
              <li><strong className="text-white">Odisha</strong></li>
              <li><strong className="text-white">Telangana</strong></li>
              <li><strong className="text-white">Andhra Pradesh</strong></li>
              <li><strong className="text-white">Nagaland</strong> & <strong className="text-white">Sikkim</strong> (unless explicitly permitted under designated state licensing)</li>
            </ul>
            <p className="text-[11px] text-zinc-400 pt-1">
              Players residing in these states may participate freely in all <strong>Free Scrims, Practice Rooms, and Non-Cash Community Exhibitions</strong> without restriction.
            </p>
          </div>
        </section>

        {/* Age Criteria */}
        <section className="space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
            4. Age Eligibility & KYC Compliance
          </h2>
          <p>
            Participation in paid prize pool tournaments is restricted to individuals who are <strong className="text-white">18 years of age or older</strong>, or minors who have acquired explicit consent from their parent or legal guardian.
          </p>
          <p>
            To prevent fraud and maintain financial integrity, BATTLEXA reserves the right to request valid government-issued identification (such as PAN Card or Aadhaar) prior to releasing tournament cash prize withdrawals exceeding regulatory thresholds.
          </p>
        </section>

        {/* Intellectual Property Disclaimer */}
        <section className="space-y-3 pt-4 border-t border-zinc-800">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
            5. Intellectual Property & Game Publisher Disclaimer
          </h2>
          <p className="text-zinc-400 text-xs">
            BATTLEXA is an independent third-party tournament matchmaking and esports community platform.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400 text-xs">
            <li>
              <strong className="text-zinc-200">Battlegrounds Mobile India (BGMI)</strong> is a registered trademark of <strong className="text-zinc-200">Krafton, Inc.</strong>
            </li>
            <li>
              <strong className="text-zinc-200">Free Fire MAX</strong> is a registered trademark of <strong className="text-zinc-200">Garena International / Sea Limited</strong>.
            </li>
          </ul>
          <p className="text-[11px] text-zinc-500">
            BATTLEXA is neither affiliated with, endorsed by, nor sponsored by Krafton Inc., Garena International, or any other game publisher. All game titles, logos, and character designs remain the exclusive intellectual property of their respective owners.
          </p>
        </section>
      </div>

      {/* Navigation footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800 text-xs text-zinc-400">
        <Link href="/terms" className="hover:text-white transition-colors flex items-center gap-1">
          <FileText className="h-3.5 w-3.5 text-lime-400" /> Read Terms of Service
        </Link>
        <Link href="/fair-play" className="hover:text-white transition-colors flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-violet-400" /> Fair Play & Anti-Cheat Rules
        </Link>
        <Link href="/contact" className="hover:text-white transition-colors">
          Questions? Contact Legal Team
        </Link>
      </div>
    </div>
  );
}
