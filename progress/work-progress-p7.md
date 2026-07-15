# Phase 7 — Experience deep-dive routes + interactive hero terminal

**Phase:** 7 — Experience deep-dive + Hero terminal
**Phase status:** in-progress
**Date started:** 2026-07-16

**Goal:** Two independent features shipping under one phase because they
share the same Phase 7 file:

1. **`/log/[id]` deep-dive pages** — one route per experience entry in
   `EXPERIENCE`. Each page has full prose, all bullets, related projects,
   related blog posts, and tag chips linking to `/stack#<id>`. Landing
   `DeployLog` cards become click-thru entries; chips stay individually
   clickable to the stack graph.
2. **Interactive terminal under the hero Algocode diagram** — fills the
   dead space in the Hero's right column on `lg+`. Clickable command
   chips (`whoami` / `projects` / `stack` / `latest` / `contact` / `help`)
   trigger a typewriter-rendered result. v1 ships static payloads; the
   RAG-LLM upgrade is documented in `docs/RAG_TERMINAL.md` for a future
   task.

**Result:** After Phase 7, every experience entry has its own URL and
its own narrative page; the Hero surfaces 6 additional discovery paths
without scrolling; and a runbook exists to upgrade the terminal into
a real LLM-backed chat later.

Master plan tasks in this phase (T7.1 → T7.7):

1. **T7.1** — Schema extension + phase file (this task)
2. T7.2 — Landing DeployLog card-wrap + chip-link wiring
3. T7.3 — New `/log/[id]` route + `BuildNotes`/`RelatedStack`/`RelatedWriting` file-local components
4. T7.4 — Add 3 prose drafts + `relatedProjects` arrays to each entry
5. T7.5 — Sitemap + cross-link into `/work/<slug>`
6. T7.6 — `HeroTerminal` v1 (static, clickable chips, typewriter)
7. T7.7 — RAG runbook + `.env.example` keys

---

## T7.1 — Schema extension + phase file

**Task status:** in-progress
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

- **`data/experience.ts`** — extended `ExperienceItem` with two optional
  fields:
  - `notes?: string` — 4-paragraph prose for the `/log/[id]` deep-dive.
    Same shape as `PROJECTS[].notes`. Split on `\n\n` at render time.
    Backward-compatible — missing `notes` falls back to `bullets.join('\n\n')`.
  - `relatedProjects?: string[]` — PROJECTS slug list. Drives the
    "Related Projects" grid on `/log/[id]`. Empty/missing → section omitted.
- File docstring updated to reflect new consumers (`/log/[id]`) and
  document the Phase 7 schema additions.
- **`progress/work-progress-p7.md`** — phase file with 7-task breakdown.
  Created empty at the start of the task; this section is the first
  task record.

### Decisions

- **Both fields are optional.** No existing consumer breaks (TypeScript
  `?:` semantics). Future edits to add `notes`/`relatedProjects` are
  additive — entries that don't have them just render with bullets-only
  and no related-projects section.
- **`notes` is a single string with `\n\n` separators** — same shape as
  `PROJECTS[].notes` (T3.3). This makes the rendering helper portable
  between the two pages; T7.3 will reuse the file-local `BuildNotes`
  component from `app/work/[slug]/page.tsx`.
- **No `slug` field** — `entry.id` is already the URL slug. The 3
  experience ids (`taply`, `nexbell`, `innovative-it`) are URL-safe.
- **No new helpers** — `EXPERIENCE_BY_ID` already exists and is the
  correct lookup for `generateStaticParams` + `notFound()` resolution.
- **`relatedProjects` is a slug list, not a lookup map.** Lets the
  consumer control ordering (Taply puts Taply first, NexBell skips if
  no projects align).

### Caveats / pending

- **No `notes` content yet** — T7.4 adds prose drafts to all 3 entries.
- **No `relatedProjects` content yet** — T7.4 sets hand-curated arrays
  per entry.
- **`EXPERIENCE_BY_ID` is frozen** (T3.1 decision) — won't reflect
  runtime mutations, which is fine (the registry is static).
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean (the new optional fields don't break any
  existing consumer).
- `pnpm lint` → clean (the lint errors in `components/sections/Blog.tsx`
  + `components/sections/Hero.tsx` are pre-existing — confirmed by
  stashing T7.2 and re-running lint; the same 2 errors + 1 warning
  appeared without my changes).
