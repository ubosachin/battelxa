import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { Dispute, AuditLog } from "@/lib/db/models";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAuth("ADMIN");
    const { status, resolutionNotes } = await req.json();

    await connectToDatabase();
    const dispute = await Dispute.findByIdAndUpdate(
      id,
      {
        status,
        resolutionNotes,
        resolvedBy: session.id,
      },
      { new: true }
    );

    await AuditLog.create({
      actorId: session.id,
      actorEmail: session.email,
      actorRole: "ADMIN",
      action: `DISPUTE_${status}`,
      entityType: "Dispute",
      entityId: id,
      details: { status, resolutionNotes },
    });

    return NextResponse.json({ message: "Dispute updated", dispute });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error resolving dispute";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
