import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Tournament, Registration } from "@/lib/db/models";
import { requireAuth } from "@/lib/auth/session";
import { canAccessRoomCredentials } from "@/lib/tournament/state-machine";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAuth();

    await connectToDatabase();
    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    // Admins and tournament owner can always view credentials
    const isPrivileged =
      session.role === "ADMIN" ||
      tournament.organizerId.toString() === session.id;

    if (isPrivileged) {
      return NextResponse.json({
        roomId: tournament.roomCredentials?.roomId || "",
        password: tournament.roomCredentials?.password || "",
        released: true,
        notes: tournament.roomCredentials?.notes || "",
      });
    }

    // Verify registration status of the player
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

    // Verify timing eligibility
    const releaseTime =
      tournament.roomCredentials?.releaseTime ||
      new Date(tournament.startTime.getTime() - 15 * 60 * 1000);

    const accessCheck = canAccessRoomCredentials(
      releaseTime,
      true,
      tournament.status
    );

    if (!accessCheck.canAccess) {
      return NextResponse.json(
        {
          error: accessCheck.reason,
          releaseTime,
          isLocked: true,
        },
        { status: 425 } // Too Early
      );
    }

    return NextResponse.json({
      roomId: tournament.roomCredentials?.roomId || "TBA",
      password: tournament.roomCredentials?.password || "",
      notes: tournament.roomCredentials?.notes || "Join assigned slot only.",
      released: true,
      slotNumber: registration.slotNumber,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error retrieving room credentials";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
