import { cookies } from "next/headers";

const SCHOOL_COOKIE_NAME = "saferide-school";

export async function setSchoolCookie(schoolId: string, maxAgeSeconds: number = 30 * 24 * 60 * 60) {
  const cookieStore = await cookies();
  cookieStore.set(SCHOOL_COOKIE_NAME, schoolId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: maxAgeSeconds,
    path: "/",
    sameSite: "lax",
  });
}

export async function getSchoolCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const school = cookieStore.get(SCHOOL_COOKIE_NAME);
  return school?.value ?? null;
}

export async function clearSchoolCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SCHOOL_COOKIE_NAME);
}