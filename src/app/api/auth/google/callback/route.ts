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

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error || "access_denied")}`, req.url)
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/login?error=google_not_configured", req.url)
    );
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Google token exchange error:", tokenData);
      return NextResponse.redirect(
        new URL("/login?error=token_exchange_failed", req.url)
      );
    }

    // 2. Fetch user profile from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleProfile = await userRes.json();
    if (!userRes.ok || !googleProfile.email) {
      console.error("Google userinfo fetch error:", googleProfile);
      return NextResponse.redirect(
        new URL("/login?error=userinfo_failed", req.url)
      );
    }

    const { email, name, picture, id: googleId } = googleProfile;

    await connectToDatabase();

    // 3. Find or Create User
    let user = await User.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }],
    });

    if (user) {
      // Update Google info if not present
      let updated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (!user.avatar && picture) {
        user.avatar = picture;
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
      // Create new user from Google profile
      let baseUsername = (name || email.split("@")[0])
        .replace(/[^a-zA-Z0-9_]/g, "")
        .slice(0, 20);

      if (baseUsername.length < 3) {
        baseUsername = `player_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      // Ensure unique username
      let username = baseUsername;
      const existingName = await User.findOne({ username });
      if (existingName) {
        username = `${baseUsername.slice(0, 15)}_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      user = await User.create({
        email: email.toLowerCase(),
        googleId,
        passwordHash: "GOOGLE_OAUTH_ACCOUNT",
        username,
        avatar: picture || "",
        role: "PLAYER",
        isVerified: true,
        status: "ACTIVE",
      });

      // Initialize player wallet with zero balance
      await Wallet.create({
        userId: user._id,
        balance: 0,
        lockedBalance: 0,
        currency: "INR",
      });

      // Initialize player profile
      await PlayerProfile.create({
        userId: user._id,
        gamerTag: username,
        avatar: picture || "",
        matchesPlayed: 0,
        matchesWon: 0,
        totalKills: 0,
        earnings: 0,
        rankTitle: "Bronze Contender",
      });
    }

    // Check account status
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
    });

    // 5. Redirect to role-appropriate dashboard
    let destination = "/player/dashboard";
    if (user.role === "ADMIN") {
      destination = "/admin/dashboard";
    } else if (user.role === "ORGANIZER") {
      destination = "/organizer/dashboard";
    }

    return NextResponse.redirect(new URL(destination, req.url));
  } catch (err: unknown) {
    console.error("Google callback error:", err);
    return NextResponse.redirect(
      new URL("/login?error=auth_internal_error", req.url)
    );
  }
}
