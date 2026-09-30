import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "battlexa_session";
const JWT_SECRET = process.env.JWT_SECRET || "battlexa_super_secret_jwt_encryption_key_change_in_production_32chars!";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes strictly
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, encodedKey);
      if (payload.role !== "ADMIN") {
        // Logged in, but not an admin -> redirect to player dashboard
        const dashboardUrl = new URL("/player/dashboard", request.url);
        dashboardUrl.searchParams.set("error", "unauthorized_admin");
        return NextResponse.redirect(dashboardUrl);
      }
    } catch {
      // Invalid/expired token -> clear and redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnTo", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
