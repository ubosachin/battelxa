import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GameLogo } from "@/components/shared/GameLogo";
import {
  Trophy,
  Gamepad2,
  ShieldCheck,
  Zap,
  Users,
  Flame,
  ArrowRight,
  Lock,
  Wallet,
  Sparkles,
  Award,
} from "lucide-react";
import { TournamentCard, TournamentCardData } from "@/components/tournament/TournamentCard";
import { connectToDatabase } from "@/lib/db/connect";
import { Tournament } from "@/lib/db/models/Tournament";
import { User } from "@/lib/db/models/User";
import { OrganizerProfile } from "@/lib/db/models/OrganizerProfile";

export const dynamic = "force-dynamic";

async function getHomePageData(): Promise<{ tournaments: TournamentCardData[]; totalCount: number }> {
  try {
    await connectToDatabase();

    // Ensure models are registered for populate
    void User;
    void OrganizerProfile;

    const [tournaments, totalCount] = await Promise.all([
      Tournament.find({
        status: { $in: ["REGISTRATION_OPEN", "CHECK_IN", "LIVE", "PUBLISHED"] },
      })
        .sort({ isFeatured: -1, startTime: 1 })
        .limit(4)
        .populate("organizerId", "organizationName username")
        .lean(),
      Tournament.countDocuments({ status: { $ne: "CANCELLED" } }),
    ]);

    const serializedTournaments: TournamentCardData[] = (tournaments as unknown as Array<{
      _id: { toString(): string };
      title: string;
      gameSlug: string;
      gameName?: string;
      format: "SOLO" | "DUO" | "SQUAD";
      type: "FREE" | "PAID" | "PRACTICE";
      entryFee: number;
      prizePool: number;
      maxSlots: number;
      registeredSlots: number;
      startTime: Date | string;
      status: string;
      organizerId?: { organizationName?: string; username?: string };
      isFeatured?: boolean;
    }>).map((t) => ({
      _id: t._id.toString(),
      title: t.title,
      gameSlug: t.gameSlug,
      gameName:
        t.gameName ||
        (t.gameSlug === "free-fire-max" ? "Free Fire MAX" : "BGMI"),
      format: t.format,
      type: t.type as "FREE" | "PAID" | "PRACTICE",
      entryFee: t.entryFee,
      prizePool: t.prizePool,
      maxSlots: t.maxSlots,
      registeredSlots: t.registeredSlots || 0,
      status: t.status,
      startTime: t.startTime,
      organizerName:
        t.organizerId?.organizationName ||
        t.organizerId?.username ||
        "Verified Host",
      isFeatured: Boolean(t.isFeatured),
    }));

    return {
      tournaments: serializedTournaments,
      totalCount,
    };
  } catch (error) {
    console.error("HomePage data load failed:", error);
    return {
      tournaments: [],
      totalCount: 0,
    };
  }
}

