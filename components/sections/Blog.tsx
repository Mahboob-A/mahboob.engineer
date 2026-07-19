"use client";

/**
 * components/sections/Blog.tsx
 *
 * The "04 / THE BACKEND DIARIES" section on `/`. Per master §2 +
 * flat mockup §04: blog post cards in a responsive 1/2/3-col grid.
 *
 * Phase 6 (T7): collapse-after-6 with `?all=1` URL state. Shows
 * the first 6 cards by default; "Show N more" reveals the rest. URL
 * flag survives refresh + supports direct-link sharing. The toggle
 * uses `router.replace` so the back button skips the toggle state.
 *
 * Card rendering lifted to components/writing/BlogCard (T5.4).
 */

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BLOG_POSTS } from "@/data/blog";
import { BlogCard } from "@/components/writing/BlogCard";
import { FadeUp } from "@/components/motion";

const COLLAPSE_AT = 6;

export function Blog() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* URL-seeded initial state. Reading once on mount via lazy init. */
  const [expanded, setExpanded] = useState<boolean>(
    () => searchParams.get("all") === "1",
  );

  /* If the user navigates between / and /?all=1, sync state from
     the URL (e.g. opened a deep link). One-shot on each searchParams
     change — no infinite loop. */
  useEffect(() => {
    setExpanded(searchParams.get("all") === "1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    router.replace(next ? "/?all=1" : "/", { scroll: false });
  };

  const visible = expanded
    ? BLOG_POSTS
    : BLOG_POSTS.slice(0, COLLAPSE_AT);
  const remaining = BLOG_POSTS.length - COLLAPSE_AT;

  return (
    <FadeUp
      as="section"
      className="border-border scroll-mt-20 border-t pt-[45px] pb-[90px]"
      id="blog"
    >
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        {/* Section header */}
        <div className="mb-12">
          <h2 className="font-display text-t1 text-[clamp(28px,4vw,40px)] font-bold tracking-[-0.5px]">
            Writing, how I think, not just what I shipped.
          </h2>
          <p className="text-t2 mt-3 max-w-[520px] text-[15px]">
            Long-form breakdowns of systems, internals, and the bugs that taught me the
            most. Cross-posted from Medium + native posts.
          </p>
        </div>

        {/* 1-col → 2-col → 3-col grid. id="blog-list" so the toggle's
            aria-controls can point at it for assistive tech. */}
        <div
          id="blog-list"
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        {/* Collapse toggle. Hidden entirely when the registry fits in
            COLLAPSE_AT cards (defensive — guards future growth). */}
        {remaining > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={toggle}
              aria-expanded={expanded}
              aria-controls="blog-list"
              className="border-border text-t1 hover:border-acc hover:text-acc inline-flex items-center gap-2 rounded-md border px-5 py-2.5 font-mono text-[12px] font-medium transition-colors"
            >
              {expanded ? "Show fewer" : `Show ${remaining} more`}
              <span aria-hidden>{expanded ? "↑" : "↓"}</span>
            </button>
          </div>
        )}
      </div>
    </FadeUp>
  );
}