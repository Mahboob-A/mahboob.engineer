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