"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { comments, posts } from "@/db/schema";
import { getDb } from "@/lib/db";
import { getName } from "@/lib/name";
import { requireSession } from "@/lib/session";

import { commentSchema, firstError, postSchema } from "./validation";

export type FormState = { error?: string };

// Server actions can be called directly, so each one checks the session itself.

export async function createPost(_state: FormState, formData: FormData): Promise<FormState> {
  await requireSession();

  // Posts are signed with the name saved in the top right.
  const author = await getName();
  if (!author) return { error: "Add your name in the top right first." };

  const parsed = postSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const db = getDb();
  if (!db) return { error: "No database connected." };

  const [post] = await db
    .insert(posts)
    .values({ ...parsed.data, author })
    .returning({ id: posts.id });
  revalidatePath("/");
  redirect(`/posts/${post!.id}`);
}

export async function addComment(_state: FormState, formData: FormData): Promise<FormState> {
  await requireSession();

  const author = await getName();
  if (!author) return { error: "Add your name in the top right first." };

  const parsed = commentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const db = getDb();
  if (!db) return { error: "No database connected." };

  await db.insert(comments).values({ ...parsed.data, author });
  revalidatePath(`/posts/${parsed.data.postId}`);
  revalidatePath("/");
  return {};
}
