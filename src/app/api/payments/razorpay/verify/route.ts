import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { Payment } from "@/lib/db/models/Payment";
import { verifyPaymentSignature } from "@/lib/payments/razorpay";
import { creditWallet } from "@/lib/payments/wallet-service";
import { VerifyPaymentSchema } from "@/lib/validations/payment";
import { createNotification } from "@/lib/notifications/notification-service";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const validated = VerifyPaymentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      type,
      tournamentId,
    } = validated.data;

    await connectToDatabase();

    // 1. Find existing pending payment
    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      return NextResponse.json(
        { error: "Payment record for order not found." },
        { status: 404 }
      );
    }

    // Idempotency: if already marked SUCCESS, return immediately
    if (payment.status === "SUCCESS") {
      return NextResponse.json({
        message: "Payment already verified successfully",
        paymentId: payment._id,
      });
    }

    // 2. Cryptographic HMAC-SHA256 signature verification
    const isValidSignature = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValidSignature) {
      payment.status = "FAILED";
      payment.failureReason = "Signature mismatch";
      await payment.save();

      return NextResponse.json(
        { error: "Cryptographic signature verification failed." },
        { status: 400 }
      );
    }

    // 3. Update payment status to SUCCESS
    payment.status = "SUCCESS";
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    await payment.save();

    // 4. If wallet topup, credit user's wallet ledger
    if (payment.type === "WALLET_TOPUP") {
      await creditWallet({
        userId: session.id,
        amount: payment.amount,
        type: "DEPOSIT",
        referenceId: razorpayPaymentId,
        description: `Wallet recharge of ₹${payment.amount} via Razorpay`,
      });

      await createNotification({
        userId: session.id,
        title: "Wallet Recharged 💰",
        message: `₹${payment.amount} has been successfully added to your BATTLEXA balance.`,
        type: "PAYMENT",
        link: "/player/wallet",
      });
    }

    return NextResponse.json({
      message: "Payment verified successfully",
      status: "SUCCESS",
      amount: payment.amount,
      paymentId: payment._id,
    });
  } catch (error: unknown) {
    console.error("Payment verification error:", error);
    const message = error instanceof Error ? error.message : "Error verifying payment";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
