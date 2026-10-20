import "server-only";

import { asc, desc, eq, sql } from "drizzle-orm";

import { comments, posts } from "@/db/schema";

import { getDb } from "@/lib/db";
import { requireSession } from "@/lib/session";

// Every read checks the session first, so the data stays behind the password
// even if a page forgets to.

export async function listPosts() {
  await requireSession();
  const db = getDb();
  if (!db) return null;
  return db
    .select({
      id: posts.id,
      title: posts.title,
      author: posts.author,
      createdAt: posts.createdAt,
      commentCount: sql<number>`(select count(*) from ${comments} where ${comments.postId} = ${posts.id})::int`,
    })
    .from(posts)
    .orderBy(desc(posts.createdAt))
    .limit(100);
}

export async function getPost(id: number) {
  await requireSession();
  const db = getDb();
  if (!db) return null;
  const [post] = await db.select().from(posts).where(eq(posts.id, id));
  if (!post) return null;
  const postComments = await db
    .select()
    .from(comments)
    .where(eq(comments.postId, id))
    .orderBy(asc(comments.createdAt));
  return { ...post, comments: postComments };
}
