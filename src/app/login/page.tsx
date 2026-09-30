"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import { Swords, ShieldCheck, Zap, Trophy, Lock, Loader2, ArrowRight, Mail, User, ChevronDown } from "lucide-react";

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 127.14 96.36" fill="currentColor">
      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
    </svg>
  );
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || searchParams.get("returnTo") || "";

  const [loadingProvider, setLoadingProvider] = useState<"google" | "discord" | null>(null);
  const [error, setError] = useState("");
  const [showDevModal, setShowDevModal] = useState(false);
  const [devProvider, setDevProvider] = useState<"google" | "discord">("google");
  const [devEmail, setDevEmail] = useState("");
  const [devName, setDevName] = useState("");

  // Optional Email / Password auth state
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailTab, setEmailTab] = useState<"signin" | "signup">(
    searchParams.get("tab") === "register" ? "signup" : "signin"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    const errParam = searchParams.get("error");
    if (errParam) {
      queueMicrotask(() => {
        if (errParam === "google_not_configured") {
          setDevProvider("google");
          setShowDevModal(true);
        } else if (errParam === "discord_not_configured") {
          setDevProvider("discord");
          setShowDevModal(true);
        } else if (errParam === "account_suspended") {
          setError("Your account has been suspended or banned. Please contact support.");
        } else if (errParam === "access_denied") {
          setError("Access was canceled or denied by the provider.");
        } else {
          setError("Authentication failed. Please try again.");
        }
      });
    }
  }, [searchParams]);

  const handleGoogleLogin = () => {
    setLoadingProvider("google");
    setError("");
    const url = redirectParam
      ? `/api/auth/google?redirect=${encodeURIComponent(redirectParam)}`
      : "/api/auth/google";
    window.location.href = url;
  };

  const handleDiscordLogin = () => {
    setLoadingProvider("discord");
    setError("");
    const url = redirectParam
      ? `/api/auth/discord?redirect=${encodeURIComponent(redirectParam)}`
      : "/api/auth/discord";
    window.location.href = url;
  };

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devEmail.trim() && !devName.trim()) return;

    setLoadingProvider(devProvider);
    setError("");

    try {
      const endpoint =
        devProvider === "google"
          ? "/api/auth/google/verify"
          : "/api/auth/discord/verify";

      const payload =
        devProvider === "google"
          ? {
              email: devEmail.trim(),
              name: devName.trim() || devEmail.split("@")[0],
              googleId: `dev_google_${Date.now()}`,
              redirect: redirectParam || undefined,
            }
          : {
              email: devEmail.trim() || undefined,
              username: devName.trim() || (devEmail ? devEmail.split("@")[0] : "DiscordPlayer"),
              discordId: `dev_discord_${Date.now()}`,
              redirect: redirectParam || undefined,
            };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `${devProvider === "google" ? "Google" : "Discord"} sign-in failed`);
        setLoadingProvider(null);
        return;
      }

      router.push(data.redirectUrl || redirectParam || "/player/dashboard");
      router.refresh();
    } catch {
      setError("Failed to sign in. Please try again.");
      setLoadingProvider(null);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailLoading(true);

    try {
      if (emailTab === "signin") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            redirect: redirectParam || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to sign in");
          setEmailLoading(false);
          return;
        }

        router.push(data.redirectUrl || redirectParam || "/player/dashboard");
        router.refresh();
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            email,
            password,
            role: "PLAYER",
            redirect: redirectParam || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to create account");
          setEmailLoading(false);
          return;
        }

        router.push(data.redirectUrl || redirectParam || "/player/onboarding");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setEmailLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full flex items-center justify-center py-6 sm:py-10 px-3 xs:px-4 sm:px-6 lg:px-8 bg-grid-pattern relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-violet-600/15 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-72 sm:w-80 h-72 sm:h-80 bg-lime-500/10 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />

      {/* Unified Responsive Container */}
      <div className="w-full max-w-[440px] relative z-10 space-y-4">
        <div className="rounded-2xl bg-[#0e111a]/95 backdrop-blur-xl border border-white/[0.1] p-5 sm:p-7 shadow-2xl shadow-black/90 space-y-5 relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-violet-600 via-lime-400 to-[#5865F2]" />

          {/* Brand Header Inside Container */}
          <div className="flex flex-col items-center text-center space-y-2.5 pt-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 sm:gap-3 group focus:outline-none"
            >
              <div className="relative flex items-center justify-center p-0.5 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-700 to-zinc-950 border border-lime-400/40 shadow-xl shadow-lime-950/60 group-hover:scale-105 group-hover:border-lime-400 transition-all duration-300 shrink-0 overflow-hidden">
                <Image
                  src="/logo-icon.png"
                  alt="BATTLEXA"
                  width={52}
                  height={52}
                  className="rounded-2xl object-cover"
                  priority
                />
              </div>
              <div className="text-2xl xs:text-3xl sm:text-4xl font-black tracking-tight flex items-center leading-none select-none">
                <span className="text-white">BATTLE</span>
                <span className="text-lime-400">XA</span>
              </div>
            </Link>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-950/70 border border-violet-500/30 text-[10px] font-black uppercase tracking-wider text-violet-300">
                <span>Free Fire MAX & BGMI Arena</span>
              </div>
              <h1 className="text-lg xs:text-xl sm:text-2xl font-black text-white uppercase tracking-tight pt-0.5">
                Enter Arena
              </h1>
              <p className="text-xs text-zinc-400 max-w-[340px] mx-auto leading-relaxed text-balance">
                1-Click Instant Login or Sign-up with Google & Discord. Claim your ₹50 starter bonus!
              </p>
            </div>
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          {/* Primary Action Buttons: Google & Discord */}
          <div className="space-y-3 pt-0.5">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loadingProvider !== null}
              className="w-full flex items-center justify-center gap-2.5 sm:gap-3 py-3 sm:py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-100 active:scale-[0.99] text-zinc-950 font-black text-xs xs:text-sm sm:text-base shadow-xl shadow-white/5 transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed border border-white"
            >
              {loadingProvider === "google" ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-zinc-700 shrink-0" />
                  <span>Connecting with Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDiscordLogin}
              disabled={loadingProvider !== null}
              className="w-full flex items-center justify-center gap-2.5 sm:gap-3 py-3 sm:py-3.5 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] active:scale-[0.99] text-white font-black text-xs xs:text-sm sm:text-base shadow-xl shadow-[#5865F2]/25 transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed border border-[#6b77f5]"
            >
              {loadingProvider === "discord" ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-white shrink-0" />
                  <span>Connecting with Discord...</span>
                </>
              ) : (
                <>
                  <DiscordIcon />
                  <span>Continue with Discord</span>
                </>
              )}
            </button>

            {/* Optional Email / Password Accordion */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <span>{showEmailForm ? "Hide email options" : "Or continue with Email"}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${showEmailForm ? "rotate-180" : ""}`} />
              </button>

              {showEmailForm && (
                <div className="mt-2.5 p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3">
                  <div className="grid grid-cols-2 gap-1.5 bg-black/40 p-1 rounded-lg border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setEmailTab("signin")}
                      className={`text-xs py-1.5 rounded-md font-bold transition cursor-pointer ${
                        emailTab === "signin"
                          ? "bg-violet-600 text-white shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmailTab("signup")}
                      className={`text-xs py-1.5 rounded-md font-bold transition cursor-pointer ${
                        emailTab === "signup"
                          ? "bg-lime-500 text-black shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Create Account
                    </button>
                  </div>

                  <form onSubmit={handleEmailSubmit} className="space-y-2.5">
                    {emailTab === "signup" && (
                      <Input
                        label="Username"
                        placeholder="e.g. Phoenix99"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        leftIcon={<User className="h-4 w-4" />}
                        required
                      />
                    )}
                    <Input
                      label="Email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      leftIcon={<Mail className="h-4 w-4" />}
                      required
                    />
                    <Input
                      label="Password"
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      leftIcon={<Lock className="h-4 w-4" />}
                      required
                    />
                    <Button
                      type="submit"
                      variant={emailTab === "signin" ? "primary" : "lime"}
                      size="sm"
                      className="w-full font-bold text-xs py-2.5"
                      isLoading={emailLoading}
                    >
                      {emailTab === "signin" ? "Sign In with Email" : "Create Account & Claim ₹50"}
                    </Button>
                  </form>
                </div>
              )}
            </div>

            <p className="text-[10px] xs:text-[11px] text-zinc-500 text-center leading-normal text-balance px-1 pt-1">
              By continuing, you agree to BATTLEXA&apos;s{" "}
              <Link href="/terms" className="text-zinc-400 underline hover:text-white transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-zinc-400 underline hover:text-white transition-colors">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          {/* Feature Highlights Inside Container */}
          <div className="pt-3.5 border-t border-zinc-800/80 space-y-2">
            <div className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-xl bg-zinc-900/60 border border-white/[0.05]">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-lime-500/10 border border-lime-500/20 flex items-center justify-center shrink-0">
                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-lime-400" />
              </div>
              <span className="text-[11px] sm:text-xs text-zinc-300 font-medium leading-snug">
                Instant wallet creation & ₹50 welcome bonus
              </span>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-xl bg-zinc-900/60 border border-white/[0.05]">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-violet-400" />
              </div>
              <span className="text-[11px] sm:text-xs text-zinc-300 font-medium leading-snug">
                Encrypted room ID & password vault
              </span>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-xl bg-zinc-900/60 border border-white/[0.05]">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
              </div>
              <span className="text-[11px] sm:text-xs text-zinc-300 font-medium leading-snug">
                Verified player identity & automated fair play payouts
              </span>
            </div>
          </div>
        </div>

        {/* Developer / Local Environment Fallback Dialog */}
        {showDevModal && (
          <div className="rounded-2xl bg-amber-950/30 border border-amber-500/40 p-4 sm:p-5 space-y-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-400">
                <Trophy className="h-4 w-4" /> Local Dev Fast Sign-In
              </div>
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-amber-500/20">
                <button
                  type="button"
                  onClick={() => setDevProvider("google")}
                  className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${
                    devProvider === "google"
                      ? "bg-amber-400 text-black"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => setDevProvider("discord")}
                  className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${
                    devProvider === "discord"
                      ? "bg-[#5865F2] text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Discord
                </button>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              <code className="text-amber-300 font-mono text-[11px]">
                {devProvider === "google" ? "GOOGLE_CLIENT_ID" : "DISCORD_CLIENT_ID"}
              </code>{" "}
              is not yet configured in <code className="text-zinc-300 font-mono text-[11px]">.env.local</code>. Enter details below to simulate instant {devProvider === "google" ? "Google" : "Discord"} login:
            </p>

            <form onSubmit={handleDevLogin} className="space-y-2.5 pt-1">
              <input
                type="email"
                placeholder={devProvider === "google" ? "your.email@gmail.com" : "discord.user@example.com"}
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                required={devProvider === "google"}
                className="w-full px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
              <input
                type="text"
                placeholder="Gamer / Display Name (optional)"
                value={devName}
                onChange={(e) => setDevName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className={`w-full font-bold text-xs py-2.5 ${
                  devProvider === "google"
                    ? "bg-amber-500 hover:bg-amber-400 text-black"
                    : "bg-[#5865F2] hover:bg-[#4752c4] text-white"
                }`}
                isLoading={loadingProvider !== null}
              >
                Sign In with {devProvider === "google" ? "Google" : "Discord"} <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 w-full min-h-[60vh] flex items-center justify-center bg-grid-pattern">
          <Loader2 className="h-8 w-8 text-lime-400 animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
