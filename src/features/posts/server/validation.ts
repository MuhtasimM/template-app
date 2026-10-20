import { z } from "zod";

// What a valid post or comment looks like. The author comes from the name
// cookie, not the form, so it isn't checked here.

export const postSchema = z.object({
  title: z.string().trim().min(1, "Add a title").max(120),
  body: z.string().trim().min(1, "Write something").max(5000),
});

export const commentSchema = z.object({
  postId: z.coerce.number().int().positive(),
  body: z.string().trim().min(1, "Write a comment").max(2000),
});

export function firstError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Check the form and try again.";
}
