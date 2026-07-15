/**
 * components/sections/Blog.tsx
 *
 * The "04 / THE BACKEND DIARIES" section on `/`. Per master §2 +
 * flat mockup §04 (lines 951–1001): 3 blog post cards in a
 * responsive 3-column grid (2-col on tablet, 1-col on mobile).
 *
 * Card rendering lifted to components/writing/BlogCard (T5.4).
 * This file is just the section chrome + grid.
 */

import { BLOG_POSTS } from "@/data/blog";
import { BlogCard } from "@/components/writing/BlogCard";

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
