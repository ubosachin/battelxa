import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeamInvitation extends Document {
  teamId: mongoose.Types.ObjectId;
  inviterId: mongoose.Types.ObjectId;
  inviteeId: mongoose.Types.ObjectId;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamInvitationSchema = new Schema<ITeamInvitation>(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    inviterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inviteeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "DECLINED", "EXPIRED"],
      default: "PENDING",
      index: true,
    },
    message: {
      type: String,
      default: "You have been invited to join an esports squad on BATTLEXA.",
    },
  },
  { timestamps: true }
);

TeamInvitationSchema.index({ teamId: 1, inviteeId: 1, status: 1 });

export const TeamInvitation: Model<ITeamInvitation> =
  mongoose.models.TeamInvitation ||
  mongoose.model<ITeamInvitation>("TeamInvitation", TeamInvitationSchema);
