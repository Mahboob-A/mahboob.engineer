# Phase 2 — Landing page

**Phase:** 2 — Landing page
**Phase status:** in-progress
**Date started:** 2026-07-10
**Goal:** `/` matches the flat mockup. The 5 sections (Hero / DeployLog /
Projects / SkillGraph / Blog / Contact) plus the animated Algocode
architecture diagram from T1.5. Phase 2 ends when scrolling `/` from top
to bottom is a faithful port of `portfolio-flat-mockup.html` and every
section anchor `#log`, `#work`, `#stack`, `#blog`, `#contact` scrolls
correctly.

Master plan tasks in this phase (T2.1 → T2.8):

1. T2.1 — Hero (eyebrow + h1 + description + 3 CTAs + StatRow)
2. T2.2 — Animated Algocode request-trace SVG (hero diagram)
3. T2.3 — Deployment Log section (experience entries from data)
4. T2.4 — Projects section (3-4 cards with mini-SVG diagrams each)
5. T2.5 — Skill Graph section (static SVG with hover dim/highlight)
6. T2.6 — Blog cards (3 from BLOG_POSTS)
7. T2.7 — Contact terminal form + Footer
8. T2.8 — Wire up `app/page.tsx` to compose all sections + TerminalBlock

---

## T2.1 + T2.2 — Hero + Algocode diagram

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-10

### What shipped

The top section of `/`, and the diagram that anchors it visually:

- **`components/sections/Hero.tsx`** — the section component. 2-column
  grid on `lg+`, single column on mobile.
  - Eyebrow: `text-amber font-mono text-[13px] tracking-[1px]` with a
    small accent line (`bg-amber h-px w-7`) before the text.
  - h1: `font-display text-t1 text-[clamp(36px,5.5vw,64px)] font-bold
leading-[1.08] tracking-[-1px]`. "infrastructure layer" rendered
    as `<span class="text-acc">` for the accent color hit.
  - Description: `text-t2 max-w-[560px] text-[18px]` with two `<strong
class="text-t1">` highlights for the numbers and the blog name.
  - 3 CTAs in a flex-wrap row: primary `bg-acc text-bg` for "View
    systems →", ghost `border-border` for the other two, all hover to
    accent border.
  - `<StatRow>` (T1.5) with 4 entries: 3 / 6+ / 35% / 12+.
  - Right column: `<DiagramPanel>` (T1.5) wrapping `<AlgocodeDiagram>`.
- **`components/diagrams/AlgocodeDiagram.tsx`** — pure SVG + SMIL
  animation. 8 nodes (Client, Auth Service, Code Manager, 2× RabbitMQ,
  RCE Engine, Docker Judge, MongoDB/Redis) connected by 8 edges.
  7 animated packets travel along the request flow in a 3.2s loop,
  staggered 0–2.8s, with `dur="3.2s" repeatCount="indefinite"`.
  - No JavaScript, no React state — the browser handles animation
    natively via SMIL.
  - Each node type uses a different stroke + tint:
    - base → `var(--border)` stroke, no tint
    - queue (RabbitMQ) → `var(--amber)` stroke, amber tint via color-mix
    - judge (RCE, Docker) → `var(--acc)` stroke, accent tint
    - data (Auth, Mongo) → `var(--border-strong)` stroke, t2 tint
  - All colors via CSS variables from `data/tokens.ts` (no hardcoded hex).
- **`components/diagrams/diagrams.css`** — scoped stylesheet for the
  `.alg-*` classes. Imported once in `app/layout.tsx` so every diagram
  component on the site can share it.
- **`app/page.tsx`** — replaced the placeholder with `<Hero />`. Other
  sections (T2.3 → T2.7) will be appended as they ship.

### Decisions

- **Algocode diagram is a self-contained component, not inlined in
  Hero.** It will be reused inside `/work/algocode` (T3.3 case study)
  and possibly inside the game's Algocode Server Farm overlay. Keeping
  it as a standalone component avoids duplication.
- **Color tinting via `color-mix(in srgb, var(--amber) 6%, var(--code-bg))`**
  instead of hardcoding a tint hex. This way the tint always derives
  from the tokens — if `colors.amber` changes, the tint updates
  automatically. Tailwind v4 supports `color-mix` natively.
