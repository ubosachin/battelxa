import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMatchResult extends Document {
  matchId: mongoose.Types.ObjectId;
  tournamentId: mongoose.Types.ObjectId;
  teamOrUserId: mongoose.Types.ObjectId;
  isTeam: boolean;
  participantName: string;
  rank: number;
  kills: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
  prizeAwarded: number;
  evidenceUrl?: string; // Cloudinary screenshot
  notes?: string;
  submittedBy: mongoose.Types.ObjectId;
  verifiedByOrganizer: boolean;
  verifiedByAdmin: boolean;
  status: "DRAFT" | "SUBMITTED" | "VERIFIED" | "DISPUTED";
  createdAt: Date;
  updatedAt: Date;
}

const MatchResultSchema = new Schema<IMatchResult>(
  {
    matchId: {
      type: Schema.Types.ObjectId,
      ref: "Match",
      required: true,
      index: true,
    },
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
    teamOrUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    isTeam: {
      type: Boolean,
      default: false,
    },
    participantName: {
      type: String,
      required: true,
    },
    rank: {
      type: Number,
      required: true,
      min: 1,
    },
    kills: {
      type: Number,
      default: 0,
      min: 0,
    },
    placementPoints: {
      type: Number,
      default: 0,
    },
    killPoints: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    prizeAwarded: {
      type: Number,
      default: 0,
    },
    evidenceUrl: {
      type: String,
      default: "",
    },
    notes: String,
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    verifiedByOrganizer: {
      type: Boolean,
      default: true,
    },
    verifiedByAdmin: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "VERIFIED", "DISPUTED"],
      default: "SUBMITTED",
      index: true,
    },
  },
  { timestamps: true }
);

MatchResultSchema.index({ tournamentId: 1, rank: 1 });

export const MatchResult: Model<IMatchResult> =
  mongoose.models.MatchResult ||
  mongoose.model<IMatchResult>("MatchResult", MatchResultSchema);
