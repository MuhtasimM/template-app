<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project guide for coding agents

The person you work with is new to coding. Run every check yourself. Don't ask them to run commands you can run.

## How to work

### Writing style

Write replies, comments and docs in ASD-STE100 Simplified Technical English where you can:

- One instruction per sentence. Put the action first: "Run `vp run setup`", not "You'll want to run setup".
- Keep sentences short: 20 words or fewer for instructions, 25 for descriptions.
- Use active voice and simple tenses.
- Use one word for one thing. If you call it a "post", don't also call it an "entry".
- No idioms, jokes or filler ("Great question", "Let's dive in").
- Code, file names and error messages stay exactly as they are, even when they break these rules.

### Changes

- Make the smallest change that does the job. Don't reformat, rename or "tidy" code you weren't asked to touch.
- Stay inside the task. If you notice something else worth fixing, mention it at the end. Don't fix it.
- Match the code around you: its naming, its comments, its patterns.
- Ask before adding a dependency, a new folder or a new pattern.
- Don't delete files, change the database schema or touch `.env.local` unless the task needs it. Say when you do.
- If a task touches more than about five files or adds a table, write a short plan first (files to change, approach) and wait for an OK.
- After two failed attempts at the same error, stop. Explain what you tried and what you think is wrong.

### Branches and commits

