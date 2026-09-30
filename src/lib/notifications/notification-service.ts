import mongoose from "mongoose";
import { Notification, NotificationType } from "../db/models/Notification";

export async function createNotification(params: {
  userId: string | mongoose.Types.ObjectId;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    return await Notification.create({
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || "SYSTEM",
      link: params.link || "",
      metadata: params.metadata || {},
    });
  } catch (error) {
    console.error("Failed to create in-app notification:", error);
    return null;
  }
}

export async function broadcastNotification(params: {
  userIds: (string | mongoose.Types.ObjectId)[];
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}) {
  try {
    const docs = params.userIds.map((uid) => ({
      userId: uid,
      title: params.title,
      message: params.message,
      type: params.type || "SYSTEM",
      link: params.link || "",
    }));
    if (docs.length > 0) {
      await Notification.insertMany(docs);
    }
  } catch (error) {
    console.error("Failed to broadcast notifications:", error);
  }
}
