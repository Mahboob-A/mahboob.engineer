# Phase 1 — Foundation

**Phase:** 1 — Foundation
**Phase status:** in-progress
**Date started:** 2026-07-10
**Goal:** Project boots, design system is locked, data is in TypeScript, shared
components exist. Phase 1 ends when every component in `components/ui/` and
`components/layout/` is built and `pnpm dev` shows a styled placeholder page.

Master plan tasks in this phase (T1.1 → T1.7):

1. T1.1 — Next.js 15 project setup
2. T1.2 — Design tokens
3. T1.3 — Data registries (projects, experience, blog, stack)
4. T1.4 — Root layout (fonts + metadata already shipped inside T1.1; verify)
5. T1.5 — Shared UI components (Chip, Badge, StatRow, DiagramPanel)
6. T1.6 — Navbar + Footer
7. T1.7 — Inner layout shell (InnerLayout + BackLink)

---

## T1.1 — Next.js 15 project setup

**Task status:** done
**Commit:** `7935da2`
**Date:** 2026-07-10

### What shipped

- Scaffolded Next.js into the existing portfolio directory; preserved master
  doc, flat mockup, prompt guide, and 3 tileset + 3 dev-sprite PNGs across
  the move.
- `app/layout.tsx` — three Google Fonts (Space Grotesk, Inter, JetBrains
  Mono) via `next/font/google`, full metadata (title template + OG +
  Twitter + robots).
- `app/globals.css` — every token from master §0.3 wired as CSS var +
  Tailwind v4 `@theme inline` bridge, focus-visible ring, selection color.
- `app/page.tsx` — clean placeholder; Phase 2 replaces.
- `.prettierrc.json` + `.prettierignore` (Prettier 3 + tailwind plugin).
- Folder structure per master §4: `data/`, `components/{layout,ui,
sections,diagrams,work,stack,writing}/`, `lib/`, `game/{scenes/overlays,
entities}/`, `public/assets/{tilesets,sprites,maps,og}/`.

### Decisions

- `pnpm create next-app@latest` resolved to **Next.js 16.2.10**, not 15.x.
  Carrying forward — App Router APIs we use (`generateStaticParams`, MDX,
  dynamic imports) are identical. Flagged for the user's call.
- Removed scaffold artifacts `AGENTS.md` and `CLAUDE.md` (auto-generated
  agent context files that conflicted with our naming convention).

### Caveats / pending

- `node_modules` was briefly removed mid-flow during file restore;
  reinstalled via `pnpm install` and verified clean typecheck/build.
- `.git` was also removed; re-initialized for the initial commit.

### Verified

- `pnpm typecheck` → clean (strict mode).
- `pnpm build` → 4 static pages, no errors.
- `pnpm lint` → clean.
- `pnpm dev` → ready in 175ms on `localhost:3000`.
- Browser shows dark forest-green background, eyebrow + display-font h1.

---

## T1.2 — Design tokens

**Task status:** done
**Commit:** `3980025`
**Date:** 2026-07-10

### What shipped

- `data/tokens.ts` — single source of truth for every color, font, and
  chip color-mapping rule on the site.
- `colors` object with `as const`: bg, surface, card, elev, active, border,
  borderS, t1, t2, t3, acc, accDim, aiBg, aiBd, amber, amberDim, codeBg.
- `kwLight` + `kwDark` palettes (sage/slate/amber/mauve × light/dark).
- `fonts` (display/body/mono) mirrored from `app/layout.tsx`.
- `chipColor(tag)` — case-insensitive regex matcher, returns
  `"sage"|"slate"|"amber"|"mauve"`, defaults to sage.
- `chipStyle(tag)` — bonus helper returning `{backgroundColor, color}` for
  non-Tailwind contexts (SVG, D3, inline labels).

### Decisions

- Mauve matcher split into three sub-rules (auth / AI-CV-WebRTC / DRM) so
  adding new auth or AI tags later doesn't touch unrelated groups.
- Regexes use `\b…\b` boundaries so `"Next.js"` / `"Nextjs"` / `"next js"`
  all match identically.
- `colors` uses `as const` → TS gives compile errors on mistyped keys.
- Default unknown tag → sage (safe fallback, never produces invalid class).

### Caveats / pending

- `kwLight` exported but unused until a light-mode toggle ships (future).
- `chipStyle` is convenient but if a colored Tailwind class ever needs to
  be generated dynamically, prefer `chipColor()` + Tailwind safelist.

### Verified

- `pnpm typecheck` → clean.
- Extracted all 72 unique tags from master §0.4–0.7, ran each through
  `chipColor`. All classified into the right bucket:
  - 24 sage (backend/lang/framework)
  - 28 slate (infra/data/observability)
  - 4 amber (messaging/payment)
  - 16 mauve (auth/AI/protocol)
- `pnpm build` and `pnpm lint` both clean.

---

