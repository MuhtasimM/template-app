import { Banner } from "@astryxdesign/core/Banner";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { Heading } from "@astryxdesign/core/Heading";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { Timestamp } from "@astryxdesign/core/Timestamp";
import { VStack } from "@astryxdesign/core/VStack";
import { notFound } from "next/navigation";

import { getDb } from "@/lib/db";
import { getPost } from "../server/queries";

import { CommentForm } from "./CommentForm";

export async function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) notFound();

  const post = await getPost(id);
  if (!post) {
    if (!getDb()) {
      return <Banner status="info" title="No database connected" />;
    }
    notFound();
  }

  return (
    <VStack gap={6}>
      <Link href="/" isStandalone>
        ← All posts
      </Link>
      <Card padding={6}>
        <VStack gap={3}>
          <Heading level={1}>{post.title}</Heading>
          <Text type="supporting">
            {post.author} · <Timestamp value={post.createdAt.toISOString()} format="auto" />
          </Text>
          <Text as="p" textWrap="pretty">
            <span className="whitespace-pre-wrap">{post.body}</span>
          </Text>
        </VStack>
      </Card>
      <Card padding={6}>
        <VStack gap={4}>
          <Heading level={2}>
            {post.comments.length === 1 ? "1 comment" : `${post.comments.length} comments`}
          </Heading>
          {post.comments.map((comment) => (
            <VStack key={comment.id} gap={1}>
              <Text type="supporting">
                {comment.author} ·{" "}
                <Timestamp value={comment.createdAt.toISOString()} format="auto" />
              </Text>
              <Text as="p">
                <span className="whitespace-pre-wrap">{comment.body}</span>
              </Text>
            </VStack>
          ))}
          {post.comments.length > 0 && <Divider />}
          <CommentForm postId={post.id} />
        </VStack>
      </Card>
    </VStack>
  );
}
