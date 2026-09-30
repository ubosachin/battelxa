import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { PlayerProfile } from "@/lib/db/models/PlayerProfile";

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    await connectToDatabase();

    const profile = await PlayerProfile.findOneAndUpdate(
      { userId: session.id },
      {
        gamerTag: body.gamerTag,
        freeFireId: body.freeFireId,
        bgmiId: body.bgmiId,
        bio: body.bio,
        phone: body.phone,
        discordHandle: body.discordHandle,
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
