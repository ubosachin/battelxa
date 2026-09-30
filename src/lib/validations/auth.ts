import { z } from "zod";

export const RegisterSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
  role: z.enum(["PLAYER", "ORGANIZER"]).default("PLAYER"),
  gamerTag: z.string().min(2, "Gamer tag is required").max(30).optional(),
  freeFireId: z.string().max(30).optional(),
  bgmiId: z.string().max(30).optional(),
  organizationName: z.string().max(100).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const UpdateProfileSchema = z.object({
  gamerTag: z.string().min(2).max(30).optional(),
  freeFireId: z.string().max(30).optional(),
  bgmiId: z.string().max(30).optional(),
  bio: z.string().max(300).optional(),
  phone: z.string().max(15).optional(),
  discordHandle: z.string().max(50).optional(),
  avatar: z.string().url().optional().or(z.literal("")),
});