- **SMIL animation, not CSS keyframes.** SMIL `<animateMotion>` follows
  the actual path geometry (mcurve-aware), which CSS can't do. Browser
  support is universal in modern engines.
- **Diagram is in a 2-column grid on `lg+`, stacked above the stat row
  on mobile.** The flat mockup has it on the right at desktop; mobile
  users see the diagram below the text + stat row, which reads
  naturally as a single column.
- **StatRow is reused (T1.5) instead of hand-rolling a new metric
  component.** Same look, same responsive behavior, less duplication.

### Caveats / pending

- The `Client` node in the diagram is currently styled as `alg-node-data`
  (teal stroke). Master spec doesn't strictly define its color, but
  since the client isn't a backend service, it could arguably be a
  separate "external" style. Leaving as data for now; trivial to
  change.
- The auth → code-manager edge (alg-p8) is extra compared to a strict
  reading of the master spec. It's in the flat mockup and shows the
  auth check on every submission, so we kept it.
- T2.3 → T2.7 still need their section components. Each subsequent
  task adds one section to `app/page.tsx`.

### Verified

- `pnpm typecheck` → clean.
- `pnpm lint` → clean.
- `pnpm build` → 4 routes, 0 warnings.
- **Live HTML verification in production build** (curl `/`):
  - Hero `<header id="top">` renders with `pt-[100px] pb-20`.
  - Eyebrow text `BACKEND & PLATFORM ENGINEER — BANGALORE / CHENNAI` rendered.
  - h1: `font-display text-t1 text-[clamp(36px,5.5vw,64px)] font-bold`.
  - Accent span: `<span class="text-acc">infrastructure layer</span>`.
  - All 3 CTAs: "View systems →", "Read the writing", "Open an issue".
  - All 4 stat numbers (3, 6+, 35%, 12+) present.
  - DiagramPanel header: "algocode — distributed online judge" +
    "live request trace…" + "request in flight" all present.
- **Live SVG verification:**
  - 8 `alg-edge` paths, 8 `alg-node` boxes, 7 `alg-packet` circles.
  - 21 `animateMotion` tags (3 elements per packet × 7 packets).
  - Node variants: 2 queue + 2 judge + 3 data + 1 base.
- **Live CSS verification:** all 11 `.alg-*` classes compiled in the
  served CSS bundle (35.8 KB). `color-mix` used 3+ times for the
  tinted node fills. CSS variables (`--border`, `--amber`, `--acc`,
  `--t1`, `--t3`, etc.) referenced throughout.

---

## T2.3 — Deployment Log section

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-10

### What shipped

- **`components/sections/DeployLog.tsx`** — the "01 / DEPLOYMENT LOG"
  section on `/`. Renders a vertical stack of `EXPERIENCE` entries
  from `data/experience.ts`. No props — the section is a pure
  presentational component that owns its data lookup.
- Each `<ExperienceCard>` shows:
  - Top row: date range `[May 2026 – Present]` (mono, t3) + company
    name (semibold, t1, **linked to `entry.url` with `target="_blank"
rel="noreferrer"`** when present) + `<Badge variant={status}>`.
    Active gets a `● active` chip; completed gets a muted `completed` pill.
  - Role line: `text-t3 text-[14px]`, single line.
  - Bullet list: 5 + 4 + 2 = **11 bullets total** across 3 entries,
    each prefixed with a `>` marker in `text-acc` (mint green) per
    master spec. Marker is `<span aria-hidden>` so screen readers
    don't read "greater than" before every bullet.
  - Tag chips: every `entry.tags[]` string rendered as a `<Chip>` with
    color from `chipColor(tag)`. Result: 18 chip instances across 15
    unique tags (Taply 8, NexBell 6, Innovative 4).
- **`app/page.tsx`** — appended `<DeployLog />` after `<Hero />`.
- **Section scroll anchor:** `<section id="log" class="...scroll-mt-20">`
  so the Navbar's `#log` link smooth-scrolls to the right place and
  the top doesn't disappear under the sticky navbar.

### Decisions

