import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db/connect";
import { Tournament, Registration, User, AuditLog } from "@/lib/db/models";
import { broadcastNotification } from "./notification-service";
import { sendTournamentNotificationEmail } from "./email-service";
import { sendTournamentDiscordNotification, buildDiscordEmbed } from "./discord-service";

export interface BroadcastTournamentParams {
  tournamentId: string;
  senderId: string;
  senderRole: "ADMIN" | "ORGANIZER";
  title: string;
  message: string;
  type?: "CREDENTIALS" | "UPDATE" | "ANNOUNCEMENT";
  credentials?: {
    roomId?: string;
    password?: string;
    notes?: string;
  };
  channels?: ("EMAIL" | "DISCORD" | "IN_APP")[];
  customDiscordWebhookUrl?: string;
}

export interface BroadcastResult {
  success: boolean;
  totalRegistered: number;
  emailsSent: number;
  discordWebhookDelivered: boolean;
  discordDmsSent: number;
  inAppDelivered: number;
  channels: string[];
  logs: string[];
  discordPreviewEmbed: ReturnType<typeof buildDiscordEmbed>;
}

export async function broadcastTournamentUpdate(
  params: BroadcastTournamentParams
): Promise<BroadcastResult> {
  await connectToDatabase();

  const tournament = await Tournament.findById(params.tournamentId);
  if (!tournament) {
    throw new Error("Tournament not found");
  }

  const activeChannels = params.channels && params.channels.length > 0
    ? params.channels
    : ["EMAIL", "DISCORD", "IN_APP"];

  // 1. Fetch all confirmed registrations for this tournament
  const registrations = await Registration.find({
    tournamentId: tournament._id,
    status: { $ne: "CANCELLED" },
  }).lean();

  const registeredUserIds = registrations.map((r) => r.userId);

  // 2. Fetch User profiles for emails and Discord IDs
  const users = await User.find({
    _id: { $in: registeredUserIds },
  })
    .select("email username discordId")
    .lean();

  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  // Build recipient list matching registration slot numbers
  const recipients = registrations.map((reg) => {
    const user = userMap.get(reg.userId.toString());
    return {
      email: user?.email || "",
      username: user?.username || reg.members?.[0]?.gamerTag || "Gladiator",
      slotNumber: reg.slotNumber,
      discordId: user?.discordId,
    };
  });

  const logs: string[] = [];
  let emailsSent = 0;
  let discordWebhookDelivered = false;
  let discordDmsSent = 0;
  let inAppDelivered = 0;

  const credentialsToUse = params.credentials || (
    tournament.roomCredentials?.roomId || tournament.roomCredentials?.password
      ? {
          roomId: tournament.roomCredentials.roomId,
          password: tournament.roomCredentials.password,
          notes: tournament.roomCredentials.notes,
        }
      : undefined
  );

  const webhookToUse =
    params.customDiscordWebhookUrl ||
    tournament.discordWebhookUrl ||
    process.env.DISCORD_WEBHOOK_URL ||
    process.env.DISCORD_MATCH_ALERT_WEBHOOK_URL;

  // A. Dispatch In-App Notifications
  if (activeChannels.includes("IN_APP") && registeredUserIds.length > 0) {
    await broadcastNotification({
      userIds: registeredUserIds,
      title: `⚔️ ${params.title}`,
      message: params.message,
      type: params.type === "CREDENTIALS" ? "ROOM_CREDENTIALS" : "TOURNAMENT",
      link: `/tournaments/${tournament._id}/room`,
    });
    inAppDelivered = registeredUserIds.length;
    logs.push(`In-App alerts created for ${inAppDelivered} gladiators.`);
  }

  // B. Dispatch Emails with Rich HTML Gaming Embed
  if (activeChannels.includes("EMAIL") && recipients.length > 0) {
    const emailResult = await sendTournamentNotificationEmail({
      tournamentTitle: tournament.title,
      tournamentId: tournament._id.toString(),
      gameName: tournament.gameName,
      format: tournament.format,
      startTime: tournament.startTime,
      type: params.type || (credentialsToUse ? "CREDENTIALS" : "UPDATE"),
      title: params.title,
      message: params.message,
      credentials: credentialsToUse,
      recipients: recipients.map((r) => ({
        email: r.email,
        username: r.username,
        slotNumber: r.slotNumber,
      })),
    });

    emailsSent = emailResult.sent;
    logs.push(...emailResult.logs);
  }

  // C. Dispatch Discord Rich Embed
  const registeredDiscordIds = recipients
    .map((r) => r.discordId)
    .filter((id): id is string => Boolean(id));

  const discordResult = await sendTournamentDiscordNotification({
    tournamentTitle: tournament.title,
    tournamentId: tournament._id.toString(),
    gameName: tournament.gameName,
    format: tournament.format,
    status: tournament.status,
    type: params.type || (credentialsToUse ? "CREDENTIALS" : "UPDATE"),
    title: params.title,
    message: params.message,
    credentials: credentialsToUse,
    discordWebhookUrl: webhookToUse,
    registeredDiscordIds,
  });

  discordWebhookDelivered = discordResult.webhookSent;
  discordDmsSent = discordResult.dmCount;
  logs.push(...discordResult.logs);

  // D. Save announcement into Tournament record
  if (!tournament.announcements) {
    tournament.announcements = [];
  }

  tournament.announcements.push({
    title: params.title,
    message: params.message,
    type: params.type || "UPDATE",
    channels: activeChannels,
    sentAt: new Date(),
    sentBy: params.senderId,
    recipientCount: registrations.length,
  });

  await tournament.save();

  // E. Record Audit Log
  await AuditLog.create({
    actorId: params.senderId,
    actorRole: params.senderRole,
    action: `TOURNAMENT_BROADCAST_${params.type || "UPDATE"}`,
    entityType: "Tournament",
    entityId: tournament._id.toString(),
    details: {
      title: params.title,
      channels: activeChannels,
      recipientCount: registrations.length,
      hasCredentials: Boolean(credentialsToUse?.roomId),
    },
  });

  const discordPreviewEmbed = buildDiscordEmbed({
    tournamentTitle: tournament.title,
    tournamentId: tournament._id.toString(),
    gameName: tournament.gameName,
    format: tournament.format,
    status: tournament.status,
    type: params.type || "UPDATE",
    title: params.title,
    message: params.message,
    credentials: credentialsToUse,
  });

  return {
    success: true,
    totalRegistered: registrations.length,
    emailsSent,
    discordWebhookDelivered,
    discordDmsSent,
    inAppDelivered,
    channels: activeChannels,
    logs,
    discordPreviewEmbed,
  };
}
