import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { Wallet } from "@/lib/db/models/Wallet";
import { PlayerProfile } from "@/lib/db/models/PlayerProfile";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, picture, googleId, credential } = body;

    let userEmail = email?.toLowerCase();
    let userName = name;
    let userPicture = picture;
    let userGoogleId = googleId;

    // If client sent Google ID token credential
    if (credential) {
      try {
        const verifyRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
        );
        if (verifyRes.ok) {
          const payload = await verifyRes.json();
          userEmail = payload.email?.toLowerCase();
          userName = payload.name;
          userPicture = payload.picture;
          userGoogleId = payload.sub;
        }
      } catch (err) {
        console.error("Tokeninfo verification error:", err);
      }
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: "Valid Google email is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let user = await User.findOne({
      $or: [
        ...(userGoogleId ? [{ googleId: userGoogleId }] : []),
        { email: userEmail },
      ],
    });

    let isNewUser = false;

    if (user) {
      let updated = false;
      if (!user.googleId && userGoogleId) {
        user.googleId = userGoogleId;
        updated = true;
      }
      if (!user.avatar && userPicture) {
        user.avatar = userPicture;
        updated = true;
      }
      if (!user.isVerified) {
        user.isVerified = true;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      isNewUser = true;
      let baseUsername = (userName || userEmail.split("@")[0])
        .replace(/[^a-zA-Z0-9_]/g, "")
        .slice(0, 20);

      if (baseUsername.length < 3) {
        baseUsername = `player_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      let username = baseUsername;
      const existingName = await User.findOne({ username });
      if (existingName) {
        username = `${baseUsername.slice(0, 15)}_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      user = await User.create({
        email: userEmail,
        googleId: userGoogleId || `google_${Date.now()}`,
        passwordHash: "GOOGLE_OAUTH_ACCOUNT",
        username,
        avatar: userPicture || "",
        role: "PLAYER",
        isVerified: true,
        isOnboarded: false,
        status: "ACTIVE",
      });

      await Wallet.create({
        userId: user._id,
        balance: 50,
        lockedBalance: 0,
        currency: "INR",
        totalDeposited: 50,
      });

      await PlayerProfile.create({
        userId: user._id,
        gamerTag: username,
        avatar: userPicture || "",
        isOnboarded: false,
        matchesPlayed: 0,
        matchesWon: 0,
        totalKills: 0,
        earnings: 0,
        rankTitle: "Bronze Contender",
      });
    }

    if (user.status === "BANNED" || user.status === "SUSPENDED") {
      return NextResponse.json(
        { error: "Account has been suspended or banned." },
        { status: 403 }
      );
    }

    await setSessionCookie({
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
      isOnboarded: isNewUser ? false : user.isOnboarded !== false,
    });

    let redirectUrl = "/player/dashboard";
    if (user.role === "ADMIN") {
      redirectUrl = "/admin/dashboard";
    } else if (user.role === "ORGANIZER") {
      redirectUrl = "/organizer/dashboard";
    } else if (isNewUser || user.isOnboarded === false) {
      redirectUrl = "/player/onboarding";
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        isOnboarded: isNewUser ? false : user.isOnboarded !== false,
      },
      redirectUrl,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to verify Google sign-in";
    console.error("Google verify error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
