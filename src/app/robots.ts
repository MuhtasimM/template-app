import type { MetadataRoute } from "next";

// The whole site is behind a password, so ask search engines to stay out.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
