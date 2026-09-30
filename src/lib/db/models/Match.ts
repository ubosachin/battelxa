import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMatch extends Document {
  tournamentId: mongoose.Types.ObjectId;
  roundNumber: number;
  matchNumber: number;
  title: string;
  mapName: string;
  status: "SCHEDULED" | "LOBBY_PREPARATION" | "LIVE" | "COMPLETED" | "CANCELLED";
  scheduledTime: Date;
  roomId?: string;
  roomPassword?: string;
  streamUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
    roundNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    matchNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    title: {
      type: String,
      required: true,
      default: "Match 1",
    },
    mapName: {
      type: String,
      default: "Bermuda",
    },
    status: {
      type: String,
      enum: ["SCHEDULED", "LOBBY_PREPARATION", "LIVE", "COMPLETED", "CANCELLED"],
      default: "SCHEDULED",
      index: true,
    },
    scheduledTime: {
      type: Date,
      required: true,
    },
    roomId: String,
    roomPassword: String,
    streamUrl: String,
  },
  { timestamps: true }
);

export const Match: Model<IMatch> =
  mongoose.models.Match || mongoose.model<IMatch>("Match", MatchSchema);
