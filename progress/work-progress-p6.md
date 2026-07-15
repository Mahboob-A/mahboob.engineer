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
