/**
 * data/blog.ts
 *
 * Blog post registry. The `BLOG_POSTS` array below is the **native** post
 * registry — entries here are MDX files managed by Keystatic (Phase 5).
 * Medium cross-posts are fetched at build time via lib/medium-rss.ts and
 * merged in by /writing/page.tsx, but they never live in this file.
 *
 * Source: portfolio-master-doc.md §0.6 — copied verbatim.
 *
 * ──────────────────────────────────────────────────────────────────────────
 */

/* ===========================================================================
   Types
   =========================================================================== */

/** Where the post lives. */
export type BlogSource = "native" | "medium";

/** A single blog post entry — native OR medium. */
export interface BlogPostItem {
  /** URL slug, used as the route param /writing/[slug]. */
  slug: string;
  /** Display title. */
  title: string;
  /** Where the post is hosted. */
  source: BlogSource;
  /**
   * Canonical URL for the post. Native posts use a relative path
   * (e.g. "/writing/...") until they're hosted; Medium posts use the full URL.
   */
  url: string;
  /** Tags shown on the post card. */
  tags: string[];
  /** Estimated read time in minutes. */
  readMin: number;
  /** Project slugs this post references — used for "related projects" sidebar. */
  projects?: string[];
  /** Tech ids this post references — used for "related stack" sidebar. */
  stack?: string[];
  /** Series name if this post is part of a series. Optional. */
  series?: string;
  /** Part number within the series. Optional. */
  part?: number;
  /** Short excerpt shown on the post card. */
  excerpt?: string;
  /** Publication date in ISO 8601. Optional for native drafts. */
  publishedAt?: string;
}

/* ===========================================================================
   BLOG_POSTS registry
   Source: master §0.6 — copied verbatim.
   =========================================================================== */

export const BLOG_POSTS: BlogPostItem[] = [
  {
    slug: "building-leetcode-online-judge",
    title:
      "My Experience Building a LeetCode-like Online Judge (and How You Can)",
    source: "medium",
    url: "https://imehboob.medium.com/my-experience-building-a-leetcode-like-online-judge-and-how-you-can-build-one-7e05e031455d",
    tags: ["microservices", "docker", "rabbitmq", "distributed-systems"],
    readMin: 8,
    projects: ["algocode"],
    stack: ["Django", "RabbitMQ", "Docker"],
  },
  {
    slug: "message-queue-101",
    title:
      "Message Queue 101: Your Ultimate Guide to Understanding Message Queues",
    source: "medium",
    url: "https://imehboob.medium.com/message-queue-101-your-ultimate-guide-to-understand-message-queue-b2256961ab01",
    tags: ["rabbitmq", "distributed-systems", "async"],
    readMin: 6,
    projects: ["algocode"],
    stack: ["RabbitMQ"],
  },
  {
    slug: "linux-networking-part-1",
    title:
      "Linux Networking for Backend Engineers — Part 1: Namespaces & Virtual Interfaces",
    source: "medium",
    url: "https://imehboob.medium.com",
    tags: ["linux", "networking", "docker", "internals"],
    readMin: 10,
    series: "Linux Networking",
    part: 1,
    stack: ["Linux", "Docker"],
  },
];

/* ===========================================================================
   Lookup helpers
   =========================================================================== */

/** O(1) slug → post lookup. */
export const BLOG_POSTS_BY_SLUG: Readonly<Record<string, BlogPostItem>> =
  Object.freeze(
    BLOG_POSTS.reduce<Record<string, BlogPostItem>>((acc, p) => {
      acc[p.slug] = p;
      return acc;
    }, {}),
  );

/** All posts that are part of a named series, ordered by `part` ascending. */
export function postsInSeries(seriesName: string): BlogPostItem[] {
  return BLOG_POSTS.filter((p) => p.series === seriesName).sort(
    (a, b) => (a.part ?? 0) - (b.part ?? 0),
  );
}

/** All posts that reference a given project slug. */
export function postsByProject(projectSlug: string): BlogPostItem[] {
  return BLOG_POSTS.filter((p) => p.projects?.includes(projectSlug));
}

/** All posts that reference a given tech id (matches `stack[]`). */
export function postsByStack(stackId: string): BlogPostItem[] {
  return BLOG_POSTS.filter((p) =>
    p.stack?.some((s) => s.toLowerCase().includes(stackId.toLowerCase())),
  );
}

/** All unique series names declared across all posts. */
export const ALL_SERIES: readonly string[] = Object.freeze(
  Array.from(
    new Set(BLOG_POSTS.map((p) => p.series).filter((s): s is string => !!s)),
  ),
);