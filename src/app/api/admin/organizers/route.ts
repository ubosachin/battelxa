import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { OrganizerProfile } from "@/lib/db/models/OrganizerProfile";

export async function GET() {
  try {
    await requireAuth("ADMIN");
    await connectToDatabase();

    const organizers = await OrganizerProfile.find()
      .populate("userId", "username email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ organizers });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching organizers";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
