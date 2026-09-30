import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { OrganizerProfile, User } from "@/lib/db/models";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    await connectToDatabase();

    const profile = await OrganizerProfile.findOneAndUpdate(
      { userId: session.id },
      {
        organizationName: body.organizationName,
        description: body.description,
        phone: body.phone,
        website: body.website,
        upiId: body.upiId,
        status: "PENDING",
        verifiedByAdmin: false,
      },
      { upsert: true, new: true }
    );

    // Update user role to ORGANIZER if still PLAYER
    await User.findByIdAndUpdate(session.id, { role: "ORGANIZER" });

    return NextResponse.json({
      message: "Organizer application submitted successfully",
      profile,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error applying for organizer";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
