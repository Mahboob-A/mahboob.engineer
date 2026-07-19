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

---

## T32.2 — Extract first-pass Backend City sprites from ChatGPT sheets
**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped
- Added `scripts/extract-game-assets.py`, a repeatable Pillow-based crop pipeline for the ChatGPT city and developer source sheets.
- Generated first-pass cropped assets under `public/assets/game/` for buildings, terrain, props, and the normalized player sheet.
- Added `game/assets/manifest.ts` so the rewritten Phaser renderer can load named sprites instead of touching the labeled concept sheet directly.
- Added `pnpm extract:game-assets` to `package.json` for rerunning the extraction after crop-box tuning.

### Decisions
- Used Pillow because it is already available locally, while `sharp` is not installed in the project.
- Treated the ChatGPT city sheet as a source atlas/concept sheet only. The generated Phaser inputs are discrete PNGs like `server-farm.png`, `road-horizontal.png`, and `developer-sheet.png`.
- Kept crop boxes in a tracked script so visual tuning is versioned and reviewable.

### Caveats / pending
- This is a first-pass extraction. Several sprites still carry source-sheet background pixels and may need transparency cleanup before final rendering.
- The player sheet is normalized to 96x144 frames for stable Phaser loading, but final display scale still needs to be set in the player rewrite.
- The new assets are not yet wired into `PreloadScene` or `WorldScene`.

### Verified
- `python3 scripts/extract-game-assets.py`
- Contact-sheet visual inspection of generated assets at `/tmp/game-asset-contact-sheet.png`.
- `find public/assets/game -type f | sort | xargs file`

---

## T32.3 — Add deliberate Backend City layout model
**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped
- Added `game/world/city-layout.ts` as the new source of truth for the rewritten game world.
- Defined world dimensions, spawn point, districts, roads, buildings, props, villains, collisions, entrances, and interaction rectangles.
- Mapped all project slugs plus the three special buildings into named building entries with sprite keys from the new asset manifest.
- Added `districtForPoint()` so the HUD/minimap work can resolve the player's current district from coordinates.

### Decisions
- Used plain TypeScript data instead of Tiled JSON for the rewrite. This keeps the city layout reviewable and avoids repeating the previous mistake of treating the concept sheet as a uniform tilemap.
- Used `as const satisfies CityLayout` so bad sprite keys, villain ids, and required layout fields fail at typecheck time.
- Started with deliberate approximate positions and road rectangles rather than attempting final art-perfect placement immediately.

### Caveats / pending
- The layout is not yet rendered by `WorldScene`.
- Collision and interaction rectangles are first-pass estimates and will need tuning after visual QA.
- Road sprites are currently represented as stretchable rectangles; the renderer may need tiling or nine-slice-style placement for better visual quality.

### Verified
- `pnpm typecheck`
- `pnpm exec eslint game/world/city-layout.ts game/assets/manifest.ts`
