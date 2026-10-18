import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatDate, formatTimeAgo } from "../src/lib/utils";

describe("Utility Functions & Formatting", () => {
  describe("cn (tailwind merge & clsx)", () => {
    it("merges standard class names", () => {
      expect(cn("px-4", "py-2", "text-white")).toBe("px-4 py-2 text-white");
    });

    it("resolves Tailwind conflicts correctly using twMerge", () => {
      // px-4 should be overridden by px-8
      expect(cn("px-4 bg-red-500", "px-8 bg-blue-500")).toBe("px-8 bg-blue-500");
    });

    it("handles conditional classes and falsy values", () => {
      const isLive = false;
      const isWinner = true;
      expect(cn("badge", isLive && "bg-red-500", isWinner && "bg-yellow-400", null, undefined)).toBe("badge bg-yellow-400");
    });
  });

  describe("formatCurrency", () => {
    it("formats Indian Rupee (INR) amounts with symbol", () => {
      const formatted = formatCurrency(1500);
      expect(formatted).toContain("1,500");
      // Indian Rupee symbol: ₹
      expect(formatted).toMatch(/₹|INR/);
    });

    it("formats zero amount without decimals", () => {
      const formatted = formatCurrency(0);
      expect(formatted).toMatch(/0/);
    });

    it("formats high amounts with Indian numbering grouping (lakhs/thousands)", () => {
      const formatted = formatCurrency(100000);
      expect(formatted).toMatch(/1,00,000/);
    });
  });

  describe("formatDate", () => {
    it("formats a Date object or ISO string consistently", () => {
      const date = new Date("2026-08-15T18:30:00.000Z");
      const formatted = formatDate(date);
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe("string");
      expect(formatted).toContain("2026");
    });
  });

  describe("formatTimeAgo", () => {
    it("formats seconds ago for recent events (<60s)", () => {
      const recent = new Date(Date.now() - 25 * 1000);
      expect(formatTimeAgo(recent)).toMatch(/\d+s ago/);
    });

    it("formats minutes ago (1 to 59 minutes)", () => {
      const minAgo = new Date(Date.now() - 15 * 60 * 1000);
      expect(formatTimeAgo(minAgo)).toBe("15m ago");
    });

    it("formats hours ago (1 to 23 hours)", () => {
      const hoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
      expect(formatTimeAgo(hoursAgo)).toBe("4h ago");
    });

    it("formats days ago (>=24 hours)", () => {
      const daysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(formatTimeAgo(daysAgo)).toBe("3d ago");
    });
  });
});
