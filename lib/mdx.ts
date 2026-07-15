/**
 * lib/mdx.ts
 *
 * MDX compilation + frontmatter parsing for native blog posts
 * (Keystatic-managed, T5.1+). All callers live in /writing/[slug]
 * (T5.5) and any future inline MDX render sites.
 *
 * Pipeline:
 *   source (string)
 *     → remark-gfm (GitHub-flavored markdown tables, task lists, strikethrough)
 *     → rehype-slug (auto-id headings)
 *     → rehype-autolink-headings (anchor link on headings)
 *     → rehype-shiki (syntax highlighting, github-dark theme)
 *     → MDX compile (RSC-compatible)
 *
 * Custom MDX components are wired through the `components` prop of
 * `compileMDX`; see lib/mdx-components.tsx (T5.5).
 *
 * Source: portfolio-master-doc.md §2.5 spec, §3 stack.
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import { createHighlighter } from "shiki";
import remarkGfm from "remark-gfm";
import matter from "gray-matter";
import { mdxComponents } from "@/lib/mdx-components";

/* ===========================================================================
   Types
   =========================================================================== */

/** Frontmatter shape stored in MDX files (matches the Keystatic schema). */
export interface NativePostFrontmatter {
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  series?: string;
  part?: number;
  projects?: string[];
  stack?: string[];
  readMin: number;
  publishedAt?: string;
  /** Auto-injected by Keystatic; the file's basename. */
  slug?: string;
}

/** A single TOC entry — h2 / h3 only. */
export interface TocEntry {
  depth: 2 | 3;
  text: string;
  slug: string;
}

/** Result of loadNativePost — everything /writing/[slug] needs. */
export interface NativePost {
  slug: string;
  frontmatter: NativePostFrontmatter;
  /** Compiled MDX, ready to render via <MDXContent content={...} /> */
  content: React.ReactElement;
  toc: TocEntry[];
  /** Raw frontmatter-extracted body, useful for excerpts. */
  raw: string;
}

/* ===========================================================================
   Configuration
   =========================================================================== */

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

/** Shiki highlighter singleton — created once per process, shared by all renders. */
let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;
async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: [
        "bash",
        "css",
        "diff",
        "dockerfile",
        "go",
        "graphql",
        "html",
        "javascript",
        "json",
        "jsx",
        "markdown",
        "nginx",
        "python",
        "sql",
        "tsx",
        "typescript",
        "yaml",
      ],
    });
  }
  return highlighterPromise;
}

/* ===========================================================================
   Public API
   =========================================================================== */

/**
 * Read all native MDX post files. Returns file slugs (basename without
 * extension) — no parsing happens here.
 */
export async function listNativePostSlugs(): Promise<string[]> {
  try {
    const entries = await readdir(POSTS_DIR, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && e.name.endsWith(".mdx"))
      .map((e) => e.name.replace(/\.mdx$/, ""));
  } catch (err) {
    // Directory missing → no posts.
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

/**
 * Parse frontmatter from an MDX source string (without compiling the
 * MDX body). Uses gray-matter directly so we can inspect frontmatter
 * + body separately.
 */
export function parseFrontmatter<T extends NativePostFrontmatter = NativePostFrontmatter>(
  source: string,
): { frontmatter: T; content: string } {
  const { data, content } = matter(source);
  return {
    frontmatter: data as T,
    content,
  };
}

/**
 * Extract a table-of-contents from MDX source. Walks the unparsed
 * source for `##` and `###` headings and derives their slugs the
 * same way rehype-slug does (lowercase, non-alphanumerics → `-`,
 * collapse repeats, trim leading/trailing hyphens).
 */
export function extractToc(source: string): TocEntry[] {
  const { content } = parseFrontmatter(source);
  const lines = content.split(/\r?\n/);
  const toc: TocEntry[] = [];
  let inFence = false;
  for (const line of lines) {
    // Track code-fence state so we don't pick up headings inside ``` blocks.
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(##|###)\s+(.+?)\s*$/.exec(line);
    if (m) {
      const depth = (m[1].length as 2 | 3);
      const text = m[2].trim();
      toc.push({ depth, text, slug: slugify(text) });
    }
  }
  return toc;
}

/**
 * Slugify a heading text — matches rehype-slug's default behavior
 * (GitHub-style: lowercase, ASCII-only-ish, hyphen-separated).
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace runs of non-[a-z0-9] with single hyphen.
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Load a single native post by slug. Reads the MDX file, parses
 * frontmatter, compiles the body with the full plugin chain,
 * and returns a ready-to-render NativePost.
 *
 * Throws if the slug doesn't exist (the route handler catches the
 * error and returns notFound()).
 */
export async function loadNativePost(slug: string): Promise<NativePost> {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  const raw = await readFile(filePath, "utf-8");

  // Parse frontmatter so the rendered page has metadata.
  const { frontmatter } = parseFrontmatter<NativePostFrontmatter>(raw);

  // TOC must be extracted from the BODY (after frontmatter strip).
  const toc = extractToc(raw);

  // Compile MDX with the full plugin chain. Shiki is wired via a
  // pre-built highlighter so we don't pay the cost of building the
  // highlighter on every render.
  const highlighter = await getHighlighter();
  const { content } = await compileMDX({
    source: raw,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "wrap",
              properties: {
                className: "heading-anchor",
                ariaLabel: "Link to this section",
              },
            },
          ],
          [
            rehypeShikiFromHighlighter,
            highlighter,
            { themes: { light: "github-light", dark: "github-dark" } },
          ],
        ],
      },
      parseFrontmatter: false, // We parse with gray-matter separately.
    },
  });

  return {
    slug,
    frontmatter,
    content,
    toc,
    raw,
  };
}

/**
 * Load all native posts — used by /writing to surface native posts
 * alongside Medium cross-posts. Returns posts in the order they
 * appear in the file system (filename sort).
 */
export async function loadAllNativePosts(): Promise<NativePost[]> {
  const slugs = await listNativePostSlugs();
  const posts = await Promise.all(
    slugs.map((slug) =>
      loadNativePost(slug).catch((err) => {
        // Skip broken posts — don't crash the listing page.
        console.warn(`[mdx] failed to load post "${slug}":`, err);
        return null;
      }),
    ),
  );
  return posts.filter((p): p is NativePost => p !== null);
}

// (No additional exports beyond the public API above.)