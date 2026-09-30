"use client";

import React, { useState } from "react";
import { Mail, MessageSquare, ShieldCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="min-h-screen py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lime-400">
          <MessageSquare className="h-4 w-4" /> 24/7 Operations Support
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          Contact BATTLEXA Desk
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Need assistance with a tournament dispute, withdrawal, or host verification? Send our referee and compliance staff a direct inquiry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="p-5 rounded-xl bg-[#0e111a] border border-white/[0.08] space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Email Desk
            </h4>
            <p className="text-xs text-zinc-400">
              support@battlexa.gg
            </p>
            <p className="text-xs text-zinc-400">
              disputes@battlexa.gg
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0e111a] border border-white/[0.08] space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Response SLA
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Match disputes resolved within 15 minutes during live tournaments. General inquiries within 2 hours.
            </p>
          </div>
        </div>

        <div className="md:col-span-2 rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 lg:p-8">
          {isSent ? (
            <Alert variant="success" title="Message Dispatched!">
              Your inquiry has been logged with ticket reference #BX-{Date.now().toString().slice(-6)}. Our referee desk will respond to your email shortly.
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Name"
                  placeholder="e.g. Alex Hunter"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="alex@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Subject / Tournament Title"
                placeholder="e.g. BGMI Tier 1 Scrims - Score Discrepancy"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Message / Dispute Details
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your issue with player IDs, match round, and details..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <Button type="submit" variant="lime" className="w-full">
                <Send className="h-4 w-4 mr-1.5" /> Dispatch Inquiry
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
