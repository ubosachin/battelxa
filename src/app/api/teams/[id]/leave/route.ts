import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { Team } from "@/lib/db/models";
import { createNotification } from "@/lib/notifications/notification-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAuth();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid squad ID" }, { status: 400 });
    }

    await connectToDatabase();
    const team = await Team.findById(id);

    if (!team) {
      return NextResponse.json({ error: "Squad not found" }, { status: 404 });
    }

    // Captain cannot just leave; must transfer leadership or disband
    if (team.leaderId.toString() === session.id) {
      return NextResponse.json(
        {
          error:
            "As the Squad Captain, you cannot leave. Transfer captaincy to another member or disband the squad.",
        },
        { status: 400 }
      );
    }

    const memberIndex = team.members.findIndex(
      (m) => m.userId.toString() === session.id
    );

    if (memberIndex === -1) {
      return NextResponse.json(
        { error: "You are not a member of this squad" },
        { status: 400 }
      );
    }

    const leavingMember = team.members[memberIndex];
    team.members.splice(memberIndex, 1);
    await team.save();

    // Notify Captain
    try {
      await createNotification({
        userId: team.leaderId.toString(),
        title: "Gladiator Departed Squad 🚪",
        message: `${leavingMember.inGameName} has left squad [${team.tag}] ${team.name}.`,
        type: "SYSTEM",
        link: "/player/teams",
      });
    } catch (e) {
      console.warn("Notification error:", e);
    }

    return NextResponse.json({
      message: `You left squad [${team.tag}] ${team.name}.`,
      team,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error leaving team";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
