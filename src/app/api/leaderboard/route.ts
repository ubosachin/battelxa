import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { PlayerProfile } from "@/lib/db/models/PlayerProfile";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const game = searchParams.get("game") || "all";

    const filter: Record<string, unknown> = {};
    if (game === "free-fire-max") {
      filter.freeFireId = { $exists: true, $ne: "" };
    } else if (game === "bgmi") {
      filter.bgmiId = { $exists: true, $ne: "" };
    }

    const profiles = await PlayerProfile.find(filter)
      .sort({ earnings: -1, matchesWon: -1, totalKills: -1 })
      .limit(50)
      .lean();

    const leaderboard = profiles.map((p, index) => {
      const winRate =
        p.matchesPlayed > 0
          ? `${((p.matchesWon / p.matchesPlayed) * 100).toFixed(1)}%`
          : "0.0%";

      let primaryGame = "Free Fire MAX";
      if (p.bgmiId && !p.freeFireId) {
        primaryGame = "BGMI";
      } else if (p.freeFireId && p.bgmiId) {
        primaryGame = "Multi-Title";
      }

      return {
        rank: index + 1,
        userId: p.userId?.toString(),
        gamerTag: p.gamerTag,
        game: primaryGame,
        earnings: p.earnings || 0,
        matchesPlayed: p.matchesPlayed || 0,
        matchesWon: p.matchesWon || 0,
        kills: p.totalKills || 0,
        winRate,
        rankTitle: p.rankTitle || "Contender",
      };
    });

    return NextResponse.json({ success: true, leaderboard });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load leaderboard";
    console.error("Leaderboard GET error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
