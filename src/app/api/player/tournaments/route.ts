import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { Registration } from "@/lib/db/models/Registration";

export async function GET() {
  try {
    const session = await requireAuth();
    await connectToDatabase();

    const registrations = await Registration.find({
      userId: session.id,
      status: { $ne: "CANCELLED" },
    })
      .populate("tournamentId")
      .sort({ registeredAt: -1 })
      .lean();

    return NextResponse.json({ registrations });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching registrations";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
