"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";
import { useActionState, useState } from "react";

import { createPost } from "../server/actions";

export function NewPostForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [state, formAction, isPending] = useActionState(createPost, {});

  return (
    <Card padding={6}>
      <form action={formAction}>
        <VStack gap={4}>
          <Heading level={2}>New post</Heading>
          <TextInput label="Title" htmlName="title" value={title} onChange={setTitle} />
          <TextArea label="Post" htmlName="body" value={body} onChange={setBody} rows={4} />
          {state.error && <Banner status="error" title={state.error} />}
          <HStack justify="end">
            <Button label="Publish" type="submit" variant="primary" isLoading={isPending} />
          </HStack>
        </VStack>
      </form>
    </Card>
  );
}
