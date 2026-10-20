import { expect, test } from "vite-plus/test";

import { commentSchema, firstError, postSchema } from "./validation";

test("accepts a post and trims its spaces", () => {
  const result = postSchema.parse({ title: "  Hello  ", body: " World " });
  expect(result).toEqual({ title: "Hello", body: "World" });
});

test("rejects a post with a blank title", () => {
  const result = postSchema.safeParse({ title: "   ", body: "Text" });
  expect(result.success).toBe(false);
  if (!result.success) expect(firstError(result.error)).toBe("Add a title");
});

test("rejects a title over 120 characters", () => {
  expect(postSchema.safeParse({ title: "a".repeat(121), body: "Text" }).success).toBe(false);
});

test("reads the post id from the form as a number", () => {
  expect(commentSchema.parse({ postId: "7", body: "Nice" })).toEqual({ postId: 7, body: "Nice" });
});

test("rejects a comment for a missing or invalid post id", () => {
  expect(commentSchema.safeParse({ body: "Nice" }).success).toBe(false);
  expect(commentSchema.safeParse({ postId: "abc", body: "Nice" }).success).toBe(false);
  expect(commentSchema.safeParse({ postId: "0", body: "Nice" }).success).toBe(false);
});
