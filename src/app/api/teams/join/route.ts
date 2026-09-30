import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { Team, PlayerProfile } from "@/lib/db/models";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { joinCode } = await req.json();

    if (!joinCode) {
      return NextResponse.json({ error: "Join code is required" }, { status: 400 });
    }

    await connectToDatabase();
    const team = await Team.findOne({ joinCode: joinCode.trim().toUpperCase() });

    if (!team) {
      return NextResponse.json(
        { error: "No team found with this invite code" },
        { status: 404 }
      );
    }

    // Check if already a member
    const isAlreadyMember = team.members.some(
      (m) => m.userId.toString() === session.id
    );
    if (isAlreadyMember) {
      return NextResponse.json(
        { error: "You are already a member of this squad" },
        { status: 409 }
      );
    }

    // Check squad limit (Max 5 members: 4 main + 1 sub)
    if (team.members.length >= 5) {
      return NextResponse.json(
        { error: "Squad roster is full (max 5 players including substitute)" },
        { status: 400 }
      );
    }

    const profile = await PlayerProfile.findOne({ userId: session.id });
    const inGameId =
      (team.game === "FREE_FIRE_MAX" ? profile?.freeFireId : profile?.bgmiId) ||
      "ID_PENDING";
    const inGameName = profile?.gamerTag || session.username;

    team.members.push({
      userId: new Types.ObjectId(session.id),
      role: "MEMBER",
      inGameName,
      inGameId,
      joinedAt: new Date(),
    });

    await team.save();

    return NextResponse.json({
      message: `Joined squad ${team.name} successfully!`,
      team,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error joining team";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
