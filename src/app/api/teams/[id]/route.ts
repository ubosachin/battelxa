import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { Team } from "@/lib/db/models";
import { UpdateTeamSchema } from "@/lib/validations/team";
import { createNotification } from "@/lib/notifications/notification-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAuth();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid squad ID" }, { status: 400 });
    }

    await connectToDatabase();
    const team = await Team.findById(id).lean();

    if (!team) {
      return NextResponse.json({ error: "Squad not found" }, { status: 404 });
    }

    return NextResponse.json({ team });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching team";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(
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

    // Verify caller is Leader or Co-Leader
    const callerMember = team.members.find(
      (m) => m.userId.toString() === session.id
    );
    const isLeader = team.leaderId.toString() === session.id;
    const isCoLeader = callerMember?.role === "CO_LEADER";

    if (!isLeader && !isCoLeader) {
      return NextResponse.json(
        { error: "Only squad Captain or Co-Leader can modify squad settings" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // 1. Action: Regenerate Join Code
    if (body.action === "REGENERATE_CODE") {
      let joinCode = "";
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const codeExists = await Team.findOne({ joinCode });
        if (!codeExists) {
          isUnique = true;
        }
        attempts++;
      }

      team.joinCode = joinCode;
      await team.save();

      return NextResponse.json({
        message: "Squad join code regenerated successfully!",
        joinCode,
        team,
      });
    }

    // 2. Standard update
    const parsed = UpdateTeamSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid update data" },
        { status: 400 }
      );
    }

    const { name, tag, bio, logo, isOpenRecruiting } = parsed.data;

    // Check duplicate name or tag if modified
    if (name && name !== team.name) {
      const nameExists = await Team.findOne({
        _id: { $ne: team._id },
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      });
      if (nameExists) {
        return NextResponse.json(
          { error: `Squad name "${name}" is already in use.` },
          { status: 409 }
        );
      }
      team.name = name;
    }

    if (tag && tag !== team.tag) {
      const tagExists = await Team.findOne({
        _id: { $ne: team._id },
        tag: tag.toUpperCase(),
      });
      if (tagExists) {
        return NextResponse.json(
          { error: `Clan tag [${tag}] is already taken.` },
          { status: 409 }
        );
      }
      team.tag = tag.toUpperCase();
    }

    if (bio !== undefined) team.bio = bio;
    if (logo !== undefined) team.logo = logo;
    if (isOpenRecruiting !== undefined) team.isOpenRecruiting = isOpenRecruiting;

    await team.save();

    return NextResponse.json({
      message: "Squad details updated successfully!",
      team,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating team";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
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

    // Only Captain can disband squad
    if (team.leaderId.toString() !== session.id) {
      return NextResponse.json(
        { error: "Only the Squad Captain can disband this clan." },
        { status: 403 }
      );
    }

    // Notify other members
    const otherMembers = team.members.filter(
      (m) => m.userId.toString() !== session.id
    );
    for (const member of otherMembers) {
      try {
        await createNotification({
          userId: member.userId.toString(),
          title: "Squad Disbanded ⚠️",
          message: `Your squad [${team.tag}] ${team.name} has been disbanded by the Captain.`,
          type: "SYSTEM",
          link: "/player/teams",
        });
      } catch (e) {
        console.warn("Notification error:", e);
      }
    }

    await Team.findByIdAndDelete(id);

    return NextResponse.json({
      message: `Squad [${team.tag}] ${team.name} has been disbanded.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error disbanding team";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
