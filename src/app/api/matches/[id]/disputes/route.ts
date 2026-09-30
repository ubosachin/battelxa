import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { Dispute, Tournament } from "@/lib/db/models";
import { SubmitDisputeSchema } from "@/lib/validations/tournament";
import { createNotification } from "@/lib/notifications/notification-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;
    const session = await requireAuth();

    const body = await req.json();
    const validated = SubmitDisputeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { tournamentId, reason, evidenceUrls } = validated.data;
    await connectToDatabase();

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const dispute = await Dispute.create({
      tournamentId,
      matchId: matchId !== "general" ? matchId : undefined,
      reporterId: session.id,
      reason,
      evidenceUrls,
      status: "PENDING",
    });

    // Notify organizer & admin
    await createNotification({
      userId: tournament.organizerId,
      title: "New Match Dispute Filed ⚠️",
      message: `A dispute has been raised for "${tournament.title}". Evidence has been attached for review.`,
      type: "DISPUTE",
      link: `/organizer/tournaments/${tournament._id}/disputes`,
    });

    return NextResponse.json(
      {
        message: "Dispute submitted successfully and queued for referee review",
        dispute,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Dispute submission error:", error);
    const message = error instanceof Error ? error.message : "Error submitting dispute";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
