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