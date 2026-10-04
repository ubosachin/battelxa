import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { Payment } from "@/lib/db/models/Payment";
import { Tournament } from "@/lib/db/models/Tournament";
import { createRazorpayOrder } from "@/lib/payments/razorpay";
import { CreateOrderSchema } from "@/lib/validations/payment";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const validated = CreateOrderSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { amount, type, tournamentId } = validated.data;
    await connectToDatabase();

    let calculatedAmount = amount;
    // If tournament entry, ensure price is derived on the server, not trusted from client
    if (type === "TOURNAMENT_ENTRY") {
      if (!tournamentId) {
        return NextResponse.json(
          { error: "Tournament ID required for tournament entry payment" },
          { status: 400 }
        );
      }
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
      }
      calculatedAmount = tournament.entryFee;
    }

    const receipt = `rcpt_${Date.now()}_${session.id.substring(0, 6)}`;
    const razorpayOrder = await createRazorpayOrder({
      amount: calculatedAmount,
      receipt,
      notes: {
        userId: session.id,
        userEmail: session.email,
        type,
        tournamentId: tournamentId || "",
      },
    });

    // Record pending payment in database
    await Payment.create({
      userId: session.id,
      tournamentId: tournamentId || undefined,
      razorpayOrderId: razorpayOrder.id,
      amount: calculatedAmount,
      currency: "INR",
      type,
      status: "PENDING",
    });

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: calculatedAmount,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_BATTLEXA_DEV_KEY",
    });
  } catch (error: unknown) {
    console.error("Razorpay order creation error:", error);
    const message = error instanceof Error ? error.message : "Error creating payment order";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
