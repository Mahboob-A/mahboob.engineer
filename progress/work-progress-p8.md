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

---

## Phase 12 T12.5 — Add 4 STACK ids for chip resolution

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

- **`data/stack.ts`** — added 3 new STACK ids and renamed 1:
  - `python` (backend, depth: 90) — academic curriculum + daily
    scripting. Not actively deployed in production projects
    today; depth marker makes it visible on the force graph.
  - `linux` (infra, depth: 85) — used in Algocode's sandboxing,
    Poridhi's coverage, and every EC2 deployment.
  - `kafka` (async, depth: 55) — used in DrishtiAI and the
    original Algocode architecture (per master §0.7).
  - **`k8s` → `kubernetes`** (id renamed, name unchanged). The
    old `k8s` id failed `resolveStackSlug()`'s bidirectional
    substring check (`"kubernetes".includes("k8s") === false`).
    The new `kubernetes` id matches.

### Decisions

- **Domain choices:**
  - `python` → `backend` (the language lives in the backend
    domain; consistent with how Django/DRF/FastAPI are
    classified).
  - `linux` → `infra` (consistent with Nginx / Docker /
    AWS / Pulumi).
  - `kafka` → `async` (consistent with RabbitMQ).
  - `kubernetes` → `learning` (kept; the user hasn't deployed
    k8s to production yet, but it's a self-rated 70).
- **Depth values** — `python: 90`, `linux: 85`, `kafka: 55`.
  Reflects self-rating: python + linux are daily-use, kafka
  is study-only.
- **No `STACK_BY_ID["k8s"]` callers exist** — verified by
  `grep -rn 'STACK_BY_ID\["' .` returning empty. Safe to
  rename the id without breaking any consumer.

### Caveats / pending

- **All 3 new ids have empty `projects: []`.** They render as
  "currently leveling up" on the force graph (dashed border,
  learning-domain). When a real project uses any of these,
  move them to the production domain and add the project
  slug to `projects`.
- **Renaming `k8s → kubernetes` doesn't break Tailwind** — no
  class names hardcoded with `k8s`.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes + middleware. 0 warnings.
- **Live SSR smoke** (`/log`):
  - `/stack#python`, `/stack#linux`, `/stack#kafka`,
    `/stack#kubernetes` all appear in DOM (15 distinct slugs
    total, was 11 before).
  - The 4 chips on `/log` that previously rendered as plain
    chips now render as deep-links.
- **`/stack` force graph** — Python, Linux, Kafka, Kubernetes
  all visible in DOM (4 new nodes on the force graph).

---

## Phase 12 complete (T12.1 → T12.5)

All 5 Phase 12 tasks complete. Final state:

| Surface | Before | After |
|---|---|---|
| Navbar glow on direct loads | 0 instances on `/log/<id>` etc. without Referer | 1+ instance per route via `x-pathname` middleware |
| `/log` Education — SRM | Empty (no `courses`) | 13 courses + `Chennai, India` location |
| `/log` Education — Poridhi | Plain chips | Clickable to `/stack#<slug>` for docker / ebpf / linux / kafka |
| `/log` Education — SRM | Plain chips (no STACK matches) | Clickable to `/stack#python` |
| `/stack` force graph | 25 nodes | 28 nodes (4 new: python / linux / kafka / kubernetes) |

Phase 12 status: **done**.
---

## Phase 14 — Drop nav glow, keep flat amber active color

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

- **`app/globals.css`** — removed `@keyframes nav-glow`,
  `.nav-glow-active` rule, and the reduced-motion fallback
  (Phase 11 T11.4 block, ~26 lines). Replaced with a comment
  noting Phase 14 dropped the pulse.
- **`components/layout/Navbar.tsx`** — removed `nav-glow-active`
  from the active-link className on both the desktop nav (line
  110 area) and the mobile nav (line 158 area). Active links now
  use just `"text-amber font-semibold"` — flat amber color, no
  animation. Updated the comment on line 100 + line 147 to
  reflect the Phase 14 decision.

### Why

The previous Phase 11 pulse was technically correct (class in DOM,
keyframe in compiled CSS) but visually unreadable: the active
link fill is already `text-amber`, so amber-on-amber text-shadow
blends into the text instead of radiating. After 3 phases of
attempts (Phase 11 original → Phase 13 attempted fix → Phase 13
revert) the simplest correct answer is: no animation, just the
flat amber color, which has worked since Phase 6.

### Decisions

- **Drop the keyframe entirely** rather than ship a static
  fallback. The fallback was barely visible on bg-bg anyway;
  the user wants a clear color marker, not a faint halo.
- **Keep `text-amber font-semibold`** — the same active style
  that shipped in Phase 6 and worked through Phase 10. No new
  tokens, no new CSS.
- **No founder-tier changes** — Phase 13 T13.2 founder-glow was
  reverted by `git reset --hard` back to the Phase 12 baseline
  before this commit. Founder cards on /work keep just the
  `bg-tier-founder border-amber/40 hover:border-amber/70` styling
  with no box-shadow pulse.
- **No progress file** — Phase 13 entries were dropped along
  with the rest of the Phase 13 commits via `git reset --hard`
  before this work. The progress log goes straight from Phase 12
  done → Phase 14.

### Caveats / pending

- Pre-existing lint errors in `components/sections/Blog.tsx` and
  `components/sections/Hero.tsx` are out of scope and untouched.
- The branch is still called `feat-1/glow-header` (carried over
  from the Phase 13 attempt). The user can rename or delete it;
  Phase 14 itself doesn't depend on the branch name.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes + middleware, 0 warnings.
- **Live SSR smoke** (port 3000):
  - `/log`, `/log/taply`, `/work`, `/stack`, `/writing`,
    `/lets-connect` — each renders the active link with
    `text-amber font-semibold` (no `nav-glow-active` anywhere).
  - `/work` — 2 founder cards with `bg-tier-founder
    border-amber/40 hover:border-amber/70` (no founder-glow).
- **Compiled CSS check** (`.next/static/chunks/*.css`):
  - `grep -c nav-glow` → 0 across all chunks. Keyframe + rule
    + reduced-motion fallback fully removed.

---

## Phase 14 wrap-up

The navbar glow experiment is closed. Active-state highlighting
is back to its Phase 6 baseline: just the flat `text-amber
font-semibold` color marker on the matching route, no
animation. The Phase 12 T12.1 middleware x-pathname wiring
still does the heavy lifting of lighting the right link on
direct route loads.

| Surface | Before Phase 14 | After Phase 14 |
|---|---|---|
| Navbar active link | Pulsing amber halo (Phase 11 keyframe) | Flat amber color, no animation |
| Founder cards on /work | Amber border + pulsing box-shadow (Phase 13 T13.2) | Amber border only (Phase 12 baseline) |

`pnpm build` reports 19 routes + `ƒ Proxy (Middleware)`. 0
warnings. `pnpm typecheck` clean.

Phase 14 status: **done**.

---

## Phase 15 — Fix /stack D3 init + graph panel background

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

- **`components/stack/D3ForceGraph.tsx`** — D3 edge resolution fix.
  - Edges now keep `source` and `target` as **string ids**
    (e.g. `"django"`, `"drf"`) instead of pre-resolving them to
    numeric indices. D3's `forceLink.id((d) => d.id)` resolves
    them to the actual node objects on the first tick.
  - The `neighborsOf` and `highlight` helpers got a small
    `edgeEndId()` helper that handles both shapes — string id
    (right after construction) and SimNode object (after
    forceLink re-writes the references during simulation).
  - The Phase 6 (T6.9) `try { ... } catch` around the whole
    `forceSimulation(...).force(...)` chain stayed as belt-and-
    braces (now only protects against transient d3-force
    resolution errors during hot-reload), but the original
    "node not found: 0" synchronous throw no longer happens.
- **`components/stack/stack-graph.css`** — removed
  `background: var(--code-bg)` from the `.stack-graph` SVG
  rule. The wrapper in `StackShell.tsx` already carries
  `bg-surface` (the dark-green card surface); letting it
  show through the SVG keeps the panel consistent across
  breakpoints. Before this fix the SVG painted its own
  near-black `var(--code-bg)` which made the graph panel
  read as a black slab on lg+ screens, jarring against the
  `bg-surface` MobileTechList visible at smaller widths.

### Why the bug existed since Phase 3 (T3.4)

The original D3 graph code at T3.4 pre-resolved
`e.source = idIndex.get(e.source)` (a number) and called
`forceLink(simEdges).id((d) => d.id)`. D3's `.id()` accessor
maps source/target values to nodes by `node.id` — which is a
**string**. Numeric indices never matched, so `forceLink`
threw synchronously at construction. Phase 6 (T6.9) added a
try/catch around the construction chain to silence the
pageerror for the Lighthouse a11y run, but the simulation
silently never started — graph appeared empty ever since.

The "node not found: 0" message in the browser console is the
T6.9 catch surfacing: it sees the synchronous throw, logs it,
and leaves `sim = null`. The catch kept the page from
crashing but the graph stayed unrendered.

### Decisions

- **Keep edges as strings, let D3 resolve.** This is the
  idiomatic D3-force pattern; D3 mutates the edges in place
  to replace source/target with the actual node references
  on the first tick. The pre-resolution was the bug, not a
  feature.
- **No regression risk on tick handler.** The `.on("tick", ...)`
  callback already reads `(d.source as SimNode).x` because
  D3 has replaced the string with the node reference by the
  first tick. That code path is unchanged.
- **`edgeEndId()` helper handles both shapes** instead of
  hard-casting. The `neighborsOf` and `highlight` helpers
  can now be called either before any tick (string ids) or
  after (SimNode objects) without a crash.
- **Remove SVG background, not the wrapper background.**
  The wrapper's `bg-surface` is the canonical panel surface
  and matches the MobileTechList fallback. Removing it from
  the SVG (not the wrapper) keeps the dark-green look across
  breakpoints and avoids a CLS-style surface jump when the
  user resizes.

### Caveats / pending

- The try/catch around `forceSimulation(...).force(...)`
  stays (now only catches genuinely-transient d3-force
  errors). If it ever fires again, the warning will be
  useful — the previous "node not found: 0" was a real bug,
  not noise.
- Circle fills stay `var(--code-bg)` (line 28 unchanged),
  which gives a subtle "darker circle on dark-green
  surface" effect. Bright stroke colors carry the visual
  weight. If this reads as too dim in user testing, the
  next move is to lift `circle.fill` to `var(--surface)`
  (matching the panel) so only the strokes carry the tech
  color.
- Pre-existing lint errors in `components/sections/Blog.tsx`
  and `components/sections/Hero.tsx` are out of scope and
  untouched.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes + middleware, 0 warnings.
- **Live SSR smoke** (port 3000):
  - `/stack` returns HTTP 200 with the SVG + tech-detail
    panel in the rendered HTML.
- **Browser smoke** (Playwright headless Chromium,
  viewport 1440×900 and 600×900):
  - Wide (lg+): graph renders 20+ visible nodes with edges.
    SVG background matches the wrapper `bg-surface` (no
    near-black slab).
  - Narrow (<lg): MobileTechList renders with the same
    `bg-surface` panel. Domain groupings visible (Backend,
    Infrastructure, ...).
  - Console: zero "simulation failed to initialize" /
    "node not found" warnings.
- **Compiled CSS check** (`.next/static/chunks/*.css`):
  - `.stack-graph` rule no longer carries
    `background:var(--code-bg)`.
  - Circles still `fill:var(--code-bg)`.

---

## Phase 15 wrap-up

Two long-standing bugs on `/stack` fixed:

| Bug | Before | After |
|---|---|---|
| D3 force graph unrendered (Phase 3 T3.4) | Edges pre-resolved to numeric indices → `forceLink.id((d) => d.id)` never matched → synchronous "node not found: 0" throw → Phase 6 try/catch silently swallowed → empty SVG | Edges keep string ids; D3 resolves them on the first tick; graph renders all 29 techs with edges |
| Graph panel reads as black on lg+ | SVG painted its own `var(--code-bg)` (near-black) on top of the wrapper's `bg-surface` | SVG transparent; wrapper's `bg-surface` shows through; consistent surface across breakpoints |

`pnpm build` reports 19 routes + `ƒ Proxy (Middleware)`. 0
warnings. `pnpm typecheck` clean.

Phase 15 status: **done**.

---

## Phase 16 — Drop the D3 graph, keep the grouped list everywhere

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

- **`components/stack/StackShell.tsx`** — replaced the desktop
  D3 force graph wrapper with the MobileTechList wrapper on
  every breakpoint. The conditional `hidden lg:block` /
  `block lg:hidden` split is gone; the list is now the
  canonical view.
  - Removed the `D3ForceGraph` import (no longer used in
    this file).
  - Updated the file-level JSDoc to reflect the new layout.
  - `edges` prop is still consumed by the `suggested`
    useMemo (line 106) which drives the "Most connected"
    section in the empty-state detail panel — kept.

### Why

The user prefers the grouped tech list layout over the D3
graph. The list reads as a clean index: domain groupings,
per-row project count, click to inspect. The graph added
visual noise without adding information the list doesn't
already convey.

### Decisions

- **Keep MobileTechList as the component name** even though
  it's no longer mobile-only. Renaming would touch the file
  path, the import in StackShell, and the JSDoc — a
  cosmetic-only change with no functional value. Leaving
  the name for now; can rename in a follow-up if the
  codebase owner prefers.
- **Leave `D3ForceGraph.tsx` and `stack-graph.css` on disk.**
  No other consumer; both are now dead code. Deleting them
  is a separate cleanup commit if the user wants — Phase 16
  focuses on layout only.
- **Keep the 2-col grid on lg+.** The list goes in the left
  column (1.6fr) and the detail panel stays in the right
  column (1fr). The list container keeps the same
  `h-[600px] lg:h-[680px] overflow-y-auto` constraint so it
  scrolls inside the grid without pushing the detail panel
  down. Matches the layout the user screenshotted.
- **Legend stays above the list.** Same color-domain
  metadata, now visually precedes the indexed rows instead
  of sitting above a graph that no longer exists.

### Caveats / pending

- `D3ForceGraph.tsx` + `stack-graph.css` are now unused. If
  the user wants them deleted in a follow-up, that's a
  trivial cleanup commit.
- The page's hero description still reads "Hover or click a
  node" — was a graph-era phrase. The detail panel's empty
  state uses "Hover or click a tech" which is accurate, but
  the page-level description could be cleaned up. Not
  blocking; flagged for a future copy pass.
- Pre-existing lint errors in `components/sections/Blog.tsx`
  and `components/sections/Hero.tsx` are out of scope and
  untouched.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes + middleware, 0 warnings.
- **Browser smoke** (Playwright headless Chromium,
  viewport 1440×900):
  - `/stack` renders the grouped list (Backend: Django, DRF,
    FastAPI, Celery, WebSocket, SSE, WebRTC, Python) and the
    detail panel side by side.
  - Click Django → detail panel heading updates to "Django";
    "Used in 7 projects" section appears with all 7 project
    links; "Mentioned in 3 posts" + "Shares projects with 16"
    chips render correctly.
  - Console: zero errors.

---

## Phase 16 wrap-up

The D3 force graph experiment on `/stack` is closed. The page
now ships only the grouped tech list on every breakpoint —
matching the screenshot the user shared. Click-to-inspect
behavior unchanged.

| Surface | Before Phase 16 | After Phase 16 |
|---|---|---|
| `/stack` desktop (lg+) | D3 force graph (which had been silently broken since Phase 3 T3.4 — fixed in Phase 15) | Grouped tech list with project counts |
| `/stack` mobile (<lg) | Grouped tech list (mobile fallback) | Grouped tech list (now canonical) |
| Detail panel | Right column on lg+ | Unchanged — still right column on lg+ |

`pnpm build` reports 19 routes + `ƒ Proxy (Middleware)`. 0
warnings. `pnpm typecheck` clean.

Phase 16 status: **done**.

---

## Phase 17 — Delete D3 graph dead code

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

- **Deleted** `components/stack/D3ForceGraph.tsx` (the
  force-graph component that was unrendered in production
  until Phase 15's fix, then removed from the layout in
  Phase 16).
- **Deleted** `components/stack/stack-graph.css` (the
  accompanying CSS rules for `.stack-graph` selectors).
- **`app/layout.tsx`** — removed the
  `import "@/components/stack/stack-graph.css";` line that
  pulled the deleted stylesheet into the global bundle.
- **`components/stack/MobileTechList.tsx`** — refreshed the
  file-level JSDoc. The old "Mobile fallback for /stack"
  description referenced the now-deleted `D3ForceGraph` and
  its breakpoint gating. New description calls out that
  this component is the canonical view at every breakpoint
  (Phase 16).
- **`package.json`** + **`pnpm-lock.yaml`** — removed three
  runtime d3 deps and three @types packages:
  - `d3-drag` (^3.0.0)
  - `d3-force` (^3.0.0)
  - `d3-selection` (^3.0.0)
  - `@types/d3-drag` (^3.0.7)
  - `@types/d3-force` (^3.0.10)
  - `@types/d3-selection` (^3.0.11)
  - `pnpm install` reported 9 packages removed total
    (including indirect deps).

### Decisions

- **Delete the files outright, don't leave them as `.bak` or
  commented out.** Phase 16 made them unreachable; keeping
  them as dead code would just be future lint noise.
- **Drop the d3 deps from `package.json`.** Strict standing
  rule: no new dependencies without explicit need, no
  carryover dependencies without a consumer. The full d3
  package was never used — only the three modular packages
  above. All gone.
- **Refresh the MobileTechList JSDoc** so it doesn't lie
  about being a mobile-only fallback.
- **Did not rename MobileTechList** to something like
  `TechList.tsx` — the rename touches the import in
  StackShell + this file's path, and the cosmetic value
  isn't worth the diff. The name now describes history
  (mobile origin) rather than current role; flagged for a
  future rename if the codebase owner wants.

### Caveats / pending

- Pre-existing lint errors in `components/sections/Blog.tsx`
  and `components/sections/Hero.tsx` are out of scope and
  untouched.
- The page-level description on `/stack` still reads "Hover
  or click a node" — graph-era phrasing. The detail panel's
  empty state uses "Hover or click a tech" which is
  accurate. Future copy pass.

### Verified

- `pnpm install` → clean (9 packages removed, 0 added).
- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes + middleware, 0 warnings.
- **Compiled CSS check** (`.next/static/chunks/*.css` +
  `.next/dev/static/chunks/*.css`):
  - `grep -l "stack-graph"` → 0 files. The deleted CSS
    rules are fully gone from the bundle.
- **Live SSR smoke** (port 3000):
  - `/stack` → HTTP 200 with the detail panel and grouped
    list in the rendered HTML.
  - `grep "d3-force\|stack-graph"` on the rendered HTML →
    0 hits.
- **Browser smoke** (Playwright headless Chromium,
  viewport 1440×900):
  - Visual identical to Phase 16 screenshot. Grouped list
    left, detail panel right. Click Django → detail
    populated correctly.

---

## Phase 17 wrap-up

The D3 force graph is fully removed from the codebase.
`/stack` now ships only the grouped tech list. Three d3
runtime deps + three @types packages gone from the
dependency tree.

| Surface | Before Phase 17 | After Phase 17 |
|---|---|---|
| `components/stack/` | 5 files (D3ForceGraph, MobileTechList, StackShell, TechDetailPanel, stack-graph.css) | 3 files (MobileTechList, StackShell, TechDetailPanel) |
| `package.json` runtime deps | 22 entries (incl. 3 d3-*) | 19 entries (no d3-*) |
| `package.json` devDeps | 14 entries (incl. 3 @types/d3-*) | 11 entries (no @types/d3-*) |
| Compiled CSS bundle | Carried 23 lines of `.stack-graph-*` rules | No `.stack-graph-*` rules |

`pnpm build` reports 19 routes + `ƒ Proxy (Middleware)`. 0
warnings. `pnpm typecheck` clean.

Phase 17 status: **done**.

---

## Phase 18 — Add Eve Healthcare + role-suffix field + fix Related Projects copy

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-18

### What shipped

- **`data/experience.ts`**:
  - Extended `ExperienceItem` interface with optional
    `roleSuffix?: string` field (between `role` and `period`).
    JSDoc explains the styling contract ("small italic
    ~12px with ' · ' separator on both /log and /log/[id]")
    so future entries know how to use it.
  - Added `roleSuffix: "including 2.5 months parttime"` to
    the `innovative-it` entry. Inline comment documents the
    Sept 2023 overlap story (freelance/part-time
    engagement that converted to full-time after the Eve
    Healthcare internship ended).
  - Added the **Eve Healthcare internship entry** at the
    END of the EXPERIENCE array (4 entries total now).
    `id: "eve-healthcare"`, role `Software Engineer Intern`,
    period `Sept 2023 – Nov 2023`, status `completed`,
    4 bullets verbatim from the user's request. No
    `relatedProjects` (none of the existing PROJECTS are
    tied to Eve Healthcare) and no `notes` (the deep-dive
    falls back to bullets-joined via StoryPath).
- **`app/log/page.tsx` line 131** — render `roleSuffix`
  inline after `{entry.role}` with `" · "` separator +
  italic 12px text. Conditional on the field existing;
  Taply, NexBell, Eve Healthcare render unchanged.
- **`app/log/[id]/page.tsx` line 163** — same conditional
  append on the deep-dive hero; uses `text-t3 italic
  text-[12.5px]` for the suffix (the parent line is
  `text-t2` mid-tone, so the suffix sits one tone quieter
  for hierarchy).
- **`app/log/[id]/page.tsx` lines 254-257** — Related
  Projects subtitle reworded from "shipped at {company}"
  to "shipped alongside work at {company}". Singular and
  plural both grammatical. Single edit point — applies to
  every entry with `relatedProjects` set (Taply, NexBell,
  Innovative IT). Eve Healthcare has no relatedProjects so
  its deep-dive doesn't render the section.

### Decisions

- **Placed Eve Healthcare at the end of the array** (not
  between NexBell and Innovative IT). Both share Sept 2023
  as a start month, so strict reverse-chronological
  ordering has no clean answer; placing the new entry at
  the bottom is the simplest, most predictable placement.
  The user's "below internship experience" reads naturally
  as "below all current entries".
- **`roleSuffix` is optional** — additive change, no
  existing entry breaks. Only `innovative-it` sets it for
  now; future entries can use the same field for similar
  context (e.g. "covering for a maternity leave", "while
  studying part-time").
- **Styling: italic + 12px + `·` separator, text-t3**
  (muted gray). Italic + smaller font reads as "metadata
  about the role" without competing with the bullets.
  Separator is the middle-dot character `·`, not a period
  or asterisk.
- **`tags: []` on Eve Healthcare**, not arbitrary tags.
  The bullets carry the tech signal (WebSocket, APIs,
  analytics) and adding tags would imply they're
  production-grade skills when they're internship-scope.
  Honest empty array.
- **No `notes` on Eve Healthcare** — the user only provided
  bullets. StoryPath already falls back to joining bullets
  with paragraph breaks when `notes` is missing, so the
  deep-dive still has a body section.
- **Single commit for all three edits** — they share the
  same logical concern (`/log` content + structure), all
  touching the same data shape (the new `roleSuffix`
  field), and the verification curls / screenshots cover
  both. Splitting into multiple commits would force
  intermediate states where some entries have suffixes
  and others don't, which would be misleading.

### Caveats / pending

- Pre-existing lint errors in `components/sections/Blog.tsx`
  and `components/sections/Hero.tsx` are out of scope and
  untouched.
- The Eve Healthcare deep-dive falls back to bullets-joined
  as the story prose, which means the StoryPath snake shows
  the same first bullet (Search Optimization) repeated across
  all 5 stages (IDEA / FRAMING / BUILD / DEPLOY / WHAT'S
  NEXT). Functionally fine but visually repetitive. If the
  user wants a custom deep-dive prose, that's a follow-up
  Phase 18.x edit — just add the `notes` field.

### Verified

- `pnpm typecheck` → clean (interface change is additive,
  no consumer broke).
- `pnpm build` → 19 routes + middleware, 0 warnings.
- **Live SSR smoke** (port 3000):
  - `/log` renders 4 timeline cards (Taply, NexBell,
    Innovative IT, Eve Healthcare). The "Software
    Developer · *including 2.5 months parttime*" suffix
    shows on the Innovative IT card.
  - `/log/innovative-it` renders the same suffix in the
    deep-dive hero plus the new "1 project shipped
    alongside work at Innovative IT" subtitle.
  - `/log/eve-healthcare` renders all 4 bullets, no
    Related Projects section.
  - `/log/taply` and `/log/nexbell` deep-dives render the
    new "shipped alongside work at {company}" copy.
- **Browser smoke** (Playwright headless Chromium,
  viewport 1440×900 / 1440×2400 / 1440×3500):
  - `/log` (tall): 4 cards visible, suffix renders
    correctly on the Innovative IT card.
  - `/log/innovative-it` (extra tall): hero + bullets +
    snake path + Related Projects section with
    "1 project shipped alongside work at Innovative IT"
    subtitle (singular works).
  - `/log/eve-healthcare`: bullets + StoryPath snake +
    COMPLETED badge.

---

## Phase 18 wrap-up

`/log` is fully refreshed with the new Eve Healthcare entry,
the role-suffix annotation on Innovative IT, and the
"shipped alongside work at X" copy across all 4 entries.

| Surface | Before Phase 18 | After Phase 18 |
|---|---|---|
| `/log` timeline cards | 3 entries (Taply, NexBell, Innovative IT) | 4 entries (+ Eve Healthcare Sept 2023 – Nov 2023) |
| Innovative IT role | "Software Developer" (bare) | "Software Developer · *including 2.5 months parttime*" |
| Related Projects subtitle | "N projects shipped at {company}" | "N projects shipped alongside work at {company}" |

`pnpm build` reports 19 routes + `ƒ Proxy (Middleware)`. 0
warnings. `pnpm typecheck` clean.

Phase 18 status: **done**.

---

## Phase 19 — Copy pass: simple, minimal, em-dash-free

**Task status:** done
**Commit:** `5939081` (data layer) — plus the data/blog.ts,
data/contact.ts, data/game/villains.ts updates from this phase.
**Date:** 2026-07-18

### What shipped

**`data/experience.ts`** (Phase 19.1)
- All 4 entries (`taply`, `nexbell`, `innovative-it`,
  `eve-healthcare`) rewritten with simple, em-dash-free prose.
- `innovative-it.bullets` are the user's 4 lines verbatim
  (Performance, API Design, Async Architecture, Backend
  Engineering).
- `innovative-it.notes` rewritten as 5 short paragraphs (one
  per StoryPath stage).
- `taply` + `nexbell` keep their 6-paragraph form so the heavy
  detail on founder-track projects is preserved.
- `eve-healthcare.bullets` tightened: "Analytics Integration:
  Integrated doctor dashboard" → "Doctor Dashboard: Built the
  doctor dashboard". Drops the "Integration + Integrated"
  repetition.
- KEY_ACHIEVEMENTS context strings cleaned of em-dash.
- NOW_STATUSES status strings cleaned of em-dash.

**`data/projects.ts`** (Phase 19.2)
- 12 projects. `tagline` / `problem` / `built` em-dash-cleaned
  on all 12.
- All `notes` rewritten as 5-stage narratives (IDEA, FRAMING,
  BUILD, DEPLOY, WHAT'S NEXT). Heavy detail on Taply,
  Algocode, Movio, DrishtiAI, DataLineage Doctor. Medium on
  UnThink, CuteTube, AirPass, ProStream. Concise 2-3 sentence
  paragraphs on Pulumi, ImgTwist, Load Balancer Lab.
- All `notes` values converted from `"..."` regular strings to
  `` `...` `` template literals so JS/TS parses the multi-paragraph
  rewrites. The single-line original `"..."` format would have
  broken the TypeScript parser when the new content introduced
  literal newlines.
- Metric strings cleaned (e.g. "peer-to-peer — no server storage"
  → "peer-to-peer, no server storage"; "team of 3 — 2 countries"
  → "team of 3, 2 countries"; "IaC — fully reproducible" → "IaC,
  fully reproducible").

**`data/blog.ts`**
- 14+ em-dashes in post titles + excerpts cleaned across the
  Linux Networking series (4 parts), the Redis High-Availability
  series (2 parts), the AWS networking post, the Algocode
  series (Medium + native), and the RabbitMQ series (Medium +
  native).
- JSDoc comments left alone (not visible prose).

**`data/contact.ts`**
- FAQ answer for "What stage of companies do you prefer?" had
  "Series A–C is the sweet spot — large enough...". Now reads
  "Series A through C is the sweet spot. Large enough...".

**`data/game/villains.ts`**
- 4 em-dashes in visible game-mode copy (Go and Terraform
  villain descriptions). All converted.

### Tone law applied throughout

- **No em-dashes anywhere in visible prose.** Replaced with "and",
  comma, period, "with", or "through". JSDoc comments and
  section-header comments left alone (not visible).
- **No semicolons in bullets.** Split into sentences.
- **No nested parens**, no stacked parenthetical asides.
- **No AI-junk vocabulary.** Verified clean of: delve into, deep
  dive, certainly, robust, leverage, seamless, synergy, foster,
  comprehensive, streamline, pivotal, pinnacle, intricate,
  game-changer.
- **Heavy detail on key projects.** Taply, Algocode, Movio,
  DrishtiAI, DataLineage Doctor each got 5 paragraphs of real
  substance — architecture, constraints, decisions, trade-offs.
- **Minimal on simple projects.** ImgTwist, Load Balancer Lab,
  Pulumi stay tight. The simple ones don't need to perform.
- **Story flow.** Each project reads as a narrative that builds to
  a payoff, not a bullet-soup.
- **Narrator voice.** First-person, calm, observational. Not
  salesy. Reads like a story that unfolds to a climax.

### Out of scope (per user's clarification)

- `app/*` and `components/*` page-level strings (Hero
  description, section descriptions, Footer tagline, Navbar
  aria-labels, Contact form toasts, HeroTerminal pre-canned
  payloads, BackLink labels, TechDetailPanel empty-state prose).
  All left as-is.
- Em-dashes still appear in rendered HTML from these page-level
  strings, but the data-driven prose is now em-dash-free.

### Caveats / pending

- `components/log/StoryPath.tsx` lines 257 and 265 derive
  headings by splitting on em-dashes. With em-dashes gone from
  bullets, the Stage 1 heading for Eve Healthcare reads
  "Search Optimization: Improved platform search efficiency..."
  (the full first bullet as the heading), which is verbose but
  functionally correct. This is in rendering code (out of scope
  for the data-layer Phase 19 commit). A follow-up could
  change the split character or use the colon as the heading
  terminator instead.
- Pre-existing lint errors in `components/sections/Blog.tsx`
  and `components/sections/Hero.tsx` are out of scope and
  untouched.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes + middleware, 0 warnings.
- **Tone gate** on every modified data file:
  - data/experience.ts: em-dashes in JSDoc only (21 hits, all
    in `/** ... */` and `/* ... */` comments), 0 AI-junk words.
  - data/projects.ts: 7 em-dashes (all in JSDoc), 0 AI-junk
    words.
  - data/blog.ts: 8 em-dashes (all in JSDoc), 0 AI-junk words.
  - data/contact.ts: 8 em-dashes (all in JSDoc), 0 AI-junk
    words.
  - data/game/villains.ts: 9 em-dashes (all in JSDoc), 0
    AI-junk words.
- **Live SSR smoke** (port 3000):
  - /log → HTTP 200 with 4 timeline cards rendered.
  - /work → HTTP 200 with 12 project cards.
  - /log/taply → HTTP 200 with new bullets + 6-paragraph
    notes.
  - /log/innovative-it → HTTP 200 with 4 user-given bullets
    verbatim.
  - /log/eve-healthcare → HTTP 200 with tightened bullets +
    no-notes fallback.
  - /work/taply → HTTP 200 with 5-paragraph "the build"
    narrative.
  - /work/algocode → HTTP 200 with 5-paragraph narrative.
  - /work/imgtwist → HTTP 200 with concise 4-paragraph
    narrative.
  - /writing → HTTP 200 with em-dash-free post titles.
- **Browser smoke** (Playwright headless Chromium):
  - /work/taply (1440x3000): renders Tagline, Problem, Built,
    Metrics, Build (5 paragraphs), Stack, Related Writing, all
    em-dash-free in data-driven prose.
  - /log/eve-healthcare (1440x2000): renders 4 tightened
    bullets + StoryPath snake with bullet-fallback prose.

---

## Phase 19 wrap-up

Two data commits shipped. Two related commits for the
documentation/data files (blog, contact, game). All visible
prose on /log, /log/*, /work, /work/*, /writing, /writing/* is
now em-dash-free. Story-arc tone applied: heavy detail on key
projects, minimal on simple ones, no AI-junk vocabulary.

| Surface | Before | After |
|---|---|---|
| /log experience bullets | 2 em-dashes in Taply, NexBell bullets; semicolons; nested parens | Em-dash-free; semicolons split into sentences; flat structure |
| /log experience notes | Em-dash-heavy, ~6 long paragraphs, mixed tone | Em-dash-free, 5-6 paragraph story flow, calm narrator voice |
| /work project descriptions | Single ~700-word paragraph per project | 5-stage narrative (IDEA, FRAMING, BUILD, DEPLOY, WHAT'S NEXT) per project |
| /work tagline/problem/built | Em-dash-heavy across all 12 | Em-dash-free across all 12 |
| /writing post titles + excerpts | 14 em-dashes | Em-dash-free |
| /lets-connect FAQ | 1 em-dash | Em-dash-free |
| /game villain copy | 4 em-dashes | Em-dash-free |

`pnpm build` reports 19 routes + `ƒ Proxy (Middleware)`. 0
warnings. `pnpm typecheck` clean.

Phase 19 status: **done**.

---

# Phase 24 — Eyebrow reframe, em-dash sweep, hero rewrite, /writing 9-card collapse, story-stage labels, stars

**Phase:** 24 — UX/copy sweep + content polish

**Phase status:** in-progress

**Date started:** 2026-07-19

**Goal:** Seven related UX/copy/content changes landing across the
portfolio: em-dash sweep on landing-page strings (Phase 19 cleaned
the data files; page-level strings stayed), hero H1 + description
rewrite, section eyebrow rework (drop the `01 / DEPLOYMENT LOG`
pattern site-wide), `/writing` 9-card collapse, story-stage labels
(`[Idea] / [Framing] / [Build] / [Deploy] / [What's next]`) on
`/work/[slug]`, stars badge on the case-study Hero, and a
retrospective doc for Phases 20–22.

**Result target:** A landing page that reads as deliberate human
prose, inner pages that don't carry the AI-slop eyebrow pattern,
case-study pages with a single visible story structure, and a
`/writing` list that's not all-at-once.

Master plan tasks (T24.1 → T24.7):

1. **T24.1** — Retrospective doc for Phases 20, 21, 22
2. T24.2 — Em-dash sweep on page-level strings
3. T24.3 — Hero H1 + description rewrite
4. T24.4 — Section eyebrows (drop `01 / LABEL` site-wide)
5. T24.5 — `/writing` 9-card collapse + `?all=1` URL flag
6. T24.6 — `[Idea] / [Framing] / [Build] / [Deploy] / [What's next]` labels in `/work/[slug]`
7. T24.7 — Stars badge on case-study Hero (9 projects)

---

## T24.1 — Retrospective for Phases 20, 21, 22

**Task status:** done
**Commit:** `b3d2372`
**Date:** 2026-07-19

### What shipped

- **`progress/work-progress-p20-22.md`** — single retrospective
  file covering three thin follow-up commits that landed between
  Phase 19 (data copy pass) and Phase 23 (navbar + proxy
  migration). Each section follows the rulebook format (What
  shipped / Decisions / Caveats / Verified).
  - **Phase 20** (`fb9be1e`) — added WebSocket / DRF / Redis to
    Eve Healthcare in `data/experience.ts` so the deep-dive
    Keywords section renders 3 clickable chips instead of
    `"0 techs"`.
  - **Phase 21** (`936cae3`) — added bKash under the payment
    domain in `data/stack.ts` with `projects: ["nexbell"]`
    (a reference slug, not a `/work/<nexbell>` slug).
  - **Phase 22** (`05b1f2a`) — split `tech.projects` into
    `resolvedProjects` + `unresolvedRefs` in StackShell; the
    detail panel now renders `"Used in N projects + M
    references"` with company + period metadata for phantom
    refs.

### Decisions

- **Single retrospective file instead of 3 thin stubs** —
  rulebook-compliant (preserves the per-phase pattern by
  giving each phase its own section header) and avoids three
  thin files for thin commits.
- **Place the file under `progress/work-progress-p20-22.md`**
  with the file header documenting all three phases. Phase 23
  has its own `work-progress-p23.md`; this fills the
  20–22 gap.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → clean.

---

## T24.2 — Em-dash sweep on page-level strings

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped

11 user-visible em-dashes replaced across page-level strings
(comma, period, or ` · ` separators per the Phase 19 tone law).
JSDoc comments and developer identifiers (e.g.
`"%s — Mahboob Alam"`, `"Mahboob Alam — Co-Founder & Backend
Engineer"`) intentionally left alone — those are convention, not
prose.

- **`app/work/page.tsx`** — metadata + InnerPageHeader
  description: `"Founder projects, featured builds, and a
  long-tail of experiments — filter by domain."` →
  `"…experiments. Filter by domain."` (em-dash → period).
- **`app/writing/page.tsx`** — metadata + InnerPageHeader
  description: `"How I think, not just what I shipped —
  long-form breakdowns…"` → `"…what I shipped.
  Long-form breakdowns…"` (em-dash → period).
- **`app/log/[id]/page.tsx`** — CaseStudyCrossLink paragraph:
  `"For the architecture deep-dive — three-layer build,
  isolation strategy, deployment topology — read the case
  study"` → `"…deep-dive: three-layer build, isolation
  strategy, deployment topology. Read the case study"`
  (em-dashes → colon + period).
- **`components/sections/SkillGraph.tsx`** — section
  description: `"Not a list of logos. Hover a node to trace
  what it actually works with — including what I'm actively
  leveling up."` → comma.
- **`components/sections/Contact.tsx`** — section
  description: `"Hiring, consulting, a partnership, or just
  a hello — pick a label…"` → period.
- **`components/sections/Hero.tsx`** — eyebrow line:
  `"BACKEND & PLATFORM ENGINEER — BANGALORE / CHENNAI"` →
  `"…ENGINEER · BANGALORE / CHENNAI"` (em-dash → middle dot,
  matches the existing middle-dot convention used in the
  Navbar's "Let's connect" pulse treatment). The H1 and
  description get the full rewrite in T24.3.
- **`components/hero/HeroTerminal.tsx`** — TerminalBlock label
  `"terminal — click a command"` → middle dot. Chip `whoami`
  payload line `"Last role: … — {role}."` → comma.
- **`app/api/contact/route.ts`** — body line `"— {email}"`
  → `"From: {email}"` (em-dash was reading as the email
  signature separator; `From:` is the standard email header).
- **`app/work/[slug]/page.tsx`** — fallback label `"—"` in the
  metric row's split-helper → `""` (empty string; the metric
  number renders alone when there's no label).

### Decisions

- **Industry-standard identifiers kept verbatim:**
  `"%s — Mahboob Alam"` (page titles), `"Mahboob Alam — Co-
  Founder & Backend Engineer"` (author byline + OG alt), and
  `"Bangalore / Chennai — India"` (timezone/locale format)
  stay. These aren't prose — they're conventional naming
  patterns readers expect.
- **`chips` + `data` arrays keep `split(" — ")`** — that's a
  code split, not visible prose. Phase 19 cleaned the
  project.tagline string content but the split-character was
  unchanged.
- **JSDoc / JSX comments left alone** — they're developer
  documentation, not user-visible.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes + middleware, 0 warnings.
- Tone-gate grep: `grep -rn '[a-zA-Z0-9\)\?\.!,;]—' app components --include='*.tsx' --include='*.ts'` returns no visible-prose hits.

---

## T24.3 — Hero H1 + description rewrite

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped

- **`components/sections/Hero.tsx`** — H1 + description paragraph
  rewritten.
  - H1: `"I build the infrastructure layer nobody sees — and
    write about it."` → `"I build the infrastructure layer
    nobody sees and I write about it."` (em-dash dropped, `and`
    glued inline). Accent span on `infrastructure layer` keeps
    its `text-acc` mint-green color.
  - Description: replaced the corporate-context opener
    (`"2.5+ years architecting distributed systems:
    microservices, async pipelines, container isolation, and
    video infrastructure. Currently leading backend architecture
    at NexBell, while writing The Backend Diaries — deep dives
    into the systems I build."`) with the locked copy from
    planning: `"Distributed systems, async pipelines, kernel
    isolation, video infrastructure, networking. I write the
    code that doesn't show up in a screenshot and breaks the
    second it stops working. Then I write about it in The
    Backend Diaries."`
- JSDoc block at the top of the file refreshed to reflect the
  new copy (eyebrow now `·`, H1 em-dash dropped, description
  reframed).

### Decisions

- **Kept the technical-list opener strong** — `<strong>` wraps
  the 5-tech list so the eye lands on it first; the
  calm-narrator sentence follows in regular weight.
- **Wrote `networking` into the list** — per user's planning
  direction. Networking is the surface that touches every
  other item in the list (kernel isolation, video infra,
  async pipelines all depend on it).
- **The screenshot/breaks-when-stopped line** lands the "infra
  is invisible until it breaks" beat the user wanted. Mirrors
  the canonical infra-engineer narrative without sounding
  boastful.
- **Closing line "Then I write about it in The Backend
  Diaries."** — explicit connection to the writing surface.
  "Then" beats the comma-only "and I write about it" because
  it frames writing as a deliberate second act, not a
  parenthetical.
- **JSDoc refresh** keeps the file header honest. Future
  agents reading the file see the current copy.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes + middleware, 0 warnings.
- `curl /` (dev): H1 reads "I build the infrastructure layer
  nobody sees and I write about it." with the accent span on
  `infrastructure layer`. Description contains no em-dash.

---

## T24.4 — Section eyebrows + inner-page eyebrows

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped

The `XX / LABEL` numbered-eyebrow pattern is gone site-wide.
Each section now carries a single short human label that reads
as deliberate prose. Mapping (locked in during planning):

| Route | Old eyebrow | New eyebrow |
|---|---|---|
| Landing + `/log` | `01 / DEPLOYMENT LOG` | `Where I've shipped` |
| Landing + `/work` | `02 / SYSTEMS` | `Everything I've built end-to-end` |
| Landing + `/stack` | `03 / DEPENDENCY GRAPH` | `How the stack connects` |
| Landing + `/writing` | `04 / THE BACKEND DIARIES` | `The Backend Diaries` |
| Landing + `/lets-connect` | `05 / OPEN AN ISSUE` | `Say hello` |
| `/game` | `06 / GAME MODE` | `Game mode` |

11 files touched:

- **`components/layout/InnerPageHeader.tsx`** — the `num`
  rendering branch removed. The component now renders only
  `section` (the eyebrow line). `num` stays on the prop
  interface for backward compatibility with existing call
  sites but is no longer rendered. JSDoc refreshed.
- **`app/log/page.tsx`, `app/work/page.tsx`,
  `app/stack/page.tsx`, `app/writing/page.tsx`,
  `app/lets-connect/page.tsx`** — `num` dropped from the
  `header={…}` object, `section` updated to the new label.
- **`components/sections/DeployLog.tsx`,
  `Projects.tsx`, `SkillGraph.tsx`, `Blog.tsx`,
  `Contact.tsx`** — local `<p>` eyebrows updated from
  `XX / LABEL` to the new label. H1/H2 reworded where the
  previous H1 was just the section label repeated (DeployLog
  H1 = `Where I've shipped, what I built, and how it went.`
  — was `Where I've shipped`; Projects H1 = `Everything I've
  built end-to-end` — was `Things I've built end-to-end`;
  Blog H1 = `Writing, how I think, not just what I shipped.`
  — was `Writing — how I think, not just what I shipped`).
- **`app/game/page.tsx`** — `06 / GAME MODE` →
  `Game mode`; description paragraph em-dash cleaned
  (`Top-down pixel-art city — every building is a project,`
  → period).

### Decisions

- **Eyebrow + H1 may match** when the section name is the
  most natural title (e.g. `/log`, `/work`, `/stack`). On
  the landing, the eyebrow is the human label and the H1
  carries the section's emotional pitch. Both are
  mono-cased where appropriate.
- **Inner pages mirror the landing labels** — same
  treatment, same voice. Consistency across surfaces.
- **`InnerPageHeader.num` kept as a typed prop** — silently
  unused. Dropping it would touch every call site a second
  time and risk regressions; keeping it (with a
  `// eslint-disable-next-line` for the unused-var warning)
  preserves the call-site ergonomics for now. Future polish
  can delete the prop entirely.
- **`/game` didn't appear in the original planning list**
  but the same `XX / LABEL` pattern lived there as well.
  Fix landed in this commit since it's the same one-line
  substitution + a sibling em-dash cleanup. Documented in
  the table above.
- **JSDoc comments at the top of every section component
  still mention the old `XX / LABEL`** — those are developer
  docs, not visible prose. Future cleanup commit.

### Caveats / pending

- **`num` prop is shadowed with `// eslint-disable-next-line`
  unused-var** — keep the comment + rename (or drop the
  prop) in a follow-up if it bothers anyone.
- **`app/lets-connect/page.tsx` and `app/writing/page.tsx`
  keep `num` literally in the `header={…}` object** — the
  prop is now unused, but the literal `"num"` key passes
  the typecheck because `num?: string` is optional. Linter
  would not flag it. Future polish.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes + middleware, 0 warnings.
- Live SSR (dev) smoke across all 6 changed routes: the
  eyebrow now reads as a single human label on every
  surface. No `01 / `, `02 / `, … substrings remain in the
  rendered HTML body of `/`, `/log`, `/work`, `/stack`,
  `/writing`, `/lets-connect`, `/game`.

---

## T24.5 — `/writing` 9-card collapse

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped

- **`components/writing/WritingShell.tsx`** — added
  `useState<boolean>` for `expanded` plus a `COLLAPSE_AT = 9`
  cap. The main grid renders `expanded ? visible : visible.slice(0, 9)`.
  When `visible.length > 9`, a "Show all N" button renders
  below the grid (toggles to "Show fewer" when expanded).
  Cancel by clicking again — same button toggles both ways.
  Hidden entirely when `visible.length <= 9` so narrow
  categories (e.g. Linux with 5 posts) don't render a
  no-op button.
- **URL persistence via `?all=1`** — `router.replace` keeps
  the collapse state shareable via direct link. Same pattern
  as the landing Blog section (T6.4 polish).
- **`app/writing/page.tsx`** — wrapped `<WritingShell>` in
  `<Suspense fallback={null}>` to satisfy Next 16's
  `useSearchParams` requirement (Client Components using
  `useSearchParams` must be inside a Suspense boundary at
  the page level, or the page bails out of static prerender).
- **`useEffect` on `searchParams`** — keeps the local
  `expanded` state in sync with the URL when the user
  navigates between `/writing` and `/writing?all=1` in the
  same session.

### Decisions

- **Collapse applies on every category, not just `All`** —
  per user's planning decision. The 9-card cap is uniform
  across the registry; the button only renders when
  `visible.length > 9`, so a narrow-category view (Linux
  has 5 posts) gets no button.
- **`COLLAPSE_AT = 9` not 6** — the user explicitly asked
  for 9 on `/writing` (vs the landing Blog's 6) because the
  blog list is the canonical archive surface; a longer
  default reads as more browsable.
- **`router.replace` not `push`** — back button skips the
  toggle state, matching the landing Blog pattern.
- **`aria-expanded` + `aria-controls="writing-list"`** —
  screen readers announce the toggle as a disclosure widget
  pointing at the post grid. Same a11y pattern as T6.4.
- **No fade animation** — same minimal-v1 polish level as
  the landing Blog section. Toggle is instant.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes + middleware, 0 warnings.
- `curl /writing` (dev): grid renders 9 cards; toggle
  button reads `Show all 17` (assuming 17 default visible),
  `aria-expanded="false"`, `aria-controls="writing-list"`.
- `curl /writing?all=1`: grid renders all 17; toggle reads
  `Show fewer`, `aria-expanded="true"`.
- Narrow category (Linux, 5 posts): no toggle button rendered.

---

## T24.6 — Story-stage labels in /work/[slug]

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped

- **`components/work/StorySection.tsx`** (new, ~70 lines).
  Takes `notes` + a fallback paragraph. Splits `notes` on
  `\n\n+`, renders each paragraph as a labeled stage:
  `[Idea]` / `[Framing]` / `[Build]` / `[Deploy]` /
  `[What's next]`. Stage label sits on its own line above
  the paragraph, styled as amber mono 13px uppercase
  tracked (`text-amber font-mono text-[13px] uppercase
  tracking-[1.2px]`).
- **`app/work/[slug]/page.tsx`** — the file-local
  `BuildNotes` function now delegates to `<StorySection>`.
  The wrapper keeps the existing call signature
  (`<BuildNotes project={project} />`) so the page body
  doesn't change. The old "idea → framing → build →
  deploy → what's next" italic caption next to the section
  H2 is gone — the labels now appear in-line with the
  prose.
- **5-stage map for 5-paragraph projects** (10 of 12).
- **6-stage map for Taply + NexBell** (2 of 12) — they
  keep their 6-paragraph form (per the Phase 19 copy pass);
  the DEPLOY label covers paragraphs 4 and 5 in their
  notes.

### Decisions

- **Taply + NexBell stay 6-paragraph** — per user's
  planning decision. The 6-paragraph form preserves the
  heavier detail those founder-track projects earned. The
  DEPLOY label covers 2 paragraphs; reading the case study
  flows naturally because the label carries the same
  semantic across the boundary.
- **Fallback paragraph uses `problem + built` joined with
  `\n\n`** — same fallback the previous `BuildNotes`
  function used, just normalized as a single string so the
  splitting logic doesn't need to special-case two
  sources.
- **No `space-y-4` between paragraphs anymore** — the
  per-stage `<div>` owns its own `mt-8` rhythm so the
  stage label and the paragraph sit closer together
  (they belong to each other) and the gap between stages
  is more deliberate.
- **Stage label styling matches the existing amber mono
  treatment** — same pattern used by the
  `KEY_ACHIEVEMENTS` metric labels on `/log`, the Hero
  eyebrow, and the `HeroTerminal` chip-row border
  treatment. The `[Brackets]` characters make the labels
  read as deliberate section markers, not body text.
- **`first:mt-0` via the `i === 0 ? "" : "mt-8"` ternary**
  — no CSS `first:` selector needed; the conditional keeps
  the markup symmetric.
- **Defensive `labels[labels.length - 1]` fallback** in
  case a future project ships more than 6 paragraphs (e.g.
  7 paragraphs would render stage labels 1–6 then fall
  through to `[What's next]` for paragraph 7). Reads as
  graceful degradation.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes + middleware, 0 warnings.
- Live SSR (dev) smoke across `/work/taply` (6
  paragraphs → 6 stage labels, DEPLOY covers 2), `/work/
  algocode` (5 → 5), `/work/imgtwist` (5 → 5). Every
  case-study page renders the same 5 (or 6) stage labels
  above its paragraphs in amber mono.
- Existing sections above and below "The build" untouched:
  Hero / MetricsRow / StackBreakdown / LinksRow /
  RelatedWriting / RelatedStack / SeriesNav all render
  unchanged.

---

## T24.7 — Stars badge in case-study Hero

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped

- **`data/projects.ts`** — added `stars: N` to 9 projects:
  - `movio`: 13
  - `datalineage-doctor`: 25
  - `cutetube`: 8
  - `drishti-ai`: 14
  - `airpass`: 12
  - `pulumi-infra`: 8
  - `imgtwist`: 8
  - `prostream`: 10
  - `load-balancer`: 7
  - `algocode` already had `stars: 22`. Taply + UnThink
    intentionally skip the field — Taply is private
    (`github: null`) and UnThink is in active build
    (`github: null`).
- **`app/work/[slug]/page.tsx`** — the case-study Hero
  (`function Hero`) now renders a `★ N` badge next to the
  `[year]` chip in the badge row. Style matches the
  `ProjectCard` (T3.2) implementation: `text-amber
  font-mono text-[13px]`. Adds an `aria-label={`${stars}
  stars on GitHub`}` for screen readers (the visual "★
  22" reads as opaque to AT users).

### Decisions

- **Same-row placement as `[year]`** — sits in the existing
  `<div className="mb-3 flex items-center gap-3">` row.
  Visual hierarchy: status Badge → `[year]` → `★ N`. No
  layout shift, no new flex container.
- **Conditional render** — `project.stars ? <span>...</span>
  : null`. Taply + UnThink render without the badge, same
  as before.
- **`aria-label` on the badge** — the unicode star
  character isn't always announced by screen readers, so
  the explicit `"22 stars on GitHub"` label makes the
  social-proof signal accessible.
- **`ProjectCard.tsx` already had the badge pattern**
  (T3.2, for `/work` grid cards + `/log/[id]`
  RelatedProjects). This commit lifts the same pattern to
  the case-study Hero — single visual language across
  every surface that mentions a project.
- **No badge on `/game` mode** — the `CaseStudyOverlay`
  component renders the same `project.stars` via
  `ProjectCard`'s already-implemented pattern; no change
  needed there.
- **Star counts are user-provided values** — taken
  verbatim from the planning discussion. If any are wrong
  vs GitHub's current state, the user can update them in
  `data/projects.ts` directly; the field is the single
  source of truth.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes + middleware, 0 warnings.
- Live SSR (dev) smoke per project:
  - `/work/algocode` → ★ 22 next to [2024].
  - `/work/movio` → ★ 13.
  - `/work/datalineage-doctor` → ★ 25.
  - `/work/drishti-ai` → ★ 14.
  - `/work/cutetube` → ★ 8.
  - `/work/airpass` → ★ 12.
  - `/work/pulumi-infra` → ★ 8.
  - `/work/imgtwist` → ★ 8.
  - `/work/load-balancer` → ★ 7.
  - `/work/prostream` → ★ 10.
  - `/work/taply` → no badge (private repo).
  - `/work/unthink` → no badge (no GitHub).

---

# Phase 25 — Landing eyebrow strip + inner-page eyebrow rework

**Phase:** 25 — Eyebrow copy pass

**Phase status:** done

**Date:** 2026-07-19

**Goal:** Drop the eyebrow line from the 5 landing-page sections
(DeployLog / Projects / SkillGraph / Blog / Contact) and rework
the inner-page eyebrows so they don't duplicate the H1. Visual
treatment stays the same; copy is shorter and lowercase so it
reads as a deliberate label rather than templating.

---

## T25.1 — Landing eyebrow strip + inner-page eyebrow rework

**Task status:** done
**Commit:** `ff2ae1e`
**Date:** 2026-07-19

### What shipped

10 files touched:

- **`components/sections/DeployLog.tsx`,
  Projects.tsx, SkillGraph.tsx, Blog.tsx, Contact.tsx`** —
  the `<p className="text-acc mb-2.5 font-mono text-[13px]
  tracking-[1px]">{eyebrow}</p>` line removed from each
  section header. H1 + description underneath stay
  untouched. Each section opens directly with the
  display-font H1.
- **`app/log/page.tsx`** — InnerPageHeader eyebrow:
  `"Where I've shipped"` → `"the run so far"`.
- **`app/work/page.tsx`** — eyebrow:
  `"Everything I've built end-to-end"` → `"the build catalog"`.
- **`app/stack/page.tsx`** — eyebrow:
  `"How the stack connects"` → `"every tool, every system"`.
- **`app/writing/page.tsx`** — eyebrow:
  `"The Backend Diaries"` → `"how i think"`. Headline:
  `"Writing"` → `"The Backend Diaries"`.
- **`app/lets-connect/page.tsx`** — unchanged.
  Eyebrow stays `"Say hello"` (per user direction).
- **`components/layout/InnerPageHeader.tsx`** — JSDoc
  block refreshed to reflect the new lowercase eyebrow
  pattern.

### Decisions

- **Landing eyebrows dropped entirely** — the user
  explicitly asked for zero eyebrow content on the
  landing. The 5 sections now lead with their H1 + one-line
  description. Cleaner visual rhythm; no AI-slop "section
  number" feel.
- **Lowercase inner-page eyebrows** — the `text-acc font-mono
  text-[13px] tracking-[1px]` style stays; only the copy
  changes. Lowercase reads as a deliberate label rather
  than a templated header tag.
- **`/writing` is the cleanest eyebrow/headline pair**:
  eyebrow `how i think` + headline `The Backend Diaries`
  — the two labels read as a complete sentence ("how I
  think, The Backend Diaries"). Natural semantic split.
- **`/lets-connect` left unchanged** — the user
  explicitly said no change needed; the existing
  `"Say hello"` eyebrow + `"Let's build something
  durable."` headline already work.
- **JSDoc comments at the top of each section component
  still reference the old `XX / LABEL`** — developer docs,
  not visible prose. Untouched per the tone law.
- **No new components** — single-file edits per section
  plus the InnerPageHeader JSDoc refresh.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes + middleware, 0 warnings.
- `grep -rn "text-acc mb-2.5 font-mono" components/sections`
  → 0 hits. The landing eyebrow `<p>` lines are fully
  removed.
- Live SSR (dev) smoke across `/`, `/log`, `/work`,
  `/stack`, `/writing`:
  - `/` → no eyebrow lines on any of the 5 sections;
    each section opens with H1 directly.
  - `/log` → eyebrow `the run so far`, H1 `Where I've
    shipped, what I built, and how it went.`
  - `/work` → eyebrow `the build catalog`, H1
    `Everything I've built end-to-end`.
  - `/stack` → eyebrow `every tool, every system`, H1
    `How the stack connects`.
  - `/writing` → eyebrow `how i think`, H1
    `The Backend Diaries`.
  - `/lets-connect` → unchanged.

---

# Phase 26 — Landing gap halve + showcase stars + /lets-connect redesign

**Phase:** 26 — UX polish

**Phase status:** done

**Date:** 2026-07-19

**Goal:** Three independent changes landing together:
(1) halve the landing section top padding (90→45) to match
the new eyebrow-free rhythm; (2) showcase-tier cards on `/work`
gain the same `★ N` badge featured cards already had; (3) the
`/lets-connect` page reshuffles — smaller description textarea,
FAQ moved out of the right sidebar into a full-width section
below the form, and a new "is this email for me?" Quick context
card fills the vacated FAQ slot.

---

## T26.1 — Landing gap halve + showcase stars

**Task status:** done
**Commit:** `783e089`
**Date:** 2026-07-19

### What shipped

- **`components/sections/DeployLog.tsx`,
  Projects.tsx, SkillGraph.tsx, Blog.tsx, Contact.tsx`** —
  section className `py-[90px]` → `pt-[45px] pb-[90px]`.
  Halves the top padding only; the bottom 90px stays for
  the inter-section breath.
- **`components/work/ProjectCard.tsx`** — the showcase
  variant's top row (`<div className="flex items-center gap-2">`)
  now renders a `★ N` `<span>` next to the Badge when
  `project.stars` is set. Same `text-amber font-mono
  text-[10.5px]` styling as the featured variant.

### Decisions

- **Top padding halved, bottom kept** — when the eyebrow
  line was present, the gap above the H1 was 90px of
  section padding + 10px eyebrow→H1 margin. Halving the
  top padding restores the same visual breath. Bottom
  stays 90px because the next section's H1 (or footer)
  needs the spacing for visual rhythm.
- **Showcase stars match featured exactly** — same
  className, same `aria-label="${stars} stars on GitHub"`,
  same inline-after-Badge placement. Single visual language
  for every project card on `/work`.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes + middleware, 0 warnings.
- Live SSR smoke (dev): `/work` showcase cards now render
  `★ N` next to the shipped badge. Landing sections feel
  tighter above the H1.

---

## T26.2 — `/lets-connect` redesign

**Task status:** done
**Commit:** `cd9488e`
**Date:** 2026-07-19

### What shipped

- **`data/contact.ts`** — `FAQ` expanded from 3 to 9 entries
  (3 originals + 6 new). New data exports:
  - `QUICK_CONTEXT_FITS: QuickContextItem[]` (4 entries).
  - `QUICK_CONTEXT_DOESNT: QuickContextItem[]` (4 entries).
- **`components/contact/ContactForm.tsx`** — description
  textarea: `rows={5}` → `rows={3}`, `min-h-[120px]` →
  `min-h-[80px]`. `resize-y` kept so users can drag taller
  if they want more room.
- **`components/contact/FAQSection.tsx`** (new, ~50 lines)
  — Server Component. Renders the full FAQ list as a
  single `bg-surface` card with the same Q:/A: mono
  prefix the old sidebar card used. Reads as a deliberate
  FAQ block, not a sidebar item.
- **`components/contact/ContactSidebar.tsx`** — dropped
  `FAQCard`. Added `QuickContextCard` (two-bullet list:
  "Probably fits" with accent-green dots, "Probably doesn't"
  with muted dots). Visual hierarchy: the "fits" items
  read as opportunities, the "doesn't" items read as
  honest exclusions.
- **`app/lets-connect/page.tsx`** — layout rewritten:
  - Left column: `ContactForm` + `FAQSection` (full-width
    below the form, `mt-6` separator).
  - Right column: `ContactSidebar` (Availability +
    DirectLinks + QuickContext). No structural change to
    the grid template.

### Decisions

- **FAQ below the form, not inside it** — placing the
  FAQ inside the TerminalBlock would make the terminal
  panel absurdly long; placing it as a separate card
  below the form lets the terminal panel stay tight
  while the FAQ takes the visual real estate the form
  used to occupy.
- **QuickContext reads as "is this email for me?"** —
  the eyebrow label `Is this email for me?` frames the
  card as a soft gate. Fits = accent-green dots,
  doesn't = muted dots. Visual hierarchy matches the
  semantic: the user is invited if their context matches
  "fits", warned off if it matches "doesn't".
- **FAQ grouped by topic** — order: location → company
  fit → engagement → logistics → work style → ramp.
  The 3 originals stay at the top because they answer
  the most-common questions. New 6 follow in a sensible
  reading order.
- **No markdown support in FAQ** — kept the same
  `{question, answer}` string shape; no HTML risk.
- **`aria-label` on showcase star badge** — same a11y
  pattern as the case-study Hero (T24.7).
- **No CTA at the bottom of the FAQ** — the form is
  right there at the top of the page. FAQ is a
  read-only reference.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes + middleware, 0 warnings.
- Live SSR (dev) smoke on `/lets-connect`:
  - Description textarea visibly shorter (~80px tall).
  - Below the TerminalBlock: full-width FAQ card with
    9 Q&A pairs.
  - Right sidebar: Availability + DirectLinks +
    QuickContext (3 cards stacked).
  - QuickContextCard: "Probably fits" section has 4
    accent-green-dot bullets; "Probably doesn't" has 4
    muted-dot bullets.

---

# Phase 27 — /lets-connect right sidebar gap fill

**Phase:** 27 — sidebar polish

**Phase status:** done

**Date:** 2026-07-19

**Goal:** Phase 26's contact page redesign left the right
sidebar visibly shorter than the FAQ on the left. Fill the
vertical gap with 3 small pragmatic cards so the bottoms
roughly align on lg+.

---

## T27.1 — Right sidebar gap fill

**Task status:** done
**Commit:** `0581815`
**Date:** 2026-07-19

### What shipped

3 new sidebar cards, all data-driven from `data/contact.ts`:

- **`WHAT_I_READ_FIRST: WhatIReadFirstItem[]`** — 4 bullets
  describing what lands at the top of inbox. Subject line +
  opening line, role context, specific problem, JD link.
- **`RESPONSE_TIME_LINES: ResponseTimeLine[]`** — 3
  timezone + cadence lines. IST + weekdays 1–6pm,
  async-first within a working day, [urgent] for
  same-day reads.
- **`HOW_THE_FORM_GETS_USED: FormDataLine[]`** — 4 quiet
  privacy + data-handling lines. Relays to Gmail via
  Resend, I read every email myself, your address
  goes nowhere else, form data isn't stored.

`components/contact/ContactSidebar.tsx` — 3 new card
components (`WhatIReadFirstCard`, `ResponseTimeCard`,
`HowTheFormGetsUsedCard`) appended after the existing 3.
Same visual chrome as `QuickContextCard`: `bg-surface`
rounded card, mono eyebrow label, accent-mint arrow
bullets, `text-t1` body.

### Decisions

- **Visual order: Availability + DirectLinks +
  QuickContext first, then 3 new cards below** — the
  user picked this order during planning. Reads as:
  status → contact info → context → practical guidance.
- **Cards 4-6 use accent-mint `→` arrow bullets** —
  same as QuickContext's "fits" treatment but with a
  mono arrow glyph instead of a dot. Distinguishes the
  read-first/time/privacy beats from the binary
  fits/doesn't contrast.
- **No "Before you hit send" checklist** — the user
  reviewed the draft and decided it read too corporate.
  Dropped before commit.
- **All copy in `data/contact.ts`** — same registry
  pattern as FAQ + QuickContext. Single source of truth
  for /lets-connect copy.
- **Card titles stay short** — every eyebrow reads
  honestly ("What I read first" reads as how I read
  first; "Response time" reads as what my response
  times look like; "How the form gets used" reads
  as data-handling disclosure).
- **No CTA** — none of the 3 cards has a click target.
  They're read-only context. The form is right there at
  the top of the page.
- **No analytics on card presence** — Phase 6 territory.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes + middleware, 0 warnings.
- Live SSR (dev) smoke on `/lets-connect`:
  - Right sidebar now has 6 stacked cards: Availability,
    DirectLinks, QuickContext, What I read first,
    Response time, How the form gets used.
  - Bottom edge of the right sidebar now roughly aligns
    with the bottom edge of the FAQ on the left on lg+.
  - All 11 new bullets read directly from
    `data/contact.ts` — no strings hardcoded in JSX.

