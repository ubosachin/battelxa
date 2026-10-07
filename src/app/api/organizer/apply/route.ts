import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { OrganizerProfile, AuditLog } from "@/lib/db/models";
import { createNotification } from "@/lib/notifications/notification-service";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await requireAuth();
    await connectToDatabase();

    const profile = await OrganizerProfile.findOne({ userId: session.id }).lean();

    return NextResponse.json({ profile });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching application";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    const organizationName = (body.organizationName || "").trim();
    const description = (body.description || "").trim();
    const phone = (body.phone || "").trim();
    const website = (body.website || "").trim();
    const upiId = (body.upiId || "").trim();
    const logo = (body.logo || "").trim();
    const banner = (body.banner || "").trim();

    if (!organizationName) {
      return NextResponse.json(
        { error: "Organization name is required." },
        { status: 400 }
      );
    }

    if (organizationName.length < 3 || organizationName.length > 50) {
      return NextResponse.json(
        { error: "Organization name must be between 3 and 50 characters." },
        { status: 400 }
      );
    }

    if (!description || description.length < 10) {
      return NextResponse.json(
        { error: "Please provide a description of at least 10 characters detailing your clan or hosting experience." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if another organization already uses this name
    const existingOrgWithSameName = await OrganizerProfile.findOne({
      organizationName: { $regex: new RegExp(`^${organizationName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      userId: { $ne: new mongoose.Types.ObjectId(session.id) },
    });

    if (existingOrgWithSameName) {
      return NextResponse.json(
        { error: "An organization with this exact name is already registered on BATTLEXA. Please choose a unique clan name." },
        { status: 409 }
      );
    }

    // Upsert the application in PENDING status
    const profile = await OrganizerProfile.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(session.id) },
      {
        organizationName,
        description,
        phone,
        website,
        upiId,
        ...(logo ? { logo } : {}),
        ...(banner ? { banner } : {}),
        status: "PENDING",
        verifiedByAdmin: false,
        rejectionReason: "", // Clear any previous rejection reason
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Record submission in AuditLog for Admin Visibility
    await AuditLog.create({
      actorId: new mongoose.Types.ObjectId(session.id),
      actorEmail: session.email,
      actorRole: session.role,
      action: "ORGANIZER_APPLICATION_SUBMITTED",
      entityType: "OrganizerProfile",
      entityId: profile._id.toString(),
      details: {
        organizationName,
        phone,
        website,
        upiId,
      },
    });

    // Send user confirmation notification
    await createNotification({
      userId: new mongoose.Types.ObjectId(session.id),
      title: "Organization Application Submitted 🛡️",
      message: `Your application to register "${organizationName}" is now pending admin audit. You will be notified once reviewed.`,
      type: "SYSTEM",
      link: "/organizer/apply",
    });

    return NextResponse.json({
      message: "Organization application submitted for administrative audit.",
      profile,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error applying for organization";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
