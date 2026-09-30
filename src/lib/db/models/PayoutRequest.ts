import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayoutRequest extends Document {
  userId: mongoose.Types.ObjectId;
  role: "PLAYER" | "ORGANIZER";
  amount: number;
  payoutMethod: "UPI" | "BANK_TRANSFER";
  payoutDetails: {
    upiId?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
  };
  status: "PENDING" | "APPROVED" | "REJECTED" | "PROCESSED";
  adminNotes?: string;
  transactionReference?: string;
  processedBy?: mongoose.Types.ObjectId;
  requestedAt: Date;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutRequestSchema = new Schema<IPayoutRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["PLAYER", "ORGANIZER"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 100, // minimum payout limit in INR
    },
    payoutMethod: {
      type: String,
      enum: ["UPI", "BANK_TRANSFER"],
      required: true,
    },
    payoutDetails: {
      upiId: String,
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "PROCESSED"],
      default: "PENDING",
      index: true,
    },
    adminNotes: String,
    transactionReference: String,
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: Date,
  },
  { timestamps: true }
);

export const PayoutRequest: Model<IPayoutRequest> =
  mongoose.models.PayoutRequest ||
  mongoose.model<IPayoutRequest>("PayoutRequest", PayoutRequestSchema);
