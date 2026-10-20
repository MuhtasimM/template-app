import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { VStack } from "@astryxdesign/core/VStack";
import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/features/auth/ui/LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false, follow: false },
};

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <Card maxWidth={420} padding={6}>
      <VStack gap={4}>
        <Heading level={1}>Log in</Heading>
        {/* The form needs the URL, which is only known when someone visits. */}
        <Suspense>
          <LoginFormForUrl searchParams={searchParams} />
        </Suspense>
      </VStack>
    </Card>
  );
}

async function LoginFormForUrl({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const { next } = await searchParams;
  return <LoginForm next={typeof next === "string" ? next : ""} />;
}
