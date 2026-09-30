import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { Wallet, PlayerProfile } from "@/lib/db/models";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    await connectToDatabase();
    const { User } = await import("@/lib/db/models/User");
    const userDoc = await User.findById(session.id).select("isOnboarded avatar role username email");
    const isOnboarded = userDoc?.isOnboarded !== false;

    const wallet = await Wallet.findOne({ userId: session.id });
    const profile = await PlayerProfile.findOne({ userId: session.id });

    return NextResponse.json({
      user: {
        ...session,
        avatar: userDoc?.avatar || session.avatar,
        isOnboarded,
      },
      wallet: wallet
        ? {
            balance: wallet.balance,
            lockedBalance: wallet.lockedBalance,
            totalWon: wallet.totalWon,
          }
        : null,
      profile: profile || null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error retrieving session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
