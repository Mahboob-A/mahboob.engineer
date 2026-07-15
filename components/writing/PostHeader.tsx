/**
 * components/writing/PostHeader.tsx
 *
 * Header block for /writing/[slug]. Back link + category/series
 * label row + title + meta row + tag chips.
 *
 * Source: portfolio-master-doc.md §2.5.
 */

import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import type { BlogPostItem } from "@/data/blog";
import { chipColor } from "@/data/tokens";
import { CATEGORIES } from "@/data/blog";

export interface PostHeaderProps {
  post: BlogPostItem;
}

export function PostHeader({ post }: PostHeaderProps) {
  const categoryLabel = CATEGORIES.find((c) => c.id === post.category)?.label ?? post.category;
  const seriesLabel = post.series
    ? post.part
      ? `${post.series} · Part ${post.part}`
      : post.series
    : null;

  return (
    <header className="mb-10">
      {/* Back link */}
      <Link
        href="/writing"
        className="text-t3 hover:text-t1 mb-6 inline-flex items-center gap-1.5 font-mono text-[12px] transition-colors"
        aria-label="Back to all posts"
      >
        ← all posts
      </Link>

      {/* Eyebrow row: category + series/medium */}
      <div className="text-t3 mb-3 flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-[1.5px] uppercase">
        <Link
          href={`/writing#category-${post.category}`}
          className="border-border hover:border-acc text-t3 hover:text-acc rounded-full border px-2.5 py-0.5 transition-colors"
        >
          {categoryLabel}
        </Link>
        {seriesLabel && (
          <span className="text-amber">{seriesLabel}</span>
        )}
        <span
          className={
            post.source === "medium"
              ? "rounded border border-[rgba(245,166,35,0.3)] bg-[rgba(245,166,35,0.06)] px-2 py-0.5 font-semibold tracking-[0.5px] text-[#f5a623]"
              : "text-acc rounded border border-[rgba(92,201,160,0.3)] bg-[rgba(92,201,160,0.06)] px-2 py-0.5 font-semibold tracking-[0.5px]"
          }
        >
          {post.source}
        </span>
      </div>

      {/* Title */}
      <h1 className="font-display text-t1 mb-4 text-[clamp(32px,5vw,52px)] font-bold leading-[1.08] tracking-[-1px]">
        {post.title}
      </h1>

      {/* Meta row */}
      <div className="text-t3 mb-6 flex flex-wrap items-center gap-3 font-mono text-[12px]">
        {post.publishedAt && (
          <span>
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        )}
        {post.publishedAt && <span aria-hidden>·</span>}
        <span>{post.readMin} min read</span>
        {post.tags.length > 0 && (
          <>
            <span aria-hidden>·</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {post.tags.slice(0, 4).map((tag) => (
                <Chip key={tag} color={chipColor(tag)}>
                  {tag}
                </Chip>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Visit Medium link (medium posts only) */}
      {post.source === "medium" && (
        <Link
          href={post.url}
          target="_blank"
          rel="noreferrer"
          className="border-amber/40 text-amber hover:border-amber inline-flex items-center gap-1.5 self-start rounded-[6px] border bg-amber-dim px-3 py-1.5 font-mono text-[12px] font-semibold transition-colors"
        >
          read on medium ↗
        </Link>
      )}
    </header>
  );
}
