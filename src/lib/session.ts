import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { env } from "./env";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function sign(value: string) {
  const { SESSION_SECRET, APP_PASSWORD } = env();
  // Signing with the password too means changing APP_PASSWORD logs everyone out.
  return createHmac("sha256", SESSION_SECRET)
    .update(`${value}:${APP_PASSWORD}`)
    .digest("base64url");
}

function safeEqual(a: string, b: string) {
  // Hash first so both buffers have the same length for timingSafeEqual.
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export function checkPassword(password: string) {
  return safeEqual(password, env().APP_PASSWORD);
}

export function createSessionToken(now = Date.now()) {
  const expiresAt = String(now + SESSION_MAX_AGE_SECONDS * 1000);
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function isValidSessionToken(token: string | undefined, now = Date.now()) {
  if (!token) return false;
  const [expiresAt, signature, ...rest] = token.split(".");
  if (!expiresAt || !signature || rest.length > 0) return false;
  if (!safeEqual(signature, sign(expiresAt))) return false;
  return Number(expiresAt) > now;
}

export async function hasSession() {
  // The check depends on the current time, so it must run on every request.
  await connection();
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

// Call at the start of every server action and data read in the protected area.
// The proxy only redirects pages; this is what keeps the data safe.
export async function requireSession() {
  if (!(await hasSession())) redirect("/login");
}
