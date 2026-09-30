import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { User, OrganizerProfile, PlayerProfile } from "@/lib/db/models";
import { comparePassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { LoginSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = LoginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid credentials format" },
        { status: 400 }
      );
    }

    const { email, password } = validated.data;
    const rawRedirect = body.redirect;
    const returnTo =
      rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
        ? rawRedirect
        : null;

    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.status === "BANNED" || user.status === "SUSPENDED") {
      return NextResponse.json(
        { error: `Account is ${user.status.toLowerCase()}. Contact support.` },
        { status: 403 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "This account is linked with Google. Please use Continue with Google." },
        { status: 400 }
      );
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    let isVerifiedOrganizer = false;
    if (user.role === "ORGANIZER") {
      const org = await OrganizerProfile.findOne({ userId: user._id });
      isVerifiedOrganizer = org?.verifiedByAdmin || false;
    }

    let hasCompleteDetails = user.isOnboarded === true;
    if (user.role === "PLAYER") {
      const profile = await PlayerProfile.findOne({ userId: user._id });
      hasCompleteDetails =
        user.isOnboarded === true &&
        Boolean(profile && (profile.isOnboarded === true || profile.freeFireId || profile.bgmiId));
    }

    const isOnboarded = user.isOnboarded !== false;

    await setSessionCookie({
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      isVerifiedOrganizer,
      avatar: user.avatar,
      isOnboarded,
    });

    let redirectUrl = returnTo || "/player/dashboard";
    if (user.role === "ADMIN") {
      redirectUrl = returnTo || "/admin/dashboard";
    } else if (user.role === "ORGANIZER") {
      redirectUrl = returnTo || "/organizer/dashboard";
    } else if (user.role === "PLAYER" && !hasCompleteDetails) {
      redirectUrl = returnTo
        ? `/player/onboarding?redirect=${encodeURIComponent(returnTo)}`
        : "/player/onboarding";
    }

    return NextResponse.json({
      message: "Login successful",
      redirectUrl,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerifiedOrganizer,
        isOnboarded,
      },
    });
  } catch (error: unknown) {
    console.error("Login error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: "Authentication failed", details: message },
      { status: 500 }
    );
  }
}
