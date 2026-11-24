/**
 * app/stack/page.tsx
 *
 * The "03 / DEPENDENCY GRAPH" inner page. Per master §2.4:
 *
 *   [BackLink "← home"]
 *   [Section header]
 *   [Legend]
 *   [2-col grid (lg+): D3 force graph | tech detail panel]
 *   [Mobile: list view above detail panel]
 *
 * Server Component shell. The interactive piece (StackShell) is a
 * separate 'use client' island. Static at build time.
 */

import type { Metadata } from "next";
import { InnerLayout } from "@/components/layout/InnerLayout";
import { StackShell } from "@/components/stack/StackShell";
import { STACK, STACK_EDGES } from "@/data/stack";
import { postsByStack } from "@/data/blog-registry";
import type { BlogSource } from "@/data/blog";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "Stack",
  "Every tech I've shipped with, plus what I'm currently leveling up. Hover or click a node to inspect.",
);

/* Project count per tech id — pre-computed once at module load. Used
   by MobileTechList for the per-row badge column. */
const PROJECT_COUNT_BY_TECH: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  for (const t of STACK) {
    out[t.id] = t.projects.length;
  }
  return out;
})();

/* Blog posts that mention each tech — pre-computed server-side from the
   blog registry. StackShell is a client component, so it can't import the
   registry itself: that would bundle a second copy into the client chunk,
   where it could drift from the server's copy and cause a hydration
   mismatch. Only the fields the detail panel renders are passed down. */
interface TechMentionPost {
  slug: string;
  title: string;
  source: BlogSource;
  url: string;
  readMin: number;
}

const POSTS_BY_TECH: Record<string, TechMentionPost[]> = (() => {
  const out: Record<string, TechMentionPost[]> = {};
  for (const t of STACK) {
    const posts = postsByStack(t.id).map((p) => ({
      slug: p.slug,
      title: p.title,
      source: p.source,
      url: p.url,
      readMin: p.readMin,
    }));
    if (posts.length > 0) out[t.id] = posts;
  }
  return out;
})();

export default function StackPage() {
  return (
    <InnerLayout
      backHref="/"
      backLabel="← home"
      header={{
        section: "every tool, every system",
        title: "How the stack connects",
        description:
          "Every tech I've shipped with, plus what I'm currently leveling up. Hover or click a node to inspect.",
      }}
    >
      <StackShell
        techs={STACK}
        edges={STACK_EDGES}
        projectCountByTech={PROJECT_COUNT_BY_TECH}
        postsByTech={POSTS_BY_TECH}
      />
    </InnerLayout>
  );
}