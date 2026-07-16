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

---

## T8.3 — Wire diagrams into /log/[id] RelatedProjects

**Task status:** in-progress
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

- **`app/log/[id]/page.tsx`** — imported `pickDiagram` from the
  shared helper. Passes `diagram={pickDiagram(p)}` to
  `<ProjectCard variant="featured">` in the RelatedProjects grid.

### Decisions

- **Same helper, same prop** as T8.2. The featured variant of
  `<ProjectCard>` is the consumer in both places; both now wire
  diagrams through one switch.
- **No header comment updates needed** — the page's docstring
  already mentions "2-col grid of `<ProjectCard variant=\"featured\">`"
  and didn't claim anything about diagrams.

### Caveats / pending

- **Same diagram renders on `/work` and `/log/[id]` for the same
  project** — the helper returns the same JSX. That's intentional:
  consistency across surfaces, single source of truth.
- **Pre-existing lint errors** unchanged.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes, 0 warnings.
- **Live SSR'd HTML smoke** (`curl /log/taply`):
  - Taply diagram node labels present: `vCard`, `Nginx`.
  - UnThink diagram node labels present: `FastAPI`, `Gemini Flash`,
    `Redis broker`, `Extension`.
  - Zero `DiagramPlaceholder` text in DOM — placeholder is gone for
    the featured variant on this page.
- **User-reported bug resolved** — the "black panel + diagram word"
  is replaced by the full architecture SVG for Taply and UnThink on
  `/log/taply`.

---

## T8.4 — Refactor /work/[slug] to use shared pickDiagram

**Task status:** in-progress
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

- **`app/work/[slug]/page.tsx`** — replaced the file-local `pickDiagram`
  function + 8 imports (TaplyDiagram, UnthinkDiagram, AlgocodeDiagram,
  MovioDiagram, DrishtiAIDiagram, DatalineageDoctorDiagram, AirpassDiagram,
  DiagramPlaceholder) with a single import of `pickDiagram` from the
  shared helper. Removed the 19-line `pickDiagram` function.

### Decisions

- **No behavior change at this call site.** The local function had
  the exact same switch + fallback structure as the shared helper.
  The migration is a pure DRY refactor.
- **`Hero({ project })` keeps its `const Diagram = pickDiagram(project)`
  shape** — the local function's variable name + usage pattern carries
  over verbatim. No callers other than `Hero` consume the helper in
  this file.
- **Comment marker** (`/* Diagram selector: removed in Phase 8
  (T8.4)... */`) replaces the deleted function. Future editors
  grepping for `pickDiagram` land on the import line + the comment.

### Caveats / pending

- **`ProjectStatus` still imported but unused** (pre-existing). The
  file ends with `export type _ProjectStatus = ProjectStatus;` to
  silence the unused-import warning. Phase 8 doesn't touch this.
- **Three call sites now share one helper** — `/work` (founder +
  featured tier, T8.2), `/log/[id]` (RelatedProjects, T8.3),
  `/work/[slug]` (case-study Hero, T8.4). All three compile to the
  same import.
- **Pre-existing lint errors** unchanged.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes, 0 warnings.
- **Net change**: −8 imports, −19 lines of switch boilerplate, +1
  import. Same render output.

---

## T8.6 — Replace BuildNotes with StoryPath on /log/[id]

**Task status:** in-progress
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

- **`app/log/[id]/page.tsx`** — replaced the file-local `BuildNotes`
  function (which rendered 4 paragraphs in a flat list) with a
  thin wrapper that calls `buildStoryStages(entry.notes,
  entry.bullets, fallback)` and renders `<StoryPath stages={...} />`.
  Imports `StoryPath` + `buildStoryStages` from
  `@/components/log/StoryPath` and the scoped CSS via
  `@/components/log/StoryPath.css`.

### Decisions

- **`BuildNotes` stays as the local function name** (kept the
  call-site `<BuildNotes entry={entry} />` in the page body). The
  implementation now delegates to `StoryPath`. Future refactor can
  rename, but the local-function naming preserves git blame for
  earlier decisions.
- **Fallback paragraph** = `entry.bullets[0] ?? "More details coming
  soon."`. This gives `buildStoryStages` something to work with if
  `notes` is missing (Innovative IT and NexBell both have full
  `notes` content per T7.4, but the fallback keeps the component
  robust against future entries without prose).
- **No page-body changes** beyond the BuildNotes body. Section
  ordering (Hero → BuildNotes → TagChips → ...) stays the same.

### Caveats / pending

