"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Lock, Mail, User, ShieldCheck, Trophy, Sparkles } from "lucide-react";

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

      if (role === "ORGANIZER") {
        router.push("/organizer/dashboard");
      } else {
        router.push("/player/dashboard");
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
