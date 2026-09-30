import { TournamentStatus } from "../db/models/Tournament";

const VALID_TRANSITIONS: Record<TournamentStatus, TournamentStatus[]> = {
  DRAFT: ["PUBLISHED", "CANCELLED"],
  PUBLISHED: ["REGISTRATION_OPEN", "CANCELLED"],
  REGISTRATION_OPEN: ["REGISTRATION_CLOSED", "CANCELLED"],
  REGISTRATION_CLOSED: ["CHECK_IN", "LIVE", "CANCELLED"],
  CHECK_IN: ["LIVE", "CANCELLED"],
  LIVE: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function isValidTournamentTransition(
  currentStatus: TournamentStatus,
  targetStatus: TournamentStatus
): boolean {
  if (currentStatus === targetStatus) return true;
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
}

export function canAccessRoomCredentials(
  releaseTime: Date | string,
  isRegistered: boolean,
  tournamentStatus: TournamentStatus
): { canAccess: boolean; reason?: string } {
  if (!isRegistered) {
    return { canAccess: false, reason: "You must be registered to view room credentials." };
  }

  if (["CANCELLED", "DRAFT"].includes(tournamentStatus)) {
    return { canAccess: false, reason: "Tournament is not active." };
  }

  const releaseDate = typeof releaseTime === "string" ? new Date(releaseTime) : releaseTime;
  const now = new Date();

  if (now.getTime() < releaseDate.getTime()) {
    const diffMin = Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60));
    return {
      canAccess: false,
      reason: `Room credentials will be unlocked ${diffMin} minute(s) before match start.`,
    };
  }

  return { canAccess: true };
}
