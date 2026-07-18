/**
 * app/log/page.tsx
 *
 * Per master §2.1: "A hiring manager's deep-dive. Everything on the
 * landing is a summary. This page has the full story."
 *
 * Four sections, stacked vertically:
 *   1. Timeline         — full EXPERIENCE entries (not truncated)
 *   2. Education        — 2-col EDUCATION grid with `covered[]` chips
 *   3. Key achievements — 3 metric cards (35% / 17% / 1)
 *   4. What I'm doing now — 2-col row from NOW_STATUSES
 *
 * Pure Server Component (master §6 rule 7 — no client state). Static
 * at build time. No `localStorage`, no cookies.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { InnerLayout } from "@/components/layout/InnerLayout";
import { Chip } from "@/components/ui/Chip";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { pageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/cn";
import {
  EXPERIENCE,
  EDUCATION,
  KEY_ACHIEVEMENTS,
  NOW_STATUSES,
  type ExperienceItem,
  type EducationItem,
  type AchievementItem,
  type NowStatusItem,
} from "@/data/experience";
import { chipColor } from "@/data/tokens";
import { resolveStackSlug } from "@/data/stack-slug-map";

export const metadata: Metadata = pageMetadata(
  "Log",
  "The full record. Every role, every result, plus what I'm working on now.",
);

export default function LogPage() {
  return (
    <InnerLayout
      backHref="/"
      backLabel="← home"
      header={{
        num: "01",
        section: "DEPLOYMENT LOG",
        title: "The full record",
        description: "Work and education. In detail.",
      }}
    >
      <SectionSeparator label="EXPERIENCE" />
      <Timeline entries={EXPERIENCE} />

      <SectionSeparator label="EDUCATION & TRAINING" />
      <EducationGrid entries={EDUCATION} />

      <SectionSeparator label="KEY ACHIEVEMENTS ACROSS ALL ROLES" />
      <AchievementGrid items={KEY_ACHIEVEMENTS} />

      <SectionSeparator label="WHAT I'M DOING NOW" />
      <NowGrid items={NOW_STATUSES} />
    </InnerLayout>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SUBCOMPONENTS — file-local. /log is the only consumer of these patterns
   today; if /work or /writing need the same shell later, lift them into
   components/work/ and reuse.
   ───────────────────────────────────────────────────────────────────────── */

/* SectionSeparator — small caption with a hairline above it. Differentiates
   the four logical sections within the single InnerPageHeader container. */
function SectionSeparator({ label }: { label: string }) {
  return (
    <div className="border-border mt-16 mb-7 flex items-center gap-3 border-t pt-8 first-of-type:mt-0 first-of-type:border-t-0 first-of-type:pt-0">
      <span className="bg-acc inline-block h-[6px] w-[6px] rounded-full" />
      {/* Phase 6 (T6.9): promoted to <h2> so the per-section entries
         (which use <h3> for company / education card names) have a
         valid heading hierarchy. axe-core flagged the original as
         "heading-order" violation. Visually identical. */}
      <h2 className="text-t3 font-mono text-[11px] tracking-[1.5px] uppercase">
        {label}
      </h2>
    </div>
  );
}

/* Timeline — vertical left border, full bullets per entry. Mirrors the
   landing DeployLog pattern (stretched-link card + chip-deep-links)
   so a click anywhere on the card navigates to /log/[id] while
   individual chips navigate to /stack#<slug]. */
function Timeline({ entries }: { entries: ExperienceItem[] }) {
  return (
    <ol className="border-border ml-2 space-y-7 border-l-2 pl-7 md:ml-3 md:pl-9">
      {entries.map((entry) => (
        <li key={entry.id} className="relative">
          {/* Bullet on the timeline rail */}
          <span
            aria-hidden
            className="bg-acc border-bg absolute top-[18px] -left-[35px] inline-block h-3 w-3 rounded-full border-2 md:-left-[41px]"
          />

          <article className="bg-surface border-border hover:border-acc/40 relative rounded-[10px] border p-6 transition-colors md:p-7">
            {/* Top row: period · company · badge */}
            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[13px]">
              <span className="text-t3">[{entry.period}]</span>
              {entry.url ? (
                <Link
                  href={entry.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-t1 hover:text-acc font-body text-[16px] font-semibold transition-colors"
                >
                  {entry.company}
                </Link>
              ) : (
                <span className="text-t1 font-body text-[16px] font-semibold">
                  {entry.company}
                </span>
              )}
              <Badge variant={entry.status as BadgeVariant}>
                {entry.status === "active" ? "● active" : entry.status}
              </Badge>
            </div>

            {/* Role line — Phase 18: optionally append a small italic
               suffix (e.g. "Software Developer · including 2.5 months
               parttime") when `roleSuffix` is set on the entry. The
               suffix uses muted italic 12px so it reads as metadata
               about the role without competing with the bullets. */}
            <p className="text-t3 mb-4 text-[14px]">
              {entry.role}
              {entry.roleSuffix ? (
                <>
                  {" · "}
                  <span className="italic text-[12px]">{entry.roleSuffix}</span>
                </>
              ) : null}
            </p>

            {/* Bullets */}
            <ul className="text-t1 mb-5 flex flex-col gap-2.5 text-[14.5px] leading-[1.6]">
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
                clickable deep-link to /stack#<id>. Chips sit above the
                overlay (z-20) so their click wins over the card-level
                overlay (z-0). Mirrors DeployLog (T7.2 + T9.2). */}
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

            {/* Card-level overlay: covers the entire article (inset:0)
                with position: absolute so all text is selectable +
                chip clicks (z-20) win over this overlay. The card
                body remains clickable as a single target. Mirrors
                DeployLog's stretched-link pattern. */}
            <Link
              href={`/log/${entry.id}`}
              aria-label={`${entry.company} — experience details`}
              className="absolute inset-0 z-0 rounded-[10px] focus:outline-none focus-visible:ring-2 focus-visible:ring-acc"
            >
              <span className="sr-only">View {entry.company} details</span>
            </Link>
          </article>
        </li>
      ))}
    </ol>
  );
}

