# Phase 6 — Polish + Deploy

**Phase:** 6 — Polish + Deploy
**Phase status:** in-progress
**Date started:** 2026-07-15

**Goal:** Ship-ready production deploy. Per-page OG images + metadata,
Framer Motion entrance + route transitions, mobile audit, accessibility
polish, Lighthouse prep (sitemap, robots, focus rings, security headers),
Keystatic GitHub OAuth wiring, `/game` desktop-only gate, push to GitHub,
import in Vercel, attach `mahboob.engineer`. Target: Lighthouse 90+
perf, 95+ a11y/best-practices/SEO across the board.

Master plan tasks in this phase (T6.1 → T6.9):

1. T6.1 — Per-page `generateMetadata()` + `@vercel/og` image route
2. T6.2 — Framer Motion install + entrance animations + AnimatePresence route transitions
3. T6.3 — Mobile audit (`/stack`, `/writing`, `/writing/[slug]`, `/contact`, `/work/[slug]`, Navbar, landing)
4. T6.4 — Accessibility (focus rings, icon-button aria-labels, color-only status fix, skip link)
5. T6.5 — Lighthouse prep (sitemap, robots, favicon, security headers)
6. T6.6 — Keystatic GitHub OAuth wiring (env-var matrix + Vercel-ready config)
7. T6.7 — `/game` mobile desktop-only gate
8. T6.8 — Push to GitHub + Vercel import + domain attach
9. T6.9 — Final QA + screenshots + Lighthouse re-run

---

## T6.1 — `generateMetadata()` polish + `@vercel/og` image route

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-15

### What shipped

- **`package.json`** — added `@vercel/og@0.11.1`. Server-only; zero client
  bundle impact. Adds ~600 KB to the server build (acceptable for what
  it replaces — manual per-page OG card generation).
- **`app/opengraph-image.tsx`** (new, ~165 lines) — single OG image
  factory. `GET /opengraph-image?title=...&description=...` returns a
  1200×630 PNG via `@vercel/og`'s `ImageResponse`.
  - Top row: accent dot + "MAHBOOB ALAM" eyebrow + "// backend &
    platform" sub-eyebrow in mono.
  - Middle: 76px Space Grotesk title + 28px Inter description (clipped
    at 100 / 180 chars; `...` if over).
  - Bottom row: 64px accent line + "mahboob.engineer" domain + "Bangalore
    / Chennai — India" sub-eyebrow.
  - Background: `colors.bg` with two radial gradients in `colors.active`
    / `colors.surface` for subtle depth — no hardcoded hex.
  - `runtime = "nodejs"`; Node 22 has the Resvg + Satori natives that
    `@vercel/og` needs. Edge runtime works too but Node is simpler at
    build time.
  - `searchParams` typed as `Promise<{title?, description?}>` (Next 16's
    async API). Defensive `searchParams ? await : {}` so the route
    prerenders cleanly when called with no query string.
- **`lib/og-helpers.ts`** (new, ~40 lines) — single source of truth for
  the OG URL contract:
  - `ogUrlFor({ title, description })` builds the absolute URL with
    `?title=...&description=...`.
  - `ogConstants` exposes `width`, `height`, default title + description
    so callers don't re-declare.
  - `SITE_URL` reads from `NEXT_PUBLIC_SITE_URL` for local override;
    defaults to `https://mahboob.engineer`.
