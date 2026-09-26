import { cookies } from "next/headers";
import { TokenPayload, verifyToken } from "./jwt";

const TOKEN_COOKIE_NAME = "saferide-token";

export async function setTokenCookie(token: string, maxAgeSeconds: number = 7 * 24 * 60 * 60) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: maxAgeSeconds,
    path: "/",
    sameSite: "lax",
  });
}

export async function getTokenCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME);
  return token?.value ?? null;
}

export async function clearTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  const token = await getTokenCookie();
  if (!token) return null;
  return verifyToken(token);
}

export async function getAuthenticatedUser(): Promise<TokenPayload | null> {
  const token = await getTokenCookie();
  if (!token) return null;
  return verifyToken(token);
}
