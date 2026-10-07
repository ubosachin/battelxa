import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { OrganizerProfile } from "@/lib/db/models";

export async function GET() {
  try {
    const session = await requireAuth();
    await connectToDatabase();
    const profile = await OrganizerProfile.findOne({ userId: session.id }).lean();
    return NextResponse.json({ profile });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching profile";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    await connectToDatabase();

    const existing = await OrganizerProfile.findOne({ userId: session.id });
    if (!existing) {
      return NextResponse.json({ error: "Organizer profile not found." }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (typeof body.logo === "string") updateData.logo = body.logo;
    if (typeof body.banner === "string") updateData.banner = body.banner;
    if (typeof body.description === "string") updateData.description = body.description.trim();
    if (typeof body.website === "string") updateData.website = body.website.trim();
    if (typeof body.phone === "string") updateData.phone = body.phone.trim();
    if (typeof body.upiId === "string") updateData.upiId = body.upiId.trim();

    // If changing organizationName, ensure uniqueness
    if (typeof body.organizationName === "string" && body.organizationName.trim()) {
      const newName = body.organizationName.trim();
      if (newName.toLowerCase() !== existing.organizationName.toLowerCase()) {
        const conflict = await OrganizerProfile.findOne({
          organizationName: { $regex: new RegExp(`^${newName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
          _id: { $ne: existing._id },
        });
        if (conflict) {
          return NextResponse.json({ error: "Organization name is already taken." }, { status: 409 });
        }
        updateData.organizationName = newName;
      }
    }

    const updated = await OrganizerProfile.findByIdAndUpdate(
      existing._id,
      updateData,
      { new: true }
    );

    return NextResponse.json({
      message: "Organization profile updated successfully",
      profile: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating organization profile";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