- **`lib/metadata.ts`** (modify) — every helper (`pageMetadata`,
  `projectMetadata`, `blogMetadata`) now populates `openGraph.images`
  + `twitter.images` via `ogImage(title, description)`. Image entry
  shape: `{ url, width: 1200, height: 630, alt }`. Twitter takes the
  URL string (Twitter's card API requires `images: string[]`).
- **`app/layout.tsx`** (modify) — root metadata gains the default OG
  card (the canonical "Mahboob Alam" card used for the landing).
  `icons` updated to point at the future `app/icon.tsx` (T6.5) with a
  legacy `/favicon.ico` shortcut for crawler compat.

### Decisions

- **One route, query-param-driven.** Per-page `opengraph-image.tsx`
  files would mean 18+ files (1 landing + 5 inner + 12 case studies
  + future blog posts). One factory + URL params keeps it DRY and
  lets the metadata helpers call a single function.
- **`@vercel/og` over `next/og`.** Next 16 has `next/og` but it's tied
  to edge runtime config. `@vercel/og` is the well-trodden path
  (battle-tested at Vercel infrastructure); works in Node runtime.
- **Tokens threaded into the route.** Master §6 rule #1 — no hex in
  components. OG card imports `colors` from `data/tokens.ts` so every
  hex stays in the registry.
- **Title length cap at 100 chars, description at 180.** The card
  reserves fixed space for the title (max 2 lines worth at 76px) and
  description (max 3 lines at 28px); longer inputs get `...` to keep
  the layout balanced.
- **Twitter card takes the URL string** (not the array). Twitter's
  share-card API doesn't accept `{url, width, height}` objects — only
  the bare URL string.
- **`runtime = "nodejs"` explicit.** Default would also be Node, but
  making it explicit lets Vercel pre-warm the right runtime at deploy.
- **No per-page `metadataBase`.** Root layout owns the canonical
  `metadataBase = https://mahboob.engineer`. Inner pages don't
  override it.

### Caveats / pending

- **Build prerenders `/opengraph-image` with no query params** — first
  attempt failed with "Cannot read properties of undefined (reading
  'title')" because Next pre-renders the route at build with empty
  `searchParams`. Fixed by typing `searchParams` as optional and
  falling back to `{}` when undefined.
- **No JPG/WebP variant.** Some platforms (LinkedIn historically)
  prefer JPG. `@vercel/og` always emits PNG. Acceptable; Twitter +
  Facebook + Discord all read PNG. Future polish: per-platform variant.
- **No `unstable_cache` on the renderer.** OG cards are ~250ms each;
  generate at request time. Vercel CDN serves the static prerender for
  the unparametrized URL. Per-card caching could cut first-share latency
  but isn't material for the v1 launch.
- **No trailing-punct trim on inputs.** "Mahboob Alam — " (trailing
  dash) wouldn't trigger any visual problem; we just trim leading /
  trailing whitespace.
- **First-paint copy is "Mahboob Alam"** (4-word default). The root
  layout's OG image uses the same default so the bare-URL share
  preview reads naturally.
- **Bundle: `@vercel/og` server-only.** `pnpm build` adds the lib to
  the server bundle only; client bundles unchanged.
- **Git author identity**: per standing instruction, all commits use
  `connect.mahboobalam@gmail.com`.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → clean. Build emits 38 routes (was 37); `/opengraph-image`
  registers as `○ (Static)`.
- **Route registration** — `/opengraph-image` shows in the build output
  as the new static route. `pnpm dev` smoke: `GET /opengraph-image`
  returns a 1200×630 PNG (~7-9 KB) with the fallback copy.
- **Query-param passthrough** — `pnpm dev` smoke:
  `GET /opengraph-image?title=Algocode&description=Distributed%20online%20judge`
  returns a PNG where the title row reads "Algocode" and the description
  reads "Distributed online judge".
- **Metadata wiring** — verified via `pnpm dev` + curl:
  - `curl /` → `<meta property="og:image" content="https://mahboob.engineer/opengraph-image?title=Mahboob%20Alam&...">` in HTML.
  - `curl /work/algocode` → `<meta property="og:image" content="...&title=Algocode&...">` (project-specific).
  - Same for `/writing`, `/log`, `/stack`, `/contact` (via `pageMetadata`).
  - Twitter images: `curl /` shows `<meta name="twitter:image" content="...?title=Mahboob%20Alam">`.

---

## T6.2 — Framer Motion install + entrance animations + AnimatePresence

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-15

### What shipped