/* EducationGrid — 2-col on md+. Each card shows institution + degree +
   period + location. Phase 12 (T12.2): SRM's `courses[]` renders
   under a "curriculum" eyebrow (degree curriculum); Poridhi's
   `covered[]` renders under "covered" (short training). Both chip
   lists route through resolveStackSlug() (Phase 12 T12.3) — chips
   that resolve become `<Link href="/stack#<slug}">`; the rest fall
   back to plain chip. Same pattern as the Timeline component. */
function EducationGrid({ entries }: { entries: EducationItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {entries.map((entry) => (
        <article
          key={entry.institution}
          className="bg-surface border-border rounded-[10px] border p-6 md:p-7"
        >
          <h3 className="font-display text-t1 text-[20px] leading-[1.25] font-bold tracking-[-0.3px]">
            {entry.institution}
          </h3>
          <p className="text-t2 mt-2 text-[15px]">{entry.degree}</p>
          <p className="text-t3 mt-2 font-mono text-[12px]">
            [{entry.period}] · {entry.location}
          </p>
          {entry.courses?.length ? (
            <div className="mt-5">
              <p className="text-t3 mb-2 font-mono text-[11px] tracking-[1px] uppercase">
                curriculum
              </p>
              <div className="flex flex-wrap gap-1.5">
                {entry.courses.map((course) => (
                  <ClickableChip key={course} label={course} />
                ))}
              </div>
            </div>
          ) : null}
          {entry.covered?.length ? (
            <div className="mt-5">
              <p className="text-t3 mb-2 font-mono text-[11px] tracking-[1px] uppercase">
                covered
              </p>
              <div className="flex flex-wrap gap-1.5">
                {entry.covered.map((topic) => (
                  <ClickableChip key={topic} label={topic} />
                ))}
              </div>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

/* ClickableChip — Phase 12 (T12.3). One chip whose click-target
   resolves to /stack#<slug] when resolveStackSlug() returns a match,
   otherwise renders as a plain non-clickable chip. Used by both
   `covered` and `courses` chip lists in EducationGrid (and could
   be reused by Timeline in T11.1 — kept file-local for now since
   Timeline already has its own inline shape and refactoring it is
   out of scope). */
function ClickableChip({ label }: { label: string }) {
  const slug = resolveStackSlug(label);
  const chip = <Chip color={chipColor(label)}>{label}</Chip>;
  if (!slug) {
    return <span>{chip}</span>;
  }
  return (
    <Link
      href={`/stack#${slug}`}
      aria-label={`More about ${label} on /stack`}
      className="inline-block rounded-[4px]"
    >
      {chip}
    </Link>
  );
}

/* AchievementGrid — 3 metric cards in a row on md+. Big amber number,
   label below. Optional context line below that. */
function AchievementGrid({ items }: { items: AchievementItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-surface border-border rounded-[10px] border p-7"
        >
          <p className="text-amber font-mono text-[44px] leading-[1] font-bold tracking-[-1px]">
            {item.num}
          </p>
          <p className="text-t1 mt-3 text-[15px] font-semibold">{item.label}</p>
          {item.context ? (
            <p className="text-t3 mt-2 text-[12.5px] leading-[1.5]">
              {item.context}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/* NowGrid — 2-col row on md+. Each card has the project name, a status
   badge (active / building), the 2-sentence blurb, and a CTA link to
   either liveUrl (external) or /work/[slug] (internal). */
function NowGrid({ items }: { items: NowStatusItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {items.map((item) => {
        const href = item.liveUrl ?? `/work/${item.slug}`;
        const isExternal = item.liveUrl !== null;
        return (
          <article
            key={item.slug}
            className="bg-surface border-border rounded-[10px] border p-6 md:p-7"
          >
            <div className="mb-3 flex items-center gap-3">
              <h3 className="font-display text-t1 text-[22px] font-bold tracking-[-0.3px]">
                {item.name}
              </h3>
              <Badge variant={item.statusKind as BadgeVariant}>
                {item.statusKind === "active" ? "● active" : item.statusKind}
              </Badge>
            </div>
            <p className="text-t2 mb-5 text-[14.5px] leading-[1.6]">
              {item.status}
            </p>
            <Link
              href={href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer" : undefined}
              className={cn(
                "text-acc hover:text-t1 inline-flex items-center gap-1.5 font-mono text-[12px] transition-colors",
              )}
            >
              {isExternal ? "view live ↗" : "view case study →"}
            </Link>
          </article>
        );
      })}
    </div>
  );
}
