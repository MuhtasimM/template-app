import { Heading } from "@astryxdesign/core/Heading";
import { VStack } from "@astryxdesign/core/VStack";
import { Suspense } from "react";

import { PostList } from "@/features/posts/ui/PostList";

export default function Home() {
  return (
    <VStack gap={6}>
      <Heading level={1}>Posts</Heading>
      {/* Posts come from the database on every request, so they load after the page shell. */}
      <Suspense>
        <PostList />
      </Suspense>
    </VStack>
  );
}
