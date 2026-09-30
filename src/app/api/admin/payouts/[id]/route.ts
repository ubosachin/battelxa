import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { PayoutRequest, AuditLog } from "@/lib/db/models";
import { finalizeWithdrawal } from "@/lib/payments/wallet-service";
import { createNotification } from "@/lib/notifications/notification-service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAuth("ADMIN");

    const { status, transactionReference, adminNotes } = await req.json();

    if (!["PROCESSED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be either PROCESSED or REJECTED" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const payout = await PayoutRequest.findById(id);

    if (!payout) {
      return NextResponse.json({ error: "Payout request not found" }, { status: 404 });
    }

    if (payout.status === "PROCESSED" || payout.status === "REJECTED") {
      return NextResponse.json(
        { error: `Payout has already been ${payout.status}` },
        { status: 400 }
      );
    }

    const isApproved = status === "PROCESSED";

    // Finalize wallet balance change
    await finalizeWithdrawal({
      userId: payout.userId,
      amount: payout.amount,
      approved: isApproved,
      referenceId: transactionReference || payout._id.toString(),
    });

    payout.status = status;
    payout.transactionReference = transactionReference || "";
    payout.adminNotes = adminNotes || "";
    payout.processedBy = session.id as any;
    payout.processedAt = new Date();
    await payout.save();

    // Create Audit Log
    await AuditLog.create({
      actorId: session.id,
      actorEmail: session.email,
      actorRole: "ADMIN",
      action: `PAYOUT_${status}`,
      entityType: "PayoutRequest",
      entityId: id,
      details: {
        amount: payout.amount,
        payoutMethod: payout.payoutMethod,
        transactionReference,
        adminNotes,
      },
    });

    // Notify recipient
    await createNotification({
      userId: payout.userId,
      title: isApproved ? "Payout Processed! 💸" : "Payout Request Rejected",
      message: isApproved
        ? `Your withdrawal of ₹${payout.amount} via ${payout.payoutMethod} has been transferred. Ref: ${
            transactionReference || "Direct UPI/Bank"
          }.`
        : `Your withdrawal of ₹${payout.amount} was rejected. Note: ${
            adminNotes || "Details mismatch"
          }. Funds have been restored to your wallet.`,
      type: "PAYMENT",
      link: "/player/wallet",
    });

    return NextResponse.json({
      message: `Payout request marked as ${status}`,
      payout,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error processing payout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
