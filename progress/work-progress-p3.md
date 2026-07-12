# Phase 3 — Inner pages

**Phase:** 3 — Inner pages
**Phase status:** in-progress
**Date started:** 2026-07-12
**Goal:** Every non-`/` page (`/log`, `/work`, `/work/[slug]`, `/stack`,
`/writing`, `/writing/[slug]`, `/contact`) renders with the shared
InnerLayout shell, reads from the typed data registries, and matches
its master §2 spec end-to-end. Phase 3 ends when a hiring manager can
click through every link in the navbar and read the full record
without seeing a "page not found" anywhere.

Master plan tasks in this phase (T3.1 → T3.7):

1. T3.1 — `/log` (full experience + education + achievements + now)
2. T3.2 — `/work` (filterable project grid)
3. T3.3 — `/work/[slug]` (case-study pages)
4. T3.4 — `/stack` (D3 force graph + detail panel)
5. T3.5 — `/contact` (standalone terminal form + sidebar)
6. T3.6 — Navbar active-state highlighting *(shipped in T1.6)*
7. T3.7 — `/writing` + `/writing/[slug]` (Keystatic + Medium RSS)

---

## T3.1 — `/log` full experience timeline + key achievements + what I'm doing now

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-12

### What shipped

`/log` — the hiring-manager deep-dive. Per master §2.1:

- **`data/experience.ts`** — added two typed exports at the bottom,
  matching the master §6 rule #2 (all content from data registries):
  - `KEY_ACHIEVEMENTS: AchievementItem[]` — 3 cross-role metrics
    (35% / 17% / 1). Each maps to a real bullet in `EXPERIENCE`
    (NexBell 35% + 17%, Taply 1 enterprise customer).
  - `NOW_STATUSES: NowStatusItem[]` — 2-col "What I'm doing now"
    entries for Taply (active) and UnThink (building). `liveUrl`
    is `null` for UnThink until v1 ships (target Aug 2026).
- **`app/log/page.tsx`** — pure Server Component. Reads all four
  data sources from `data/experience.ts`. Uses `InnerLayout` +
  `InnerPageHeader` for the section shell (T1.7).
- **Page composition (top → bottom):**
  1. `<InnerPageHeader>` — eyebrow `01 / DEPLOYMENT LOG` + title
     `The full record` + description `Every role, every result — not
     summarised.`
  2. **`EXPERIENCE`** — vertical timeline with left-border rail
     (`border-l-2 border-border pl-7`). 3 entries with full bullets
     (5 + 4 + 2 = 11 total). Each entry has:
       - accent dot on the rail
       - top row: `[period] · company (linked when url present) ·
         Badge (active|completed)`
       - role line in `text-t3`
       - full bullets with the `>` marker (`<span aria-hidden>`)
       - tag chips via `<Chip color={chipColor(tag)}>`
  3. **`EDUCATION & TRAINING`** — 2-col grid (`md:grid-cols-2`). 2
     cards (SRM Institute of Technology — MCA, Poridhi — Backend
     Engineering specialization). The Poridhi card renders its
     `covered[]` topics as `<Chip>` components via `chipColor()`.
  4. **`KEY ACHIEVEMENTS ACROSS ALL ROLES`** — 3-col grid
     (`md:grid-cols-3`). Each card: `bg-surface border-border
     rounded-[10px] p-7`, big `text-amber font-mono text-[44px]
     font-bold` number, label below in `text-t1 text-[15px]
     font-semibold`, optional context in `text-t3 text-[12.5px]`.
  5. **`WHAT I'M DOING NOW`** — 2-col grid. Each card shows project
     name (display font), `<Badge>` (`active` or `building`),
     2-sentence status text, CTA link:
       - Taply (active): `view live ↗` →
         `https://gettaply.me/p/mehboob` (external,
         `target="_blank" rel="noreferrer"`)
       - UnThink (building): `view case study →` → `/work/unthink`
         (internal, no `target="_blank"` because T3.2 hasn't shipped
         yet but the link is correctly internal anyway).
- **`metadata`** — `pageMetadata("Log", …)` from `lib/metadata.ts`.
  Title resolves to `Log — Mahboob Alam` via the root template.
  OG + Twitter populated.

### Decisions

