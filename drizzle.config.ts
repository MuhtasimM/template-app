import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local yet: fall back to the environment.
}

// `vp run db:generate` only reads the schema, so it works without a database.
// Migrations run through scripts/db-migrate.ts, not drizzle-kit.
export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
