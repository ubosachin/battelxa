import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import {
  User,
  Wallet,
  WalletTransaction,
  PlayerProfile,
  OrganizerProfile,
  Registration,
  Tournament,
  AuditLog,
} from "@/lib/db/models";
import { requireAuth } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth("ADMIN");
    const { id } = await params;

    await connectToDatabase();

    const user = await User.findById(id).select("-passwordHash").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const wallet = await Wallet.findOne({ userId: id }).lean();
    const profile = await PlayerProfile.findOne({ userId: id }).lean();
    const organizerProfile = await OrganizerProfile.findOne({ userId: id }).lean();
    const tournamentsJoined = await Registration.countDocuments({
      userId: id,
      status: { $ne: "CANCELLED" },
    });
    const tournamentsHosted = await Tournament.countDocuments({ organizerId: id });

    return NextResponse.json({
      user,
      wallet: wallet || { balance: 0, lockedBalance: 0, totalWon: 0 },
      profile: profile || null,
      organizerProfile: organizerProfile || null,
      stats: {
        tournamentsJoined,
        tournamentsHosted,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching user";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth("ADMIN");
    const { id } = await params;

    await connectToDatabase();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      username,
      email,
      role,
      status,
      isVerified,
      isOnboarded,
      newPassword,
      // Gaming Profile
      gamerTag,
      freeFireId,
      bgmiId,
      // Organizer Profile
      organizationName,
      organizerVerified,
      // Wallet Adjustment
      walletAdjustment, // { type: "ADD" | "DEDUCT" | "SET", amount: number, reason: string }
    } = body;

    const changesLogged: Record<string, unknown> = {};

    // 1. Update Core User Details
    if (username && username.trim() !== user.username) {
      const existingName = await User.findOne({
        username: username.trim(),
        _id: { $ne: id },
      });
      if (existingName) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
      }
      changesLogged.oldUsername = user.username;
      user.username = username.trim();
      changesLogged.newUsername = user.username;
    }

    if (email && email.trim().toLowerCase() !== user.email) {
      const existingEmail = await User.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: id },
      });
      if (existingEmail) {
        return NextResponse.json({ error: "Email is already taken" }, { status: 409 });
      }
      changesLogged.oldEmail = user.email;
      user.email = email.trim().toLowerCase();
      changesLogged.newEmail = user.email;
    }

    if (role && ["PLAYER", "ORGANIZER", "ADMIN"].includes(role.toUpperCase())) {
      const newRole = role.toUpperCase();
      if (user.role !== newRole) {
        changesLogged.oldRole = user.role;
        user.role = newRole;
        changesLogged.newRole = newRole;

        // If promoted to ORGANIZER, ensure an OrganizerProfile exists
        if (newRole === "ORGANIZER") {
          const org = await OrganizerProfile.findOne({ userId: id });
          if (!org) {
            await OrganizerProfile.create({
              userId: id,
              organizationName: organizationName || `${user.username} Esports`,
              description: "Organizer profile created via Admin Authority",
              status: "APPROVED",
              verifiedByAdmin: true,
            });
          }
        }
      }
    }

    if (status && ["ACTIVE", "SUSPENDED", "BANNED"].includes(status.toUpperCase())) {
      if (user.status !== status.toUpperCase()) {
        changesLogged.oldStatus = user.status;
        user.status = status.toUpperCase();
        changesLogged.newStatus = user.status;
      }
    }

    if (isVerified !== undefined) {
      user.isVerified = Boolean(isVerified);
    }

    if (isOnboarded !== undefined) {
      user.isOnboarded = Boolean(isOnboarded);
    }

    // 2. Password Reset
    if (newPassword && newPassword.trim().length >= 6) {
      user.passwordHash = await hashPassword(newPassword.trim());
      changesLogged.passwordReset = true;
    }

    await user.save();

    // 3. Update PlayerProfile
    let playerProfile = await PlayerProfile.findOne({ userId: id });
    if (!playerProfile) {
      playerProfile = new PlayerProfile({ userId: id });
    }

    if (gamerTag !== undefined) playerProfile.gamerTag = gamerTag.trim();
    if (freeFireId !== undefined) playerProfile.freeFireId = freeFireId.trim();
    if (bgmiId !== undefined) playerProfile.bgmiId = bgmiId.trim();
    await playerProfile.save();

    // 4. Update Organizer Profile if relevant
    if (organizationName !== undefined || organizerVerified !== undefined) {
      let orgProfile = await OrganizerProfile.findOne({ userId: id });
      if (!orgProfile && (organizationName || user.role === "ORGANIZER")) {
        orgProfile = new OrganizerProfile({ userId: id });
      }

      if (orgProfile) {
        if (organizationName !== undefined) orgProfile.organizationName = organizationName.trim();
        if (organizerVerified !== undefined) {
          orgProfile.verifiedByAdmin = Boolean(organizerVerified);
          orgProfile.status = organizerVerified ? "APPROVED" : "PENDING";
        }
        await orgProfile.save();
      }
    }

    // 5. Wallet Adjustment by Administrator
    if (walletAdjustment && typeof walletAdjustment.amount === "number") {
      let wallet = await Wallet.findOne({ userId: id });
      if (!wallet) {
        wallet = await Wallet.create({
          userId: id,
          balance: 0,
          lockedBalance: 0,
          currency: "INR",
        });
      }

      const adjAmount = Math.abs(walletAdjustment.amount);
      const prevBal = wallet.balance;
      let newBal = prevBal;
      let txType: "DEPOSIT" | "REFUND" = "DEPOSIT";

      if (walletAdjustment.type === "ADD") {
        newBal = prevBal + adjAmount;
        wallet.balance = newBal;
        wallet.totalDeposited = (wallet.totalDeposited || 0) + adjAmount;
        txType = "DEPOSIT";
      } else if (walletAdjustment.type === "DEDUCT") {
        newBal = Math.max(0, prevBal - adjAmount);
        wallet.balance = newBal;
        txType = "REFUND";
      } else if (walletAdjustment.type === "SET") {
        newBal = Math.max(0, walletAdjustment.amount);
        wallet.balance = newBal;
        txType = "DEPOSIT";
      }

      await wallet.save();

      // Record transaction
      await WalletTransaction.create({
        walletId: wallet._id,
        userId: id,
        type: txType,
        amount: Math.abs(newBal - prevBal),
        balanceBefore: prevBal,
        balanceAfter: newBal,
        description: `Admin Adjustment (${walletAdjustment.type}): ${walletAdjustment.reason || "Administrative correction"}`,
        status: "COMPLETED",
      });

      changesLogged.walletAdjustment = {
        action: walletAdjustment.type,
        amount: walletAdjustment.amount,
        balanceBefore: prevBal,
        balanceAfter: newBal,
        reason: walletAdjustment.reason,
      };
    }

    // 6. Record Audit Log
    await AuditLog.create({
      actorId: new mongoose.Types.ObjectId(session.id),
      actorEmail: session.email,
      actorRole: "ADMIN",
      action: "ADMIN_UPDATE_USER",
      entityType: "User",
      entityId: user._id.toString(),
      details: {
        targetUsername: user.username,
        changes: changesLogged,
      },
    });

    return NextResponse.json({
      message: "User updated successfully by administrator",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating user";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth("ADMIN");
    const { id } = await params;

    await connectToDatabase();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting self
    if (session.id === id) {
      return NextResponse.json(
        { error: "Administrators cannot ban or delete their own active account." },
        { status: 400 }
      );
    }

    // Set user to BANNED (Soft delete with anti-cheat lock)
    user.status = "BANNED";
    await user.save();

    await AuditLog.create({
      actorId: new mongoose.Types.ObjectId(session.id),
      actorEmail: session.email,
      actorRole: "ADMIN",
      action: "ADMIN_BAN_USER",
      entityType: "User",
      entityId: user._id.toString(),
      details: {
        targetUsername: user.username,
        targetEmail: user.email,
      },
    });

    return NextResponse.json({
      message: `User ${user.username} has been banned and locked by administrator.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error banning user";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
