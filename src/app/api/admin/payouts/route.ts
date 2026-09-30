import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { PayoutRequest } from "@/lib/db/models/PayoutRequest";

export async function GET() {
  try {
    await requireAuth("ADMIN");
    await connectToDatabase();

    const payouts = await PayoutRequest.find()
      .populate("userId", "username email")
      .sort({ requestedAt: -1 })
      .lean();

    return NextResponse.json({ payouts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching payouts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