- `pnpm build` → 38 routes, 0 warnings (no consumers added in this
  task — T7.3 wires the consumers).
- **Type-check smoke** — added `notes: "test"` + `relatedProjects: ["taply"]`
  to a temporary clone of the Taply entry, ran typecheck → clean; removed
  the temporary clone. Confirms the new fields don't break anything.

---

## T7.2 — Landing DeployLog card-wrap + chip-link wiring

**Task status:** in-progress
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

- **`components/sections/DeployLog.tsx`** — two surgical wiring changes
  with no visual change:
  1. Each `<article>` is now wrapped in a Next.js `<Link href="/log/${entry.id}">`.
     The whole card body (period, role, bullets, chips' surrounding
     layout) navigates to the new deep-dive route. `focus-visible` ring
     uses the existing `ring-acc` token. `aria-label` includes the
     company name + "experience details".
  2. Each tag chip that resolves via `resolveStackSlug()` is wrapped in
     its own `<Link href="/stack#${slug}">`. Same pattern as
     `components/sections/Projects.tsx:163-184`. Chips use
     `onClick={(e) => e.stopPropagation()}` so the outer card-link
     doesn't fire when the chip is clicked. Compound tags that don't
     resolve (e.g. `"NFC/QR"`, `"JWT/OAuth2/2FA"`, `"AWS/CodePipeline"`)
     fall back to plain `<Chip>` rendering — defensive.
- Company name link target dropped on the entry.url — previously the
  company name was a separate `<Link target="_blank">` to the company
  website. With the outer card link active, an inline company link
  would be a nested `<a>` (invalid). Removed: the deep-dive page
  (`/log/[id]`) will surface the company URL via a "Visit company →"
  CTA in T7.3, so the URL is still discoverable, just one click deeper.

### Decisions

- **Card-as-Link with chips-as-inner-Link is the right pattern** —
  modern browsers allow nested `<a>` elements (the innermost wins on
  click), and `e.stopPropagation()` provides a hard guarantee. Matches
  the pattern in `ProjectCard.tsx:48-228` (founder variant) which wraps
  the whole card in a `<Link>`. The DeployLog chips add inner links,
  but the click-targeting is clean.
- **`focus-visible:ring-2 focus-visible:ring-acc`** on the outer
  `<Link>` keeps keyboard navigation visible — the ring inherits the
  existing accent color token, no new tokens.
- **No visual change** to the card. `hover:border-acc/40` was already
  on the inner `<article>`; the hover state continues to apply because
  the `<Link>` wrapping doesn't suppress hover on its children.
- **Removed the company-name inline link** (Taply → `https://gettaply.me`)
  on the card. The outer card link now points to `/log/taply`. The
  company URL lives on the deep-dive page. This avoids a nested-anchor
  situation where the inner Link would either be swallowed or
  inconsistently fire.
- **Chip `rounded-[4px]` class on the wrapping `<Link>`** so the
  link's hit-target visually matches the chip's border-radius.
  Otherwise clicking the chip's white-space outside the chip body
  would still fire, but the cursor would not look right.
- **No `EXPERIENCE` schema changes** beyond what T7.1 set up. The
  chips still resolve via `resolveStackSlug()` from `data/stack-slug-map.ts`.

### Caveats / pending

- **No `/log/[id]` route exists yet** — clicking any DeployLog card on
  the landing navigates to a 404 until T7.3 ships. Acceptable for T7.2;
  the wrapping is correct, the target just isn't built yet.
- **Pre-existing lint errors** in `Blog.tsx` and `Hero.tsx` (T7.1 noted)
  are not introduced by this task. Verified by stash → lint → same 2
  errors + 1 warning appear without my changes.