## T1.3 — Data registries

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-10

### What shipped

- Four typed registry files under `data/`, all copied verbatim from master
  §0.4–0.7 (no value changes — only wrapped in proper TypeScript types):
  - `data/projects.ts` — `PROJECTS: ProjectItem[]`, 11 entries + lookup
    helpers (`PROJECTS_BY_SLUG`, `getProjectBySlug`, `projectsByTier`,
    `projectsByDomain`, `FOUNDER/FEATURED/SHOWCASE_PROJECTS`).
  - `data/experience.ts` — `EXPERIENCE: ExperienceItem[]` (3 entries)
    and `EDUCATION: EducationItem[]` (2 entries), plus
    `ACTIVE/COMPLETED_EXPERIENCE` filters and `EXPERIENCE_BY_ID` map.
  - `data/blog.ts` — `BLOG_POSTS: BlogPostItem[]` (3 Medium posts),
    plus `postsInSeries`, `postsByProject`, `postsByStack`,
    `ALL_SERIES`, `BLOG_POSTS_BY_SLUG`.
  - `data/stack.ts` — `STACK: StackItem[]` (25 entries), plus
    `STACK_BY_ID`, `stackByDomain`, `LEARNING/PRODUCTION_STACK`,
    `computeStackEdges`, `STACK_EDGES` (pre-computed), and
    `techsByProject`.

### Decisions

- Each entry uses **`as const`-friendly literal-union types** (e.g.
  `ProjectStatus = "live" | "building" | "complete"`) instead of plain
  `string` — TS autocomplete + compile-time guarding.
- Edge list for the D3 force graph is **pre-computed and frozen** at module
  load (`STACK_EDGES`), since the registry is static. A second pass
  re-runs `computeStackEdges()` lazily and we assert equality — saves an
  O(n²) computation every render of `/stack`.
