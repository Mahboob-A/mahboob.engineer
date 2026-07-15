/**
 * lib/medium-rss.ts
 *
 * Build-time Medium RSS fetcher. Fetches
 * `https://imehboob.medium.com/feed` at module-init time, parses the
 * result with `rss-parser`, and maps each item to the shared
 * `BlogPostItem` shape used by /writing (T5.4) and /writing/[slug]
 * (T5.5).
 *
 * When the fetch fails (offline dev, Medium downtime, network
 * block), we fall back to the static `BLOG_POSTS` entries from
 * `data/blog.ts` — every Medium post stays surfaced.
 *
 * Source: portfolio-master-doc.md §2.5 (RSS at build time),
 * §6 rule #8 (never fetch RSS client-side).
 */

import "server-only";
import Parser from "rss-parser";
import {
  BLOG_POSTS,
  type BlogPostItem,
  type BlogCategory,
} from "@/data/blog";

const FEED_URL = "https://imehboob.medium.com/feed";

/* ===========================================================================
   rss-parser + types
   =========================================================================== */

const parser: Parser = new Parser();

interface MediumItem {
  title?: string;
  link?: string;
  pubDate?: string;
  /** Sometimes authored; we override with `categories`. */
  creator?: string;
  /** Comma-separated categories from Medium's RSS. */
  categories?: string[] | string;
  /** `contentSnippet` (RSS summary) when available. */
  contentSnippet?: string;
  content?: string;
  /** `isoDate` is the canonical timestamp. */
  isoDate?: string;
  /** Sometimes the GUID is the canonical URL. */
  guid?: string;
}

/* ===========================================================================
   Category inference
   =========================================================================== */

/** Pick the best BlogCategory for a Medium post given its tag list. */
function inferCategory(tags: string[]): BlogCategory {
  const t = tags.map((s) => s.toLowerCase());
  // Order matters — distributed beats platform, etc.
  if (t.some((x) => /^(distributed|rabbitmq|kafka|redis|microservices|cluster|ha|high-availability)/.test(x))) {
    return "distributed";
  }
  if (t.some((x) => /^(linux|networking|namespace|veth|bridge|nat|iptables)/.test(x))) {
    return "linux";
  }
  if (t.some((x) => /^(docker|container|kubernetes|k8s)/.test(x))) {
    return "docker";
  }
  if (t.some((x) => /^(ai|machine-learning|computer-vision|gemini|llm|webrtc)/.test(x))) {
    return "ai";
  }
  if (t.some((x) => /^(video|hls|dash|ffmpeg|streaming)/.test(x))) {
    return "video";
  }
  if (t.some((x) => /^(career|interview|resume)/.test(x))) {
    return "career";
  }
  // Default → platform (covers the bulk of the Medium posts).
  return "platform";
}

/* ===========================================================================
   Slug derivation
   =========================================================================== */

/**
 * Derive a URL slug from the post title. Matches Keystatic's
 * default slugifier behavior so the static registry and the RSS
 * merge produce consistent routes.
 */
function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

/* ===========================================================================
   Read-time estimation
   =========================================================================== */

/**
 * Estimate read time from the Medium post content. Medium's RSS
 * gives us a `contentSnippet`; we read rough words-per-minute (200)
 * based on it. The number lands on the same scale as native posts'
 * hand-set readMin.
 */
function estimateReadMin(snippet: string): number {
  if (!snippet) return 5;
  const words = snippet.split(/\s+/).filter(Boolean).length;
  // RSS snippets are ~25-30% of full body; inflate by ~4x.
  const inflated = words * 4;
  return Math.max(3, Math.round(inflated / 200));
}

/* ===========================================================================
   Mapping
   =========================================================================== */

