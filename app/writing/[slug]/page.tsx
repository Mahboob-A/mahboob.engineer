/**
 * app/writing/[slug]/page.tsx
 *
 * Individual post page. Per master §2.5:
 *   - Native posts (slug matches a content/posts/<slug>.mdx file)
 *     render the MDX content with Shiki + GFM + auto-id headings.
 *   - Medium posts (slug in BLOG_POSTS, source === "medium")
 *     redirect to the canonical Medium URL via Next's `redirect()`.
 *
 * Layout:
 *   - PostHeader (back link + title + meta + tags)
 *   - 2-col body: MDX (left) + Sticky TOC (right, hidden <md)
 *   - RelatedProjects (chip cards → /work/[slug])
 *   - RelatedStack (chips → /stack#[tech-id])
 *   - SeriesNav (prev / next when the post is in a series)
 *   - Bottom note: "Edit in Keystatic" link for native posts.
 *
 * Source: portfolio-master-doc.md §2.5, §6.
 */

import { notFound, redirect } from "next/navigation";
import { InnerLayout } from "@/components/layout/InnerLayout";
import { PostHeader } from "@/components/writing/PostHeader";
import { PostTOC } from "@/components/writing/PostTOC";
import { RelatedProjects } from "@/components/writing/RelatedProjects";
import { RelatedStack } from "@/components/writing/RelatedStack";
import { SeriesNav } from "@/components/writing/SeriesNav";
import { loadNativePost, listNativePostSlugs } from "@/lib/mdx";
import { BLOG_POSTS_BY_SLUG } from "@/data/blog";
import { blogMetadata, pageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

/* ===========================================================================
   Static params
   =========================================================================== */

/** Generate static params for all native post slugs. Medium posts
 *  match the slug too but trigger `redirect()` at render time. */
export async function generateStaticParams() {
  const slugs = await listNativePostSlugs();
  // Add Medium slugs as well — they'll redirect at render, but
  // including them lets Vercel pre-render the route (so the first
  // hit doesn't trigger a cold dynamic invocation).
  const nativeSet = new Set(slugs);
  const mediumSlugs = Object.values(BLOG_POSTS_BY_SLUG)
    .filter((p) => p.source === "medium" && !nativeSet.has(p.slug))
    .map((p) => ({ slug: p.slug }));
  return [
    ...slugs.map((slug) => ({ slug })),
    ...mediumSlugs,
  ];
}

/* ===========================================================================
   Metadata
   =========================================================================== */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // Native post: load + render metadata.
  if (await isNativeSlug(slug)) {
    try {
      const post = await loadNativePost(slug);
      return blogMetadata({
        title: post.frontmatter.title,
        excerpt: post.frontmatter.excerpt,
        slug,
        readMin: post.frontmatter.readMin,
      });
    } catch {
      return pageMetadata("Post not found", "");
    }
  }

  // Medium post: just the title from the registry.
  const staticEntry = BLOG_POSTS_BY_SLUG[slug];
  if (staticEntry?.source === "medium") {
    return blogMetadata({
      title: staticEntry.title,
      excerpt: staticEntry.excerpt ?? "",
      slug,
      readMin: staticEntry.readMin,
    });
  }

  return pageMetadata("Post not found", "");
}

/* ===========================================================================
   Helpers
   =========================================================================== */

async function isNativeSlug(slug: string): Promise<boolean> {
  const slugs = await listNativePostSlugs();
  return slugs.includes(slug);
}

/* ===========================================================================
   Page
   =========================================================================== */

export default async function WritingPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Medium path: 308 redirect to the canonical Medium URL.
  const staticEntry = BLOG_POSTS_BY_SLUG[slug];
  if (staticEntry?.source === "medium") {
    redirect(staticEntry.url);
  }

  // Native path: load + render.
  let post;
  try {
    post = await loadNativePost(slug);
  } catch {
    notFound();
  }

  // Build a BlogPostItem-shaped value so PostHeader (shared with
  // the /writing list) can accept it.
  const headerPost = {
    slug,
    title: post.frontmatter.title,
    source: "native" as const,
    url: `/writing/${slug}`,
    tags: post.frontmatter.tags ?? [],
    readMin: post.frontmatter.readMin,
    category: post.frontmatter.category as
      | "distributed"
      | "linux"
      | "docker"
      | "video"
      | "ai"
      | "platform"
      | "career",
    excerpt: post.frontmatter.excerpt,
    series: post.frontmatter.series,
    part: post.frontmatter.part,
    projects: post.frontmatter.projects,
    stack: post.frontmatter.stack,
    publishedAt: post.frontmatter.publishedAt,
  };

  return (
    <InnerLayout
      backHref="/writing"
      backLabel="← all posts"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
        {/* Main column */}
        <article className="min-w-0 flex-1">
          <PostHeader post={headerPost} />

          {/* Rendered MDX content */}
          <div className="prose-backend">{post.content}</div>

          {/* Bottom blocks */}
          {headerPost.projects && headerPost.projects.length > 0 && (
            <RelatedProjects projectSlugs={headerPost.projects} />
          )}
          {headerPost.stack && headerPost.stack.length > 0 && (
            <RelatedStack stackIds={headerPost.stack} />
          )}
          <SeriesNav post={headerPost} />

          {/* Edit-in-Keystatic note (native posts only) */}
          <div className="border-border mt-12 border-t pt-6 text-center">
            <a
              href="/keystatic"
              target="_blank"
              rel="noreferrer"
              className="text-t3 hover:text-acc inline-flex items-center gap-1.5 font-mono text-[12px] transition-colors"
            >
              ✎ edit this post in Keystatic
            </a>
          </div>
        </article>

        {/* Sidebar (sticky TOC on lg+) */}
        <aside className="lg:w-[220px] lg:flex-shrink-0">
          <PostTOC toc={post.toc} />
        </aside>
      </div>
    </InnerLayout>
  );
}
