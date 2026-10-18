import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { Team } from "@/lib/db/models";
import { UpdateMemberRoleSchema } from "@/lib/validations/team";
import { createNotification } from "@/lib/notifications/notification-service";

export async function PATCH(
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

    // Only Captain can manage member roles or transfer leadership
    if (team.leaderId.toString() !== session.id) {
      return NextResponse.json(
        { error: "Only the Squad Captain can adjust roles or transfer captaincy." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = UpdateMemberRoleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid role selection" },
        { status: 400 }
      );
    }

    const { role: newRole } = parsed.data;

    // Target member
    const targetMember = team.members.find(
      (m) => m.userId.toString() === memberId
    );

    if (!targetMember) {
      return NextResponse.json(
        { error: "Target player is not in this squad roster" },
        { status: 404 }
      );
    }

    if (newRole === "LEADER") {
      // Transfer leadership
      // Current leader becomes CO_LEADER
      const oldLeaderMember = team.members.find(
        (m) => m.userId.toString() === session.id
      );
      if (oldLeaderMember) {
        oldLeaderMember.role = "CO_LEADER";
      }

      targetMember.role = "LEADER";
      team.leaderId = new mongoose.Types.ObjectId(memberId);
      await team.save();

      // Notify new captain
      try {
        await createNotification({
          userId: memberId,
          title: "Promoted to Squad Captain! 👑",
          message: `You are now the Captain of [${team.tag}] ${team.name}. Lead your squad to victory!`,
          type: "SYSTEM",
          link: "/player/teams",
        });
      } catch (e) {
        console.warn("Notification error:", e);
      }

      return NextResponse.json({
        message: `Captaincy successfully transferred to ${targetMember.inGameName}!`,
        team,
      });
    }

    // Role is CO_LEADER or MEMBER
    targetMember.role = newRole;
    await team.save();

    try {
      await createNotification({
        userId: memberId,
        title: `Squad Role Updated: ${newRole === "CO_LEADER" ? "Co-Leader 🛡️" : "Member"}`,
        message: `Your rank in squad [${team.tag}] ${team.name} is now ${newRole}.`,
        type: "SYSTEM",
        link: "/player/teams",
      });
    } catch (e) {
      console.warn("Notification error:", e);
    }

    return NextResponse.json({
      message: `${targetMember.inGameName}'s rank updated to ${newRole}.`,
      team,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating role";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
