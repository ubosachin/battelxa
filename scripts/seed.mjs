import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/battlexa";

async function seed() {
  console.log("Connecting to MongoDB for BATTLEXA seeding...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB successfully.");

  const db = mongoose.connection.db;

  // Clear existing collections for a clean, deterministic seed
  console.log("Cleaning old test collections...");
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    await db.collection(col.name).deleteMany({});
  }

  console.log("Seeding Games...");
  const gamesCol = db.collection("games");
  const ffGame = await gamesCol.insertOne({
    name: "Free Fire MAX",
    slug: "free-fire-max",
    developer: "Garena",
    category: "Battle Royale",
    icon: "/games/free-fire-icon.svg",
    banner: "/games/free-fire-max.svg",
    supportedFormats: ["SOLO", "DUO", "SQUAD"],
    defaultMaxSlots: 48,
    idFormatLabel: "Free Fire UID",
    isActive: true,
    defaultRules: "Standard competitive battle royale. No PC emulators allowed. Minimum account level 20.",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const bgmiGame = await gamesCol.insertOne({
    name: "Battlegrounds Mobile India (BGMI)",
    slug: "bgmi",
    developer: "Krafton",
    category: "Battle Royale",
    icon: "/games/bgmi-icon.svg",
    banner: "/games/bgmi.svg",
    supportedFormats: ["SOLO", "DUO", "SQUAD"],
    defaultMaxSlots: 25,
    idFormatLabel: "BGMI Character ID",
    isActive: true,
    defaultRules: "BGIS competitive ruleset. Mobile devices only. Scorecard screenshot mandatory.",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Seeding Users...");
  const usersCol = db.collection("users");
  const walletsCol = db.collection("wallets");
  const playerProfilesCol = db.collection("playerprofiles");
  const organizerProfilesCol = db.collection("organizerprofiles");

  // Admin
  const adminPassHash = await bcrypt.hash("BattlexaSuperAdminPass2026!", 12);
  const adminUser = await usersCol.insertOne({
    email: "admin@battlexa.gg",
    username: "BattlexaAdmin",
    passwordHash: adminPassHash,
    role: "ADMIN",
    isVerified: true,
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Organizer
  const hostPassHash = await bcrypt.hash("BattlexaHost2026!", 12);
  const hostUser = await usersCol.insertOne({
    email: "organizer@battlexa.gg",
    username: "VortexHost",
    passwordHash: hostPassHash,
    role: "ORGANIZER",
    isVerified: true,
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await organizerProfilesCol.insertOne({
    userId: hostUser.insertedId,
    organizationName: "Vortex Esports India",
    description: "Premier verified tournament organizers for Free Fire MAX and BGMI national championships.",
    verifiedByAdmin: true,
    status: "APPROVED",
    tournamentsHosted: 24,
    totalPrizeDistributed: 150000,
    rating: 4.9,
    upiId: "vortexhost@okhdfcbank",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await walletsCol.insertOne({
    userId: hostUser.insertedId,
    balance: 5000,
    lockedBalance: 0,
    currency: "INR",
    totalDeposited: 0,
    totalWon: 0,
    totalWithdrawn: 10000,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Player
  const playerPassHash = await bcrypt.hash("BattlexaPlayer2026!", 12);
  const playerUser = await usersCol.insertOne({
    email: "player@battlexa.gg",
    username: "ShadowSniper",
    passwordHash: playerPassHash,
    role: "PLAYER",
    isVerified: true,
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await playerProfilesCol.insertOne({
    userId: playerUser.insertedId,
    gamerTag: "SHADOW_STRIKE",
    freeFireId: "1928475920",
    bgmiId: "5183920194",
    bio: "Semi-pro sniper and fragger. Competing in Tier 1 Free Fire MAX and BGMI cups.",
    matchesPlayed: 28,
    matchesWon: 9,
    totalKills: 142,
    earnings: 6500,
    rankTitle: "Master Contender",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await walletsCol.insertOne({
    userId: playerUser.insertedId,
    balance: 450, // ₹450 test balance for instant tournament registrations
    lockedBalance: 0,
    currency: "INR",
    totalDeposited: 500,
    totalWon: 2500,
    totalWithdrawn: 2000,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Seeding Squad Team...");
  const teamsCol = db.collection("teams");
  const squad = await teamsCol.insertOne({
    name: "Shadow Gladiators",
    tag: "SHDW",
    leaderId: playerUser.insertedId,
    game: "FREE_FIRE_MAX",
    joinCode: "SHDW99",
    members: [
      {
        userId: playerUser.insertedId,
        role: "LEADER",
        inGameName: "SHADOW_STRIKE",
        inGameId: "1928475920",
        joinedAt: new Date(),
      },
    ],
    matchesPlayed: 12,
    matchesWon: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Seeding Tournaments...");
  const tournamentsCol = db.collection("tournaments");
  const registrationsCol = db.collection("registrations");

  const now = new Date();

  // 1. FF MAX Squad Cash Tournament (Kickoff in 3 hours)
  const ffTourney = await tournamentsCol.insertOne({
    title: "Free Fire MAX Bermuda Warzone Masters",
    slug: "free-fire-max-bermuda-warzone-masters-2026",
    organizerId: hostUser.insertedId,
    gameId: ffGame.insertedId,
    gameName: "Free Fire MAX",
    gameSlug: "free-fire-max",
    format: "SQUAD",
    type: "PAID",
    entryFee: 100,
    prizePool: 5000,
    prizeBreakdown: [
      { rank: 1, percentage: 50, amount: 2500 },
      { rank: 2, percentage: 30, amount: 1500 },
      { rank: 3, percentage: 20, amount: 1000 },
    ],
    maxSlots: 12,
    registeredSlots: 1,
    status: "REGISTRATION_OPEN",
    startTime: new Date(now.getTime() + 3 * 60 * 60 * 1000),
    registrationDeadline: new Date(now.getTime() + 2 * 60 * 60 * 1000),
    roomCredentials: {
      roomId: "8492019",
      password: "ffmax",
      releaseTime: new Date(now.getTime() - 5 * 60 * 1000), // unlocked for demonstration testing
      released: true,
      notes: "Squads sit in your slot number. Game starts at exact scheduled time.",
    },
    rules: "1. No emulator or PC players.\n2. Flare guns and air drops are permitted.\n3. Screen recording or screenshot of end screen mandatory.",
    region: "India (South Asia)",
    isFeatured: true,
    isPractice: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Seed registration of demo player into FF Tourney
  await registrationsCol.insertOne({
    tournamentId: ffTourney.insertedId,
    userId: playerUser.insertedId,
    teamId: squad.insertedId,
    teamName: "Shadow Gladiators",
    teamTag: "SHDW",
    registrationType: "SQUAD",
    members: [
      {
        userId: playerUser.insertedId,
        gamerTag: "SHADOW_STRIKE",
        inGameId: "1928475920",
      },
    ],
    slotNumber: 1,
    paymentStatus: "COMPLETED",
    status: "CONFIRMED",
    registeredAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 2. BGMI Pro Scrims (Check-In open)
  const bgmiTourney = await tournamentsCol.insertOne({
    title: "BGMI Erangel Elite Scrims - Tier 1",
    slug: "bgmi-erangel-elite-scrims-tier1-2026",
    organizerId: hostUser.insertedId,
    gameId: bgmiGame.insertedId,
    gameName: "Battlegrounds Mobile India (BGMI)",
    gameSlug: "bgmi",
    format: "SQUAD",
    type: "PAID",
    entryFee: 200,
    prizePool: 12000,
    prizeBreakdown: [
      { rank: 1, percentage: 50, amount: 6000 },
      { rank: 2, percentage: 30, amount: 3600 },
      { rank: 3, percentage: 20, amount: 2400 },
    ],
    maxSlots: 25,
    registeredSlots: 18,
    status: "CHECK_IN",
    startTime: new Date(now.getTime() + 45 * 60 * 1000),
    registrationDeadline: new Date(now.getTime() - 10 * 60 * 1000),
    roomCredentials: {
      roomId: "5910294",
      password: "bgmi",
      releaseTime: new Date(now.getTime() + 30 * 60 * 1000),
      released: false,
      notes: "Slot #1 to #25 reserved for registered teams.",
    },
    rules: "BGIS official point table: 1st=10, 2nd=6, 3rd=5, 4th=4, 5th=3 + 1/finish.",
    region: "India (South Asia)",
    isFeatured: true,
    isPractice: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 3. Free Practice Scrim
  await tournamentsCol.insertOne({
    title: "Free Fire MAX Daily Practice Scrims #44",
    slug: "ff-max-daily-practice-scrims-44",
    organizerId: hostUser.insertedId,
    gameId: ffGame.insertedId,
    gameName: "Free Fire MAX",
    gameSlug: "free-fire-max",
    format: "SOLO",
    type: "FREE",
    entryFee: 0,
    prizePool: 500,
    prizeBreakdown: [{ rank: 1, percentage: 100, amount: 500 }],
    maxSlots: 48,
    registeredSlots: 32,
    status: "REGISTRATION_OPEN",
    startTime: new Date(now.getTime() + 6 * 60 * 60 * 1000),
    registrationDeadline: new Date(now.getTime() + 5 * 60 * 60 * 1000),
    roomCredentials: {
      roomId: "",
      password: "",
      releaseTime: new Date(now.getTime() + 5.75 * 60 * 60 * 1000),
      released: false,
    },
    rules: "Beginner and intermediate practice cup. Winner receives ₹500 arena wallet bonus.",
    region: "India (South Asia)",
    isFeatured: false,
    isPractice: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Seeding Initial Notifications...");
  const notificationsCol = db.collection("notifications");
  await notificationsCol.insertMany([
    {
      userId: playerUser.insertedId,
      title: "Welcome to BATTLEXA! ⚔️",
      message: "Your contender profile is live with a ₹450 arena wallet balance.",
      type: "SYSTEM",
      link: "/player/dashboard",
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId: playerUser.insertedId,
      title: "Room Credentials Released! 🔓",
      message: "Room ID & password for Bermuda Warzone Masters are now accessible in your vault.",
      type: "ROOM_CREDENTIALS",
      link: `/tournaments/${ffTourney.insertedId}`,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log("\n========================================================");
  console.log(" BATTLEXA DATABASE SEEDED SUCCESSFULLY!");
  console.log("========================================================");
  console.log("Demo Accounts Created:");
  console.log("1. ADMIN:     admin@battlexa.gg     / BattlexaSuperAdminPass2026!");
  console.log("2. ORGANIZER: organizer@battlexa.gg / BattlexaHost2026!");
  console.log("3. PLAYER:    player@battlexa.gg    / BattlexaPlayer2026!");
  console.log("========================================================\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
