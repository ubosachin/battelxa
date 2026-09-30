import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPrizeItem {
  rank: number;
  recipientId: mongoose.Types.ObjectId;
  recipientType: "USER" | "TEAM";
  recipientName: string;
  amount: number;
  creditedAt?: Date;
  status: "PENDING" | "CREDITED" | "FAILED";
}

export interface IPrizeDistribution extends Document {
  tournamentId: mongoose.Types.ObjectId;
  totalPrizeDistributed: number;
  distributions: IPrizeItem[];
  approvedByAdmin: boolean;
  approvedBy: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PrizeItemSchema = new Schema<IPrizeItem>(
  {
    rank: { type: Number, required: true },
    recipientId: { type: Schema.Types.ObjectId, required: true },
    recipientType: { type: String, enum: ["USER", "TEAM"], required: true },
    recipientName: { type: String, required: true },
    amount: { type: Number, required: true },
    creditedAt: Date,
    status: {
      type: String,
      enum: ["PENDING", "CREDITED", "FAILED"],
      default: "PENDING",
    },
  },
  { _id: false }
);

const PrizeDistributionSchema = new Schema<IPrizeDistribution>(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      unique: true,
      index: true,
    },
    totalPrizeDistributed: {
      type: Number,
      required: true,
    },
    distributions: [PrizeItemSchema],
    approvedByAdmin: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
  },
  { timestamps: true }
);

export const PrizeDistribution: Model<IPrizeDistribution> =
  mongoose.models.PrizeDistribution ||
  mongoose.model<IPrizeDistribution>(
    "PrizeDistribution",
    PrizeDistributionSchema
  );
