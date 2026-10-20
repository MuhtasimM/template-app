# Name

The name in the top right, used to sign posts and comments.

- It's saved in a `name` cookie for a year, so the server can read it.
- `getName()` in `src/lib/name.ts` reads it. It's in `lib/` because the posts feature uses it too.
- Without a name, posting and commenting show "Add your name in the top right first."
- It's a label, not an identity: anyone can change it at any time.
