# Posts

A feed of posts, each with a page of comments.

- `/` shows the "New post" form and the 100 newest posts, with comment counts.
- `/posts/<id>` shows one post, its comments (oldest first) and the comment form.
- Posts and comments are signed with the name from the name cookie, not a form field.
- Titles are up to 120 characters, posts up to 5,000 and comments up to 2,000. Spaces at the ends are removed.
- Deleting a post deletes its comments (`onDelete: "cascade"` in `src/db/schema.ts`). There is no delete button yet.
