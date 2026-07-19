/**
 * components/work/StorySection.tsx
 *
 * Phase 24 (T24.6) — labeled story-stage renderer for the
 * case-study "The build" section on /work/[slug].
 *
 * Takes the project's `notes` string (or `problem + built`
 * fallback) and renders each paragraph with an amber mono
 * eyebrow label above it: [Idea] / [Framing] / [Build] /
 * [Deploy] / [What's next].
 *
 * 5 stages by default. Taply + NexBell keep their 6-paragraph
 * form (per the Phase 19 copy pass); their DEPLOY stage covers
 * the last 2 paragraphs. All other projects map 1 paragraph to
 * each of the 5 stages.
 *
 * Visual rhythm matches the rest of the case-study shell — the
 * same `bg-acc` accent dot + amber mono eyebrow pattern used on
 * `Related Projects` and elsewhere.
 */

const STAGE_LABELS = [
  "[Idea]",
  "[Framing]",
  "[Build]",
  "[Deploy]",
  "[What's next]",
] as const;

const STAGE_LABELS_LONG = [
  "[Idea]",
  "[Framing]",
  "[Build]",
  /* DEPLOY label covers 2 paragraphs on Taply / NexBell */
  "[Deploy]",
  "[Deploy]",
  "[What's next]",
] as const;

export interface StorySectionProps {
  /** The project's `notes` field, multi-paragraph string. */
  notes?: string;
  /** Fallback paragraph if notes is missing. */
  fallbackParagraph: string;
}

export function StorySection({ notes, fallbackParagraph }: StorySectionProps) {
  const paragraphs =
    notes && notes.trim().length > 0
      ? notes.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
      : [fallbackParagraph];

  const labels =
    paragraphs.length === 6 ? STAGE_LABELS_LONG : STAGE_LABELS;

  return (
    <div className="text-t1 max-w-[760px] text-[16.5px] leading-[1.7]">
      {paragraphs.map((p, i) => (
        <div key={i} className={i === 0 ? "" : "mt-8"}>
          <p className="text-amber mb-2 font-mono text-[13px] uppercase tracking-[1.2px]">
            {labels[i] ?? labels[labels.length - 1]}
          </p>
          <p>{p}</p>
        </div>
      ))}
    </div>
  );
}