import type { Metadata } from "next";
import { Figtree } from "next/font/google";

import { site } from "@/lib/site";

import "./globals.css";
import { Providers } from "./providers";

// The font Astryx's neutral theme is designed for.
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree" });

export const metadata: Metadata = {
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  // The site is private, so keep every page out of search results.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={figtree.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