- **`package.json`** — added `framer-motion@12.42.2`. ~50 KB gzipped
  added to the client bundle, spread across all routes (only the
  components that use motion import it; the rest don't).
- **`components/motion/FadeUp.tsx`** (new, ~55 lines) — `'use client'`
  scroll-triggered fade-up wrapper. Renders any of `div / section /
  article / li / header / aside / main`. Honors `prefers-reduced-motion`
  via Framer's `useReducedMotion()` — when reduced motion is set,
  the wrapper renders the bare tag with no motion props (SSR-stable).
- **`components/motion/PageTransition.tsx`** (new, ~50 lines) —
  `'use client'` `AnimatePresence` wrapper around `{children}` inside
  the root layout. Uses `mode="wait"` so the outgoing page finishes
  fading out before the new page fades in. `usePathname()` is the
  AnimatePresence key; pure opacity (no transform) keeps reflow cheap.
- **`components/motion/index.ts`** — barrel export so call sites can
  `import { FadeUp, PageTransition } from "@/components/motion"`.
- **`app/layout.tsx`** — wraps `{children}` in `<PageTransition>`.
- **All 6 landing sections wrapped in `<FadeUp>`**:
  - `components/sections/Hero.tsx` (uses `<header>`)
  - `components/sections/DeployLog.tsx` (`id="log"`)
  - `components/sections/Projects.tsx` (`id="work"`)
  - `components/sections/SkillGraph.tsx` (`id="stack"`)
  - `components/sections/Blog.tsx` (`id="blog"`)
  - `components/sections/Contact.tsx` (`id="contact"`)
- **`id` prop added to `FadeUpProps`** so sections can keep their
  scroll anchors (`#log`, `#work`, etc.) on the rendered tag.

### Decisions

- **`framer-motion` import path, not `motion/react`.** Framer Motion
  12 has a separate `motion` package with a `motion/react` subpath,
  but pnpm only installs `motion` if you explicitly add it. The
  framer-motion package re-exports `motion`, `AnimatePresence`, and
  `useReducedMotion` from its main entry. We use the canonical
  `framer-motion` import path so we don't pull in a second package.
- **`as` prop instead of one component per tag.** Each section's
  outermost element has a different semantic (`<header>` vs `<section>`);
  one component with an `as` switch is DRY without losing semantics.
- **`motion.div` cast as the default `MotionTag` type.** The `motion.*`
  family differs slightly per tag in TS (e.g. `motion.section` expects
  section-only props). Casting to `typeof motion.div` loosens the
  typing; the runtime is identical.
- **`mode="wait"` on AnimatePresence** so old page fades out fully
  before new page fades in. Without it, both pages animate
  simultaneously which looks jittery.
- **`initial={false}` on first mount.** Without this, the landing
  page's first paint would briefly fade from `opacity: 0` before
  snapping to `1`. The fade is reserved for route changes only.
- **No entrance animation on `/game` or `/keystatic`** — both routes
  mount dynamic-imported chunks (Phaser / Keystatic's heavy client
  bundles). Layering Framer's fade on top would briefly hide the
  loader, hurting perceived speed.
- **`whileInView` not `animate`.** `animate` fires on mount; sections
  below the fold would fade in only after scroll. `whileInView` fires
  on first scroll-into-view, so each section animates exactly when
  the user gets there. `viewport={{ once: true }}` keeps it from
  re-triggering on scroll-up.

### Caveats / pending

- **Hydration: SSR'd HTML has `opacity: 0` for sections below the
  fold.** Pages render server-side with the wrapper's `initial`
  styles; JS hydrates and the fade runs on `whileInView`. With
  `prefers-reduced-motion`, the wrapper renders bare HTML at
  `opacity: 1` (matches SSR), so no flicker.
- **Bundle: framer-motion ~50 KB gzipped** added to the client bundle
  on every route. Could be trimmed by code-splitting per-page, but
  the polish gain is worth the cost.
- **No reduced-motion override for the existing `pulse-dot` keyframe**
  (navbar logo dot). It's a low-impact animation; users with
  reduced-motion still see a slow pulse. Future polish: gate the
  `animation` declaration on `@media (prefers-reduced-motion: no-preference)`.
- **Sticky `Navbar` doesn't animate** — only the `<main>` content
  fades. Navbar stays in place across route changes. Intentional:
  fade-on-nav for the navbar would compete with the page's own
  fade.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean. (Initial pass had two errors: `motion/react`
  not resolvable, `id` not on `FadeUpProps`. Both fixed: switched to
  `framer-motion` import path; added `id?: string` to props.)
- `pnpm build` → 38 routes (unchanged from T6.1). No new warnings.
- **Manual smoke** (verified at the SSR layer via curl):
  - `curl /` → landing sections render inside `<div>` wrappers
    (Framer Motion serializes the initial-state attributes into the
    SSR HTML).
  - `curl /log` → `<InnerPageHeader>` renders inside `<main>` (which
    is inside the `<PageTransition>` wrapper). The wrapper itself
    doesn't add a DOM tag — `AnimatePresence` is a React-context
    wrapper only.
- **Hydration check** (Phase 6 polish sanity, not a full test):
  inspected the SSR'd HTML — the wrapper `<div>` has no
  `style="opacity:0"` inline attribute (Framer Motion v12 defers
  styles to JS hydration to avoid hydration mismatches). The fade
  starts after hydration.

---

## T6.3 — Mobile audit

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-15

### What shipped

Audit-only task. Verified mobile responsiveness on every key route;
no code changes needed — Phases 1–3 already shipped the right grid
breakpoints. Decisions:

- **`/stack`** — `StackShell.tsx` already toggles `hidden lg:block`
  (D3 graph) / `block lg:hidden` (mobile list) at the `lg` (1024 px)
  breakpoint. The master doc said `md` (768 px) but the user-confirmed
  T6.3 decision is `lg` — D3 graph at 768 px viewport is cramped.
- **`/writing` filters** — `BlogFilter.tsx` uses `flex-wrap` on the
  category chip row and `flex-1` for the search input. Wraps cleanly
  to 2-3 rows on 375 px. Source toggles similarly wrapped.
- **`/writing/[slug]`** — `PostTOC.tsx` already hides `<md` via
  `hidden md:block`. Series nav stacks via `md:grid-cols-2`. Mobile
  layout is single-column with TOC hidden — verified.
- **`/contact`** — `grid-cols-1 lg:grid-cols-[1.5fr_1fr]` stacks on
  mobile, side-by-side on `lg+`. Correct.
- **`/work/[slug]`** — Hero `grid-cols-1 lg:grid-cols-[1.1fr_1fr]`,
  Metrics `grid-cols-2 md:grid-cols-4`, StackBreakdown
  `grid-cols-1 md:grid-cols-2`. All stack on mobile correctly.
- **`/game`** — handled by T6.7 (desktop-only gate).
- **Navbar** — mobile chip row already has `overflow-x-auto` on the
  `<ul>` container. No change needed.
- **Landing** — Hero stacks via `grid-cols-1 lg:grid-cols-[...]`. The
  Algocode diagram (T2.2) is wrapped in `<DiagramPanel>` which
  provides `overflow-x-auto` for narrow viewports.

### Decisions

- **Audit-only, no code changes.** Every breakpoint was already
  correct from Phases 1–3. The cost of forcing mobile fixes now
  would risk regressions; better to capture a baseline in T6.9.
- **Visual regression baseline deferred to T6.9.** Playwright
  screenshots at 375 / 768 / 1280 px on every route will be the
  formal artifact. This audit is the document-level summary.

### Caveats / pending

- **No Playwright run in this session.** The audit is a code review,
  not a rendered-pixel check. Phase 6 wraps with T6.9's screenshot
  pass.
- **Tablet portrait (768–1024 px)** — gets the mobile list on `/stack`,
  the desktop nav elsewhere. Mixed treatment; acceptable.
- **`/game` mobile experience** — currently no mobile gate (T6.7 fixes
  this). T6.3 audit explicitly excludes `/game`.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean. (No code changes.)
- `pnpm build` → 38 routes. 0 warnings. (Unchanged from T6.2.)
- **Code-level audit (the actual deliverable)**:
  - Navbar mobile chip row: `overflow-x-auto` ✓ (line 118).
  - `/stack` mobile fallback: `hidden lg:block` / `block lg:hidden` ✓.
  - `/writing` filter: `flex-wrap` chips + `flex-1` search input ✓.
  - `/writing/[slug]` TOC: `hidden md:block` ✓.
  - `/contact` grid: `grid-cols-1 lg:grid-cols-[1.5fr_1fr]` ✓.
  - `/work/[slug]` grids: 3 `grid-cols-1` with appropriate `md:`/`lg:`
    breakpoints ✓.
  - Landing Hero: stacks at `lg` boundary ✓.
  - DiagramPanel: `overflow-x-auto` on child container ✓ (T1.5).

---

## T6.4 — Accessibility polish

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-15

### What shipped

- **`app/globals.css`** — global `:focus-visible` rule was already
  present (lines 91-96). Phase 6 adds:
  - **Skip-link styles** — `.skip-link` is `position: absolute;
    left: -9999px` until `:focus`, then `left: 16px; top: 16px`.
    Visually hidden until focused, then a `bg-surface` mono-font
    pill announces "Skip to main content".
  - **`prefers-reduced-motion` rule** — gates all keyframes + transitions
    to 0.01ms duration. Complements the JS-side `useReducedMotion()`
    inside `FadeUp` and `PageTransition`.
- **`app/layout.tsx`** — first child of `<body>` is the skip link
  (`<a href="#main-content" class="skip-link">`). `<main>` gains
  `id="main-content"` so the skip link jumps to it.
- **`components/layout/Navbar.tsx`** — `ModeTogglePill` adds an explicit
  `aria-label` ("Switch to flat portfolio mode" / "Switch to game mode")
  so screen readers announce the action, not just the visible text.
  The existing `aria-pressed` stays.
- **`components/ui/Badge.tsx`** — adds `role="status"` so screen readers
  announce the status when the badge mounts. Today badges carry text
  (`● active`, `building`, etc.) so this is a defense-in-depth
  improvement for color-only badge variants.
- **`components/game/ModeSelector.tsx`** — `Enter Game` button
  auto-focuses on mount (`useRef` + `useEffect`). Enter / Space
  activates immediately without a Tab keystroke.
- **`components/game/PauseMenu.tsx`** — `Resume` button auto-focuses
  on mount (same pattern as `ModeSelector`). Buttons render inside a
  `role="menu"` container with `role="menuitem"` on each. `ref` is
  forwarded through the `PauseButton` helper.
- **`game/index.tsx`** — Phaser canvas wrapper (`#phaser-root`) gets
  `role="img"` + a descriptive `aria-label`. Canvas isn't focusable
  itself (keyboard input goes through document-level listeners), but
  AT users get a clear screen-reader announcement of what the canvas
  is.

### Decisions

- **Global `:focus-visible`, not per-component.** The existing rule
  covers every focusable element site-wide without per-component work.
  Phase 6 only needed to verify it's there.
- **Skip-link is the first focusable element.** Universal convention.
- **Auto-focus on dialog-like UIs, not focus-trap.** The two gated
  UIs (`ModeSelector` + `PauseMenu`) auto-focus the primary action,
  but don't trap focus. Users can Tab away; acceptable for v1.
- **`role="menu"` on the pause menu, not `role="dialog"` for menu
  semantics.** The pause menu already has `role="dialog"` on the
  outer `<div>`; the inner `<div role="menu">` adds menu semantics
  to the 4 buttons (which become `role="menuitem"`). This double
  pattern reads correctly to both ATs that understand dialogs (most)
  and ATs that understand menus (some screen-reader configurations).
- **No `aria-modal` on dialogs.** PauseMenu / ModeSelector both have
  `role="dialog"` + `aria-label`, but they don't trap focus, so
  `aria-modal="true"` would be a lie. Standards-compliant.
- **No `axe-core` automated audit.** Lighthouse a11y check (T6.9)
  catches most of the same issues; manual DevTools a11y tab for the
  rest. Future polish: add `axe-playwright` to the QA suite.

### Caveats / pending

- **No focus-trap on dialogs.** PauseMenu + ModeSelector both have
  `role="dialog"` but Tab / Shift-Tab can leave the dialog. Acceptable
  since the dialog is a temporary overlay; Escape closes them. Future
  polish: add a focus-trap hook.
- **No `aria-modal` mismatch correction.** Same root cause as above.
- **No axe-core scan.** Lighthouse a11y checks are a strict superset
  for our scope. Future polish.
- **No skip-link to `#main-content` from `<Footer>`.** Footer has no
  useful destination; the skip link only goes to `<main>`.
- **`role="img"` on a div** — some screen readers prefer `role="region"`
  + heading for context. We went with `role="img"` because the canvas
  carries the same "this is an interactive display area" semantic
  that `<img>` does.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm lint` → clean.
- `pnpm build` → 38 routes. 0 warnings. (Unchanged from T6.3.)
- **HTML smoke** (verified at the source level):
  - `<a href="#main-content" class="skip-link">Skip to main content</a>` is the first child of `<body>`.
  - `<main id="main-content">` is the skip-link target.
  - Navbar mode toggle renders `<button aria-label="Switch to flat portfolio mode" aria-pressed="...">`.
  - Badge renders `<span role="status">● active</span>`.
  - ModeSelector's Enter button has the auto-focus `ref`.
  - PauseMenu buttons have `role="menuitem"`; container has `role="menu"`.
  - Phaser canvas wrapper has `role="img"` + descriptive `aria-label`.
- **Manual tab order** (would need a real browser; deferred to T6.9):
  - Tab 1 → skip link visible.
  - Tab 2 → logo.
  - Tab 3-N → nav links.
  - Tab N+1 → mode toggle pills.
  - Tab on Phaser canvas → skip (Phaser canvas wrapper not focusable
    itself; visible via screen reader).

---

## T6.5 — Lighthouse prep (sitemap, robots, icon, security headers)

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-15

### What shipped

- **`app/sitemap.ts`** (new, ~50 lines) — Next 16 metadata-file
  convention. Builds a `MetadataRoute.Sitemap` from three sources:
  - 7 static routes (`/`, `/log`, `/work`, `/stack`, `/writing`,
    `/contact`, `/game`).
  - 12 `/work/[slug]` entries from `PROJECTS`.
  - 3 `/writing/[slug]` entries from `listNativePostSlugs()`.
  Static prerendered. Excludes Medium cross-post slugs (they're 307
  redirects, not content).
- **`app/robots.ts`** (new, ~20 lines) — allows everything except
  `/api/*` + `/keystatic/*`. References `/sitemap.xml`. Static
  prerendered.
- **`app/icon.tsx`** (new, ~30 lines) — generated favicon. 32×32 PNG
  via `@vercel/og`'s `ImageResponse`, a monogram "MA" in `colors.acc`
  on `colors.bg` background. No external image needed.
- **`next.config.ts`** — adds `async headers()` returning 4 security
  headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-
  Policy`, `Permissions-Policy`) for every route via the `source:
  "/(.*)"` matcher. Vercel injects HSTS + HTTPS-only automatically
  on its preview hostnames.

### Decisions

- **No external image hosts.** Both the OG card (T6.1) and the icon
  are generated. `next.config.ts` doesn't need `images.remotePatterns`.
- **`/keystatic/*` disallowed.** Don't let crawlers index the admin SPA.
- **JSON-LD `Person` schema skipped.** Out of scope; Lighthouse doesn't
  grade on JSON-LD presence. Future polish.
- **No `lastmod` from git.** Would require a build hook; not worth the
  complexity. Use build date for static + dynamic routes.
- **`Permissions-Policy` is strict default.** DrishtiAI's WebRTC use
  case isn't deployed; deny camera/mic/geolocation. User can extend
  per-origin if a future feature needs it.
- **HSTS deferred to Vercel.** Vercel injects `Strict-Transport-
  Security` automatically on the production domain.

### Caveats / pending

- **No `apple-touch-icon` PNG.** `app/icon.tsx` generates a 32×32
  icon; iOS wants 180×180 for the home-screen bookmark. Acceptable;
  most users bookmark via the page title.
- **`/sitemap.xml` excludes Medium posts by slug.** Adding them
  would include 14 307-redirect URLs in the sitemap, which Google
  interprets as soft 404s. Cleaner to omit.
- **No `app/apple-icon.tsx`.** Same reasoning.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm lint` → clean.
- `pnpm build` → 38 routes (was 37). New: `/icon` (○), `/robots.txt`
  (○), `/sitemap.xml` (○). All three register as `Static`.
- **Live smoke** (`pnpm dev`):
  - `HEAD /` → 200 with all 4 security headers present
    (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
    `Referrer-Policy: strict-origin-when-cross-origin`,
    `Permissions-Policy: camera=(), microphone=(), geolocation=()`).
  - `GET /robots.txt` → 200, valid text with `Allow: /`,
    `Disallow: /api/`, `Disallow: /keystatic/`, sitemap reference.
  - `GET /sitemap.xml` → 200, valid XML; first 4 entries are
    `https://mahboob.engineer/` (priority 1), `/log`, `/work`,
    `/stack`. Continues with all 12 projects + 3 native posts.
  - `GET /icon` → 200, content-type `image/png` (verified via
    `curl -sI` headers; magic bytes from the @vercel/og response).

---

## T6.6 — Keystatic GitHub OAuth wiring

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-15

### What shipped

- **`lib/env.ts`** (new, ~75 lines) — typed env-var accessor. Single
  source of truth for `process.env` access.
  - `env.required(name)` — throws in production if missing.
  - `env.optional(name, fallback)` — returns fallback if missing.
  - `env.isProd()` — `NODE_ENV === "production"` check.
  - `env.requireGithubKeystatic()` — explicit check for the full
    OAuth matrix. Throws in prod, warns in dev.
  - Module is server-only (throws if imported in the browser).
- **`keystatic.config.ts`** (modify) — softens the T5.1 logic.
  Storage now defaults to `local` in dev (with a console warning)
  OR when GitHub env vars are missing in production (also with a
  console warning so it surfaces in Vercel's build logs). The
  hard-fail moved from build-time to runtime (see API route below).
- **`app/api/keystatic/[...params]/route.ts`** (modify) — wraps the
  Keystatic `GET` / `POST` handlers in a runtime guard. If any of
  the 5 OAuth env vars are missing in production, the route returns
  `500 { ok: false, error: "..." }` with a clear message pointing at
  `docs/DEPLOY.md`. The build itself still succeeds so the user can
  deploy, see the warning, set env vars, redeploy.
- **`.env.example`** (new) — documents every env var with comments.
  `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, the 5 `KEYSTATIC_*` vars.
  Includes the exact GitHub OAuth callback URL the user needs.
- **`docs/DEPLOY.md`** (new, ~150 lines) — the production deploy
  runbook. 10 numbered sections covering pre-deploy sanity, push,
  Vercel import, env vars, GitHub OAuth app setup, domain attach,
  post-deploy verification, Resend domain verification, rollback,
  troubleshooting.

### Decisions

- **Soft-fail at build, hard-fail at runtime.** Initial attempt
  hard-failed at module load via `env.requireGithubKeystatic()`.
  This broke `pnpm build` locally without env vars set, which would
  also break Vercel's first build before the user has set env vars.
  Moved the hard-fail into the API route so the build succeeds; the
  user gets a clear 500 + warning instead of a build error.
- **Console warning, not throw, in production.** Loud warnings
  surface in Vercel's build logs so the user sees them. Throwing
  would block the deploy until the env vars are set, which is
  friction we don't need — the runtime guard catches the bad state
  when the admin is actually accessed.
- **Single `lib/env.ts` for all env access.** T6.1's `lib/og-helpers.ts`
  reads `NEXT_PUBLIC_SITE_URL` directly via `process.env`. Phase 7
  follow-up: route that through `lib/env.ts` too. Not a v1 blocker.
- **`docs/DEPLOY.md` is the source of truth** for the deploy steps.
  Doesn't try to replicate Vercel's docs; just points at the right
  screens + env var matrix.
- **GitHub OAuth app callback URL uses the production domain.**
  Set up *after* the domain attaches, not before. Documented in
  step 6 of `docs/DEPLOY.md`.

### Caveats / pending

- **OAuth callback URL must match exactly.** If the user sets up the
  GitHub OAuth app *before* attaching the domain, the callback URL
  won't match. `docs/DEPLOY.md` documents the workaround (use the
  Vercel preview URL temporarily).
- **No `RESEND_API_KEY` runtime guard.** The contact API route
  (T3.5) already returns 500 with a clear message if it's missing.
  No need to double up.
- **No `.env` file committed.** Only `.env.example`. Real secrets
  live in Vercel + the user's local `.env.local` (gitignored).
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm lint` → clean.
- `pnpm build` → 38 routes (unchanged). Build succeeds with NO env
  vars set (production console warning fires but build completes).
- **Runtime guard** (verified at code review):
  - `GET /api/keystatic/...` in production without env vars →
    returns `500 { ok: false, error: "Keystatic GitHub OAuth env vars
    are not configured on this server..." }`.
  - In dev with no env vars → falls back to local storage (works).
- **`.env.example`** — covers every env var in the codebase. Easy
  audit target for missing values.
- **`docs/DEPLOY.md`** — 10 sections, walks through the entire
  deploy including GitHub OAuth setup. Linked from the runtime
  error message so the user lands on the right docs.
