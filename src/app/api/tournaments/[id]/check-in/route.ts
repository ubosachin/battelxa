import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db/connect";
import { Tournament, Registration } from "@/lib/db/models";
import { requireAuth } from "@/lib/auth/session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAuth();

    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid tournament ID" }, { status: 400 });
    }

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    // Check if tournament is in a valid state for check-in
    const validStatuses = ["REGISTRATION_CLOSED", "CHECK_IN", "LIVE", "REGISTRATION_OPEN"];
    if (!validStatuses.includes(tournament.status)) {
      return NextResponse.json(
        { error: `Check-in is not permitted when tournament is ${tournament.status}` },
        { status: 400 }
      );
    }

    const registration = await Registration.findOne({
      tournamentId: id,
      userId: session.id,
      status: { $ne: "CANCELLED" },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "You are not registered for this tournament." },
        { status: 403 }
      );
    }

    if (registration.status === "CHECKED_IN") {
      return NextResponse.json({
        message: "Already checked in",
        registration,
      });
    }

    registration.status = "CHECKED_IN";
    registration.checkedInAt = new Date();
    await registration.save();

    return NextResponse.json({
      message: "Check-in successful! Your slot is locked.",
      slotNumber: registration.slotNumber,
      status: "CHECKED_IN",
      checkedInAt: registration.checkedInAt,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error checking in";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
