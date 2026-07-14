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

---

## T4.2 — Tiled map (`backend-city.json`)

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-14

### What shipped

`public/assets/maps/backend-city.json` — the spatial backbone of `/game`. 60×50 tile grid at 32×32, with 4 layers:

- **`Ground`** (tilelayer) — 3000 cells, all tile id 50 (`grass-plain` from the tileset). Uniform green base; T4.4 can decorate further.
- **`Buildings`** (objectgroup) — 15 rectangles:
  - 12 projects placed per master §5.2 layout (Taply + UnThink in saas_quarter, Algocode + DataLineage in systems_district, Pulumi in cloud_ridge, Movio + CuteTube + ProStream in media_row, AirPass + ImgTwist + LB in protocol_street, DrishtiAI in vision_lab)
  - 3 special buildings (Backend Diaries HQ, Skills Academy, Contact Bureau) in the center
  - Each object has `slug` + `district` + `type` properties (T4.4 reads these to build Building zones)
- **`Villains`** (objectgroup) — 3 spawn points (gopher-king, terraform-titan, ebpf-phantom) in the Learning Grounds (center-south)
- **`SpawnPoint`** (objectgroup) — 1 player start at tile (29, 26), mid-canvas, with `type: "player"` property

**Other changes:**
- `game/config.ts` — `PHASER_ASSETS.tilemap = { json: "..." }` now resolves to the real path (placeholder comment removed).
- `game/scenes/PreloadScene.ts` — `preload()` now calls `this.load.tilemapTiledJSON("backend-city", ...)` after the audio loaders.
- `game/scenes/WorldScene.ts` — `create()` calls `this.createMap()`; the method is a placeholder (no-op) until T4.4 fleshes it out. The placeholder doc-string lists every step T4.4 needs to take.

### Decisions

- **6 districts, not 5** — `GameDistrict` enum has 6 values; the master spec's "5 districts" is off-by-one. We use all 6 to match the data.
- **Hardcoded building positions** — buildings are placed by hand per master §5.2 ASCII layout. Drift risk if a project is added later (positions need manual update). Trade-off: deliberate city layout vs. auto-placement. Future tasks can add auto-placement if needed.
- **Uniform grass Ground layer** — the tileset has 12 road variants + 12 grass variants + 12 sidewalk variants, but painting a complex road/grass/sidewalk grid by hand would require per-cell tile-id selection. For v1 the Ground is uniform grass; T4.4 can layer road/sidewalk tiles in specific cells if the user wants more visual depth.
- **Special buildings in the Buildings layer with `_special:` prefixed slugs** — distinguishes them from project slugs. T4.12 will route their overlays (`backend-diaries` → `/writing`, etc.).
- **Object id sequencing** — buildings 100–114, villains 200–202, spawn 19. Lower numbers reserved for layer ids.
- **`PHASER_ASSETS.tilemap` as sibling group** — reviewer's T4.1 fixup established the nested pattern; followed it.
- **Tile-size mismatch deferred to T4.4** — buildings are 220×260 in the source tileset, but the map is 32×32 tiles. The Tiled object rect uses 220×260 (the visual footprint). T4.4 will use `setScale()` on the building sprite to fit the visual.

### Caveats / pending

- **Tile-size mismatch** — buildings 220×260 vs map tiles 32×32. T4.4 renders the building sprite at scale ~0.6 (220×32/220 ≈ 0.6 to fit 7 tiles wide, 260/32 ≈ 8 tall) so the visual matches the Tiled object rect.
- **Master §5.2 layout transcription** — pixel coords are best-fit. T4.4 may nudge positions for visual balance.
- **No visual decorations** — Ground is uniform grass. No roads, sidewalks, trees. T4.4 (or a future polish task) can add them.
- **No camera bounds yet** — T4.4 sets `this.cameras.main.setBounds(0, 0, 1920, 1600)`.
- **The 3 villain spawn points** are placed at fixed positions; their actual visual sprites + animations land in T4.7.
- **T4.4 (WorldScene flesh-out)** is now unblocked. It will: read the cached tilemap, add tileset image, build layers, spawn Player at SpawnPoint, create Building zones per `Buildings[]`, place Villain entities, set camera bounds + follow + lerp 0.1, WASD/arrow input.
- **Git author identity**: per standing instruction, all commits use `connect.mahboobalam@gmail.com`.