export default async function HomePage() {
  const { tournaments, totalCount } = await getHomePageData();

  const firstTourney = tournaments[0];
  const tickerText = firstTourney
    ? `⚡ ${firstTourney.title} (₹${firstTourney.prizePool.toLocaleString()}) • ${firstTourney.status.replace(/_/g, " ")} • Instant Payouts via UPI`
    : "⚡ Welcome to BATTLEXA • Official Free Fire MAX & BGMI tournament platform • 0% platform withdrawal fee!";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Live Ticker */}
      <div className="bg-gradient-to-r from-violet-950 via-zinc-950 to-lime-950 border-b border-white/[0.06] py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-lime-400 animate-ping" />
            <span className="font-bold text-lime-400 uppercase tracking-widest text-[10px]">
              Live Arena
            </span>
          </div>
          <div className="truncate text-zinc-300 font-medium pl-4 text-xs">
            {tickerText}
          </div>
          <Link
            href="/tournaments"
            className="hidden sm:inline-flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 font-bold shrink-0 ml-4"
          >
            Explore All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Mobile-Native Game Arena Quick Switcher Bar */}
      <div className="md:hidden bg-[#0c0f18] px-4 py-2 border-b border-white/[0.06] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Gamepad2 className="w-3 h-3 text-lime-400" /> Quick Arena:
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/tournaments?game=free-fire-max"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-950/50 border border-orange-500/30 text-[11px] font-bold text-orange-400 active:scale-95 transition-transform"
          >
            <span>🔥</span> Free Fire MAX
          </Link>
          <Link
            href="/tournaments?game=bgmi"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-[11px] font-bold text-cyan-400 active:scale-95 transition-transform"
          >
            <span>🎯</span> BGMI
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-grid-pattern hero-radial-glow border-b border-white/[0.06]">
        {/* Subtle background glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-violet-600/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-lime-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-violet-500/30 text-xs font-bold text-violet-300 shadow-xl">
            <Sparkles className="h-3.5 w-3.5 text-lime-400" />
            <span>The Next Generation Esports Arena</span>
            <Badge variant="lime" className="ml-1 text-[10px]">
              v1.0 Live
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase max-w-5xl mx-auto leading-[1.05]">
            DOMINATE THE <span className="text-gradient-violet">BATTLEGROUND</span>.
            <br />
            CLAIM THE <span className="text-gradient-lime">GLORY</span>.
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400 leading-relaxed">
            The premier tournament platform dedicated exclusively to{" "}
            <span className="text-zinc-200 font-semibold">Free Fire MAX</span> and{" "}
            <span className="text-zinc-200 font-semibold">BGMI</span>. Instant slot locking, timed room credentials release, anti-cheat referee oversight, and automated wallet prize payouts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link href="/tournaments">
              <Button size="lg" variant="lime" className="w-full sm:w-auto shadow-lime-500/20 shadow-xl">
                <Flame className="h-5 w-5 mr-1 text-black" /> Enter Tournaments
              </Button>
            </Link>
            <Link href="/organizer/apply">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <ShieldCheck className="h-5 w-5 mr-1 text-violet-400" /> Host a Tournament
              </Button>
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-[#0e111a]/90 border border-white/[0.06] backdrop-blur-md">
              <div className="flex items-center gap-2 text-lime-400 mb-1">
                <Trophy className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Total Prize Pool
                </span>
              </div>
              <div className="text-2xl font-black text-white">₹50,00,000+</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Distributed to date</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0e111a]/90 border border-white/[0.06] backdrop-blur-md">
              <div className="flex items-center gap-2 text-violet-400 mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Active Contenders
                </span>
              </div>
              <div className="text-2xl font-black text-white">25,000+</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Registered warriors</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0e111a]/90 border border-white/[0.06] backdrop-blur-md">
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <Gamepad2 className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Tournaments
                </span>
              </div>
              <div className="text-2xl font-black text-white">1,200+</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Matches hosted</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0e111a]/90 border border-white/[0.06] backdrop-blur-md">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Fair Play Rate
                </span>
              </div>
              <div className="text-2xl font-black text-white">99.8%</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Anti-cheat resolution</div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Categories Spotlight */}
      <section className="py-16 bg-[#0a0c13] border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-lime-400">
                Choose Your Title
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
                Featured Game Arenas
              </h2>
            </div>
            <Link
              href="/games"
              className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              View formats & rules <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Fire MAX Banner */}
            <div className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-950/70 via-zinc-900 to-black border border-amber-500/30 p-6 sm:p-8 flex flex-col justify-between hover:border-amber-500/60 transition-all duration-300 shadow-xl shadow-orange-950/20">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <GameLogo game="free-fire-max" variant="badge" size="md" />
                  <span className="text-xs font-bold text-amber-300 px-2.5 py-1 rounded bg-black/60 border border-amber-500/30">
                    48 Slots / Match
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  Free Fire MAX Arena
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md">
                  Clash Squad, Bermuda Battle Royale, and Solo Gun King. Enter daily scrims and high-stakes cups with verified Free Fire UID slot mapping.
                </p>
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-white/[0.08] mt-6">
                <div className="text-xs">
                  <span className="text-zinc-500 block uppercase font-bold text-[10px]">Weekly Prize Pools</span>
                  <span className="font-extrabold text-amber-400 text-base">₹1,50,000+</span>
                </div>
                <Link href="/tournaments?game=free-fire-max">
                  <Button variant="primary" size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black border-none font-extrabold shadow-lg shadow-orange-950/50">
                    View FF MAX Cups
                  </Button>
                </Link>
              </div>
            </div>

            {/* BGMI Banner */}
            <div className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-950/60 via-zinc-900 to-black border border-yellow-500/30 p-6 sm:p-8 flex flex-col justify-between hover:border-yellow-500/60 transition-all duration-300 shadow-xl shadow-yellow-950/20">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <GameLogo game="bgmi" variant="badge" size="md" />
                  <span className="text-xs font-bold text-yellow-300 px-2.5 py-1 rounded bg-black/60 border border-yellow-500/30">
                    100 Players / 25 Squads
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  BGMI Esports Arena
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md">
                  Erangel, Miramar, and Sanhok classic competitive scrims. Solo, Duo, and Tier 1/2 Squad formats with real-time room credentials and anti-cheat checks.
                </p>
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-white/[0.08] mt-6">
                <div className="text-xs">
                  <span className="text-zinc-500 block uppercase font-bold text-[10px]">Weekly Prize Pools</span>
                  <span className="font-extrabold text-yellow-400 text-base">₹3,00,000+</span>
                </div>
                <Link href="/tournaments?game=bgmi">
                  <Button variant="primary" size="sm" className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black border-none font-extrabold shadow-lg shadow-yellow-950/50">
                    View BGMI Cups
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Live & Upcoming Tournaments */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-violet-400">
              Battleground Schedule
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
              Active & Upcoming Cups
            </h2>
          </div>
          <Link href="/tournaments">
            <Button variant="outline" size="sm">
              Explore All {totalCount > 0 ? `${totalCount}+` : ""} Tournaments <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tournaments.length === 0 ? (
            <div className="col-span-full py-16 px-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-violet-600/20 text-violet-400 mx-auto flex items-center justify-center">
                <Trophy className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">No Live Tournaments Scheduled</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Tournament lobbies are posted by verified organizers. Host your own custom scrim or check back shortly.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Link href="/organizer/tournaments/create">
                  <Button variant="primary" size="sm">
                    Host a Tournament
                  </Button>
                </Link>
                <Link href="/tournaments">
                  <Button variant="outline" size="sm">
                    Browse All Cups
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            tournaments.map((t) => (
              <TournamentCard key={t._id} tournament={t} />
            ))
          )}
        </div>
      </section>

      {/* Why BATTLEXA / Fair Play Core */}
      <section className="py-16 bg-[#0c0f18] border-y border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-lime-400">
              Built By Gamers, For Gamers
            </span>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">
              Why Elite Contenders Trust BATTLEXA
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white">
                Timed Room Credential Release
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Room IDs and Passwords are encrypted on the server and revealed exactly 15 minutes before match start exclusively to verified registered players.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-lime-500/20 text-lime-400 flex items-center justify-center">
                <Wallet className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white">
                Instant Automated Prize Crediting
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                No delayed bank transfers or manual hassles. Prizes credit directly into your Battlexa wallet ledger as soon as organizers verify match screenshot proofs.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white">
                Referee Oversight & Dispute Desk
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Suspect foul play, emulator bypass, or score tampering? Submit screenshots and video clips to our dedicated dispute desk for impartial referee review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
            Simple 4-Step Flow
          </span>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">
            How To Compete & Cash Out
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="relative p-5 rounded-xl bg-[#0e111a] border border-white/[0.08] space-y-2">
            <span className="text-2xl font-black text-violet-400">01</span>
            <h4 className="text-sm font-bold text-white">Pick Your Cup</h4>
            <p className="text-xs text-zinc-400">
              Browse Free Fire MAX or BGMI tournaments by format, entry fee, or prize pool.
            </p>
          </div>

          <div className="relative p-5 rounded-xl bg-[#0e111a] border border-white/[0.08] space-y-2">
            <span className="text-2xl font-black text-violet-400">02</span>
            <h4 className="text-sm font-bold text-white">Lock Your Slot</h4>
            <p className="text-xs text-zinc-400">
              Enter your in-game Character ID / UID and reserve your slot with instant capacity lock.
            </p>
          </div>

          <div className="relative p-5 rounded-xl bg-[#0e111a] border border-white/[0.08] space-y-2">
            <span className="text-2xl font-black text-lime-400">03</span>
            <h4 className="text-sm font-bold text-white">Enter the Room</h4>
            <p className="text-xs text-zinc-400">
              Credentials unlock 15 minutes before the match. Join the custom room and claim your slot.
            </p>
          </div>

          <div className="relative p-5 rounded-xl bg-[#0e111a] border border-white/[0.08] space-y-2">
            <span className="text-2xl font-black text-lime-400">04</span>
            <h4 className="text-sm font-bold text-white">Claim Rewards</h4>
            <p className="text-xs text-zinc-400">
              Win matches, take screenshots, receive prize money in your wallet, and withdraw via UPI.
            </p>
          </div>
        </div>

        {/* CTA banner */}
        <div className="rounded-2xl bg-gradient-to-r from-violet-900/60 via-indigo-950/80 to-lime-950/60 border border-violet-500/30 p-8 sm:p-12 text-center space-y-5">
          <h3 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Ready to Prove Your Squad is #1?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto">
            Join thousands of daily players on India&apos;s premier esports tournament battleground. Sign up now and claim your ₹50 arena welcome bonus!
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/register">
              <Button size="lg" variant="lime">
                Join Free & Play Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
