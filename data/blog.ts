/**
 * data/blog.ts
 *
 * Blog **types and shared constants** — safe to import from both server
 * and client components.
 *
 * The mutable post registry (`BLOG_POSTS` + lookup helpers) lives in
 * `data/blog-registry.ts` instead. That split is deliberate:
 *
 *   - Types are erased at compile time, so they can never cause a
 *     server/client content divergence.
 *   - `CATEGORIES` / `NATIVE_POST_MEDIUM_URLS` are small, static, and
 *     byte-identical on both sides — safe to ship to the browser.
 *   - The registry holds *editable content* (titles, excerpts, notes).
 *     When a client component imported it as a value, Turbopack bundled
 *     a **second copy** into the client chunk. Editing a title then made
 *     the server's copy and the browser's copy diverge, producing a
 *     hydration mismatch (see the "SQL Joins" / "SQL JOINs" casing bug).
 *
 * Rule of thumb: **client components import types only** from this file;
 * the registry is imported by value on the server and passed down as
 * props.
 *
 * Source: portfolio-master-doc.md §0.6.
 *
 * ──────────────────────────────────────────────────────────────────────────
 */

/* ===========================================================================
   Types
   =========================================================================== */

/** Top-level category — drives the 8-chip filter on /writing. */
export type BlogCategory =
  | "distributed"
  | "linux"
  | "docker"
  | "video"
  | "ai"
  | "platform"
  | "career";

/** All categories with display labels — used by BlogFilter. */
export const CATEGORIES: ReadonlyArray<{ id: BlogCategory; label: string }> = [
  { id: "distributed", label: "Distributed Systems" },
  { id: "linux", label: "Linux / Networking" },
  { id: "docker", label: "Docker / Containers" },
  { id: "video", label: "Video" },
  { id: "ai", label: "AI / ML" },
  { id: "platform", label: "Platform" },
  { id: "career", label: "Career" },
];

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
   * (e.g. "/writing/..."); Medium posts use the full URL.
   */
  url: string;
  /** Tags shown on the post card. */
  tags: string[];
  /** Estimated read time in minutes. */
  readMin: number;
  /** Top-level category for the /writing filter chips. */
  category: BlogCategory;
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
  /**
   * First-person take-away that the dynamic RAG terminal surfaces as the
   * "why I wrote it" answer for each Medium post. Not rendered on the
   * static /writing page; lives here so the registry stays the source of
   * truth and the chunker can index it alongside `excerpt`. Phase 34.
   */
  notes?: string;
  /** Publication date in ISO 8601. Optional for native drafts. */
  publishedAt?: string;
  /** Canonical Medium URL for summarized native posts. */
  mediumUrl?: string;
}

/** Mapping of native post slugs to their canonical full-length Medium stories. */
export const NATIVE_POST_MEDIUM_URLS: Record<string, string> = {
  "linux-networking-part-1":
    "https://imehboob.medium.com/linux-networking-your-hands-on-guide-to-understand-how-docker-works-part-1-fbf2b6cef06f",
  "message-queue-101":
    "https://imehboob.medium.com/message-queue-101-your-ultimate-guide-to-understand-message-queue-b2256961ab01",
  "algocode-deep-dive":
    "https://imehboob.medium.com/my-experience-building-a-leetcode-like-online-judge-and-how-you-can-build-one-7e05e031455d",
};

