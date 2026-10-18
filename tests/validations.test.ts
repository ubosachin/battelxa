import { describe, it, expect } from "vitest";
import {
  RegisterSchema,
  LoginSchema,
  UpdateProfileSchema,
} from "../src/lib/validations/auth";
import {
  CreateOrderSchema,
  VerifyPaymentSchema,
  PayoutRequestSchema,
} from "../src/lib/validations/payment";

describe("Input Validation & Security Schemas", () => {
  describe("Authentication Validation Schemas", () => {
    it("accepts valid registration payload", () => {
      const valid = RegisterSchema.safeParse({
        username: "pro_warrior_99",
        email: "warrior@battlexa.gg",
        password: "ValidPassword123!",
        role: "PLAYER",
        gamerTag: "VORTEX",
        freeFireId: "847291048",
      });
      expect(valid.success).toBe(true);
    });

    it("rejects username with invalid characters or spaces", () => {
      const invalid = RegisterSchema.safeParse({
        username: "pro warrior!",
        email: "warrior@battlexa.gg",
        password: "ValidPassword123!",
      });
      expect(invalid.success).toBe(false);
    });

    it("rejects password shorter than 6 characters", () => {
      const invalid = RegisterSchema.safeParse({
        username: "warrior99",
        email: "warrior@battlexa.gg",
        password: "123",
      });
      expect(invalid.success).toBe(false);
    });

    it("validates LoginSchema constraints", () => {
      const valid = LoginSchema.safeParse({
        email: "player@battlexa.gg",
        password: "securepassword",
      });
      expect(valid.success).toBe(true);

      const invalidEmail = LoginSchema.safeParse({
        email: "not-an-email",
        password: "password",
      });
      expect(invalidEmail.success).toBe(false);

      const emptyPassword = LoginSchema.safeParse({
        email: "player@battlexa.gg",
        password: "",
      });
      expect(emptyPassword.success).toBe(false);
    });

    it("validates UpdateProfileSchema optional fields and limits", () => {
      const valid = UpdateProfileSchema.safeParse({
        gamerTag: "ApexPredator",
        bio: "Top 500 competitive Free Fire squad leader.",
        discordHandle: "apex#1234",
        avatar: "https://example.com/avatar.png",
      });
      expect(valid.success).toBe(true);

      // Empty string avatar is also permitted
      const emptyAvatar = UpdateProfileSchema.safeParse({
        avatar: "",
      });
      expect(emptyAvatar.success).toBe(true);
    });
  });

  describe("Payment & Payout Validation Schemas", () => {
    it("validates Razorpay order creation boundaries (min ₹10, max ₹50000)", () => {
      const valid = CreateOrderSchema.safeParse({
        amount: 250,
        type: "TOURNAMENT_ENTRY",
        tournamentId: "t_991823",
      });
      expect(valid.success).toBe(true);

      const belowMin = CreateOrderSchema.safeParse({
        amount: 5, // minimum is 10
        type: "WALLET_TOPUP",
      });
      expect(belowMin.success).toBe(false);

      const aboveMax = CreateOrderSchema.safeParse({
        amount: 100000, // maximum is 50000
        type: "WALLET_TOPUP",
      });
      expect(aboveMax.success).toBe(false);
    });

    it("requires orderId, paymentId, and signature for payment verification", () => {
      const valid = VerifyPaymentSchema.safeParse({
        razorpayOrderId: "order_xyz123",
        razorpayPaymentId: "pay_abc789",
        razorpaySignature: "sig_def456",
        type: "WALLET_TOPUP",
      });
      expect(valid.success).toBe(true);

      const missingSig = VerifyPaymentSchema.safeParse({
        razorpayOrderId: "order_xyz123",
        razorpayPaymentId: "pay_abc789",
        razorpaySignature: "",
        type: "WALLET_TOPUP",
      });
      expect(missingSig.success).toBe(false);
    });

    it("validates UPI payout request with valid UPI format", () => {
      const validUPI = PayoutRequestSchema.safeParse({
        amount: 500,
        payoutMethod: "UPI",
        upiId: "player99@okhdfcbank",
      });
      expect(validUPI.success).toBe(true);

      const invalidUPI = PayoutRequestSchema.safeParse({
        amount: 500,
        payoutMethod: "UPI",
        upiId: "invalid-upi-without-at",
      });
      expect(invalidUPI.success).toBe(false);
    });

    it("validates Bank Transfer payout request with mandatory IFSC and account info", () => {
      const validBank = PayoutRequestSchema.safeParse({
        amount: 2500,
        payoutMethod: "BANK_TRANSFER",
        accountNumber: "918273645291",
        ifscCode: "HDFC0001234",
        accountHolderName: "Sachin Sharma",
      });
      expect(validBank.success).toBe(true);

      // Missing account holder name should fail refinement
      const missingHolder = PayoutRequestSchema.safeParse({
        amount: 2500,
        payoutMethod: "BANK_TRANSFER",
        accountNumber: "918273645291",
        ifscCode: "HDFC0001234",
      });
      expect(missingHolder.success).toBe(false);

      // Invalid IFSC format should fail
      const invalidIFSC = PayoutRequestSchema.safeParse({
        amount: 2500,
        payoutMethod: "BANK_TRANSFER",
        accountNumber: "918273645291",
        ifscCode: "invalid_ifsc",
        accountHolderName: "Sachin Sharma",
      });
      expect(invalidIFSC.success).toBe(false);
    });

    it("rejects withdrawals below minimum threshold (₹100)", () => {
      const tooSmall = PayoutRequestSchema.safeParse({
        amount: 50, // minimum is 100
        payoutMethod: "UPI",
        upiId: "user@paytm",
      });
      expect(tooSmall.success).toBe(false);
    });
  });
});
