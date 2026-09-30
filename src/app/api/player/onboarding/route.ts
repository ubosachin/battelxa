import { NextRequest, NextResponse } from "next/server";
import { requireAuth, setSessionCookie } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { User, PlayerProfile, Wallet } from "@/lib/db/models";
import { createNotification } from "@/lib/notifications/notification-service";

export async function GET() {
  try {
    const session = await requireAuth("PLAYER");
    await connectToDatabase();

    const user = await User.findById(session.id).select(
      "username email role avatar isOnboarded isVerified"
    );
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profile = await PlayerProfile.findOne({ userId: session.id });
    const wallet = await Wallet.findOne({ userId: session.id });

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        avatar: user.avatar || session.avatar || "",
        role: user.role,
        isOnboarded: user.isOnboarded !== false,
      },
      profile: profile || null,
      wallet: wallet
        ? {
            balance: wallet.balance,
            lockedBalance: wallet.lockedBalance,
          }
        : null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth("PLAYER");
    const body = await req.json();

    const {
      gamerTag,
      avatar,
      preferredGame,
      freeFireId,
      bgmiId,
      playstyle,
      deviceType,
      experienceLevel,
      stateOrCity,
      notifyWhatsapp,
      notifyDiscord,
      discordHandle,
      phone,
      bio,
      skip,
    } = body;

    await connectToDatabase();

    const user = await User.findById(session.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const resolvedGamerTag = gamerTag?.trim() || user.username;
    const resolvedAvatar = avatar || user.avatar || "";

    // Update Player Profile
    const updatedProfile = await PlayerProfile.findOneAndUpdate(
      { userId: session.id },
      {
        gamerTag: resolvedGamerTag,
        avatar: resolvedAvatar,
        isOnboarded: true,
        ...(preferredGame ? { preferredGame } : {}),
        ...(freeFireId !== undefined ? { freeFireId: freeFireId.trim() } : {}),
        ...(bgmiId !== undefined ? { bgmiId: bgmiId.trim() } : {}),
        ...(playstyle ? { playstyle } : {}),
        ...(deviceType ? { deviceType } : {}),
        ...(experienceLevel ? { experienceLevel } : {}),
        ...(stateOrCity !== undefined ? { stateOrCity: stateOrCity.trim() } : {}),
        ...(notifyWhatsapp !== undefined ? { notifyWhatsapp: Boolean(notifyWhatsapp) } : {}),
        ...(notifyDiscord !== undefined ? { notifyDiscord: Boolean(notifyDiscord) } : {}),
        ...(discordHandle !== undefined ? { discordHandle: discordHandle.trim() } : {}),
        ...(phone !== undefined ? { phone: phone.trim() } : {}),
        ...(bio !== undefined ? { bio: bio.trim() } : {}),
      },
      { new: true, upsert: true }
    );

    // Update User model
    user.isOnboarded = true;
    if (resolvedAvatar) {
      user.avatar = resolvedAvatar;
    }
    await user.save();

    // Update Session Cookie
    await setSessionCookie({
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
      isOnboarded: true,
    });

    // Notify user of completed combat clearance
    if (!skip) {
      await createNotification({
        userId: user._id,
        title: "Gladiator Combat Clearance Complete! 🎖️",
        message: `Welcome to the arena, ${resolvedGamerTag}! Your game credentials have been registered and your ₹50 starter wallet is active for tournaments.`,
        type: "SYSTEM",
        link: "/player/dashboard",
      });
    }

    const rawRedirect = body.redirect;
    const returnTo =
      rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
        ? rawRedirect
        : "/player/dashboard";

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
      redirectUrl: returnTo,
      profile: updatedProfile,
    });
  } catch (error: unknown) {
    console.error("Onboarding error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
