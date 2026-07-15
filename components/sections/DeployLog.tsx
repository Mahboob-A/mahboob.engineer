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
 */

import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { EXPERIENCE, type ExperienceItem } from "@/data/experience";
import { chipColor } from "@/data/tokens";
import { FadeUp } from "@/components/motion";

export function DeployLog() {
  return (
    <FadeUp
      as="section"
      className="border-border scroll-mt-20 border-t py-[90px]"
      id="log"
    >
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        {/* Section header */}
        <div className="mb-12">
          <p className="text-acc mb-2.5 font-mono text-[13px] tracking-[1px]">
            01 / DEPLOYMENT LOG
          </p>
          <h2 className="font-display text-t1 text-[clamp(28px,4vw,40px)] font-bold tracking-[-0.5px]">
            Where I&apos;ve shipped
          </h2>
          <p className="text-t2 mt-3 max-w-[520px] text-[15px]">
            A running log of roles — not a timeline of titles, a record of what got
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
    <article className="bg-surface border-border hover:border-acc/40 rounded-[10px] border p-6 transition-colors md:p-7">
      {/* Top row: date · company · badge */}
      <div className="mb-3.5 flex flex-wrap items-center gap-4 font-mono text-[13px]">
        <span className="text-t3">[{entry.period}]</span>
        {entry.url ? (
          <Link
            href={entry.url}
            target="_blank"
            rel="noreferrer"
            className="text-t1 font-body hover:text-acc text-[15px] font-semibold transition-colors"
          >
            {entry.company}
          </Link>
        ) : (
          <span className="text-t1 font-body text-[15px] font-semibold">
            {entry.company}
          </span>
        )}
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

      {/* Tag chips — color computed from each tag via chipColor() */}
      <div className="flex flex-wrap gap-2">
        {entry.tags.map((tag) => (
          <Chip key={tag} color={chipColor(tag)}>
            {tag}
          </Chip>
        ))}
      </div>
    </article>
  );
}