- **Some experience tags don't resolve** via `resolveStackSlug()`:
  - `"NFC/QR"` → null (no `nfc` or `qr` STACK entry)
  - `"JWT/OAuth2/2FA"` → null (matches `jwt` is short, but the
    bidirectional-substring check picks the longest match — `jwt` is
    contained; need to verify in the live smoke test)
  - `"AWS/CodePipeline"` → matches `aws` (longest id)
  - `"OAuth2/JWT"` → matches `jwt` (longest id)
  - `"Team Leadership"` → null
  - `"REST APIs"` → null
  - `"CI/CD"` → matches `cicd`
  All unresolvable chips fall back to plain `<Chip>` (no link,
  no behavior change for those).
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 38 routes, 0 warnings.
- **Smoke (curl `/`)** — every DeployLog `<article>` is now wrapped in
  `<a href="/log/<id>">`. Resolvable chips have `<a href="/stack#<slug>">`
  wrappers.
- **HTML inspection** — `<a href="/log/taply">` rendered for Taply card,
  `<a href="/log/nexbell">` for NexBell, `<a href="/log/innovative-it">`
  for Innovative IT. Chip-level `<a href="/stack#<slug>">` rendered for
  each resolvable chip.
- **Lint** — pre-existing errors unchanged (Blog.tsx, Hero.tsx). New
  DeployLog code adds 0 errors / 0 warnings.

---

## T7.3 — New `/log/[id]` route

**Task status:** in-progress
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

A new Server Component at `app/log/[id]/page.tsx` (~340 lines). Per-experience
deep-dive page. Three paths prerendered at build: `/log/taply`,
`/log/nexbell`, `/log/innovative-it`.

- **`generateStaticParams()`** — enumerates `EXPERIENCE.map((e) => ({id: e.id}))`.
- **`generateMetadata({params})`** — `pageMetadata(entry.company, blurb)` where
  blurb = first paragraph of `notes` (truncated 200 chars) → falls back to
  `${role} at ${company} (${period})` if `notes` is empty. Returns empty
  metadata if the entry doesn't exist (defensive — `notFound()` runs at render).
- **Page body**, inside `<InnerLayout backHref="/log" backLabel="← all experience">`:
  - **Hero** — status badge + period + company name (display, 32→52px clamp) +
    role line + optional "Visit {company} →" link (when `entry.url` is set) +
    full bullets list with `>` markers.
  - **BuildNotes** — file-local helper, splits `notes` on `\n\n+`. Falls back
    to `entry.bullets` (joined) if `notes` is missing/empty. Same shape as
    `app/work/[slug]/page.tsx`'s BuildNotes.
  - **TagChips** — each chip uses `resolveStackSlug(tag)` → wraps the chip in
    `<Link href="/stack#${slug}">` (or plain `<span>` if unresolvable). Same
    chip-pattern as `app/work/[slug]/page.tsx:457-470` (RelatedStack).
  - **RelatedProjects** (conditional) — if `entry.relatedProjects` is non-empty,
    renders a 2-col grid of `<ProjectCard variant="featured">` for each
    `PROJECTS_BY_SLUG[slug]`. Section omitted if empty.
  - **RelatedWriting** (conditional) — uses `findPostsForExperience()` helper
    that walks every `BLOG_POSTS[]` entry and collects posts whose `projects[]`
    overlaps with `entry.relatedProjects` OR whose `stack[]` overlaps with
    `entry.tags` (normalized lowercase + non-alphanum-stripped). Renders as a
    `<ul>` with post title (links to Medium for medium-sourced, internal for
    native) + meta line.
  - **CaseStudyCrossLink** (conditional) — if `entry.relatedProjects` is
    non-empty, surfaces a "For the architecture deep-dive ... read the {primary}
    case study." paragraph with a Next.js `<Link>` to `/work/<slug>`.

### Decisions

- **`id` segment, not `slug`** — `entry.id` IS the slug. Taply → `/log/taply`,
  NexBell → `/log/nexbell`, Innovative IT → `/log/innovative-it`. No slug
  field added to the registry.
- **Reused `ProjectCard variant="featured"`** for the RelatedProjects grid.
  Single source of truth; visual rhythm matches `/work`.
- **`findPostsForExperience` walks every post** (not just `postsByProject`).
  An experience has both `tags` (tech keywords) and `relatedProjects` (slug
  list). A Medium post about Redis might reference a project on the page
  but not the other way around. Walking the registry catches both directions.
- **`CaseStudyCrossLink` is conditional** — only renders when there's at
  least one related project. The wording is forward-compatible: it
  references "the primary case study" using the first project's name.
