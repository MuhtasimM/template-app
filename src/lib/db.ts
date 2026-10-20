import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

import { env } from "./env";

type Db = ReturnType<typeof drizzle<typeof schema>>;

let db: Db | undefined;

// Returns null until DATABASE_URL is set, so the rest of the app still works.
// On Supabase, use the transaction pooler URL (port 6543). It doesn't support
// prepared statements, hence `prepare: false`.
export function getDb() {
  const url = env().DATABASE_URL;
  if (!url) return null;
  db ??= drizzle({ client: postgres(url, { prepare: false, max: 5 }), schema });
  return db;
}
