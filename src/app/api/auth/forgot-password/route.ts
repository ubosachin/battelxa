import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/lib/db/models";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond with success to avoid account enumeration
    if (!user) {
      return NextResponse.json({
        message: "If an account exists with this email, recovery instructions have been sent.",
      });
    }

    // In production, dispatch password reset token via AgentMail / SMTP
    return NextResponse.json({
      message: "If an account exists with this email, recovery instructions have been sent.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error processing request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
