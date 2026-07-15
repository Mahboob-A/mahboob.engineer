/**
 * app/writing/page.tsx
 *
 * T4.12 stub: a placeholder for the Backend Diaries HQ landing
 * page. T3.7 (which shipped the real list of native posts) was
 * deferred to Phase 5 per master §1.1. T4.12 needs the route to
 * exist so the game's "Backend Diaries HQ" special building can
 * navigate to it.
 *
 * Phase 5 replaces the body with a real list of native posts (or
 * Medium cross-posts via T5.4's Medium RSS fetcher). For now: a
 * centered placeholder + a "back to home" link.
 */
import Link from "next/link";
import { InnerLayout } from "@/components/layout/InnerLayout";
import { pageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata(
  "Writing",
  "Backend diary — coming soon. Native posts ship in Phase 5.",
);

export default function WritingPage() {
  return (
    <InnerLayout
      backHref="/"
      backLabel="← home"
      header={{
        num: "07",
        section: "WRITING",
        title: "Backend diary",
        description: "Native posts and long-form breakdowns. Coming soon.",
      }}
    >
      <div className="bg-surface border-border mx-auto flex max-w-[640px] flex-col gap-3 rounded-[10px] border p-8 text-center">
        <p className="text-t3 font-mono text-[11px] tracking-[1.5px] uppercase">
          Phase 5
        </p>
        <h2 className="font-display text-t1 text-[24px] leading-[1.1] font-bold tracking-[-0.5px]">
          Coming soon
        </h2>
        <p className="text-t2 text-[14px] leading-[1.55]">
          The backend diary ships with native posts + Medium cross-posts
          in a later phase. For now, return to the game or the home
          page.
        </p>
        <Link
          href="/"
          className="bg-acc text-bg hover:bg-t1 mt-2 inline-flex items-center gap-1.5 self-center rounded-[6px] px-4 py-2 font-mono text-[12px] font-semibold transition-colors"
        >
          ← back to home
        </Link>
      </div>
    </InnerLayout>
  );
}