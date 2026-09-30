import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { Wallet } from "@/lib/db/models/Wallet";
import { PlayerProfile } from "@/lib/db/models/PlayerProfile";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, username: inputUsername, discordId, avatar } = body;

    let userEmail = email?.toLowerCase();
    const discordUsername = inputUsername;
    const userDiscordId = discordId || `discord_${Date.now()}`;
    const userAvatar = avatar || "";

    if (!userEmail && !discordUsername) {
      return NextResponse.json(
        { error: "Valid Discord email or username is required" },
        { status: 400 }
      );
    }

    if (!userEmail) {
      userEmail = `${(discordUsername || "player").replace(/[^a-zA-Z0-9]/g, "")}@discord.battlexa.gg`;
    }

    await connectToDatabase();

    let user = await User.findOne({
      $or: [
        { discordId: userDiscordId },
        { email: userEmail },
      ],
    });

    let isNewUser = false;

    if (user) {
      let updated = false;
      if (!user.discordId) {
        user.discordId = userDiscordId;
        updated = true;
      }
      if (!user.avatar && userAvatar) {
        user.avatar = userAvatar;
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
      let baseUsername = (discordUsername || userEmail.split("@")[0])
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
        discordId: userDiscordId,
        passwordHash: "DISCORD_OAUTH_ACCOUNT",
        username,
        avatar: userAvatar,
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
        avatar: userAvatar,
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
        { error: "Your account has been suspended or restricted." },
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
      isNewUser,
      redirectUrl,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Discord authentication error";
    console.error("Discord verify error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
