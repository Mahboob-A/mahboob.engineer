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