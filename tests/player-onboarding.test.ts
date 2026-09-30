import { describe, it, expect } from "vitest";

describe("Player Onboarding Routing & Logic", () => {
  function getRedirectDestination(user: {
    role: "PLAYER" | "ORGANIZER" | "ADMIN";
    isOnboarded?: boolean;
    isNewUser?: boolean;
  }): string {
    if (user.role === "ADMIN") return "/admin/dashboard";
    if (user.role === "ORGANIZER") return "/organizer/dashboard";
    
    // Only new users or players with pending onboarding go to onboarding
    if (user.isNewUser || user.isOnboarded === false) {
      return "/player/onboarding";
    }
    
    // Existing users go directly to player dashboard
    return "/player/dashboard";
  }

  it("routes newly registered players to /player/onboarding", () => {
    const newPlayer = {
      role: "PLAYER" as const,
      isNewUser: true,
      isOnboarded: false,
    };
    expect(getRedirectDestination(newPlayer)).toBe("/player/onboarding");
  });

  it("routes existing players who completed onboarding to /player/dashboard", () => {
    const existingPlayer = {
      role: "PLAYER" as const,
      isNewUser: false,
      isOnboarded: true,
    };
    expect(getRedirectDestination(existingPlayer)).toBe("/player/dashboard");
  });

  it("does NOT force legacy existing users (isOnboarded undefined) to onboarding", () => {
    const legacyPlayer = {
      role: "PLAYER" as const,
      isNewUser: false,
      isOnboarded: undefined,
    };
    expect(getRedirectDestination(legacyPlayer)).toBe("/player/dashboard");
  });

  it("routes non-player roles directly to their respective portals", () => {
    expect(getRedirectDestination({ role: "ADMIN", isNewUser: true })).toBe("/admin/dashboard");
    expect(getRedirectDestination({ role: "ORGANIZER", isNewUser: true })).toBe("/organizer/dashboard");
  });
});
