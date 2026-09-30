import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGame extends Document {
  name: string;
  slug: string;
  developer: string;
  category: string;
  icon: string;
  banner: string;
  supportedFormats: ("SOLO" | "DUO" | "SQUAD")[];
  defaultMaxSlots: number;
  idFormatLabel: string; // e.g. "Free Fire UID" or "BGMI Character ID"
  isActive: boolean;
  defaultRules: string;
  createdAt: Date;
  updatedAt: Date;
}

const GameSchema = new Schema<IGame>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    developer: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "Battle Royale",
    },
    icon: {
      type: String,
      default: "",
    },
    banner: {
      type: String,
      default: "",
    },
    supportedFormats: [
      {
        type: String,
        enum: ["SOLO", "DUO", "SQUAD"],
        default: ["SOLO", "DUO", "SQUAD"],
      },
    ],
    defaultMaxSlots: {
      type: Number,
      default: 48,
    },
    idFormatLabel: {
      type: String,
      default: "In-Game ID",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    defaultRules: {
      type: String,
      default: "Fair play rules apply. No emulators unless explicitly permitted. Hacks or scripts result in immediate ban.",
    },
  },
  { timestamps: true }
);

export const Game: Model<IGame> =
  mongoose.models.Game || mongoose.model<IGame>("Game", GameSchema);
