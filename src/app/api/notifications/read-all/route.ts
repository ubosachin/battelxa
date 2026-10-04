import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { Notification } from "@/lib/db/models/Notification";

export async function POST() {
  try {
    const session = await requireAuth();
    await connectToDatabase();

    await Notification.updateMany(
      { userId: session.id, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating notifications";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
