"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Swords,
  Trophy,
  Gamepad2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Smartphone,
  Bell,
  Crosshair,
  Crown,
  Flame,
  Shield,
  Zap,
  HelpCircle,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { GameLogo } from "@/components/shared/GameLogo";

// Curated Gaming Avatars
const PRESET_AVATARS = [
  {
    id: "cyber-samurai",
    name: "Cyber Samurai",
    gradient: "from-violet-600 via-purple-600 to-indigo-900",
    border: "border-violet-500",
    icon: Swords,
    badgeColor: "bg-violet-950 text-violet-300 border-violet-700",
  },
  {
    id: "phoenix-raider",
    name: "Phoenix Raider",
    gradient: "from-amber-500 via-orange-600 to-red-900",
    border: "border-orange-500",
    icon: Flame,
    badgeColor: "bg-orange-950 text-orange-300 border-orange-700",
  },
  {
    id: "neon-sniper",
    name: "Neon Sniper",
    gradient: "from-lime-400 via-emerald-600 to-teal-950",
    border: "border-lime-400",
    icon: Crosshair,
    badgeColor: "bg-lime-950 text-lime-300 border-lime-700",
  },
  {
    id: "apex-mech",
    name: "Apex Mech",
    gradient: "from-cyan-400 via-blue-600 to-slate-900",
    border: "border-cyan-400",
    icon: Zap,
    badgeColor: "bg-cyan-950 text-cyan-300 border-cyan-700",
  },
  {
    id: "shadow-ghost",
    name: "Shadow Ghost",
    gradient: "from-zinc-400 via-zinc-700 to-black",
    border: "border-zinc-500",
    icon: Shield,
    badgeColor: "bg-zinc-900 text-zinc-300 border-zinc-700",
  },
  {
    id: "gold-titan",
    name: "Gold Titan",
    gradient: "from-yellow-400 via-amber-600 to-yellow-950",
    border: "border-amber-400",
    icon: Crown,
    badgeColor: "bg-amber-950 text-amber-300 border-amber-700",
  },
];

const PLAYSTYLES = [
  {
    id: "Assaulter / Rusher",
    title: "Assaulter / Rusher",
    desc: "Aggressive entry fragger dominating close-range gunfights.",
    icon: Flame,
    color: "border-orange-500/40 hover:border-orange-500 text-orange-400",
    activeBg: "bg-orange-950/40 border-orange-500",
  },
  {
    id: "Sniper / Marksman",
    title: "Sniper / Marksman",
    desc: "Long-range precision shooter providing cover and quick knocks.",
    icon: Crosshair,
    color: "border-lime-500/40 hover:border-lime-500 text-lime-400",
    activeBg: "bg-lime-950/40 border-lime-500",
  },
  {
    id: "In-Game Leader (IGL)",
    title: "In-Game Leader (IGL)",
    desc: "Strategic mastermind directing zone rotations and callouts.",
    icon: Crown,
    color: "border-violet-500/40 hover:border-violet-500 text-violet-400",
    activeBg: "bg-violet-950/40 border-violet-500",
  },
  {
    id: "Support / Utility",
    title: "Support / Anchor",
    desc: "Team lifeline handling revives, smokes, gloo walls and supplies.",
    icon: Shield,
    color: "border-cyan-500/40 hover:border-cyan-500 text-cyan-400",
    activeBg: "bg-cyan-950/40 border-cyan-500",
  },
];

function PlayerOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || searchParams.get("returnTo") || "";

  // Page state
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // User and profile state
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [googleAvatar, setGoogleAvatar] = useState<string>("");
  const [walletBonus, setWalletBonus] = useState<number>(50);

  // Form Fields
  const [gamerTag, setGamerTag] = useState<string>("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("cyber-samurai");
  const [preferredGame, setPreferredGame] = useState<"FREE_FIRE_MAX" | "BGMI" | "BOTH">("BOTH");
  const [freeFireId, setFreeFireId] = useState<string>("");
  const [bgmiId, setBgmiId] = useState<string>("");
  const [playstyle, setPlaystyle] = useState<string>("Assaulter / Rusher");
  const [deviceType, setDeviceType] = useState<string>("Android Smartphone");
  const [experienceLevel, setExperienceLevel] = useState<string>("Competitive Contender");
  const [phone, setPhone] = useState<string>("");
  const [discordHandle, setDiscordHandle] = useState<string>("");
  const [notifyWhatsapp, setNotifyWhatsapp] = useState<boolean>(true);

  // Fetch initial profile
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/player/onboarding");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUsername(data.user.username || "");
            setEmail(data.user.email || "");
            setGoogleAvatar(data.user.avatar || "");
            setGamerTag(data.profile?.gamerTag || data.user.username || "");

            if (data.profile) {
              if (data.profile.freeFireId) setFreeFireId(data.profile.freeFireId);
              if (data.profile.bgmiId) setBgmiId(data.profile.bgmiId);
              if (data.profile.preferredGame) setPreferredGame(data.profile.preferredGame);
              if (data.profile.playstyle) setPlaystyle(data.profile.playstyle);
              if (data.profile.deviceType) setDeviceType(data.profile.deviceType);
              if (data.profile.phone) setPhone(data.profile.phone);
              if (data.profile.discordHandle) setDiscordHandle(data.profile.discordHandle);
            }
          }
          if (data.wallet?.balance) {
            setWalletBonus(data.wallet.balance);
          }
        }
      } catch (err) {
        console.error("Failed to load onboarding info", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#a3e635", "#8b5cf6", "#f59e0b", "#06b6d4"],
    });
  };

  const handleNextStep = () => {
    setError("");
    if (step === 1) {
      if (!gamerTag.trim()) {
        setError("Please enter your battle Gamer Tag.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Step 2 validation: advise if no ID provided
      if (preferredGame === "FREE_FIRE_MAX" && !freeFireId.trim()) {
        setError("Please enter your Free Fire UID to ensure room verification.");
        return;
      }
      if (preferredGame === "BGMI" && !bgmiId.trim()) {
        setError("Please enter your BGMI Character ID to ensure room verification.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
      triggerCelebration();
    }
  };

  const handleComplete = async (isSkipping: boolean = false) => {
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/player/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gamerTag: gamerTag.trim() || username,
          avatar: selectedAvatar,
          preferredGame,
          freeFireId: freeFireId.trim(),
          bgmiId: bgmiId.trim(),
          playstyle,
          deviceType,
          experienceLevel,
          phone: phone.trim(),
          discordHandle: discordHandle.trim(),
          notifyWhatsapp,
          skip: isSkipping,
          redirect: redirectParam || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to complete onboarding.");
        setIsSubmitting(false);
        return;
      }

      if (!isSkipping) {
        triggerCelebration();
      }

      setTimeout(() => {
        router.push(data.redirectUrl || redirectParam || "/player/dashboard");
        router.refresh();
      }, 700);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08090e] flex flex-col items-center justify-center p-4">
        <Loader2 className="h-10 w-10 text-lime-400 animate-spin mb-4" />
        <p className="text-sm font-bold text-zinc-300 uppercase tracking-widest">
          Initializing Contender Clearance...
        </p>
      </div>
    );
  }

  const selectedPreset = PRESET_AVATARS.find((a) => a.id === selectedAvatar) || PRESET_AVATARS[0];
  const AvatarIcon = selectedPreset.icon;

  return (
    <div className="min-h-screen bg-[#08090e] bg-grid-pattern relative flex flex-col items-center justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Background ambient neon lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-lime-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-6 z-10">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-900 border border-violet-400/30 shadow-lg shadow-violet-950/50">
            <Swords className="h-5 w-5 text-lime-400 transform -rotate-12" />
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight">
            <span className="text-white">BATTLE</span>
            <span className="text-lime-400">XA</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-violet-950/80 border border-violet-500/40 text-violet-300">
            Gladiator Clearance
          </span>
          <button
            type="button"
            onClick={() => handleComplete(true)}
            className="text-xs text-zinc-400 hover:text-white px-2 py-1 transition-colors cursor-pointer"
          >
            Skip for now
          </button>
        </div>
      </header>

      {/* Main Multi-Step Box */}
      <main className="w-full max-w-4xl relative z-10 space-y-6">
        {/* Step Progress Bar */}
        <div className="rounded-2xl bg-[#0e111a]/90 backdrop-blur-md border border-white/[0.08] p-4 sm:p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-lime-400 animate-ping" />
              <span className="font-black text-white uppercase tracking-wider">
                Step {step} of 4:
              </span>
              <span className="text-zinc-400 font-semibold">
                {step === 1 && "Battle Identity & Avatar"}
                {step === 2 && "Link Game Accounts"}
                {step === 3 && "Combat Profile & Alerts"}
                {step === 4 && "Claim Welcome Pack & Launch"}
              </span>
            </div>
            <span className="text-[11px] font-bold text-lime-400">
              {step === 1 && "25%"}
              {step === 2 && "50%"}
              {step === 3 && "75%"}
              {step === 4 && "100%"}
            </span>
          </div>

          <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-white/[0.05]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 via-indigo-500 to-lime-400 transition-all duration-500 ease-out shadow-lg shadow-lime-400/20"
              style={{ width: `${step * 25}%` }}
            />
          </div>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        {/* STEP 1: BATTLE IDENTITY */}
        {step === 1 && (
          <div className="rounded-3xl bg-[#0e111a]/95 backdrop-blur-xl border border-white/[0.1] p-6 sm:p-8 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-lime-400 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" /> First Impressions Matter
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                Forge Your Battle Identity
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
                Choose your official BATTLEXA alias and pick a battle avatar to display on leaderboards, tournament lobbies, and prize ceremonies.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Left/Center: Form Inputs */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Gamer Tag / In-Game Alias <span className="text-lime-400">*</span>
                  </label>
                  <Input
                    placeholder="e.g. SHADOW_SLAYER"
                    value={gamerTag}
                    onChange={(e) => setGamerTag(e.target.value)}
                    helperText="This tag will appear across all match brackets & team invites"
                    required
                  />
                </div>

                {/* Avatar Selection Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Select Battle Avatar
                    </label>
                    <span className="text-[11px] text-zinc-500">Pick any esports icon</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {PRESET_AVATARS.map((av) => {
                      const Icon = av.icon;
                      const isSelected = selectedAvatar === av.id;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setSelectedAvatar(av.id)}
                          className={`relative group flex flex-col items-center p-3 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? `${av.border} bg-white/[0.08] shadow-lg shadow-violet-950 scale-105`
                              : "border-white/[0.08] bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-800/50"
                          }`}
                        >
                          <div
                            className={`h-12 w-12 rounded-xl bg-gradient-to-tr ${av.gradient} flex items-center justify-center shadow-md relative`}
                          >
                            <Icon className="h-6 w-6 text-white drop-shadow" />
                            {isSelected && (
                              <div className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-lime-400 text-black flex items-center justify-center text-[10px] font-black shadow">
                                <Check className="h-3 w-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <span className="mt-2 text-[10px] font-bold text-zinc-300 truncate w-full text-center">
                            {av.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {googleAvatar && (
                    <button
                      type="button"
                      onClick={() => setSelectedAvatar(googleAvatar)}
                      className={`flex items-center gap-3 p-3 rounded-xl border w-full text-left transition-all cursor-pointer ${
                        selectedAvatar === googleAvatar
                          ? "border-violet-500 bg-violet-950/30"
                          : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={googleAvatar}
                        alt="Google profile"
                        className="h-9 w-9 rounded-full border border-violet-400"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-white block">
                          Use Google Account Avatar
                        </span>
                        <span className="text-[11px] text-zinc-400 truncate block">
                          Keep your connected Google profile picture
                        </span>
                      </div>
                      {selectedAvatar === googleAvatar && (
                        <CheckCircle2 className="h-4 w-4 text-lime-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Right: Live Identity Preview Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121624] to-[#0c0f18] border border-violet-500/30 shadow-xl space-y-4 text-center flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-violet-400">
                  Live Player Card Preview
                </span>

                <div className="relative">
                  <div
                    className={`h-20 w-20 rounded-2xl bg-gradient-to-tr ${selectedPreset.gradient} p-0.5 shadow-xl flex items-center justify-center border-2 ${selectedPreset.border}`}
                  >
                    {selectedAvatar === googleAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={googleAvatar}
                        alt="Avatar"
                        className="h-full w-full rounded-2xl object-cover"
                      />
                    ) : (
                      <AvatarIcon className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <div className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2 py-0.5 rounded-full bg-lime-400 text-black font-black text-[9px] uppercase tracking-wider shadow">
                    Verified
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <h3 className="text-lg font-black text-white tracking-tight">
                    {gamerTag || username || "WARRIOR"}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Tier: <span className="text-violet-300 font-bold">Rookie Contender</span>
                  </p>
                </div>

                <div className="w-full pt-3 border-t border-zinc-800/80 flex items-center justify-around text-center text-[10px] text-zinc-400">
                  <div>
                    <span className="block font-black text-white text-xs">₹50</span>
                    <span>Bonus Credited</span>
                  </div>
                  <div className="h-6 w-px bg-zinc-800" />
                  <div>
                    <span className="block font-black text-lime-400 text-xs">0%</span>
                    <span>Fee 1st Cup</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <Button
                type="button"
                variant="lime"
                onClick={handleNextStep}
                className="font-black text-xs uppercase tracking-wider py-3 px-6"
              >
                Continue to Game IDs <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: LINK IN-GAME ACCOUNTS */}
        {step === 2 && (
          <div className="rounded-3xl bg-[#0e111a]/95 backdrop-blur-xl border border-white/[0.1] p-6 sm:p-8 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-lime-400 uppercase tracking-wider">
                <Gamepad2 className="h-3.5 w-3.5" /> Essential For Match Lobbies
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                Connect Your In-Game Credentials
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
                Tournament hosts and automated bots verify your custom room slot using your official In-Game UID or Character ID.
              </p>
            </div>

            {/* Game Selector Tabs */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                What games do you compete in?
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPreferredGame("FREE_FIRE_MAX")}
                  className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                    preferredGame === "FREE_FIRE_MAX"
                      ? "border-amber-400 bg-amber-950/30 text-amber-300 shadow-lg shadow-amber-950/50"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-700"
                  }`}
                >
                  <div className="flex justify-center mb-1">
                    <GameLogo game="free-fire-max" size="sm" variant="icon" />
                  </div>
                  <span className="text-xs font-black block">Free Fire MAX</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreferredGame("BGMI")}
                  className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                    preferredGame === "BGMI"
                      ? "border-cyan-400 bg-cyan-950/30 text-cyan-300 shadow-lg shadow-cyan-950/50"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-700"
                  }`}
                >
                  <div className="flex justify-center mb-1">
                    <GameLogo game="bgmi" size="sm" variant="icon" />
                  </div>
                  <span className="text-xs font-black block">BGMI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreferredGame("BOTH")}
                  className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                    preferredGame === "BOTH"
                      ? "border-lime-400 bg-lime-950/30 text-lime-300 shadow-lg shadow-lime-950/50"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-700"
                  }`}
                >
                  <div className="flex justify-center items-center gap-1 mb-1">
                    <Flame className="h-4 w-4 text-lime-400" />
                  </div>
                  <span className="text-xs font-black block">Both Games</span>
                </button>
              </div>
            </div>

            {/* Inputs based on selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(preferredGame === "FREE_FIRE_MAX" || preferredGame === "BOTH") && (
                <div className="p-5 rounded-2xl bg-zinc-900/70 border border-amber-500/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GameLogo game="free-fire-max" size="xs" variant="icon" />
                      <span className="text-xs font-black uppercase text-amber-400">
                        Free Fire MAX UID
                      </span>
                    </div>
                    <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-700/50 px-2 py-0.5 rounded font-bold">
                      9-11 Digits
                    </span>
                  </div>

                  <Input
                    label="Free Fire Player UID"
                    placeholder="e.g. 1928475920"
                    value={freeFireId}
                    onChange={(e) => setFreeFireId(e.target.value)}
                    helperText="Open FF MAX > Tap your profile banner at top-left > Copy numeric UID"
                  />

                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05] text-[11px] text-zinc-400 flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      Required to unlock password for Free Fire MAX custom rooms. Can be updated anytime in profile.
                    </span>
                  </div>
                </div>
              )}

              {(preferredGame === "BGMI" || preferredGame === "BOTH") && (
                <div className="p-5 rounded-2xl bg-zinc-900/70 border border-cyan-500/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GameLogo game="bgmi" size="xs" variant="icon" />
                      <span className="text-xs font-black uppercase text-cyan-400">
                        BGMI Character ID
                      </span>
                    </div>
                    <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700/50 px-2 py-0.5 rounded font-bold">
                      10 Digits
                    </span>
                  </div>

                  <Input
                    label="BGMI Character ID"
                    placeholder="e.g. 5183920194"
                    value={bgmiId}
                    onChange={(e) => setBgmiId(e.target.value)}
                    helperText="Open BGMI > Tap your avatar > Copy the 10-digit ID next to your nickname"
                  />

                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05] text-[11px] text-zinc-400 flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      Used by BGMI room referees to assign your team slot in Erangel/Miramar lobbies.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back
              </Button>
              <Button
                type="button"
                variant="lime"
                onClick={handleNextStep}
                className="font-black text-xs uppercase tracking-wider py-3 px-6"
              >
                Continue to Playstyle <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: COMBAT PROFILE & MATCH ALERTS */}
        {step === 3 && (
          <div className="rounded-3xl bg-[#0e111a]/95 backdrop-blur-xl border border-white/[0.1] p-6 sm:p-8 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-400 uppercase tracking-wider">
                <Crosshair className="h-3.5 w-3.5" /> Tactical Customization
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                Define Your Combat Role & Alerts
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
                Let squads discover you for tournaments and ensure you never miss custom match room ID drops.
              </p>
            </div>

            {/* Playstyle Cards */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                Primary Combat Playstyle
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PLAYSTYLES.map((ps) => {
                  const Icon = ps.icon;
                  const isSelected = playstyle === ps.id;
                  return (
                    <button
                      key={ps.id}
                      type="button"
                      onClick={() => setPlaystyle(ps.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                        isSelected
                          ? `${ps.activeBg} shadow-lg shadow-black/60`
                          : "border-white/[0.08] bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-zinc-700"
                      }`}
                    >
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.08] shrink-0">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white">{ps.title}</span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-lime-400" />}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{ps.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Device & Notification Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Primary Gaming Device
                </label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-xs text-white focus:outline-none focus:border-violet-500 font-medium"
                >
                  <option value="Android Smartphone">Android Smartphone (OnePlus, iQOO, Poco, Realme)</option>
                  <option value="iPhone / iOS">Apple iPhone (13/14/15/16 Pro)</option>
                  <option value="iPad / Tablet">iPad / Android Gaming Tablet</option>
                  <option value="Dedicated ROG / RedMagic">Dedicated Gaming Phone (ASUS ROG / RedMagic)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Competitive Experience
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-xs text-white focus:outline-none focus:border-violet-500 font-medium"
                >
                  <option value="Competitive Contender">Competitive Contender (Plays daily tournaments)</option>
                  <option value="Semi-Pro Tournament Grinder">Semi-Pro Tournament Grinder (Scrims & Cash Cups)</option>
                  <option value="Casual Ranked Warrior">Casual Ranked Warrior (Plays for fun & thrills)</option>
                  <option value="Esports Veteran">Esports Veteran (Official tier-1/tier-2 events)</option>
                </select>
              </div>
            </div>

            {/* Room Password Alerts Opt-In */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-950/40 via-zinc-900/60 to-black border border-violet-500/30 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-lime-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      Instant Room Password Drop Alerts
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Custom match room ID & passwords release 15 minutes before kickoff. Enter your contact details to receive ping notifications so you never forfeit a slot.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={notifyWhatsapp}
                    onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-lime-500"></div>
                </label>
              </div>

              {notifyWhatsapp && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80">
                  <Input
                    label="WhatsApp / Mobile Number"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    helperText="For instant tournament alert reminders"
                  />
                  <Input
                    label="Discord Tag (Optional)"
                    placeholder="gladiator#1234"
                    value={discordHandle}
                    onChange={(e) => setDiscordHandle(e.target.value)}
                    helperText="To join BATTLEXA Discord voice channels"
                  />
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back
              </Button>
              <Button
                type="button"
                variant="lime"
                onClick={handleNextStep}
                className="font-black text-xs uppercase tracking-wider py-3 px-6"
              >
                Review & Activate <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: CLAIM WELCOME PACK & ACTIVATION */}
        {step === 4 && (
          <div className="rounded-3xl bg-[#0e111a]/95 backdrop-blur-xl border border-white/[0.1] p-6 sm:p-8 shadow-2xl space-y-8 animate-in fade-in zoom-in-95 duration-400">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-950/80 border border-lime-500/40 text-xs font-black uppercase tracking-wider text-lime-400">
                <Trophy className="h-4 w-4" /> Ready for the Battleground
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                Clearance Granted, Gladiator!
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
                Your combat profile is fully initialized. Your starter pack is waiting in your wallet.
              </p>
            </div>

            {/* Welcome Bonus Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-lime-500/20 to-violet-600/20 border border-lime-500/40 text-center relative overflow-hidden shadow-2xl shadow-lime-950/40">
              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10">
                <Crown className="w-48 h-48 text-lime-400" />
              </div>

              <div className="relative z-10 space-y-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-lime-400">
                  Welcome Bonus Pack Unlocked
                </span>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                  <span className="text-lime-400">₹{walletBonus}</span>
                  <span className="text-xl sm:text-2xl text-zinc-400 font-bold uppercase">
                    Arena Credit
                  </span>
                </div>
                <p className="text-xs text-zinc-300 max-w-md mx-auto">
                  Instant real-money entry voucher ready to be applied on any Free Fire MAX or BGMI cup.
                </p>
              </div>
            </div>

            {/* Final Battle Summary Card */}
            <div className="rounded-2xl bg-zinc-900/60 border border-white/[0.08] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-12 w-12 rounded-xl bg-gradient-to-tr ${selectedPreset.gradient} flex items-center justify-center border ${selectedPreset.border}`}
                  >
                    {selectedAvatar === googleAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={googleAvatar}
                        alt="Avatar"
                        className="h-full w-full rounded-xl object-cover"
                      />
                    ) : (
                      <AvatarIcon className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-base text-white">{gamerTag || username}</h4>
                    <span className="text-xs text-zinc-400">{playstyle} • {deviceType}</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-lime-950 border border-lime-500/40 text-lime-300 text-[10px] font-black uppercase">
                  Ready to Compete
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05]">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Free Fire UID</span>
                  <span className="font-mono font-bold text-amber-400 truncate block mt-0.5">
                    {freeFireId || "Not Linked Yet"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05]">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">BGMI Char ID</span>
                  <span className="font-mono font-bold text-cyan-400 truncate block mt-0.5">
                    {bgmiId || "Not Linked Yet"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05] col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Notification Pings</span>
                  <span className="font-bold text-lime-400 block mt-0.5">
                    {notifyWhatsapp ? "WhatsApp & In-App" : "In-App Alerts"}
                  </span>
                </div>
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-2 space-y-3">
              <Button
                type="button"
                variant="lime"
                size="lg"
                onClick={() => handleComplete(false)}
                disabled={isSubmitting}
                className="w-full font-black text-sm uppercase tracking-wider py-4 shadow-2xl shadow-lime-950/80 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Entering Arena...
                  </>
                ) : (
                  <>
                    <Swords className="h-5 w-5 mr-2 text-black" />
                    Enter BATTLEXA Arena & Explore Tournaments
                  </>
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Need to change credentials? Go back
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-zinc-500">
        BATTLEXA Esports Arena • Fair Play Guaranteed • Instant Automated UPI & Room Code Delivery
      </footer>
    </div>
  );
}

export default function PlayerOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08090e] flex flex-col items-center justify-center p-4">
          <Loader2 className="h-10 w-10 text-lime-400 animate-spin mb-4" />
          <p className="text-sm font-bold text-zinc-300 uppercase tracking-widest">
            Initializing Contender Clearance...
          </p>
        </div>
      }
    >
      <PlayerOnboardingContent />
    </Suspense>
  );
}
