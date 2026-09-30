import { describe, it, expect } from "vitest";
import { hasRole, ROLES } from "../src/lib/auth/roles";

describe("Role-Based Access Control (RBAC)", () => {
  it("grants admin full permissions across all roles", () => {
    expect(hasRole(ROLES.ADMIN, ROLES.PLAYER)).toBe(true);
    expect(hasRole(ROLES.ADMIN, ROLES.ORGANIZER)).toBe(true);
    expect(hasRole(ROLES.ADMIN, ROLES.ADMIN)).toBe(true);
  });

  it("grants organizer permissions for organizer and player roles", () => {
    expect(hasRole(ROLES.ORGANIZER, ROLES.PLAYER)).toBe(true);
    expect(hasRole(ROLES.ORGANIZER, ROLES.ORGANIZER)).toBe(true);
    expect(hasRole(ROLES.ORGANIZER, ROLES.ADMIN)).toBe(false);
  });

  it("restricts player role strictly to player operations", () => {
    expect(hasRole(ROLES.PLAYER, ROLES.PLAYER)).toBe(true);
    expect(hasRole(ROLES.PLAYER, ROLES.ORGANIZER)).toBe(false);
    expect(hasRole(ROLES.PLAYER, ROLES.ADMIN)).toBe(false);
  });
});
