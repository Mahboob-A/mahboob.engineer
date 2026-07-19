# Phase 23 — Navbar active state + Next 16 proxy cleanup

**Phase:** 23 — Navbar active state + Next 16 proxy cleanup
**Phase status:** done
**Date started:** 2026-07-19

**Goal:** Make the navbar active-link state reliable across client-side
navigation, keep the final visual treatment text-only, and clear the two
Next.js development warnings surfaced during verification.

**Related history:** This phase follows the navbar work recorded in
`progress/work-progress-p8.md`: Phase 11 T11.4 added the pulsing amber
`nav-glow` active state, Phase 12 T12.1 added `x-pathname` middleware for
Server Component route detection, and Phase 14 removed the glow but left a
flat amber active state. The remaining bug was that `/log` could stay active
on the landing page until a hard reload because the active route was still
derived server-side.

---

## T23.1 — Client-side navbar active state, text-only visual, proxy migration

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped

- **`components/layout/ActiveNavLink.tsx`** — new tiny client component for
  navbar links. It uses `usePathname()` so active-link state follows soft
  navigation immediately. It normalizes trailing slashes and marks nested
  routes active, e.g. `/log/taply` lights `/log`.
- **`components/layout/Navbar.tsx`** — desktop and mobile nav rows now render
  `ActiveNavLink`. The navbar remains a Server Component for the cookie-backed
  flat/game mode toggle.
- **Text-only active visual** — the intermediate dot + bordered chip treatment
  was removed after review. Final state is just `text-amber font-semibold` for
  the active link and `text-t3 hover:text-t1` for inactive links. No glow,
  pulse, dot, square box, border, or active background.
- **`app/globals.css`** — updated the stale Phase 14 comment so future sessions
  know active state is now handled by `ActiveNavLink.tsx`, not the old
  `nav-glow` class or server-side route detection.
- **`proxy.ts`** — migrated the old `middleware.ts` behavior to Next 16's
  `proxy` file convention. It still forwards `x-pathname` for request-time
  fallbacks, mainly the no-JS mode toggle redirect.
- **`app/layout.tsx`** — added `data-scroll-behavior="smooth"` to the root
  `<html>` element because the app intentionally sets `html { scroll-behavior:
  smooth; }`.

### What was wrong

- **Glow was the wrong cue.** Phase 11's text-shadow animation technically
  existed in the DOM, but it was too subtle against `bg-bg`, rendered only at
  glyph edges, and read as amber-on-amber noise instead of a clear page marker.
- **Flat amber alone was not enough.** Phase 14 removed the invisible glow, but
  the visual became just a color change and was not obvious enough at a glance.
- **Server-side active detection was brittle.** The navbar used request headers
  (`x-pathname`, `x-invoke-path`, `next-url`, `referer`) to decide active state.
  That can be stale across App Router soft navigation, which caused cases like
  `/log` remaining highlighted on `/` until a hard reload.
- **First replacement overcorrected.** A dot plus filled/bordered active chip
  fixed glanceability, but the user rejected the dot and square-box feel. The
  final design intentionally keeps only text color/weight and the hover color.
- **Next 16 warnings were real maintenance work.** The dev server warned that
  `middleware.ts` is deprecated in favor of `proxy.ts`, and the browser warned
  about smooth scrolling without the new root `data-scroll-behavior` marker.

### Decisions

- **Use a client component only for links.** `Navbar` stays server-rendered for
  the mode cookie, while active matching moves to `ActiveNavLink`. This keeps
  the behavioral fix scoped and avoids turning the full navbar into a client
  component.
- **Keep `x-pathname` forwarding for now.** Active links no longer depend on
  it, but the mode toggle's hidden `next` field still benefits from a
  request-time fallback for no-JS form submissions.
- **No new animation.** The final treatment is intentionally static and
  palette-aligned: amber marks the current route, sage/mint remains the primary
  hover/focus accent elsewhere.
- **Create Phase 23 as the current progress book.** Git history already had
  Phase 20, 21, and 22 commits, so this work belongs after them as Phase 23.
  The existing progress directory had files only through `work-progress-p8.md`,
  even though later phase notes were appended inside p8.

### Caveats / pending

- A running dev server that started before this migration may briefly report
  "both middleware and proxy detected" during hot reload. Restarting `pnpm dev`
  clears that stale process state because `middleware.ts` has been deleted and
  `proxy.ts` is now the only file convention present.
- Full `pnpm lint` is still blocked by pre-existing unrelated issues in
  `components/hero/HeroTerminal.tsx`, `components/sections/Blog.tsx`, and
  `components/sections/Hero.tsx`. Targeted lint for the touched files passes.

### Verified

- `pnpm exec eslint app/layout.tsx proxy.ts components/layout/ActiveNavLink.tsx components/layout/Navbar.tsx` → clean.
- `pnpm typecheck` → clean.
- Browser/dev-server smoke during implementation:
  - `/` rendered with zero active navbar route links.
  - `/log`, `/work`, and `/stack` navigation updated active state without hard
    reload.
  - Rendered root HTML includes `data-scroll-behavior="smooth"`.
  - Fresh `pnpm dev` startup no longer prints the middleware deprecation
    warning when no stale server is already running.

---

## Phase 23 wrap-up

Navbar active-state highlighting is now route-reactive on the client, while
the visual treatment is back to the user's preferred text-only style. The old
glow/pulse path is gone, the temporary dot/chip treatment is gone, and the
Next 16 proxy + smooth-scroll warnings are addressed.

| Surface | Before Phase 23 | After Phase 23 |
|---|---|---|
| Active route detection | Server header fallback chain in `Navbar.tsx` | `usePathname()` in `ActiveNavLink.tsx` |
| Landing `/` state | Could show `/log` active until hard reload | No active route link on `/` |
| Active visual | Flat amber from Phase 14, then rejected dot/chip draft | Text-only `text-amber font-semibold` |
| Next request hook | Deprecated `middleware.ts` | `proxy.ts` |
| Smooth scroll warning | Browser warning in dev logs | `<html data-scroll-behavior="smooth">` |

Phase 23 status: **done**.
