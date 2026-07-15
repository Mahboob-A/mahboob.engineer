/**
 * components/writing/BlogCard.tsx
 *
 * Single-source blog post card. Reused across:
 *   - Landing page section (components/sections/Blog.tsx)
 *   - /writing list (T5.4)
 *   - Related-writing section on /work/[slug] case studies (T3.3)
 *
 * Lift from T2.6's local BlogCard; same visual chrome + behavior,
 * now with a `variant` prop for the /writing list's "compact" vs
 * "featured" needs. Default ("default") is the original T2.6 look.
 *
 * Source: portfolio-master-doc.md §2.5.
 */

import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import type { BlogPostItem } from "@/data/blog";
import { chipColor } from "@/data/tokens";

export type BlogCardVariant = "default" | "compact" | "featured";

export interface BlogCardProps {
  post: BlogPostItem;
  /** Display variant. `default` mirrors T2.6; `featured` is the
   *  hero card on /writing with a bigger excerpt + accent border;
   *  `compact` is for related-writing sidebars. */
  variant?: BlogCardVariant;
}

/** Source badge class — extracted so it can be reused on the writing
 *  page filters and the /writing header. */
export function sourceBadgeClass(source: BlogPostItem["source"]): string {
  if (source === "medium") {
    return "rounded border border-[rgba(245,166,35,0.3)] bg-[rgba(245,166,35,0.06)] px-2 py-0.5 font-semibold tracking-[0.5px] text-[#f5a623]";
  }
  return "text-acc rounded border border-[rgba(92,201,160,0.3)] bg-[rgba(92,201,160,0.06)] px-2 py-0.5 font-semibold tracking-[0.5px]";
}

export function BlogCard({ post, variant = "default" }: BlogCardProps) {
  const excerpt = post.excerpt ?? defaultExcerpt(post);
  const tags = post.tags.slice(0, 3);
  const isFeatured = variant === "featured";

  return (
    <article
      className={
        isFeatured
          ? "bg-surface border-acc/40 hover:border-acc flex flex-col rounded-[10px] border-2 p-7 transition-colors"
          : variant === "compact"
            ? "bg-surface border-border hover:border-acc/40 flex flex-col rounded-[8px] border p-4 transition-colors"
            : "bg-surface border-border hover:border-acc/40 flex flex-col rounded-[10px] border p-6 transition-colors"
      }
    >
      {/* Top row: source badge + read time */}
      <div className="text-t3 mb-3.5 flex items-center justify-between font-mono text-[11px]">
        <span className={sourceBadgeClass(post.source)}>{post.source}</span>
        <span>{post.readMin} min read</span>
      </div>

      {/* Title */}
      <h3
        className={
          isFeatured
            ? "font-display text-t1 mb-3 text-[24px] leading-[1.25] font-bold"
            : variant === "compact"
              ? "font-display text-t1 mb-2 text-[15px] leading-[1.35] font-semibold"
              : "font-display text-t1 mb-2.5 text-[18px] leading-[1.35] font-semibold"
        }
      >
        {post.title}
      </h3>

      {/* Excerpt */}
      <p
        className={
          isFeatured
            ? "text-t2 mb-5 flex-grow text-[15px] leading-[1.55]"
            : "text-t2 mb-[18px] flex-grow text-[13.5px]"
        }
      >
        {excerpt}
      </p>

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
        target={post.source === "medium" ? "_blank" : undefined}
        rel={post.source === "medium" ? "noreferrer" : undefined}
        className="text-acc hover:text-t1 inline-flex items-center gap-1.5 font-mono text-[12px] transition-colors"
      >
        {post.source === "medium" ? "read on medium" : "read on site"} ↗
      </Link>
    </article>
  );
}

/**
 * If the registry entry has no explicit `excerpt`, fall back to a
 * 2-line teaser derived from the title + tag list. Kept exported
 * so consumers can preview the excerpt shape without rendering.
 */
export function defaultExcerpt(post: BlogPostItem): string {
  if (post.series) {
    return `Part ${post.part ?? "?"} of the ${post.series} series.`;
  }
  if (post.tags.length > 0) {
    return `On ${post.tags.slice(0, 2).join(" / ")}.`;
  }
  return post.title;
}