- **Four file-local subcomponents instead of a `components/log/` folder.**
  Each of `Timeline`, `EducationGrid`, `AchievementGrid`, `NowGrid`,
  `SectionSeparator` is defined at the bottom of `app/log/page.tsx`.
  They're not reused outside this page today. If a future `/work` or
  `/writing` page needs the same shell, lift them into `components/`.
- **`SectionSeparator` is its own component** (not inline JSX). Reusable
  on any future inner page that needs multiple mini-sections stacked
  under one section header. Uses accent dot + uppercase mono label
  matching the existing section-header rhythm.
- **`first-of-type:mt-0` on `SectionSeparator`** — the first separator
  (EXPERIENCE) sits flush under the `InnerPageHeader`. Subsequent
  separators get `mt-16` so the page breathes between sections.
- **Timeline rail dot** is positioned via `absolute -left-[35px]` (and
  `-left-[41px]` on md+). The rail is `border-l-2`, pl-7 (md:pl-9),
  so the dot sits visually on the line. The `bg-acc` color is the
  existing accent token — dot is a `<span>` with `border-2 border-bg`
  so it "punches through" the rail visually.
- **`NowStatusItem.liveUrl` is explicitly nullable in the type**, even
  though every consumer (the page) derives a fallback to `/work/[slug]`.
  The null literal in the registry makes the data shape honest
  ("UnThink has no live URL yet") rather than the page playing "guess
  if there's a real link".
- **`view live ↗` vs `view case study →`** — the arrow character differs
  by intent. External links use `↗` (opening in a new tab); internal
  links use `→` (same-tab navigation). Matches the convention
  already established on the Projects and Blog sections.
- **Full bullets on `/log`, even for Taply (5).** The landing's
  DeployLog already shows all 5 Taply bullets — adding `/log` with
  truncated bullets wouldn't add value. The page matches "Each entry
  expands to show full bullets, not truncated" by virtue of being a
  dedicated deep-dive. The landing is for skim-readers; `/log` is
  for the long-form reader.
- **`text-[16px]` on company names** vs the landing's `text-[15px]`.
  Inner page is denser in layout, so company names get a hair more
  weight to stay scannable. Same `text-t1 font-body font-semibold`
  baseline.

### Caveats / pending

- **`/log` is `ƒ (Dynamic)` in the build output**, not `● (Static)`.
  The `Navbar` component (T1.6) reads `headers()` on every request to
  decide `isLanding` vs `isActive`. That opts every page in the layout
  out of static rendering — a known Navbar design from T1.6 to keep
  active-link highlighting server-side with no client JS. Phase 6
  polish could move path detection to `middleware.ts` and make this
  page `●`, but the current behavior is intentional and matches the
  spec.
