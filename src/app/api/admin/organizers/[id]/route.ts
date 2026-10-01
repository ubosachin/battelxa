import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { OrganizerProfile, AuditLog, User } from "@/lib/db/models";
import { createNotification } from "@/lib/notifications/notification-service";
import mongoose from "mongoose";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAuth("ADMIN");

    const { status, rejectionReason } = await req.json();

    if (!["APPROVED", "REJECTED", "SUSPENDED", "PENDING"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    await connectToDatabase();
    const organizer = await OrganizerProfile.findById(id);

    if (!organizer) {
      return NextResponse.json({ error: "Organizer application not found" }, { status: 404 });
    }

    organizer.status = status;

    if (status === "APPROVED") {
      organizer.verifiedByAdmin = true;
      organizer.rejectionReason = ""; // Clear any previous rejection notes

      // Upgrade user role to ORGANIZER so they become Organization Admin / Host
      await User.findByIdAndUpdate(organizer.userId, { role: "ORGANIZER" });
    } else if (status === "REJECTED") {
      organizer.verifiedByAdmin = false;
      organizer.rejectionReason = rejectionReason || "Application did not meet platform verification standards.";

      // Revert user role to PLAYER if they were in ORGANIZER role
      const applicantUser = await User.findById(organizer.userId);
      if (applicantUser && applicantUser.role === "ORGANIZER") {
        applicantUser.role = "PLAYER";
        await applicantUser.save();
      }
    } else if (status === "SUSPENDED") {
      organizer.verifiedByAdmin = false;

      // Temporarily demote role to PLAYER while suspended
      const applicantUser = await User.findById(organizer.userId);
      if (applicantUser && applicantUser.role === "ORGANIZER") {
        applicantUser.role = "PLAYER";
        await applicantUser.save();
      }
    } else if (status === "PENDING") {
      organizer.verifiedByAdmin = false;
    }

    await organizer.save();

    // Create Audit Log record
    await AuditLog.create({
      actorId: new mongoose.Types.ObjectId(session.id),
      actorEmail: session.email,
      actorRole: "ADMIN",
      action: `ORGANIZER_${status}`,
      entityType: "OrganizerProfile",
      entityId: id,
      details: {
        organizationName: organizer.organizationName,
        targetUserId: organizer.userId.toString(),
        status,
        rejectionReason: organizer.rejectionReason,
      },
    });

    // Notify Applicant User
    await createNotification({
      userId: organizer.userId,
      title:
        status === "APPROVED"
          ? "Organization Approved & Host Role Granted! 🏆"
          : status === "REJECTED"
          ? "Organization Application Rejected ⚠️"
          : `Organization Status Updated: ${status}`,
      message:
        status === "APPROVED"
          ? `Congratulations! "${organizer.organizationName}" has been verified. You are now an Organization Admin and can host Scrims & Tournaments on BATTLEXA.`
          : status === "REJECTED"
          ? `Your application for "${organizer.organizationName}" was rejected. Reason: ${
              organizer.rejectionReason
            }. You can review your details and reapply.`
          : `Your organization "${organizer.organizationName}" status has been set to ${status}.`,
      type: "SYSTEM",
      link: status === "APPROVED" ? "/organizer/dashboard" : "/organizer/apply",
    });

    return NextResponse.json({
      message: `Organization status successfully updated to ${status}.`,
      organizer,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating organizer";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
