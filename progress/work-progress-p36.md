# Phase 36 — Overlay cross-page links must drop game-mode cookie

**Phase:** 36 — Overlay cross-page links must drop game-mode cookie
**Phase status:** done
**Date started:** 2026-07-20

---

## T36.1 — Convert overlay `<Link>` → `<form action="/api/mode">` for flat-page routes

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-20

### What shipped

- `components/overlay/CaseStudyOverlay.tsx` — replaced the plain
  `<Link href={`/work/${project.slug}`}>` "read full case study →"
  with a `<form action="/api/mode" method="post" className="contents">`
  wrapping a `<button type="submit">` carrying the original Tailwind
  classes. Dropped the now-unused `next/link` import.
- `game/scenes/overlays/VillainOverlay.tsx` — same fix on the
  "view full stack →" link: now posts `mode=flat, next=/stack`
  through `/api/mode`. Dropped the unused `next/link` import.
- `components/game/SpecialOverlay.tsx` — same fix on the primary
  amber-CTA: the "go to <route> →" button now posts `mode=flat,
  next=<route.href>` through `/api/mode`. Dropped the unused
  `next/link` import.
- `progress/work-progress-p36.md` — this file.

### Decisions

- **Form-POST pattern, not client-side router push.** Phase 32
  (T32.1) established the form-POST through `/api/mode` for the
  navbar logo and active-nav links specifically because Next.js
  doesn't re-read cookies on a soft `router.push()`; the
  destination page would still render with `mode=game`. The same
  full POST + 303 + fresh render is the only way the navbar
  reads `mode=flat` on the destination page. Reusing the
  existing pattern keeps the codebase consistent and proven.
- **Preserve each button's existing Tailwind classes verbatim.**
  `SpecialOverlay`'s primary CTA is a solid `bg-acc` button
  with `inline-flex gap-1.5`; `CaseStudyOverlay` and
  `VillainOverlay` use the underline-on-hover accent style.
  Re-implementing them as `<button>` would have been a
  visual regression if the classes drifted; copying the
  classes onto the new `<button>` elements keeps the layout
  pixel-identical.
- **External `<a target="_blank">` chips unchanged.** The four
  external links in CaseStudyOverlay (`live`, `demo`, `source`,
  `video`) navigate off-site and don't affect the mode cookie.
- **"back to game" buttons and `Escape` key handler unchanged.**
  They only close the overlay; they don't navigate away from
  `/game`, so the cookie shouldn't change.
- **Drop the now-unused `next/link` imports.** All three files
  used `Link` only for the cross-page links. After the
  conversion, none of them import `Link` anymore — clean
  removal avoids dead code.

### Caveats / pending

- No browser smoke run from this session (no Playwright /
  Chromium available). Verification is `pnpm typecheck` clean
  + manual diff review against the precedent pattern. The user
  should run `pnpm dev` and walk into one building per overlay
  type, click the cross-page link, and confirm the navbar's
  "flat" pill is active on the destination page.
- The same anti-pattern may exist on other future overlays or
  in-game UI surfaces that the user may add later. If they do
  cross-page navigation from inside the game, the same
  form-POST conversion applies. The rule is: any in-game UI
  that navigates to a flat page (i.e. any page rendered by
  `app/**`, not `/game`) must drop `mode=game` first.

### Verified

- `pnpm typecheck` → clean.
- Manual diff review of all three overlays: each cross-page
  link is now a `<form action="/api/mode">` with hidden
  `mode=flat, next=<dest>` inputs, identical to the ActiveNavLink
  and LogoLink precedent.
- No remaining references to `next/link` in any of the three
  overlays (grep confirmed).