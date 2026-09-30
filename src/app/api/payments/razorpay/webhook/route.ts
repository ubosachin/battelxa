import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Payment } from "@/lib/db/models/Payment";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { creditWallet } from "@/lib/payments/wallet-service";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    await connectToDatabase();

    if (event.event === "payment.captured") {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      const payment = await Payment.findOne({ razorpayOrderId: orderId });
      if (payment && payment.status !== "SUCCESS") {
        payment.status = "SUCCESS";
        payment.razorpayPaymentId = paymentId;
        await payment.save();

        if (payment.type === "WALLET_TOPUP") {
          await creditWallet({
            userId: payment.userId,
            amount: payment.amount,
            type: "DEPOSIT",
            referenceId: paymentId,
            description: `Webhook: Wallet credited ₹${payment.amount}`,
          });
        }
      }
    } else if (event.event === "payment.failed") {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      await Payment.findOneAndUpdate(
        { razorpayOrderId: orderId },
        { status: "FAILED", failureReason: paymentEntity.error_description }
      );
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
