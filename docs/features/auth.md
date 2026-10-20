# Auth

One shared password lets people in. There are no user accounts.

- `src/proxy.ts` sends every request without a valid session to `/login`.
- The login form (`features/auth/ui/LoginForm.tsx`) calls the `login` server action. A correct password sets a signed, httpOnly `session` cookie for 7 days.
- The session logic is in `src/lib/session.ts`, because every feature that reads or writes data calls `requireSession()`.
- A wrong password waits one second before it answers, to slow down guessing.
- Changing `APP_PASSWORD` or `SESSION_SECRET` logs everyone out.
