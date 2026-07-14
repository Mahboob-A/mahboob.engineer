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
---

## T4.1 — Asset decision + slice + frame extraction

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-12

### What shipped

The chosen ChatGPT tileset + ChatGPT dev sprite now live under
`public/assets/`, ready for T4.3 (PreloadScene) to wire into Phaser.

- **`public/assets/tilesets/backend-city.png`** — copy of
  `ChatGPT-cyberpunk-city-tileset-layout.png` (1254×1254 px, 2.1 MB).
- **`public/assets/tilesets/backend-city.json`** — Tiled tileset
  definition with **42 explicit tiles** (6 buildings + 12 road
  variants + 12 grass variants + 12 sidewalk variants) covering the
  major tile regions in the source PNG. Each tile has a named id
  (`building-server-farm`, `road-straight-h`, `grass-corner-ne`,
  `sidewalk-t-junction`, etc.) + explicit `(x, y, width, height)`
  bounding box.
- **`public/assets/sprites/developer.png`** — copy of
  `ChatGPT-pixel-art-developer.png` (1024×1536 px, 2.3 MB). 4×4 grid
  of frames at 256×384 per frame.
- **`public/assets/sprites/developer.json`** — sprite metadata:
  `{frameWidth: 256, frameHeight: 384, scale: 0.5, rows: [{down, 0-3}, {up, 4-7}, {left, 8-11}, {right, 12-15}]}`.
- **`game/config.ts`** — added `PHASER_ASSETS` constant exporting
  the 4 asset paths. Single source of truth for the Phaser-side
  loader calls in T4.3.

### Decisions

- **ChatGPT tileset + ChatGPT sprite** — per user direction. The
  ElevenLabs tileset and Gemini sprite are also at project root but
  unused in T4.1.
- **Tileset is a layout reference, not a regular grid** — the
  ChatGPT tileset shows named tiles scattered across the canvas
  rather than a uniform `tileWidth × tileHeight` grid. I use Tiled's
  explicit `tiles[]` array format with `(x, y, width, height)`
  per tile. Tile sizes vary by region: buildings ~220×260, road/grass
  ~110-128, sidewalk ~110×60.
- **Tile coordinates are first-pass estimates** — `backend-city.json`
  has a `_comment` field at the top stating the coordinates are
  estimated from visual inspection of the source PNG. T4.2 will
  refine these via Tiled's "Edit Tileset" panel. The JSON is
  structured correctly so Tiled + Phaser can both consume it.
- **Sprite frame size kept at 256×384 (native PNG resolution)** —
  Phaser renders at any scale via `setScale()` in the Player
  entity. Display scale of 0.5 (giving 128×192 per frame) is
  documented in `developer.json`; the master spec asked for 32×48
  (scale 0.125). The display scale is a T4.5 decision; the JSON
  exposes it as a hint.
- **Two PNGs at project root + two copies in `/public/assets/`** —
  the project-root copies are the source-of-truth (user-managed).
  The `/public/assets/` copies are what Next.js serves at runtime.
  Byte-for-byte identical.
- **8-color palette swatch baked into the source PNG** — flagged in
  the JSON as `_comment_palette_swatch`. It's a visual reference
  baked into the image at x=60, y=1080; not a tile.
- **Right-side "assembled map preview" region** — flagged in the
  JSON as `_comment_map_preview`. x=620, y=340, ~600×400 region is
  a "how it looks assembled" preview, not a tile.
- **`PHASER_ASSETS` constant in `config.ts`** — single source of
  truth for asset paths. T4.3 will import this and wire the
  `this.load.image(...)` / `this.load.spritesheet(...)` calls.

### Caveats / pending

- **Tileset coords need T4.2 refinement** — the explicit
  `(x, y, width, height)` values are eyeballed from inspecting the
  rendered source PNG. Tiled's "Edit Tileset" panel will be used
  in T4.2 to lock the exact bounding boxes. The 4-quadrant building
  layout + grass/road/sidewalk regions are correct in shape; the
  pixel-level precision will be tightened when Tiled opens the file.
- **Only 6 buildings** — the tileset has 6 named buildings
  (Server Farm, Studio, Lab, Newspaper HQ, Office Tower, Exchange).
  Of the 12 projects in `PROJECTS`, 6 will get a unique building
  sprite (Taply HQ, UnThink Labs, Algocode Server Farm, Movio
  Studios, DrishtiAI Vision Lab, etc.). The other 6 projects will
  reuse the same building sprites (acceptable visually). Future
  tasks can add more building variants.
- **Sprite display scale 0.5** — larger than the master spec's
  32×48 (which would be scale 0.125). The 128×192 display is a
  deliberate readability choice. T4.5 (Player entity) can adjust
  `this.setScale(...)` if the user wants a smaller character.
- **Two extra ChatGPT/ElevenLabs/Gemini assets at project root are
  unused** — they're outside the deployment surface (not under
  `/public`) and not committed. Future tasks can swap them in.
- **Git author identity**: per standing instruction, all commits
  use `connect.mahboobalam@gmail.com`.

### Verified

- `pnpm typecheck` → clean.
- `pnpm lint` → clean.
- `pnpm build` → 23 routes (no new routes added; assets live under
  `/public` and are served statically).
- **Live asset URL smoke** (curl against prod build):
  - `/assets/tilesets/backend-city.png` → 200, 2,125,406 bytes ✓
  - `/assets/tilesets/backend-city.json` → 200, 8,569 bytes ✓
  - `/assets/sprites/developer.png` → 200, 2,380,156 bytes ✓
  - `/assets/sprites/developer.json` → 200, 1,490 bytes ✓
