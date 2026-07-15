/**
 * app/sitemap.ts
 *
 * Next.js 16 sitemap. Returns every static + dynamic route. Static
 * pages use the build date as `lastModified`; native blog posts use
 * their frontmatter `publishedAt`; Medium cross-posts are excluded
 * (they're 307 redirects, not content).
 *
 * Sources:
 *   - PROJECTS (data/projects.ts) → /work/[slug]
 *   - listNativePostSlugs()       → /writing/[slug] (only native)
 *
 * Phase 6 (T6.5).
 */

import type { MetadataRoute } from "next";
import { PROJECTS } from "@/data/projects";
import { listNativePostSlugs } from "@/lib/mdx";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mahboob.engineer";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "monthly", priority: 1.0 },
    { url: `${SITE_URL}/log`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE_URL}/work`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/stack`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE_URL}/writing`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    /* Post-Phase 6 bug fix: route renamed /contact → /lets-connect. */
    { url: `${SITE_URL}/lets-connect`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/game`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = PROJECTS.map((p) => ({
    url: `${SITE_URL}/work/${p.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.8,
  }));

  const nativeSlugs = await listNativePostSlugs();
  const writingRoutes: MetadataRoute.Sitemap = nativeSlugs.map((slug) => ({
    url: `${SITE_URL}/writing/${slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes, ...writingRoutes];
}