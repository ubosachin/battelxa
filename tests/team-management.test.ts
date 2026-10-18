import { describe, it, expect } from "vitest";
import {
  CreateTeamSchema,
  JoinTeamSchema,
  UpdateTeamSchema,
  UpdateMemberRoleSchema,
  TEAM_EMBLEMS,
} from "../src/lib/validations/team";

describe("Esports Squad & Clan Management System Validations", () => {
  it("validates valid team creation for Free Fire MAX", () => {
    const valid = CreateTeamSchema.safeParse({
      name: "Vortex Gladiators",
      tag: "VTX",
      game: "FREE_FIRE_MAX",
      bio: "Aggressive rusher clan aiming for Tier-1 Free Fire national scrims.",
      logo: "dragon",
      isOpenRecruiting: true,
    });

    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.tag).toBe("VTX");
      expect(valid.data.game).toBe("FREE_FIRE_MAX");
      expect(valid.data.logo).toBe("dragon");
    }
  });

  it("validates valid team creation for BGMI", () => {
    const valid = CreateTeamSchema.safeParse({
      name: "SouL Reapers",
      tag: "SOUL",
      game: "BGMI",
      bio: "BGIS grinders. Daily practice matches.",
      logo: "wolf",
      isOpenRecruiting: false,
    });

    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.tag).toBe("SOUL");
      expect(valid.data.game).toBe("BGMI");
      expect(valid.data.isOpenRecruiting).toBe(false);
    }
  });

  it("rejects invalid clan tags (too short, too long, special characters)", () => {
    // Too short (1 char)
    const tooShort = CreateTeamSchema.safeParse({
      name: "Alpha Squad",
      tag: "A",
      game: "BGMI",
    });
    expect(tooShort.success).toBe(false);

    // Too long (7 chars)
    const tooLong = CreateTeamSchema.safeParse({
      name: "Alpha Squad",
      tag: "ALPHASQ",
      game: "BGMI",
    });
    expect(tooLong.success).toBe(false);

    // Special characters
    const specialChars = CreateTeamSchema.safeParse({
      name: "Alpha Squad",
      tag: "A#1",
      game: "BGMI",
    });
    expect(specialChars.success).toBe(false);
  });

  it("rejects invalid squad names (less than 3 chars or over 30 chars)", () => {
    const tooShort = CreateTeamSchema.safeParse({
      name: "X",
      tag: "VTX",
      game: "FREE_FIRE_MAX",
    });
    expect(tooShort.success).toBe(false);

    const tooLong = CreateTeamSchema.safeParse({
      name: "This Is An Extremely Long Esports Squad Name Exceeding Thirty Characters",
      tag: "VTX",
      game: "FREE_FIRE_MAX",
    });
    expect(tooLong.success).toBe(false);
  });

  it("validates 6-character uppercase alphanumeric join codes", () => {
    const valid = JoinTeamSchema.safeParse({
      joinCode: "7X9K2P",
    });
    expect(valid.success).toBe(true);

    // Invalid length (5 chars)
    const shortCode = JoinTeamSchema.safeParse({
      joinCode: "7X9K2",
    });
    expect(shortCode.success).toBe(false);

    // Invalid length (7 chars)
    const longCode = JoinTeamSchema.safeParse({
      joinCode: "7X9K2P0",
    });
    expect(longCode.success).toBe(false);

    // Invalid characters (symbols)
    const symbolCode = JoinTeamSchema.safeParse({
      joinCode: "7X-K2P",
    });
    expect(symbolCode.success).toBe(false);
  });

  it("validates all supported squad crest emblems", () => {
    for (const emblem of TEAM_EMBLEMS) {
      const result = CreateTeamSchema.safeParse({
        name: "Phoenix Rising",
        tag: "PHX",
        game: "BGMI",
        logo: emblem,
      });
      expect(result.success).toBe(true);
    }
  });

  it("validates member role transitions", () => {
    const coLeader = UpdateMemberRoleSchema.safeParse({ role: "CO_LEADER" });
    const member = UpdateMemberRoleSchema.safeParse({ role: "MEMBER" });
    const leader = UpdateMemberRoleSchema.safeParse({ role: "LEADER" });
    const invalid = UpdateMemberRoleSchema.safeParse({ role: "ADMIN_OFFICER" });

    expect(coLeader.success).toBe(true);
    expect(member.success).toBe(true);
    expect(leader.success).toBe(true);
    expect(invalid.success).toBe(false);
  });

  it("validates partial team settings updates", () => {
    const updateBio = UpdateTeamSchema.safeParse({
      bio: "New tournament roster for Pro League Season 4",
      isOpenRecruiting: false,
    });
    expect(updateBio.success).toBe(true);

    const updateLogo = UpdateTeamSchema.safeParse({
      logo: "skull",
    });
    expect(updateLogo.success).toBe(true);
  });
});
