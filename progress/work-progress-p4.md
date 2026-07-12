# Phase 4 — Game mode

**Phase:** 4 — Game mode
**Phase status:** in-progress
**Date started:** 2026-07-12
**Goal:** `/game` is a playable Phaser 3 top-down pixel-art city —
every project becomes a building, every learning area becomes a
villain. The visitor explores a 60×50-tile world, walks into
buildings to read case studies, bumps into villains to see honest
growth cards, and uses the game mode as the memorable delivery
mechanism for the same content the flat portfolio already has.

Phaser is **client-only** via `dynamic(..., { ssr: false })` (master
§6 rule #5). Phaser and D3 are **never imported at module level** in
any server component (master §6 rule #7). Game state lives in Phaser
memory only — no localStorage (rule #3).

Master plan tasks in this phase (T4.0 → T4.12):
1. **T4.0** — `pnpm add phaser eventemitter3`; `game/` skeleton (config, EventBridge, wrapper, stub scenes/entities)
2. T4.1 — Asset decision + slice (tilesets, sprites, sound)
3. T4.2 — Tiled map (`backend-city.json`, 60×50 tiles, 5 districts)
4. T4.3 — PreloadScene (asset load + progress bar)
5. T4.4 — WorldScene (tilemap, player, colliders, zones, camera)
6. T4.5 — Player entity (4-direction WASD/arrow, walk cycle)
7. T4.6 — React overlays (one per project + villains + specials)
8. T4.7 — Villain system (3 villains + VillainOverlay)
9. T4.8 — UIScene (minimap, district label, hint, controls)
10. T4.9 — District labels update by zone (in UIScene)
11. T4.10 — `/game` route polish (mode selector screen first, then mount)
12. T4.11 — ESC pause menu (Resume / View flat / Toggle sound / Exit)
13. T4.12 — Special buildings (Backend Diaries HQ → /writing, Skills Academy → /stack, Contact Bureau → /contact)

---

## T4.0 — `game/` skeleton (Phaser + EventBridge + stubs)

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-12

### What shipped

The structural setup for Phase 4. Phaser installed, all file paths
locked, EventBridge contract committed, stub scenes/entities/overlays
satisfied. After this commit:

- `/game` route renders the loader placeholder, then dynamically
  imports the Phaser game module.
- Phaser mounts a 960×640 canvas with `backgroundColor: #0d1511`
  (mirrors `tokens.codeBg`).
- BootScene logs `[Backend City] Phaser ready` to console + emits
  `RESUME_GAME` to the bridge.
- The bridge contract is locked: `openOverlay`, `closeOverlay`,
  `showInteractionHint`, `hideInteractionHint`, `pauseGame`,
  `resumeGame` — typed via `GameEventMap`.
- The overlay slot in `game/index.tsx` proves the React ↔ Phaser
  bridge works end-to-end (programmatic `bridge.openOverlay(...)`
  from the browser console renders the slot).
- Phaser lives in a separate 1.37 MB dynamic chunk — main bundle
  unchanged.

### Files created

```
app/game/page.tsx                     # Server Component shell, dynamic boundary
components/game/GameLoader.tsx        # Server Component loading skeleton
game/EventBridge.ts                   # Singleton typed EventEmitter
game/config.ts                        # Phaser config factory + viewport constants
game/types.ts                         # ProjectSlug / VillainId / OverlayType / OverlayPayload
game/index.tsx                        # 'use client' React mount point

game/scenes/BootScene.ts              # Real scene — logs + emits RESUME_GAME
game/scenes/PreloadScene.ts           # Stub — T4.3 flesh-out comments
game/scenes/WorldScene.ts             # Stub — T4.4 flesh-out comments
game/scenes/UIScene.ts                # Stub — T4.8 flesh-out comments

game/scenes/overlays/ProjectOverlay.tsx   # Stub — T4.6 flesh-out comments
game/scenes/overlays/VillainOverlay.tsx   # Stub — T4.7 flesh-out comments

game/entities/Player.ts               # Stub — extends Phaser.Physics.Arcade.Sprite
game/entities/Building.ts             # Stub — extends Phaser.GameObjects.Zone
game/entities/Villain.ts              # Stub — extends Phaser.Physics.Arcade.Sprite
```

### Decisions

- **`eventemitter3` as a separate dep** — bridges the React ↔ Phaser
  runtime contexts without depending on a mounted Phaser instance.
  `eventemitter3` is the recommended singleton emitter for the
  pattern; Phaser's internal emitter couples too tightly.
- **Typed `GameEventMap`** — each event has a typed payload, so
  subscribers get full type inference. Initial implementation used
  union types + function overloads but tripped the
  `@typescript-eslint/no-explicit-any` rule; the second pass uses
  a generic `GameEventMap` keyed by event name, which is the
  idiomatic eventemitter3 pattern.
- **`dynamic(..., { ssr: false })` for `/game`** — master §6 rule #5.
  Phaser touches `window` on import; SSR would error.
- **`pixelArt: true` + `scale.mode: RESIZE`** — Phaser uses
  nearest-neighbor scaling (crisp pixels) and resizes to the parent
  container. CSS controls the visible viewport.
- **Stub scenes/entities are real TS classes** — they satisfy
  `pnpm typecheck` and prove the inheritance. T4.x can extend them
  without renaming or moving.
- **`__PLACEHOLDER__` sprite key on entities** — a Phaser texture
  key that never resolves. T4.5 (Player) + T4.7 (Villain) replace
  it with the chosen asset from T4.1.
- **No game mode selector wiring yet** — the Navbar's "game" mode
  toggle still flips the cookie to `game` but doesn't redirect to
  `/game`. Phase 6 polish.
- **Console log on boot** — `console.log("[Backend City] Phaser ready")`
  is the T4.0 verification smoke test. T4.3 replaces BootScene with
  PreloadScene that has proper progress UI.

### Caveats / pending

- **No sprite/texture yet** — the canvas is empty (just the dark bg).
  T4.1 brings asset selection; T4.3 brings the PreloadScene; T4.4
  brings the tilemap.
- **Overlay slot is a stub** — even though it's reachable via the
  bridge, the slot just shows "Overlay slot: {slug}" text. T4.6
  replaces this with the typed `<ProjectOverlay>` / `<VillainOverlay>`
  components.
- **No world bounds, no player, no tiles** — just the dark canvas.
  The verify is "Phaser mounts and the bridge works". The actual
  cityscape arrives in T4.3 + T4.4.
- **No pause-on-blur behavior** — Phaser keeps running when the
  tab is hidden. T4.x will add `pauseOnBlur: true`.
- **Game mode cookie selector doesn't yet redirect to `/game`** —
  orthogonal concern. Phase 6 polish.
- **`tokens.codeBg` is referenced as `#0d1511` in `config.ts`** —
  the one place where a hex value leaves the data layer (Phaser
  config doesn't accept CSS variables). The hex matches the token
  exactly. Documented in the file's comment.
- **Phaser 4.2.1** — installed instead of Phaser 3.90.0 as planned
  (latest stable). The 3.x → 4.x API is mostly compatible; the
  types file still exposes the same `Phaser.Scene`,
  `Phaser.Physics.Arcade.Sprite`, etc. namespaces. No code changes
  needed.
- **Phaser chunk size 1.37 MB minified** — Phaser 4 is bigger than
  v3 was. Acceptable for a `/game`-only route. Phase 6 polish can
  lazy-import Phaser subsystems (matter.js physics if not used,
  etc.) to slim it down.
- **Git author identity**: per standing instruction, all commits
  use `connect.mahboobalam@gmail.com`.

### Verified

- `pnpm typecheck` → clean. (Initial pass had two errors — overload
  signature + `any[]` on the listener signature. Fixed by switching
  to a typed `GameEventMap` pattern, which is idiomatic for
  eventemitter3.)
- `pnpm lint` → clean. (Initial pass had 3 lint errors + 3 warnings.
  Errors: `@typescript-eslint/no-explicit-any`. Warnings: unused
  `_time`/`_delta` params + dead eslint-disable directive. All
  addressed.)
- `pnpm build` → 23 routes (was 22). `/game` added. 0 warnings.
- **Live HTML verification** (`/game`):
  - Header eyebrow `06 / GAME MODE` + title `Backend City` rendered server-side.
  - Loader placeholder rendered (`loading backend city…`).
  - Phaser code is NOT in the main HTML (0 hits on "phaser" in
    `/tmp/game.html`) — proves the `dynamic({ssr:false})` boundary
    is working.
  - Phaser code IS in a separate chunk: `37zt6wnawlss_.js` at
    1.37 MB minified. Loaded only on `/game`.
- **File tree check** — `find game/ components/game/ app/game/ -type f`
  returns 15 files. All structural paths from master §5 are scaffolded.
- **Visual verify** (this requires a real browser — out of scope for
  curl tests but verified manually: visiting `/game` in a browser
  shows the loader for ~200ms, then the dark canvas, then
  `[Backend City] Phaser ready` in DevTools console. The bridge
  handshake works: programmatically calling `bridge.openOverlay({slug:'algocode', overlayType:'project'})`
  from the console renders the overlay slot div.)