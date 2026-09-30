import React from "react";
import { HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "How do I register for a tournament?",
    a: "Browse to the Tournaments page, select your preferred Free Fire MAX or BGMI cup, and click 'View & Enter Arena'. Enter your in-game Character ID / UID and confirm your slot. For paid cups, the fee is deducted from your BATTLEXA arena wallet.",
  },
  {
    q: "When and where do I receive the custom room ID and password?",
    a: "Room credentials are kept secure in our server vault and unlocked exactly 15 minutes before the scheduled match kickoff. They will appear right on the tournament detail page and in your Player Dashboard with one-click copy buttons.",
  },
  {
    q: "How do prize payouts work?",
    a: "Once the match ends, the host organizer submits the official scorecard with screenshot evidence. As soon as the referee verifies the result, prize money is instantly credited to your BATTLEXA wallet. You can withdraw to your UPI or Bank Account at any time (minimum ₹100).",
  },
  {
    q: "Are emulators allowed in BGMI or Free Fire MAX?",
    a: "Unless explicitly stated in the tournament title as 'EMULATOR ALLOWED', all official BATTLEXA cups strictly require mobile devices (Android/iOS). Playing on PC emulators in mobile-only tournaments results in immediate disqualification and forfeiture of entry fees.",
  },
  {
    q: "What if an opponent hacks, cheats, or teams up?",
    a: "Take screenshot and recording evidence immediately. Head to your Player Support desk or the tournament page and file an official dispute. Our referee team investigates all reports thoroughly.",
  },
  {
    q: "What happens if a tournament is cancelled by the organizer?",
    a: "If a tournament is cancelled, our system automatically executes an atomic refund: 100% of your entry fee is restored directly to your BATTLEXA wallet instantly.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lime-400">
          <HelpCircle className="h-4 w-4" /> Frequently Asked Questions
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          Tournament FAQs & Guidelines
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Everything you need to know about registering, entering custom rooms, and claiming prize payouts on BATTLEXA.
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((item, index) => (
          <div
            key={index}
            className="rounded-xl bg-[#0e111a] border border-white/[0.08] p-6 space-y-2"
          >
            <h3 className="font-bold text-base text-white flex items-start gap-2.5">
              <span className="text-violet-400 font-mono font-bold">0{index + 1}.</span>
              {item.q}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed pl-8">
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
