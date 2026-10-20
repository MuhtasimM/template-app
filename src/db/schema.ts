import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// After changing this file, run `vp run db:generate` to write a migration in
// drizzle/, then `vp run db:migrate` to apply it. Commit the migration with the change.

export const posts = pgTable("posts", {
  id: serial().primaryKey(),
  author: text().notNull(),
  title: text().notNull(),
  body: text().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial().primaryKey(),
  // Deleting a post deletes its comments too.
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  author: text().notNull(),
  body: text().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
