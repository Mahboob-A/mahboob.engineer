/**
 * components/log/StoryPath.tsx
 *
 * Snake-path narrative section for /log/[id]. Replaces the previous
 * "The story" BuildNotes block. Five stages of an engineering story
 * — IDEA → FRAMING → BUILD → DEPLOY → WHAT'S NEXT — anchored along
 * a single SVG snake that zigzags down the column. An animated amber
 * packet travels along the snake (mirrors AnimatedPackets from the
 * case-study diagrams so the same visual language is reused).
 *
 * **Design rationale (frontend-design skill principles):**
 *
 *   - Subject: backend / infrastructure. The snake reads as a network
 *     topology or pipeline rather than decoration; each curl is a
 *     literal hop in a deployment arc. The dashed stroke matches the
 *     existing dotted-edge language from the skill graph (T2.5).
 *   - Type carries the personality: stage numbers + headings use the
 *     existing mono + uppercase pattern; body text stays in Inter
 *     for legibility. The snake itself is the visual signature.
 *   - One orchestrated moment: the amber packet traveling along the
 *     snake. No scattered effects — just the one moving element.
 *   - Restrained color: only `colors.amber` (path + packet) and
 *     `colors.acc` (stage dots). All token-driven — no inline hex.
 *
 * **Layout:**
 *
 *   - Mobile (< md): single column. Snake becomes a thin vertical
 *     dashed line down the left edge. Stages stack vertically,
 *     each with its dot anchored to the line.
 *   - md+: zigzag. Stages 1, 3, 5 on the left; stages 2, 4 on the
 *     right. Path connects them in reading order.
 *
 * Phase 8 (T8.5).
 */

import { AnimatedPackets } from "@/components/diagrams/DiagramPackets";

export interface StoryStage {
  /** Numbered eyebrow, e.g. "01". */
  number: string;
  /** Uppercase label, e.g. "IDEA". */
  label: string;
  /** Heading for the stage — the question / framing. */
  heading: string;
  /** The body prose for this stage. */
  body: string;
  /** Token color for the stage dot + numbering. */
  accent: "amber" | "acc" | "mauve";
}

export interface StoryPathProps {
  /** Five stages of the engineering story, in order. */
  stages: readonly [StoryStage, StoryStage, StoryStage, StoryStage, StoryStage];
}

const STAGE_LAYOUT_LG: ReadonlyArray<{
  /** Left or right column on md+. */
  side: "left" | "right";
  /** Y position of the dot on the snake (used to align the card). */
  y: number;
}> = [
  { side: "left", y: 60 },
  { side: "right", y: 260 },
  { side: "left", y: 460 },
  { side: "right", y: 660 },
  { side: "left", y: 860 },
];

const ACCENT_VAR: Record<StoryStage["accent"], string> = {
  amber: "var(--amber)",
  acc: "var(--acc)",
  mauve: "var(--mauve)",
};

