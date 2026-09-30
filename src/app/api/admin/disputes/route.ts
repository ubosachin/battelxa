import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { Dispute, AuditLog } from "@/lib/db/models";

export async function GET() {
  try {
    await requireAuth("ADMIN");
    await connectToDatabase();

    const disputes = await Dispute.find()
      .populate("reporterId", "username email")
      .populate("tournamentId", "title")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ disputes });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching disputes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
