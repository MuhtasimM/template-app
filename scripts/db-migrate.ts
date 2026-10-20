// Applies the migrations in drizzle/ that haven't run on this database yet.
// Runs from `vp run db:migrate`, `vp run setup`, and after every Vercel build.
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local (for example on Vercel): use the environment.
}

const url = process.env.DATABASE_URL;

if (!url) {
  console.log("No DATABASE_URL. Skipping migrations.");
  process.exit(0);
}

// Preview deployments often share the production database. Only production
// deployments change it, so a branch can't alter live tables before it's merged.
if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
  console.log(`Vercel ${process.env.VERCEL_ENV} deployment. Skipping migrations.`);
  process.exit(0);
}

const client = postgres(url, { max: 1, prepare: false, onnotice: () => {} });

try {
  await migrate(drizzle({ client }), { migrationsFolder: "drizzle" });
  console.log("✓ Database is up to date");
} catch (error) {
  console.error("✗ Migration failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end();
}
