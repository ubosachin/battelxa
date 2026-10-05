import { describe, it, expect } from "vitest";
import { buildDiscordEmbed } from "@/lib/notifications/discord-service";
import { generateTournamentEmailHtml } from "@/lib/notifications/email-service";

describe("Tournament Discord & Email Broadcast Service", () => {
  it("should generate a rich Discord Embed with match credentials and dark theme color", () => {
    const embed = buildDiscordEmbed({
      tournamentTitle: "BGMI Weekend Pro Series - Final Stage",
      tournamentId: "bgmi-123",
      gameName: "BGMI",
      format: "SQUAD",
      type: "CREDENTIALS",
      title: "Custom Room ID & Password Released",
      message: "Slots are locked. Please join room within 10 minutes.",
      credentials: {
        roomId: "9918234",
        password: "bgmi@pro@pass",
        notes: "Strict 10 min grace period",
      },
    });

    expect(embed.title).toContain("Custom Room ID & Password Released");
    expect(embed.title).toContain("BGMI Weekend Pro Series - Final Stage");
    expect(embed.color).toBe(1095937); // Emerald green for credentials
    expect(embed.footer?.text).toContain("BATTLEXA");

    // Verify fields
    const fields = embed.fields || [];
    const roomField = fields.find((f) => f.name.includes("Room ID"));
    const passField = fields.find((f) => f.name.includes("Password"));
    const notesField = fields.find((f) => f.name.includes("Instructions"));

    expect(roomField).toBeDefined();
    expect(roomField?.value).toContain("9918234");

    expect(passField).toBeDefined();
    expect(passField?.value).toContain("bgmi@pro@pass");

    expect(notesField).toBeDefined();
    expect(notesField?.value).toContain("Strict 10 min grace period");
  });

  it("should generate custom announcement Discord Embed with appropriate styling", () => {
    const embed = buildDiscordEmbed({
      tournamentTitle: "Free Fire Max Clash Squad War",
      tournamentId: "ff-456",
      gameName: "FREE_FIRE",
      format: "CLASH_SQUAD",
      type: "ANNOUNCEMENT",
      title: "Schedule Postponed by 15 Minutes",
      message: "Server maintenance delayed room creation by 15 mins.",
    });

    expect(embed.title).toContain("Schedule Postponed by 15 Minutes");
    expect(embed.color).toBe(16096779); // Amber for announcement
    expect(embed.description).toContain("Server maintenance delayed room creation by 15 mins.");
  });

  it("should generate rich dark gaming HTML Email with Room ID, Password and CTA link", () => {
    const html = generateTournamentEmailHtml({
      username: "ShadowStriker",
      slotNumber: 7,
      tournamentTitle: "Valorant Radiant Invitational",
      tournamentId: "val-789",
      gameName: "VALORANT",
      format: "5v5",
      title: "Your Room Credentials Are Live!",
      message: "Map: Ascent. Strict 10 min join window.",
      credentials: {
        roomId: "VAL-849102",
        password: "secret_spike_pass",
        notes: "Strict 10 min grace period",
      },
    });

    expect(html).toContain("ShadowStriker");
    expect(html).toContain("Valorant Radiant Invitational");
    expect(html).toContain("VAL-849102");
    expect(html).toContain("secret_spike_pass");
    expect(html).toContain("Slot #7");
    expect(html).toContain("/tournaments/val-789/room");
    expect(html).toContain("Enter Tournament Arena Room");
    expect(html).toContain("#0d111c"); // Dark gaming aesthetic
  });

  it("should process and dispatch match notification to user ubosachin@gmail.com", async () => {
    const { sendTournamentNotificationEmail } = await import("@/lib/notifications/email-service");

    const result = await sendTournamentNotificationEmail({
      tournamentTitle: "BGMI Masters Series - Grand Finals 2026",
      tournamentId: "bgmi-masters-2026",
      gameName: "BGMI",
      format: "SQUAD",
      type: "CREDENTIALS",
      title: "Custom Room ID & Password Released",
      message: "Room has been formed. Please enter promptly in your allocated slot. Emulators strictly banned.",
      credentials: {
        roomId: "8472910",
        password: "sachin@battlexa",
        notes: "Strict 10 min grace period. Non-registered teams will be removed from slot.",
      },
      recipients: [
        {
          email: "ubosachin@gmail.com",
          username: "Sachin",
          slotNumber: 4,
        },
      ],
    });

    expect(result.sent).toBe(1);
    expect(result.failed).toBe(0);
    expect(result.logs.some((l) => l.includes("ubosachin@gmail.com"))).toBe(true);
  });
});