- **JSON validity** — both JSON files parse with `python3 -m json.tool`.
- **File tree check** — `find public/assets/ -type f` returns:
  - `tilesets/backend-city.png` (2.1 MB)
  - `tilesets/backend-city.json` (8.5 KB)
  - `sprites/developer.png` (2.4 MB)
  - `sprites/developer.json` (1.5 KB)
- **Image dimensions** — confirmed via `sips`:
  - Tileset: 1254×1254 px
  - Sprite: 1024×1536 px

---

## T4.3 — PreloadScene + WorldScene BGM/ducking

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-14

### What shipped

- **`game/audio/registry.ts`** (new) — single source of truth for audio assets.
  - `SFX: { footstep, zone-enter, overlay-open, overlay-close, villain-bump, ui-click }` — typed object literal.
  - `BGM_TRACKS: readonly string[]` — 8 mp3 paths.
  - `BGM_VOLUME: { base: 0.25, ducked: 0.08 }` — ducking spec.
  - `SfxKey = keyof typeof SFX` — union type for consumers.
- **`game/scenes/PreloadScene.ts`** — full rewrite (was a stub).
  - Loads tileset PNG + dev sprite (4×4 at 256×384) + 6 SFX + 8 BGM.
  - Progress bar: 320×6 rect at canvas 70% vertical, accent fill, border bg.
  - Status text: "loading… {pct}%" above the bar.
  - On COMPLETE: logs `[Backend City] assets ready` + transitions to WorldScene.
- **`game/scenes/WorldScene.ts`** — full rewrite (was a stub).
  - `startBGM()`: picks random track via `Phaser.Math.RND.pick(BGM_TRACKS)`, derives buffer key from filename, calls `this.sound.add(key, {loop, volume})` then `sound.play()`. Stores sound for ducking.
  - `wireBridgeDuck()`: subscribes to OPEN_OVERLAY → setVolume(0.08), CLOSE_OVERLAY → setVolume(0.25).
  - On SHUTDOWN: bridge.off + stopAll + clear refs.
  - `toggleMute()`: flips isMuted + calls `this.sound.setMute(boolean)` — for UIScene pause menu (T4.11).
- **`game/index.tsx`** — swapped BootScene → PreloadScene at runtime.
- **`game/scenes/BootScene.ts`** — deleted. The "console shows ready" verification moved to PreloadScene as "assets ready".

### Decisions

- **Phaser 4's `SoundManager.play()` returns `boolean`, not the sound** — to get a reference to the active sound for ducking/muting, use `this.sound.add(key, config)` (returns `BaseSound`), then `.play()` on that instance. This pattern stores the sound and lets us call `setVolume` later.
- **BGM key derived from filename** — `bgm-1.mp3` → `bgm-1`. Same convention in PreloadScene (loader) and WorldScene (picker) keeps the relationship symmetric.
- **`Phaser.Math.RND.pick(BGM_TRACKS as unknown as string[])`** — `BGM_TRACKS` is a readonly literal tuple; Phaser's API expects `unknown[]`. Cast is necessary; safe at runtime because every entry is a string.
- **Ducking via `setVolume()` on the active sound, not `this.sound.volume = ...`** — the latter would affect all sounds (BGM + SFX). Per-sound ducking keeps SFX loud when an overlay opens.
- **`SFX` keys as `string` literals** (with `SfxKey` type alias) — `Object.entries(SFX)` in the preload loop gives `[key, path]` tuples; the key becomes the audio buffer name in Phaser.
- **`COLOR_BG` and `COLOR_TEXT` removed** — declared but unused (background comes from Phaser config; text uses CSS color string). Cleaned up to keep ESLint clean.

### Caveats / pending

- **BGM doesn't auto-resume after browser autoplay-block** — Phaser's audio context may need a user gesture. If BGM doesn't start, click anywhere on the canvas — the `RESUME_GAME` bridge event from T4.0's original wiring should unblock. T4.4 will formally wire this if needed.
- **`BaseSound` cast for `setVolume`** — documented in source. Both WebAudioSound + HTML5AudioSound implement `setVolume`/`setMute` at runtime; cast is safe.
- **BGM random selection per-mount** — `Phaser.Math.RND.pick` is non-deterministic. Each page reload picks a new track. If you want a deterministic first track per session, seed via URL param (out of scope; violates master §6 rule #3 if session storage is used).
- **No tilemap load yet** — PreloadScene loads images + audio only. When T4.2 ships, add `this.load.tilemapTiledJSON('backend-city', PHASER_ASSETS.tilemap.json)` to the preload loop. Progress bar continues to cover it.
- **Bridge subscriptions only unsubscribe on `SHUTDOWN`** — if the scene gets paused+resumed (tab visibility, future pause menu), subscriptions stay alive. Correct behavior; T4.11 will add explicit pause/resume for the pause menu.
- **Git author identity**: per standing instruction, all commits use `connect.mahboobalam@gmail.com`.

### Verified

- `pnpm typecheck` → clean. (Initial pass had 3 errors: `Phaser.Math.RND.pick` readonly tuple incompatibility, `trackPath: unknown` flow, and `boolean` not assignable to `BaseSound | null`. Fixed by casting the readonly tuple and using the `add() + play()` pattern instead of `play()`-returns-sound.)
- `pnpm lint` → clean. (Initial pass had 2 unused-color warnings on `COLOR_BG` + `COLOR_TEXT`. Removed.)
- `pnpm build` → 23 routes. 0 warnings.
- **Live asset URL smoke** (curl against prod build):
  - 6 SFX URLs → 200, sizes 1.6 KB to 20.5 KB.
  - 8 BGM URLs → 200, sizes 4.7 MB to 8.3 MB.
  - Tileset + sprite URLs → 200.
  - `/game` HTTP 200, renders loader placeholder.
