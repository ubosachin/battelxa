import { describe, it, expect } from "vitest";
import crypto from "crypto";
import {
  verifyPaymentSignature,
  verifyWebhookSignature,
} from "../src/lib/payments/razorpay";

describe("Razorpay Signature Cryptographic Verification", () => {
  const secret = process.env.RAZORPAY_KEY_SECRET || "BATTLEXA_DEV_SECRET_KEY_987654";
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "BATTLEXA_WEBHOOK_SECRET_KEY_54321";

  it("verifies valid HMAC-SHA256 payment signature", () => {
    const orderId = "order_982739482";
    const paymentId = "pay_839201948";
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const isValid = verifyPaymentSignature(orderId, paymentId, expectedSignature);
    expect(isValid).toBe(true);
  });

  it("rejects forged or tampered payment signatures", () => {
    const orderId = "order_982739482";
    const paymentId = "pay_839201948";
    const fakeSignature = "fake_tampered_signature_hex_value_12345";

    const isValid = verifyPaymentSignature(orderId, paymentId, fakeSignature);
    expect(isValid).toBe(false);
  });

  it("verifies valid webhook payload signature", () => {
    const bodyPayload = JSON.stringify({
      event: "payment.captured",
      payload: { payment: { entity: { id: "pay_test_1" } } },
    });

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(bodyPayload)
      .digest("hex");

    const isValid = verifyWebhookSignature(bodyPayload, expectedSignature);
    expect(isValid).toBe(true);
  });

  it("rejects forged webhook signatures", () => {
    const bodyPayload = JSON.stringify({ event: "payment.captured" });
    const isValid = verifyWebhookSignature(bodyPayload, "tampered_signature_123");
    expect(isValid).toBe(false);
  });
});
