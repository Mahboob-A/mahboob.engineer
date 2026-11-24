/**
 * components/writing/PostHeader.tsx
 *
 * Header block for /writing/[slug].
 * For native posts:
 *   - Clean title + publish date + read time
 *   - Prominent highlighted callout noting this is a summarized version
 *     with a direct link to the full original Medium article
 *   - Omit category badges and service tag chips
 * For medium posts:
 *   - Eyebrow category row + title + meta chips + external link
 */

import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import { type BlogPostItem, CATEGORIES, NATIVE_POST_MEDIUM_URLS } from "@/data/blog";
import { chipColor } from "@/data/tokens";

export interface PostHeaderProps {
  post: BlogPostItem;
  mediumUrl?: string;
}

export function PostHeader({ post, mediumUrl }: PostHeaderProps) {
  const isNative = post.source === "native";
  const canonicalMediumUrl =
    mediumUrl ??
    post.mediumUrl ??
    NATIVE_POST_MEDIUM_URLS[post.slug] ??
    "https://imehboob.medium.com";

  const categoryLabel = CATEGORIES.find((c) => c.id === post.category)?.label ?? post.category;
  const seriesLabel = post.series
    ? post.part
      ? `${post.series} · Part ${post.part}`
      : post.series
    : null;

  return (
    <header className="mb-10">
      {/* Eyebrow row: category + series/medium (medium posts only) */}
      {!isNative && (
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
          <span className="rounded border border-[rgba(245,166,35,0.3)] bg-[rgba(245,166,35,0.06)] px-2 py-0.5 font-semibold tracking-[0.5px] text-[#f5a623]">
            medium
          </span>
        </div>
      )}

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

        {/* Tags chips (medium posts only) */}
        {!isNative && post.tags.length > 0 && (
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

      {/* Highlighted callout section (native posts only) */}
      {isNative && (
        <div className="border-amber/40 bg-amber/[0.06] mb-8 rounded-[8px] border p-4 sm:p-5 font-mono">
          <div className="flex items-start gap-3">
            <span className="text-amber mt-0.5 select-none text-[15px]" aria-hidden>
              ✦
            </span>
            <div className="flex-1 text-[13px] leading-relaxed">
              <div className="text-amber mb-1.5 font-semibold uppercase tracking-[0.5px]">
                AI-Generated Summary
              </div>
              <p className="text-t2 mb-3 font-sans text-[14px]">
                This article is an intentionally concise, AI-generated summary of my original deep-dive writing. For the complete, long-form breakdown with full architecture context and implementation details, read the original blog on Medium.
              </p>
              <a
                href={canonicalMediumUrl}
                target="_blank"
                rel="noreferrer"
                className="border-amber/50 text-amber hover:border-amber inline-flex items-center gap-1.5 rounded-[6px] border bg-amber-dim px-3 py-1.5 text-[12px] font-semibold transition-colors"
              >
                Read original blog on Medium ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Visit Medium link (medium posts only) */}
      {!isNative && post.source === "medium" && (
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
