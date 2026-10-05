import nodemailer from "nodemailer";

export interface TournamentEmailPayload {
  tournamentTitle: string;
  tournamentId: string;
  gameName: string;
  format: string;
  startTime?: Date | string;
  type: "CREDENTIALS" | "UPDATE" | "ANNOUNCEMENT";
  title: string;
  message: string;
  credentials?: {
    roomId?: string;
    password?: string;
    notes?: string;
  };
  recipients: Array<{
    email: string;
    username: string;
    slotNumber?: number;
  }>;
}

// Create Nodemailer transport based on environment variables
function getEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Development fallback transporter (log or mock)
  return null;
}

export function generateTournamentEmailHtml(params: {
  username: string;
  slotNumber?: number;
  tournamentTitle: string;
  tournamentId: string;
  gameName: string;
  format: string;
  startTime?: Date | string;
  title: string;
  message: string;
  credentials?: {
    roomId?: string;
    password?: string;
    notes?: string;
  };
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const discordInviteUrl =
    process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/battlexa";
  const roomUrl = `${appUrl}/tournaments/${params.tournamentId}/room`;
  const isCredentials = params.credentials && (params.credentials.roomId || params.credentials.password);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.title} - BATTLEXA</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #080a11;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #e2e8f0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: #0d111c;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      overflow: hidden;
      margin-top: 24px;
      margin-bottom: 24px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
      padding: 32px 24px;
      text-align: center;
      position: relative;
    }
    .badge {
      display: inline-block;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 4px 14px;
      border-radius: 9999px;
      margin-bottom: 12px;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    .content {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 16px;
      color: #94a3b8;
      margin-bottom: 20px;
    }
    .greeting strong {
      color: #ffffff;
    }
    .tournament-banner {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 24px;
    }
    .tournament-title {
      font-size: 18px;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 8px 0;
    }
    .tournament-meta {
      font-size: 13px;
      color: #94a3b8;
      display: flex;
      gap: 16px;
    }
    .tournament-meta span {
      display: inline-block;
      margin-right: 16px;
    }
    .message-card {
      background: rgba(16, 185, 129, 0.05);
      border-left: 4px solid #10b981;
      padding: 16px 20px;
      border-radius: 4px 8px 8px 4px;
      margin-bottom: 24px;
    }
    .message-title {
      font-size: 15px;
      font-weight: 700;
      color: #10b981;
      margin-bottom: 6px;
    }
    .message-body {
      font-size: 14px;
      line-height: 1.6;
      color: #cbd5e1;
      margin: 0;
      white-space: pre-line;
    }
    .creds-box {
      background: linear-gradient(180deg, #131926 0%, #0e131f 100%);
      border: 2px solid #10b981;
      border-radius: 14px;
      padding: 24px;
      margin-bottom: 28px;
      text-align: center;
      box-shadow: 0 0 25px rgba(16, 185, 129, 0.15);
    }
    .creds-title {
      font-size: 13px;
      font-weight: 800;
      color: #10b981;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 18px;
    }
    .creds-grid {
      display: table;
      width: 100%;
      margin-bottom: 14px;
    }
    .creds-row {
      display: table-row;
    }
    .creds-cell {
      display: table-cell;
      width: 50%;
      padding: 10px;
      vertical-align: middle;
    }
    .cred-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 4px;
    }
    .cred-val {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 20px;
      font-weight: 900;
      color: #ffffff;
      background: #07090e;
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 8px 12px;
      border-radius: 8px;
      letter-spacing: 1px;
      display: inline-block;
    }
    .slot-tag {
      display: inline-block;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #fbbf24;
      font-weight: 800;
      font-size: 13px;
      padding: 6px 16px;
      border-radius: 9999px;
      margin-top: 10px;
    }
    .notes {
      font-size: 12px;
      color: #94a3b8;
      font-style: italic;
      margin-top: 14px;
    }
    .button-container {
      text-align: center;
      margin-top: 28px;
      margin-bottom: 24px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 800;
      font-size: 14px;
      letter-spacing: 0.5px;
      padding: 14px 32px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
    }
    .discord-invite-card {
      background: rgba(88, 101, 242, 0.08);
      border: 1px solid rgba(88, 101, 242, 0.3);
      border-radius: 12px;
      padding: 16px 20px;
      margin-top: 24px;
      text-align: center;
    }
    .discord-btn {
      display: inline-block;
      background: #5865F2;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 800;
      font-size: 13px;
      letter-spacing: 0.5px;
      padding: 10px 24px;
      border-radius: 8px;
      margin-top: 10px;
      box-shadow: 0 4px 12px rgba(88, 101, 242, 0.35);
    }
    .footer {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding: 24px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
    }
    .footer a {
      color: #10b981;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="badge">⚔️ BATTLEXA OFFICIAL NOTIFICATION</div>
      <h1>${params.title}</h1>
    </div>

    <div class="content">
      <div class="greeting">
        Hey <strong>${params.username}</strong>,
      </div>

      <div class="tournament-banner">
        <h2 class="tournament-title">${params.tournamentTitle}</h2>
        <div class="tournament-meta">
          <span>🎮 <strong>Game:</strong> ${params.gameName}</span>
          <span>👥 <strong>Format:</strong> ${params.format}</span>
        </div>
      </div>

      <div class="message-card">
        <div class="message-title">📢 Notice Details</div>
        <p class="message-body">${params.message}</p>
      </div>

      ${
        isCredentials
          ? `
      <div class="creds-box">
        <div class="creds-title">🔐 Official Match Room Access</div>
        <div class="creds-grid">
          <div class="creds-row">
            <div class="creds-cell">
              <div class="cred-label">Room ID</div>
              <div class="cred-val">${params.credentials?.roomId || "TBA"}</div>
            </div>
            <div class="creds-cell">
              <div class="cred-label">Password</div>
              <div class="cred-val">${params.credentials?.password || "None"}</div>
            </div>
          </div>
        </div>
        ${
          params.slotNumber
            ? `<div class="slot-tag">🎯 Your Assigned Slot: Slot #${params.slotNumber}</div>`
            : ""
        }
        ${
          params.credentials?.notes
            ? `<div class="notes">⚠️ Instructions: ${params.credentials.notes}</div>`
            : `<div class="notes">⚠️ Sit strictly in your designated slot number. Non-registered players will be kicked.</div>`
        }
      </div>
      `
          : ""
      }

      <div class="button-container">
        <a href="${roomUrl}" class="cta-button" target="_blank">
          Enter Tournament Arena Room &rarr;
        </a>
      </div>

      <div class="discord-invite-card">
        <div style="font-size: 13px; font-weight: 800; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.5px;">
          👾 Join Official Discord Community
        </div>
        <p style="font-size: 12px; color: #94a3b8; margin: 6px 0 10px 0; line-height: 1.5;">
          Not in our Discord server yet? Join now for live team voice lobbies, referee disputes, and instant scrim ping alerts!
        </p>
        <a href="${discordInviteUrl}" class="discord-btn" target="_blank">
          Join BATTLEXA Discord Server &rarr;
        </a>
      </div>
    </div>

    <div class="footer">
      <p>This message was dispatched to registered gladiators for <strong>${params.tournamentTitle}</strong>.</p>
      <p>© 2026 BATTLEXA Esports Arena • Fair Play & Anti-Cheat Verified Platform.</p>
    </div>
  </div>
</body>
</html>
`;
}

export async function sendTournamentNotificationEmail(
  payload: TournamentEmailPayload
): Promise<{ sent: number; failed: number; logs: string[] }> {
  const transporter = getEmailTransporter();
  const fromEmail = process.env.SMTP_FROM || `"BATTLEXA Arena" <notifications@battlexa.gg>`;
  const logs: string[] = [];
  let sent = 0;
  let failed = 0;

  for (const recipient of payload.recipients) {
    if (!recipient.email || !recipient.email.includes("@")) {
      continue;
    }

    const htmlContent = generateTournamentEmailHtml({
      username: recipient.username,
      slotNumber: recipient.slotNumber,
      tournamentTitle: payload.tournamentTitle,
      tournamentId: payload.tournamentId,
      gameName: payload.gameName,
      format: payload.format,
      startTime: payload.startTime,
      title: payload.title,
      message: payload.message,
      credentials: payload.credentials,
    });

    if (transporter) {
      try {
        await transporter.sendMail({
          from: fromEmail,
          to: recipient.email,
          subject: `[BATTLEXA] ${payload.title} - ${payload.tournamentTitle}`,
          html: htmlContent,
        });
        sent++;
        logs.push(`Email delivered to ${recipient.email} (${recipient.username})`);
      } catch (err: unknown) {
        failed++;
        const msg = err instanceof Error ? err.message : String(err);
        logs.push(`Failed to send email to ${recipient.email}: ${msg}`);
        console.error("Nodemailer error:", msg);
      }
    } else {
      // Development mode simulation - logs complete dispatch without failing
      sent++;
      logs.push(
        `[Dev Mailer Simulated] Sent to ${recipient.email} (Subject: ${payload.title} - ${payload.tournamentTitle})`
      );

      // Save local HTML preview for browser testing
      try {
        const fs = await import("fs");
        const path = await import("path");
        const previewPath = path.join(process.cwd(), "public", "email-preview.html");
        fs.writeFileSync(previewPath, htmlContent, "utf-8");
        logs.push(`HTML Email preview written to /email-preview.html (view at http://localhost:3000/email-preview.html)`);
      } catch {
        // Non-fatal
      }
    }
  }

  return { sent, failed, logs };
}