- **`/work/unthink` will 404 until T3.3 ships.** The "view case study"
  CTA points at it. Acceptable for T3.1 (the page itself is complete
  — the link is correct, the target just isn't built yet).
- **`x-invoke-path` header isn't always present** in production builds,
  per T1.6's verified section. The Navbar falls back to `next-url`
  → `referer` → `/`. A real browser navigation will provide a `Referer`
  header and the navbar's active-state highlighting will resolve
  correctly. Tested with `curl -H "Referer: http://localhost:3000/log"`
  → experience link correctly renders with `text-t1 font-semibold`
  + `href="/log"`.
- **`KEY_ACHIEVEMENTS.context` says "Taply's first paying enterprise
  customer"**, not "Taply's enterprise customer closed". Both are
  unambiguous from the Taply bullet; the wider phrasing reads more
  naturally than the truncated "closed" form.
- **No `'use client'` directive** on the page or any of the
  subcomponents. Phase 3 inner pages stay Server Component by
  default unless they need client state (e.g. the `/work` filter
  chips in T3.2).

### Verified

- `pnpm typecheck` → clean.
- `pnpm lint` → clean (caught one unused `NowStatusKind` import on
  the first pass, removed; clean on re-run).
- `pnpm build` → 5 routes (`/`, `/_not-found`, `/api/mode`, `/log`,
  framework routes). `/` and `/log` render as `ƒ` (Dynamic) due to
  Navbar's `headers()` use (T1.6 design).
- **Live HTML verification in production build** (`/log`):
  - Header rendered: `<01 / DEPLOYMENT LOG>` eyebrow, `The full
    record` title (display font), `Every role, every result — not
    summarised.` description.
  - BackLink: `aria-label="Back — home"` rendered.
  - 4 section separators: EXPERIENCE, EDUCATION & TRAINING,
    KEY ACHIEVEMENTS, WHAT I'M DOING NOW.
  - 3 experience entries: Taply (5 bullets), NexBell Inc. (4 bullets),
    Innovative IT (2 bullets). 11 bullets total, each with the `>`
    marker in `text-acc`.
  - 1 active + 2 completed badges (matches the per-entry status).
  - 18 tag chips across the experience entries, each colored via
    `chipColor()` (CSS vars `--chip-sage-bg`, `--chip-slate-bg`,
    `--chip-amber-bg`, `--chip-mauve-bg` appear in inline styles
    66 + 68 + 52 + 54 times in the bundle — every chip instance).
  - Education: 2 cards. SRM shows institution + degree + period +
    location. Poridhi shows the same + a 6-chip row covering
    Docker internals, Kubernetes, Linux networking, eBPF,
    Kafka internals, Observability stack (Prometheus, Grafana,
    Jaeger, OpenTelemetry). All chips resolve via `chipColor()`.
  - Key achievements: 3 amber metric cards with `>35%<`, `>17%<`,
    `>1<` mono numbers rendered.
  - "What I'm doing now": 2 cards. Taply (active, links to
    `https://gettaply.me/p/mehboob` with `target="_blank"
    rel="noreferrer"`). UnThink (building, links to `/work/unthink`).
  - Navbar active state: when `Referer` is set, the experience link
    renders as `<a class="text-[14px] transition-colors text-t1
    font-semibold" data-eyebrow="01" href="/log">experience</a>`
    — T3.6 (active-state) is already shipped via T1.6's Navbar.
- **Live CSS verification** (45.5 KB bundle):
  - All token classes present: `text-amber`, `bg-surface`,
    `border-border`, `text-t1`, `text-t2`, `text-t3`, `text-acc`,
    `bg-acc`, `font-display`, `border-l-2`.
  - All hex values in the bundle map to tokens (`#172318` = bg,
    `#d8eee2` = t1, `#5cc9a0` = acc, `#f59e0b` = amber, etc.).
    The single non-token hex `#f5a623` is the Medium-brand amber
    from `Blog.tsx` (T2.6 caveat, untouched here).

---

## T3.2 — `/work` tiered project grid + domain filter chips

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-12

### What shipped

`/work` — the canonical "all projects, filterable" inner page per master §2.2.

- **`data/projects.ts`** — two additive `domain[]` extensions (no value changes):
  - `load-balancer.domain`: added `'backend'` → `['infra', 'platform', 'backend']`.
    Now surfaces in the Backend filter.
  - `datalineage-doctor.domain`: added `'observability'` →
    `['ai', 'platform', 'backend', 'observability']`. Now surfaces under
    "AI / ML" via the `'ai' OR 'observability'` predicate.
  - `ProjectDomain` union extended with `'observability'` to support the
    new tag without losing strict typing.
- **`app/globals.css`** — added `--color-tier-founder: color-mix(in srgb,
  var(--amber) 4%, var(--card))` to the `@theme inline` block. Surfaces
  as the `.bg-tier-founder` Tailwind utility for elevated founder cards.
- **`components/diagrams/TaplyDiagram.tsx`** — 7-node SaaS funnel
  (Browser/NFC → Nginx → Django + DRF → Redis, PostgreSQL, Stripe
  sidecars; vCard + Leads outbound). Reuses `.alg-mini-*` styles from
  diagrams.css. Pure SVG, no JS.
- **`components/diagrams/UnthinkDiagram.tsx`** — 8-node dual-backend
  pattern (Extension → Django :8000 → Redis broker → Celery × 3 → FastAPI
  :8001 → Gemini Flash; Dashboard SSE stream; PostgreSQL). Reuses
  `.alg-mini-*` styles. Pure SVG, no JS.
- **`components/work/ProjectCard.tsx`** — single component with three
  variants:
  - `founder` — full-width 2-col card (text left, diagram right). Golden
    visual treatment via `bg-tier-founder` + `border-amber/40`. Includes
    status badge + "founder" eyebrow, name (display 28px), tagline
    (mono), full problem text, 4-up metric row (mono amber numbers),
    7 stack chips, links row. Taply and UnThink cards only.
  - `featured` — 2-col card with diagram thumbnail on top + body below.
    Used in the featured tier grid.
  - `showcase` — 3-col compact card (name + tagline + 3 stack chips +
    GitHub CTA). No metrics, no problem text.
- **`components/work/ProjectFilter.tsx`** — `'use client'` chip row. 7
  chips with a count badge per chip. Active chip is `bg-acc text-bg`,
  inactive is `text-t3 border-border`. `aria-pressed` / `aria-checked`
  for a11y. Stateless — receives `value`, `onChange`, `counts` from parent.
- **`components/work/WorkShell.tsx`** — `'use client'` island that owns
  `useState<FilterId>` ("all" by default). Resolves the active predicate
  from a local `FILTER_MATCHERS` lookup table (functions can't cross the
  RSC boundary — see Decisions). Computes per-tier visible projects,
  renders the filter bar + 3 tier sections. Tier sections auto-hide when
  their entries list is empty. Founder tier uses amber dot + space-y-5;
  featured tier uses 2-col grid; showcase uses 3-col grid.
- **`app/work/page.tsx`** — Server Component. Composes `InnerLayout` +
  `WorkShell`. `metadata = pageMetadata("Work", …)`. `FILTERS` array
  (ids + labels only) is the page-level taxonomy declaration.

### Decisions

- **Functions can't cross the RSC boundary** — initial attempt passed a
  `FilterSpec[]` with `match: (p) => boolean` predicates from the Server
  Component `app/work/page.tsx` to the client `WorkShell.tsx`. Build
  failed: *"Functions cannot be passed directly to Client Components
  unless you explicitly expose it by marking it with 'use server'"*.
  Restructured: the page passes `Array<{ id: FilterId; label: string }>`
  (serializable shape), and the client component owns the
  `FILTER_MATCHERS: Record<FilterId, (p) => boolean>` lookup. Clean
  separation, no `use server` directives needed.
- **`founder` filter uses `tier === "founder" || domain.includes("saas")`** —
  the `tier` check guarantees Taply + UnThink always appear under
  Founder regardless of their `domain` content. The OR with `saas` is a
  forward-compatible safety net for future SaaS products that aren't
  tagged as founder.
- **`ai` filter matches `domain.includes("ai") OR domain.includes("observability")`**
  — DataLineage Doctor is now correctly classified as an AI/ML project
  alongside UnThink and DrishtiAI. The `'observability'` keyword is
  honest (it IS an observability-RCA tool for data pipelines) and
  natural for someone scanning `/stack` to find.
- **`backend` filter is intentionally broad** (10 of 11 projects match
  after the `load-balancer` extension). Master's "Backend" bucket reads
  as "the rest of backend-y work", which is what the predicate does.
- **Counter badges on chips show concrete card counts** — e.g. clicking
  `Backend (10)` reveals 10 cards across the 3 tiers (not 1 tier with
  10 cards). Honest counts help users decide whether a filter is worth
  clicking.
- **Founder visual treatment**: `bg-tier-founder` (4% amber + 96% card
  via `color-mix`) + `border-amber/40`. Tier header dot is amber instead
  of accent for founder tier only. Featured + showcase tiers keep the
  existing accent-dot rhythm. Visually separates "what I'm shipping
  right now" from "what I shipped in the past" without competing with
  the project's own accent-green brand color.
- **Founder cards use a 4-up metric row** — first word of each metric
  becomes the big amber mono number (e.g. "35%" / "<100ms" / "1" /
  "22★"), remainder becomes the label. Reads like a press-release
  byline.
- **`ProjectCard` lives in `components/work/`** — both `/work` (this
  task) and `/work/[slug]` (T3.3) will use it. Forward-compatible.
- **Diagrams stay static** — no SMIL animation in the founder
  mini-diagrams. T3.3 case-study pages will elaborate these into full
  architecture diagrams (with animations where it adds clarity).
- **No URL-state for filters** — filter resets on reload. Acceptable
  for v1; Phase 6 polish can hook `useSearchParams` if link-sharing
  becomes important.

### Caveats / pending

- **`/work/unthink` still 404s** from the `/log` "What I'm doing now"
  CTA. T3.3 (`/work/[slug]`) will resolve it. The CTA itself is correct.
- **Card link colors** — the founder card links row (`↗ live`, `↗ demo`,
  `↗ source`) is rendered as plain `<span>`s rather than `<a>` tags to
  keep the whole card a single clickable target. Phase 6 polish can split
  these into proper links (which would require either nested `<a>`s or
  rewiring the card click target — trade-off worth resolving then).
- **`Load Balancer Lab` tier membership** — it's in the showcase tier
  (master §2.2 spec), so on `/work` it appears in the 3-col grid. The
  new `'backend'` domain doesn't change its tier; it just helps it
  surface in the Backend filter.
- **`TaplyDiagram` and `UnthinkDiagram` are not animated.** Future
  polish (Phase 6) can add packet animations if they're reused inside
  the game mode or if `/work/[slug]` benefits from motion.
- **No `useEffect` mount of any D3/phaser code** — the page is a pure
  Server Component shell around a single `'use client'` island. No
  bundle bloat.
- **Git author identity** — per the user's instruction at the start of
  this session, all subsequent commits use `connect.mahboobalam@gmail.com`
  via per-commit `GIT_AUTHOR_*` env vars. This commit is the first one
  under that identity.

### Verified

- `pnpm typecheck` → clean.
- `pnpm lint` → clean (caught and fixed one `react-hooks/exhaustive-deps`
  warning on the first pass — `activeMatch` was a derived value outside
  the useMemo; moved inside).
- `pnpm build` → 5 routes (`/`, `/_not-found`, `/api/mode`, `/log`,
  `/work`), 0 warnings. Initial build failed with a function-serialization
  error; restructured filter predicates to live in the client component,
  re-ran → green.
- **Live HTML verification** (curl `/work` with `Referer`):
  - `<InnerPageHeader>` rendered: eyebrow `02 / SYSTEMS`, title
    `Everything I've built end-to-end`, description copy present.
  - Filter bar: 7 chips in a horizontal row. Each shows label + count:
    `All 11`, `Founder 2`, `Distributed 4`, `Video 2`, `AI / ML 3`,
    `Infra / Platform 6`, `Backend 10`.
  - Tier sections: FOUNDER PROJECTS, FEATURED BUILDS, SHOWCASE all
    rendered with their descriptions ("what I'm shipping right now",
    "the headline systems", "everyday backend work").
  - 11 `<article>` cards total (2 founder + 4 featured + 5 showcase).
  - Founder cards: `bg-tier-founder` class (2 instances), `border-amber/40`
    (2 instances), amber dot (1 instance in the tier header), "founder"
    label rendered on each card.
  - Mini architecture diagrams: 2 SVGs in the HTML (Taply + UnThink),
    15 total `.alg-mini-node` rects (7 from Taply + 8 from UnThink).
    Taply labels (Browser/NFC, Nginx, Django + DRF, Redis, PostgreSQL,
    Stripe, vCard + Leads) all present. UnThink labels (Extension,
    Dashboard, Django :8000, Redis broker, Celery × 3, FastAPI :8001,
    Gemini Flash, PostgreSQL) all present.
  - All 11 project links present: `/work/taply`, `/work/unthink`,
    `/work/algocode`, `/work/movio`, `/work/datalineage-doctor`,
    `/work/drishti-ai`, `/work/cutetube`, `/work/airpass`,
    `/work/pulumi-infra`, `/work/imgtwist`, `/work/load-balancer`.
- **Filter interaction smoke** (manual verification of predicate logic):
  - `Founder` filter → Taply + UnThink visible (2 founder cards).
    Featured + showcase sections hide (0 matching projects in those tiers).
  - `AI / ML` filter → UnThink (founder tier) + DataLineage Doctor +
    DrishtiAI (featured tier) visible. 3 cards across 2 tier sections;
    Taply's founder section hides (Taply isn't `ai`/`observability`).
  - `Backend` filter → 10 cards across 3 tiers. Showcase tier shows 5;
    featured tier shows 4; founder tier shows Taply.
- **CSS verification** (48.4 KB bundle):
  - All token classes present including the new `bg-tier-founder`,
    `border-amber`, `bg-amber`, `line-clamp-2`.
  - All hex values in the bundle are token values (`#172318`, `#5cc9a0`,
    `#f59e0b`, etc.). `#f5a623` is the Medium-brand exception from
    `Blog.tsx` (T2.6 caveat, untouched here).
  - The new `--color-tier-founder` resolves through existing
    `--amber` + `--card` via `color-mix` — no hex leaked into JS.
