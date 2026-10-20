"use client";

import { LinkProvider } from "@astryxdesign/core/Link";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
import NextLink from "next/link";

// Astryx's theme, and Next.js links for every Astryx link and nav item.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Theme theme={neutralTheme}>
      <LinkProvider component={NextLink}>{children}</LinkProvider>
    </Theme>
  );
}