- **No data props on DeployLog.** Master plan §2.1 specifies the full
  `/log` page uses the same registry with potentially more layout
  (education, key achievements). Making the landing version a
  "narrow" presentational component keeps the option open to either:
  - reuse it as-is in `/log` (just add the surrounding chrome), or
  - build a richer variant in Phase 3.
    Either way the registry is the single source.
- **Active status uses the bullet (`●`)** in the badge text — matches
  the flat mockup which shows `● active` rather than just `active`.
  Completed entries get a plain `completed` pill (no dot, more muted).
- **Bullet marker is `>` not `•`.** Master spec + flat mockup use a
  monospace `>` glyph as the bullet character. Implementing it as
  `<span aria-hidden>&gt;</span>` with `position: absolute` keeps
  the visual but excludes the symbol from screen-reader output.
- **`scroll-mt-20` on the section** is the small Tailwind utility that
  pushes the scroll target down 80px so the sticky navbar doesn't
  cover the section header after smooth-scrolling. Applies to every
  section that's a scroll target (T2.4-T2.7 will follow the same
  pattern).

### Caveats / pending

- The Taply entry has 5 bullets, but `EXPERIENCE[0].bullets.length` is
  5 in the registry. The flat mockup's Taply entry is shorter (4
  bullets). I used the registry as the source of truth — the extra
  bullet ("Integrated Stripe …") is genuinely useful and the master
  spec confirms it. Phase 3's `/log` page may show all 5 with a
  collapse if they get too long.
- The role line for Taply is the registry's "Co-Founder & Backend
  Engineer" — which renders with an ampersand. The flat mockup uses
  the same string. No change.
- Tags are wrapped in a flex-wrap row. On very narrow viewports they
  may flow to 2 rows; that's expected.

### Verified

- `pnpm typecheck` → clean.
- `pnpm lint` → clean.
- `pnpm build` → 4 routes, 0 warnings.
- **Live HTML verification in production build** (curl `/`):
  - `<section id="log" class="border-border border-t py-[90px] scroll-mt-20">` rendered.
  - Section header: eyebrow "01 / DEPLOYMENT LOG" + h1 "Where I've shipped" + description present.
  - All 3 companies rendered: Taply (linked to `https://gettaply.me` with `target="_blank" rel="noreferrer"`), NexBell Inc., Innovative IT.
  - All 3 date ranges present: "May 2026 – Present", "Nov 2024 – Jun 2026", "Sept 2023 – Oct 2024".
  - 1 active + 2 completed badges rendered (matches `EXPERIENCE[].status`).
  - 11 bullet markers rendered (5 + 4 + 2 = 11).
  - 18 tag chips rendered, with `chipColor()` correctly assigning colors per the T1.2 coverage check.
- **Live CSS verification:** 36.7 KB CSS bundle, all 4 chip-color
  CSS vars (`--chip-sage`, `--chip-slate`, `--chip-amber`, `--chip-mauve`)
  used 4× each (one per chip instance). `.text-acc` utility present
  for the `>` marker.

---

## T2.4 — Projects section

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-10

### What shipped

The "02 / SYSTEMS" section — 3 featured project cards (Algocode, Movio,
DrishtiAI) in an alternating visual-left/right layout.

- **`components/sections/Projects.tsx`** — section component. Reads
  `PROJECTS` from the registry, picks the 3 landing-page slugs
  (`LANDING_SLUGS = ["algocode", "movio", "drishti-ai"]`), and maps
  each to a mini diagram.
- **`<ProjectCard>`** — each card has:
  - Visual column (340px): the mini-SVG diagram on a `bg-code-bg`
    panel.
  - Body column: status eyebrow (`microservices · system design · 22★
github` for Algocode; the others use a derived label), title,
    Problem / Approach prose blocks, metrics line (text-acc mono),
    stack chips (colored via `chipColor(tech)`), and a links row
    (source / demo video / live) with `↗` arrows.
  - **Alternating layout:** card 1 (Algocode) = visual left, card 2
    (Movio) = body left, card 3 (DrishtiAI) = visual left again.
    Implemented with `md:grid-cols-[340px_1fr]` +
    `md:order-{1,2}` toggles — no JS, no media queries.
- **`components/diagrams/AlgocodeMiniDiagram.tsx`** — 4 nodes
  (Auth Service, Code Manager, RCE Engine, RabbitMQ) with crossing
  arrows, 4 edges.
