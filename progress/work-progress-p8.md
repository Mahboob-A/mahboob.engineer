# Phase 8 — Diagram fixes + StoryPath snake

**Phase:** 8 — Diagram fixes + StoryPath snake
**Phase status:** in-progress
**Date started:** 2026-07-16

**Goal:** Fix two visual regressions surfaced from manual QA:

1. **Diagrams missing in cards.** On `/log/<id>` and `/work`, project cards
   were rendering a black panel with the literal word "diagram" instead
   of the actual SVG. Root cause: `<ProjectCard variant="featured">` was
   never receiving the `diagram` prop in `WorkShell.tsx` or in
   `RelatedProjects` on `/log/[id]`. Fix: extract a single shared
   `pickDiagram(project)` helper, wire it through every consumer.

2. **"The story" section rebuild.** The current `BuildNotes` in
   `/log/[id]` renders the 4-paragraph prose as a flat list. The user
   wants a snake-like curly path with 5 stages (IDEA → FRAMING → BUILD
   → DEPLOY → WHAT'S NEXT), each curl anchoring one paragraph. Animated
   amber packet travels along the path. Apply the frontend-design skill
   principles (subject-grounded, deliberate motion, signature element).

**Result:** Diagrams render on every project card across `/`, `/work`,
`/log/[id]`, and `/work/[slug]`. The story section becomes a visual
narrative.

Master plan tasks in this phase (T8.1 → T8.6):

1. **T8.1** — Extract shared `pickDiagram` helper
2. T8.2 — Wire diagrams into `/work` featured tier
3. T8.3 — Wire diagrams into `/log/[id]` RelatedProjects
4. T8.4 — Refactor `/work/[slug]` to use shared `pickDiagram`
5. T8.5 — Build `StoryPath` snake component
6. T8.6 — Replace `BuildNotes` with `StoryPath` on `/log/[id]`

---

## T8.1 — Extract shared pickDiagram helper

**Task status:** in-progress
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

- **`components/diagrams/pickDiagram.tsx`** — new shared helper
  (~70 lines). Switches on `project.slug`, returns the right
  `<XxxDiagram />` JSX element or `<DiagramPlaceholder />` for the
  5 showcase-tier projects that don't have a dedicated diagram.

### Decisions

- **`pickDiagram(project: ProjectItem)`** rather than `pickDiagram(slug: string)`.
  Two reasons:
  1. `<DiagramPlaceholder project={project} />` already needs the full
     `ProjectItem` (it shows the project's name + tagline). With slug
     input, we'd need a lookup table or a parallel "just the chrome"
     fallback. Keeping the input typed as `ProjectItem` matches
     `DiagramPlaceholder`'s existing API.
  2. The signature is more honest: the caller already has the project
     in hand (it's rendering the card); passing it through is one
     step, not two.
- **Switch covers 7 dedicated diagrams + 5 placeholders.** The
  `default` branch returns `<DiagramPlaceholder project={project} />`
  so any future project automatically gets the placeholder until a
  dedicated diagram is added. T8.1 doesn't list the 5 showcase slugs
  explicitly — the `default` is the catch-all.
- **Same JSDoc convention as `lib/...` helpers** — short description,
  usage list, and the "add a new diagram" runbook in the comment.

### Caveats / pending

- **No consumer wires this yet** — T8.2, T8.3, T8.4 each replace a
  duplicated switch with an import from this file.
- **`DiagramPlaceholder` requires `project`** — the `default` branch
  relies on the caller passing a valid `ProjectItem`. If a future
  call site only has a slug, it'll need a separate `pickDiagramBySlug`
  helper or a wrapper.
- **Pre-existing lint errors** unchanged.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes, 0 warnings. (New file, no consumer
  change yet — T8.2/T8.3/T8.4 wire it up.)

---

## T8.2 — Wire diagrams into /work featured tier

**Task status:** in-progress
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

- **`components/work/WorkShell.tsx`** — dropped the local
  `FOUNDER_DIAGRAMS` map + the `TaplyDiagram` / `UnthinkDiagram`
  imports. Imports `pickDiagram` from the shared helper. Passes
  `diagram={pickDiagram(p)}` to **both** the founder tier and the
  featured tier. Showcase tier still doesn't pass a diagram (no
  slot — by design).

### Decisions

- **`pickDiagram(p)` instead of `pickDiagram(p.slug)`** — the helper
  takes a `ProjectItem` (T8.1 decision). One-call caller-side.
- **Both tiers get the diagram prop** — founder (full-width stacked)
  and featured (2-col grid) both pass it. Showcase doesn't (compact
  card, no diagram slot in the design).
- **Featured cards now have working diagrams** — Algocode,
  Movio, DataLineage Doctor, DrishtiAI on `/work` all show their
  full architecture SVGs in the top panel of each card. The
  "diagram" placeholder (black panel + word) is gone.

### Caveats / pending

- **Showcase tier still shows no diagram** — intentional; showcase
  cards are compact (3-col grid) with no diagram slot.
- **Lighthouse perf / a11y unchanged** — same SVG bytes, just
  rendered now instead of held back.
- **Pre-existing lint errors** unchanged.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes, 0 warnings.
- **Live SSR'd HTML smoke** (`curl /work`):
  - 6 `<svg viewBox=...>` elements present in DOM.
  - `alg-p` (Algocode), `mov-p1..3` (Movio), `drishti-p1..5` (DrishtiAI),
    `drishti-p` (DrishtiAI), `datalineage` (DataLineage Doctor) path
    IDs all present.
  - Diagram node labels rendered: `django`, `nginx`, `Nginx`, `vCard`,
    `Redis broker`, `Gemini Flash` — confirms Taply + UnThink founder
    diagrams + featured tier diagrams all return real SVG markup.
  - The `bg-code-bg` placeholder panel is **no longer** a fallback
    for the featured tier.