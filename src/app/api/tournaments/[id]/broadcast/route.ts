import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db/connect";
import { Tournament, Registration } from "@/lib/db/models";
import { requireAuth } from "@/lib/auth/session";
import { broadcastTournamentUpdate } from "@/lib/notifications/tournament-broadcast";
import { z } from "zod";

const BroadcastSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  message: z.string().min(5, "Message must be at least 5 characters").max(2000),
  type: z.enum(["CREDENTIALS", "UPDATE", "ANNOUNCEMENT"]).default("UPDATE"),
  includeCredentials: z.boolean().default(false),
  credentials: z
    .object({
      roomId: z.string().optional(),
      password: z.string().optional(),
      notes: z.string().optional(),
    })
    .optional(),
  channels: z.array(z.enum(["EMAIL", "DISCORD", "IN_APP"])).min(1, "Select at least one channel"),
  customDiscordWebhookUrl: z.string().url().optional().or(z.literal("")),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAuth();

    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid tournament ID" }, { status: 400 });
    }

    const tournament = await Tournament.findById(id).lean();
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const isAuthorized =
      session.role === "ADMIN" ||
      tournament.organizerId.toString() === session.id;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const registeredCount = await Registration.countDocuments({
      tournamentId: id,
      status: { $ne: "CANCELLED" },
    });

    return NextResponse.json({
      tournamentId: tournament._id,
      title: tournament.title,
      gameName: tournament.gameName,
      status: tournament.status,
      registeredCount,
      roomCredentials: tournament.roomCredentials,
      discordWebhookUrl: tournament.discordWebhookUrl || "",
      announcements: tournament.announcements || [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching broadcast data";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAuth();

    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid tournament ID" }, { status: 400 });
    }

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const isAuthorized =
      session.role === "ADMIN" ||
      tournament.organizerId.toString() === session.id;

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Only admins or the tournament host can broadcast updates" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = BroadcastSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const {
      title,
      message,
      type,
      includeCredentials,
      credentials,
      channels,
      customDiscordWebhookUrl,
    } = validated.data;

    // If custom Discord webhook URL was provided, save it on the tournament for future alerts
    if (customDiscordWebhookUrl && customDiscordWebhookUrl !== tournament.discordWebhookUrl) {
      tournament.discordWebhookUrl = customDiscordWebhookUrl;
      await tournament.save();
    }

    // If credentials are supplied with the broadcast, sync them to tournament's room credentials
    let finalCredentials = undefined;
    if (includeCredentials || type === "CREDENTIALS") {
      finalCredentials = {
        roomId: credentials?.roomId || tournament.roomCredentials?.roomId || "",
        password: credentials?.password || tournament.roomCredentials?.password || "",
        notes: credentials?.notes || tournament.roomCredentials?.notes || "",
      };

      if (!tournament.roomCredentials) {
        tournament.roomCredentials = {
          roomId: finalCredentials.roomId,
          password: finalCredentials.password,
          notes: finalCredentials.notes,
          released: true,
          releaseTime: new Date(),
        };
      } else {
        if (finalCredentials.roomId) tournament.roomCredentials.roomId = finalCredentials.roomId;
        if (finalCredentials.password) tournament.roomCredentials.password = finalCredentials.password;
        if (finalCredentials.notes) tournament.roomCredentials.notes = finalCredentials.notes;
        tournament.roomCredentials.released = true;
      }
      await tournament.save();
    }

    // Execute broadcast
    const result = await broadcastTournamentUpdate({
      tournamentId: tournament._id.toString(),
      senderId: session.id,
      senderRole: session.role === "ADMIN" ? "ADMIN" : "ORGANIZER",
      title,
      message,
      type: includeCredentials ? "CREDENTIALS" : type,
      credentials: finalCredentials,
      channels,
      customDiscordWebhookUrl: customDiscordWebhookUrl || tournament.discordWebhookUrl,
    });

    return NextResponse.json(
      {
        message: `Broadcast successfully dispatched to ${result.totalRegistered} gladiators!`,
        result,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Broadcast dispatch error:", error);
    const message = error instanceof Error ? error.message : "Error dispatching broadcast";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
