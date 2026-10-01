import { NextResponse } from "next/server";
import { getSession, setSessionCookie } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { Wallet, PlayerProfile, OrganizerProfile } from "@/lib/db/models";
import { UserRole } from "@/lib/auth/roles";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    await connectToDatabase();
    const { User } = await import("@/lib/db/models/User");
    const userDoc = await User.findById(session.id).select("isOnboarded avatar role username email");
    
    if (!userDoc) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Read live role from MongoDB (handle case-insensitivity e.g. "admin" -> "ADMIN")
    const rawRole = (userDoc.role || session.role || "PLAYER").toString().toUpperCase();
    const currentRole: UserRole = (rawRole === "ADMIN" || rawRole === "ORGANIZER") ? rawRole : "PLAYER";
    const isOnboarded = userDoc.isOnboarded !== false;

    // If role, username, or avatar changed in MongoDB, refresh the JWT cookie automatically!
    if (session.role !== currentRole || session.username !== userDoc.username) {
      await setSessionCookie({
        ...session,
        role: currentRole,
        username: userDoc.username,
        email: userDoc.email,
        avatar: userDoc.avatar || session.avatar,
        isOnboarded,
      });
    }

    const wallet = await Wallet.findOne({ userId: session.id });
    const profile = await PlayerProfile.findOne({ userId: session.id });
    const organizer = await OrganizerProfile.findOne({ userId: session.id });

    return NextResponse.json({
      user: {
        ...session,
        role: currentRole,
        username: userDoc.username,
        email: userDoc.email,
        avatar: userDoc.avatar || session.avatar,
        isOnboarded,
        isVerifiedOrganizer: organizer ? (organizer.verifiedByAdmin && organizer.status === "APPROVED") : false,
      },
      wallet: wallet
        ? {
            balance: wallet.balance,
            lockedBalance: wallet.lockedBalance,
            totalWon: wallet.totalWon,
          }
        : null,
      profile: profile || null,
      organizerProfile: organizer
        ? {
            _id: organizer._id,
            organizationName: organizer.organizationName,
            description: organizer.description,
            phone: organizer.phone,
            website: organizer.website,
            upiId: organizer.upiId,
            status: organizer.status,
            verifiedByAdmin: organizer.verifiedByAdmin,
            rejectionReason: organizer.rejectionReason,
            tournamentsHosted: organizer.tournamentsHosted,
            createdAt: organizer.createdAt,
          }
        : null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error retrieving session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
