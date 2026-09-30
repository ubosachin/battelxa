import { z } from "zod";

export const CreateTournamentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  gameSlug: z.enum(["free-fire-max", "bgmi"]),
  format: z.enum(["SOLO", "DUO", "SQUAD"]),
  type: z.enum(["FREE", "PAID", "PRACTICE"]),
  entryFee: z.number().min(0, "Entry fee cannot be negative"),
  prizePool: z.number().min(0, "Prize pool cannot be negative"),
  maxSlots: z.number().min(2, "Minimum 2 slots required").max(100),
  startTime: z.string().datetime("Start time must be a valid ISO date"),
  registrationDeadline: z.string().datetime("Registration deadline must be a valid ISO date"),
  rules: z.string().min(10, "Rules must be specified"),
  bannerUrl: z.string().optional(),
  streamUrl: z.string().url().optional().or(z.literal("")),
  region: z.string().default("India (South Asia)"),
});

export const RegisterTournamentSchema = z.object({
  tournamentId: z.string().min(1, "Tournament ID is required"),
  registrationType: z.enum(["SOLO", "DUO", "SQUAD"]),
  teamId: z.string().optional(),
  members: z
    .array(
      z.object({
        userId: z.string(),
        gamerTag: z.string(),
        inGameId: z.string(),
      })
    )
    .min(1),
  useWallet: z.boolean().default(true),
});

export const UpdateRoomCredentialsSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  password: z.string().optional(),
  releaseMinutesBeforeStart: z.number().min(1).max(120).default(15),
  notes: z.string().optional(),
});

export const SubmitMatchResultSchema = z.object({
  matchId: z.string().min(1),
  tournamentId: z.string().min(1),
  results: z.array(
    z.object({
      teamOrUserId: z.string(),
      participantName: z.string(),
      isTeam: z.boolean().default(false),
      rank: z.number().min(1),
      kills: z.number().min(0),
      placementPoints: z.number().default(0),
      killPoints: z.number().default(0),
      totalPoints: z.number(),
      prizeAwarded: z.number().default(0),
    })
  ),
  evidenceUrl: z.string().optional(),
  notes: z.string().optional(),
});

export const SubmitDisputeSchema = z.object({
  tournamentId: z.string().min(1),
  matchId: z.string().optional(),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  evidenceUrls: z.array(z.string()).min(1, "At least one screenshot or evidence URL is required"),
});