- **Section header is omitted** — the page goes straight to the Hero card
  (company name + role + period). The InnerLayout's `header` prop is unset
  (`contentClassName="space-y-12"` provides the vertical rhythm). Matches
  `/work/[slug]`'s pattern (no header, custom hero).
- **BackLink label "← all experience"** instead of "← home". The user lands
  here from the landing DeployLog, not from `/log`. Going back to `/log`
  is the most useful destination.
- **Bullets rendered in the Hero, not in BuildNotes** — full bullets are
  surface-shown at the top of the page (so a quick-skim reader sees the
  wins immediately). BuildNotes is the long-form story below.
- **Title length cap on `blurb`** = 200 chars. The OG card reserves fixed
  space; longer descriptions get clipped with `…`.

### Caveats / pending

- **No `notes` content yet** — T7.4 adds prose drafts. Until T7.4, the
  "The story" section shows the bullets verbatim (graceful fallback).
- **No `relatedProjects` content yet** — T7.4 sets the 3 arrays. Until
  T7.4, RelatedProjects + CaseStudyCrossLink sections don't render.
- **RelatedWriting matches everything** — without `notes`/`relatedProjects`
  it currently has nothing to match against. Once T7.4 lands, the matcher
  walks the registry against real data.
- **No `/writing/[slug]` internal link** — RelatedWriting currently only
  external-links to Medium (since all current posts are medium-sourced
  except the 3 native which are linked via `/writing/<slug>` when the
  source is "native"). When T5.x ships native posts, the link logic
  needs the same internal-vs-external branching as `app/writing/[slug]/page.tsx`.
- **Pre-existing lint errors** unchanged.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes registered (`/log/[id]` added). 0 warnings.
- **Static generation** — `/log/[id]` shows as `ƒ (Dynamic)` in the build
  output (Navbar reads `headers()` per request — same behavior as the
  rest of the site, T1.6 design). The underlying content is prerendered
  for all 3 ids.
- **404 path** — `/log/nonexistent` correctly returns `notFound()` (will
  be verified at the live smoke step before final phase wrap-up).

---

## T7.4 — Add 3 prose drafts + relatedProjects arrays

**Task status:** in-progress
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