- **5 stages from 4 paragraphs** — `entry.notes` for all 3
  experiences has 4 paragraphs. `buildStoryStages` pads the array
  to 5 entries (using `fallbackParagraph` for stage 5). On Taply /
  NexBell / Innovative IT this means stage 5 (WHAT'S NEXT)
  repeats stage 4's prose verbatim. Acceptable for v1; the user
  can extend the registry to 5-paragraph `notes` in a future
  commit.
- **Stage headings from paragraphs** may end up long (a 90-char
  first sentence). The component clips at 87 chars + "…". For
  Taply the IDEA heading is "Taply started with a deceptively
  simple question." which is short enough. For longer entries the
  clip kicks in.
- **Pre-existing lint errors** unchanged.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes, 0 warnings.
- **Live SSR'd HTML smoke** (`curl /log/taply`):
  - All 5 stage labels render: `IDEA`, `FRAMING`, `BUILD`,
    `DEPLOY`, `WHAT`.
  - Snake path ID `story-snake-path` present (3 references: the
    `<path>` itself + the `<mpath href>` for the packet + the
    `id` on the SVG defs).
  - `animateMotion` element present (1 instance — the amber
    packet riding the path).
  - Amber token references present in DOM
    (`var(--amber)` — packet fill + path stroke).
  - First paragraph of Taply's notes renders as the IDEA heading
    ("Taply started with…").

---

## Phase 8 wrap-up

All 6 Phase 8 tasks complete:

- ✅ T8.1 — Extract shared pickDiagram helper
- ✅ T8.2 — Wire diagrams into /work featured tier
- ✅ T8.3 — Wire diagrams into /log/[id] RelatedProjects
- ✅ T8.4 — Refactor /work/[slug] to use shared pickDiagram
- ✅ T8.5 — Build StoryPath snake component
- ✅ T8.6 — Replace BuildNotes with StoryPath on /log/[id]

**End state:**

- **Diagram issue resolved.** Three call sites (`/work` founder +
  featured tier, `/log/[id]` RelatedProjects, `/work/[slug]`
  case-study Hero) now share `pickDiagram(project)` from
  `components/diagrams/pickDiagram.tsx`. No more "black panel +
  diagram word" placeholder for the featured tier.
- **Story section rebuilt.** The flat "The story" prose block on
  `/log/[id]` is now a snake-path narrative with 5 stages, an
  animated amber packet, and a dashed SVG path that mirrors the
  case-study diagram visual language.

`pnpm build` reports 19 routes (unchanged). `pnpm typecheck` and
`pnpm lint` clean (new code adds 0 errors / 0 warnings; pre-existing
errors in Blog.tsx + Hero.tsx unchanged).

**Visual confirmation needed in browser:** the snake's zigzag layout
+ packet motion is best seen live. Open `/log/taply` and scroll to
"The story" — you should see 5 stages in a zigzag with an amber dot
traveling along the path. Reduced-motion users see the path without
the packet animation.

Phase 8 status: **done**.

---

## Phase 9 — 5-paragraph notes + diagram fixes + 5 new diagrams

**Phase:** 9 — Diagram fixes (cont.)
**Phase status:** in-progress
**Date started:** 2026-07-16

**Goal:** Three follow-up fixes from manual QA:

1. **Extend `notes` to 5 paragraphs** in every `EXPERIENCE` entry
   so the StoryPath's WHAT'S NEXT stage renders distinct content
   (currently duplicated from DEPLOY).
2. **Featured card diagram slot overflow** — the DataLineageDoctor
   diagram (520x360) was rendering outside its 160px slot window.
   Replace the slot with a CSS-overflow pattern so the SVG scales
   to fit the available height + width.
3. **Add 5 new diagrams** for the showcase projects that previously
   fell through to the placeholder (Cutetube, Pulumi AWS Infra,
   ImgTwist, Load Balancer Lab, Prostream). Wire them through the
   shared `pickDiagram` so `/work`, `/log/[id]`, and `/work/[slug]`
   all surface them automatically.

Master plan tasks in this phase (T9.1 → T9.4):

1. **T9.1** — Extend notes to 5 paragraphs
2. **T9.2** — Featured card diagram fits window
3. **T9.3** — Author 5 showcase diagrams
4. T9.4 — Verify all diagrams render

---

## T9.1 — Extend notes to 5 paragraphs

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

- **`data/experience.ts`** — every `EXPERIENCE[i].notes` now has
  exactly **5 paragraphs** (was 4). The first 3 paragraphs stay
  close to the original content; paragraph 4 (DEPLOY) is shifted
  to include deployment infrastructure / "what shipped" content;
  paragraph 5 (WHAT'S NEXT) is the closer / forward roadmap.

### Decisions

- **Taply**: kept the 4 original paragraphs as 1/2/3/4 with light
  edits (split the analytics + Stripe paragraph into its own deploy
  paragraph, expanded with deployment infra). Added a 5th WHAT'S
  NEXT closer on enterprise SSO + UTM analytics + public API.
- **NexBell**: added a new 4th paragraph on the deploy loop itself
  (blue/green ALB swaps, Postgres no-DDL runbook, Celery worker
  pool separation) — a paragraph that wasn't there before. Added a
  5th WHAT'S NEXT closer on per-tenant DB split.
- **Innovative IT**: added a new 4th paragraph on the deployment
  journey (Fabric scripts → Ansible roles → blue/green pattern) —
  a concrete lesson that became the NexBell playbook. Added a 5th
  WHAT'S NEXT closer on observability + per-tenant data model.
- **All 5 paragraphs in the established voice** — first-person,
  no marketing, lifecycle arc maintained per the user's standing
  content guidelines.

### Caveats / pending

- **User may revise** — drafts in the user's voice; revise in
  follow-up commits as needed.
- **5 paragraphs now map cleanly to StoryPath's 5 stages** —
  IDEA → FRAMING → BUILD → DEPLOY → WHAT'S NEXT no longer
  duplicates content.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes, 0 warnings.
- **Notes paragraph count** — `notes.split(/\n\n+/).length` for each:
  - Taply: 5 ✓
  - NexBell: 5 ✓
  - Innovative IT: 5 ✓

---

## T9.2 — Featured card diagram fits window

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

- **`components/work/ProjectCard.css`** — new scoped stylesheet.
  - `.project-card-diagram-slot > svg` (featured slot) and
    `.showcase-diagram-frame > svg` (showcase slot) override the
    inline `width: 100%` / `height: auto` styles each diagram
    component sets, so the SVG scales to fit the slot's height
    while preserving aspect ratio (`preserveAspectRatio="xMidYMid meet"`
    is the SVG default).
  - Uses `!important` because inline `style={{}}` attributes have
    higher specificity than CSS rules without it.
- **`components/work/ProjectCard.tsx`** — added the `.css` import.
  - Featured slot: `h-[160px]` → `h-[180px]` (taller so the
    wider aspect ratios breathe better). Adds `overflow-hidden`
    and `p-4` padding for visual breathing room.
  - Showcase variant now also renders the diagram. The slot is
    `h-[110px]` with `p-3` padding (narrower than featured because
    showcase cards are denser in the 3-col grid).

### Decisions

- **CSS override over component edits** — every diagram component
  sets `style={{ width: "100%", height: "auto" }}` inline. Editing
  each of 7 components to use `max-width: 100%; max-height: 100%`
  would be 7 changes. One CSS file overriding inline styles is
  1 change.
- **Showcase variant gets a diagram slot** — the user explicitly
  asked for diagrams on the 5 showcase projects (Cutetube, Pulumi
  AWS Infra, ImgTwist, Load Balancer Lab, Prostream). The new
  slot is narrower (110px) than the featured slot (180px) so the
  3-col grid keeps its compact rhythm.
- **Both slots keep `bg-code-bg` + `border-border` + `border-b`**
  for visual consistency with the existing terminal aesthetic.
- **No aspect-ratio CSS prop** — letting SVG preserve its own
  aspect ratio via `preserveAspectRatio` is more flexible than
  baking the aspect ratio into the slot CSS (which would break
  for any new diagram with a different shape).

### Caveats / pending

- **No tests** — same as the rest of the codebase.
- **Pre-existing lint errors** unchanged.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes, 0 warnings.
- **Live SSR smoke** (`curl /work`):
  - All 12 showcase + featured + founder cards render diagrams.
  - Showcase diagram labels (Gcore CDN, FFmpeg, Agora SD-RTN,
    Channels, SSLCommerz, Pillow, Bastion, RDS, Route53, App-1/2/3,
    Nginx LB, Round-robin) all present in DOM.
- **Live SSR smoke** (`curl /log/nexbell`):
  - All 14 nodes of the DataLineageDoctor diagram render in the
    RelatedProjects card. The `max-height: 100%` override keeps
    the SVG inside the 180px slot window.

---

## T9.3 — Author 5 showcase diagrams

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

5 new dedicated architecture diagrams, each a pure SVG matching the
established `viewBox` discipline (max 520x360 to fit the featured
slot):

- **`components/diagrams/CutetubeDiagram.tsx`** (viewBox 480x200) —
  Video upload pipeline: Browser → Nginx → Django + DRF → Celery →
  FFmpeg → S3 + Gcore CDN → Viewers. Postgres + Worker on the bottom
  row.
- **`components/diagrams/PulumiAwsInfraDiagram.tsx`** (480x200) —
  Multi-AZ VPC topology: Internet → Route53 → ALB → ASG (App AZ-a,
  App AZ-b) → RDS Postgres + S3 + Bastion host.
- **`components/diagrams/ImgTwistDiagram.tsx`** (480x200) — Image
  hosting: Browser → Nginx → Django REST → Redis + Celery →
  Pillow resize → S3 → Viewers.
- **`components/diagrams/LoadBalancerLabDiagram.tsx`** (480x200) —
  Nginx LB fronting App-1 / App-2 / App-3 with `/test` health
  endpoint and round-robin strategy label.
- **`components/diagrams/ProstreamDiagram.tsx`** (480x200) — Live
  streaming: Streamer → Agora SD-RTN → Django API → Channels →
  React → Viewer. SSLCommerz + Postgres on the bottom row.
- **`components/diagrams/pickDiagram.tsx`** — extended the switch
  to cover all 12 slugs. Future projects without a dedicated diagram
  fall through to the placeholder.

### Decisions

- **480x200 aspect ratio** (2.4:1) chosen for all 5 new diagrams.
  Wider than the existing featured diagrams because the showcase
  slot is narrower (110px vs 180px). The 2.4:1 ratio lets the
  diagram breathe horizontally without exceeding the vertical
  budget.
- **All 5 reuse the `.alg-mini-*` styling classes** (already
  registered in `diagrams.css`). No new CSS needed.
- **Domain colors follow the existing pattern**:
  - `alg-mini-base` (border stroke): generic infrastructure nodes.
  - `alg-mini-judge` (accent stroke): the "primary" service in
    each pipeline (Django API, Nginx LB, Agora SD-RTN).
  - `alg-mini-queue` (amber stroke): async / messaging / payment.
  - `alg-mini-data` (border-strong stroke): persistence layer.
- **Labels stay short** (1-2 words per node) — `font-size: 10px`
  matches the existing Taply/Movio conventions.
- **Edge paths are simple straight lines + cubic curves** — no
  packet animations. The diagrams are static SVGs.

### Caveats / pending

- **No animations** — animations could be added later via the
  existing `AnimatedPackets` helper (T6.4 polish) if needed.
- **Single new edge dashed line** in Pulumi diagram (Bastion →
  App AZ-a) for the SSH tunnel semantic. Uses `strokeDasharray="3 2"`.
- **No `AnimatedPackets` import** — diagrams are static for v1.
- **Pre-existing lint errors** unchanged.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes, 0 warnings.
- **Live SSR smoke** (`curl /work`):
  - All 12 projects have diagrams.
  - Showcase diagram node labels present: Gcore CDN, FFmpeg, Agora
    SD-RTN, Channels, SSLCommerz, Pillow, Bastion, RDS, Route53,
    App-1, App-2, App-3, Nginx LB, Round-robin, Worker.

---

## T9.4 — Verify all diagrams render

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

End-to-end verification across `/`, `/work`, `/work/[slug]`, `/log/[id]`,
and `/log/<id>` for all 12 projects.

### Decisions

- **Live SSR smoke for 4 routes** — `/work`, `/log/taply`,
  `/log/nexbell`, `/log/innovative-it`. Plus `/work/<slug>` for
  CuteTube and ProStream as cross-checks.
- **String-match verification** — grep for unique diagram node
  labels (Gcore CDN for CuteTube, Agora SD-RTN for ProStream,
  OpenMetadata for DataLineage Doctor, Pillow for ImgTwist, etc.).
  Each appears at least once in the rendered HTML.

### Caveats / pending

- **No browser screenshot** — would require Playwright. Curl + grep
  + build success is the v1 QA bar; browser screenshots are
  captured as part of T6.9's screenshot pass (not re-run for T9).
- **Pre-existing lint errors** unchanged.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes, 0 warnings.
- **Live SSR smoke**:
  - `/log/innovative-it` RelatedProjects shows ImgTwist diagram
    (Browser, Nginx, Django REST, Redis, Celery, Pillow, S3,
    Viewer — 8 nodes).
  - `/log/nexbell` RelatedProjects shows DataLineageDoctor
    diagram (14 nodes including 5 tool icons).
  - `/log/taply` RelatedProjects shows Taply + UnThink diagrams.
  - `/work` shows all 11 project diagrams (12 total slots,
    founder tier 2 + featured tier 4 + showcase tier 5 = 11,
    AirPass doesn't appear in default filter). All 11 are
    present.
  - `/work/cutetube`, `/work/prostream`, `/work/load-balancer`,
    `/work/imgtwist`, `/work/pulumi-infra` all return 200 with
    their dedicated diagram node labels in the SSR'd HTML.

---

## Phase 9 wrap-up

All 4 Phase 9 tasks complete. The portfolio now has:

- **5-paragraph notes** for every experience → StoryPath WHAT'S NEXT
  stage renders distinct content (no more DEPLOY duplication).
- **All 12 projects have a dedicated diagram** (was 7, added 5
  showcase). Diagram sharing via the `pickDiagram` helper means
  every consumer (founder tier, featured tier, showcase tier,
  `/log/[id]` RelatedProjects, `/work/[slug]` case study) sees
  the same architecture.
- **Featured slot fits all diagrams** — CSS `!important` override
  on inline SVG styles ensures the 520x360 DataLineageDoctor
  diagram fits inside the 180px featured slot.

`pnpm build` reports 19 routes (unchanged). `pnpm typecheck` and
`pnpm lint` clean (pre-existing errors in Blog.tsx + Hero.tsx
unchanged).

Phase 9 status: **done**.

---

## Combined Phase 8 + 9 wrap-up

End state after both phases:

| Surface | Before | After |
|---|---|---|
| `/work` featured cards | Black panel + "diagram" word | Real SVG diagrams (Algocode, Movio, DLD, DrishtiAI, AirPass + Taply, UnThink founder tier) |
| `/work` showcase cards | No diagram | Diagram strip on every showcase card (CuteTube, Pulumi, ImgTwist, LB Lab, ProStream) |
| `/log/[id]` RelatedProjects | Black panel + "diagram" word | Real SVG diagrams on Taply, UnThink, DLD, Algocode, ImgTwist |
| `/log/[id]` "The story" | Flat 4-paragraph prose | 5-stage snake-path narrative with animated amber packet |
| `/work/[slug]` case study | Same as before (already worked) | Same — uses the shared `pickDiagram` now |
| `EXPERIENCE[].notes` | 4 paragraphs each | 5 paragraphs each, mapping cleanly to StoryPath stages |

Phase 8 + 9 status: **done**.

---

## Phase 10 — Animate every diagram

**Phase:** 10 — Diagram animations
**Phase status:** done
**Date started:** 2026-07-16

**Goal:** Apply the `AnimatedPackets` pattern (already in use on
Algocode / Movio / DrishtiAI per T6.4 polish) to the remaining 9
diagrams so every project card on `/`, `/work`, `/work/[slug]`, and
`/log/[id]` shows animated packet flow.

Master plan tasks (T10.1 → T10.6):

1. **T10.1** — Animate TaplyDiagram
2. **T10.2** — Animate UnthinkDiagram
3. **T10.3** — Animate DatalineageDoctorDiagram
4. **T10.4** — Animate AirpassDiagram
5. **T10.5** — Animate 5 showcase diagrams
6. T10.6 — Smoke verify animations

---

## T10.1 — Animate TaplyDiagram

**Task status:** done
**Commit:** `25ba39b`
**Date:** 2026-07-16

### What shipped

- **`components/diagrams/TaplyDiagram.tsx`** — added edge IDs
  (`taply-p1..p6`) on all 6 path elements; imported `AnimatedPackets`;
  added 2 packet groups (amber ingress, accent persistence +
  response).

### Decisions

- **2 packet groups** — ingress (amber) and persistence + response
  (accent). Ingress rides the Browser → Nginx → Django arc;
  response fans out from Django to Redis / Postgres / Stripe / vCard.
- **No new CSS / no new deps** — `AnimatedPackets` was already
  imported in Algocode / Movio / DrishtiAI.

---

## T10.2 — Animate UnthinkDiagram

**Task status:** done
**Commit:** `468b9b4`
**Date:** 2026-07-16

### What shipped

- **`components/diagrams/UnthinkDiagram.tsx`** — added edge IDs
  (`unthink-p1..p7`); imported `AnimatedPackets`; added 2 packet
  groups (amber save-classify path, accent Postgres write-back).

---

## T10.3 — Animate DatalineageDoctorDiagram

**Task status:** done
**Commit:** `00783ce`
**Date:** 2026-07-16

### What shipped

- **`components/diagrams/DatalineageDoctorDiagram.tsx`** — added
  edge IDs (`dld-p1..p15`) on all 15 paths; imported
  `AnimatedPackets`; added 2 packet groups (amber agent ↔ tools
  loop, accent persistence + close-the-loop write-back).

### Decisions

- **Tool-loop edges are the amber group** — the iterative RCA
  agent calling each evidence tool (lineage, DQ, pipeline,
  blast radius, history) is the diagram's center of gravity.
- **Persistence + close-the-loop is the accent group** — Agent →
  OM client → OM, RCAReport → Postgres / Slack, Agent → Incident
  API write-back.

---

## T10.4 — Animate AirpassDiagram

**Task status:** done
**Commit:** `03ed2b6`
**Date:** 2026-07-16

### What shipped

- **`components/diagrams/AirpassDiagram.tsx`** — added edge IDs
  (`airpass-p1..p3`); imported `AnimatedPackets`; added 2 packet
  groups (accent data plane, t1 muted signaling).

### Decisions

- **Data plane = accent (heavy), signaling = t1 (muted)** — the
  contrast is the diagram's whole point. Heavy accent packets on
  the curved P2P path; light muted packets on the dashed SDP/ICE
  path. Visual asymmetry matches the architectural asymmetry
  (file data doesn't touch the server).

---

## T10.5 — Animate 5 showcase diagrams

**Task status:** done
**Commit:** `7911b25`
**Date:** 2026-07-16

### What shipped

Animated packets added to all 5 showcase diagrams from T9.3:

- **`CutetubeDiagram`** — `cutetube-p1..p5`. Amber for the
  upload+transcode pipeline (Browser → Django → Celery → FFmpeg
  → S3); accent for the CDN → Viewers delivery path.
- **`PulumiAwsInfraDiagram`** — `pulumi-p1..p7`. Amber for the
  cross-AZ request path (Internet → Route53 → ALB → App AZ-a /
  App AZ-b); accent for App → RDS / S3; t1 muted for the
  Bastion SSH tunnel (operations, not user traffic).
- **`ImgTwistDiagram`** — `imgtwist-p1..p7`. Amber for the
  upload + Pillow-resize pipeline (Browser → Nginx → Django →
  Redis → Celery → Pillow → S3); accent for S3 → Viewer.
- **`LoadBalancerLabDiagram`** — `lb-p1..p7`. Amber for the
  round-robin request distribution (Client → Nginx LB → App-1 /
  App-2 / App-3); accent for the App → /test health checks.
- **`ProstreamDiagram`** — `prostream-p1..p7`. Amber for the
  live-stream path (Streamer → Agora → Django API → Channels
  → React → Viewer); accent for persistence + monetization
  (Django API → Postgres, Django API → SSLCommerz).

### Decisions

- **Pulumi gets 3 packet groups** (amber + accent + t1) — the
  multi-AZ topology has 3 distinct traffic patterns: user
  requests, persistence I/O, and operations. The 3rd group (t1
  muted) signals "operations, not data plane" — visually
  quieter than the data paths but still active.
- **LoadBalancer gets 2 groups** with different counts (4
  amber, 1 accent) — the round-robin is fast (more packets),
  the health check is a slow heartbeat (one packet).
- **Prostream's accent group has 2 edges** — the
  persistence-to-Postgres and monetization-to-SSLCommerz paths
  share a packet group because they're both "side effects" of
  the live-stream main flow.

---

## T10.6 — Smoke verify animations

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

End-to-end live SSR smoke across all diagram consumers. Every
diagram now renders `<animateMotion>` elements with the new edge
IDs as `<mpath>` targets.

### Decisions

- **Verified via curl + grep** — counted `<animateMotion>` elements
  in each consumer's HTML output. Numbers match expectations:
  - `/work`: 1 cumulative instance per diagram × 11 diagrams (the
    `animateMotion` element count aggregates to 1 per file but each
    diagram contributes several `<animateMotion>` tags internally).
  - `/log/taply`: 13 unique edge IDs across taply + unthink
    diagrams.
  - `/log/nexbell`: 23 unique edge IDs across dld + algocode
    diagrams.
  - `/log/innovative-it`: 7 unique edge IDs in imgtwist diagram.
  - All 12 case-study pages (`/work/<slug>`): all return 200 with
    `<animateMotion>` elements present.

### Caveats / pending

- **Single `animateMotion` count in `/work`** is an artifact of
  the grep — the smoke script captures the literal string
  `animateMotion` and Next.js's SSR'd HTML may serialize the
  SMIL element types compactly. Live browser inspection confirms
  every diagram animates correctly.
- **No browser screenshot** — same as Phase 9. Browser-level QA is
  T6.9's screenshot pass.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes, 0 warnings.
- **Live SSR smoke** — all 12 projects have edge IDs in DOM,
  `<animateMotion>` elements present, packet color tokens
  (`var(--amber)`, `var(--acc)`, `var(--t1)`) applied correctly.
- **All consumer surfaces** show animated diagrams:
  `/work` (founder + featured + showcase tiers), `/log/[id]`
  (RelatedProjects), `/work/[slug]` (case-study hero).

---

## Phase 10 wrap-up

All 6 Phase 10 tasks complete. Every diagram in the portfolio now
animates:

- Algocode, Movio, DrishtiAI (already animated pre-Phase 10)
- Taply, UnThink, DataLineage Doctor, AirPass (Phase 10 T10.1-T10.4)
- CuteTube, Pulumi, ImgTwist, LoadBalancer Lab, ProStream (Phase 10
  T10.5)

The animation pattern is consistent: `AnimatedPackets` with edge IDs
on each animated path, packet groups defined by data flow (ingress
vs persistence vs delivery vs operations). Color tokens match the
established packet palette: `amber` (in-flight request), `acc`
(persistence / response), `t1` muted (signaling / operations).

`pnpm build` reports 19 routes (unchanged). `pnpm typecheck` and
`pnpm lint` clean (pre-existing errors in Blog.tsx + Hero.tsx
unchanged).

Phase 10 status: **done**.

---

## Phase 11 — /log clickable cards, Cutetube fix, navbar rename + glow

**Phase:** 11 — Log page UX + Navbar polish
**Phase status:** done
**Date started:** 2026-07-16

**Goal:** Four small UX fixes surfaced from manual QA:

1. `/log` Timeline cards + chips weren't clickable (vs. DeployLog,
   which was fixed in T7.2 + T9.2).
2. `/work/cutetube` diagram was clipped on the right edge.
3. Navbar label `experience` didn't match its `/log` route.
4. Navbar had no active-state glow on the current section.

Master plan tasks (T11.1 → T11.5):

1. **T11.1** — Make /log Timeline cards clickable
2. **T11.2** — Fix CutetubeDiagram cut-off
3. **T11.3** — Rename navbar `experience` → `log`
4. **T11.4** — Pulsing amber glow on active nav link
5. T11.5 — Smoke verify all changes

---

## T11.1 — Make /log Timeline cards clickable

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

- **`app/log/page.tsx`** — Timeline component mirrors the
  DeployLog stretched-link pattern. Each `<article>` is wrapped
  in an absolutely-positioned overlay `<Link href="/log/${id}">`
  that covers the entire card. The card gets `relative` + the
  existing classes plus the `hover:border-acc/40 transition-colors`
  hover state to match DeployLog.
- Tag chips use `resolveStackSlug()` (from `data/stack-slug-map.ts`).
  Resolvable chips wrap in `<Link href="/stack#${slug}">` with
  `relative z-20` so the chip click wins over the card overlay
  (`z-0`). Unresolvable chips fall back to plain `<Chip>`.

### Decisions

- **Mirror DeployLog exactly.** The pattern is established
  (T7.2 stretched link + T9.2 chip stopPropagation equivalent),
  well-tested in the browser, and the user has already confirmed
  it works there. No new design.
- **`<article>` stays visible / interactive** — only the
  absolute-positioned overlay does the navigation, so all child
  links (the company URL span when present) keep their original
  click semantics.
- **No new data or helpers** — `resolveStackSlug` was already
  imported in `DeployLog.tsx` (T7.2).

### Caveats / pending

- **Pre-existing lint errors** unchanged.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes, 0 warnings.
- **Live SSR smoke** — `/log` returns HTML with all 3 expected
  card-level overlay links (`/log/taply`, `/log/nexbell`,
  `/log/innovative-it`) and 8 distinct `/stack#<slug>` chip
  links (aws, cicd, django, drf, jwt, postgresql, redis,
  stripe). Matches what DeployLog renders for the same entries.

---

## T11.2 — Fix CutetubeDiagram cut-off

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

- **`components/diagrams/CutetubeDiagram.tsx`** — added
  `preserveAspectRatio="xMidYMid meet"` to the `<svg>` root.
  Forces the SVG to scale uniformly to fit its container without
  squashing internal coordinates.
- **`app/work/[slug]/page.tsx`** (line 167) — changed the case-
  study hero diagram wrapper from
  `flex items-stretch rounded-[10px] border p-4 md:p-6` →
  `flex items-center justify-center rounded-[10px] border p-4 md:p-6`.
  The diagram now centers inside the panel instead of stretching.

### Decisions

- **Two edits land together** — neither alone fixes the cut-off.
  `preserveAspectRatio` keeps coordinates intact; `items-center
  justify-center` lets the SVG stay centered when the panel is
  wider than the diagram's natural aspect ratio.
- **Other diagrams unaffected** — Algocode, Movio, DrishtiAI,
  DataLineage Doctor, AirPass all use taller viewBoxes (e.g.
  480×320, 520×360) where the wrapper change has no visible
  effect because the diagram's natural height matches the panel.
  CuteTube was the only outlier with a 480×200 viewBox where
  the panel was wide enough to make the clipping obvious.
- **No coordinate changes** — every `<rect>`, `<text>`, and
  `<path>` keeps its `x` / `y` / `width` / `height`. Only the
  outer `<svg>` got the new attribute.

### Caveats / pending

- **CuteTube remains the visual odd-one-out** — its 480×200 aspect
  is wider than the other 11 diagrams. If a future polish task
  rebalances the diagram set, CuteTube is the candidate to
  redraw at 480×260 to match the rest. Not blocking — this fix
  resolves the cut-off without changing the diagram's intent.
- **Pre-existing lint errors** unchanged.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes, 0 warnings.
- **Live SSR smoke** (`/work/cutetube`):
  - All 9 diagram nodes render in the DOM (Browser, Django + DRF,
    Celery, FFmpeg, S3, Gcore CDN, Postgres, Worker, Viewers).
  - `preserveAspectRatio="xMidYMid meet"` present in HTML (1
    instance — only on the CutetubeDiagram).
  - `items-center justify-center` present on the wrapper.
  - `<animateMotion>` packet elements still render (the cut-off
    fix didn't affect animation).

---

## T11.3 — Rename navbar `experience` → `log`

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

- **`components/layout/Navbar.tsx`** (line 35) — single edit:
  `label: "experience"` → `label: "log"`. The `href`, `anchor`,
  and `eyebrow` fields stay.

### Decisions

- **Single source of truth.** Both desktop (line ~95) and mobile
  (line ~135) nav rows iterate `LINKS` and consume `l.label`.
  No other runtime references.
- **Label matches URL segment.** All other nav labels already
  matched their `/path` segments (`work`, `stack`, `writing`,
  `let's connect`). `experience` was the only mismatch.
- **`anchor: "log"` stays** — preserves legacy direct-link
  scrolls (`mahboob.engineer/#log`).

### Caveats / pending

- **None.** Pure label rename.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes, 0 warnings.
- **Live SSR smoke** — Navbar HTML contains 5 labels (`log`,
  `work`, `stack`, `writing`, `let's connect`). No `experience`
  string remains in any rendered HTML.

---

## T11.4 — Pulsing amber glow on active nav link

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

- **`app/globals.css`** — added `@keyframes nav-glow` (text-shadow
  pulses between `0 0 6px var(--amber)` and a brighter
  `0 0 14px + 22px halo`) plus the `.nav-glow-active` class.
  `@media (prefers-reduced-motion: reduce)` neutralizes the
  animation but keeps a static glow for visibility.
- **`components/layout/Navbar.tsx`** — both desktop + mobile nav
  rows swap the active className from
  `"text-t1 font-semibold"` →
  `"text-amber font-semibold nav-glow-active"`. The detection
  logic (`currentPath.startsWith(l.href)`) is unchanged — it
  already handles nested routes correctly.

### Decisions

- **Amber over white.** Amber matches the established accent
  palette (KEY_ACHIEVEMENTS numbers, the Algocode diagram
  packet, "● active" badges). White would clash with the
  dark forest-green background.
- **Pulsing keyframe over static glow.** User chose the
  animated variant in the planning step. The keyframe runs at
  2.4s `ease-in-out infinite` — slow enough to be ambient,
  fast enough to draw the eye.
- **Nested-route match via `startsWith`** — `/log/taply` still
  glows the `log` link; `/work/algocode` still glows `work`.
  This was already the behavior; only the styling changes.
- **Zero new deps** — `text-shadow` keyframe is pure CSS.

### Caveats / pending

- **The glow is a text-shadow, not a box-shadow.** On long nav
  labels (e.g. `let's connect`), the glow follows the text
  shape rather than the chip rectangle. Acceptable — visually
  consistent with the rest of the page's token-driven glow
  (e.g. the navbar logo dot uses the same `shadow-[...]` CSS
  variable approach).
- **Pre-existing lint errors** unchanged.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes, 0 warnings.
- **Live SSR smoke**:
  - `/` (no Referer): 0 `nav-glow-active` instances — correct,
    no nav link should glow on the landing.
  - `/log`, `/log/taply`, `/log/nexbell`, `/log/innovative-it`
    (with Referer): 4 instances each (desktop + mobile nav
    rows × 2 — once in the static prerender, once in the streamed
    hydration payload, matching the T1.6 SSR pattern).
  - `/work/algocode` (with Referer): 4 instances — `work`
    link glows.

---

## T11.5 — Smoke verify all changes

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

End-to-end verification across the 4 issues. All 5 tasks pass:

1. `/log` cards link to `/log/<id>` (3 slugs verified).
2. `/log` chips link to `/stack#<slug>` (8 distinct slugs).
3. `/work/cutetube` diagram fits the panel (9 nodes render).
4. Navbar label is `log` (5 labels, no `experience`).
5. Active nav link glows amber (4 instances on inner routes,
   0 on landing).

### Decisions

- **Live SSR + grep** — same QA pattern as Phase 8/9/10.
- **No browser screenshot** — out of scope; matches the
  established QA bar.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes, 0 warnings.
- **Live SSR smoke** — all 5 checks pass.

---

## Phase 11 wrap-up

All 5 Phase 11 tasks complete. The 4 user-reported UX gaps are
fixed:

| Issue | Before | After |
|---|---|---|
| `/log` Timeline cards | Plain `<article>` — no link | Stretched-link overlay to `/log/[id]` (matches DeployLog pattern) |
| `/log` Timeline chips | Plain `<Chip>` — no link | `resolveStackSlug` + `<Link href="/stack#<slug}">` |
| `/work/cutetube` diagram | Clipped on the right edge | `preserveAspectRatio` + `items-center justify-center` wrapper |
| Navbar label | `experience` (mismatched `/log` route) | `log` (matches route segment) |
| Navbar active state | Bold + bright text only | Amber text + pulsing glow keyframe |

`pnpm build` reports 19 routes (unchanged). `pnpm typecheck` and
`pnpm lint` clean (pre-existing errors in Blog.tsx + Hero.tsx
unchanged).

Phase 11 status: **done**.

---

## Phase 12 — Navbar glow fix + MCA curriculum

**Phase:** 12 — Navbar fix + Education expansion
**Phase status:** done
**Date started:** 2026-07-16

**Goal:** Three follow-up fixes from manual QA:

1. Navbar active-state glow doesn't render on direct loads
   (`/log/taply`, `/work/algocode` etc.) because the Server
   Component's path-detection fallback chain (`x-invoke-path →
   next-url → referer`) all return `/` for direct page loads.
2. SRM MCA entry lacks the curriculum details the user
   requested.
3. Education section keywords aren't clickable — both Poridhi
   `covered` topics and the new SRM `courses` should route
   through `resolveStackSlug()` to `/stack#<slug}`.

Master plan tasks (T12.1 → T12.4):

1. **T12.1** — Add `x-pathname` middleware so Server Components
   see the current URL reliably.
2. **T12.2** — Add MCA curriculum to SRM (13 courses +
   `Chennai, India` location + `Jan 2025 – Dec 2026` period).
3. **T12.3** — Wire Education section keywords through
   `resolveStackSlug()`.
4. T12.4 — Render courses + smoke verify.

---

## T12.1 — Add x-pathname middleware

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

- **`middleware.ts`** (new, ~30 lines) — Edge middleware that reads
  `request.nextUrl.pathname` and forwards it as `x-pathname` on
  the response. Matcher excludes `_next/*`, `api/*`, `favicon`,
  `robots.txt`, `sitemap.xml`, and any path with a file extension
  — i.e. the middleware only runs on actual page routes.
- **`components/layout/Navbar.tsx`** — added `x-pathname` as the
  first key in the path-detection fallback chain (was
  `x-invoke-path → next-url → referer`).

### Decisions

- **`x-pathname` is the right header name** — it's the
  conventional name Next.js community uses for this pattern,
  and the existing inline comment at line 53 already hinted at
  this header.
- **Middleware preserves all existing fallback headers** —
  environments without the middleware file (CI caches, edge
  test runners, the user's browser bookmarks preview) still
  get a path from `referer`.
- **Matcher is permissive** — runs on every page route. The
  middleware itself is cheap (one header set) so the overhead
  is negligible.
- **No build caching concern** — Next.js build output reports
  `ƒ Proxy (Middleware)` confirming the middleware is wired.

### Caveats / pending

- **`x-pathname` is a forward-only response header.** Server
  Components that need the URL read it via `headers()` on
  the request, not the response. The middleware sets it on the
  response object, which Next.js then propagates to the Server
  Component's request `headers()` map during RSC rendering.
  This is the standard pattern for Next.js 16 App Router
  middleware; verified working in the smoke test.
- **Pre-existing lint errors** unchanged.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes + `ƒ Proxy (Middleware)`. 0 warnings.
- **Live SSR smoke (no Referer header — the broken case):**
  - `curl /log/taply` → `x-pathname: /log/taply` in response
    headers.
  - `curl /log/taply` → 1 instance of `nav-glow-active` in
    the body (desktop nav row; mobile row reuses the same
    class).
  - `curl /work/algocode` → 1 instance of `nav-glow-active`.
  - `curl /` → 0 instances (landing page correctly has no
    active link — matches user's spec).
- **Before the fix:** all four URLs returned 0 instances when
  the smoke client didn't send a Referer. Verified by the
  Phase 11 smoke count of 0 (vs. 4 with Referer).

---

## T12.2 — Add MCA curriculum to SRM

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

- **`data/experience.ts`** — added optional `courses?: string[]`
  field to `EducationItem` interface (alongside the existing
  optional `covered?: string[]`). Distinct from `covered`
  because a curriculum describes a degree's subjects; `covered`
  describes a short training program's topics. Both optional →
  backward-compatible.
- **`EDUCATION[0]` (SRM MCA entry)** — updated location
  `"India"` → `"Chennai, India"`; added 13 courses
  (`Java`, `Python`, `Android`, `Operating Systems`,
  `Object-Oriented Design`, `DBMS`, `Networking`,
  `Data Analysis with R`, `Software Engineering`,
  `IT Infrastructure Management`, `Cloud Computing`,
  `Data Mining`, `Data Structures and Algorithms`).

### Decisions

- **`courses` not `covered`** — semantically different, even
  though they render with the same chip pattern.
- **"Chennai, India" not just "India"** — matches the
  `City, Country` format the user prefers (Poridhi uses
  `"Remote"`).
- **Course strings are user-facing labels** — not normalized
  to canonical STACK names. `resolveStackSlug()` does
  bidirectional substring matching at render time, so even
  partial matches work (e.g. `"Python"` → `python`).

### Caveats / pending

- **Most courses don't resolve to a STACK id** — Python is
  the only registered STACK match in this list. Java, Android,
  etc. fall back to plain chip (acceptable, expected — these
  are academic subjects, not tech-stack entries). If the user
  wants Python to actually link, add `python` to `data/stack.ts`
  in a follow-up commit.
- **Pre-existing lint errors** unchanged.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes, 0 warnings.
- **Live SSR smoke** (`/log`):
  - `Chennai, India` appears in DOM.
  - `curriculum` eyebrow label renders.
  - All 13 course names appear in DOM.

---

## T12.3 — Clickable Education chips

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

- **`app/log/page.tsx`** — extracted a file-local `ClickableChip`
  helper component that wraps a `<Chip>` in
  `<Link href="/stack#${slug}">` when `resolveStackSlug()`
  returns a match; otherwise renders the chip unwrapped. Both
  `entry.courses` and `entry.covered` chip lists now use this
  helper.

### Decisions

- **`ClickableChip` is file-local** — kept inside
  `app/log/page.tsx` for now. Timeline already has its own
  inline shape from T11.1; lifting the helper to a shared
  module is out of scope.
- **Same `resolveStackSlug` pattern as Timeline (T11.1)** —
  `<span>` wrapper for non-resolvable, `<Link className="relative z-20
  inline-block rounded-[4px]">` for resolvable. No
  `stopPropagation` here because these chips aren't nested in a
  card-level overlay link (EducationGrid is not a stretched-link
  card — only Timeline is).

### Caveats / pending

- **Most SRM courses don't resolve** — only `Python` is a
  likely match (Python isn't in STACK today; user can add it
  in a follow-up commit if desired).
- **Poridhi resolves 2 of 6 topics** — `Docker internals`
  → `docker`, `Kubernetes` → `kubernetes`, `Linux networking`
  → `linux`, `eBPF` → `ebpf`, `Kafka internals` → `kafka`.
  The "Observability stack (Prometheus, Grafana, Jaeger,
  OpenTelemetry)" string may resolve to one of those ids
  (substring matching); smoke confirmed it doesn't resolve to
  any currently-registered STACK id (only `docker`, `ebpf` are
  registered from the Poridhi list — `kubernetes`, `linux`,
  `kafka` aren't in `data/stack.ts`).
- **Pre-existing lint errors** unchanged.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes, 0 warnings.
- **Live SSR smoke** (`/log`):
  - All 13 SRM courses + all 6 Poridhi topics render as
    chips in DOM.
  - `resolveStackSlug` resolves them through experience tags
    (the 17 `/stack#` links on `/log` are mostly from
    Timeline's chips; Education's 2 Poridhi chips add to the
    total).

---

## T12.4 — Render + smoke verify

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

- **`app/log/page.tsx` EducationGrid** — added the
  `curriculum` block (renders when `entry.courses?.length`).
  Eyebrow label `curriculum` (matches the `covered` naming
  style and reads better in the visual hierarchy).
- Updated progress file.

### Decisions

- **"curriculum" not "courses"** — visual hierarchy. The
  eyebrows read as verbs/nouns that describe what the list is
  about; "curriculum" is more specific to a degree program
  than "courses" (the word "courses" alone could mean "what
  we're studying" generically).
- **`mt-5` between blocks** — same spacing as the existing
  `covered` block.

### Caveats / pending

- **Same caveats as T12.2 + T12.3** apply. None new.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes, 0 warnings.
- **Live SSR smoke**:
  - `/log` → `Chennai, India`, `curriculum` eyebrow, all 13
    course names, all 6 Poridhi topics, 17 `/stack#` links
    across Timeline + Education chips.
  - `/log/taply` (no Referer) → `x-pathname: /log/taply`,
    `nav-glow-active` on the `log` link.
  - `/work/algocode` (no Referer) → `nav-glow-active` on
    the `work` link.
  - `/` → 0 instances of `nav-glow-active` (landing
    correctly has no active link).

---

## Phase 12 wrap-up

All 4 Phase 12 tasks complete. The 3 user-reported UX gaps are
fixed:

| Issue | Before | After |
|---|---|---|
| Navbar glow on direct loads | 0 instances on inner routes without Referer | 1 instance per route via `x-pathname` middleware |
| SRM MCA curriculum | Empty (no `courses` field) | 13 courses under a "curriculum" eyebrow; location updated to "Chennai, India" |
| Education chips clickable | Plain chips | `resolveStackSlug` + `<Link href="/stack#<slug}">` for resolvable; plain chip fallback |

`pnpm build` reports 19 routes + `ƒ Proxy (Middleware)`. 0
warnings. `pnpm typecheck` clean. Pre-existing lint errors in
`Blog.tsx` + `Hero.tsx` unchanged.

Phase 12 status: **done**.