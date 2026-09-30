import React from "react";
import Link from "next/link";
import { HeartHandshake, Shield, Clock, AlertCircle, Ban, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Responsible Gaming Policy | BATTLEXA",
  description:
    "BATTLEXA commitment to healthy, skill-first competitive gaming, spending limits, parental controls, and player well-being.",
};

export default function ResponsibleGamingPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <HeartHandshake className="h-3.5 w-3.5" /> Player Welfare & Well-being
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
          Responsible Gaming Policy
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
          Competitive esports should be exhilarating, empowering, and balanced. We are dedicated to providing a safe, controlled environment for all contenders.
        </p>
      </div>

      {/* Main Content Box */}
      <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 sm:p-8 lg:p-10 shadow-2xl space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        {/* Core Principles */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-base sm:text-lg uppercase tracking-wide">
            <Shield className="h-5 w-5 shrink-0" />
            <span>1. Our Skill-First Philosophy</span>
          </div>
          <p>
            BATTLEXA is created strictly as a <strong>competitive sports arena</strong>, not a gambling or betting establishment. Participation in tournaments should be pursued for the love of competition, team camaraderie, and personal skill development.
          </p>
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5 text-xs text-zinc-300">
            <span className="text-lime-400 font-bold">Key Guidelines for Contenders:</span>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Compete only with funds you can afford to allocate for recreation and hobbies.</li>
              <li>Never consider tournament prize winnings as a primary source of income or a solution to financial difficulties.</li>
              <li>Avoid playing when emotionally fatigued, angry, or under the influence of substances.</li>
              <li>Balance screen time with sleep, physical exercise, studies, work, and social relationships.</li>
            </ul>
          </div>
        </section>

        {/* Protection of Minors */}
        <section className="space-y-3 p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center gap-2 text-violet-400 font-bold text-sm sm:text-base uppercase tracking-wider">
            <Clock className="h-4 w-4 shrink-0" />
            <span>2. Protection of Minors & Parental Guidance</span>
          </div>
          <p>
            We take active measures to shield underage players from excessive screen time and unmonitored financial spending:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-300 text-xs">
            <li>
              Real-money cash prize withdrawals require valid adult KYC verification (PAN / Bank Account matching verified account holder).
            </li>
            <li>
              Parents and legal guardians may request an immediate permanent block on any account registered by an unauthorized minor by emailing <strong className="text-white">support@battlexa.gg</strong>.
            </li>
            <li>
              Minors are encouraged to participate primarily in our daily <strong>Free Practice Scrims & Community Exhibition matches</strong>.
            </li>
          </ul>
        </section>

        {/* Self-Exclusion & Limits */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-base sm:text-lg uppercase tracking-wide">
            <Ban className="h-5 w-5 shrink-0" />
            <span>3. Self-Imposed Limits & Account Cooling-Off</span>
          </div>
          <p>
            If you feel you are spending too much time or money on the platform, we offer proactive control mechanisms:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.05] space-y-1.5">
              <span className="font-bold text-amber-300">Deposit & Entry Cap</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Contact our support desk to set a maximum daily or weekly tournament entry fee threshold on your wallet.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.05] space-y-1.5">
              <span className="font-bold text-red-400">Cooling-Off / Self-Exclusion</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Request a temporary pause (7 days to 6 months) or permanent closure of your profile with immediate refund of unspent balances.
              </p>
            </div>
          </div>
        </section>

        {/* Warning Signs */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm sm:text-base uppercase tracking-wider">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>4. Recognizing Warning Signs</span>
          </div>
          <p className="text-zinc-400 text-xs">
            Be mindful of the following behavioral red flags in yourself or squad mates:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400 text-xs">
            <li>Skipping academic classes, family meals, or professional obligations to grind tournaments.</li>
            <li>Borrowing money from family or friends to pay tournament entry fees.</li>
            <li>Experiencing intense irritability or depression following match losses.</li>
            <li>Lying to loved ones about the amount of time or money dedicated to gaming.</li>
          </ul>
        </section>

        {/* Support Resources */}
        <section className="space-y-3 pt-4 border-t border-zinc-800">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
            5. Seeking External Assistance
          </h2>
          <p className="text-zinc-400 text-xs">
            If you or someone you know is experiencing symptoms of compulsive gaming or psychological distress, please connect with dedicated Indian mental health resources:
          </p>
          <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs space-y-1 text-zinc-300">
            <p><strong>NIMHANS SHUT Clinic (Service for Healthy Use of Technology):</strong> Bengaluru, India</p>
            <p><strong>KIRAN National Mental Health Helpline:</strong> 1800-599-0019 (Toll Free, 24/7)</p>
          </div>
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
        <Link href="/legality" className="hover:text-white transition-colors">
          Legality & Skill Exemption
        </Link>
        <Link href="/contact" className="hover:text-white transition-colors">
          Reach Support Desk
        </Link>
      </div>
    </div>
  );
}
