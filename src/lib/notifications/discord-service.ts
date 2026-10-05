export interface TournamentDiscordPayload {
  tournamentTitle: string;
  tournamentId: string;
  gameName: string;
  format: string;
  status?: string;
  type: "CREDENTIALS" | "UPDATE" | "ANNOUNCEMENT";
  title: string;
  message: string;
  credentials?: {
    roomId?: string;
    password?: string;
    notes?: string;
  };
  discordWebhookUrl?: string;
  registeredDiscordIds?: string[];
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbedPayload {
  title: string;
  description: string;
  url?: string;
  color: number; // Decimal color
  fields: DiscordEmbedField[];
  footer?: {
    text: string;
    icon_url?: string;
  };
  timestamp?: string;
}

export function buildDiscordEmbed(payload: TournamentDiscordPayload): DiscordEmbedPayload {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const roomUrl = `${appUrl}/tournaments/${payload.tournamentId}/room`;
  const isCredentials = payload.credentials && (payload.credentials.roomId || payload.credentials.password);

  // Emerald #10B981 = 1095937, Amber #F59E0B = 16096779, Purple #8B5CF6 = 9133302
  const color = isCredentials ? 1095937 : payload.type === "ANNOUNCEMENT" ? 16096779 : 9133302;

  const fields: DiscordEmbedField[] = [
    { name: "🎮 Game", value: `**${payload.gameName}**`, inline: true },
    { name: "👥 Format", value: `**${payload.format}**`, inline: true },
  ];

  if (payload.status) {
    fields.push({ name: "⚡ Status", value: `\`${payload.status}\``, inline: true });
  }

  if (isCredentials) {
    fields.push(
      {
        name: "🔐 Room ID",
        value: payload.credentials?.roomId
          ? `\`\`\`${payload.credentials.roomId}\`\`\``
          : "`TBA`",
        inline: true,
      },
      {
        name: "🔑 Password",
        value: payload.credentials?.password
          ? `\`\`\`${payload.credentials.password}\`\`\``
          : "`None`",
        inline: true,
      }
    );

    if (payload.credentials?.notes) {
      fields.push({
        name: "⚠️ Instructions / Notes",
        value: payload.credentials.notes,
        inline: false,
      });
    }
  }

  fields.push({
    name: "🔗 Tournament Arena",
    value: `[**Click here to enter match vault**](${roomUrl})`,
    inline: false,
  });

  return {
    title: `⚔️ [BATTLEXA] ${payload.title} — ${payload.tournamentTitle}`,
    description: payload.message || "Match update dispatched to all registered gladiators.",
    url: roomUrl,
    color,
    fields,
    footer: {
      text: "BATTLEXA Tournament Engine • Automated Scrim Delivery",
    },
    timestamp: new Date().toISOString(),
  };
}

export async function sendTournamentDiscordNotification(
  payload: TournamentDiscordPayload
): Promise<{ webhookSent: boolean; dmCount: number; logs: string[] }> {
  const embed = buildDiscordEmbed(payload);
  const webhookUrl =
    payload.discordWebhookUrl ||
    process.env.DISCORD_WEBHOOK_URL ||
    process.env.DISCORD_MATCH_ALERT_WEBHOOK_URL;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const logs: string[] = [];
  let webhookSent = false;
  let dmCount = 0;

  // 1. Dispatch via Discord Webhook if URL configured
  if (webhookUrl && webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `📢 **Match Update:** <@&gladiators> A new announcement was posted for **${payload.tournamentTitle}**!`,
          embeds: [embed],
        }),
      });

      if (res.ok) {
        webhookSent = true;
        logs.push("Discord Webhook broadcast delivered successfully.");
      } else {
        const text = await res.text();
        logs.push(`Discord Webhook failed with status ${res.status}: ${text}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logs.push(`Discord Webhook network error: ${msg}`);
      console.error("Discord webhook dispatch error:", msg);
    }
  } else {
    logs.push("[Discord Webhook Simulated] No webhook URL set; embed compiled successfully.");
  }

  // 2. Dispatch via Bot Direct Message if bot token and user Discord IDs present
  if (botToken && payload.registeredDiscordIds && payload.registeredDiscordIds.length > 0) {
    for (const discordId of payload.registeredDiscordIds) {
      if (!discordId || discordId.startsWith("dev_") || discordId.startsWith("discord_")) {
        continue;
      }
      try {
        // Step A: Create DM Channel
        const channelRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
          method: "POST",
          headers: {
            Authorization: `Bot ${botToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recipient_id: discordId }),
        });

        if (channelRes.ok) {
          const channelData = await channelRes.json();
          // Step B: Send Message with Embed
          const msgRes = await fetch(
            `https://discord.com/api/v10/channels/${channelData.id}/messages`,
            {
              method: "POST",
              headers: {
                Authorization: `Bot ${botToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                content: `⚔️ **BATTLEXA Personal Match Update:**`,
                embeds: [embed],
              }),
            }
          );
          if (msgRes.ok) {
            dmCount++;
            logs.push(`Discord DM delivered to user <@${discordId}>`);
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        logs.push(`Failed to DM discord user ${discordId}: ${msg}`);
      }
    }
  }

  return { webhookSent, dmCount, logs };
}
