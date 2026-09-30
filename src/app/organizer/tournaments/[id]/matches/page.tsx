"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Trophy, Upload, CheckCircle2, ArrowLeft, Shield } from "lucide-react";

export default function OrganizerMatchesResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [tournament, setTournament] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [resultsData, setResultsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/tournaments/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTournament(data.tournament);
          setRegistrations(data.registrations || []);

          // Pre-populate result rows based on registrations
          const rows = (data.registrations || []).map((r: any, idx: number) => ({
            teamOrUserId: r.userId || r._id,
            participantName: r.teamName || r.members?.[0]?.gamerTag || `Participant #${idx + 1}`,
            rank: idx + 1,
            kills: 0,
            placementPoints: idx === 0 ? 12 : idx === 1 ? 9 : idx === 2 ? 8 : 0,
            killPoints: 0,
            totalPoints: idx === 0 ? 12 : idx === 1 ? 9 : idx === 2 ? 8 : 0,
            prizeAwarded:
              idx === 0
                ? Math.round((data.tournament.prizePool || 0) * 0.5)
                : idx === 1
                ? Math.round((data.tournament.prizePool || 0) * 0.3)
                : idx === 2
                ? Math.round((data.tournament.prizePool || 0) * 0.2)
                : 0,
          }));
          setResultsData(rows);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  const updateResultRow = (index: number, field: string, value: any) => {
    setResultsData((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      if (field === "kills" || field === "placementPoints") {
        const kills = field === "kills" ? parseInt(value, 10) || 0 : updated[index].kills;
        const place =
          field === "placementPoints"
            ? parseInt(value, 10) || 0
            : updated[index].placementPoints;
        updated[index].killPoints = kills;
        updated[index].totalPoints = place + kills;
      }
      return updated;
    });
  };

  const handleSubmitResults = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    if (!evidenceUrl.trim()) {
      setMessage({
        type: "error",
        text: "Official scoreboard screenshot evidence URL is mandatory for result validation.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/matches/${id}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: id,
          tournamentId: id,
          results: resultsData,
          evidenceUrl: evidenceUrl.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to submit results" });
        return;
      }

      setMessage({
        type: "success",
        text: "Official match results recorded! Prize money has been credited to winner wallets.",
      });

      setTimeout(() => {
        router.push(`/organizer/dashboard`);
      }, 2000);
    } catch {
      setMessage({ type: "error", text: "Network error submitting results" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-xs text-zinc-400">Loading result scoring desk...</div>;
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/organizer/tournaments/${id}/manage`}
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Tournament Management
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Scorecard & Result Submission Desk
        </h1>
        <p className="text-xs text-zinc-400">
          Enter finish points, ranks, attach scoreboard screenshot proof, and trigger automated prize credits.
        </p>
      </div>

      {message && (
        <Alert variant={message.type === "success" ? "success" : "error"}>
          {message.text}
        </Alert>
      )}

      <form onSubmit={handleSubmitResults} className="space-y-6">
        {/* Evidence URL Card */}
        <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lime-400">
            <Upload className="h-4 w-4" /> Official Screenshot Evidence
          </div>

          <Input
            label="Cloudinary / Image Evidence URL"
            placeholder="https://res.cloudinary.com/... or Imgur scoreboard screenshot"
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            helperText="Referees and players inspect this screenshot to verify accuracy and resolve disputes."
            required
          />

          <Input
            label="Organizer Match Notes"
            placeholder="e.g. Bermuda Round 1 concluded cleanly. No rule infractions noted."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Results Scoring Table */}
        <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Trophy className="h-4 w-4 text-lime-400" /> Rank & Points Breakdown
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Participant</th>
                  <th className="py-2.5 px-3">Finishes / Kills</th>
                  <th className="py-2.5 px-3">Placement Pts</th>
                  <th className="py-2.5 px-3">Total Pts</th>
                  <th className="py-2.5 px-3">Prize (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {resultsData.map((row, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-bold text-lime-400">
                      #{row.rank}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {row.participantName}
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="0"
                        value={row.kills}
                        onChange={(e) => updateResultRow(idx, "kills", e.target.value)}
                        className="w-16 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-white font-bold"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="0"
                        value={row.placementPoints}
                        onChange={(e) =>
                          updateResultRow(idx, "placementPoints", e.target.value)
                        }
                        className="w-16 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-white font-bold"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-bold text-violet-300">
                      {row.totalPoints}
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="0"
                        value={row.prizeAwarded}
                        onChange={(e) =>
                          updateResultRow(idx, "prizeAwarded", e.target.value)
                        }
                        className="w-24 px-2 py-1 rounded bg-zinc-900 border border-lime-500/30 text-lime-400 font-bold"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="lime" size="lg" isLoading={isSubmitting}>
            <CheckCircle2 className="h-4 w-4 mr-1.5" /> Finalize Scores & Credit Prizes
          </Button>
        </div>
      </form>
    </div>
  );
}