- Build one feature at a time, on its own branch: `feat/<short-name>` (or `fix/`, `docs/`).
- Name commits with [conventional commits](https://www.conventionalcommits.org/): `feat(posts): add comment editing`. Use the feature as the scope.
- Don't commit or push unless asked.

### Tests

Tests are for behaviour that could break without anyone noticing. Coverage numbers don't matter.

- Test logic with real rules: the password gate, session cookies, input validation, who can see what.
- Don't test layout, styling, or code that only passes data through.
- One test per behaviour, named after the behaviour ("rejects an expired session").
- When you fix a bug, add a test that would have caught it.
- No snapshot tests.
- Put a test next to the file it tests: `validation.ts` and `validation.test.ts`.

### UI work

- Before changing anything visual, use the `frontend-design` skill. If it isn't available, stop and tell the user how to install it rather than continuing without it.
- Astryx is the design system. Use its components and tokens first, and look up props with `pnpm exec astryx component <Name>`. The skill guides layout, hierarchy and polish inside Astryx; it doesn't replace it.
- Every input has a label, every image has alt text, and everything works from the keyboard.
- Check the result in a browser at desktop and phone widths before saying it's done.

### Finishing

- Run `vp run verify`. It must pass. Don't disable or skip a check to make it pass.
- Update the feature's doc in `docs/features/` if its behaviour changed.
- Then say in two or three sentences what changed and what you didn't check.

## What the app is

A private posts-and-comments board. Everything is behind one shared password except the login page. People set their name in the top right; it's saved in a cookie and signs their posts and comments.

## Stack

- **Next.js 16** (App Router, React 19, React Compiler, Cache Components) with **TypeScript 7**
- **Vite+** (`vp`) for formatting, linting, type checks and tests. Next.js runs the app itself.
- **Astryx** components (`@astryxdesign/core`) with **Tailwind** for layout
- **Drizzle ORM** with Postgres (Supabase)
- **Zod** for validating form input and environment variables
- Deployed on **Vercel**

## Commands

| Command              | What it does                                                                        |
| -------------------- | ----------------------------------------------------------------------------------- |
| `vp install`         | Install dependencies                                                                |
| `vp run setup`       | Create `.env.local`, generate `SESSION_SECRET`, apply migrations                    |
| `vp run dev`         | Start the app at http://localhost:3000                                              |
| `vp run verify`      | Format, lint, type check, unit tests, migration check, production build, smoke test |
| `vp run db:generate` | Write a migration in `drizzle/` after changing `src/db/schema.ts`                   |
| `vp run db:migrate`  | Apply migrations that haven't run yet                                               |
| `vp run db:studio`   | Browse the database in the browser                                                  |
| `vp run db:up`       | Start a local Postgres in Docker (port 55433), see `compose.yaml`                   |
| `vp run db:down`     | Stop the local Postgres. Its data stays in a Docker volume.                         |
| `vp run db:reset`    | Delete the local Postgres data and rebuild it from the migrations                   |

Use `vp run dev`, not `vp dev`: `vp dev` starts plain Vite, not Next.js.

## Project structure

```
src/
  app/                  Routes only: short pages and layouts that import from features
    (app)/              Pages behind the password. "(app)" doesn't appear in URLs.
    login/              The login page
  features/
    <feature>/
      server/           Database reads, server actions, validation. Never imported by browser code directly.
      ui/               Components for this feature
  components/           The app shell (TopBar) and UI shared by several features
  lib/                  Shared plumbing: env, db, session, name cookie
  db/schema.ts          Every database table
  proxy.ts              Sends logged-out visitors to /login
drizzle/                Database migrations (SQL). Generated, committed, never edited.
scripts/                setup, db-migrate, db-check and smoke-test scripts
compose.yaml            Local Postgres in Docker
docs/
  features/<feature>.md What each feature does and why
  decisions.md          Choices that aren't obvious from the code
```

Current features: `auth` (login and logout), `posts` (posts and comments), `name` (the name in the top right).

### Feature rules

- A feature's code lives in `src/features/<feature>/`, split into `server/` and `ui/`.
- `server/` holds:
  - `queries.ts`: database reads. Each starts with `await requireSession()`.
  - `actions.ts`: server actions, marked `"use server"`. Each starts with `await requireSession()`, validates input, and calls `revalidatePath` for every page that shows the data. A `"use server"` file can only export async functions.
  - `validation.ts`: Zod schemas, with a test next to it.
- `ui/` holds components. Client components that use state or forms start with `"use client"`. Server components that read data call functions from `../server/queries`.
- `ui/` imports from its own `server/`. Nothing in `server/` imports from `ui/`.
- A feature never imports from another feature. If two features need the same code, move it to `src/lib/` (logic) or `src/components/` (UI) first.
- `src/app/` and `src/components/` may import from any feature.
- Files in `src/app/` stay short: they set metadata, wrap data-loading components in `<Suspense>`, and render feature components.
- New tables go in `src/db/schema.ts`, with a comment naming the feature that owns them.
- A new feature gets a doc in `docs/features/<feature>.md` when you create it.

## Docs

- Docs live in `docs/`. `README.md` and `AGENTS.md` stay at the root.
- `docs/features/<feature>.md`: what the feature does and why, in a few lines.
- `docs/decisions.md`: one short entry per choice that isn't obvious from the code. Newest first.
- Write a doc only when it saves the next person time. Don't restate what the code says.
- Docs follow the writing style above.

## Password gate

There are no user accounts. Everyone shares one password (`APP_PASSWORD`, `test` by default locally; deployments should use a stronger one). Logging in sets a signed, httpOnly `session` cookie that lasts 7 days. Changing `APP_PASSWORD` or `SESSION_SECRET` logs everyone out. Anyone with the password can post as any name: the name is a label, not an identity.

The proxy only redirects pages. `requireSession()` is what protects the data, because server actions can be called directly.

## Rules

- **Secrets stay on the server.** Read them only through `env()` in `src/lib/env.ts`. Files that touch secrets or the database start with `import "server-only"`, so the build fails if browser code imports them.
- **Never prefix a secret with `NEXT_PUBLIC_`.** Next.js copies every `NEXT_PUBLIC_` variable into browser code.
- **New environment variables** go in `src/lib/env.ts` (with a Zod rule), `.env.example` (blank, with a comment) and `.env.local`. Remind the user to add them in Vercel too.
- **New pages** go inside `src/app/(app)/` so they get the top bar and stay behind the password.
- **Cache Components is on.** Anything that reads cookies, the database, URL params or the current time must be inside a `<Suspense>` boundary, or call `await connection()` first. Don't use `usePathname` or `useSearchParams` in layouts. The build error names the component; fix it there rather than turning the feature off.
- **The name** lives in the `name` cookie. Read it on the server with `getName()` from `@/lib/name`; server actions use it as the author, so forms don't send a name.
- **Never read `localStorage` or `window` while rendering.** Pages render on the server first, where neither exists.
- **Database changes go through migrations.**
  1. Edit `src/db/schema.ts`.
  2. Run `vp run db:generate`. Read the SQL file it writes in `drizzle/`. If a column is renamed, check it says `RENAME`, not `DROP` and `ADD`, which would lose data.
  3. Run `vp run db:migrate` to apply it locally.
  4. Commit the schema change and the `drizzle/` files together.
  - Never edit or delete a migration that has been committed. Write a new one instead.
  - Never use `drizzle-kit push`. It changes the database without a migration.
  - `vp run verify` fails if the schema has changes with no migration.
  - Production deployments on Vercel apply migrations after the build. Preview deployments don't.
- **Local database:** `vp run db:up` runs Postgres in Docker. `DATABASE_URL=postgresql://postgres:postgres@localhost:55433/postgres` points at it. Deployments use Supabase.

## Deploying to Vercel

Import the GitHub repo in Vercel and add `APP_PASSWORD`, `SESSION_SECRET` and `DATABASE_URL` under Settings → Environment Variables.

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

<!-- ASTRYX:START -->
Astryx v0.7.1 · 168 components
CLI: run every command as `pnpm exec astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — start every page from a template, never from scratch:
1. `astryx build "<idea>"` — names the template to scaffold from and the parts it lacks.
2. `astryx template <name> <path>` — scaffold it; keep its frame, gap and padding; replace the content.
3. `astryx template <Block>` for parts it lacks; `astryx component <Name>` to read props before using one.
Changing an existing page? Keep it: skip step 2 and add blocks/components inside its sections.

RULES:
- No <div> — components handle all layout and spacing.
- Read `astryx docs layout` before changing a template's frame.
- Dense data = rows (Table, List/Item), not Card-wrapped lists. Badge = counts only.
- Style with component props first, then Tailwind utilities backed by tokens. No raw hex/px.
- Palettes and custom colors go through the theme, never :root overrides. Run `astryx theme add <slug>` to import; `theme eject <slug>` only forks source. See `astryx docs theme`.
- SELF-CHECK: re-read the file; replace any style={{…}}, raw <div>/<span>, imported .css/@apply, or hardcoded/arbitrary value (bg-[#fff], p-[13px]) with the component or a token-backed utility.

`astryx help` lists every command. Key ones beyond the workflow:
  search "<query>"   find any component / hook / doc / template
  discover <words>   integrations you could add
  docs <topic>       getting-started, principles, tokens, theme … (`astryx docs` lists all)
  docs cli           commands, API reference, integration authoring
  upgrade --from <old version> --apply   run after a dependency bump
<!-- ASTRYX:END -->
