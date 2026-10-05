import mongoose, { Schema, Document, Model } from "mongoose";

export type TournamentStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "REGISTRATION_OPEN"
  | "REGISTRATION_CLOSED"
  | "CHECK_IN"
  | "LIVE"
  | "COMPLETED"
  | "CANCELLED";

export type TournamentFormat = "SOLO" | "DUO" | "SQUAD";
export type TournamentType = "FREE" | "PAID" | "PRACTICE";

export interface IPrizeBreakdown {
  rank: number;
  percentage: number;
  amount: number;
}

export interface IRoomCredentials {
  roomId: string;
  password?: string;
  releaseTime: Date; // e.g. 15 minutes before startTime
  released: boolean;
  notes?: string;
}

export interface ITournamentAnnouncement {
  title: string;
  message: string;
  type: "CREDENTIALS" | "UPDATE" | "ANNOUNCEMENT";
  channels: string[];
  sentAt: Date;
  sentBy?: mongoose.Types.ObjectId | string;
  recipientCount: number;
}

export interface ITournament extends Document {
  title: string;
  slug: string;
  organizerId: mongoose.Types.ObjectId;
  gameId: mongoose.Types.ObjectId;
  gameName: string;
  gameSlug: string;
  format: TournamentFormat;
  type: TournamentType;
  entryFee: number;
  prizePool: number;
  prizeBreakdown: IPrizeBreakdown[];
  maxSlots: number;
  registeredSlots: number;
  status: TournamentStatus;
  startTime: Date;
  registrationDeadline: Date;
  checkInStartTime?: Date;
  roomCredentials?: IRoomCredentials;
  discordWebhookUrl?: string;
  announcements?: ITournamentAnnouncement[];
  rules: string;
  bannerUrl: string;
  streamUrl?: string;
  region: string;
  isFeatured: boolean;
  isPractice: boolean;
  winnerDeclared?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PrizeBreakdownSchema = new Schema<IPrizeBreakdown>(
  {
    rank: { type: Number, required: true },
    percentage: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const RoomCredentialsSchema = new Schema<IRoomCredentials>(
  {
    roomId: { type: String, default: "" },
    password: { type: String, default: "" },
    releaseTime: { type: Date, required: true },
    released: { type: Boolean, default: false },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const TournamentSchema = new Schema<ITournament>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    gameId: {
      type: Schema.Types.ObjectId,
      ref: "Game",
      required: true,
      index: true,
    },
    gameName: {
      type: String,
      required: true,
    },
    gameSlug: {
      type: String,
      required: true,
      index: true,
    },
    format: {
      type: String,
      enum: ["SOLO", "DUO", "SQUAD"],
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["FREE", "PAID", "PRACTICE"],
      default: "FREE",
      index: true,
    },
    entryFee: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    prizePool: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    prizeBreakdown: [PrizeBreakdownSchema],
    maxSlots: {
      type: Number,
      required: true,
      min: 2,
    },
    registeredSlots: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "DRAFT",
        "PUBLISHED",
        "REGISTRATION_OPEN",
        "REGISTRATION_CLOSED",
        "CHECK_IN",
        "LIVE",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "DRAFT",
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    registrationDeadline: {
      type: Date,
      required: true,
    },
    checkInStartTime: {
      type: Date,
    },
    roomCredentials: RoomCredentialsSchema,
    discordWebhookUrl: {
      type: String,
      default: "",
    },
    announcements: [
      {
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: { type: String, default: "UPDATE" },
        channels: [{ type: String }],
        sentAt: { type: Date, default: Date.now },
        sentBy: { type: Schema.Types.ObjectId, ref: "User" },
        recipientCount: { type: Number, default: 0 },
      },
    ],
    rules: {
      type: String,
      default: "Official rules apply.",
    },
    bannerUrl: {
      type: String,
      default: "",
    },
    streamUrl: {
      type: String,
      default: "",
    },
    region: {
      type: String,
      default: "India (South Asia)",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPractice: {
      type: Boolean,
      default: false,
    },
    winnerDeclared: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

TournamentSchema.index({ status: 1, gameSlug: 1, startTime: 1 });
TournamentSchema.index({ organizerId: 1, status: 1 });

export const Tournament: Model<ITournament> =
  mongoose.models.Tournament ||
  mongoose.model<ITournament>("Tournament", TournamentSchema);
