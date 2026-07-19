# Phase 31.2 — OG / favicon asset integration

Wiring the ChatGPT-generated assets (from `docs/OG-FAVICON-PROMPTS.md`)
into the live site. Replaces the `@vercel/og` dynamic generators
(`app/icon.tsx`, `app/opengraph-image.tsx`) with real static PNGs.

---

## What changes

| File | Today | After Phase 31.2 |
|---|---|---|
| `app/icon.tsx` | `@vercel/og` generates 32×32 "MA" | **Deleted** — replaced by static `/public/icon.png` + `/public/apple-icon.png` |
| `app/opengraph-image.tsx` | `@vercel/og` generates 1200×630 cards | **Deleted** — replaced by 3 static OG variants + `lib/og-helpers.ts` routes each page to its variant by URL param |
| `/public/favicon.ico` | doesn't exist (404) | New — generated from the icon.png |
| `/public/icon.png` | doesn't exist | New — 32×32 generated asset |
| `/public/apple-icon.png` | doesn't exist | New — 180×180 generated asset |
| `/public/og-default.png` | doesn't exist | New — 1200×630 personal/default card |
| `/public/og-writing.png` | doesn't exist | New — 1200×630 writing card |
| `/public/og-project.png` | doesn't exist | New — 1200×630 project template (titles baked-in per project) |
| `lib/og-helpers.ts` | `ogUrlFor({ title, description })` returns a query-param URL | Updated — returns the absolute path to the matching static PNG |
| `app/layout.tsx` | references `icon: "/icon"`, `shortcut: "/favicon.ico"`, `apple: "/apple-icon"` | Updated to point at the new static asset paths |
| `package.json` | @vercel/og listed | Remove `@vercel/og` |
| `pnpm-lock.yaml` | @vercel/og lockfile entry | Regenerated after dep removal |

---

## Tasks (one atomic commit each)

### T31.2.1 — Drop assets into `/public/`

- `/public/icon.png` — 32×32 PNG.
- `/public/apple-icon.png` — 180×180 PNG.
- `/public/og-default.png` — 1200×630 PNG (personal).
- `/public/og-writing.png` — 1200×630 PNG (writing surface).
- `/public/og-project.png` — 1200×630 PNG (project template).
- `/public/favicon.ico` — generated from icon.png via `sips -s
  format icns /public/icon.png --out /public/favicon.ico`
  (or `magick icon.png -resize 32x32 favicon.ico`).

### T31.2.2 — Rewrite `lib/og-helpers.ts`

```ts
// Before: ogUrlFor returns a query-param URL pointing at
// /opengraph-image (which @vercel/og renders on the fly).
//
// After: ogUrlFor returns the absolute URL of a static PNG.
// The caller passes `surface: "default" | "writing" | "project"`
// plus the page's title + description. The title + description
// get stamped onto the PNG **at generation time** (i.e. baked
// into each project PNG), not at runtime.

export type OgSurface = "default" | "writing" | "project";

export function ogUrlFor(_input: {
  title: string;
  description: string;
  surface: OgSurface;
}): string {
  // Caller ignores title/description for now — the PNGs are
  // pre-baked. This signature is kept so call sites in
  // app/log/page.tsx, app/work/[slug]/page.tsx, etc. stay
  // valid without changes.
  switch (_input.surface) {
    case "writing": return `${SITE_URL}/og-writing.png`;
    case "project": return `${SITE_URL}/og-project.png`;
    default:        return `${SITE_URL}/og-default.png`;
  }
}
```

Call-site change: every `ogUrlFor({ title, description })` in
`app/layout.tsx`, `app/log/page.tsx`, `app/work/page.tsx`,
`app/work/[slug]/page.tsx`, `app/stack/page.tsx`,
`app/writing/page.tsx`, `app/lets-connect/page.tsx` adds a
`surface:` field. Defaults to `"default"`. The writing
page passes `surface: "writing"`; project pages pass
`surface: "project"` (each project's title + tagline get
baked into a per-project PNG later — see T31.2.6).

