import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/HStack";
import { TopNav, TopNavHeading } from "@astryxdesign/core/TopNav";
import { Suspense } from "react";

import { logout } from "@/features/auth/server/actions";
import { NameForm } from "@/features/name/ui/NameForm";
import { getName } from "@/lib/name";
import { site } from "@/lib/site";

export function TopBar({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <TopNav
      heading={<TopNavHeading heading={site.name} headingHref="/" />}
      endContent={
        isLoggedIn ? (
          <HStack gap={3} align="center">
            {/* The name comes from a cookie, so it's read when someone visits. */}
            <Suspense>
              <SavedName />
            </Suspense>
            <form action={logout}>
              <Button label="Log out" type="submit" variant="ghost" />
            </form>
          </HStack>
        ) : null
      }
    />
  );
}

async function SavedName() {
  return <NameForm name={await getName()} />;
}
