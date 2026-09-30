export type UserRole = "PLAYER" | "ORGANIZER" | "ADMIN";

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  isVerifiedOrganizer?: boolean;
  avatar?: string;
  isOnboarded?: boolean;
}

export const ROLES = {
  PLAYER: "PLAYER" as const,
  ORGANIZER: "ORGANIZER" as const,
  ADMIN: "ADMIN" as const,
};

export function hasRole(userRole: UserRole, targetRole: UserRole): boolean {
  if (userRole === "ADMIN") return true;
  if (userRole === "ORGANIZER" && targetRole === "PLAYER") return true;
  return userRole === targetRole;
}
