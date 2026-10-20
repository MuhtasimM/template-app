"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";

// Shown when a page fails, such as a wrong DATABASE_URL or a table that doesn't
// exist yet. The full error is in the terminal running `vp run dev`.
export default function PageError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <Banner
      status="error"
      title="Something went wrong"
      description="Check the terminal running the dev server for details. If it mentions a missing table, run vp run setup."
      endContent={<Button label="Try again" onClick={() => retry()} />}
    />
  );
}