### T31.2.3 — Delete `app/icon.tsx`

Removes the `@vercel/og` generator. Next.js metadata-file
convention picks up `/public/icon.png` automatically.

### T31.2.4 — Delete `app/opengraph-image.tsx`

Removes the second `@vercel/og` generator. The static
`og-default.png` / `og-writing.png` / `og-project.png`
files under `/public` are served by Next.js static
asset serving.

### T31.2.5 — Update `app/layout.tsx` `icons`

```ts
icons: {
  icon: "/icon.png",
  shortcut: "/favicon.ico",
  apple: "/apple-icon.png",
},
```

### T31.2.6 — Generate per-project OG cards (optional, follow-up)

The `og-project.png` is a template with placeholder text.
For real per-project OG cards, generate 12 project-specific
PNGs (one per PROJECTS entry) using Prompt 4 from
`docs/OG-FAVICON-PROMPTS.md` with the actual title +
tagline baked in. Land under
`/public/og-projects/{slug}.png`. Update `ogUrlFor` to
look up `og-projects/{slug}.png` when `surface === "project"`.

This is a follow-up — not required for Phase 31.2 ship. The
template card is good enough for first deploy.

### T31.2.7 — Remove `@vercel/og` from `package.json`

```bash
pnpm remove @vercel/og
pnpm install
```

Cuts ~600 KB off the server bundle (per Phase 6 T6.1 docstring).

---

## Verification

Per-commit:
- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes + middleware, 0 warnings.
  `/opengraph-image` route no longer in the build output
  (route deleted).
- `pnpm bundle` — server bundle smaller by ~600 KB after
  T31.2.7.
- `curl /icon.png` / `/apple-icon.png` / `/og-default.png` /
  `/og-writing.png` / `/og-project.png` / `/favicon.ico` → 200,
  correct content-type, sane file sizes.
- Live SSR smoke on `/`, `/log`, `/work`, `/work/taply`,
  `/stack`, `/writing`, `/lets-connect`:
  - HTML `<link rel="icon" href="/icon.png">` present.
  - HTML `<meta property="og:image"
    content="https://mahboob.engineer/og-default.png">` (or
    `og-writing.png` / `og-project.png` per surface) present.
  - HTML `<meta name="twitter:image"
    content="...og-default.png">` present.

- Manual preview via Twitter / LinkedIn / Discord share
  inspector:
  - `https://mahboob.engineer` → `og-default.png`.
  - `https://mahboob.engineer/writing` → `og-writing.png`.
  - `https://mahboob.engineer/work/taply` → `og-project.png`
    (template; future per-project card overrides).

---

## Commit order

7 atomic commits, each tidy:

1. `T31.2.1` — drop assets into `/public/`.
2. `T31.2.2` — rewrite `lib/og-helpers.ts`.
3. `T31.2.3` — delete `app/icon.tsx`.
4. `T31.2.4` — delete `app/opengraph-image.tsx`.
5. `T31.2.5` — update `app/layout.tsx` icons object.
6. `T31.2.7` — remove `@vercel/og` from `package.json`.
7. (separate, optional) `T31.2.6` — per-project OG cards.

Each commit: code → `pnpm typecheck` (clean) → update the
active phase file (`work-progress-p8.md`) → git commit
with standing identity env vars.

---

## Out of scope for Phase 31.2

- Per-project OG cards (T31.2.6) — template card is good
  enough for first deploy. Move to Phase 32 if pursued.
- `apple-touch-icon` size variants beyond 180 — iOS only
  reads the 180 from `<link rel="apple-touch-icon">`; the
  120 + 152 + 167 sizes are deprecated since iOS 14.
- Dark-mode OG variant — the live site is dark-mode only;
  no light variant needed.
- Twitter summary card variant — site uses
  `summary_large_image` exclusively.
