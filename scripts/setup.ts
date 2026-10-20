// Prepares .env.local and the database. Safe to run more than once.
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";

const ENV_FILE = ".env.local";

if (!existsSync(ENV_FILE)) {
  copyFileSync(".env.example", ENV_FILE);
  console.log(`Created ${ENV_FILE} from .env.example`);
}

let content = readFileSync(ENV_FILE, "utf8");

function read(name: string) {
  return (
    content
      .match(new RegExp(`^${name}=(.*)$`, "m"))?.[1]
      ?.trim()
      .replace(/^"|"$/g, "") ?? ""
  );
}

if (read("SESSION_SECRET").length < 32) {
  const secret = randomBytes(32).toString("base64url");
  content = /^SESSION_SECRET=/m.test(content)
    ? content.replace(/^SESSION_SECRET=.*$/m, `SESSION_SECRET=${secret}`)
    : `${content.trimEnd()}\nSESSION_SECRET=${secret}\n`;
  writeFileSync(ENV_FILE, content);
  console.log("Generated SESSION_SECRET");
}

// A simple default for local use. Choose a stronger one before deploying.
if (!read("APP_PASSWORD")) {
  content = /^APP_PASSWORD=/m.test(content)
    ? content.replace(/^APP_PASSWORD=.*$/m, "APP_PASSWORD=test")
    : `${content.trimEnd()}\nAPP_PASSWORD=test\n`;
  writeFileSync(ENV_FILE, content);
  console.log('Set APP_PASSWORD to "test"');
}

const problems: string[] = [];

if (read("APP_PASSWORD").length < 4) {
  problems.push("APP_PASSWORD must be at least 4 characters in .env.local.");
}

const secretNames = /^NEXT_PUBLIC_\w*(PASSWORD|SECRET|DATABASE|PRIVATE)\w*=/m;
if (secretNames.test(content)) {
  problems.push(
    "A secret starts with NEXT_PUBLIC_ in .env.local. Remove the NEXT_PUBLIC_ prefix: it exposes the value to the browser.",
  );
}

const databaseUrl = read("DATABASE_URL");
if (/supabase\.(com|co):5432/.test(databaseUrl)) {
  problems.push(
    "DATABASE_URL uses port 5432. Use Supabase's transaction pooler URL (port 6543) instead.",
  );
}

if (problems.length > 0) {
  for (const problem of problems) console.error(`✗ ${problem}`);
  process.exit(1);
}

if (databaseUrl) {
  console.log("Applying database migrations...");
  const migrate = spawnSync("node", ["scripts/db-migrate.ts"], { stdio: "inherit" });
  if (migrate.status !== 0) process.exit(migrate.status ?? 1);
} else {
  console.log(
    "No DATABASE_URL yet. Skipping the database: the app still runs, but posts won't save.",
  );
}

console.log("✓ Setup complete. Start the app with: vp run dev");
