import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { lockBalanceForWithdrawal } from "@/lib/payments/wallet-service";
import { PayoutRequest } from "@/lib/db/models/PayoutRequest";
import { PayoutRequestSchema } from "@/lib/validations/payment";
import { createNotification } from "@/lib/notifications/notification-service";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const validated = PayoutRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { amount, payoutMethod, upiId, accountNumber, ifscCode, accountHolderName } =
      validated.data;

    await connectToDatabase();

    // Lock balance atomically
    const lockResult = await lockBalanceForWithdrawal({
      userId: session.id,
      amount,
    });

    if (!lockResult.success) {
      return NextResponse.json(
        { error: lockResult.error || "Unable to process withdrawal request" },
        { status: 400 }
      );
    }

    // Create payout request document
    const payoutDoc = await PayoutRequest.create({
      userId: session.id,
      role: session.role === "ORGANIZER" ? "ORGANIZER" : "PLAYER",
      amount,
      payoutMethod,
      payoutDetails: {
        upiId,
        accountNumber,
        ifscCode,
        accountHolderName,
      },
      status: "PENDING",
      requestedAt: new Date(),
    });

    await createNotification({
      userId: session.id,
      title: "Withdrawal Request Received",
      message: `Your withdrawal request for ₹${amount} via ${payoutMethod} has been submitted for admin compliance verification.`,
      type: "PAYMENT",
      link: "/player/wallet",
    });

    return NextResponse.json(
      {
        message: "Withdrawal request submitted successfully",
        payoutRequest: payoutDoc,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Withdrawal error:", error);
    const message = error instanceof Error ? error.message : "Error processing withdrawal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
