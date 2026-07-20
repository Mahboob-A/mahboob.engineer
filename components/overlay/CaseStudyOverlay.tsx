/**
 * components/overlay/CaseStudyOverlay.tsx
 *
 * Compact case-study layout used by the in-game overlay (T4.6).
 * Smaller than app/work/[slug]/page.tsx — that's the canonical full
 * version; this is the in-game snippet.
 *
 * Renders:
 *   - Header: status badge + year + name + tagline.
 *   - 2-col body: first 2 paragraphs of build notes (left) + the
 *     project's architecture diagram (right).
 *   - Metrics row: 4 chips with mono amber numbers.
 *   - Links row: outbound links (live / demo / source / video).
 *   - Footer: "read full case study" link + close button.
 *
 * Renders inside a `max-h-[90vh] overflow-y-auto` container so the
 * overlay scrolls on long-content projects. Diagram slot scales
 * naturally.
 *
 * Data comes from `data/projects.ts` — the canonical source for
 * project copy, metrics, notes, and links. The diagram picker
 * mirrors the diagram picker in app/work/[slug]/page.tsx.
 */

"use client";

import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { pickDiagram } from "@/components/diagrams/pickDiagram";
import { type ProjectItem } from "@/data/projects";

export interface CaseStudyOverlayProps {
  project: ProjectItem;
  /**
   * Fired when the user clicks "close ↩" or presses Escape. The
   * caller (game/index.tsx → OverlaySlot) wires this to
   * `bridge.closeOverlay()` so the React <-> Phaser contract is
   * owned by the parent.
   */
  onClose: () => void;
}

export function CaseStudyOverlay({
  project,
  onClose,
}: CaseStudyOverlayProps) {
  const Diagram = pickDiagram(project);

  /* First 2 paragraphs only — overlay is compact. Fall back to
     problem+built if notes is missing (matches app/work/[slug]
     fallback in BuildNotes). */
  const noteSource = project.notes ?? `${project.problem}\n\n${project.built}`;
  const noteParagraphs = noteSource
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 2);

  return (
    <div
      className="bg-surface border-acc/40 mx-auto flex max-h-full min-h-0 w-full max-w-[820px] flex-col overflow-hidden rounded-[12px] border shadow-2xl"
      role="dialog"
      aria-label={`${project.name} case study`}
    >
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <header className="border-border bg-surface flex shrink-0 items-start justify-between gap-4 border-b p-5">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex items-center gap-3">
            {/* The "complete" status from data/projects.ts isn't a
               BadgeVariant directly, but the cast + display-string
               fallback below handles it gracefully. */}
            <Badge variant={project.status as BadgeVariant}>
              {project.status === "live"
                ? "● live"
                : project.status === "building"
                  ? "building"
                  : "shipped"}
            </Badge>
            <span className="text-t3 font-mono text-[13px]">
              [{project.year}]
            </span>
          </div>
          <h2 className="font-display text-t1 text-[28px] leading-[1.1] font-bold tracking-[-0.5px]">
            {project.name}
          </h2>
          <p className="text-t2 font-mono text-[13px]">{project.tagline}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="bg-acc text-bg hover:bg-t1 shrink-0 rounded-[6px] px-4 py-2 font-mono text-[12px] font-semibold transition-colors"
        >
          back to game
        </button>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-5">
        {/* ─── Body — 2-col (notes left, diagram right) ──────────────── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
          {/* LEFT — first 2 paragraphs of notes */}
          <div className="flex flex-col gap-3">
            <p className="text-t3 font-mono text-[11px] tracking-[1px] uppercase">
              The build
            </p>
            <div className="text-t1 space-y-3 text-[14px] leading-[1.6]">
              {noteParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          {/* RIGHT — diagram */}
          <div className="bg-code-bg border-border flex min-h-[300px] items-center justify-center overflow-hidden rounded-[8px] border p-3 [&>section]:w-full [&_svg]:max-h-[360px] [&_svg]:w-full">
            {Diagram}
          </div>
        </div>

        {/* ─── Metrics row (4-up) ────────────────────────────────────── */}
        {project.metrics.length > 0 ? (
          <section className="mt-4">
            <p className="text-t3 mb-2 font-mono text-[11px] tracking-[1px] uppercase">
              Metrics
            </p>
            <div className="bg-bg border-border grid grid-cols-2 overflow-hidden rounded-[8px] border md:grid-cols-4">
              {project.metrics.slice(0, 4).map((m, i) => {
                /* First token = headline number ("<100ms", "22★"),
                   rest = label. Same parse shape as
                   app/work/[slug]/page.tsx → MetricsRow. */
                const [num, ...rest] = m.split(" ");
                return (
                  <div
                    key={i}
                    className={
                      "border-border px-3 py-2.5" +
                      (i < 3 ? " border-r" : "") +
                      (i < 2 ? " border-b md:border-b-0" : "")
                    }
                  >
                    <p className="text-amber font-mono text-[16px] leading-none font-semibold">
                      {num}
                    </p>
                    <p className="text-t3 mt-1.5 text-[11px] leading-[1.35]">
                      {rest.join(" ") || "—"}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* ─── Links row ─────────────────────────────────────────────── */}
        <section className="border-border mt-4 border-t pt-4">
          <p className="text-t3 mb-2 font-mono text-[11px] tracking-[1px] uppercase">
            Links
          </p>
          <div className="flex flex-wrap gap-2">
            {project.url ? (
              <OverlayLink href={project.url} label="live" external />
            ) : null}
            {project.demo ? (
              <OverlayLink href={project.demo} label="demo" external />
            ) : null}
            {project.github ? (
              <OverlayLink
                href={project.github}
                label="source"
                external
              />
            ) : null}
            {project.youtube ? (
              <OverlayLink
                href={project.youtube}
                label="video"
                external
              />
            ) : null}
          </div>
        </section>
      </main>

      {/* ─── Footer (link to full case study + close button) ─────── */}
      <footer className="border-border bg-surface flex shrink-0 flex-wrap items-center justify-between gap-3 border-t p-5">
        {/* Phase 36 fix: cross-page link from inside a game-mode
           overlay must drop the `mahboob_mode=game` cookie on the way
           out, otherwise the destination page's navbar renders with
           the "game" pill still active. POST through /api/mode with
           mode=flat + next=<dest>, same pattern as ActiveNavLink and
           LogoLink. <form className="contents"> makes the form a
           transparent layout wrapper so the button drives the visual. */}
        <form action="/api/mode" method="post" className="contents">
          <input type="hidden" name="mode" value="flat" />
          <input type="hidden" name="next" value={`/work/${project.slug}`} />
          <button
            type="submit"
            className="text-acc hover:text-t1 cursor-pointer font-mono text-[12px] underline-offset-4 hover:underline"
          >
            read full case study →
          </button>
        </form>
        <button
          type="button"
          onClick={onClose}
          className="bg-acc text-bg hover:bg-t1 rounded-[6px] px-5 py-2 font-mono text-[12px] font-semibold transition-colors"
        >
          back to game
        </button>
      </footer>
    </div>
  );
}

/** Internal: compact external-link button (matches the LinksRow
 *  shape in /work/[slug] but smaller). */
function OverlayLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="border-border text-t2 hover:border-acc/60 hover:text-acc inline-flex items-center gap-1.5 rounded-[6px] border px-3 py-1.5 font-mono text-[12px] transition-colors"
    >
      {label}
    </a>
  );
}
