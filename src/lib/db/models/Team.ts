import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeamMember {
  userId: mongoose.Types.ObjectId;
  role: "LEADER" | "CO_LEADER" | "MEMBER";
  inGameName: string;
  inGameId: string;
  joinedAt: Date;
}

export interface ITeam extends Document {
  name: string;
  tag: string;
  leaderId: mongoose.Types.ObjectId;
  game: "FREE_FIRE_MAX" | "BGMI";
  members: ITeamMember[];
  logo?: string;
  joinCode: string;
  matchesPlayed: number;
  matchesWon: number;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["LEADER", "CO_LEADER", "MEMBER"], default: "MEMBER" },
    inGameName: { type: String, required: true },
    inGameId: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TeamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    tag: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 6,
    },
    leaderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    game: {
      type: String,
      enum: ["FREE_FIRE_MAX", "BGMI"],
      required: true,
      index: true,
    },
    members: [TeamMemberSchema],
    logo: {
      type: String,
      default: "",
    },
    joinCode: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    matchesPlayed: {
      type: Number,
      default: 0,
    },
    matchesWon: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Team: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);
