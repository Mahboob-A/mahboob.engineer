/**
 * app/writing/page.tsx
 *
 * Phase 5 (T5.4): Real /writing list page.
 *
 * Replaces the T4.12 stub. Per master §2.5:
 *   - Featured post at the top
 *   - Search bar
 *   - 8 category chips
 *   - 2 source toggles
 *   - 3-col post grid (responsive)
 *   - Series rail (horizontal scroll)
 *   - Filter state lives in WritingShell (client component)
 *
 * Data flow:
 *   - Static registry (`data/blog.ts`) is the canonical source for
 *     Medium posts — it has 13 entries vs the live RSS's 10.
 *   - Native posts come from `lib/mdx.ts` (loadAllNativePosts).
 *   - RSS fetch overlays `publishedAt` + `contentSnippet` on static
 *     entries matched by slug. RSS-only posts (newer than the
 *     registry) are appended to the list.
 *   - Final list is sorted newest-first by `publishedAt`.
 */

import { Suspense } from "react";
import { InnerLayout } from "@/components/layout/InnerLayout";
import { WritingShell } from "@/components/writing/WritingShell";
import { fetchMediumPosts, staticMediumPosts } from "@/lib/medium-rss";
import { loadAllNativePosts } from "@/lib/mdx";
import { type BlogPostItem } from "@/data/blog";
import { pageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata(
  "Writing",
  "How I think, not just what I shipped. Long-form breakdowns of distributed systems, Linux internals, async pipelines, and the bugs that taught me the most.",
);

export const dynamic = "force-dynamic"; // RSS fetch + native post reads → fresh on every render.

/* ===========================================================================
   Merging logic
   =========================================================================== */

interface MergedPost extends BlogPostItem {
  /** Which path the post entered the merged list by: "rss" | "static" | "native". */
  origin: "rss" | "static" | "native";
}

/**
 * Build the merged writing list. Steps:
 *   1. Start with native posts (from `lib/mdx.ts`).
 *   2. Overlay static Medium posts (from `data/blog.ts`).
 *   3. Overlay RSS-sourced posts (from `lib/medium-rss.ts`).
 *      - Match by slug; if the slug exists, overlay `publishedAt`
 *        and `excerpt` (preferring the RSS-sourced excerpt when
 *        the static excerpt is shorter).
 *      - If the slug doesn't exist (a brand-new Medium post),
 *        append it.
 */
async function buildMergedPostList(): Promise<MergedPost[]> {
  // Native posts (T5.6 will fill these in).
  const nativeMdx = await loadAllNativePosts();
  const native: MergedPost[] = nativeMdx.map((p) => ({
    slug: p.slug,
    title: p.frontmatter.title,
    source: "native",
    url: `/writing/${p.slug}`,
    tags: p.frontmatter.tags ?? [],
    readMin: p.frontmatter.readMin,
    category: (p.frontmatter.category ?? "platform") as MergedPost["category"],
    excerpt: p.frontmatter.excerpt,
    series: p.frontmatter.series,
    part: p.frontmatter.part,
    projects: p.frontmatter.projects,
    stack: p.frontmatter.stack,
    publishedAt: p.frontmatter.publishedAt,
    origin: "native",
  }));

  // Static Medium posts (canonical curated list).
  // Skip Medium entries whose slug matches a native MDX post — the
  // native version is canonical, the Medium entry is a duplicate.
  const nativeSlugs = new Set(native.map((p) => p.slug));
  const staticMedium: MergedPost[] = staticMediumPosts()
    .filter((p) => !nativeSlugs.has(p.slug))
    .map((p) => ({
      ...p,
      origin: "static" as const,
    }));

  // RSS fetch (may fail → fallback).
  const rss = await fetchMediumPosts();
  const rssPosts: MergedPost[] = rss.posts.map((p) => ({
    ...p,
    origin: "rss" as const,
  }));

  // Build slug → post map. Static entries win slugs (URL stability).
  // RSS-only posts (not in static) get appended.
  const bySlug = new Map<string, MergedPost>();
  for (const p of staticMedium) bySlug.set(p.slug, p);
  // If an RSS post has the same slug as a static one, overlay
  // publishedAt from RSS. Keep the static curated fields.
  for (const r of rssPosts) {
    const existing = bySlug.get(r.slug);
    if (existing) {
      bySlug.set(r.slug, {
        ...existing,
        publishedAt: r.publishedAt ?? existing.publishedAt,
        excerpt: (r.excerpt?.length ?? 0) > (existing.excerpt?.length ?? 0)
          ? r.excerpt
          : existing.excerpt,
        origin: "rss", // signal that this post is "live"
      });
    } else {
      bySlug.set(r.slug, r);
    }
  }

  // Final merged list: native + medium (from the map).
  const merged = [...native, ...Array.from(bySlug.values())];

  // Sort newest-first by `publishedAt`. Posts without a date
  // land at the end (treated as undated).
  merged.sort((a, b) => {
    const at = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const bt = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return bt - at;
  });

  return merged;
}

/* ===========================================================================
   Series computation
   =========================================================================== */

/** Group all merged posts by series name. Returns an ordered map. */
function computeSeries(posts: MergedPost[]): Record<string, BlogPostItem[]> {
  const out: Record<string, BlogPostItem[]> = {};
  for (const p of posts) {
    if (!p.series) continue;
    if (!out[p.series]) out[p.series] = [];
    out[p.series].push(p);
  }
  // Sort each series by part.
  for (const name of Object.keys(out)) {
    out[name].sort((a, b) => (a.part ?? 0) - (b.part ?? 0));
  }
  return out;
}

/* ===========================================================================
   Page
   =========================================================================== */

export default async function WritingPage() {
  const allPosts = await buildMergedPostList();
  const series = computeSeries(allPosts);

  return (
    <InnerLayout
      backHref="/"
      backLabel="← home"
      header={{
        section: "how i think",
        title: "The Backend Diaries",
        description:
          "How I think, not just what I shipped. Long-form breakdowns of systems, internals, and the bugs that taught me the most.",
      }}
    >
      <Suspense fallback={null}>
        <WritingShell
          allPosts={allPosts as BlogPostItem[]}
          series={series}
        />
      </Suspense>
    </InnerLayout>
  );
}
