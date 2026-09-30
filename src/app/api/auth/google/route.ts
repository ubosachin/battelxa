import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const rawAppUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const appUrl = rawAppUrl.replace(/\/+$/, "");

  const redirectUri = `${appUrl}/api/auth/google/callback`;

  const returnParam =
    req.nextUrl.searchParams.get("redirect") ||
    req.nextUrl.searchParams.get("returnTo") ||
    "";

  if (!clientId) {
    const errorUrl = new URL("/login?error=google_not_configured", req.url);
    if (returnParam) errorUrl.searchParams.set("redirect", returnParam);
    return NextResponse.redirect(errorUrl);
  }

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "select_account");
  if (returnParam) {
    googleAuthUrl.searchParams.set("state", returnParam);
  }

  return NextResponse.redirect(googleAuthUrl.toString());
}
