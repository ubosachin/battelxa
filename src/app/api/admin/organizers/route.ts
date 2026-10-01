import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { OrganizerProfile, User } from "@/lib/db/models";

export async function GET(req: NextRequest) {
  try {
    await requireAuth("ADMIN");
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";

    const filter: Record<string, unknown> = {};

    if (status && status !== "ALL") {
      filter.status = status.toUpperCase();
    }

    if (search.trim()) {
      const q = search.trim();
      const regex = new RegExp(q, "i");

      // Search matching users first
      const matchingUsers = await User.find({
        $or: [{ username: regex }, { email: regex }],
      }).select("_id").lean();

      const matchingUserIds = matchingUsers.map((u) => u._id);

      filter.$or = [
        { organizationName: regex },
        { phone: regex },
        { upiId: regex },
        { website: regex },
        { userId: { $in: matchingUserIds } },
      ];
    }

    const organizers = await OrganizerProfile.find(filter)
      .populate("userId", "username email role avatar createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const stats = {
      total: await OrganizerProfile.countDocuments(),
      pending: await OrganizerProfile.countDocuments({ status: "PENDING" }),
      approved: await OrganizerProfile.countDocuments({ status: "APPROVED" }),
      rejected: await OrganizerProfile.countDocuments({ status: "REJECTED" }),
    };

    return NextResponse.json({
      organizers,
      stats,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching organizers";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
