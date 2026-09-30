import { SignJWT, jwtVerify } from "jose";
import { SessionUser, UserRole } from "./roles";

const JWT_SECRET = process.env.JWT_SECRET || "battlexa_super_secret_jwt_encryption_key_change_in_production_32chars!";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export async function signToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    isVerifiedOrganizer: user.isVerifiedOrganizer,
    avatar: user.avatar,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || "7d")
    .sign(encodedKey);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey);
    return {
      id: payload.id as string,
      email: payload.email as string,
      username: payload.username as string,
      role: payload.role as UserRole,
      isVerifiedOrganizer: payload.isVerifiedOrganizer as boolean | undefined,
      avatar: payload.avatar as string | undefined,
    };
  } catch {
    return null;
  }
}
