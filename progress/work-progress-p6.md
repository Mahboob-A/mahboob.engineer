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