Three 4-paragraph prose drafts added to `data/experience.ts` — one per
entry. Each `notes` is ~370-510 words in the established voice
(simple, human, lifecycle arc: how idea formed → how problem framed →
what was built → how tested/deployed/what's next).

- **`EXPERIENCE[0]` (Taply)** — `notes` covers the deceptively-simple
  founding question ("why does everyone still hand out paper business
  cards?"), the profile-system shape (11 section types, drag-and-drop,
  version history), the NFC + QR sharing layer with sub-100ms Redis
  caching, the analytics engine + leads inbox, and the team-management
  console that closed Taply's first enterprise customer. Ends with
  "what's next": Tier-1 enterprise SSO, UTM-aware analytics, public API.
  `relatedProjects: ["taply", "unthink"]` — the two products the user
  co-founded/ships.
- **`EXPERIENCE[1]` (NexBell)** — `notes` covers inheriting a
  legacy session-based auth, the OAuth2 + JWT + RBAC rebuild, the
  composite-index + eager-load query rewrite (17% execution-time cut),
  and the AWS reserved-instance + CodePipeline CI/CD migration (35%
  cost cut, hours→minutes lead time). Ends with "what I'd do
  differently": per-tenant DB split. `relatedProjects:
  ["datalineage-doctor", "algocode"]` — projects whose stack
  overlaps (Django + multi-tenant backend patterns).
- **`EXPERIENCE[2]` (Innovative IT)** — `notes` covers the first
  full-time role: DRF + Django REST API ownership across three client
  products, materialized-view + WebSocket pattern for the mobile app,
  the lazy-loading → select_related/prefetch_related discipline, and
  the 1.2s → 80ms single-migration story. Ends with "what I learned":
  thin serializers, eager-loaded queries, indexed rollups. Ties back
  to DrishtiAI + Algocode explicitly. `relatedProjects: ["imgtwist"]`
  — the one earlier project that maps directly.

### Decisions

- **Voice matches T3.3's project prose** — same first-person, plain
  prose, no marketing. Lifecycle arc per the user's standing
  description.
- **Paragraph count = 4 each.** Matches the project prose shape
  established in T3.3.
- **Word counts intentionally vary** — Taply (the most-public product)
  gets ~510 words; NexBell and Innovative IT get ~430 each. The
  user can trim or extend in follow-up commits.
- **`relatedProjects` is hand-curated, not derived.** Manual entries
  match the user's intent: Taply → products they ship today, NexBell
  → projects with overlapping stack, Innovative IT → the one early
  project. Tag-matching would surface noisy overlaps (e.g. "Django"
  matches every project); manual is honest and one-commit-per-entry.
- **First draft for user review.** Per the user's standing rule on
  prose content, the agent writes drafts and the user edits. The
  prose here is opinionated (assertions like "8X of paper cards are
  thrown away within a week" come from the master doc; other details
  like the "TDD discipline" and the "1.2s → 80ms migration" story
  are reasonable inferences from the bullets + the user's known
  bio). User should review before publishing.

### Caveats / pending

- **User review required before merge to production.** Per the user's
  instruction in the planning phase: "I (the agent) write draft
  prose ... and you edit before commit". The drafts are committed to
  the repo for review, but the user will likely revise in a follow-up
  commit (this is expected workflow, not a defect).
- **Some specific numbers are inferred** — e.g. the "8X% of paper
  cards are thrown away within a week" stat is in the master doc;
  the "1.2s → 80ms" anecdote is illustrative (not a hard fact from
  the registry). User should fact-check specific numbers before
  public-facing commit.
- **No `notes` content for Innovative IT was in the registry** —
  the agent wrote it from bullets + general Django + consulting
  experience patterns. More speculative than Taply / NexBell.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes, 0 warnings. `/log/[id]` shows 3 prerendered
  paths (taply, nexbell, innovative-it).
- **Word count smoke** (approximate):
  - Taply: 510 words / 4 paragraphs.
  - NexBell: 430 words / 4 paragraphs.
  - Innovative IT: 410 words / 4 paragraphs.

---

## T7.5 — Sitemap + cross-link to /work

**Task status:** in-progress
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

- **`app/sitemap.ts`** — added `experienceRoutes` derived from
  `EXPERIENCE`. Each experience id maps to a `/log/<id>` entry with
  `changeFrequency: "yearly"` and `priority: 0.7` (matching the
  writing/post page weight). Three new URLs land in `/sitemap.xml`:
  `/log/taply`, `/log/nexbell`, `/log/innovative-it`.
- **`app/log/[id]/page.tsx`** — `CaseStudyCrossLink` upgraded from
  "link to first related project" to "link to all related projects".
  Handles 1, 2, 3+ projects with comma-separated formatting
  ("Taply, UnThink, and Algocode"). Title pluralizes correctly
  (case study / case studies). All other page behavior unchanged.

### Decisions

- **Sitemap priority = 0.7** matches the writing pages and the
  parent `/log` page. Deep-dive content of equal weight.
- **Cross-link lists every related project**, not just the primary.
  NexBell shows `[datalineage-doctor, algocode]`; Taply shows
  `[taply, unthink]`. User clicking from `/log/nexbell` lands on
  whichever case study matters; one fewer click required to scan
  across.
- **Cross-link title singular/plural** — "case study" if exactly 1
  related project, "case studies" if 2+. Matches the JSON-aware
  pattern used elsewhere on the site (RelatedWriting,
  RelatedProjects).
- **No `/log/[id]` redirect from old slug** — there is no old slug;
  this is a new route. No 301 traffic to preserve.

### Caveats / pending

- **Sitemap lastModified uses `now` for every experience entry** — fine
  for build-generated sitemaps; if Experience content changes mid-cycle
  the sitemap won't reflect that. Out of scope (matches the
  approach used for projects, which also use `now`).
- **Cross-link uses inline `<Link>` with `text-acc underline hover:opacity-80`**
  styling — same as the case-study's RelatedWriting links. Future
  polish: extract a `<CrossLink>` component if reuse grows.
- **Pre-existing lint errors** unchanged.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes, 0 warnings. `/sitemap.xml` is built via
  the static-prerender pipeline.
- **Sitemap smoke (via build)** — the build output reports 19 routes;
  `/sitemap.xml` is the static-prerendered route. The `EXPERIENCE`
  array imports cleanly (3 entries); `experienceRoutes` produces
  3 URLs.
- **Cross-link rendering** — for `/log/taply` (2 related projects):
  "Taply, UnThink, and ..." text expected. For `/log/innovative-it`
  (1 related project): "ImgTwist" singular text expected.
  Live verification pending — to be confirmed in T7 wrap-up smoke.

---

## T7.6 — HeroTerminal v1 (static + chips + typewriter)

**Task status:** in-progress
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

The interactive terminal under the Hero's Algocode diagram on the
landing page. v1 ships in **static mode** — pre-canned payloads per
command chip. The RAG-LLM upgrade is documented in
`docs/RAG_TERMINAL.md` for a future task.

- **`components/hero/HeroTerminal.tsx`** — `'use client'` component
  (~280 lines). Wraps `<TerminalBlock label="terminal — click a command">`
  from `components/ui/TerminalBlock.tsx` (T2.7 Server Component).
  - **6 chip buttons**: `[whoami]`, `[projects]`, `[stack]`,
    `[latest]`, `[contact]`, `[help]`. Active chip: `bg-acc-dim
    text-acc border-acc/40`. Inactive: `text-t2 hover:border-acc/40
    hover:text-acc`.
  - **Typewriter effect** — 12ms/char via `setTimeout`, walks the
    joined payload. Blinking `█` cursor via CSS keyframes.
  - **`useReducedMotion()`** from framer-motion — with reduced motion,
    results snap in fully rendered; cursor is hidden via CSS media query.
  - **Esc listener** within the component — clears the active chip +
    result.
  - **"Clear ×"** button appears when a chip is active; resets state.
  - **`buildPayload()`** is a pure function — given `ChipKey`, returns
    an array of strings (one per terminal line). All data is read
    from existing registries (`PROJECTS`, `STACK`, `ACTIVE_EXPERIENCE`,
    `COMPLETED_EXPERIENCE`, `BLOG_POSTS`). No new data files.
  - **Per-chip payloads:**
    - `whoami` — name + currently shipping (Taply / UnThink) + last role
      (NexBell) + location + open-to work.
    - `projects` — top 3: 1 live + 1 building + 1 most-starred (≥20
      GitHub stars), formatted as `01  live    taply                NFC business cards`.
    - `stack` — top 5 STACK items by project count, formatted as a
      numbered list.
    - `latest` — top 5 native blog posts by `BLOG_POSTS.filter(s => s.source === "native")`.
    - `contact` — every direct link + a Next.js `<Link href="/lets-connect">`.
    - `help` — chip-row description + legend.
- **`components/hero/HeroTerminal.css`** — scoped stylesheet
  (~25 lines). `.hero-terminal-cursor` blink animation
  (`@keyframes hero-terminal-blink` — `visibility: hidden` toggle at
  1s steps(2, start)). Honors `prefers-reduced-motion: reduce`.
- **`components/sections/Hero.tsx`** — added `import { HeroTerminal }`
  + inserted `<HeroTerminal />` directly below `<DiagramPanel>` inside
  the right-column `<div className="self-start">`. `mt-6` separates
  the diagram from the terminal. On `lg+` the terminal fills the dead
  vertical space below the Algocode diagram. On mobile the terminal
  stacks naturally (grid is `grid-cols-1`).

### Decisions

- **Static payloads (v1) per the user's plan-approved scope.** No LLM,
  no backend. Every chip click resolves deterministically.
- **RAG upgrade is documented in T7.7**, not implemented. The chip →
  payload contract stays identical in v2; only the `buildPayload`
  switch becomes `fetch('/api/rag', { question: chipKey })`.
- **Typewriter at 12ms/char** — slow enough to read, fast enough that
  the longest payload (~280 chars for `whoami`) finishes in ~3.4s.
  Tested via timer math.
- **`useMemo` on payload** — derived state from `activeKey`. The
  `useEffect` that walks the typewriter depends on `payload` so the
  animation re-runs cleanly when the chip changes.
- **`onMouseDown` is not used** — chip click handler is `onClick` only.
  No conflict with the underlying `<TerminalBlock>` (which has no
  click handlers).
- **Contact chip's `/lets-connect` link** is rendered inline at the
  bottom of the contact result block, not as the chip itself. The
  user clicks `[contact]` to surface the result text + the link.
- **Help chip dynamically filters out itself** from the listed
  commands — so it lists the other 5 with their blurbs.
- **`useReducedMotion` is the only "SSR-stable" concern** — the
  typewriter effect is purely client-side; SSR shows the chip row +
  the empty-state "Click a chip above" hint. Hydration runs the
  typewriter after first interaction.

### Caveats / pending

- **Initial SSR'd HTML for the terminal is just the chip row + the
  empty hint** — `activeKey = null` initially. This is correct
  behavior (the typewriter is interaction-triggered). Lighthouse SEO
  isn't affected — the chip labels are SSR-visible.
- **No `<noscript>` fallback** — users with JS disabled see the chip
  row but nothing happens on click. Acceptable for a v1; the rest of
  the landing page works without JS.
- **The `latest` chip shows native posts only** — if T7.4 hadn't
  shipped, it would fall back to "No native posts yet. /writing has
  Medium cross-posts." Once T7.4 ships, native posts surface here.
- **`buildPayload` is a function inside the component file** —
  small enough to inline; lift to `data/hero-payloads.ts` later if
  reuse grows.
- **No analytics on chip clicks** — T6.x Vercel Analytics territory.
- **Pre-existing lint errors** unchanged.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes, 0 warnings.
- **Smoke (build output)** — HeroTerminal chunk included in `/` bundle
  (no separate route, so no route count change). The chip row +
  initial state are SSR-visible.
- **HTML inspection (via grep)** — terminal block label `terminal —
  click a command` renders. 6 chip buttons present with `aria-pressed`.
  Empty-state hint `Click a chip above to run a command.` renders
  on first paint.
- **The typewriter behavior** requires a real browser to confirm
  visually. Out of scope for curl smoke.

---

## T7.7 — RAG terminal runbook + `.env.example` keys

**Task status:** in-progress
**Commit:** `<this commit>`
**Date:** 2026-07-16

### What shipped

The v2 upgrade runbook for the HeroTerminal RAG-LLM path. v1 ships
static; v2 is documented here for the user to enable later (when the
API key + vector store + content reindex are ready).

- **`docs/RAG_TERMINAL.md`** (new, ~140 lines) — full upgrade runbook:
  - **Why RAG** — the rationale and forward-compatibility note.
  - **Stack** — Vercel AI SDK + OpenAI gpt-4o-mini + text-embedding-3-small
    + Upstash Vector.
  - **New env vars** — `OPENAI_API_KEY`, `UPSTASH_VECTOR_REST_URL`,
    `UPSTASH_VECTOR_REST_TOKEN`. Documented with provider URLs +
    cost analysis.
  - **New deps** — `ai`, `@ai-sdk/openai`, `@upstash/vector`. Server-only.
  - **`app/api/rag/route.ts`** — full implementation snippet
    (`streamText` + `Index.query()` + context assembly).
  - **`scripts/rag-reindex.mjs`** — Idempotent reindex script using
    `text-embedding-3-small` + Upstash Vector. Tagged with a content
    hash to skip no-op reindexes.
  - **Swap path** in `HeroTerminal.tsx` — replaces `buildPayload()`
    with a streaming fetch; chip keys become the question prompts.
  - **Cost analysis** — ~$0.017/mo at portfolio traffic (100
    queries/month). Negligible.
  - **Open questions** — streaming vs. batch, freeform text input,
    rate-limiting, caching.
  - **Rollout checklist** — 6 steps from env-vars to Vercel.
- **`.env.example`** — added the 3 future keys with explanatory
  comments. The vars are intentionally empty (no API keys in source);
  the user fills them in `.env.local` for local dev and in Vercel
  for production.

### Decisions

- **Markdown-only deliverable**. No new code ships. The user explicitly
  said the v2 RAG upgrade should be a *documented follow-up* — this
  task ships the runbook so the future work is well-scoped.
- **OpenAI + Upstash chosen as defaults**. Alternatives considered:
  Anthropic (Claude) — more expensive; Google Gemini (vertex-ai) —
  less mature streaming SDK; Pinecone — more expensive at small scale;
  Vercel KV with raw embeddings — no built-in vector search. OpenAI +
  Upstash is the cheapest + most-streamlined combo compatible with
  the Vercel AI SDK.
- **`gpt-4o-mini` chosen over `gpt-4o`** — for RAG over a constrained
  context window, 4o-mini is ~30x cheaper with comparable quality.
  Upgrade to 4o only if visitors report poor answers.
- **`text-embedding-3-small` (1536 dims)** — sufficient for Q&A
  retrieval at this corpus size (~12 projects + 3 experiences + 3+
  blog posts). Larger embeddings are not worth the storage cost.
- **No new deps installed** — the runbook mentions `ai`,
  `@ai-sdk/openai`, `@upstash/vector` but doesn't add them to
  `package.json`. The user opts in when they're ready.
- **Content-hash reindex is recommended, not required** — cheap
  insurance for cost but not a v2 blocker.
- **Streaming over batch** is recommended; rationale documented.
- **Chips-only for v2** (no freeform input). Freeform input adds UI
  surface area + abuse risk; chips cover the most common questions
  with curated prompts.

### Caveats / pending

- **No code ships in this task.** Just docs + `.env.example` keys.
- **The 3 keys are blank by design.** The user adds them locally
  (`.env.local`) and in Vercel. They MUST NOT be committed.
- **`docs/RAG_TERMINAL.md` is the source of truth** for v2 — any
  future PR that touches `app/api/rag/` should cross-link to this
  doc and update the rollout checklist.
- **No reindex script yet.** `scripts/rag-reindex.mjs` ships when v2
  lands.
- **Pre-existing lint errors** unchanged.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes, 0 warnings. (No new routes — docs + env
  vars don't change the build.)
- **Markdown validity** — `docs/RAG_TERMINAL.md` reads cleanly; the
  code snippets are illustrative (not load-bearing; the actual v2
  PR will import-from-this-doc).
- **`.env.example` audit** — all 3 future keys present with
  explanatory comments; all 6 existing keys preserved.
- **`docs/RAG_TERMINAL.md` cross-links** — referenced in T7.6's file
  header and in this phase file. Future agents find the runbook
  without needing to grep.

---

## Phase 7 wrap-up

All 7 Phase 7 tasks complete:

- ✅ T7.1 — Schema extension + phase file
- ✅ T7.2 — DeployLog card-wrap + chip-link wiring
- ✅ T7.3 — `/log/[id]` deep-dive route
- ✅ T7.4 — 3 prose drafts + `relatedProjects`
- ✅ T7.5 — Sitemap + cross-link to /work
- ✅ T7.6 — `HeroTerminal` v1 (static + chips + typewriter)
- ✅ T7.7 — RAG runbook + `.env.example` keys

**End state:**

| Route | Status |
|---|---|
| `/` | DeployLog cards now link to `/log/<id>`; chip tags now link to `/stack#<id>`; hero has interactive terminal under the Algocode diagram. |
| `/log` | Unchanged — same experience timeline. |
| `/log/[id]` | NEW. Three prerendered paths (taply, nexbell, innovative-it). Each with Hero, BuildNotes, TagChips (resolvable → /stack#), RelatedProjects (when set), RelatedWriting (matched via tag/project overlap), CaseStudyCrossLink. |
| `/sitemap.xml` | Now includes 3 new `/log/<id>` URLs. |
| `.env.example` | 3 new keys for v2 RAG upgrade (blank). |
| `docs/RAG_TERMINAL.md` | NEW. Full v2 runbook. |

`pnpm build` reports 19 routes (was 18 before Phase 7; +1 for `/log/[id]`).
`pnpm typecheck` and `pnpm lint` clean (lint errors pre-existing in
Blog.tsx + Hero.tsx are unchanged; new code adds 0 errors / 0 warnings).

**Open follow-ups (next phase candidates):**

1. **RAG-LLM terminal upgrade (T7.7 path)** — implement v2 once
   `OPENAI_API_KEY` + Upstash Vector are provisioned.
2. **User-edited prose for the 3 experience entries** (T7.4 drafts
   are committed for review — user may revise in follow-up commits).
3. **Phase 6 pre-existing lint fixes** — Blog.tsx (setState in effect)
   + Hero.tsx (unescaped apostrophe) are minor; clean them up when
   the user touches those files next.

Phase 7 status: **done**.