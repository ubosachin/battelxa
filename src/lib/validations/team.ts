import { z } from "zod";

export const TEAM_EMBLEMS = [
  "dragon",
  "falcon",
  "wolf",
  "tiger",
  "viper",
  "skull",
] as const;

export const CreateTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Squad name must be at least 3 characters")
    .max(30, "Squad name cannot exceed 30 characters"),
  tag: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, "Clan tag must be at least 2 characters")
    .max(6, "Clan tag cannot exceed 6 characters")
    .regex(/^[A-Z0-9]+$/, "Clan tag must only contain letters and numbers"),
  game: z.enum(["FREE_FIRE_MAX", "BGMI"], {
    message: "Game must be either FREE_FIRE_MAX or BGMI",
  }),
  bio: z
    .string()
    .trim()
    .max(200, "Bio cannot exceed 200 characters")
    .optional()
    .default(""),
  logo: z.enum(TEAM_EMBLEMS).optional().default("dragon"),
  isOpenRecruiting: z.boolean().optional().default(true),
});

export const JoinTeamSchema = z.object({
  joinCode: z
    .string()
    .trim()
    .toUpperCase()
    .length(6, "Join code must be exactly 6 characters")
    .regex(/^[A-Z0-9]{6}$/, "Invalid join code format"),
});

export const UpdateTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Squad name must be at least 3 characters")
    .max(30, "Squad name cannot exceed 30 characters")
    .optional(),
  tag: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, "Clan tag must be at least 2 characters")
    .max(6, "Clan tag cannot exceed 6 characters")
    .regex(/^[A-Z0-9]+$/, "Clan tag must only contain letters and numbers")
    .optional(),
  bio: z.string().trim().max(200).optional(),
  logo: z.enum(TEAM_EMBLEMS).optional(),
  isOpenRecruiting: z.boolean().optional(),
});

export const UpdateMemberRoleSchema = z.object({
  role: z.enum(["LEADER", "CO_LEADER", "MEMBER"], {
    message: "Invalid squad role",
  }),
});
