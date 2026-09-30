import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlayerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  gamerTag: string;
  freeFireId?: string;
  bgmiId?: string;
  bio?: string;
  phone?: string;
  discordHandle?: string;
  avatar?: string;
  isOnboarded?: boolean;
  preferredGame?: "FREE_FIRE_MAX" | "BGMI" | "BOTH";
  playstyle?: string;
  deviceType?: string;
  experienceLevel?: string;
  stateOrCity?: string;
  notifyWhatsapp?: boolean;
  notifyDiscord?: boolean;
  matchesPlayed: number;
  matchesWon: number;
  totalKills: number;
  earnings: number;
  rankTitle: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerProfileSchema = new Schema<IPlayerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    gamerTag: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    freeFireId: {
      type: String,
      trim: true,
      default: "",
    },
    bgmiId: {
      type: String,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      maxlength: 300,
      default: "Esports contender on BATTLEXA.",
    },
    phone: {
      type: String,
      default: "",
    },
    discordHandle: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    isOnboarded: {
      type: Boolean,
    },
    preferredGame: {
      type: String,
      enum: ["FREE_FIRE_MAX", "BGMI", "BOTH"],
      default: "BOTH",
    },
    playstyle: {
      type: String,
      default: "Assaulter / Rusher",
    },
    deviceType: {
      type: String,
      default: "Android Smartphone",
    },
    experienceLevel: {
      type: String,
      default: "Competitive Contender",
    },
    stateOrCity: {
      type: String,
      default: "",
    },
    notifyWhatsapp: {
      type: Boolean,
      default: true,
    },
    notifyDiscord: {
      type: Boolean,
      default: false,
    },
    matchesPlayed: {
      type: Number,
      default: 0,
    },
    matchesWon: {
      type: Number,
      default: 0,
    },
    totalKills: {
      type: Number,
      default: 0,
    },
    earnings: {
      type: Number,
      default: 0,
    },
    rankTitle: {
      type: String,
      default: "Rookie Contender",
    },
  },
  { timestamps: true }
);

export const PlayerProfile: Model<IPlayerProfile> =
  mongoose.models.PlayerProfile ||
  mongoose.model<IPlayerProfile>("PlayerProfile", PlayerProfileSchema);
