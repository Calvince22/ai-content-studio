import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "auth_token";

function getSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return new TextEncoder().encode(secret);
}

export async function signToken(user: { id: string; email: string }) {
  return new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());

  return payload as JWTPayload & { email?: string; sub?: string };
}

export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE, token, getCookieOptions());
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.delete(AUTH_COOKIE);
}

export async function getAuthenticatedUser(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyToken(token);

    if (!payload.sub || !payload.email) {
      return null;
    }

    return {
      id: payload.sub,
      email: String(payload.email),
    };
  } catch {
    return null;
  }
}
