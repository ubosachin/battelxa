import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRegistrationMember {
  userId: mongoose.Types.ObjectId;
  gamerTag: string;
  inGameId: string;
}

export interface IRegistration extends Document {
  tournamentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  teamName?: string;
  teamTag?: string;
  registrationType: "SOLO" | "DUO" | "SQUAD";
  members: IRegistrationMember[];
  slotNumber: number;
  paymentId?: mongoose.Types.ObjectId;
  paymentStatus: "NOT_APPLICABLE" | "PENDING" | "COMPLETED" | "REFUNDED";
  status: "CONFIRMED" | "WAITLIST" | "CANCELLED" | "CHECKED_IN";
  checkedInAt?: Date;
  registeredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationMemberSchema = new Schema<IRegistrationMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    gamerTag: { type: String, required: true },
    inGameId: { type: String, required: true },
  },
  { _id: false }
);

const RegistrationSchema = new Schema<IRegistration>(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
    },
    teamName: String,
    teamTag: String,
    registrationType: {
      type: String,
      enum: ["SOLO", "DUO", "SQUAD"],
      required: true,
    },
    members: [RegistrationMemberSchema],
    slotNumber: {
      type: Number,
      required: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
    paymentStatus: {
      type: String,
      enum: ["NOT_APPLICABLE", "PENDING", "COMPLETED", "REFUNDED"],
      default: "NOT_APPLICABLE",
    },
    status: {
      type: String,
      enum: ["CONFIRMED", "WAITLIST", "CANCELLED", "CHECKED_IN"],
      default: "CONFIRMED",
      index: true,
    },
    checkedInAt: Date,
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

RegistrationSchema.index(
  { tournamentId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: "CANCELLED" } } }
);

export const Registration: Model<IRegistration> =
  mongoose.models.Registration ||
  mongoose.model<IRegistration>("Registration", RegistrationSchema);
