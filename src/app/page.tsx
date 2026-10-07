import React from "react";
import Link from "next/link";
import Image from "next/image";
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
  Clock,
  Radio,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { TournamentCard, TournamentCardData } from "@/components/tournament/TournamentCard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { connectToDatabase } from "@/lib/db/connect";
import { Tournament } from "@/lib/db/models/Tournament";
import { User } from "@/lib/db/models/User";
import { OrganizerProfile } from "@/lib/db/models/OrganizerProfile";

export const dynamic = "force-dynamic";

interface HomePageStats {
  tournaments: TournamentCardData[];
  totalCount: number;
  totalUsers: number;
  totalPrizePool: number;
  ffPrizePool: number;
  bgmiPrizePool: number;
}

async function getHomePageData(): Promise<HomePageStats> {
  try {
    await connectToDatabase();

    // Ensure models are registered for populate
    void User;
    void OrganizerProfile;

    const [
      tournaments,
      totalCount,
      totalUsers,
      prizeAgg,
      ffPrizeAgg,
      bgmiPrizeAgg,
    ] = await Promise.all([
      Tournament.find({
        status: { $in: ["REGISTRATION_OPEN", "CHECK_IN", "LIVE", "PUBLISHED"] },
      })
        .sort({ isFeatured: -1, startTime: 1 })
        .limit(4)
        .populate("organizerId", "organizationName username")
        .lean(),
      Tournament.countDocuments({ status: { $ne: "CANCELLED" } }),
      User.countDocuments(),
      Tournament.aggregate([
        { $match: { status: { $ne: "CANCELLED" } } },
        { $group: { _id: null, total: { $sum: "$prizePool" } } },
      ]),
      Tournament.aggregate([
        { $match: { gameSlug: "free-fire-max", status: { $ne: "CANCELLED" } } },
        { $group: { _id: null, total: { $sum: "$prizePool" } } },
      ]),
      Tournament.aggregate([
        { $match: { gameSlug: "bgmi", status: { $ne: "CANCELLED" } } },
        { $group: { _id: null, total: { $sum: "$prizePool" } } },
      ]),
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
      registeredSlots: t.registeredSlots,
      startTime: t.startTime,
      status: t.status,
      organizerName:
        t.organizerId?.organizationName || t.organizerId?.username,
      isFeatured: Boolean(t.isFeatured),
    }));

    return {
      tournaments: serializedTournaments,
      totalCount,
      totalUsers,
      totalPrizePool: prizeAgg[0]?.total || 0,
      ffPrizePool: ffPrizeAgg[0]?.total || 0,
      bgmiPrizePool: bgmiPrizeAgg[0]?.total || 0,
    };
  } catch (error) {
    console.error("HomePage data load failed:", error);
    return {
      tournaments: [],
      totalCount: 0,
      totalUsers: 0,
      totalPrizePool: 0,
      ffPrizePool: 0,
      bgmiPrizePool: 0,
    };
  }
}

