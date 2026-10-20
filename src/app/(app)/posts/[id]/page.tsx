import type { Metadata } from "next";
import { Suspense } from "react";

import { PostDetail } from "@/features/posts/ui/PostDetail";

export const metadata: Metadata = {
  title: "Post",
};

export default function PostPage({ params }: PageProps<"/posts/[id]">) {
  return (
    // The post comes from the database on every request, so it loads after the page shell.
    <Suspense>
      <PostDetail params={params} />
    </Suspense>
  );
}
