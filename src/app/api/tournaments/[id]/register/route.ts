import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import {
  Tournament,
  Registration,
  PlayerProfile,
  Team,
  Wallet,
} from "@/lib/db/models";
import { requireAuth } from "@/lib/auth/session";
import { debitWallet } from "@/lib/payments/wallet-service";
import { createNotification } from "@/lib/notifications/notification-service";

export async function POST(
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

    // 1. Verify tournament status
    if (tournament.status !== "REGISTRATION_OPEN") {
      return NextResponse.json(
        {
          error: `Registrations are not currently open (Status: ${tournament.status})`,
        },
        { status: 400 }
      );
    }

    // 2. Verify registration deadline
    const now = new Date();
    if (now > new Date(tournament.registrationDeadline)) {
      return NextResponse.json(
        { error: "Registration deadline has expired for this tournament" },
        { status: 400 }
      );
    }

    // 3. Verify duplicate registration prevention
    const existingRegistration = await Registration.findOne({
      tournamentId: id,
      userId: session.id,
      status: { $ne: "CANCELLED" },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: "You are already registered for this tournament." },
        { status: 409 }
      );
    }

    // 4. Verify capacity limit atomically using findOneAndUpdate with condition
    // registeredSlots < maxSlots
    const updatedTournament = await Tournament.findOneAndUpdate(
      {
        _id: id,
        status: "REGISTRATION_OPEN",
        $expr: { $lt: ["$registeredSlots", "$maxSlots"] },
      },
      {
        $inc: { registeredSlots: 1 },
      },
      { new: true }
    );

    if (!updatedTournament) {
      return NextResponse.json(
        { error: "Tournament slots are fully booked." },
        { status: 400 }
      );
    }

    const assignedSlotNumber = updatedTournament.registeredSlots;

    // Parse body for team / in-game IDs
    const body = await req.json();
    const { teamId, inGameId, inGameName, registrationType } = body;

    // 5. Handle entry fee deduction if paid tournament
    if (tournament.entryFee > 0 && tournament.type === "PAID") {
      const debitResult = await debitWallet({
        userId: session.id,
        amount: tournament.entryFee,
        type: "TOURNAMENT_ENTRY",
        referenceId: tournament._id.toString(),
        description: `Entry fee for tournament: ${tournament.title}`,
      });

      if (!debitResult.success) {
        // Rollback capacity slot increment
        await Tournament.findByIdAndUpdate(id, { $inc: { registeredSlots: -1 } });
        return NextResponse.json(
          {
            error: debitResult.error || "Insufficient wallet balance. Please top up your wallet.",
          },
          { status: 402 }
        );
      }
    }

    // Fetch player profile for accurate game IDs
    const profile = await PlayerProfile.findOne({ userId: session.id });
    const resolvedInGameId =
      inGameId ||
      (tournament.gameSlug === "free-fire-max"
        ? profile?.freeFireId
        : profile?.bgmiId) ||
      "ID_PENDING";
    const resolvedGamerTag = inGameName || profile?.gamerTag || session.username;

    let teamName = "";
    let teamTag = "";
    let members = [
      {
        userId: session.id,
        gamerTag: resolvedGamerTag,
        inGameId: resolvedInGameId,
      },
    ];

    if (teamId && tournament.format !== "SOLO") {
      const team = await Team.findById(teamId);
      if (team) {
        teamName = team.name;
        teamTag = team.tag;
        // Map team members if available
        if (team.members && team.members.length > 0) {
          members = team.members.map((m) => ({
            userId: m.userId.toString(),
            gamerTag: m.inGameName,
            inGameId: m.inGameId,
          }));
        }
      }
    }

    // 6. Create Registration record
    const registration = await Registration.create({
      tournamentId: tournament._id,
      userId: session.id,
      teamId: teamId || undefined,
      teamName: teamName || undefined,
      teamTag: teamTag || undefined,
      registrationType: tournament.format,
      members,
      slotNumber: assignedSlotNumber,
      paymentStatus: tournament.entryFee > 0 ? "COMPLETED" : "NOT_APPLICABLE",
      status: "CONFIRMED",
      registeredAt: new Date(),
    });

    // 7. Send confirmation in-app notification
    await createNotification({
      userId: session.id,
      title: "Tournament Registration Confirmed! ⚔️",
      message: `You secured Slot #${assignedSlotNumber} in "${tournament.title}". Room credentials will unlock 15 minutes before match start.`,
      type: "TOURNAMENT",
      link: `/tournaments/${tournament._id}`,
    });

    return NextResponse.json(
      {
        message: "Registration successful!",
        registration: {
          id: registration._id,
          slotNumber: assignedSlotNumber,
          status: registration.status,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Tournament registration error:", error);
    const message = error instanceof Error ? error.message : "Error registering for tournament";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
