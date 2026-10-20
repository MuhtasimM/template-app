// Starts the production build and checks the things that must always work.
// Run with `vp run verify`, which builds first.
import { spawn } from "node:child_process";
import { createHmac } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const PORT = 4321;
const BASE = `http://localhost:${PORT}`;
const PASSWORD = "smoke-test-password";
const SECRET = "smoke-test-session-secret-0123456789abcdef";

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  console.log(`${ok ? "✓" : "✗"} ${name}${!ok && detail ? ` (${detail})` : ""}`);
  if (!ok) failures++;
}

// Started in its own process group so stopping it also stops Next.js's workers.
const server = spawn("node_modules/.bin/next", ["start", "--port", String(PORT)], {
  detached: true,
  env: {
    ...process.env,
    APP_PASSWORD: PASSWORD,
    SESSION_SECRET: SECRET,
    DATABASE_URL: "",
    NEXT_TELEMETRY_DISABLED: "1",
  },
  stdio: ["ignore", "ignore", "inherit"],
});

async function waitForServer() {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`${BASE}/robots.txt`)).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("Server didn't start");
}

function get(path: string, cookie?: string) {
  return fetch(`${BASE}${path}`, {
    redirect: "manual",
    headers: cookie ? { Cookie: cookie } : {},
  });
}

// The same signed token src/lib/session.ts creates after a correct password.
function sessionCookie() {
  const expiresAt = String(Date.now() + 60_000);
  const signature = createHmac("sha256", SECRET)
    .update(`${expiresAt}:${PASSWORD}`)
    .digest("base64url");
  return `session=${expiresAt}.${signature}`;
}

async function listFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    files.push(...(entry.isDirectory() ? await listFiles(path) : [path]));
  }
  return files;
}

// Secret values from .env.local and the environment, as used during the build.
function secretValues() {
  const names = ["APP_PASSWORD", "SESSION_SECRET", "DATABASE_URL"];
  const envFile = existsSync(".env.local") ? readFileSync(".env.local", "utf8") : "";
  const values = [PASSWORD, SECRET];
  for (const name of names) {
    const fromFile = envFile.match(new RegExp(`^(?:NEXT_PUBLIC_)?${name}=(.*)$`, "m"))?.[1];
    for (const value of [fromFile, process.env[name], process.env[`NEXT_PUBLIC_${name}`]]) {
      const clean = value?.trim().replace(/^"|"$/g, "");
      if (clean && clean.length >= 8) values.push(clean);
    }
  }
  return values;
}

try {
  await waitForServer();

  // Everything except the login page needs the password.
  for (const path of ["/", "/posts/1"]) {
    const res = await get(path);
    check(
      `${path} redirects to /login when logged out`,
      res.status === 307 && (res.headers.get("location") ?? "").includes("/login"),
      `${res.status} ${res.headers.get("location")}`,
    );
  }
  const forged = await get("/", "session=9999999999999.forged");
  check("/ rejects a forged cookie", forged.status === 307, String(forged.status));

  const login = await get("/login");
  const loginHtml = await login.text();
  check("/login loads", login.status === 200, String(login.status));
  check("/login has a password field", loginHtml.includes('type="password"'));
  check("/login is noindex", loginHtml.includes("noindex"));

  const home = await get("/", sessionCookie());
  const homeHtml = await home.text();
  check("/ loads when logged in", home.status === 200, String(home.status));
  check("/ is noindex", homeHtml.includes("noindex"));
  check("/ has a Posts heading", homeHtml.includes(">Posts</h1>"));

  // Search engines are asked to stay out of the whole site.
  const robots = await (await get("/robots.txt")).text();
  check("robots.txt blocks everything", robots.includes("Disallow: /"));

  // Secrets must never reach the browser.
  const secrets = secretValues();
  const leaks: string[] = [];
  for (const file of await listFiles(".next/static")) {
    const content = await readFile(file, "utf8");
    if (secrets.some((secret) => content.includes(secret))) leaks.push(file);
  }
  check("no secrets in browser files", leaks.length === 0, leaks.join(", "));
} catch (error) {
  check("smoke test ran", false, String(error));
} finally {
  if (server.pid) process.kill(-server.pid, "SIGTERM");
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nAll smoke checks passed");
process.exit(0);
