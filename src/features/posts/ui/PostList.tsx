import { Banner } from "@astryxdesign/core/Banner";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Heading } from "@astryxdesign/core/Heading";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { Timestamp } from "@astryxdesign/core/Timestamp";
import { VStack } from "@astryxdesign/core/VStack";

import { listPosts } from "../server/queries";

import { NewPostForm } from "./NewPostForm";

// A server component: it reads the database directly, and only its HTML
// reaches the browser.
export async function PostList() {
  const posts = await listPosts();

  if (!posts) {
    return (
      <Banner
        status="info"
        title="No database connected"
        description="Add DATABASE_URL to .env.local, run vp run setup, then restart the dev server."
      />
    );
  }

  return (
    <VStack gap={6}>
      <NewPostForm />
      {posts.length === 0 ? (
        <EmptyState title="No posts yet" description="Write the first one above." />
      ) : (
        posts.map((post) => (
          <Card key={post.id} padding={6}>
            <VStack gap={2}>
              <Heading level={2}>
                <Link href={`/posts/${post.id}`} color="inherit" size="xl" weight="semibold">
                  {post.title}
                </Link>
              </Heading>
              <Text type="supporting">
                {post.author} · <Timestamp value={post.createdAt.toISOString()} format="auto" /> ·{" "}
                {post.commentCount === 1 ? "1 comment" : `${post.commentCount} comments`}
              </Text>
            </VStack>
          </Card>
        ))
      )}
    </VStack>
  );
}
