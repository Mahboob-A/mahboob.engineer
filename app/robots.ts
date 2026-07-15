/**
 * app/robots.ts
 *
 * Next.js 16 robots. Allows everything except the API + admin SPA,
 * references the sitemap.
 *
 * Phase 6 (T6.5).
 */

import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mahboob.engineer";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/keystatic/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}