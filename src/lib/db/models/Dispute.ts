import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDispute extends Document {
  tournamentId: mongoose.Types.ObjectId;
  matchId?: mongoose.Types.ObjectId;
  reporterId: mongoose.Types.ObjectId;
  reportedUserId?: mongoose.Types.ObjectId;
  reason: string;
  evidenceUrls: string[]; // Cloudinary screenshot or clip URLs
  status: "PENDING" | "INVESTIGATING" | "RESOLVED" | "REJECTED";
  resolutionNotes?: string;
  resolvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema = new Schema<IDispute>(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
    matchId: {
      type: Schema.Types.ObjectId,
      ref: "Match",
      index: true,
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reportedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reason: {
      type: String,
      required: true,
    },
    evidenceUrls: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["PENDING", "INVESTIGATING", "RESOLVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    resolutionNotes: String,
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Dispute: Model<IDispute> =
  mongoose.models.Dispute ||
  mongoose.model<IDispute>("Dispute", DisputeSchema);