/** Convert a raw Medium item into a BlogPostItem. */
function mapMediumItem(item: MediumItem): BlogPostItem | null {
  const title = (item.title ?? "").trim();
  if (!title) return null;
  const link = (item.link ?? item.guid ?? "").trim();
  if (!link) return null;

  // Categories can arrive as string[] or comma-separated string.
  const rawCats = item.categories;
  const tags = Array.isArray(rawCats)
    ? rawCats.map((c) => c.trim()).filter(Boolean)
    : (typeof rawCats === "string" ? rawCats.split(",").map((c) => c.trim()).filter(Boolean) : []);

  // Slug should match the static registry's slug when one exists.
  const staticMatch = BLOG_POSTS.find(
    (p) => p.source === "medium" && p.title.trim() === title,
  );
  const slug = staticMatch?.slug ?? slugFromTitle(title);

  // Excerpt — prefer the snippet; fall back to a no-frills trim.
  const snippet = (item.contentSnippet ?? item.content ?? "").trim();
  const excerpt =
    snippet.length > 0
      ? snippet.replace(/\s+/g, " ").slice(0, 220) + (snippet.length > 220 ? "…" : "")
      : staticMatch?.excerpt;

  return {
    slug,
    title,
    source: "medium",
    url: link,
    tags,
    readMin: estimateReadMin(snippet),
    category: staticMatch?.category ?? inferCategory(tags),
    excerpt,
    publishedAt: item.isoDate,
    series: staticMatch?.series,
    part: staticMatch?.part,
    projects: staticMatch?.projects,
    stack: staticMatch?.stack,
  };
}

/* ===========================================================================
   Fetch + cache
   =========================================================================== */

interface FetchOutcome {
  posts: BlogPostItem[];
  source: "rss" | "fallback";
  error?: string;
}

let cachedPromise: Promise<FetchOutcome> | null = null;

/**
 * Fetch + parse the Medium feed. Result is cached for the lifetime
 * of the process. The same call returns the same `Promise` — no
 * race conditions on concurrent first-hit requests.
 *
 * Next's `fetch()` cache + ISR handle the cross-build caching.
 */
export function fetchMediumPosts(): Promise<FetchOutcome> {
  if (!cachedPromise) {
    cachedPromise = doFetch().catch((err) => {
      // Last-resort: never throw. Degrade to the static fallback
      // so /writing always renders something.
      console.warn(
        "[medium-rss] fetch failed; falling back to static BLOG_POSTS:",
        err?.message ?? err,
      );
      return {
        posts: BLOG_POSTS.filter((p) => p.source === "medium"),
        source: "fallback" as const,
        error: err?.message ?? String(err),
      };
    });
  }
  return cachedPromise;
}

async function doFetch(): Promise<FetchOutcome> {
  // Use Next's `fetch` with ISR-style caching. The 1h revalidate keeps
  // the feed fresh between deploys without re-hitting Medium on every
  // request. The `noStore: false` (default) lets Next cache the GET.
  const res = await fetch(FEED_URL, {
    headers: {
      // Some RSS endpoints return XML or JSON depending on Accept.
      accept: "application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.8",
    },
    next: { revalidate: 3600 }, // 1 hour ISR
  });
  if (!res.ok) {
    throw new Error(`Medium feed HTTP ${res.status}`);
  }
  const xml = await res.text();
  const feed = await parser.parseString(xml);

  const mapped: BlogPostItem[] = [];
  for (const raw of feed.items ?? []) {
    const post = mapMediumItem(raw as unknown as MediumItem);
    if (post) mapped.push(post);
  }

  // De-dup by `slug` — Medium sometimes emits the same post twice
  // (canonical + non-canonical link flavors). Keep the first seen.
  const seen = new Set<string>();
  const deduped: BlogPostItem[] = [];
  for (const p of mapped) {
    if (seen.has(p.slug)) continue;
    seen.add(p.slug);
    deduped.push(p);
  }

  // Sort newest-first by `publishedAt`.
  deduped.sort((a, b) => {
    const at = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const bt = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return bt - at;
  });

  return { posts: deduped, source: "rss" };
}

/**
 * Read-only accessor for the static Medium registry — used by T5.4's
 * `/writing` page to render the listing when the RSS fetch hasn't
 * resolved yet (e.g. inside a Suspense boundary that wants to show
 * the page shell immediately).
 */
export function staticMediumPosts(): BlogPostItem[] {
  return BLOG_POSTS.filter((p) => p.source === "medium");
}