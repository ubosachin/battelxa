import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { PlayerProfile } from "@/lib/db/models/PlayerProfile";

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    await connectToDatabase();

    const { User } = await import("@/lib/db/models/User");

    const updateData: Record<string, unknown> = {
      gamerTag: body.gamerTag,
      freeFireId: body.freeFireId,
      bgmiId: body.bgmiId,
      bio: body.bio,
      phone: body.phone,
      discordHandle: body.discordHandle,
    };

    if (typeof body.avatar === "string") {
      updateData.avatar = body.avatar;
      await User.findByIdAndUpdate(session.id, { avatar: body.avatar });
    }

    const profile = await PlayerProfile.findOneAndUpdate(
      { userId: session.id },
      updateData,
      { new: true, upsert: true }
    );

    return NextResponse.json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating profile";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
