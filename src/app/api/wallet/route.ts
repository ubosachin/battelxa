import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { getOrCreateWallet } from "@/lib/payments/wallet-service";
import { WalletTransaction } from "@/lib/db/models/WalletTransaction";
import { PayoutRequest } from "@/lib/db/models/PayoutRequest";

export async function GET() {
  try {
    const session = await requireAuth();
    await connectToDatabase();

    const wallet = await getOrCreateWallet(session.id);
    const transactions = await WalletTransaction.find({ userId: session.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const payoutRequests = await PayoutRequest.find({ userId: session.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      wallet: {
        balance: wallet.balance,
        lockedBalance: wallet.lockedBalance,
        currency: wallet.currency,
        totalDeposited: wallet.totalDeposited,
        totalWon: wallet.totalWon,
        totalWithdrawn: wallet.totalWithdrawn,
      },
      transactions,
      payoutRequests,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching wallet";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
