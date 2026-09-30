import { z } from "zod";

export const CreateOrderSchema = z.object({
  amount: z.number().min(10, "Minimum amount is ₹10").max(50000, "Maximum limit reached"),
  type: z.enum(["TOURNAMENT_ENTRY", "WALLET_TOPUP"]),
  tournamentId: z.string().optional(),
});

export const VerifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1, "Order ID is required"),
  razorpayPaymentId: z.string().min(1, "Payment ID is required"),
  razorpaySignature: z.string().min(1, "Signature is required"),
  type: z.enum(["TOURNAMENT_ENTRY", "WALLET_TOPUP"]),
  tournamentId: z.string().optional(),
});

export const PayoutRequestSchema = z.object({
  amount: z.number().min(100, "Minimum withdrawal is ₹100"),
  payoutMethod: z.enum(["UPI", "BANK_TRANSFER"]),
  upiId: z
    .string()
    .regex(/^[\w.-]+@[\w.-]+$/, "Invalid UPI ID format (e.g. user@okhdfcbank)")
    .optional(),
  accountNumber: z.string().min(8).max(20).optional(),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format").optional(),
  accountHolderName: z.string().min(3).optional(),
}).refine(
  (data) => {
    if (data.payoutMethod === "UPI") {
      return !!data.upiId;
    }
    if (data.payoutMethod === "BANK_TRANSFER") {
      return !!data.accountNumber && !!data.ifscCode && !!data.accountHolderName;
    }
    return false;
  },
  {
    message: "Required payout details are missing for the selected method",
  }
);
