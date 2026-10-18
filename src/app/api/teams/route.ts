import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { Team, PlayerProfile } from "@/lib/db/models";
import { CreateTeamSchema } from "@/lib/validations/team";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") || "all";
    const game = searchParams.get("game");
    const search = searchParams.get("search");

    // My Teams (teams where user is leader or member)
    const myTeams = await Team.find({
      $or: [{ leaderId: session.id }, { "members.userId": session.id }],
    })
      .sort({ updatedAt: -1 })
      .lean();

    // Public Open Teams (for squad discovery)
    let publicTeams: unknown[] = [];
    if (scope === "all" || scope === "public") {
      const publicQuery: Record<string, unknown> = {
        isOpenRecruiting: true,
        "members.userId": { $ne: session.id },
        $expr: { $lt: [{ $size: "$members" }, 5] },
      };

      if (game && (game === "FREE_FIRE_MAX" || game === "BGMI")) {
        publicQuery.game = game;
      }

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        publicQuery.$or = [{ name: regex }, { tag: regex }];
      }

      publicTeams = await Team.find(publicQuery)
        .sort({ updatedAt: -1 })
        .limit(30)
        .lean();
    }

    return NextResponse.json({
      teams: myTeams,
      publicTeams,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching teams";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    const parsed = CreateTeamSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid team inputs" },
        { status: 400 }
      );
    }

    const { name, tag, game, bio, logo, isOpenRecruiting } = parsed.data;

    await connectToDatabase();

    // 1. Check if user already leads 5 squads
    const ledCount = await Team.countDocuments({ leaderId: session.id });
    if (ledCount >= 5) {
      return NextResponse.json(
        { error: "You can create a maximum of 5 squads as Captain. Disband an unused squad first." },
        { status: 400 }
      );
    }

    // 2. Check if team name or tag is already taken
    const existingTeam = await Team.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${name.trim()}$`, "i") } },
        { tag: tag.toUpperCase() },
      ],
    });

    if (existingTeam) {
      if (existingTeam.tag.toUpperCase() === tag.toUpperCase()) {
        return NextResponse.json(
          { error: `Clan tag [${tag}] is already claimed by another squad. Choose a different tag.` },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: `Squad name "${name}" is already registered. Please choose another name.` },
        { status: 409 }
      );
    }

    // Fetch player profile for accurate in-game credentials
    const profile = await PlayerProfile.findOne({ userId: session.id });
    const inGameId =
      (game === "FREE_FIRE_MAX" ? profile?.freeFireId : profile?.bgmiId) ||
      body.inGameId ||
      "ID_PENDING";
    const inGameName = profile?.gamerTag || body.inGameName || session.username;

    // Generate unique 6-character uppercase join code
    let joinCode = "";
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const codeExists = await Team.findOne({ joinCode });
      if (!codeExists) {
        isUnique = true;
      }
      attempts++;
    }

    const team = await Team.create({
      name,
      tag: tag.toUpperCase(),
      leaderId: session.id,
      game,
      bio: bio || "",
      logo: logo || "dragon",
      isOpenRecruiting: isOpenRecruiting ?? true,
      joinCode,
      members: [
        {
          userId: session.id,
          role: "LEADER",
          inGameName,
          inGameId,
          joinedAt: new Date(),
        },
      ],
    });

    return NextResponse.json(
      { message: "Esports squad assembled successfully!", team },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Team creation error:", error);
    const message = error instanceof Error ? error.message : "Error creating team";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
