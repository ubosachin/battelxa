import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { User, Wallet, PlayerProfile, OrganizerProfile, AuditLog } from "@/lib/db/models";
import { requireAuth } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth("ADMIN");

    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)));
    const skip = (page - 1) * limit;

    // Build filter query
    const filter: Record<string, unknown> = {};

    if (role && role !== "ALL") {
      filter.role = role.toUpperCase();
    }

    if (status && status !== "ALL") {
      filter.status = status.toUpperCase();
    }

    if (search.trim()) {
      const q = search.trim();
      const regex = new RegExp(q, "i");

      // Also search in PlayerProfile gamerTag
      const matchingProfiles = await PlayerProfile.find({
        $or: [{ gamerTag: regex }, { freeFireId: regex }, { bgmiId: regex }],
      }).select("userId").lean();

      const profileUserIds = matchingProfiles.map((p) => p.userId);

      filter.$or = [
        { username: regex },
        { email: regex },
        { _id: { $in: profileUserIds } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("username email role status isVerified isOnboarded createdAt updatedAt avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Fetch associated wallets and player profiles
    const userIds = users.map((u) => u._id);
    const wallets = await Wallet.find({ userId: { $in: userIds } }).lean();
    const profiles = await PlayerProfile.find({ userId: { $in: userIds } }).lean();
    const organizerProfiles = await OrganizerProfile.find({ userId: { $in: userIds } }).lean();

    const walletMap = new Map(wallets.map((w) => [w.userId.toString(), w]));
    const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));
    const organizerMap = new Map(organizerProfiles.map((o) => [o.userId.toString(), o]));

    const enrichedUsers = users.map((u) => {
      const uId = u._id.toString();
      const wallet = walletMap.get(uId);
      const profile = profileMap.get(uId);
      const orgProfile = organizerMap.get(uId);

      return {
        ...u,
        wallet: wallet
          ? {
              balance: wallet.balance,
              lockedBalance: wallet.lockedBalance,
              totalWon: wallet.totalWon,
            }
          : { balance: 0, lockedBalance: 0, totalWon: 0 },
        profile: profile
          ? {
              gamerTag: profile.gamerTag,
              freeFireId: profile.freeFireId,
              bgmiId: profile.bgmiId,
            }
          : null,
        organizerProfile: orgProfile
          ? {
              organizationName: orgProfile.organizationName,
              status: orgProfile.status,
              verifiedByAdmin: orgProfile.verifiedByAdmin,
            }
          : null,
      };
    });

    // Overview Stats
    const stats = {
      totalUsers: await User.countDocuments(),
      totalPlayers: await User.countDocuments({ role: "PLAYER" }),
      totalOrganizers: await User.countDocuments({ role: "ORGANIZER" }),
      totalAdmins: await User.countDocuments({ role: "ADMIN" }),
      totalBanned: await User.countDocuments({ status: "BANNED" }),
    };

    return NextResponse.json({
      users: enrichedUsers,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching users";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth("ADMIN");
    await connectToDatabase();

    const body = await req.json();
    const {
      username,
      email,
      password,
      role = "PLAYER",
      status = "ACTIVE",
      gamerTag,
      freeFireId,
      bgmiId,
      initialBalance = 0,
      organizationName,
    } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    // Check existing
    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email or username already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const normalizedRole = ["PLAYER", "ORGANIZER", "ADMIN"].includes(role.toUpperCase())
      ? role.toUpperCase()
      : "PLAYER";

    const newUser = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: normalizedRole,
      status: status || "ACTIVE",
      isVerified: true,
      isOnboarded: true,
    });

    // Create Wallet
    const startBalance = Number(initialBalance) || 0;
    await Wallet.create({
      userId: newUser._id,
      balance: startBalance,
      lockedBalance: 0,
      totalDeposited: startBalance,
      currency: "INR",
    });

    // Create PlayerProfile
    await PlayerProfile.create({
      userId: newUser._id,
      gamerTag: gamerTag || username,
      freeFireId: freeFireId || "",
      bgmiId: bgmiId || "",
      isOnboarded: true,
    });

    // If Organizer, create Organizer Profile
    if (normalizedRole === "ORGANIZER") {
      await OrganizerProfile.create({
        userId: newUser._id,
        organizationName: organizationName || `${username} Esports`,
        description: "Organizer provisioned by BATTLEXA Admin.",
        status: "APPROVED",
        verifiedByAdmin: true,
      });
    }

    // Log in AuditLog
    await AuditLog.create({
      actorId: new mongoose.Types.ObjectId(session.id),
      actorEmail: session.email,
      actorRole: "ADMIN",
      action: "ADMIN_CREATE_USER",
      entityType: "User",
      entityId: newUser._id.toString(),
      details: {
        createdUsername: newUser.username,
        role: newUser.role,
        initialBalance: startBalance,
      },
    });

    return NextResponse.json({
      message: "User created successfully by administrator",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error creating user";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
