import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db/connect";
import { Tournament, Registration, TournamentStatus } from "@/lib/db/models";
import { requireAuth } from "@/lib/auth/session";
import { isValidTournamentTransition } from "@/lib/tournament/state-machine";
import { creditWallet } from "@/lib/payments/wallet-service";
import { broadcastNotification } from "@/lib/notifications/notification-service";

export async function PATCH(
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

    // Role check: Only organizer of tournament or admin can transition status
    if (
      session.role !== "ADMIN" &&
      tournament.organizerId.toString() !== session.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { status: targetStatus } = await req.json();

    if (!targetStatus) {
      return NextResponse.json({ error: "Target status required" }, { status: 400 });
    }

    const currentStatus = tournament.status as TournamentStatus;

    if (!isValidTournamentTransition(currentStatus, targetStatus as TournamentStatus)) {
      return NextResponse.json(
        {
          error: `Invalid status transition from ${currentStatus} to ${targetStatus}`,
        },
        { status: 400 }
      );
    }

    tournament.status = targetStatus;

    // Handle cancellation: refund registered players
    if (targetStatus === "CANCELLED" && tournament.entryFee > 0) {
      const activeRegistrations = await Registration.find({
        tournamentId: id,
        status: { $ne: "CANCELLED" },
        paymentStatus: "COMPLETED",
      });

      for (const reg of activeRegistrations) {
        await creditWallet({
          userId: reg.userId,
          amount: tournament.entryFee,
          type: "REFUND",
          referenceId: tournament._id.toString(),
          description: `Refund for cancelled tournament: ${tournament.title}`,
        });

        reg.status = "CANCELLED";
        reg.paymentStatus = "REFUNDED";
        await reg.save();
      }

      // Notify registered players
      const userIds = activeRegistrations.map((r) => r.userId);
      await broadcastNotification({
        userIds,
        title: "Tournament Cancelled & Refunded",
        message: `Tournament "${tournament.title}" was cancelled. Your entry fee of ₹${tournament.entryFee} has been refunded to your wallet.`,
        type: "TOURNAMENT",
      });
    }

    await tournament.save();

    return NextResponse.json({
      message: `Tournament status updated to ${targetStatus}`,
      status: tournament.status,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating tournament status";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
