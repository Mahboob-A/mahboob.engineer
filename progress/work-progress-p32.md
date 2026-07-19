# Phase 32 — Game mode rewrite
**Phase:** 32 — Game mode rewrite
**Phase status:** in-progress
**Date started:** 2026-07-19

---

## T32.1 — Game mode rescue plan, boot fix, and mode navigation cleanup
**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped
- Added `docs/GAME_MODE_REWRITE_PLAN.md` with the full rewrite plan for replacing the broken tilemap-based game renderer.
- Registered `WorldScene` in `game/index.tsx`, fixing the Phaser boot error where `PreloadScene` reached 100% and then failed with `Scene key not found: WorldScene`.
- Updated `components/layout/Navbar.tsx` so the mode toggle routes `game` to `/game` and `flat` to `/`.
- Updated `components/layout/ActiveNavLink.tsx` and the navbar logo so navigation away from game mode posts through `/api/mode` with `mode=flat`, avoiding a stale `game` UI marker on flat pages.
- Embedded the external tileset metadata into `public/assets/maps/backend-city.json` to unblock the immediate Phaser loader error while the real renderer rewrite is planned.

### Decisions
- Started a new Phase 32 instead of appending to Phase 4 because this is a corrective rewrite after the initial game-mode implementation proved visually wrong.
- Kept the existing React/Phaser shell, mode selector, audio, overlays, pause menu, and bridge as salvageable pieces.
- Documented the key architectural pivot: the ChatGPT city image is a labeled layout sheet, not a uniform 32x32 tileset, so the rewrite needs cropped sprites and a deliberate world layout.
- Added the user's working constraint directly to the plan: commit meaningful checkpoints throughout the rewrite instead of one large final commit.

### Caveats / pending
- The embedded tileset change only unblocks the current loader path. It does not make the old tilemap renderer visually acceptable.
- The actual rewrite still needs asset extraction, a new city layout model, a new world renderer, corrected player animation, collisions, interactions, and HUD/minimap restoration.
- Full `pnpm lint` is still known to fail on unrelated pre-existing lint issues outside the files touched for this task.

### Verified
- `pnpm typecheck`
- `pnpm exec eslint components/layout/Navbar.tsx components/layout/ActiveNavLink.tsx game/index.tsx`
- Browser logs confirmed the bug moved from missing `WorldScene` to the next tilemap parsing issue before the rewrite plan was written.