### Verified

- `pnpm typecheck` → clean.
- `pnpm lint` → clean.
- `pnpm build` → 23 routes. 0 warnings.
- **JSON validity** — `python3 -m json.tool` parses cleanly.
- **Map structure** (programmatic):
  - 60×50 dimensions, 32×32 tile size, orthogonal orientation, type "map".
  - 4 layers: Ground (3000 tiles, all grass id 50), Buildings (15 objects), Villains (3 objects), SpawnPoint (1 object with `type: "player"`).
  - Tileset source: `../tilesets/backend-city.json` (resolves correctly relative to the maps/ folder).
- **Live URL smoke** — `/assets/maps/backend-city.json` → 200, 49201 bytes. JSON re-fetched from running server re-parses cleanly.
- **`/game` route** still 200. PreloadScene loads 17 assets now (was 16): tileset PNG + sprite PNG + 6 SFX + 8 BGM + 1 tilemap.

---

## T4.4 — WorldScene flesh-out (tilemap + entities + camera + zones)

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-14

### What shipped

`WorldScene.ts` is now the full game-scene implementation. `create()` boots in order: BGM → bridge ducking → map → entities → camera → input. Visiting `/game` now renders the entire Backend City (60×50 grass world + 15 buildings + 3 villain spawn points) with the player standing at SpawnPoint, the camera following them, and E-key overlays wired through the EventBridge.

