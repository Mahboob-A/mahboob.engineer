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
