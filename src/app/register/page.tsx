"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Lock, Mail, User, ShieldCheck, Trophy, Sparkles } from "lucide-react";

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 127.14 96.36" fill="currentColor">
      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"PLAYER" | "ORGANIZER">("PLAYER");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gamerTag, setGamerTag] = useState("");
  const [freeFireId, setFreeFireId] = useState("");
  const [bgmiId, setBgmiId] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          role,
          gamerTag: gamerTag || username,
          freeFireId: freeFireId || undefined,
          bgmiId: bgmiId || undefined,
          organizationName: role === "ORGANIZER" ? organizationName : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      } else if (role === "ORGANIZER") {
        router.push("/organizer/dashboard");
      } else {
        router.push("/player/onboarding");
      }
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-grid-pattern">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <BrandLogo size="lg" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            Create Your Arena Account
          </h2>
          <p className="text-xs text-zinc-400">
            Join the battleground. Claim a ₹50 welcome bonus credited to your wallet!
          </p>
        </div>

        <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 lg:p-8 shadow-2xl space-y-6">
          {/* Quick 1-Click Social Sign-Up */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/api/auth/google";
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs transition cursor-pointer border border-white shadow-md shadow-white/5 active:scale-[0.99]"
              >
                <GoogleIcon />
                <span>Sign up with Google</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/api/auth/discord";
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-xs transition cursor-pointer border border-[#6b77f5] shadow-md shadow-[#5865F2]/20 active:scale-[0.99]"
              >
                <DiscordIcon />
                <span>Sign up with Discord</span>
              </button>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Or register with custom account
              </span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setRole("PLAYER")}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === "PLAYER"
                  ? "bg-lime-500 text-black shadow-md shadow-lime-950"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Trophy className="h-4 w-4" /> Player Account
            </button>
            <button
              type="button"
              onClick={() => setRole("ORGANIZER")}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === "ORGANIZER"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-950"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-4 w-4" /> Tournament Host
            </button>
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Username"
                placeholder="e.g. Phoenix99"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                leftIcon={<User className="h-4 w-4" />}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                required
              />
            </div>

            <Input
              label="Password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              required
            />

            {role === "PLAYER" ? (
              <div className="space-y-3 pt-1 border-t border-zinc-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Game Credentials (Optional, can be added later)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Free Fire UID"
                    placeholder="e.g. 1928475920"
                    value={freeFireId}
                    onChange={(e) => setFreeFireId(e.target.value)}
                  />
                  <Input
                    label="BGMI Character ID"
                    placeholder="e.g. 5183920194"
                    value={bgmiId}
                    onChange={(e) => setBgmiId(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-1 border-t border-zinc-800/80">
                <Input
                  label="Organization / Clan Name"
                  placeholder="e.g. Delta Esports India"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              variant={role === "PLAYER" ? "lime" : "primary"}
              className="w-full font-black text-xs uppercase tracking-wider py-3"
              isLoading={isLoading}
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              {role === "PLAYER" ? "Claim ₹50 & Register" : "Register Host Profile"}
            </Button>
          </form>

          <div className="text-center text-xs text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-lime-400 hover:text-lime-300">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
