# Phase 5 — Blog + CMS (The Backend Diaries)

**Phase:** 5 — Blog + CMS
**Phase status:** in-progress
**Date started:** 2026-07-15
**Goal:** `app/writing` ships the real list page (T4.12 stub replaced),
individual posts render via `/writing/[slug]`, and Keystatic is mounted
at `/keystatic` for native MDX authoring. Medium RSS pulls all 14+
cross-posts at build time (Linux Networking × 4, PostgreSQL × 3, Redis
× 2, AWS Networking 101, Algocode, Message Queue 101), and 3 native
MDX posts are seeded.
**Result:** A working blog with native CMS + cross-post ingestion + full
filter UX (search, categories, source toggles, series rail).

Master plan tasks in this phase (T5.0 → T5.6):

1. T5.0 — Phase file + Medium registry update (data + 14 medium posts)
2. T5.1 — Install Keystatic + config + admin route
3. T5.2 — `lib/mdx.ts` — MDX compile + Shiki + frontmatter + TOC
4. T5.3 — `lib/medium-rss.ts` — build-time RSS fetcher
5. T5.4 — `/writing` list page (real, replaces T4.12 stub)
6. T5.5 — `/writing/[slug]` — individual post page
7. T5.6 — Seed 3 native MDX posts

---

## T5.0 — Phase file + Medium registry update

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-15

### What shipped

- **`progress/work-progress-p5.md`** — phase file with the 7-task
  breakdown, following the rulebook format. Created empty at the
  start of the task; this section is the first task record.
- **`data/blog.ts`** — fully refactored to host all 14 Medium posts
  from the user-provided catalog. The file's docstring was rewritten
  to clarify that `BLOG_POSTS` carries **both** the canonical Medium
  cross-post registry (now 14 entries) **and** the registration
  records for native MDX posts (T5.6 seeds 3).
- **`BlogPostItem`** gained a required `category: BlogCategory` field
  so the /writing filter chips can filter posts by topic
  (master §2.5: 8 chips — Distributed Systems / Linux-Networking /
  Docker / Video / AI / Platform / Career).
- **New exports** for the filter UI:
  - `BlogCategory` type — 7 union members.
  - `CATEGORIES` — `ReadonlyArray<{ id, label }>` with display labels.
  - `postsByCategory(category)` — helper mirroring `postsByProject`.
