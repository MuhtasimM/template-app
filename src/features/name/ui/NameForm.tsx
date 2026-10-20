"use client";

import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { useActionState, useState } from "react";

import { saveName } from "../server/actions";

// Shows the saved name, or a box to type one. Saving stores it in a cookie.
export function NameForm({ name }: { name: string | null }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(name ?? "");
  const [state, formAction, isPending] = useActionState(
    async (previous: { error?: string }, formData: FormData) => {
      const result = await saveName(previous, formData);
      if (!result.error) setIsEditing(false);
      return result;
    },
    {},
  );

  if (name && !isEditing) {
    return (
      <HStack gap={2} align="center">
        <Text>{name}</Text>
        <Button label="Change name" size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
          Change
        </Button>
      </HStack>
    );
  }

  return (
    <form action={formAction}>
      <HStack gap={2} align="center">
        <TextInput
          label="Your name"
          isLabelHidden
          placeholder="Your name"
          htmlName="name"
          size="sm"
          value={draft}
          onChange={setDraft}
          width={160}
          status={state.error ? { type: "error", message: state.error } : undefined}
          statusVariant="tooltip"
        />
        <Button label="Save name" size="sm" type="submit" isLoading={isPending}>
          Save
        </Button>
      </HStack>
    </form>
  );
}
