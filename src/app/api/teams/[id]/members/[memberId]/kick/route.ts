import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { Team } from "@/lib/db/models";
import { createNotification } from "@/lib/notifications/notification-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id, memberId } = await params;
    const session = await requireAuth();

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(memberId)
    ) {
      return NextResponse.json({ error: "Invalid squad or member ID" }, { status: 400 });
    }

    await connectToDatabase();
    const team = await Team.findById(id);

    if (!team) {
      return NextResponse.json({ error: "Squad not found" }, { status: 404 });
    }

    const callerMember = team.members.find(
      (m) => m.userId.toString() === session.id
    );
    const isCallerLeader = team.leaderId.toString() === session.id;
    const isCallerCoLeader = callerMember?.role === "CO_LEADER";

    if (!isCallerLeader && !isCallerCoLeader) {
      return NextResponse.json(
        { error: "Only Captain or Co-Leader have ejection authority." },
        { status: 403 }
      );
    }

    // Target member
    const targetIndex = team.members.findIndex(
      (m) => m.userId.toString() === memberId
    );

    if (targetIndex === -1) {
      return NextResponse.json(
        { error: "Target player is not in this squad roster" },
        { status: 404 }
      );
    }

    const targetMember = team.members[targetIndex];

    // Cannot kick leader
    if (targetMember.role === "LEADER" || targetMember.userId.toString() === team.leaderId.toString()) {
      return NextResponse.json(
        { error: "Cannot kick the squad Captain." },
        { status: 400 }
      );
    }

    // Co-Leader cannot kick another Co-Leader
    if (isCallerCoLeader && !isCallerLeader && targetMember.role === "CO_LEADER") {
      return NextResponse.json(
        { error: "Co-Leaders cannot eject fellow Co-Leaders. Only Captain can perform this action." },
        { status: 403 }
      );
    }

    // Remove member
    team.members.splice(targetIndex, 1);
    await team.save();

    // Send notification to kicked player
    try {
      await createNotification({
        userId: memberId,
        title: "Ejected from Squad ⚠️",
        message: `You were removed from squad [${team.tag}] ${team.name} by squad leadership.`,
        type: "SYSTEM",
        link: "/player/teams",
      });
    } catch (e) {
      console.warn("Notification error:", e);
    }

    return NextResponse.json({
      message: `${targetMember.inGameName} has been ejected from squad.`,
      team,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error kicking member";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
