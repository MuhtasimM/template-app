import "server-only";

import { cookies } from "next/headers";
import { z } from "zod";

// The name people sign posts and comments with, kept in a cookie so the
// server can read it. It's a label, not a login: anyone can change it.
export const NAME_COOKIE = "name";
export const NAME_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const nameSchema = z
  .string()
  .trim()
  .min(1, "Add your name")
  .max(50, "Keep it under 50 characters");

export async function getName() {
  const cookieStore = await cookies();
  const parsed = nameSchema.safeParse(cookieStore.get(NAME_COOKIE)?.value ?? "");
  return parsed.success ? parsed.data : null;
}