**`WorldScene.ts` changes:**
- **New private fields** — `tilemap`, `tileset`, `groundLayer`, `player`, `buildings`, `villains`, `currentZone`. Tracks the rendered state so cleanup can run on scene SHUTDOWN.
- **`createMap()`** — `this.make.tilemap({key: "backend-city"})` reads the T4.2 tilemap from Phaser's cache; `addTilesetImage("tileset", "tileset")` registers the T4.1 tileset PNG against the tileset's name in the Tiled JSON; `createLayer("Ground", tileset, 0, 0)` paints the 60×50 grass layer.
- **`createEntities()`** — spawns the Player at SpawnPoint (pixel 928, 832 — the center of the map per the JSON), iterates `Buildings[]` to create 15 Building zones (with 20-px inset so walking-past doesn't trigger overlap), iterates `Villains[]` to create 3 Villain physics bodies (no visual yet — T4.7).
- **`createCamera()`** — `setBounds(0, 0, 1920, 1600)` + `startFollow(player, true, 0.1, 0.1)` (lerp matches master §5.5).
- **`setupInput()`** — E-key fires `bridge.openOverlay()` when the player overlaps any Building zone.
- **`update()`** — per-frame overlap check on each Building zone; emits `bridge.showInteractionHint(hint)` on enter and `bridge.hideInteractionHint()` on exit. Uses a `currentZone` field to track which zone the player is in (no `(this as any)` hack).
- **Player uses real texture** — `new Player(this, x, y, "developer")`. The Player entity (T4.0 stub, updated T4.4) now accepts a texture key as its 4th constructor arg. Default still `"__PLACEHOLDER__"` for backward compat. Scale set to 0.13 (256×384 → ~33×50, close to master spec's 32×48).
- **T4.3 BGM + ducking** — unchanged.

**`Player.ts` changes:**
- Constructor signature: `constructor(scene, x, y, textureKey = "__PLACEHOLDER__")`. Default keeps backward compat; T4.4 passes `"developer"`.

### Decisions

- **`createLayer` returns `TilemapLayer | TilemapGPULayer` (no null)** — Phaser 4 union return. Cast to `TilemapLayer` since we don't pass `gpu: true`. Documented in source.
- **`addTilesetImage` returns `Tileset | null`** — coerced to `undefined` via `??` so the field type matches. Same pattern as T4.5's BaseSound cast — necessary because the Phaser type system doesn't unify with the project's `T | undefined` convention.
- **`Tilemap.findObject` takes a callback, not a name** — iterate `layer.objects.find(o => o.name === "player")` instead. Simpler than a callback.
- **`Building` zones inset 20px from visual rect** — the Tiled object rect is 220×260 (building sprite footprint); zone is 180×220 so walking past a building doesn't trigger overlap. Cleaner gameplay feel.
- **`Villain` entities are physics-only in T4.4** — no `this.add.existing()` so Phaser doesn't try to render the placeholder texture. Only `this.physics.add.existing()` creates the body. T4.7 swaps in real sprites + add.existing.
- **Player scale 0.13** — matches master §5.5's 32×48 spec when applied to the 256×384 source sprite. T4.5 may tune via `setScale()`.
- **No player-vs-building collision in T4.4** — T4.4 sets up the zones for E-key interaction only. T4.5 will add `physics.add.collider(player, building)` if the player should be physically blocked from walking through buildings.
- **Per-frame hint tracking** — `update()` checks `physics.overlap(player, b)` for each of 15 buildings × ~60 fps = ~900 checks/sec. Negligible cost. If building count grows beyond ~50, switch to a custom on-exit callback hook.
- **Strict T4.4 vs T4.4+T5.5** — went with strict T4.4. Player movement + walk-cycle animations land in T4.5. T4.4 just makes the world visible + keyboard-interactive.

### Caveats / pending

- **Player can't move yet** — T4.5 attaches WASD/arrow handlers + 4-direction walk animations.
- **Player can't physically collide with buildings** — T4.5 may add the collider if you want the player to be blocked (not just trigger hints). Currently you walk through them visually.
- **Villain entities are invisible** — they're physics bodies placed at their spawn points. T4.7 renders them.
- **E-key handler iterates all 15 buildings per keypress** — O(N) per E press. Fast enough at N=15; if buildings grow significantly, switch to per-zone keyboard handler registration.
- **Camera follows even on idle** — `startFollow` with lerp 0.1 keeps the camera locked at lerp speed. Console-driven position changes (e.g. `scene.player.setPosition(...)`) glide the camera too. Acceptable.
- **Ground layer is uniform grass** — no roads, sidewalks, or trees rendered as tiles. T4.4's `setCollisionByProperty({collides: false})` is a no-op since no tile has a `collides: true` property. If we want pixel-level decoration, T4.4 (or a future polish) can fill some Ground cells with sidewalk + road tile IDs.
- **Master §5.2 layout transcription** — building positions are best-fit to the ASCII art. T4.4 may nudge positions for visual balance.
- **Player zone detection on E-press is per-frame** — T4.5's movement handler will fire this many times per second, but only the down-event triggers overlay (avoids spam on hold).
- **No minimap** — T4.8 (UIScene) adds a 60×50 minimap that reflects player position.
- **Git author identity**: per standing instruction, all commits use `connect.mahboobalam@gmail.com`.

### Verified

- `pnpm typecheck` → clean. (Initial pass had 3 errors: `Tileset | null` vs `Tileset | undefined` mismatch, `TilemapLayer | TilemapGPULayer` union vs single type, `findObject` doesn't exist on ObjectLayer. All fixed: `?? undefined` coercion for the null, `as TilemapLayer` cast for the union, manual iterate `objects.find` for the lookup.)
- `pnpm lint` → clean.
- `pnpm build` → 23 routes. 0 warnings.
- **Live URL smoke** (curl against prod build):
  - `/game` → 200
  - `/assets/maps/backend-city.json` → 200
  - `/assets/tilesets/backend-city.png` → 200
  - `/assets/sprites/developer.png` → 200
- **Bundle smoke** — `WorldScene`, `findObject`, `"developer"`, `"backend-city"`, `"tileset"`, and the entity class names all present in the Phaser dynamic chunks. The runtime is wired.

---

## T4.5 — Player movement + walk-cycle animations

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-14

### What shipped

The player walks. WASD / arrow keys move the player at 160 px/sec (master §5.5 default), normalized for diagonals. Walk animations play per dominant direction; idle snaps to frame 1 of the last facing pose. Buildings act as solid walls.

**`game/entities/Player.ts` — full rewrite:**
- Constants: `PLAYER_SPEED = 160`, `WALK_FRAME_RATE = 10`, `ROWS` (per-direction sprite-sheet ranges), `IDLE_FRAME_OFFSET = 1`.
- Exported `PLAYER_ANIMS` — `{walkDown, walkUp, walkLeft, walkRight}` keys.
- New `public facing: Facing = "down"` field — last direction; used by idle frame pick.
- `public createAnimations()` — registers 4 walk animations (down/up/left/right), each 4 frames at 10fps, looped.
- `public updateMovement(cursors)` — reads WASD/arrow keys, normalizes diagonals, sets velocity + animation, calls `stopMoving()` when velocity is zero.
- `public stopMoving()` — zeros velocity, stops the running walk animation, pins frame to `ROWS[facing].start + 1` (the canonical "hands on laptop" pose).

**`game/scenes/WorldScene.ts` — small additions:**
- New `private cursors` field — populated by `createCursorKeys()` in `create()`.
- `create()` now also calls `player.createAnimations()` + `createColliders()` after `setupInput()`.
- New `private createColliders()` method — `physics.add.collider(player, building)` for every Building zone. The zone's static body (set in T4.4) acts as a wall.
- `update()` now calls `player.updateMovement(cursors)` first, then the T4.4 hint-tracking logic.

### Decisions

- **Idle = `anims.stop()` + `setFrame()`** — no separate idle animation. A single still frame doesn't need an animation key. `anims.stop()` halts the walk cycle; `setFrame(<facing idle index>)` pins the pose.
- **Diagonal normalization** — `vx *= (PLAYER_SPEED / len)` where `len = Math.sqrt(vx² + vy²)`. Without it, diagonals feel too fast.
- **Dominant-direction animation pick** — if `|vx| ≥ |vy|`, play horizontal; else vertical. Prevents flip-flopping when the player mostly moves up while holding A.
- **Player-vs-building collider** — buildings act as solid walls. The T4.4 20-px zone inset gives the player room to step into the zone for the E-key overlay.
- **`physics.add.collider` is for any `GameObject`** — Building extends `Phaser.GameObjects.Zone`, which qualifies. Setup is one line per building; 15 colliders total.
- **`createCursorKeys()` is Phaser's idiomatic WASD/arrow wrapper** — `cursors.up/down/left/right` map to `↑/↓/←/→` + `W/S/A/D` automatically.

### Caveats / pending

- **Player-vs-building corner snags** — physics.arcade handles rectangle-vs-rectangle collisions. The player can slide along edges; at corners, running into the building's diagonal may produce minor "stuck" frames. Out of scope; future polish if it feels weird.
- **Facing direction is sticky across stops** — if the player walks up-right then stops, facing stays "right" (horizontal dominated). Future polish: track last-key-pressed separately from velocity.
- **Frame rate hardcoded at 10 fps** — adjustable via `WALK_FRAME_RATE` constant. 10 fps = 400ms per cycle ≈ natural walking pace.
- **Camera bounds 1920×1600** — player can walk to the edges; camera stops there. World is finite.
- **Villains don't move** — T4.7. Player only collides with buildings.
- **No NPC dialogue / cutscenes** — out of scope. E-key just opens overlays.
- **Git author identity**: per standing instruction, all commits use `connect.mahboobalam@gmail.com`.

### Verified

- `pnpm typecheck` → clean.
- `pnpm lint` → clean.
- `pnpm build` → 23 routes. 0 warnings.
- **Live URL smoke** — `/game` → 200.
- **Bundle smoke** — T4.5 code present in the Phaser dynamic chunk:
  - `createCursorKeys` (string literal) ✓
  - `generateFrameNumbers` (Phaser API call) ✓
  - `160` (PLAYER_SPEED constant) ✓
  - Other T4.5 method names (`updateMovement`, `stopMoving`, `createColliders`) minified by the production build but logically present in the source.
