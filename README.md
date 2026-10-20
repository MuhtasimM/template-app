# Template App

A private posts-and-comments board behind a shared password, with a Postgres database.

Built with Next.js 16, Vite+, Astryx, Tailwind, Drizzle and TypeScript 7. Deploys to Vercel.

## Get started

```bash
vp install
vp run setup   # creates .env.local (the password is "test")
vp run dev     # http://localhost:3000
```

In `.env.local`, set:

- `APP_PASSWORD`: the password everyone uses to log in. It starts as `test`; use a stronger one on Vercel.
- `DATABASE_URL`: either a local Postgres in Docker or Supabase (see below)

Run `vp run setup` again after adding the database URL to create the tables.

## Database

**Local, with Docker:** start Postgres with `vp run db:up` (stop it with `vp run db:down`), then use:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:55433/postgres
```

**Supabase:** copy the URL from Connect → Transaction pooler (port 6543). Use this one on Vercel.

### Changing the database

1. Edit `src/db/schema.ts`.
2. Run `vp run db:generate` to write a migration in `drizzle/`.
3. Run `vp run db:migrate` to apply it.
4. Commit the schema and the migration together.

Production deployments on Vercel apply new migrations automatically. If your local database was made before migrations existed, run `vp run db:reset` (this deletes its data).

## Check everything works

```bash
vp run verify
```

This runs formatting, lint and type checks, unit tests, a production build and a smoke test that checks the password gate and that no secrets end up in browser code.

## Deploy

Import the repo in Vercel and add `APP_PASSWORD`, `SESSION_SECRET` and `DATABASE_URL` as environment variables.

See [AGENTS.md](./AGENTS.md) for how the project is organised and how to work on it, and [docs/](./docs) for what each feature does.