export function StoryPath({ stages }: StoryPathProps) {
  return (
    <section>
      {/* Section header — matches the existing rhythm used by every
         section header in /log/[id] (Hero / BuildNotes / etc.). */}
      <div className="border-border mb-8 flex items-baseline gap-3 border-t pt-6">
        <span className="bg-amber inline-block h-[6px] w-[6px] rounded-full" />
        <h2 className="text-t3 font-mono text-[12px] tracking-[1.5px] uppercase">
          The story
        </h2>
        <span className="text-t3 font-mono text-[11px] italic">
          idea → framing → build → deploy → what&apos;s next
        </span>
      </div>

      <div className="story-path-relative relative mx-auto w-full max-w-[820px]">
        {/* Snake SVG layer — absolute, behind the cards. */}
        <SnakeLayer />

        {/* Stage cards */}
        <ol className="story-path-stages relative list-none p-0">
          {stages.map((stage, i) => {
            const layout = STAGE_LAYOUT_LG[i] ?? STAGE_LAYOUT_LG[0];
            const side = layout.side;
            const accentVar = ACCENT_VAR[stage.accent];
            return (
              <li
                key={stage.number}
                className={[
                  "story-path-stage",
                  // Mobile: full-width stack with left padding for the
                  // vertical line + dot.
                  "relative mb-8 pl-10 last:mb-0 md:mb-0",
                  // md+: alternate sides, span half the column,
                  // vertically centered on the snake's Y coordinate.
                  side === "left"
                    ? "md:ml-0 md:mr-auto md:pr-12 md:pl-0 md:text-right"
                    : "md:mr-0 md:ml-auto md:pl-12 md:pr-0 md:text-left",
                ].join(" ")}
                style={{ "--accent": accentVar } as React.CSSProperties}
              >
                {/* Mobile dot — left edge */}
                <span
                  className="story-path-dot-mobile md:hidden"
                  aria-hidden
                />

                {/* Eyebrow + label */}
                <p
                  className="text-t3 mb-1.5 font-mono text-[11px] tracking-[1.5px] uppercase"
                  style={{ color: accentVar }}
                >
                  <span className="font-semibold">{stage.number}</span>{" "}
                  <span aria-hidden>·</span> {stage.label}
                </p>

                {/* Heading */}
                <h3 className="font-display text-t1 mb-2 text-[20px] leading-[1.25] font-semibold tracking-[-0.3px]">
                  {stage.heading}
                </h3>

                {/* Body */}
                <p className="text-t2 text-[15px] leading-[1.65]">
                  {stage.body}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* The snake SVG: dashed cubic-bezier path zigzagging through the 5
   stage anchors. Pure SVG, no JS — the browser handles the dashed
   stroke natively. The animated amber packet rides the same path
   (AnimatedPackets uses <animateMotion> + <mpath> to follow the id'd
   curve). */
function SnakeLayer() {
  return (
    <svg
      className="story-path-snake pointer-events-none absolute inset-0 hidden h-full w-full md:block"
      viewBox="0 0 800 920"
      preserveAspectRatio="none"
      aria-hidden
    >
      {/* Main snake path — dashed cubic bezier connecting the 5 stage
         anchors. `stroke-dasharray: 4 3` matches the existing
         skill-graph / stack-graph dotted-edge language (T2.5 / T3.4). */}
      <path
        id="story-snake-path"
        d="M 400 60
           C 400 130, 100 130, 100 260
           C 100 390, 700 390, 700 460
           C 700 530, 100 530, 100 660
           C 100 790, 400 790, 400 860"
        fill="none"
        stroke="var(--border)"
        strokeWidth={1.5}
        strokeDasharray="4 3"
        strokeLinecap="round"
      />

      {/* Animated amber packet traveling along the path. Single packet
         — keeps the visual signature focused on "one thing moving",
         per the skill's "spend boldness in one place" principle. */}
      <AnimatedPackets
        groups={[{ edges: ["story-snake-path"], color: "amber", count: 1 }]}
        dur={6.4}
      />

      {/* Anchor dots at each stage's Y coordinate */}
      {STAGE_LAYOUT_LG.map((l, i) => {
        const x = l.side === "left" ? 100 : 700;
        return (
          <circle
            key={i}
            cx={x}
            cy={l.y}
            r={5}
            fill="var(--bg)"
            stroke="var(--border-strong)"
            strokeWidth={1.5}
          />
        );
      })}
    </svg>
  );
}

/**
 * Split a multi-paragraph `notes` string into 5 story stages.
 * The first 4 stages map to the first 4 paragraphs of `notes`
 * (split on `\n\n`). The 5th stage ("WHAT'S NEXT") is derived
 * from the entry's first bullet (the headline outcome) or a
 * generic closing line if bullets are absent.
 */
export function buildStoryStages(
  notes: string | undefined,
  bullets: readonly string[],
  fallbackParagraph: string,
): [StoryStage, StoryStage, StoryStage, StoryStage, StoryStage] {
  const paragraphs = notes && notes.trim().length > 0
    ? notes.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
    : [fallbackParagraph];
  // Pad to at least 5 entries — duplicate the last if notes has fewer.
  while (paragraphs.length < 5) {
    paragraphs.push(fallbackParagraph);
  }
  const [a, b, c, d, e] = paragraphs;

  const STAGE_ACCENTS: StoryStage["accent"][] = [
    "amber",
    "acc",
    "acc",
    "amber",
    "mauve",
  ];
  const STAGE_LABELS: [string, string, string, string, string] = [
    "IDEA",
    "FRAMING",
    "BUILD",
    "DEPLOY",
    "WHAT'S NEXT",
  ];
  const STAGE_NUMBERS: [string, string, string, string, string] = [
    "01",
    "02",
    "03",
    "04",
    "05",
  ];

  // Headings are derived from the entry's role + bullets when present
  // (gives the section a tight, scannable shape); otherwise the
  // paragraph's first sentence is used.
  const headingFromParagraph = (p: string): string => {
    const first = p.split(/(?<=[.!?])\s+/)[0] ?? p;
    return first.length > 90 ? first.slice(0, 87) + "…" : first;
  };
  const fallbackHeading = bullets[0]
    ? `${bullets[0].split(/[—.]/)[0].trim().slice(0, 70)}`
    : "The shape of the work";
  const headings: [string, string, string, string, string] = [
    headingFromParagraph(a),
    headingFromParagraph(b),
    headingFromParagraph(c),
    headingFromParagraph(d),
    bullets[0]
      ? `Outcome — ${bullets[0].split(/[—.]/)[0].trim().slice(0, 60)}`
      : headingFromParagraph(e),
  ];

  return [
    { number: STAGE_NUMBERS[0], label: STAGE_LABELS[0], heading: fallbackHeading, body: a, accent: STAGE_ACCENTS[0] },
    { number: STAGE_NUMBERS[1], label: STAGE_LABELS[1], heading: headings[1], body: b, accent: STAGE_ACCENTS[1] },
    { number: STAGE_NUMBERS[2], label: STAGE_LABELS[2], heading: headings[2], body: c, accent: STAGE_ACCENTS[2] },
    { number: STAGE_NUMBERS[3], label: STAGE_LABELS[3], heading: headings[3], body: d, accent: STAGE_ACCENTS[3] },
    { number: STAGE_NUMBERS[4], label: STAGE_LABELS[4], heading: headings[4], body: e, accent: STAGE_ACCENTS[4] },
  ];
}