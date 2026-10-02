import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Tournament, Game, OrganizerProfile, User } from "@/lib/db/models";
import { getSession } from "@/lib/auth/session";
import { CreateTournamentSchema } from "@/lib/validations/tournament";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const game = searchParams.get("game");
    const format = searchParams.get("format");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const organizerId = searchParams.get("organizerId");
    const isFeatured = searchParams.get("isFeatured");
    const sortBy = searchParams.get("sortBy") || "upcoming";
    const limit = parseInt(searchParams.get("limit") || "30", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (game && game !== "all") {
      query.gameSlug = game;
    }
    if (format && format !== "all") {
      query.format = format;
    }
    if (type && type !== "all") {
      query.type = type;
    }
    if (status && status !== "all") {
      query.status = status;
    }
    if (organizerId) {
      query.organizerId = organizerId;
    }
    if (isFeatured === "true") {
      query.isFeatured = true;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { rules: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sort: any = { startTime: 1 };
    if (sortBy === "prize_high") sort = { prizePool: -1 };
    if (sortBy === "entry_low") sort = { entryFee: 1 };
    if (sortBy === "slots") sort = { registeredSlots: -1 };

    const total = await Tournament.countDocuments(query);
    const tournaments = await Tournament.find(query)
      .populate("organizerId", "username")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const formatted = tournaments.map((t) => ({
      ...t,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      organizerName: (t.organizerId as any)?.username || "BATTLEXA Host",
      roomCredentials: {
        releaseTime: t.roomCredentials?.releaseTime,
        released: t.roomCredentials?.released,
        // Notice: do NOT expose raw roomId or password in public tournament lists!
      },
    }));

    return NextResponse.json({
      tournaments: formatted,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Fetch tournaments error:", error);
    const message = error instanceof Error ? error.message : "Error fetching tournaments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const org = await OrganizerProfile.findOne({ userId: session.id });
    const isApprovedOrg = Boolean(org && (org.status === "APPROVED" || org.verifiedByAdmin));
    const isAuthorized = session.role === "ADMIN" || session.role === "ORGANIZER" || isApprovedOrg;

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Only verified organizers or admins can host tournaments" },
        { status: 403 }
      );
    }

    // Verify organizer approval status if not admin
    if (session.role !== "ADMIN") {
      if (!org || (!org.verifiedByAdmin && org.status !== "APPROVED")) {
        return NextResponse.json(
          {
            error:
              "Organizer account is pending admin verification before you can publish tournaments.",
          },
          { status: 403 }
        );
      }

      // Ensure user document in DB is set to ORGANIZER role
      await User.findByIdAndUpdate(session.id, { role: "ORGANIZER" });
    }

    const body = await req.json();
    const validated = CreateTournamentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const {
      title,
      gameSlug,
      format,
      type,
      entryFee,
      prizePool,
      maxSlots,
      startTime,
      registrationDeadline,
      rules,
      bannerUrl,
      streamUrl,
      region,
    } = validated.data;

    // Find or create game
    let gameDoc = await Game.findOne({ slug: gameSlug });
    if (!gameDoc) {
      const isFF = gameSlug === "free-fire-max";
      gameDoc = await Game.create({
        name: isFF ? "Free Fire MAX" : "Battlegrounds Mobile India (BGMI)",
        slug: gameSlug,
        developer: isFF ? "Garena" : "Krafton",
        idFormatLabel: isFF ? "Free Fire UID" : "BGMI Character ID",
        supportedFormats: ["SOLO", "DUO", "SQUAD"],
      });
    }

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
    const startDateTime = new Date(startTime);
    const releaseTime = new Date(startDateTime.getTime() - 15 * 60 * 1000); // 15 mins before start

    // Prize breakdown default (Winner 50%, 2nd 30%, 3rd 20%)
    const prizeBreakdown =
      prizePool > 0
        ? [
            { rank: 1, percentage: 50, amount: Math.round(prizePool * 0.5) },
            { rank: 2, percentage: 30, amount: Math.round(prizePool * 0.3) },
            { rank: 3, percentage: 20, amount: Math.round(prizePool * 0.2) },
          ]
        : [];

    const tournament = await Tournament.create({
      title,
      slug,
      organizerId: session.id,
      gameId: gameDoc._id,
      gameName: gameDoc.name,
      gameSlug: gameDoc.slug,
      format,
      type,
      entryFee,
      prizePool,
      prizeBreakdown,
      maxSlots,
      registeredSlots: 0,
      status: "REGISTRATION_OPEN",
      startTime: startDateTime,
      registrationDeadline: new Date(registrationDeadline),
      roomCredentials: {
        roomId: "",
        password: "",
        releaseTime,
        released: false,
      },
      rules,
      bannerUrl: bannerUrl || "",
      streamUrl: streamUrl || "",
      region,
      isPractice: type === "PRACTICE",
    });

    // Update organizer hosted count
    await OrganizerProfile.findOneAndUpdate(
      { userId: session.id },
      { $inc: { tournamentsHosted: 1 } }
    );

    return NextResponse.json(
      { message: "Tournament created successfully", tournament },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Tournament creation error:", error);
    const message = error instanceof Error ? error.message : "Error creating tournament";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
