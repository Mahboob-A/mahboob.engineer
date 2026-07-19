/**
 * components/sections/DeployLog.tsx
 *
 * The "01 / DEPLOYMENT LOG" section on `/`. Renders a vertical timeline
 * of every entry in `data/experience.EXPERIENCE`. Per master §2 +
 * flat mockup lines 624–691.
 *
 * Layout (per entry card):
 *
 *   [Nov 2024 – Present]  NexBell Inc.          [● active]   ← top row
 *   Senior Backend Engineer — leading a small backend team     ← role
 *
 *   > Architected service boundaries and async pipelines …     ← bullets
 *   > Drove AWS infrastructure restructuring that cut …
 *   > …
 *
 *   [system design]  [django / drf]  [aws cost engineering]     ← chips
 *
 * Section header matches the pattern used by Hero / Projects /
 * SkillGraph / Blog / Contact — eyebrow + title + description
 * inside a `<section>` with id="log".
 *
 * Phase 7 (T7.2) — wrapping changes:
 *   - Each card has an absolutely-positioned overlay <Link> that
 *     covers the entire card area. Clicking anywhere on the card
 *     (except the chip elements) navigates to /log/[id].
 *   - Each tag chip is wrapped in its own <Link href="/stack#<slug>">
 *     when `resolveStackSlug` finds a match. The chip has
 *     `position: relative; z-index: 2` so its click wins over the
 *     card-level overlay. (Stretched-link pattern; no nested anchors.)
 *   - Same chip-pattern as `components/sections/Projects.tsx:163-184`.
 */

import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { EXPERIENCE, type ExperienceItem } from "@/data/experience";
import { chipColor } from "@/data/tokens";
import { FadeUp } from "@/components/motion";
import { resolveStackSlug } from "@/data/stack-slug-map";

export function DeployLog() {
  return (
    <FadeUp
      as="section"
      className="border-border scroll-mt-20 border-t py-[90px]"
      id="log"
    >
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        {/* Section header — Phase 25: eyebrow line dropped. */}
        <div className="mb-12">
          <h2 className="font-display text-t1 text-[clamp(28px,4vw,40px)] font-bold tracking-[-0.5px]">
            Where I&apos;ve shipped, what I built, and how it went.
          </h2>
          <p className="text-t2 mt-3 max-w-[520px] text-[15px]">
            A running log of roles. Not a timeline of titles. Record of what got
            deployed.
          </p>
        </div>

        {/* Entries */}
        <div className="space-y-4">
          {EXPERIENCE.map((entry) => (
            <ExperienceCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </FadeUp>
  );
}

interface ExperienceCardProps {
  entry: ExperienceItem;
}

function ExperienceCard({ entry }: ExperienceCardProps) {
  return (
    <article className="bg-surface border-border hover:border-acc/40 relative rounded-[10px] border p-6 transition-colors md:p-7">
      {/* Top row: date · company · badge */}
      <div className="mb-3.5 flex flex-wrap items-center gap-4 font-mono text-[13px]">
        <span className="text-t3">[{entry.period}]</span>
        <span className="text-t1 font-body text-[15px] font-semibold">
          {entry.company}
        </span>
        <Badge variant={entry.status as BadgeVariant}>
          {entry.status === "active" ? "● active" : entry.status}
        </Badge>
      </div>

      {/* Role line */}
      <p className="text-t3 mb-3.5 text-[14px]">{entry.role}</p>

      {/* Bullets */}
      <ul className="text-t1 mb-3.5 flex flex-col gap-2 text-[14.5px]">
        {entry.bullets.map((bullet, i) => (
          <li key={i} className="relative pl-5">
            <span
              aria-hidden
              className="text-acc absolute top-0 left-0 font-mono font-semibold"
            >
              &gt;
            </span>
            {bullet}
          </li>
        ))}
      </ul>

      {/* Tag chips — color computed from each tag via chipColor().
          Each chip that resolves via resolveStackSlug() becomes a
          clickable deep-link to /stack#<id>. Chips have a higher
          z-index than the card-level overlay (below) so their click
          wins. (Stretched-link pattern: the overlay <Link> covers the
          whole card, chips sit above it.) */}
      <div className="relative z-10 flex flex-wrap gap-2">
        {entry.tags.map((tag) => {
          const slug = resolveStackSlug(tag);
          const chip = <Chip color={chipColor(tag)}>{tag}</Chip>;
          if (!slug) {
            return <span key={tag}>{chip}</span>;
          }
          return (
            <Link
              key={tag}
              href={`/stack#${slug}`}
              aria-label={`More about ${tag} on /stack`}
              className="relative z-20 inline-block rounded-[4px]"
            >
              {chip}
            </Link>
          );
        })}
      </div>

      {/* Card-level overlay: covers the entire article (inset:0) with
          position: absolute so all text is selectable + chip clicks
          (z-20) win over this overlay. The card body remains
          clickable as a single target. */}
      <Link
        href={`/log/${entry.id}`}
        aria-label={`${entry.company} — experience details`}
        className="absolute inset-0 z-0 rounded-[10px] focus:outline-none focus-visible:ring-2 focus-visible:ring-acc"
      >
        <span className="sr-only">View {entry.company} details</span>
      </Link>
    </article>
  );
}