# Decisions

Choices that aren't obvious from the code. Newest first.

## Migrations, not `drizzle-kit push`

Every database change is a SQL file in `drizzle/`, committed with the schema change. Changes can be reviewed before they run, and every database gets the same history. `push` changed tables directly, which is risky on a database with real data: a rename could drop a column. Migrations run from `scripts/db-migrate.ts` after production builds on Vercel. Preview builds skip them, because they often share the production database.

## Local Postgres in Docker, Supabase in production

`compose.yaml` runs Postgres 17 for development, so you can work offline and reset data without touching the shared database. It uses port 55433 so it doesn't clash with another local Postgres. Docker is optional: a Supabase URL works locally too.

## Name in a cookie, not localStorage

The server can read a cookie. That lets it sign posts itself, so a form can't send a different name, and the top bar shows the name with no flicker on load.

## Shared code goes in `src/lib/`

Features don't import from each other. Code that two features need, such as the session check and the name cookie, moves to `src/lib/`.

## One shared password, no accounts

The course app is for small groups. A shared password keeps login simple. Add real accounts (for example Better Auth) when people need their own data.

## Cache Components is on

Next.js will turn it on for every app in its next major version. Code that reads cookies, the database or the time sits inside `<Suspense>` or calls `await connection()`.

## Supabase through the transaction pooler

Vercel runs many short-lived functions. The pooler (port 6543) stops them running out of database connections. It doesn't support prepared statements, so `src/lib/db.ts` sets `prepare: false`.
