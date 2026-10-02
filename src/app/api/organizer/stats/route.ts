import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { Tournament, OrganizerProfile } from "@/lib/db/models";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const userId = new mongoose.Types.ObjectId(session.id);

    const [tournaments, orgProfile] = await Promise.all([
      Tournament.find({ organizerId: userId }).sort({ createdAt: -1 }).lean(),
      OrganizerProfile.findOne({ userId }).lean(),
    ]);

    const totalCupsHosted = tournaments.length;
    const totalPrizeDistributed =
      tournaments
        .filter((t) => t.status === "COMPLETED")
        .reduce((sum, t) => sum + (t.prizePool || 0), 0) ||
      orgProfile?.totalPrizeDistributed ||
      0;

    const activeGladiators = tournaments.reduce(
      (sum, t) => sum + (t.registeredSlots || 0),
      0
    );

    const rating = orgProfile?.rating ?? 5.0;

    return NextResponse.json(
      {
        stats: {
          totalCupsHosted,
          totalPrizeDistributed,
          activeGladiators,
          rating,
          organizationName: orgProfile?.organizationName || session.username,
          verified: Boolean(orgProfile?.verifiedByAdmin && orgProfile?.status === "APPROVED"),
        },
        tournaments,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Organizer stats error:", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
