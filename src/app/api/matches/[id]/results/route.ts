import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import {
  Match,
  MatchResult,
  Tournament,
  PlayerProfile,
} from "@/lib/db/models";
import { creditWallet } from "@/lib/payments/wallet-service";
import { createNotification } from "@/lib/notifications/notification-service";
import { SubmitMatchResultSchema } from "@/lib/validations/tournament";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;
    const session = await requireAuth();

    await connectToDatabase();
    const { OrganizerProfile } = await import("@/lib/db/models");
    const org = await OrganizerProfile.findOne({ userId: session.id });
    const isApprovedOrg = Boolean(org && (org.status === "APPROVED" || org.verifiedByAdmin));

    if (session.role !== "ORGANIZER" && session.role !== "ADMIN" && !isApprovedOrg) {
      return NextResponse.json(
        { error: "Only organizers or admins can submit official results" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = SubmitMatchResultSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const tournament = await Tournament.findById(validated.data.tournamentId);

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    if (
      session.role !== "ADMIN" &&
      tournament.organizerId.toString() !== session.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const createdResults = [];

    for (const r of validated.data.results) {
      const matchResult = await MatchResult.create({
        matchId,
        tournamentId: tournament._id,
        teamOrUserId: r.teamOrUserId,
        isTeam: r.isTeam,
        participantName: r.participantName,
        rank: r.rank,
        kills: r.kills,
        placementPoints: r.placementPoints,
        killPoints: r.killPoints,
        totalPoints: r.totalPoints,
        prizeAwarded: r.prizeAwarded,
        evidenceUrl: validated.data.evidenceUrl || "",
        notes: validated.data.notes || "",
        submittedBy: session.id,
        verifiedByOrganizer: true,
        verifiedByAdmin: session.role === "ADMIN",
        status: "SUBMITTED",
      });

      // Update player profile stats
      if (!r.isTeam) {
        await PlayerProfile.findOneAndUpdate(
          { userId: r.teamOrUserId },
          {
            $inc: {
              matchesPlayed: 1,
              matchesWon: r.rank === 1 ? 1 : 0,
              totalKills: r.kills,
              earnings: r.prizeAwarded || 0,
            },
          }
        );

        // If prize money awarded, credit player wallet directly
        if (r.prizeAwarded > 0) {
          await creditWallet({
            userId: r.teamOrUserId,
            amount: r.prizeAwarded,
            type: "PRIZE_CREDIT",
            referenceId: tournament._id.toString(),
            description: `Prize for Rank #${r.rank} in ${tournament.title}`,
          });

          await createNotification({
            userId: r.teamOrUserId,
            title: `🏆 Victory! Rank #${r.rank} Prize Credited!`,
            message: `Congratulations! ₹${r.prizeAwarded} prize money has been credited to your arena wallet for ${tournament.title}.`,
            type: "TOURNAMENT",
            link: "/player/wallet",
          });
        }
      }

      createdResults.push(matchResult);
    }

    // Update match and tournament status
    await Match.findByIdAndUpdate(matchId, { status: "COMPLETED" });
    await Tournament.findByIdAndUpdate(tournament._id, {
      status: "COMPLETED",
      winnerDeclared: true,
    });

    return NextResponse.json({
      message: "Match results and prize rewards processed successfully",
      results: createdResults,
    });
  } catch (error: unknown) {
    console.error("Match result error:", error);
    const message = error instanceof Error ? error.message : "Error submitting match results";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
