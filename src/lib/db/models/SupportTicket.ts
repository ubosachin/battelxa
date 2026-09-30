import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITicketResponse {
  responderId: mongoose.Types.ObjectId;
  responderRole: "PLAYER" | "ORGANIZER" | "ADMIN";
  message: string;
  createdAt: Date;
}

export interface ISupportTicket extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  category: "PAYMENT" | "TOURNAMENT" | "ACCOUNT" | "RULES_VIOLATION" | "OTHER";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  message: string;
  responses: ITicketResponse[];
  createdAt: Date;
  updatedAt: Date;
}

const TicketResponseSchema = new Schema<ITicketResponse>(
  {
    responderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    responderRole: {
      type: String,
      enum: ["PLAYER", "ORGANIZER", "ADMIN"],
      required: true,
    },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["PAYMENT", "TOURNAMENT", "ACCOUNT", "RULES_VIOLATION", "OTHER"],
      default: "TOURNAMENT",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
      default: "OPEN",
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    responses: [TicketResponseSchema],
  },
  { timestamps: true }
);

export const SupportTicket: Model<ISupportTicket> =
  mongoose.models.SupportTicket ||
  mongoose.model<ISupportTicket>("SupportTicket", SupportTicketSchema);
