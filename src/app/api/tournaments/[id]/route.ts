import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Tournament, Registration, User } from "@/lib/db/models";
import { getSession } from "@/lib/auth/session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const tournament = await Tournament.findById(id)
      .populate("organizerId", "username")
      .lean();

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    // Check if current user is registered
    const session = await getSession();
    let isUserRegistered = false;
    let userSlotNumber = null;

    if (session) {
      const reg = await Registration.findOne({
        tournamentId: id,
        userId: session.id,
        status: { $ne: "CANCELLED" },
      });
      if (reg) {
        isUserRegistered = true;
        userSlotNumber = reg.slotNumber;
      }
    }

    // Get list of registered players/teams for roster view
    const registrations = await Registration.find({
      tournamentId: id,
      status: { $ne: "CANCELLED" },
    })
      .select("teamName teamTag slotNumber members status registeredAt")
      .sort({ slotNumber: 1 })
      .lean();

    // Sanitize tournament credentials for public view
    const isOwner =
      session &&
      (session.id === tournament.organizerId?._id?.toString() ||
        session.role === "ADMIN");

    const sanitizedTournament = {
      ...tournament,
      roomCredentials: {
        releaseTime: tournament.roomCredentials?.releaseTime,
        released: tournament.roomCredentials?.released,
        // Only owner/admin gets credentials in this generic endpoint;
        // players use the dedicated `/room-credentials` endpoint which enforces timing
        roomId: isOwner ? tournament.roomCredentials?.roomId : undefined,
        password: isOwner ? tournament.roomCredentials?.password : undefined,
      },
    };

    return NextResponse.json({
      tournament: sanitizedTournament,
      registrations,
      isUserRegistered,
      userSlotNumber,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching tournament";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || (session.role !== "ORGANIZER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    if (
      session.role !== "ADMIN" &&
      tournament.organizerId.toString() !== session.id
    ) {
      return NextResponse.json(
        { error: "You can only update your own tournaments" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Update allowable fields
    if (body.title) tournament.title = body.title;
    if (body.rules) tournament.rules = body.rules;
    if (body.streamUrl !== undefined) tournament.streamUrl = body.streamUrl;
    if (body.bannerUrl) tournament.bannerUrl = body.bannerUrl;

    // Room credentials update
    if (body.roomCredentials) {
      if (!tournament.roomCredentials) {
        tournament.roomCredentials = {
          roomId: "",
          password: "",
          releaseTime: new Date(tournament.startTime.getTime() - 15 * 60 * 1000),
          released: false,
        };
      }
      if (body.roomCredentials.roomId !== undefined) {
        tournament.roomCredentials.roomId = body.roomCredentials.roomId;
      }
      if (body.roomCredentials.password !== undefined) {
        tournament.roomCredentials.password = body.roomCredentials.password;
      }
      if (body.roomCredentials.released !== undefined) {
        tournament.roomCredentials.released = body.roomCredentials.released;
      }
      if (body.roomCredentials.notes !== undefined) {
        tournament.roomCredentials.notes = body.roomCredentials.notes;
      }
    }

    await tournament.save();
    return NextResponse.json({ message: "Tournament updated", tournament });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating tournament";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
