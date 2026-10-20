"use client";

import { Button } from "@astryxdesign/core/Button";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";
import { useActionState, useState } from "react";

import { login } from "../server/actions";

// `next` is the page to return to after logging in.
export function LoginForm({ next }: { next: string }) {
  const [password, setPassword] = useState("");
  const [state, formAction, isPending] = useActionState(login, {});

  return (
    <form action={formAction}>
      <VStack gap={4}>
        <input type="hidden" name="next" value={next} />
        <TextInput
          type="password"
          label="Password"
          htmlName="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          hasAutoFocus
          isRequired
          status={state.error ? { type: "error", message: state.error } : undefined}
        />
        <Button label="Log in" type="submit" variant="primary" isLoading={isPending} />
      </VStack>
    </form>
  );
}
