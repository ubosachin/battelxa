import React from "react";
import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#06070a] text-zinc-400 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="md" showTagline={true} />
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              BATTLEXA is the premier competitive esports arena for Free Fire MAX and BGMI warriors. Compete in daily cups, scrims, and national tournaments with verified organizers and guaranteed prize pools.
            </p>
            <div className="flex items-center gap-2 text-xs text-lime-400 font-semibold bg-lime-950/30 border border-lime-800/30 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="h-4 w-4" />
              100% Skill-Based Esports Platform • No Gambling
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Compete
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/tournaments?game=free-fire-max" className="hover:text-white transition-colors">
                  Free Fire MAX Cups
                </Link>
              </li>
              <li>
                <Link href="/tournaments?game=bgmi" className="hover:text-white transition-colors">
                  BGMI Battle Royale
                </Link>
              </li>
              <li>
                <Link href="/tournaments?type=FREE" className="hover:text-white transition-colors">
                  Free Scrims & Practice
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-white transition-colors">
                  Hall of Champions
                </Link>
              </li>
            </ul>
          </div>

          {/* Organizers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Ecosystem
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/organizers" className="hover:text-white transition-colors">
                  Verified Hosts
                </Link>
              </li>
              <li>
                <Link href="/organizer/apply" className="hover:text-white transition-colors">
                  Become an Organizer
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About BATTLEXA
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ & Rules
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Trust & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white transition-colors">
                  Refund & Cancellation
                </Link>
              </li>
              <li>
                <Link href="/legality" className="hover:text-white transition-colors">
                  Skill Gaming Legality
                </Link>
              </li>
              <li>
                <Link href="/fair-play" className="hover:text-white transition-colors">
                  Fair Play & Anti-Cheat
                </Link>
              </li>
              <li>
                <Link href="/responsible-gaming" className="hover:text-white transition-colors">
                  Responsible Gaming
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Player Support Desk
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div className="space-y-1 text-center sm:text-left">
            <p>© {new Date().getFullYear()} BATTLEXA Esports Arena. All rights reserved.</p>
            <p className="text-[10px] text-zinc-600">
              100% Skill-Based Esports Tournament Platform • Exclusively for Free Fire MAX & BGMI Contenders
            </p>
          </div>
          <p className="flex items-center gap-1 shrink-0">
            Engineered for esports gladiators with <Heart className="h-3 w-3 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
