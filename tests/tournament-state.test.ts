import { describe, it, expect } from "vitest";
import {
  isValidTournamentTransition,
  canAccessRoomCredentials,
} from "../src/lib/tournament/state-machine";

describe("Tournament State Machine", () => {
  it("allows valid forward transitions", () => {
    expect(isValidTournamentTransition("DRAFT", "PUBLISHED")).toBe(true);
    expect(isValidTournamentTransition("PUBLISHED", "REGISTRATION_OPEN")).toBe(true);
    expect(isValidTournamentTransition("REGISTRATION_OPEN", "REGISTRATION_CLOSED")).toBe(true);
    expect(isValidTournamentTransition("REGISTRATION_CLOSED", "CHECK_IN")).toBe(true);
    expect(isValidTournamentTransition("CHECK_IN", "LIVE")).toBe(true);
    expect(isValidTournamentTransition("LIVE", "COMPLETED")).toBe(true);
  });

  it("allows cancellation from non-terminal states", () => {
    expect(isValidTournamentTransition("DRAFT", "CANCELLED")).toBe(true);
    expect(isValidTournamentTransition("REGISTRATION_OPEN", "CANCELLED")).toBe(true);
    expect(isValidTournamentTransition("CHECK_IN", "CANCELLED")).toBe(true);
    expect(isValidTournamentTransition("LIVE", "CANCELLED")).toBe(true);
  });

  it("prevents invalid transitions and transitions from terminal states", () => {
    expect(isValidTournamentTransition("COMPLETED", "LIVE")).toBe(false);
    expect(isValidTournamentTransition("CANCELLED", "PUBLISHED")).toBe(false);
    expect(isValidTournamentTransition("DRAFT", "LIVE")).toBe(false);
    expect(isValidTournamentTransition("REGISTRATION_OPEN", "COMPLETED")).toBe(false);
  });

  it("protects room credentials before release time", () => {
    const futureReleaseTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes in future
    const result = canAccessRoomCredentials(futureReleaseTime, true, "REGISTRATION_OPEN");
    expect(result.canAccess).toBe(false);
    expect(result.reason).toContain("before match start");
  });

  it("denies room credentials to unregistered players even if release time passed", () => {
    const pastReleaseTime = new Date(Date.now() - 5 * 60 * 1000);
    const result = canAccessRoomCredentials(pastReleaseTime, false, "CHECK_IN");
    expect(result.canAccess).toBe(false);
    expect(result.reason).toContain("must be registered");
  });

  it("grants room credentials to registered players once release time has arrived", () => {
    const pastReleaseTime = new Date(Date.now() - 5 * 60 * 1000);
    const result = canAccessRoomCredentials(pastReleaseTime, true, "CHECK_IN");
    expect(result.canAccess).toBe(true);
  });
});