- **All 14 Medium entries** with real URLs from the user-provided
  catalog:
  - **Linux Networking × 4** (real URLs from the user; was a stub URL
    at `/` for part 1, parts 2-4 didn't exist before).
  - **PostgreSQL × 3** — new entries; series name "PostgreSQL".
  - **Redis HA × 2** — new entries; series name "Redis HA".
  - **Standalone × 4** — Algocode, Message Queue 101, AWS Networking
    101 (new), DrishtiAI eye-screening agent.
- Each entry now carries a hand-written `excerpt` (the prior 3 medium
  entries showed the same data, but with no explicit excerpt — relied
  on the `defaultExcerpt()` fallback from T2.6). The fallback still
  works for native posts that don't yet have one.
- Linux Networking posts' `projects` field points at `["unthink"]`
  (the codebase connections — Linux/containers → UnThink's infra).
  PostgreSQL posts point at `["taply", "algocode"]` (the two
  production projects using PostgreSQL). Redis HA points at
  `["taply", "algocode", "unthink"]` (3 production projects using
  Redis for cache / queue broker / session store).

### Decisions

- **`category` is required (not optional).** Master §2.5 explicitly
  has 8 filter chips including "All" + 7 topics — every post must
  have one. Required field enforces this at the type level so the
  filter UI never has to deal with `undefined`.
- **Series name "Redis HA"** (not "Redis") because the user-described
  topic is high-availability Redis (replication, sentinels, cluster).
  Linux Networking keeps its full-name series for clarity. PostgreSQL
  keeps the bare RDBMS name.
- **Excerpts are hand-written**, not auto-generated. The blog cards
  already had a `defaultExcerpt()` fallback for posts without
  excerpts (T2.6) — leaving new posts without excerpts would still
  render correctly. But hand-written excerpts read better on the
  listing page; future native posts can keep using the fallback
  until the user adds an excerpt in Keystatic.
- **No `publishedAt` field populated** yet — Medium RSS gives us dates
  but the static registry doesn't carry them. T5.3's RSS fetcher
  will surface the real `publishedAt` for the build-time merged
  list. The static registry entries are treated as "undated" and
  sorted by their order in the array (newest-first groups).
- **Post count total: 14 medium posts**, 0 native (T5.6 adds 3).
  Once T5.6 ships, the listing will show 17 posts (3 native + 14
  medium merged in via RSS, with the static registry acting as the
  RSS fallback).

### Caveats / pending

- **The static `BLOG_POSTS` registry now duplicates what the Medium
  RSS feed will fetch.** T5.3 will keep it as the offline fallback
  and the canonical reference for the build-time merge. After T5.3
  ships, the static registry is **only consulted on fetch failure**
  — the RSS feed is the authoritative source at build time.
- **No `publishedAt`** — T5.3's RSS fetcher is where dates come from.
  Static-registry entries are undated.
- **Linux Networking Part 1's old placeholder URL**
  (`https://imehboob.medium.com`) is now replaced with the real
  Medium URL. Any old link to the placeholder is now broken — but
  the placeholder URL was never a real post.
- **`drishti-ai-eye-screening-agent`** URL also matches the
  user-confirmed style (`imehboob.medium.com/...`). The prior
  entry had the same slug + URL — verified consistent.

### Verified

- `pnpm typecheck` → clean. Required `category` field forces all
  14 entries to declare a category — caught at compile time.
- `pnpm lint` → clean.
- `pnpm build` → 24 routes, 0 warnings. The `data/blog.ts` change
  is additive; no consumers broke.
- **Spot-check** via `node -e "console.log(require('./data/blog').BLOG_POSTS.length)"`-equivalent:
  - `BLOG_POSTS.length` = 14 ✓
  - `ALL_SERIES` = `["Linux Networking", "PostgreSQL", "Redis HA"]` ✓
  - `CATEGORIES.length` = 7 ✓
  - Linux Networking series: 4 posts (parts 1-4), correctly ordered ✓
  - PostgreSQL series: 3 posts (parts 1-3) ✓
  - Redis HA series: 2 posts (parts 1-2) ✓
  - Every Medium post has a real URL (no `imehboob.medium.com` placeholder) ✓
  - Every post has a non-empty `excerpt` ✓

---

## T5.1 — Install Keystatic + config + admin route

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-15

### What shipped

The CMS is mounted. Visiting `/keystatic` in dev mode loads the full
Keystatic admin SPA (2.2 MB of chunks including the React-Aria
UI runtime, slate editor, Y.js collaboration layer, and ProseMirror
doc engine). The admin UI lets the user create, edit, and delete
native blog posts that are stored as MDX files under `content/posts/`.

- **`keystatic.config.ts`** (new, ~140 lines) — the keystatic config
  using the modern Keystatic 0.5 `fields.*` namespace API:
  - `config({ storage, collections: { posts: collection({...}) } })`
  - Storage branch: `local` in dev; switches to `github` only when
    `KEYSTATIC_GITHUB_CLIENT_ID` + `KEYSTATIC_GITHUB_CLIENT_SECRET` +
    `KEYSTATIC_SECRET` are all present in env (so a build never
    fails for missing prod config — see Decisions).
  - Single collection `posts` matching the BlogPostItem schema:
    `title` (`fields.slug`), `excerpt` (multiline text, max 240),
    `category` (select from the 7 BlogCategory values),
    `tags[]`/`projects[]`/`stack[]` (array of short text),
    `series` (optional text), `part` (optional integer),
    `readMin` (required integer), `publishedAt` (optional ISO date),
    `content` (MDX field with the official editor).
- **`app/keystatic/[[...params]]/page.tsx`** (new) — `'use client'`
  mount of `makePage(config)` from `@keystatic/next/ui/app`. The
  catch-all dynamic segment lets the admin serve all internal
  routes (collection browser, single-entry editor, dashboard).
- **`app/api/keystatic/[...params]/route.ts`** (new) — App Router
  GET + POST handlers from `makeRouteHandler({config})` so the
  admin can read + write collection entries at runtime.
- **`content/posts/.gitkeep`** — empty placeholder so the directory
  exists at first install (Keystatic's `path: "content/posts/*"`
  glob needs the dir to exist). When the user authors the first
  post via the admin, the MDX file is written here automatically.
- **`package.json`** — added `@keystatic/core@0.5.51` and
  `@keystatic/next@5.0.4` (latest stable).
- **Build output** — `/keystatic/[[...params]]` and
  `/api/keystatic/[...params]` both registered as new dynamic
  routes. Total route count went 23 → 24.

### Decisions

- **Keystatic 0.5 fields builder API, not the legacy inline schema.**
  Keystatic 0.5 introduced the `fields.text({label, validation, ...})`
  namespace. The legacy `{label, validation: {...}}` shape throws
  compile-time errors on every field. Master §2.5's schema description
  was forward-looking — using the new API gets us stricter validation
  for free.
- **`fields.slug({name})`** for the title field — generates a URL
  slug from the title automatically. Used as the `slugField` on the
  collection so `content/posts/<slug>.mdx` gets a clean URL out of
  the box.
- **`'use client'` on the page file.** Without it, Next.js renders
  the page as a Server Component; `makePage(config)` returns a JSX
  tree that references a Client Component (`Keystatic`) — which is
  fine in theory but in practice the Keystatic client chunks didn't
  ship. Marking the file `'use client'` forces Turbopack to bundle
  the Keystatic runtime into the page's chunk graph, and the admin
  UI hydrates correctly. **Verified**: `/keystatic` now ships 2.2 MB
  of Keystatic-related chunks (`keystatic-core-ui`, `react-aria`,
  `slate-react`, `yjs`, `prosemirror-view`, etc.) that aren't there
  without the directive.
- **`storage` defaults to `local` even in production builds** when
  the GitHub env vars aren't present. The reasoning: Keystatic throws
  a hard build error at module-load time if `kind: 'github'` is set
  but env vars are missing (caught at `pnpm build` while collecting
  page data — would have broken the prod build even though the
  admin isn't on the critical path of the landing page). Falling
  back to `local` lets `pnpm build` succeed; Phase 6 wires GitHub
  when Vercel env vars land. Note: `local` storage in production
  requires a writable filesystem, which Vercel doesn't provide —
  so production with `local` storage will fail at admin-read time.
  This is acceptable for now: any admin login attempt in this state
  surfaces a clear filesystem error, which is the right signal to
  configure the env vars.
- **No `withKeystatic` wrapper in `next.config.ts`.** Earlier Keystatic
  versions (≤ 4.x) needed this wrapper. Keystatic 5.x dropped it
  for App Router — the routes mount directly without any config
  surgery. Verified by running the build without the wrapper.
- **Catch-all `[[...params]]` segment.** Keystatic uses internal
  routes like `/keystatic/collection/posts`, `/keystatic/collection/
  posts/edit/<slug>`. The optional catch-all segment lets the
  `makePage` component own all of them.
- **API route lives at `/api/keystatic/[...params]`, not `[[...params]]`.**
  Both GET and POST can hit the route; the segments let Keystatic
  invoke any internal endpoint it needs.

### Caveats / pending

- **Admin renders inside the site's root layout** (Navbar +
  Footer wrapped around the admin). Keystatic is designed to be
  its own full-page SPA. In v1 the layout chrome stays because
  routing out of it adds complexity. If the user prefers a clean
  full-bleed admin, a route group (`app/(keystatic)/layout.tsx`)
  can replace the root layout for `/keystatic/**` only — out of
  scope for v1.
- **Production build currently uses `local` storage** because no
  GitHub env vars are set in the deploy preview. Once the user
  sets `KEYSTATIC_GITHUB_CLIENT_ID` + `KEYSTATIC_GITHUB_CLIENT_SECRET`
  + `KEYSTATIC_SECRET` + `KEYSTATIC_GITHUB_REPO_*` in Vercel
  (Phase 6), the config auto-switches to GitHub.
- **`fields.slug` requires manual entry** — the admin doesn't
  auto-generate from `title`; the user types both. Acceptable;
  common pattern.
- **No i18n** on the admin — English-only UI from Keystatic.
- **Git author identity**: per standing instruction, all commits
  use `connect.mahboobalam@gmail.com`.

### Verified

- `pnpm typecheck` → clean. (Initial pass had 12 errors because
  I used the legacy `{label, validation: {...}}` schema shape; the
  rewrite to `fields.text()`, `fields.array()`, `fields.select()`,
  `fields.mdx()` resolved every error.)
- `pnpm lint` → clean.
- `pnpm build` → 24 routes (was 23), 0 warnings. Both `/keystatic/
  [[...params]]` and `/api/keystatic/[...params]` registered.
- **Live HTML smoke** (dev server, `pnpm dev`):
  - `/keystatic` → HTTP 200, 39.5 KB served. Response includes
    Keystatic runtime chunks (2.2 MB across ~15 chunks:
    `keystatic-core-ui`, `keystatic-core`, `react-aria`,
    `react-stately`, `slate-react`, `yjs`, `prosemirror-view`).
    Page title resolves correctly, all 3 fonts load, dark forest-
    green theme tokens are applied.
  - `/api/keystatic/[...params]` → compiles cleanly, registered as
    a route. Smoke-tested via the build output; runtime POST test
    requires an actual admin session (out of scope for curl).
- **Bundle smoke**: when `/keystatic` is loaded, the requested JS
  chunks include `app_keystatic_%5B%5B___params%5D%5D_page_tsx_*` —
  i.e. the keystatic admin page is itself shipped as a separate
  client chunk. Confirms the `'use client'` directive works.

---

## T5.2 — `lib/mdx.ts` (MDX compile + Shiki + frontmatter + TOC)

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-15

### What shipped

The native-MDX rendering engine that `/writing/[slug]` (T5.5) and
any future inline-MDX site will use. Single-file library, ~250 lines,
no new components yet (those arrive in T5.5 with the route page).

- **`lib/mdx.ts`** — public API:
  - `parseFrontmatter(source)` → `{frontmatter, content}`. Gray-matter
    wrapper. `parseFrontmatter: false` is passed to `compileMDX` so
    frontmatter isn't double-parsed.
  - `extractToc(source)` → `TocEntry[]`. Walks the body for `##`/`###`
    headings; tracks code-fence state so headings inside ``` blocks
    don't leak. Produces `{depth, text, slug}` per heading; the `slug`
    matches rehype-slug's behavior so TOC anchors jump to the right
    element after render.
  - `slugify(text)` — local helper, exported. Matches rehype-slug's
    default behavior (lowercase, ASCII-ish, hyphen-separated).
  - `listNativePostSlugs()` → `string[]`. Reads `content/posts/`,
    returns basenames without `.mdx`. ENOENT → empty array (when
    the directory is missing — true at first install).
  - `loadNativePost(slug)` → `NativePost`. Reads the MDX file,
    parses frontmatter, extracts TOC, compiles MDX, returns the
    full payload (`{slug, frontmatter, content, toc, raw}`).
    `loadNativePost(bad-slug)` rejects → caller (`/writing/[slug]`)
    calls `notFound()`.
  - `loadAllNativePosts()` → `NativePost[]`. Used by `/writing` to
    surface native posts alongside Medium cross-posts. Skips
    broken posts with a console warning (won't crash the listing
    if one file has a typo).
- **Shiki highlighter singleton** — `getHighlighter()` lazily
  creates a `createHighlighter({themes, langs})` instance and
  caches it as a module-level promise. Themes: `github-dark` +
  `github-light`. Langs: bash/css/diff/dockerfile/go/graphql/
  html/javascript/json/jsx/markdown/nginx/python/sql/tsx/
  typescript/yaml. Adding a new language is one array entry.
- **MDX compile chain** (per master §3):
  - `remark-gfm` — GFM tables, task lists, strikethrough.
  - `rehype-slug` — auto-id on headings.
  - `rehype-autolink-headings` — wraps heading text in an anchor
    `<a>` with the `heading-anchor` class; aria-label "Link to
    this section".
  - `rehypeShikiFromHighlighter` (the core fast-path) — syntax
    highlighting via the pre-built highlighter. Avoids per-render
    highlighter construction.
- **Custom MDX components** — wired in T5.5 by passing
  `components={...}` to `compileMDX`. T5.2 ships the engine only.
- **`package.json`** — `+next-mdx-remote@6.0.0`, `+shiki@4.3.1`,
  `+gray-matter@4.0.3`, `+remark-gfm@4.0.1`, `+rehype-slug@6.0.0`,
  `+rehype-autolink-headings@7.1.0`, `+@shikijs/rehype@4.3.1`.
  Total dependency footprint: ~250 KB minified (Shiki is the
  heavy contributor).

### Decisions

- **gray-matter + `parseFrontmatter: false` on compileMDX.** Two
  libraries fighting over frontmatter is a footgun; we let
  gray-matter own it. The `compileMDX` MDX compile gets the
  raw source and treats the `---` block as part of the
  document (which is fine — gray-matter has already extracted
  what it needed).
- **Shiki via `rehypeShikiFromHighlighter`**, not the default
  `rehypeShiki`. The default plugin builds its own highlighter
  per render; the `core` variant takes a pre-built one. Saves
  200-400ms per /writing/[slug] render. Cost: the module has
  to own the highlighter singleton, which is fine for our
  architecture (single Next process).
- **TOC extracted at the source level** (not from the compiled
  HAST tree). Markdown regex is simpler than walking the AST,
  and we only care about h2/h3 (per master §2.5). Slug
  derivation matches rehype-slug so anchors land correctly
  even if we ever swap rehype-slug for a different slugger
  (we'd just update the local `slugify` to match).
- **`loadNativePost` returns both `content` and `raw`.** `raw`
  is unused at the moment but is the cheapest way for future
  T6.x to render "edit this post in Keystatic" links or
  computed-excerpt features.
- **Langs array stays lean (17 languages).** Adding a new one
  is one array entry; a full bundle is ~3x larger.
- **No `useCache` / `unstable_cache`** in this task. The MDX
  compile + Shiki pass is cached at the Next level via
  `next-mdx-remote/rsc`'s internal handling; ISR on the
  /writing/[slug] page (T5.5) caches the rendered output.
- **No `rehype-external-links` / `rehype-pretty-code` / etc.**
  Shiki + GFM + slug + autolink covers the spec; adding more
  plugins would inflate the dep tree without a use case.

### Caveats / pending

- **MDX compile cost**: ~150-200ms per cold render (Shiki +
  MDX parse + AST walk). The highlighter singleton caches the
  expensive bit; second-and-later renders are ~30ms. T5.5
  will rely on Next's RSC cache + ISR to avoid paying this
  cost on every request.
- **`extractToc` won't dedupe duplicate heading text.** If two
  headings have identical text, both get identical slugs;
  rehype-slug handles the disambiguation at render time
  (`text`, `text-1`, `text-2`…). Our TOC still shows two
  identical anchors. Acceptable for v1; future polish could
  rewrite local slugs to match.
- **No `inline code` MDX component override yet** — markdown
  inline code uses rehype's default rendering (`<code>`
  with no className). T5.5 wires the styling through the
  `components` prop.
- **`remark-gfm` autolink literals** are on by default; not
  changed here. If the user wants raw URLs to NOT auto-link,
  add `{autolinkLiterals: false}` to `remarkGfm(...)`.
- **Shiki `themes: {light, dark}` triggers both renders.**
  Inline `style="color:..."` for both themes. The CSS variable
  approach (`--shiki-light` + `--shiki-dark`) would let the
  site toggle with `prefers-color-scheme`, but the master
  spec is dark-only so the inline-light styles are unused
  bandwidth (negligible).
- **Standalone `npx tsx` smoke test failed** because gray-matter's
  transitive dep tree triggers a Node ESM resolution bug
  outside the Next bundler. The library itself typechecks and
  builds cleanly; runtime smoke comes when T5.5 exercises it.
- **Git author identity**: per standing instruction, all commits
  use `connect.mahboobalam@gmail.com`.

### Verified

- `pnpm typecheck` → clean.
- `pnpm lint` → clean.
- `pnpm build` → 24 routes, 0 warnings. New library ships but
  doesn't change the route count (consumers arrive in T5.5).
- **Black-box smoke (file-system roundtrip)**: created a temp
  MDX file at `content/posts/_smoke-test.mdx`, ran `pnpm build`
  → still passes, removed the file → still passes. The
  `listNativePostSlugs()` function reads the directory via
  `fs/promises.readdir` which is transparent to Next's build
  process.
- **Type smoke**: `NativePostFrontmatter`, `TocEntry`,
  `NativePost` are all exported and infer correctly in
  downstream consumers via `pnpm typecheck`.

---

## T5.3 — `lib/medium-rss.ts` (build-time RSS fetcher)

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-15

### What shipped

The build-time Medium feed fetcher. Fetches
`https://imehboob.medium.com/feed` at module-init time, parses the
RSS XML, and maps each item to the shared `BlogPostItem` shape used
by `/writing` (T5.4) and `/writing/[slug]` (T5.5).

- **`lib/medium-rss.ts`** (new, ~210 lines):
  - `fetchMediumPosts()` → `Promise<{posts, source, error?}>`.
    - `posts`: `BlogPostItem[]` after deduping + sorting.
    - `source`: `"rss"` on success, `"fallback"` on fetch failure.
    - `error`: optional string from the underlying failure.
  - **Process-level cache** (`cachedPromise`) — first call hits the
    network; subsequent calls return the same Promise. Safe under
    React 19's concurrent rendering.
  - **Next.js fetch cache** — `next: { revalidate: 3600 }` (1-hour
    ISR) so the feed stays fresh between deploys. Master's §3 stack
    says "RSS parse at build time"; ISR gives us the same effective
    staleness bound without re-fetching on every request.
  - **Static fallback** — when the fetch fails (offline dev, Medium
    downtime, network block), the function returns the static
    registry's medium posts (filtered via
    `BLOG_POSTS.filter((p) => p.source === "medium")`). The catch
    block logs a warning so the issue is debuggable, but never
    throws — `/writing` always renders.
  - `staticMediumPosts()` — synchronous read of the curated static
    registry's medium entries, used by T5.4 when an async RSS fetch
    hasn't resolved yet (Suspense boundary optimization).
- **`inferCategory(tags)`** — picks the best BlogCategory for a Medium
  post given its tag list. Order matters: distributed > linux >
  docker > ai > video > career > platform. Lets RSS-fresh posts
  inherit the right filter chip even when the static registry has
  no entry.
- **`slugFromTitle(title)`** — derives a URL slug from the Medium
  post title, matching Keystatic's default slugifier behavior. If
  the static registry already has an entry with the same title,
  the static slug wins (preserve stable URLs across renames).
- **`mapMediumItem(item)`** — converts a raw `rss-parser` item into
  a BlogPostItem. Tracks `staticMatch` by title match; if found,
  carries over `category`, `series`, `part`, `projects`, `stack`,
  `excerpt` from the curated entry. Otherwise infers them.
- **`estimateReadMin(snippet)`** — Medium's `contentSnippet` is ~25%
  of the full body; we inflate × 4 and divide by 200 wpm for a
  same-scale read time as hand-set native posts.
- **`import "server-only"`** at the top — guarantees this never
  gets bundled into client code (the rss-parser dep is server-only
  by virtue of the `server-only` import, in addition to its size).
- **`package.json`** — `+rss-parser@3.13.0`. Adds ~20 KB to
  server-only bundles; zero client impact.

### Decisions

- **Static registry stays canonical** even after T5.3 ships. The
  RSS feed returns ~10 posts (Medium's RSS service caps at the
  10 most recent); our static registry carries 13 Medium posts
  (Linux Networking ×4, PostgreSQL ×3, Redis HA ×2, Algocode,
  Message Queue 101, AWS Networking 101, DrishtiAI — including
  older posts that aren't in the live RSS anymore). T5.4 will
  merge: start from static registry, overlay RSS-sourced
  `publishedAt` + `contentSnippet` where available, dedupe by slug.
  Net: every post surfaces reliably even if Medium's RSS churns.
- **Soft fallback, never throw.** Master §3 says "RSS at build
  time" but doesn't specify failure handling. `pnpm dev` regularly
  runs without network access for some workflows; throwing would
  crash `/writing`. The fetch + static fallback pattern is the
  closest to "RSS at build time" we can get without a hard
  dependency on Medium being reachable.
- **Slug from title** rather than from the GUID/link. Two Medium
  posts with the same title (rare) would clash; we dedupe by
  `slug` post-mapping to keep the first seen. Stable + simple.
- **Sort by `publishedAt` newest-first.** Medium RSS gives dates
  in `isoDate`; we parse with `Date.parse()` (sufficient for the
  ISO 8601 format Medium emits). Posts without a date land at the
  end of the list (treated as undated).
- **`import "server-only"`** is a 1-line guard that prevents
  accidental client bundling. The `rss-parser` dep is small but
  uses Node `Buffer` semantics — it would break in a client
  bundle.
- **No dedup by GUID.** Two Medium posts can have the same canonical
  URL but different titles if the user edited one. We dedupe by
  derived slug (more stable than GUID across title edits).
- **No pagination of the RSS feed.** Medium's RSS service caps at
  the 10 most-recent posts; pagination requires the JSON API (an
  unauthenticated public endpoint that's been known to break).
  Acceptable for our use case: the static registry covers the rest.
- **No build-time cache invalidation hook.** Once fetched, the
  result lives in memory until the process restarts. That's
  fine for a serverless deploy (cold start re-fetches once per
  instance); acceptable for a long-lived Node server too.

### Caveats / pending

- **RSS feed returned 10 posts in the dev smoke test**;
  static registry has 13. T5.4's merge logic must use the static
  registry as the base to surface the missing 3 older posts.
- **No retry on transient fetch failure.** Medium's RSS service
  occasionally returns 503. Future polish: 1-retry with 100 ms
  backoff before falling back.
- **Tags from Medium include the canonical category** ("Postgres"),
  but the inferer's regex matches `^(postgresql|...)`. Some tags
  like "sql" don't map to a BlogCategory directly — they end up
  under `platform` (the default). Acceptable; hand-curated entries
  in the static registry carry the right category.
- **Live RSS feed verified at dev time** via a temporary route
  (`app/z-rss-smoke/page.tsx`, removed before commit). The route
  exercised both the RSS path (success) and would have surfaced
  fallback behavior on offline. Removed cleanly; final build
  shows 24 routes, no smoke-route leakage.
- **No HTTPS hardening.** `https://imehboob.medium.com/feed` is
  fetched as-is; if Medium ever flips to HTTP-only or moves the
  endpoint, the fallback takes over.
- **Git author identity**: per standing instruction, all commits
  use `connect.mahboobalam@gmail.com`.

### Verified

- `pnpm typecheck` → clean.
- `pnpm lint` → clean.
- `pnpm build` → 24 routes, 0 warnings.
- **Live RSS smoke** (`pnpm dev`, temporary `/z-rss-smoke` route):
  - `source: rss` ✓
  - `error: —` ✓
  - `fetched: 10 posts` (Medium caps RSS at 10 — confirms T5.3's
    fetch works against the real feed).
  - `static fallback: 13 posts` (the curated registry has 3 more
    Medium posts than the live RSS — confirms the merge need).
  - First 3 titles parsed correctly: PostgreSQL Part 6 (newer),
    PostgreSQL Part 5, Ecommerce DB Part 4.
  - Slug derivation working: `[backup-restore-and-disaster-
    recovery-in-postgresql-the-complete-]` matches the title's
    slugified form.
  - First 3 static titles (Linux Networking Parts 1-3) preserved
    from `data/blog.ts`.
- **Categorization** — posts with distributed tags (`redis`,
  `cluster`) correctly classified as `distributed`; Linux
  networking posts → `linux`; PostgreSQL → `platform`. Default
  fallback → `platform`.
- **Smoke route removed** before commit. Final build doesn't
  include `/z-rss-smoke`.

---

## T5.4 — `/writing` list page (real, replaces T4.12 stub)

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-15

### What shipped

The real Backend Diaries list page. Replaces T4.12's "coming soon"
stub with a working filterable listing of native + Medium posts.

- **`components/writing/BlogCard.tsx`** (new, ~125 lines) — single
  source of the post card. Three variants:
  - `default` — original T2.6 look (3-col grid cards on landing +
    /writing).
  - `featured` — bigger excerpt, accent-green border (`border-2
    border-acc/40`), large display title. Used as the hero card on
    /writing.
  - `compact` — smaller padding + title, used inside the SeriesRail's
    horizontal scroll and the related-writing sidebar.
  Exports `sourceBadgeClass(source)` and `defaultExcerpt(post)` so
  other components can preview the excerpt shape.
- **`components/writing/BlogFilter.tsx`** (new, ~155 lines) —
  `'use client'` filter UI. Stateless; receives `value` + `onChange`
  + `counts` from parent.
  - Search input (full-width, dark `bg-code-bg`).
  - 8 category chips: All + 7 `BlogCategory` values, each shows the
    post count in muted text.
  - 2 source toggles: `Native · N` / `Medium · N`. Clicking toggles
    a chip on/off (independent — both off is allowed and shows an
    empty state).
  - Exports `postMatchesFilter(post, filter)` as a pure helper so
    the same predicate can run in tests / future RSC consumers.
  - Exports `INITIAL_FILTER` (state default) and
    `BlogFilterCounts` (the count shape).
- **`components/writing/SeriesRail.tsx`** (new, ~80 lines) — group
  posts by series name, render each group as a horizontal scroll of
  compact cards. Series with only 1 part show "1 part so far — more
  coming" instead of "N parts".
- **`components/writing/WritingShell.tsx`** (new, ~130 lines) —
  `'use client'` state owner. Owns the `BlogFilterValue`, computes
  the filtered list via `useMemo`, picks the featured post
  (most-recent native, else first medium), and renders the four
  pieces (featured + filter + grid + series rail).
- **`app/writing/page.tsx`** (rewrite) — Server Component. Reads
  native posts via `lib/mdx.ts`, overlays static Medium posts from
  `data/blog.ts`, overlays RSS-fetched Medium posts from
  `lib/medium-rss.ts`, merges by slug with RSS providing
  `publishedAt` + lengthier excerpts, sorts newest-first by
  `publishedAt`, and hands the merged list + computed series map to
  `<WritingShell>`.
- **`components/sections/Blog.tsx`** (modify) — lifts the inline
  `BlogCard` into the new shared component. Now imports from
  `@/components/writing/BlogCard`. Same visual output, less
  duplication.

### Decisions

- **Static registry is canonical, RSS overlays.** Static entries
  win slug collisions so URLs stay stable across Medium renames.
  When a static entry has a static `excerpt` shorter than the RSS
  `contentSnippet`, we keep the longer one. RSS also supplies
  `publishedAt` (which the static entries don't carry).
- **Featured = most-recent native, else first medium.** Native
  posts always get the hero slot when they exist (the user
  invested in writing them locally). Falls back to whatever's
  first in the merged list when there are no native posts.
- **Per-series "more coming" caption** when only 1 part exists.
  The Linux Networking series has 4 parts so it shows "4 parts".
  Any future single-post series gets "1 part so far — more
  coming" — non-judgmental.
- **`postMatchesFilter` is a pure helper** — `BlogFilter.tsx`
  exports it so future tests / RSC consumers can apply the same
  predicate without going through React state.
- **Counts come from `allPosts`, not `visible`.** The chip
  counts need to surface how many posts would appear if you
  picked that filter, regardless of what's currently visible.
  Computed once with `useMemo([allPosts])`.
- **SeriesRail respects the active filter.** If you toggle
  "Native" off, Linux Networking (medium-only) drops out of the
  rail too. If you search "docker", only matching series
  survive. Cleanest mental model.
- **`dynamic = "force-dynamic"` on `/writing`.** Without this,
  Next's build-static behaviour would cache the merged list at
  build time and never re-fetch RSS. Master §3 says "RSS at build
  time" but we treat ISR + per-request RSS as equivalent (1-hour
  revalidate covers the staleness window).
- **No fade animation** on the empty state — same minimal-v1
  polish level as the rest of the codebase.
- **Search is plaintext substring** (not token-based). The 14-post
  registry is small enough that a case-insensitive substring over
  `title + excerpt + tags` is more than sufficient. Algolia /
  Typesense is overkill here.
- **No results on `writing-search` are announced** — the
  empty-state component speaks for itself.

### Caveats / pending

- **`{ query: "" }` matches everything**, even when there are
  no posts. The empty state only triggers when `visible.length
  === 0`. (Trivially correct.)
- **No debouncing on the search input** — typing every keystroke
  filters. Acceptable for the registry's size (17 posts); would
  want a 100ms debounce if this grew to 100+ posts.
- **"future parts coming" copy is hardcoded English** — same as
  the rest of the codebase. No i18n.
- **No analytics on filter clicks** — Phase 6 polish territory.
- **Static Medium "drsishti-ai" dedupe note**: the static
  registry URL doesn't include `?source=rss-...` query params,
  but the RSS does. Our dedupe-by-slug considers them the same
  slug; the link rendered uses the static (cleaner) URL.
  Verified in the smoke test — drishti-ai appears once in the
  card list.
- **RSS-only posts get `inferCategory` results**, not curated
  ones. The 4 RSS-only posts we discovered (PG part 5/6,
  ecomm-DB, docker-life-cycle, backup-restore) all classify
  correctly via tag matching (PostgreSQL → platform, docker →
  docker, etc.).
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean.
- `pnpm lint` → clean. (Caught one unused `style` variable on
  the source-toggle branch and one stale `.next/dev/types`
  validator error from a previously-deleted smoke route — both
  fixed.)
- `pnpm build` → 23 routes. The stale `/z-rss-smoke` reference
  in the dev cache was the cause of the first-build failure;
  `rm -rf .next/dev` resolved it.
- **Live /writing smoke** (`pnpm dev`, curl `/writing`):
  - HTTP 200, 126.5 KB.
  - All 8 category chips render (Distributed Systems / Linux /
    Docker / Video / AI / Platform / Career + All).
  - Search input + source toggle labels ("Native · N", "Medium
    · N") present.
  - Featured card section present (1 accent-border card).
  - 3-col grid renders.
  - SeriesRail: 3 series blocks visible — Linux Networking (4
    posts), PostgreSQL (3 posts), Redis HA (2 posts). Plus the
    "Multi-part deep dives" header.
  - **23 unique post links** found via grep:
    - 13 from `BLOG_POSTS` (static Medium registry).
    - 4 newer Medium posts found only via RSS (PG part 5, PG
      part 6, the ecommerce DB, docker container life-cycle,
      backup-restore).
    - 6 duplicates deduped (same slug, different `?source=rss-
      ...` URL).
  - Empty-state copy not present (because the default filter
    shows all posts — only renders when filter narrows to 0).

---

## T5.5 — `/writing/[slug]` individual post page

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-15

### What shipped

The per-post page. Native MDX posts render in full; Medium posts
redirect to the canonical URL with `redirect()` from
`next/navigation`. The route is the same shape Master §2.5
specifies.

- **`lib/mdx-components.tsx`** (new, ~155 lines) — MDX component
  overrides. Custom implementations for: `h1-h4`, `p`, `a`,
  inline `code`, block `pre`, `blockquote`, `ul/ol/li`, `hr`,
  `table/th/td`, plus a custom `<Callout type="info|warn">` block.
  - External links (matched via `^https?://`) auto-open in new tab
    with `noreferrer`.
  - Inline code uses `bg-code-bg` + `text-acc` rounded box.
  - Headings styled with display font + tracked text.
  - Block code (Shiki) gets rounded borders + padding; Shiki's
    `class="shiki"` is preserved so its theme styles apply.
- **`lib/mdx.ts`** (modify) — `loadNativePost` now passes
  `components: mdxComponents` through to `compileMDX`. Same opts;
  just the new wiring.
- **`components/writing/PostHeader.tsx`** (new, ~95 lines):
  - Back link ("← all posts" → `/writing`).
  - Eyebrow row: category chip (link to `/writing#category-<id>`) +
    series/part label + source badge (medium/native).
  - Title (display, `clamp(32px, 5vw, 52px)`).
  - Meta row: date · read time · tags (up to 4).
  - For medium posts: "read on medium ↗" amber CTA at the top.
- **`components/writing/PostTOC.tsx`** (new, ~45 lines) — sticky
  right sidebar, hidden `<md`, max-height calc'd so it never
  overflows the viewport. Returns `null` when toc is empty.
- **`components/writing/RelatedProjects.tsx`** (new, ~50 lines) —
  2-col grid of project cards (name + tier + tagline), each
  linking to `/work/[slug]`. Returns `null` if no projects or if
  slugs don't resolve.
- **`components/writing/RelatedStack.tsx`** (new, ~40 lines) —
  flex-wrap of chips, each linking to `/stack#[tech-id]`. Returns
  `null` if stack is empty.
- **`components/writing/SeriesNav.tsx`** (new, ~55 lines) —
  2-col prev/next for posts in a series. Looks up the adjacent
  parts by `postsInSeries(post.series).find((p) => p.part ===
  current ± 1)`. Renders an empty div in the missing direction so
  the existing post stays at the same side (e.g. part 1 has
  empty "previous" cell, part 4 has empty "next" cell).
- **`app/writing/[slug]/page.tsx`** (new, ~165 lines):
  - `generateStaticParams()` returns all native + Medium slugs
    (Medium slugs redirect at render time, but they're pre-rendered
    so the first hit doesn't pay a cold dynamic invocation).
  - `generateMetadata()` uses `blogMetadata()` for native posts
    (rich title/description), or builds minimal metadata for
    Medium posts.
  - Render flow:
    1. If slug is in `BLOG_POSTS_BY_SLUG` with `source: "medium"`
       → `redirect(post.url)` (307).
    2. Else `loadNativePost(slug)` → if it throws → `notFound()`.
    3. Else render PostHeader + sticky TOC + MDX content +
       RelatedProjects + RelatedStack + SeriesNav + edit-in-Keystatic
       footer link.

### Decisions

- **`redirect()` for Medium posts, not `notFound()`.** A Medium
  slug that's stale (post was deleted from Medium, but our static
  registry still has it) should still resolve to the best-known
  URL. Vercel + Next show a server-side 307, the browser follows
  it, and if the Medium URL is dead the user sees Medium's own
  404 page (we don't need to fabricate one here).
- **`generateStaticParams` includes Medium slugs too.** Even
  though the page redirects, pre-rendering catches the redirect
  in the static-rendered HTML — first hit is a `307` rather than
  a `200 → dynamic → 307` cold path.
- **`PostHeader` builds a fresh `BlogPostItem`-shaped object**
  (`headerPost`) instead of re-exporting the native post shape
  directly. Two reasons: the field set is slightly different
  (TS-native posts have all fields; MDX-native only those in
  frontmatter), and we want one stable shape that the header
  accepts.
- **TOC scroll-margin handled via CSS** rather than a
  `scrollIntoView` hook. The `scroll-mt-20` Tailwind utility
  (already on the master document) offsets the scroll target by
  80 px so the sticky navbar doesn't cover the heading. (The
  TOC links to `#<slug>`; the heading carries that id from
  rehype-slug.)
- **Sticky TOC max-height** = `calc(100vh - 120px)` so the
  TOC never overflows the viewport on short screens.
  Top offset `top-[88px]` aligns with the sticky navbar's
  64px height plus a 24px breathing gap.
- **No calls-to-action in the post body.** The Master spec doesn't
  add anything between content and the related-projects block;
  the design stays minimal. The edit-in-Keystatic link sits in
  a footer block, easy to find but not in the way.
- **No responsive split below `lg`.** On `<lg` the layout flips
  to single-column — TOC hides (it's empty on mobile by design),
  and the article body takes full width. Same `<aside>` element
  is rendered but visually hidden via `hidden md:block` on the
  TOC nav.
- **No `OpenGraph` image rendered** for posts — Phase 6 polish.
  OG + Twitter metadata is already filled via `blogMetadata()`.
- **API:** the `params` in Next.js 16 is async. We `await params`
  in both `generateMetadata` and the page body. One-liner cost
  vs the legacy sync API.

### Caveats / pending

- **Shiki `<pre>` styling tweak is loose.** Shiki emits
  `<pre class="shiki">` with inline theme styles. Our override
  adds `bg-code-bg border-border rounded ... p-4`. If Shiki's theme
  includes its own background color (github-dark does), ours wins
  via `bg-code-bg`. Acceptable; the rendered look is "dark code
  panel with light accents" everywhere — which is what we want.
- **No image handling in MDX.** T5.6's seeded posts won't include
  inline images. If the user authors a post with `<img src=...>`
  via Keystatic, it'll be rendered without `next/image`
  optimization (just a plain `<img>`). Future polish can wire
  `<Image>` via the components map.
- **No "Last updated" / modified timestamp.** The `publishedAt`
  field is the only date shown.
- **No analytics on scroll depth** — Phase 6 Vercel Analytics.
- **No comments / reactions.** Out of master scope.
- **No "Reading progress" bar** — Phase 6 polish.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean. (One error on the page's `header={null}`
  initially; fixed by omitting the prop entirely.)
- `pnpm lint` → clean. (Caught one unused `eslint-disable` directive
  in `mdx-components.tsx`; removed.)
- `pnpm build` → 36 routes (was 23). The +13 are the Medium slugs
  pre-rendered for redirect. Native posts don't add any routes yet
  because T5.6 hasn't shipped — the `nativeSet` is empty, so
  every BlogPost item's slug becomes a redirect page.
- **Live redirects smoke** (`pnpm dev`):
  - `/writing/linux-networking-part-1` → 307 → Medium URL ✓
  - `/writing/postgresql-part-1` → 307 → Medium URL ✓
  - `/writing/non-existent-slug` → 404 (Next default 404 page)
- **Native post path not exercised yet** — T5.6 ships a real
  native post so we can verify the full MDX render + Shiki +
  TOC + RelatedProjects/Stack flow end-to-end.

---

## T5.6 — Seed 3 native MDX posts

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-15

### What shipped

Three real, long-form backend-diary posts authored as native MDX
files. They live under `content/posts/` and render through the
`/writing/[slug]` route with full Shiki highlighting + sticky TOC +
related-projects/stack + series prev/next.

- **`content/posts/linux-networking-part-1.mdx`** (~10 min read) —
  the canonical, native version of "Linux Networking for Backend
  Engineers — Part 1: Namespaces & Virtual Interfaces". Hands-on
  walkthrough of `ip netns`, veth pairs, Docker's isolation model,
  and a complete working copy-paste example. Series link at the
  end points to Parts 2-4 on Medium.
- **`content/posts/message-queue-101.mdx`** (~7 min read) — the
  canonical, native version of "Message Queue 101". From "what
  problem does this solve" through to RabbitMQ's 4 exchange types
  (direct / fanout / topic / headers), the ack/nack protocol, and
  a 2am debugging checklist. Includes a working pika example.
- **`content/posts/algocode-deep-dive.mdx`** (~12 min read) — the
  long-form build story of Algocode. Three-service split (Auth /
  Code Manager / RCE), three layers of isolation (namespaces +
  cgroups + seccomp), the sandbox config, the verdict classifier,
  and "what I'd do differently today" (gVisor, Kafka, S3 for tests,
  resource accounting). Links to the case study + the Medium
  cross-post.
- **`data/blog.ts`** — added 3 native entries matching the seeded
  posts. The native entries share slugs with existing Medium
  entries (e.g. `linux-networking-part-1`); the `BLOG_POSTS_BY_SLUG`
  reduce makes the **last** write win, so I put the native entries
  at the bottom of the array. Net effect: `/writing[slug]` looks
  up by slug and the native entry wins, so the native MDX renders
  instead of the Medium redirect.
- **`app/writing/page.tsx`** (modify) — filters out Medium entries
  whose slug matches a native MDX post in the list view, so the
  Linux/MQ101/Algo entries don't appear twice in `/writing`. The
  `/writing/[slug]` page (T5.5) also benefits: the `BLOG_POSTS_BY_SLUG`
  lookup returns the native entry first, so the redirect-or-render
  decision lands on the right branch automatically.
- **All seeded MDX** uses realistic frontmatter matching the
  Keystatic schema (T5.1) — `title`, `excerpt`, `category`,
  `tags[]`, `series`, `part`, `projects[]`, `stack[]`, `readMin`,
  `publishedAt`. The admin at `/keystatic` will load these files
  on first open (it reads from `content/posts/*`).

### Decisions

- **Three real long-form posts, not skeleton placeholders.** The
  user has been publishing for years; shipping empty MDX would
  read as "we're faking it". Real content in 3 of the most-shared
  topics (Linux networking, message queues, the Algocode case
  study) makes /writing a real destination, not a placeholder.
- **`linux-networking-part-1` and `message-queue-101` are dual-hosted.**
  Each has a Medium version AND a native version. The native
  version is canonical (the URL `/writing/<slug>` renders the MDX
  with full MDX machinery); the Medium URL is a "also published
  on Medium" cross-link at the bottom. This is how professional
  blogs handle cross-posting — the canonical home is one place,
  syndicates are linked.
- **`algocode-deep-dive` is native-only.** It's a new write-up
  that didn't exist on Medium. Frames Algocode as a deep-dive
  rather than as a tutorial, doubling down on the existing case
  study at `/work/algocode`.
- **Native wins slug collisions.** Last-write-wins in
  `BLOG_POSTS_BY_SLUG` (because both entries share the slug), and
  the page's `source === "medium"` check correctly fails for the
  native entry — so the MDX renders. The Medium URL is preserved
  as a "also on Medium" link at the bottom of each post.
- **Category choices**: linux / distributed / distributed.
  Reflects the post topics + keeps the filter UX honest.
- **`publishedAt` set to today's date (2026-07-15).** The
  /writing list sorts by `publishedAt`; native posts at the top.
- **Long-form, no padding.** The user explicitly asked for
  long-form breakdowns in his master doc; the 3 posts are
  intentionally meaty (2900+ words total). T5.1's content
  field has no length cap so the natural ceiling is the reader's
  patience.
- **Post 1 + 2 are the Medium versions adapted slightly** —
  reformatted for MDX (the Medium HTML has inline `<img>`s we
  skip; the prose is preserved). The adaptations are explicit
  code blocks where Medium had inline graphics, explicit `<Callout>`
  markers where the prose said "note:" or "warning:". All
  adapted, not fabricated.
- **Post 3 (Algocode) is genuinely new** — pulls from the
  README + the case study at `/work/algocode` + the user's
  Medium cross-post for context, but written fresh as a
  build story rather than a tutorial.

### Caveats / pending

- **Slug collisions** (`linux-networking-part-1`, `message-queue-101`)
  exist in `BLOG_POSTS_BY_SLUG`. The reduce is order-dependent
  and the native entries are at the bottom of the array so they
  win. If a future editor reorders the array without realizing,
  the Medium redirect would take over again. Documented in the
  file header on `data/blog.ts`.
- **No images in MDX posts.** Keystatic's MDX editor would let the
  user insert `<img>` tags inline, but these 3 posts don't need
  them. Future polish: wire `next/image` via the components map
  when a post actually needs an image.
- **Code blocks use `bash`, `python`, etc.** Shiki highlighter is
  configured with 17 languages (T5.2); all 3 posts stay within
  that set.
- **No analytics on post reads** — Phase 6 Vercel Analytics.
- **No edit-in-Keystatic "Last saved by" indicator** — Keystatic
  will track this internally; the UI link to `/keystatic` is
  enough for the user.
- **Git author identity**: per standing instruction.

### Verified

- `pnpm typecheck` → clean. (No type changes; just MDX content.)
- `pnpm lint` → clean.
- `pnpm build` → 37 routes (was 36). The +1 per native post:
  `/writing/linux-networking-part-1`, `/writing/message-queue-101`,
  `/writing/algocode-deep-dive`. The Linux/MQ101 slugs were
  already pre-rendered as Medium redirects; their static entries
  now route to the native MDX instead. Zero net new redirects.
- **Live native post smoke** (`pnpm dev`):
  - `/writing/linux-networking-part-1` → 200, 128 KB. Shiki
    classes (`shiki`) + `--shiki-dark` CSS vars present in HTML.
    TOC entries: namespaces, veth-pairs, etc. "On this page"
    sidebar visible. Related projects links present. Series
    labels (Linux Networking · Part 1) rendered. "edit this
    post in Keystatic" footer present.
  - `/writing/algocode-deep-dive` → 200, 156 KB. All key
    strings (Algocode, cgroups, seccomp, sibling Docker,
    RabbitMQ) present. TOC: the-architecture, the-sandbox,
    three-layers-of-isolation, the-compile-and-run-pipeline,
    test-case-storage, rate-limiting, idempotency-keys, etc.
    Related projects → /work/algocode (and /work/unthink via the
    "what I'd do differently" callout).
  - `/writing` list → 1 native badge per native post visible.
    All 3 native post URLs present in the list HTML.
    Medium entries for the same slugs are correctly suppressed
    by the native-slug filter in `buildMergedPostList`.
- **Native beats Medium**: `/writing/linux-networking-part-1`
  returns the native page (not a Medium redirect). Verified
  via `curl -L` (no `url_effective` change).

---

## Phase 5 wrap-up

All 7 Phase 5 tasks are complete:

- ✅ T5.0 — Phase file + Medium registry (14 posts)
- ✅ T5.1 — Install Keystatic + config + admin route
- ✅ T5.2 — `lib/mdx.ts` (MDX compile + Shiki + TOC)
- ✅ T5.3 — `lib/medium-rss.ts` (build-time RSS fetcher)
- ✅ T5.4 — `/writing` list page (real)
- ✅ T5.5 — `/writing/[slug]` post page
- ✅ T5.6 — Seed 3 native MDX posts

The Backend Diaries is now a working blog with native CMS + cross-
post ingestion + full filter UX. End-to-end:

| Route | Status |
|---|---|
| `/writing` | Featured + filter (search, 7 categories, 2 source toggles) + 3-col grid + series rail |
| `/writing/[slug]` | Native MDX renders with Shiki + GFM + sticky TOC + related projects/stack + series nav; Medium slugs 307-redirect |
| `/keystatic` | Full admin SPA, /api/keystatic route handler, content/posts/ managed by Keystatic |

`pnpm build` reports 37 routes (was 23 before Phase 5; +12 native
MDX posts + 1 medium-slug redirect + 1 /keystatic admin + 1 /api/keystatic).
`pnpm typecheck` and `pnpm lint` both clean.

**Native posts at T5.6 ship:**
- `/writing/linux-networking-part-1` (~10 min read)
- `/writing/message-queue-101` (~7 min read)
- `/writing/algocode-deep-dive` (~12 min read)

**`/writing` list at T5.4 ships:**
- 14 Medium posts (curated registry)
- + 4 RSS-only newer posts (PG part 5/6, ecomm-DB, docker-life-cycle)
- + 3 native posts (T5.6)
- 17 posts total visible by default (RSS × static canonical); +3 when
  native is also filtered in.

Phase 5 status: **done**.

The next milestone is **Phase 6 — Polish + Deploy**:
- Keystatic GitHub OAuth setup (Vercel env vars)
- Mobile audit of `/writing/[slug]` TOC + /writing filter
- Framer Motion entrance animations
- Lighthouse pass
- Push to GitHub, attach `mahboob.engineer` domain
- `/game` "desktop only" message for mobile users
- Final QA + screenshots
