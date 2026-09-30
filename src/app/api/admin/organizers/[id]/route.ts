import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { OrganizerProfile, AuditLog, User } from "@/lib/db/models";
import { createNotification } from "@/lib/notifications/notification-service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAuth("ADMIN");

    const { status, rejectionReason } = await req.json();

    if (!["APPROVED", "REJECTED", "SUSPENDED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    await connectToDatabase();
    const organizer = await OrganizerProfile.findById(id);

    if (!organizer) {
      return NextResponse.json({ error: "Organizer not found" }, { status: 404 });
    }

    organizer.status = status;
    organizer.verifiedByAdmin = status === "APPROVED";
    if (rejectionReason) organizer.rejectionReason = rejectionReason;
    await organizer.save();

    // Create Audit Log record
    await AuditLog.create({
      actorId: session.id,
      actorEmail: session.email,
      actorRole: "ADMIN",
      action: `ORGANIZER_${status}`,
      entityType: "OrganizerProfile",
      entityId: id,
      details: { status, rejectionReason },
    });

    // Notify Organizer
    await createNotification({
      userId: organizer.userId,
      title:
        status === "APPROVED"
          ? "Organizer Application Approved! 🎉"
          : `Organizer Application ${status}`,
      message:
        status === "APPROVED"
          ? "Congratulations! Your host account has been verified. You can now publish tournaments on BATTLEXA."
          : `Your organizer status has been set to ${status}. Reason: ${
              rejectionReason || "Compliance check update"
            }`,
      type: "SYSTEM",
      link: "/organizer/dashboard",
    });

    return NextResponse.json({
      message: `Organizer status updated to ${status}`,
      organizer,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating organizer";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
