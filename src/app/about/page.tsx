import React from "react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { ShieldCheck, Trophy, Target, Zap, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-4">
        <BrandLogo size="lg" showTagline={true} />
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          Empowering India's Mobile Esports Warriors
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          BATTLEXA is an esports tournament operations platform built to provide mobile gamers with structured competitive leagues, instant slot reservation, and transparent, verified prize payouts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#0e111a] border border-white/[0.08] space-y-3">
          <div className="h-10 w-10 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center">
            <Trophy className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base text-white">Our Mission</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            To professionalize grassroots competitive gaming in Free Fire MAX and BGMI by eliminating manual lobby chaos, payment scams, and unfair play.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0e111a] border border-white/[0.08] space-y-3">
          <div className="h-10 w-10 rounded-lg bg-lime-500/20 text-lime-400 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base text-white">100% Skill-Based Gaming</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            BATTLEXA complies strictly with Indian legal standards on skill-based gaming competitions. We host zero casino betting, wagering, or gambling.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-8 space-y-4">
        <h3 className="text-lg font-bold text-white">The BATTLEXA Standard</h3>
        <ul className="space-y-3 text-xs text-zinc-300">
          <li className="flex items-start gap-2.5">
            <Zap className="h-4 w-4 text-lime-400 shrink-0 mt-0.5" />
            <span>
              <strong>Cryptographic Payment Integrity:</strong> Every entry fee and wallet transaction is backed by Razorpay Orders and HMAC-SHA256 signature verification.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <Zap className="h-4 w-4 text-lime-400 shrink-0 mt-0.5" />
            <span>
              <strong>Timed Room Credential Vault:</strong> Custom room IDs are protected until the scheduled reveal countdown to prevent lobby infiltration.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <Zap className="h-4 w-4 text-lime-400 shrink-0 mt-0.5" />
            <span>
              <strong>Referee Dispute Desk:</strong> Dedicated review portal for screenshot verification and anti-emulator enforcement.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
