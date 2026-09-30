import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { Team, PlayerProfile } from "@/lib/db/models";

export async function GET() {
  try {
    const session = await requireAuth();
    await connectToDatabase();

    const teams = await Team.find({
      $or: [{ leaderId: session.id }, { "members.userId": session.id }],
    })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ teams });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching teams";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { name, tag, game } = body;

    if (!name || !tag || !game) {
      return NextResponse.json(
        { error: "Team name, tag, and game selection are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Fetch player profile for in-game credentials
    const profile = await PlayerProfile.findOne({ userId: session.id });
    const inGameId =
      (game === "FREE_FIRE_MAX" ? profile?.freeFireId : profile?.bgmiId) ||
      "ID_PENDING";
    const inGameName = profile?.gamerTag || session.username;

    // Generate unique 6-character join code
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const team = await Team.create({
      name,
      tag: tag.toUpperCase(),
      leaderId: session.id,
      game,
      joinCode,
      members: [
        {
          userId: session.id,
          role: "LEADER",
          inGameName,
          inGameId,
          joinedAt: new Date(),
        },
      ],
    });

    return NextResponse.json(
      { message: "Team created successfully", team },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Team creation error:", error);
    const message = error instanceof Error ? error.message : "Error creating team";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
