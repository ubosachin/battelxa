import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const rawAppUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const appUrl = rawAppUrl.replace(/\/+$/, "");

  const redirectUri = `${appUrl}/api/auth/discord/callback`;

  if (!clientId) {
    return NextResponse.redirect(
      new URL("/login?error=discord_not_configured", req.url)
    );
  }

  const discordAuthUrl = new URL("https://discord.com/api/oauth2/authorize");
  discordAuthUrl.searchParams.set("client_id", clientId);
  discordAuthUrl.searchParams.set("redirect_uri", redirectUri);
  discordAuthUrl.searchParams.set("response_type", "code");
  discordAuthUrl.searchParams.set("scope", "identify email");
  discordAuthUrl.searchParams.set("prompt", "consent");

  return NextResponse.redirect(discordAuthUrl.toString());
}
