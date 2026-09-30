import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrganizerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  organizationName: string;
  description: string;
  logo?: string;
  banner?: string;
  website?: string;
  phone?: string;
  verifiedByAdmin: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  tournamentsHosted: number;
  totalPrizeDistributed: number;
  rating: number;
  upiId?: string;
  bankDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
  };
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizerProfileSchema = new Schema<IOrganizerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    organizationName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "Verified esports tournament organizer on BATTLEXA.",
    },
    logo: {
      type: String,
      default: "",
    },
    banner: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    verifiedByAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"],
      default: "PENDING",
      index: true,
    },
    tournamentsHosted: {
      type: Number,
      default: 0,
    },
    totalPrizeDistributed: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    upiId: {
      type: String,
      default: "",
    },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
    },
    rejectionReason: String,
  },
  { timestamps: true }
);

export const OrganizerProfile: Model<IOrganizerProfile> =
  mongoose.models.OrganizerProfile ||
  mongoose.model<IOrganizerProfile>("OrganizerProfile", OrganizerProfileSchema);