export default async function HomePage() {
  const {
    tournaments,
    totalCount,
    totalUsers,
    totalPrizePool,
    ffPrizePool,
    bgmiPrizePool,
  } = await getHomePageData();

  const firstTourney = tournaments[0];
  const tickerText = firstTourney
    ? `⚡ ${firstTourney.title} (₹${firstTourney.prizePool.toLocaleString()}) • ${firstTourney.status.replace(/_/g, " ")} • Instant Payouts via UPI`
    : "⚡ Welcome to BATTLEXA • Official Free Fire MAX & BGMI tournament platform • 0% platform withdrawal fee!";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Live Ticker */}
      <div className="bg-gradient-to-r from-violet-950 via-slate-950 to-lime-950 border-b border-white/[0.08] py-2 px-4 text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-lime-400 animate-ping" />
            <span className="font-bold text-lime-400 uppercase tracking-widest text-[10px]">
              Live Arena
            </span>
          </div>
          <div className="truncate text-zinc-200 font-medium pl-4 text-xs">
            {tickerText}
          </div>
          <Link
            href="/tournaments"
            className="hidden sm:inline-flex items-center gap-1 text-[11px] text-violet-300 hover:text-white font-bold shrink-0 ml-4 transition-colors"
          >
            Explore All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Mobile-Native Game Arena Quick Switcher Bar */}
      <div className="md:hidden bg-slate-100 dark:bg-[#0c0f18] px-4 py-2 border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Gamepad2 className="w-3 h-3 text-lime-600 dark:text-lime-400" /> Quick Arena:
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/tournaments?game=free-fire-max"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-950/50 dark:border-orange-500/30 dark:text-orange-400 text-[11px] font-bold active:scale-95 transition-transform"
          >
            <span>🔥</span> Free Fire MAX
          </Link>
          <Link
            href="/tournaments?game=bgmi"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200 dark:bg-cyan-950/50 dark:border-cyan-500/30 dark:text-cyan-400 text-[11px] font-bold active:scale-95 transition-transform"
          >
            <span>🎯</span> BGMI
          </Link>
        </div>
      </div>

      {/* =========================================================================
          HERO SECTION (High-Impact Esports Arena Redesign)
          ========================================================================= */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 bg-grid-pattern hero-radial-glow border-b border-slate-200 dark:border-white/[0.06]">
        {/* Ambient Arena Backdrop Artwork */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10 dark:opacity-25 mix-blend-luminosity">
          <Image
            src="/hero-arena.jpg"
            alt="Esports Arena Background"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-transparent to-[#f8fafc] dark:from-[#08090e] dark:via-transparent dark:to-[#08090e]" />
        </div>

        {/* Ambient Colored Light Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[300px] bg-violet-600/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-lime-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Main 2-Column Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Live Status Pill */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-violet-500/30 text-xs font-bold text-slate-800 dark:text-zinc-200 shadow-sm backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-lime-500 animate-ping" />
                <span className="text-lime-600 dark:text-lime-400 font-extrabold uppercase tracking-wider text-[11px]">
                  India&apos;s Premier Arena
                </span>
                <span className="h-3 w-[1px] bg-slate-200 dark:bg-zinc-700" />
                <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
                  Free Fire MAX & BGMI
                </span>
              </div>

              {/* Main Typography */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-[1.06]">
                DOMINATE THE{" "}
                <span className="text-gradient-violet">BATTLEGROUND</span>.
                <br />
                WIN REAL CASH &{" "}
                <span className="text-gradient-lime">GLORY</span>.
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                The premier competitive tournament platform dedicated exclusively to{" "}
                <strong className="text-slate-900 dark:text-zinc-100 font-bold">Free Fire MAX</strong> and{" "}
                <strong className="text-slate-900 dark:text-zinc-100 font-bold">BGMI</strong>. Automated slot locks, encrypted 15-minute room ID releases, referee dispute desk, and instant UPI prize payouts with{" "}
                <span className="text-lime-600 dark:text-lime-400 font-extrabold">0% withdrawal fee</span>.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link href="/tournaments">
                  <Button
                    size="lg"
                    variant="lime"
                    className="w-full sm:w-auto shadow-lg shadow-lime-500/20 text-sm font-black px-6"
                  >
                    <Flame className="h-5 w-5 mr-1.5 text-black fill-black" /> Enter Tournaments
                  </Button>
                </Link>
                <Link href="/organizer/apply">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto text-sm font-bold px-6"
                  >
                    <ShieldCheck className="h-5 w-5 mr-1.5 text-violet-600 dark:text-violet-400" /> Host a Tournament
                  </Button>
                </Link>
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white px-2 py-2 transition-colors"
                >
                  <Trophy className="h-4 w-4 text-amber-500" /> Hall of Champions <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Trust Ribbon */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-lime-600 dark:text-lime-400 shrink-0" />
                  <span className="font-semibold text-[11px]">Instant UPI Payouts</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span className="font-semibold text-[11px]">Anti-Cheat Referees</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span className="font-semibold text-[11px]">Encrypted Room Passes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-semibold text-[11px]">100% Skill Gaming</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Arena Command Station */}
            <div className="lg:col-span-5 space-y-4">
              {/* Spotlight Live Tournament Card */}
              {firstTourney ? (
                <div className="relative rounded-2xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/10 p-5 shadow-xl transition-all duration-300 hover:border-violet-500/40 space-y-4">
                  {/* Header Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GameLogo
                        game={firstTourney.gameSlug}
                        variant="badge"
                        size="sm"
                        className="bg-slate-100 dark:bg-black/85"
                      />
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10">
                        {firstTourney.format}
                      </span>
                    </div>
                    <Badge variant="lime" pulse={true} className="text-[10px]">
                      {firstTourney.status.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  {/* Tournament Title */}
                  <div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white line-clamp-1">
                      {firstTourney.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
                      Starts {formatDate(firstTourney.startTime)}
                    </p>
                  </div>

                  {/* Prize & Entry Box */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 block">
                        Prize Pool
                      </span>
                      <span className="text-base font-black text-lime-600 dark:text-lime-400 flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        {formatCurrency(firstTourney.prizePool)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 block">
                        Entry Fee
                      </span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {firstTourney.entryFee === 0 ? "Free Entry" : formatCurrency(firstTourney.entryFee)}
                      </span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium">Arena Capacity</span>
                      <span className="font-bold text-slate-900 dark:text-zinc-200">
                        {firstTourney.registeredSlots} / {firstTourney.maxSlots} Slots Filled
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-lime-500 transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((firstTourney.registeredSlots / firstTourney.maxSlots) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <Link href={`/tournaments/${firstTourney._id}`} className="block">
                    <Button variant="primary" size="md" className="w-full font-black text-xs uppercase tracking-wider">
                      Enter This Arena Now <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="rounded-2xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/10 p-6 shadow-xl text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-lime-100 dark:bg-lime-950/60 text-lime-600 dark:text-lime-400 flex items-center justify-center mx-auto">
                    <Flame className="h-6 w-6" />
                  </div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    Daily Tournament Lobbies
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">
                    High-octane custom lobbies are posted around the clock. Choose your title below to enter scrims.
                  </p>
                  <Link href="/tournaments" className="block">
                    <Button variant="lime" size="sm" className="w-full font-bold">
                      Browse All Matches
                    </Button>
                  </Link>
                </div>
              )}

              {/* Dual Game Quick Jump Bento Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Free Fire MAX Quick Card */}
                <Link
                  href="/tournaments?game=free-fire-max"
                  className="group p-3.5 rounded-xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30 hover:border-amber-500/70 transition-all bg-white dark:bg-[#0e111a] shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <GameLogo game="free-fire-max" variant="badge" size="xs" />
                    <span className="text-[10px] font-black text-orange-600 dark:text-orange-400">
                      48 Slots
                    </span>
                  </div>
                  <div className="text-xs font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Free Fire MAX
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center justify-between">
                    <span>{ffPrizePool > 0 ? formatCurrency(ffPrizePool) : "Daily Scrims"}</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform text-orange-500" />
                  </div>
                </Link>

                {/* BGMI Quick Card */}
                <Link
                  href="/tournaments?game=bgmi"
                  className="group p-3.5 rounded-xl bg-gradient-to-br from-cyan-500/10 via-yellow-500/5 to-transparent border border-cyan-500/30 hover:border-cyan-500/70 transition-all bg-white dark:bg-[#0e111a] shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <GameLogo game="bgmi" variant="badge" size="xs" />
                    <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400">
                      100 Players
                    </span>
                  </div>
                  <div className="text-xs font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    BGMI Esports
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center justify-between">
                    <span>{bgmiPrizePool > 0 ? formatCurrency(bgmiPrizePool) : "Daily Scrims"}</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform text-cyan-500" />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-7xl mx-auto text-left">
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/[0.08] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-lime-600 dark:text-lime-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Total Prize Pool
                </span>
                <Trophy className="h-4 w-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {totalPrizePool > 0 ? formatCurrency(totalPrizePool) : "₹0"}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1">
                {totalPrizePool > 0 ? "Active tournament pools" : "Upcoming tournament pools"}
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/[0.08] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-violet-600 dark:text-violet-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Active Contenders
                </span>
                <Users className="h-4 w-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {totalUsers.toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1">
                Verified Indian warriors
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/[0.08] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-cyan-600 dark:text-cyan-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Matches Hosted
                </span>
                <Gamepad2 className="h-4 w-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {totalCount}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1">
                Competitive scrims & cups
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/[0.08] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Payout Speed
                </span>
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Instant UPI
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1">
                Automated wallet settlements
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Categories Spotlight */}
      <section className="py-16 bg-slate-100/70 dark:bg-[#0a0c13] border-b border-slate-200 dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-lime-600 dark:text-lime-400">
                Choose Your Title
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">
                Featured Game Arenas
              </h2>
            </div>
            <Link
              href="/games"
              className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
            >
              View formats & rules <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Fire MAX Banner */}
            <div className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-950/90 via-zinc-900 to-black border border-amber-500/30 p-6 sm:p-8 flex flex-col justify-between hover:border-amber-500/60 transition-all duration-300 shadow-xl shadow-orange-950/20 text-white">
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
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-md">
                  Clash Squad, Bermuda Battle Royale, and Solo Gun King. Enter daily scrims and high-stakes cups with verified Free Fire UID slot mapping.
                </p>
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-white/[0.12] mt-6">
                <div className="text-xs">
                  <span className="text-zinc-400 block uppercase font-bold text-[10px]">Live Prize Pools</span>
                  <span className="font-extrabold text-amber-400 text-base">
                    {ffPrizePool > 0 ? formatCurrency(ffPrizePool) : "Open Lobbies"}
                  </span>
                </div>
                <Link href="/tournaments?game=free-fire-max">
                  <Button variant="primary" size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black border-none font-extrabold shadow-lg">
                    View FF MAX Cups
                  </Button>
                </Link>
              </div>
            </div>

            {/* BGMI Banner */}
            <div className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-950/80 via-zinc-900 to-black border border-yellow-500/30 p-6 sm:p-8 flex flex-col justify-between hover:border-yellow-500/60 transition-all duration-300 shadow-xl shadow-yellow-950/20 text-white">
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
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-md">
                  Erangel, Miramar, and Sanhok classic competitive scrims. Solo, Duo, and Tier 1/2 Squad formats with real-time room credentials and anti-cheat checks.
                </p>
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-white/[0.12] mt-6">
                <div className="text-xs">
                  <span className="text-zinc-400 block uppercase font-bold text-[10px]">Live Prize Pools</span>
                  <span className="font-extrabold text-yellow-400 text-base">
                    {bgmiPrizePool > 0 ? formatCurrency(bgmiPrizePool) : "Open Lobbies"}
                  </span>
                </div>
                <Link href="/tournaments?game=bgmi">
                  <Button variant="primary" size="sm" className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black border-none font-extrabold shadow-lg">
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
            <div className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Battleground Schedule
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">
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
            <div className="col-span-full py-16 px-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 text-center space-y-4 shadow-sm">
              <div className="h-12 w-12 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-600/20 dark:text-violet-400 mx-auto flex items-center justify-center">
                <Trophy className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Live Tournaments Scheduled</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
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
      <section className="py-16 bg-slate-100/60 dark:bg-[#0c0f18] border-y border-slate-200 dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-lime-600 dark:text-lime-400">
              Built By Gamers, For Gamers
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Why Elite Contenders Trust BATTLEXA
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-3 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-600/20 dark:text-violet-400 flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Timed Room Credential Release
              </h4>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Room IDs and Passwords are encrypted on the server and revealed exactly 15 minutes before match start exclusively to verified registered players.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-3 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-lime-100 text-lime-800 dark:bg-lime-500/20 dark:text-lime-400 flex items-center justify-center">
                <Wallet className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Instant Automated Prize Crediting
              </h4>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                No delayed bank transfers or manual hassles. Prizes credit directly into your Battlexa wallet ledger as soon as organizers verify match screenshot proofs.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-3 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-400 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Referee Oversight & Dispute Desk
              </h4>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Suspect foul play, emulator bypass, or score tampering? Submit screenshots and video clips to our dedicated dispute desk for impartial referee review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Simple 4-Step Flow
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            How To Compete & Cash Out
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="relative p-5 rounded-xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/[0.08] space-y-2 shadow-sm">
            <span className="text-2xl font-black text-violet-600 dark:text-violet-400">01</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Pick Your Cup</h4>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Browse Free Fire MAX or BGMI tournaments by format, entry fee, or prize pool.
            </p>
          </div>

          <div className="relative p-5 rounded-xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/[0.08] space-y-2 shadow-sm">
            <span className="text-2xl font-black text-violet-600 dark:text-violet-400">02</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Lock Your Slot</h4>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Enter your in-game Character ID / UID and reserve your slot with instant capacity lock.
            </p>
          </div>

          <div className="relative p-5 rounded-xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/[0.08] space-y-2 shadow-sm">
            <span className="text-2xl font-black text-lime-600 dark:text-lime-400">03</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Enter the Room</h4>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Credentials unlock 15 minutes before the match. Join the custom room and claim your slot.
            </p>
          </div>

          <div className="relative p-5 rounded-xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/[0.08] space-y-2 shadow-sm">
            <span className="text-2xl font-black text-lime-600 dark:text-lime-400">04</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Claim Rewards</h4>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Win matches, take screenshots, receive prize money in your wallet, and withdraw via UPI.
            </p>
          </div>
        </div>

        {/* CTA banner */}
        <div className="rounded-2xl bg-gradient-to-r from-violet-900 via-indigo-950 to-lime-950 border border-violet-500/30 p-8 sm:p-12 text-center space-y-5 text-white shadow-xl">
          <h3 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Ready to Prove Your Squad is #1?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto">
            Join thousands of daily players on India&apos;s premier esports tournament battleground. Sign up now and claim your ₹50 arena welcome bonus!
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/register">
              <Button size="lg" variant="lime" className="shadow-lg">
                Join Free & Play Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
