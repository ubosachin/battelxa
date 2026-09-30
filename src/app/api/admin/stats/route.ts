import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import {
  User,
  Tournament,
  Payment,
  PayoutRequest,
  Dispute,
  OrganizerProfile,
} from "@/lib/db/models";

export async function GET() {
  try {
    await requireAuth("ADMIN");
    await connectToDatabase();

    const [
      totalUsers,
      totalTournaments,
      activeTournaments,
      pendingOrganizers,
      pendingPayouts,
      pendingDisputes,
      completedPayments,
    ] = await Promise.all([
      User.countDocuments(),
      Tournament.countDocuments(),
      Tournament.countDocuments({ status: { $in: ["REGISTRATION_OPEN", "LIVE"] } }),
      OrganizerProfile.countDocuments({ status: "PENDING" }),
      PayoutRequest.countDocuments({ status: "PENDING" }),
      Dispute.countDocuments({ status: "PENDING" }),
      Payment.find({ status: "SUCCESS" }).select("amount"),
    ]);

    const totalVolume = completedPayments.reduce(
      (acc, curr) => acc + (curr.amount || 0),
      0
    );

    return NextResponse.json({
      stats: {
        totalUsers,
        totalTournaments,
        activeTournaments,
        pendingOrganizers,
        pendingPayouts,
        pendingDisputes,
        totalVolume,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching admin statistics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
