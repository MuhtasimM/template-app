// Fails if src/db/schema.ts has changes that no migration in drizzle/ covers.
// It generates into a scratch copy, so drizzle/ itself is never touched.
import { spawnSync } from "node:child_process";
import { cpSync, readdirSync, rmSync } from "node:fs";

// drizzle-kit only accepts an output folder inside the project.
const copy = "node_modules/.cache/drizzle-check";
rmSync(copy, { recursive: true, force: true });
cpSync("drizzle", copy, { recursive: true });
const before = readdirSync(copy).length;

const result = spawnSync(
  "node_modules/.bin/drizzle-kit",
  ["generate", "--dialect=postgresql", "--schema=./src/db/schema.ts", `--out=./${copy}`],
  { encoding: "utf8" },
);
const after = readdirSync(copy).length;
rmSync(copy, { recursive: true, force: true });

// drizzle-kit can exit with 0 after an error, so check its output too.
const output = `${result.stdout}${result.stderr}`;
if (result.status !== 0 || /error/i.test(output)) {
  console.error("✗ Couldn't check migrations:\n", output);
  process.exit(1);
}
if (after !== before) {
  console.error(
    "✗ src/db/schema.ts changed without a migration. Run `vp run db:generate` and commit drizzle/.",
  );
  process.exit(1);
}
console.log("✓ Migrations match the schema");
