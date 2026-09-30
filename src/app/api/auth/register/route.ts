import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { User, PlayerProfile, OrganizerProfile, Wallet } from "@/lib/db/models";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { RegisterSchema } from "@/lib/validations/auth";
import { createNotification } from "@/lib/notifications/notification-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = RegisterSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const {
      username,
      email,
      password,
      role,
      gamerTag,
      freeFireId,
      bgmiId,
      organizationName,
    } = validated.data;

    await connectToDatabase();

    // Check if user already exists
    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existing) {
      if (existing.email === email.toLowerCase()) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 409 }
      );
    }

    // Hash password securely with bcryptjs
    const passwordHash = await hashPassword(password);

    // Create User
    const isPlayer = role === "PLAYER";
    const newUser = await User.create({
      username,
      email: email.toLowerCase(),
      passwordHash,
      role,
      isVerified: false,
      isOnboarded: isPlayer ? false : true,
      status: "ACTIVE",
    });

    // Create Initial Wallet for User
    await Wallet.create({
      userId: newUser._id,
      balance: 50, // Welcome bonus ₹50 credit for demo/play testing
      lockedBalance: 0,
      currency: "INR",
      totalDeposited: 50,
    });

    // Create Player Profile
    await PlayerProfile.create({
      userId: newUser._id,
      gamerTag: gamerTag || username,
      freeFireId: freeFireId || "",
      bgmiId: bgmiId || "",
      isOnboarded: false,
    });

    // If registered as organizer, create Organizer Profile pending verification
    if (role === "ORGANIZER") {
      await OrganizerProfile.create({
        userId: newUser._id,
        organizationName: organizationName || `${username} Esports`,
        description: "New organizer on BATTLEXA awaiting verification.",
        status: "PENDING",
        verifiedByAdmin: false,
      });
    }

    // Set HttpOnly session cookie
    await setSessionCookie({
      id: newUser._id.toString(),
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
      isVerifiedOrganizer: false,
      isOnboarded: isPlayer ? false : true,
    });

    // Send welcome notification
    await createNotification({
      userId: newUser._id,
      title: "Welcome to BATTLEXA!",
      message:
        "Your gladiator account has been created. A ₹50 welcome bonus has been credited to your arena wallet!",
      type: "SYSTEM",
      link: isPlayer ? "/player/onboarding" : "/organizer/dashboard",
    });

    return NextResponse.json(
      {
        message: "Registration successful",
        redirectUrl: isPlayer ? "/player/onboarding" : "/organizer/dashboard",
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          isOnboarded: isPlayer ? false : true,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: "Registration failed", details: message },
      { status: 500 }
    );
  }
}
