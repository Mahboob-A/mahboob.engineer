/**
 * components/sections/Blog.tsx
 *
 * The "04 / THE BACKEND DIARIES" section on `/`. Per master §2 +
 * flat mockup §04 (lines 951–1001): 3 blog post cards in a
 * responsive 3-column grid (2-col on tablet, 1-col on mobile).
 *
 * Each card shows:
 *   - Source badge (medium / native) + read time
 *   - Title (display font, 18px)
 *   - 2-line excerpt (t2, 13.5px) — derived from `excerpt` if present,
 *     else truncated from `title` + first sentence of url-context
 *   - Tags (3 max, colored via chipColor)
 *   - "Read on medium/site ↗" link to the URL
 *
 * Data: `BLOG_POSTS` from data/blog.ts. All three current entries
 * are medium-sourced. Native posts (Phase 5 Keystatic) will appear
 * automatically once added to the registry.
 */

import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import { BLOG_POSTS, type BlogPostItem } from "@/data/blog";
import { chipColor } from "@/data/tokens";

export function Blog() {
  return (
    <section id="blog" className="border-border scroll-mt-20 border-t py-[90px]">
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        {/* Section header */}
        <div className="mb-12">
          <p className="text-acc mb-2.5 font-mono text-[13px] tracking-[1px]">
            04 / THE BACKEND DIARIES
          </p>
          <h2 className="font-display text-t1 text-[clamp(28px,4vw,40px)] font-bold tracking-[-0.5px]">
            Writing — how I think, not just what I shipped
          </h2>
          <p className="text-t2 mt-3 max-w-[520px] text-[15px]">
            Long-form breakdowns of systems, internals, and the bugs that taught me the
            most. Cross-posted from Medium + native posts.
          </p>
        </div>

        {/* 3-column grid → 2 on tablet → 1 on mobile */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface BlogCardProps {
  post: BlogPostItem;
}

function BlogCard({ post }: BlogCardProps) {
  const excerpt = post.excerpt ?? defaultExcerpt(post);
  const tags = post.tags.slice(0, 3);

  return (
    <article className="bg-surface border-border hover:border-acc/40 flex flex-col rounded-[10px] border p-6 transition-colors">
      {/* Top row: source badge + read time */}
      <div className="text-t3 mb-3.5 flex items-center justify-between font-mono text-[11px]">
        <span
          className={
            post.source === "medium"
              ? "rounded border border-[rgba(245,166,35,0.3)] bg-[rgba(245,166,35,0.06)] px-2 py-0.5 font-semibold tracking-[0.5px] text-[#f5a623]"
              : "text-acc rounded border border-[rgba(92,201,160,0.3)] bg-[rgba(92,201,160,0.06)] px-2 py-0.5 font-semibold tracking-[0.5px]"
          }
        >
          {post.source}
        </span>
        <span>{post.readMin} min read</span>
      </div>

      {/* Title */}
      <h3 className="font-display text-t1 mb-2.5 text-[18px] leading-[1.35] font-semibold">
        {post.title}
      </h3>

      {/* Excerpt */}
      <p className="text-t2 mb-[18px] flex-grow text-[13.5px]">{excerpt}</p>

      {/* Tags */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Chip key={tag} color={chipColor(tag)}>
            {tag}
          </Chip>
        ))}
      </div>

      {/* Read link */}
      <Link
        href={post.url}
        target="_blank"
        rel="noreferrer"
        className="text-acc hover:text-t1 inline-flex items-center gap-1.5 font-mono text-[12px] transition-colors"
      >
        {post.source === "medium" ? "read on medium" : "read on site"} ↗
      </Link>
    </article>
  );
}

/**
 * If the registry entry has no explicit `excerpt`, fall back to a
 * 2-line teaser derived from the title + tag list. This keeps the
 * card visually balanced for early Phase 5 native posts that may
 * not have a dedicated excerpt yet.
 */
function defaultExcerpt(post: BlogPostItem): string {
  if (post.series) {
    return `Part ${post.part ?? "?"} of the ${post.series} series.`;
  }
  if (post.tags.length > 0) {
    return `On ${post.tags.slice(0, 2).join(" / ")}.`;
  }
  return post.title;
}
