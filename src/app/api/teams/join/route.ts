import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { Team, PlayerProfile } from "@/lib/db/models";
import { JoinTeamSchema } from "@/lib/validations/team";
import { createNotification } from "@/lib/notifications/notification-service";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    const parsed = JoinTeamSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid join code format" },
        { status: 400 }
      );
    }

    const { joinCode } = parsed.data;

    await connectToDatabase();
    const team = await Team.findOne({ joinCode: joinCode.trim().toUpperCase() });

    if (!team) {
      return NextResponse.json(
        { error: "No squad found with this invite code. Check the code and try again." },
        { status: 404 }
      );
    }

    // Check if already a member
    const isAlreadyMember = team.members.some(
      (m) => m.userId.toString() === session.id
    );
    if (isAlreadyMember) {
      return NextResponse.json(
        { error: `You are already an active gladiator in [${team.tag}] ${team.name}.` },
        { status: 409 }
      );
    }

    // Check squad limit (Max 5 members: 4 main + 1 substitute)
    if (team.members.length >= 5) {
      return NextResponse.json(
        { error: `Squad [${team.tag}] roster is already at max capacity (5/5 players).` },
        { status: 400 }
      );
    }

    const profile = await PlayerProfile.findOne({ userId: session.id });
    const inGameId =
      body.inGameId ||
      (team.game === "FREE_FIRE_MAX" ? profile?.freeFireId : profile?.bgmiId) ||
      "ID_PENDING";
    const inGameName = body.inGameName || profile?.gamerTag || session.username;

    team.members.push({
      userId: new Types.ObjectId(session.id),
      role: "MEMBER",
      inGameName,
      inGameId,
      joinedAt: new Date(),
    });

    await team.save();

    // Notify the squad leader
    try {
      await createNotification({
        userId: team.leaderId.toString(),
        title: "New Gladiator Joined Your Squad! 🛡️",
        message: `${session.username} has enlisted in [${team.tag}] ${team.name} via invite code.`,
        type: "SYSTEM",
        link: "/player/teams",
      });
    } catch (e) {
      console.warn("Failed to dispatch leader squad join notification:", e);
    }

    return NextResponse.json({
      message: `Enlisted in [${team.tag}] ${team.name} successfully!`,
      team,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error joining team";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
