"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setIsSubmitted(true);
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-grid-pattern">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <BrandLogo size="lg" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            Recover Password
          </h2>
          <p className="text-xs text-zinc-400">
            Enter your account email to receive recovery instructions.
          </p>
        </div>

        <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 lg:p-8 shadow-2xl space-y-6">
          {isSubmitted ? (
            <div className="space-y-4">
              <Alert variant="success" title="Recovery Instructions Sent">
                If an account matches {email}, we have dispatched password reset instructions. Check your inbox and spam folder.
              </Alert>
              <Link href="/login" className="block w-full">
                <Button variant="secondary" className="w-full">
                  Return to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                placeholder="warrior@battlexa.gg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                required
              />

              <Button
                type="submit"
                variant="lime"
                className="w-full py-3"
                isLoading={isLoading}
              >
                Send Recovery Link
              </Button>
            </form>
          )}

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
