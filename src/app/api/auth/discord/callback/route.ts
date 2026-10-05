import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { Wallet } from "@/lib/db/models/Wallet";
import { PlayerProfile } from "@/lib/db/models/PlayerProfile";
import { setSessionCookie } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  const rawAppUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const appUrl = rawAppUrl.replace(/\/+$/, "");

  const rawState = req.nextUrl.searchParams.get("state");
  const returnTo =
    rawState && rawState.startsWith("/") && !rawState.startsWith("//")
      ? rawState
      : null;

  if (error || !code) {
    const errorUrl = new URL(
      `/login?error=${encodeURIComponent(error || "access_denied")}`,
      req.url
    );
    if (returnTo) errorUrl.searchParams.set("redirect", returnTo);
    return NextResponse.redirect(errorUrl);
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/discord/callback`;

  if (!clientId || !clientSecret) {
    const errorUrl = new URL("/login?error=discord_not_configured", req.url);
    if (returnTo) errorUrl.searchParams.set("redirect", returnTo);
    return NextResponse.redirect(errorUrl);
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Discord token exchange error:", tokenData);
      return NextResponse.redirect(
        new URL("/login?error=token_exchange_failed", req.url)
      );
    }

    // 2. Fetch user profile from Discord API
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const discordUser = await userRes.json();
    if (!userRes.ok || !discordUser.id) {
      console.error("Discord userinfo fetch error:", discordUser);
      return NextResponse.redirect(
        new URL("/login?error=userinfo_failed", req.url)
      );
    }

    const { id: discordId, username: rawUsername, global_name, avatar, discriminator } = discordUser;
    const email = discordUser.email || `${discordId}@discord.battlexa.gg`;

    const avatarUrl = avatar
      ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${(parseInt(discriminator || "0", 10) % 5)}.png`;

    // 2b. Automatically join user to BATTLEXA Discord Server if Guild ID and Bot Token are set
    const guildId = process.env.DISCORD_GUILD_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (guildId && botToken && tokenData.access_token && discordId) {
      try {
        await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bot ${botToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_token: tokenData.access_token,
          }),
        });
      } catch (guildJoinErr) {
        console.warn("Discord auto guild-join notice:", guildJoinErr);
      }
    }

    await connectToDatabase();

    // 3. Find or Create User
    let user = await User.findOne({
      $or: [{ discordId }, { email: email.toLowerCase() }],
    });

    let isNewUser = false;

    if (user) {
      let updated = false;
      if (!user.discordId) {
        user.discordId = discordId;
        updated = true;
      }
      if (!user.avatar && avatarUrl) {
        user.avatar = avatarUrl;
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
      let baseUsername = (global_name || rawUsername || email.split("@")[0])
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
        email: email.toLowerCase(),
        discordId,
        passwordHash: "DISCORD_OAUTH_ACCOUNT",
        username,
        avatar: avatarUrl,
        role: "PLAYER",
        isVerified: true,
        isOnboarded: false,
        status: "ACTIVE",
      });

      // Initialize player wallet with ₹50 starter balance
      await Wallet.create({
        userId: user._id,
        balance: 50,
        lockedBalance: 0,
        currency: "INR",
        totalDeposited: 50,
      });

      // Initialize player profile
      await PlayerProfile.create({
        userId: user._id,
        gamerTag: username,
        avatar: avatarUrl,
        isOnboarded: false,
        matchesPlayed: 0,
        matchesWon: 0,
        totalKills: 0,
        earnings: 0,
        rankTitle: "Bronze Contender",
      });
    }

    if (user.status === "BANNED" || user.status === "SUSPENDED") {
      return NextResponse.redirect(
        new URL("/login?error=account_suspended", req.url)
      );
    }

    // 4. Set Session Cookie
    await setSessionCookie({
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
      isOnboarded: isNewUser ? false : user.isOnboarded !== false,
    });

    // 5. Check if user is old user with complete details vs new/incomplete user
    const profile = await PlayerProfile.findOne({ userId: user._id });
    const hasCompleteDetails =
      !isNewUser &&
      user.isOnboarded === true &&
      profile &&
      (profile.isOnboarded === true || Boolean(profile.freeFireId || profile.bgmiId));

    let destination = returnTo || "/player/dashboard";
    if (user.role === "ADMIN") {
      destination = returnTo || "/admin/dashboard";
    } else if (user.role === "ORGANIZER") {
      destination = returnTo || "/organizer/dashboard";
    } else if (isNewUser || !hasCompleteDetails) {
      destination = returnTo
        ? `/player/onboarding?redirect=${encodeURIComponent(returnTo)}`
        : "/player/onboarding";
    }

    return NextResponse.redirect(new URL(destination, req.url));
  } catch (err: unknown) {
    console.error("Discord callback error:", err);
    return NextResponse.redirect(
      new URL("/login?error=auth_internal_error", req.url)
    );
  }
}
