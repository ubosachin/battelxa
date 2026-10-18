import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { Team } from "@/lib/db/models";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code || code.trim().length !== 6) {
      return NextResponse.json(
        { error: "Valid 6-character join code is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const team = await Team.findOne({ joinCode: code.trim().toUpperCase() })
      .populate("leaderId", "username")
      .lean();

    if (!team) {
      return NextResponse.json(
        { error: "No squad found with this invite code" },
        { status: 404 }
      );
    }

    const leaderName =
      (team.leaderId as unknown as { username?: string })?.username || "Squad Captain";

    return NextResponse.json({
      preview: {
        id: team._id,
        name: team.name,
        tag: team.tag,
        game: team.game,
        logo: team.logo || "dragon",
        bio: team.bio || "",
        joinCode: team.joinCode,
        memberCount: team.members.length,
        maxSlots: 5,
        isFull: team.members.length >= 5,
        leaderName,
        matchesPlayed: team.matchesPlayed || 0,
        matchesWon: team.matchesWon || 0,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error previewing team";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
