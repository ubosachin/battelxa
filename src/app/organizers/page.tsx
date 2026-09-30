import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Star, Users, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { connectToDatabase } from "@/lib/db/connect";
import { OrganizerProfile } from "@/lib/db/models/OrganizerProfile";

export const dynamic = "force-dynamic";

async function getRealOrganizers() {
  try {
    await connectToDatabase();
    const profiles = await OrganizerProfile.find({ status: "APPROVED" })
      .sort({ totalPrizeDistributed: -1, tournamentsHosted: -1 })
      .lean();

    return profiles.map((p) => ({
      _id: p._id.toString(),
      name: p.organizationName,
      description: p.description || "Verified tournament host on BATTLEXA.",
      tournamentsHosted: p.tournamentsHosted || 0,
      totalPrize: p.totalPrizeDistributed || 0,
      rating: p.rating || 5.0,
      verified: Boolean(p.verifiedByAdmin),
      games: ["Free Fire MAX", "BGMI"],
    }));
  } catch (error) {
    console.error("Failed to load organizers:", error);
    return [];
  }
}

export default async function OrganizersDirectoryPage() {
  const organizers = await getRealOrganizers();

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lime-400">
            <ShieldCheck className="h-4 w-4" /> Verified Hosts
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Tournament Organizers Directory
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            Meet the verified esports organizations running competitive tournaments and scrims on BATTLEXA with guaranteed prize payouts.
          </p>
        </div>

        <Link href="/organizer/apply">
          <Button variant="lime">
            Become a Verified Host
          </Button>
        </Link>
      </div>

      {organizers.length === 0 ? (
        <div className="py-20 px-6 rounded-2xl bg-[#0e111a] border border-white/[0.08] text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-lime-500/20 text-lime-400 mx-auto flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Verified Hosts Registered Yet</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Be the first partner organization to host official tournaments and distribute verified prize pools to players.
            </p>
          </div>
          <Link href="/organizer/apply">
            <Button variant="lime" size="sm">
              Submit Host Application
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {organizers.map((org) => (
            <div
              key={org._id}
              className="rounded-2xl bg-[#0e111a] border border-white/[0.08] p-6 space-y-4 hover:border-violet-500/40 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-800 flex items-center justify-center text-lg font-black text-white shadow-lg">
                    {org.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                      {org.name}
                      {org.verified && (
                        <ShieldCheck className="h-4 w-4 text-lime-400" />
                      )}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center text-amber-400 text-xs font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-400 mr-1" />
                        {org.rating}
                      </span>
                      <span className="text-[11px] text-zinc-500">•</span>
                      <span className="text-[11px] text-zinc-400">
                        {org.tournamentsHosted} cups hosted
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  {org.games.map((g) => (
                    <span
                      key={g}
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                {org.description}
              </p>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">
                    Prize Distributed
                  </span>
                  <span className="text-sm font-black text-lime-400">
                    {formatCurrency(org.totalPrize)}
                  </span>
                </div>

                <Link href="/tournaments">
                  <button className="inline-flex items-center gap-1 text-xs font-bold text-violet-400 hover:text-violet-300 cursor-pointer">
                    View hosted cups <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