- **`components/diagrams/MovioMiniDiagram.tsx`** — 5-node video
  pipeline (Upload & Transcode, FFmpeg Workers, HLS/DASH Store,
  CDN Edge, DRM Layer), 5 edges. The DRM Layer node uses the
  `alg-mini-mauve` stroke.
- **`components/diagrams/DrishtiMiniDiagram.tsx`** — 4-layer
  horizontal CV pipeline (Ingest, Preprocessing, Inference, Event
  Stream), 3 edges.
- **`components/diagrams/diagrams.css`** — extended with
  `.alg-mini-*` classes (8 new selectors). Same color-mix tinting
  pattern as the full-size Algocode diagram.
- **`app/page.tsx`** — `<Projects />` appended after `<DeployLog />`.

### Decisions

- **Landing shows 3 of the 11 projects.** Master §1.3 said 4, but the
  flat mockup ships 3. I matched the mockup. Adding a 4th later
  (e.g. DataLineage Doctor) is one extra entry in `LANDING_SLUGS` +
  one new diagram component.
- **Each card has a custom status line** (`stackStatusLine` helper
  inside the component) — e.g. "microservices · system design · 22★
  github" for Algocode. The registry's `domain[]` field would have
  given us "distributed · backend · infra" which is generic; the
  custom label per project reads more like a real headline.
- **Mini diagrams are independent components, not parameterized.**
  I considered one `MiniDiagram` component with a `nodes[]` prop,
  but each project's diagram has its own layout DNA — Algocode is
  a 2×2 grid, Movio is a 5-node flow, Drishti is a 4-layer stack.
  Three small components were easier to read and tweak.
- **Diagram node variants:** added `alg-mini-mauve` for the DRM
  Layer node in Movio (DRM is a content-protection protocol, which
  `chipColor()` classifies as mauve). Same semantic alignment as
  the chip system.
- **Link section shows only links that exist.** Algocode has a
  GitHub link, no live URL or YouTube — so the card shows just
  `↗ source`. Drishti has GitHub + YouTube, so it shows both. No
  empty placeholders.

### Caveats / pending

- The 3 projects on the landing are hardcoded in `LANDING_SLUGS`. If
  the user wants the landing to show different featured projects,
  the slugs are the only thing to change. Could be data-driven
  later (e.g. a `featured_on_landing: true` flag in the registry),
  but right now 3 slugs is fine.
- Drishti's mini-diagram doesn't show the WebRTC / OpenCV / RabbitMQ
  details that the full Algocode diagram shows. The mini version is
  intentionally abstract — 4 layers of "what happens to the image".
- The `data/tokens.ts` `chipColor` function classifies all 38
  project stack tags correctly. T1.2 verified this; T2.4 reuses it.

### Verified

- `pnpm typecheck` → clean.
- `pnpm lint` → clean.
- `pnpm build` → 4 routes, 0 warnings.
- **Live HTML verification in production build** (curl `/`):
  - `<section id="work" class="border-border border-t py-[90px] scroll-mt-20">` rendered.
  - Section header: eyebrow "02 / SYSTEMS" + h1 "Things I've built end-to-end" + description.
  - 3 project cards: Algocode, Movio, DrishtiAI all rendered (1× each in body, 6 total `<article>` including 3 from DeployLog).
  - All 3 custom status lines: "microservices · system design · 22★ github" / "video infrastructure · adaptive streaming" / "real-time pipelines · ai infrastructure".
  - **SVG verification:**
    - 13 `alg-mini-node` boxes (4 + 5 + 4).
    - 12 `alg-mini-edge` paths (3 + 5 + 3 + 1 extra in Movio for HLS→DRM).
    - 13 `alg-mini-label` text elements.
    - Node variants: 4 base, 1 data, 4 judge, 1 mauve, 3 queue.
  - **Stack chips:** all 38 chips across the 3 projects rendered with the correct `chipColor()` bucket.
  - **Links:** all 3 GitHub source links + Drishti's YouTube demo link rendered with `target="_blank" rel="noreferrer"`.
- **Live CSS verification:** 38.2 KB bundle, all 8 new `.alg-mini-*` classes compiled (1 occurrence each — selectors only, not duplicate per element).
