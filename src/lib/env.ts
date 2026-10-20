import "server-only";

import { z } from "zod";

// Server-only secrets. `server-only` makes the build fail if a client component
// imports this file. Never prefix these with NEXT_PUBLIC_: Next.js copies every
// NEXT_PUBLIC_ variable into the browser code.
const schema = z.object({
  APP_PASSWORD: z.string().min(4, "APP_PASSWORD must be at least 4 characters"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
  // Optional so the app runs before a database is connected.
  DATABASE_URL: z.url().optional(),
});

export function env() {
  const result = schema.safeParse({
    APP_PASSWORD: process.env.APP_PASSWORD || undefined,
    SESSION_SECRET: process.env.SESSION_SECRET || undefined,
    DATABASE_URL: process.env.DATABASE_URL || undefined,
  });
  if (!result.success) {
    const problems = result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`,
    );
    throw new Error(
      `Environment variables are missing or invalid (see .env.example):\n${problems.join("\n")}`,
    );
  }
  return result.data;
}
