import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword } from "../src/lib/auth/password";
import { signToken, verifyToken } from "../src/lib/auth/jwt";
import { ROLES } from "../src/lib/auth/roles";

describe("Cryptographic Authentication & Password Security", () => {
  it("hashes password with bcrypt using 12 salt rounds", async () => {
    const rawPass = "GamerChampion2026!";
    const hash = await hashPassword(rawPass);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(rawPass);
    // Bcrypt hashes start with $2a$ or $2b$
    expect(hash.startsWith("$2a$") || hash.startsWith("$2b$")).toBe(true);
  });

  it("produces unique salt for identical passwords", async () => {
    const pass = "SuperSecurePass123";
    const hash1 = await hashPassword(pass);
    const hash2 = await hashPassword(pass);

    expect(hash1).not.toBe(hash2);
    expect(await comparePassword(pass, hash1)).toBe(true);
    expect(await comparePassword(pass, hash2)).toBe(true);
  });

  it("verifies matching passwords and rejects incorrect passwords", async () => {
    const correct = "V0rt3x#Secret";
    const wrong = "V0rt3x#Wrong";
    const hash = await hashPassword(correct);

    const matchesCorrect = await comparePassword(correct, hash);
    const matchesWrong = await comparePassword(wrong, hash);

    expect(matchesCorrect).toBe(true);
    expect(matchesWrong).toBe(false);
  });

  it("signs and verifies JWT tokens with full user claims", async () => {
    const mockUser = {
      id: "u_987654321",
      email: "pro_sniper@battlexa.gg",
      username: "ShadowSniper",
      role: ROLES.PLAYER,
      isVerifiedOrganizer: false,
      avatar: "https://avatar.url/sniper.png",
      isOnboarded: true,
    };

    const token = await signToken(mockUser);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3); // Header.Payload.Signature

    const verified = await verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(mockUser.id);
    expect(verified?.email).toBe(mockUser.email);
    expect(verified?.username).toBe(mockUser.username);
    expect(verified?.role).toBe(ROLES.PLAYER);
    expect(verified?.isOnboarded).toBe(true);
    expect(verified?.avatar).toBe(mockUser.avatar);
  });

  it("safely rejects forged, corrupt, or invalid JWT tokens", async () => {
    expect(await verifyToken("")).toBeNull();
    expect(await verifyToken("invalid.token.string")).toBeNull();
    expect(await verifyToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.tampered")).toBeNull();
  });
});
