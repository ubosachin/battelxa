import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import { User, Tournament, Wallet, Registration, PayoutRequest, Notification } from "../src/lib/db/models";

describe("Mongoose Data Models & Schema Constraints", () => {
  it("validates User schema required fields and role enum defaults", async () => {
    const validUser = new User({
      username: "AlphaWarrior",
      email: "alpha@battlexa.gg",
      passwordHash: "hashedPassword123",
      role: "PLAYER",
    });

    let error: mongoose.Error.ValidationError | undefined;
    try {
      await validUser.validate();
    } catch (err) {
      error = err as mongoose.Error.ValidationError;
    }

    expect(error).toBeUndefined();
    expect(validUser.role).toBe("PLAYER");
    expect(validUser.status).toBe("ACTIVE");
    expect(validUser.isVerified).toBe(false);
  });

  it("fails User schema validation when required fields are missing", async () => {
    const invalidUser = new User({
      // missing email & username
      passwordHash: "secret",
    });

    let error: mongoose.Error.ValidationError | undefined;
    try {
      await invalidUser.validate();
    } catch (err) {
      error = err as mongoose.Error.ValidationError;
    }

    expect(error).toBeDefined();
    expect(error?.errors.email).toBeDefined();
    expect(error?.errors.username).toBeDefined();
  });

  it("validates Tournament schema format and status transitions", async () => {
    const validTournament = new Tournament({
      title: "Clash of Champions 2026",
      slug: "clash-of-champions-2026",
      gameSlug: "bgmi",
      gameId: new mongoose.Types.ObjectId(),
      gameName: "Battlegrounds Mobile India",
      organizerId: new mongoose.Types.ObjectId(),
      format: "SQUAD",
      type: "PAID",
      entryFee: 100,
      prizePool: 2500,
      maxSlots: 25,
      startTime: new Date(Date.now() + 86400000),
      registrationDeadline: new Date(Date.now() + 43200000),
      rules: "Official BGIS rules",
      region: "India",
    });

    let error: mongoose.Error.ValidationError | undefined;
    try {
      await validTournament.validate();
    } catch (err) {
      error = err as mongoose.Error.ValidationError;
    }

    expect(error).toBeUndefined();
    expect(validTournament.status).toBe("DRAFT");
    expect(validTournament.registeredSlots).toBe(0);
  });

  it("validates Wallet schema balance defaults and currency constraints", async () => {
    const validWallet = new Wallet({
      userId: new mongoose.Types.ObjectId(),
    });

    let error: mongoose.Error.ValidationError | undefined;
    try {
      await validWallet.validate();
    } catch (err) {
      error = err as mongoose.Error.ValidationError;
    }

    expect(error).toBeUndefined();
    expect(validWallet.balance).toBe(0);
    expect(validWallet.lockedBalance).toBe(0);
    expect(validWallet.currency).toBe("INR");
  });

  it("validates Registration schema structure and slot assignment", async () => {
    const validReg = new Registration({
      tournamentId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      registrationType: "SQUAD",
      teamName: "Team Soul",
      teamTag: "SOUL",
      slotNumber: 12,
      members: [
        {
          userId: new mongoose.Types.ObjectId(),
          gamerTag: "Mortal",
          inGameId: "1234567890",
        },
      ],
      amountPaid: 100,
      paymentMethod: "WALLET",
      status: "CONFIRMED",
    });

    let error: mongoose.Error.ValidationError | undefined;
    try {
      await validReg.validate();
    } catch (err) {
      error = err as mongoose.Error.ValidationError;
    }

    expect(error).toBeUndefined();
    expect(validReg.slotNumber).toBe(12);
    expect(validReg.status).toBe("CONFIRMED");
    expect(validReg.registrationType).toBe("SQUAD");
  });

  it("validates PayoutRequest schema payout methods and status defaults", async () => {
    const payout = new PayoutRequest({
      userId: new mongoose.Types.ObjectId(),
      role: "PLAYER",
      amount: 1500,
      payoutMethod: "UPI",
      upiId: "player@okhdfcbank",
    });

    let error: mongoose.Error.ValidationError | undefined;
    try {
      await payout.validate();
    } catch (err) {
      error = err as mongoose.Error.ValidationError;
    }

    expect(error).toBeUndefined();
    expect(payout.status).toBe("PENDING");
    expect(payout.role).toBe("PLAYER");
  });

  it("validates Notification schema types and read defaults", async () => {
    const notif = new Notification({
      userId: new mongoose.Types.ObjectId(),
      type: "ROOM_CREDENTIALS",
      title: "Match Room Released",
      message: "Room 101 ID & Pass are live.",
    });

    let error: mongoose.Error.ValidationError | undefined;
    try {
      await notif.validate();
    } catch (err) {
      error = err as mongoose.Error.ValidationError;
    }

    expect(error).toBeUndefined();
    expect(notif.isRead).toBe(false);
  });
});
