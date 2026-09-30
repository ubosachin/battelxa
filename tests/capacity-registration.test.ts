import { describe, it, expect } from "vitest";
import {
  CreateTournamentSchema,
  RegisterTournamentSchema,
} from "../src/lib/validations/tournament";

describe("Tournament Capacity & Registration Validations", () => {
  it("validates valid tournament parameters", () => {
    const valid = CreateTournamentSchema.safeParse({
      title: "BGMI Pro Scrims Season 1",
      gameSlug: "bgmi",
      format: "SQUAD",
      type: "PAID",
      entryFee: 100,
      prizePool: 2000,
      maxSlots: 25,
      startTime: new Date(Date.now() + 86400000).toISOString(),
      registrationDeadline: new Date(Date.now() + 43200000).toISOString(),
      rules: "BGIS ruleset. Standard mobile competition.",
      region: "India (South Asia)",
    });

    expect(valid.success).toBe(true);
  });

  it("rejects negative entry fee or zero slots", () => {
    const invalid = CreateTournamentSchema.safeParse({
      title: "Invalid Cup",
      gameSlug: "bgmi",
      format: "SQUAD",
      type: "PAID",
      entryFee: -50,
      prizePool: 1000,
      maxSlots: 1, // min is 2
      startTime: new Date().toISOString(),
      registrationDeadline: new Date().toISOString(),
      rules: "Some rules",
      region: "India",
    });

    expect(invalid.success).toBe(false);
  });

  it("requires valid members for tournament registration", () => {
    const validRegistration = RegisterTournamentSchema.safeParse({
      tournamentId: "t_12345",
      registrationType: "SOLO",
      members: [
        {
          userId: "u_1",
          gamerTag: "VORTEX_WARRIOR",
          inGameId: "1928475920",
        },
      ],
      useWallet: true,
    });

    expect(validRegistration.success).toBe(true);
  });

  it("rejects registration without members", () => {
    const emptyRegistration = RegisterTournamentSchema.safeParse({
      tournamentId: "t_12345",
      registrationType: "SOLO",
      members: [],
      useWallet: true,
    });

    expect(emptyRegistration.success).toBe(false);
  });
});
