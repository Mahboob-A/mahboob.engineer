# Phase 35 — Game overlay `setState during render` bug fix

**Phase:** 35 — Game overlay `setState during render` bug fix
**Phase status:** done
**Date started:** 2026-07-20

---

## T35.1 — Fix Backend Diaries HQ crash + harden slug-not-found paths

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-20

### What shipped

- `components/game/SpecialOverlay.tsx` — renamed the Backend Diaries
  HQ entry in `SPECIAL_ROUTES` from `"backend-diaries"` →
  `"writing-hq"` so the slug matches the one emitted by
  `game/world/city-layout.ts:212`. Added a `useEffect`-based close
  in place of the synchronous `if (!route) onClose()` block so
  unknown-slug cleanup no longer fires `setOverlay(null)` on
  `GameRoot` mid-render.
- `game/scenes/overlays/ProjectOverlay.tsx` — converted the
  `!project` branch from a synchronous `bridge.closeOverlay()` to
  a `useEffect`-based close. Same fix pattern; latent version of
  the same bug.
- `game/scenes/overlays/VillainOverlay.tsx` — converted the
  `!villain` branch from synchronous `onClose()` to
  `useEffect`-based close. Same fix pattern; latent version of
  the same bug.
- `progress/work-progress-p35.md` — this file.

### Decisions

- **Slug key is `writing-hq`, not `backend-diaries`.** The
  authoritative source of truth is `game/world/city-layout.ts`
  (Phase 32, T32.3) which assigns the Backend Diaries HQ
  building `slug: "writing-hq"`. `SPECIAL_ROUTES` was the
  inconsistent one — rename the key, not the city-layout entry.
- **Three files in one commit, not three commits.** The
  hardening is a single conceptual fix ("slug-not-found safety
  must never call setState during render") applied
  symmetrically across the three overlays. Splitting into three
  commits would force one of them to land with a latent bug that
  could re-fire on a future schema drift. The fix is correct
  only when all three are in place.
- **No console warning on unknown slug.** A `console.warn` would
  fire from the same `useEffect` that closes the overlay, so it
  would dump to the console on every miss with no opportunity
  for the user to inspect before the overlay disappears. Symptom
  is gone; diagnostic can be a follow-up if it matters.
- **Keep the existing "unknown slug → close immediately"
  convention.** The convention has shipped since Phase 4 — the
  three overlays all close on unknown slug rather than render a
  "?" card. No UX change here.
- **`ProjectOverlay`'s safety branch keeps direct
  `bridge.closeOverlay()` (not `onClose`).** The original code
  bypassed the optional parent `onClose` callback in the safety
  branch because the only parent (`OverlaySlot`) forwards
  `onClose → bridge.closeOverlay()` anyway — they're equivalent
  in practice. Preserving the original call avoids a behavior
  change for any future caller that might supply a custom
  `onClose`.

### Caveats / pending

- The slug-not-found branch in all three overlays now renders
  one extra commit-cycle of `null` before the close takes
  effect. Imperceptible to the user (single-frame transition
  from rendered content to unmounted) but worth noting if anyone
  later adds a "loading…" fallback in that branch — the close
  will race the loader.
- No browser smoke run was possible from this session (no
  Playwright / Chromium). Verification is `pnpm typecheck`
  clean + manual diff review against the React anti-pattern.
  The user should run `pnpm dev` and walk into Backend Diaries
  HQ to confirm the overlay renders cleanly with no console
  error before pushing.

### Verified

- `pnpm typecheck` → clean.
- Manual code-frame review of all three overlays: every
  slug-not-found branch now closes in `useEffect`, not during
  render. No setState-during-render path remains.
- Manual cross-check: Backend Diaries HQ's city-layout slug
  (`"writing-hq"`, line 212) matches the updated
  `SPECIAL_ROUTES` key. The other two special-building slugs
  (`"skills-academy"`, `"contact-bureau"`) were already aligned.