- Pulumi's `github_client` field is **optional and nullable** (`string |
null`) on the `ProjectItem` type — only pulumi-infra sets it today.
- `EXPERIENCE_BY_ID.id` mirrors `PROJECTS.slug` for the Taply entry so
  cross-references between the two registries stay aligned.

### Caveats / pending

- Learning-domain `projects: []` arrays on k8s/terraform/go/ebpf are
  honest — they're "currently studying," not yet deployed anywhere.
  Will be revisited once any of these lands in a project.
- Blog entries are all `medium`-sourced today. Phase 5 (Keystatic) will
  start producing `native` MDX posts that flow into the same registry.

### Verified

- `pnpm typecheck` → clean (strict mode).
- `pnpm build` → 4 static pages, no errors.
- `pnpm lint` → clean (one stray unused-import warning caught and fixed
  during this task).
- Smoke-tested all four registries with a node script — every helper
  returns the right shape, all 107 stack edges compute, all lookup
  maps are populated, slug/id uniqueness holds (11/11 unique slugs,
  no duplicate experience ids).
- Top 5 heaviest stack edges are `django↔drf`, `django↔redis`,
  `celery↔redis`, `django↔celery`, `django↔postgresql` — matches
  intuition (these are the most co-deployed tools).

---

## T1.4 — Root layout verification

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-10

### What shipped

- Audited the root `app/layout.tsx` against the 10 layout contracts from
  master §6. Caught and fixed **two real issues**:
  - **Hardcoded hex in body class.** Was `bg-[#172318] text-[#D8EEE2]`;
    now `bg-bg text-t1` — uses tokens via Tailwind v4 `@theme inline`.
  - **Deprecated metadata fields.** Next.js 16 deprecated `viewport`,
    `themeColor`, and `colorScheme` inside `metadata` — moved to a
    dedicated `viewport` export (clean build, no warnings).
- Added `lib/metadata.ts` — three typed helpers so every inner page
  builds metadata without copy-paste:
  - `pageMetadata(title, description)` — for /log, /work, /stack, etc.
  - `projectMetadata({name, tagline, slug, status})` — for /work/[slug].
  - `blogMetadata({title, excerpt, slug, readMin})` — for /writing/[slug].
  - Plus `siteConstants` (URL, name, description) for shared use.
- Hardened `app/layout.tsx`: explicit `googleBot` robots directive,
  comment explaining each font slot, `suppressHydrationWarning` on
  `<html>` to keep dev tools clean when browser extensions tweak markup.

### Decisions

- Didn't pull hex from `data/tokens.ts` into a Tailwind class string at
  render time — Tailwind v4's `@theme inline` already bridges every token
  to utility classes (`bg-bg`, `text-t1`, `border-border`), so layout
  reads naturally without an import.
- Used `viewport` as a separate named export per Next 16 semantics —
  builds lint clean.
- `lib/metadata.ts` helpers all share a common `SITE_URL` constant
  (`https://mahboob.engineer`) so the source-of-truth lives in one file.

### Caveats / pending

- `themeColor: "#172318"` is duplicated between the two style sources
  (CSS var in globals.css + `Viewport.themeColor` here). If we ever
  change `colors.bg`, both must change. Will revisit if we add more
  theme-color signals.
- Phase 6 polish will replace the placeholder `/favicon.ico` and add
  a proper manifest + OG image generation.

### Verified

- `pnpm typecheck` → clean.
- `pnpm lint` → clean.
- `pnpm build` → 4 static pages, **no warnings** (was 2).
- Live `pnpm dev` + `curl http://localhost:3000/`:
  - `<html lang="en" class="...space_grotesk_... inter_... jetbrains_mono_... h-full antialiased" style="color-scheme:dark">` — all three fonts loaded, lang + dark scheme set.
  - `<body class="font-body bg-bg text-t1 flex min-h-full flex-col">` — tokens applied, no hardcoded hex.
  - `<title>Mahboob Alam — Co-Founder & Backend Engineer</title>` — title template resolves.
  - `<meta property="og:title" content="Mahboob Alam — Co-Founder & Backend Engineer">` — OG present.
  - `<meta name="twitter:card" content="summary_large_image">` — Twitter card set.
  - `<meta name="theme-color" content="#172318">` — matches `colors.bg`.
  - Page weight: 16.4 KB (reasonable for a placeholder landing).

---

## T1.5 — Shared UI components

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-10

### What shipped

Four components in `components/ui/`, all to spec, plus one helper:

- **`Chip.tsx`** — `ChipColor` (sage/slate/amber/mauve) tag pill. Inline CSS
  vars set per element (`--chip-sage-bg`, etc.) so Tailwind's `bg-[var(--chip-sage-bg)]`
  arbitrary value resolves correctly. kwDark hex values land in the
  rendered HTML inline (not the CSS bundle), one set per chip instance.
  Style matches master: mono 11px, padding 3px 9px, radius 4px,
  letter-spacing 0.3px.
- **`Badge.tsx`** — Pill status badge for `active`/`live`/`completed`/`building`.
  Uses Tailwind tokens (`text-acc border-acc/30 bg-acc/[0.07]`) so all
  colors stay driven by globals.css. Active and live share styling.
- **`StatRow.tsx`** — 4-up (2-up on mobile) metric grid. Last column never
  has a right border; bottom border on cells 1–2 only so the 2x2 mobile
  layout stays boxed. Number: mono 24px amber; label: 12px t3.
- **`DiagramPanel.tsx`** — Frame for SVG diagrams. Header (title + sub +
  optional live indicator with green dot) + horizontally-scrollable child
  container so wide diagrams don't blow out mobile.
- **`lib/cn.ts`** — Tiny `className` joiner (filter falsy + join). Replaces
  `clsx` for our purposes; no extra dependency.

### Decisions

- **Chip implementation chose CSS-var bridge over Tailwind safelist.**
  Setting `--chip-{color}-{bg|text}` inline per chip and using Tailwind
  arbitrary values like `bg-[var(--chip-sage-bg)]` keeps the source of
  truth in `data/tokens.ts` and avoids growing the Tailwind config. Trade-off:
  all 8 vars get set on every chip (4 chip instances in the smoke test
  duplicated the same 8 lines) — slightly more bytes per chip than a
  single static class would produce, but bullet-proof against future
  color additions.
- **`active` and `live` are aliases** in `Badge` — the master spec listed
  them as separate variants but they share exact styling. Future divergence
  is one map-entry away.
- **TerminalBlock deferred** to T2.7 (contact form) — it's only used in
  two places (landing contact + `/contact` page). Building it now would
  be premature.

### Caveats / pending

- The smoke-test page (`app/_ui-smoke/`) was used to verify rendered HTML
  in production build, then deleted. The verification pattern (boot
  prod, curl, grep tokens) is reusable for future component checks.
- StatRow hardcodes 4 columns in its responsive logic. If we ever need
  3-up or 6-up, the border math needs revisiting.

### Verified

- `pnpm typecheck` → clean.
- `pnpm lint` → clean (one stray unused-variable warning caught + fixed).
- `pnpm build` → 4 static pages, no warnings.
- **Live HTML/CSS verification in production build**:
  - Chip: all 8 kwDark CSS vars (`#122018`, `#0E1C2C`, `#1E1608`, `#1E1030`
    - their text counterparts) appear in inline styles, exactly 4 times
      each (one per chip).
  - Badge: class `text-acc border-acc/30 bg-acc/[0.07]` rendered correctly.
  - StatRow: `class="...grid-cols-2 ... md:grid-cols-4"` matches the 2-up
    mobile / 4-up desktop responsive layout.
  - DiagramPanel: title + liveLabel render, the green `bg-acc` dot is
    present in the live indicator.
  - All tokens (`#1c2e1e`, `#5cc9a0`, `#608870`, `#f59e0b`) present in
    the served CSS bundle.
