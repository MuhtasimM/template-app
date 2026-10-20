"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/HStack";
import { TextArea } from "@astryxdesign/core/TextArea";
import { VStack } from "@astryxdesign/core/VStack";
import { useActionState, useState } from "react";

import { addComment, type FormState } from "../server/actions";

export function CommentForm({ postId }: { postId: number }) {
  const [body, setBody] = useState("");
  const [state, formAction, isPending] = useActionState(
    async (previous: FormState, formData: FormData) => {
      const result = await addComment(previous, formData);
      if (!result.error) setBody("");
      return result;
    },
    {},
  );

  return (
    <form action={formAction}>
      <VStack gap={3}>
        <input type="hidden" name="postId" value={postId} />
        <TextArea label="Comment" htmlName="body" value={body} onChange={setBody} rows={3} />
        {state.error && <Banner status="error" title={state.error} />}
        <HStack justify="end">
          <Button label="Add comment" type="submit" variant="primary" isLoading={isPending} />
        </HStack>
      </VStack>
    </form>
  );
}
