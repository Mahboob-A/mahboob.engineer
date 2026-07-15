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

---

## T4.6 — React overlays (ProjectOverlay + CaseStudyOverlay wiring)

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-14

### What shipped

The player → content loop is closed. Pressing E inside Taply HQ now opens the Taply case-study overlay (status badge, year, name, tagline, diagram, 4 metrics, first 2 paragraphs of build notes, link buttons). Same shape works for every other project building — `ProjectOverlay` looks up `PROJECTS_BY_SLUG[slug]` and delegates to the shared `<CaseStudyOverlay>` component.

**`components/overlay/CaseStudyOverlay.tsx` (new — ~150 lines):**
- `'use client'` (used inside `game/index.tsx` which is itself `'use client'`).
- Header: Badge (status) + year + name + tagline.
- 2-col body: first 2 paragraphs of `project.notes` (left) + project-specific diagram (right). Diagram picker mirrors `app/work/[slug]/page.tsx` — TaplyDiagram, UnthinkDiagram, AlgocodeDiagram, MovioDiagram, DrishtiAIDiagram, DatalineageDoctorDiagram, AirpassDiagram for the 7 dedicated slugs; `DiagramPlaceholder` for the 5 showcase projects.
- Metrics row: 4-up grid with amber mono numbers + t3 labels.
- Links row: external anchor chips (live, demo, source, video) — only renders links the project actually has.
- Footer: `<Link>` to `/work/${slug}` for the full case study + `close ↩` button.
- `max-h-[90vh] overflow-y-auto` so long-content projects (Algocode, AirPass) scroll instead of overflowing the canvas.

**`game/scenes/overlays/ProjectOverlay.tsx` (modify — ~55 lines, was stub):**
- Signature changed: `slug: string` instead of `project: ProjectItem`. The bridge's `OPEN_OVERLAY` payload carries `{slug, overlayType}`; this component does the `PROJECTS_BY_SLUG[slug]` lookup.
- Delegates to `<CaseStudyOverlay>` so the layout is single-sourced.
- Slug-not-found safety: if `PROJECTS_BY_SLUG[slug]` is undefined, fire `bridge.closeOverlay()` and return null. Prevents a broken overlay with "?" name.
- The close handler chains: parent's `onClose` (if any) → `bridge.closeOverlay()`.

**`game/scenes/overlays/VillainOverlay.tsx` (no change — still stub):**
- T4.7 fleshes this out. T4.6 only routes by `overlay.overlayType`.

**`game/index.tsx` (modify — ~50-line additions):**
- New imports: `ProjectOverlay`, `VillainOverlay`, `VillainId`.
- `overlay` state still set by `OPEN_OVERLAY` bridge event.
- Replaced inline placeholder div with new `<OverlaySlot>` component dispatch.
- New `<OverlaySlot>` component:
  - Type-dispatches on `overlay.overlayType` (`project | villain | special`).
  - **Escape key listener** — `window.addEventListener('keydown', ...)` so dismiss works regardless of focus (Phaser's keyboard plugin only listens when the canvas has focus). Cleaned up on unmount.
  - Special-overlay fallback shows a clear "T4.12 will wire this" message — keeps the slot working without breaking for the 3 special buildings until T4.12.

### Decisions

- **Compact overlay (user direction)** — Hero + 2-paragraph notes + Metrics + Links + Close. Skipped StackBreakdown, RelatedWriting, RelatedStack. ~150 lines vs the full `/work/[slug]`'s ~300.
- **Include diagram (user direction)** — matches `/work/[slug]`'s diagram set. The overlay slot has `max-h-[90vh] overflow-y-auto` so it scrolls on short screens.
- **`<CaseStudyOverlay>` at `components/overlay/`** — not under `game/` since it's game-mode-neutral. Future refactor could hoist it to also serve `/work/[slug]` to remove duplication.
- **`<ProjectOverlay>` is a thin slug-resolver** — single source of project resolution. ~55 lines vs the original stub's ~30.
- **Slug-not-found safety** — `bridge.closeOverlay()` immediately rather than render a broken overlay.
- **Esc via window listener** — Phaser's keyboard plugin only listens when canvas has focus; `window.addEventListener('keydown')` catches Esc regardless.
- **`special` overlayType shows a fallback in T4.6** — T4.12 routes Backend Diaries HQ → `/writing`, Skills Academy → `/stack`, Contact Bureau → `/contact`.
- **Diagram picker mirrors `/work/[slug]`** — same router, same 7 dedicated diagrams + DiagramPlaceholder fallback for the 5 showcase projects.

### Caveats / pending

- **Full `/work/[slug]` and `<CaseStudyOverlay>` duplicate the Hero/Metrics/BuildNotes patterns** — ~300 lines in `/work/[slug]` overlap with `CaseStudyOverlay`'s ~150. Future refactor: extract `Hero`, `Metrics`, `BuildNotes`, `StackBreakdown`, `LinksRow` into `components/work/` and have both call sites reuse them. Out of scope for T4.6.
- **Diagram card sized naturally inside its container** — if a diagram is taller than the right column, the overlay scrolls. No explicit scale/fit yet.
- **`complete` status (from `data/projects.ts`) doesn't match any `BadgeVariant`** — the cast maps to the closest variant and the display string falls through to "shipped" (already the convention used in `/work/[slug]`).
- **Mobile overlay scroll** — `max-h-[90vh] + overflow-y-auto` works on iOS / Android. Long Algocode notes scroll cleanly.
- **"Read full case study →" link is a Next.js `<Link>`** — clicking it navigates to `/work/[slug]` which unmounts the React tree, closing the overlay naturally.
- **No overlay-shown analytics yet** — would go to Vercel Analytics in Phase 6.
- **Git author identity**: per standing instruction, all commits use `connect.mahboobalam@gmail.com`.

### Verified

- `pnpm typecheck` → clean.
- `pnpm lint` → clean.
- `pnpm build` → 23 routes. 0 warnings.
- **Live URL smoke** — `/game` → 200.
- **Bundle smoke** — `CaseStudyOverlay` content (`TaplyDiagram`, `close ↩`, `read full case study`) present in the Phaser dynamic chunk. The whole case-study rendering chain is bundled into the game route's lazy chunk.

---

## T4.7 — Villain system (procedural sprite + encounter card + collision)

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-14

### What shipped

Walking into a villain now opens an honest learning-area encounter card. Three villains on the map each have:
- A procedural 32×32 canvas sprite (color-coded bg + centered letter/symbol + red "!" badge).
- An "encounter line" that greets the player when they touch.
- An HP-style progress meter (filled = `hp`/100, color `acc`).
- "What I know" / "What I'm learning" / "Active training" lists.
- "Retreat for now" + "View full stack →" buttons.

The overlap fires once per encounter (per a `villainEncounterActive` guard), pauses the player on contact, and resets when the overlay closes.

**`data/game/villains.ts` (new — ~120 lines):**
- `VillainData` interface + `VILLAINS` array (3 entries) + `VILLAIN_BY_ID` lookup map.
- Per-villain: name, title, learningArea, hp (0-100), whatIKnow, whatImLearning, activeResources, encounterLine.
- Three villains: gopher-king (Go, hp 30), terraform-titan (Terraform, hp 50), ebpf-phantom (eBPF, hp 40). Each hp value is honest self-rating, hand-updated when learning progresses.

**`game/entities/Villain.ts` (rewrite — ~125 lines):**
- Procedural 32×32 sprite via `Phaser.Textures.CanvasTexture`. The constructor checks `scene.textures.exists(key)` (idempotent guard) and draws the villain's sprite on a fresh canvas if the key isn't registered yet.
- 3-layer draw: filled rounded-rect background (palette color) + centered glyph (G / T / ∅) + red "!" badge top-right corner.
- Static `textureKeyFor(villainId)` helper returns `villain-${id}`.
- Uses `setDisplaySize(32, 32)` to keep the visual at 32×32 even though the sprite is on a 32×32 canvas.

**`game/scenes/WorldScene.ts` (modify — ~50 line additions):**
- New `private villainEncounterActive = false` field — encounter-fire-once guard.
- New `wireEncounterHandlers()` method — subscribes to `bridge.on("CLOSE_OVERLAY", ...)` to reset the guard when the overlay closes. Cleaner than coupling the flag to the duck listener.
- New `onVillainContact(villain)` method — called by the overlap callback. Stops the player (`setVelocity(0, 0)`), sets the guard, fires `bridge.openOverlay({slug, overlayType: "villain"})`.
- `createVillains()` extended: after creating the 3 Villain entities, registers `physics.add.overlap(player, villain, ...)` for each. Uses `add.overlap` (not `add.collider`) — villains are interaction zones, not walls.
- `create()` calls `this.wireEncounterHandlers()` right after `this.wireBridgeDuck()` so the CLOSE_OVERLAY listener is registered before the user can close the first overlay.

**`game/scenes/overlays/VillainOverlay.tsx` (rewrite — ~165 lines, was ~50-line stub):**
- Looks up `VILLAIN_BY_ID[villainId]`; closes overlay + returns null on miss.
- Header: amber ⚠ label + name + learning area + title.
- Blockquote encounter line (italic, muted).
- HP bar: `bg-code-bg` track + `bg-acc` filled portion (width = hp%). Honest copy: "still learning" if hp < 50, "growing confidence" otherwise.
- 2-col grid: "What I know" + "What I'm learning" bullet sections.
- "Active training" chip row (sage color).
- Footer: "view full stack →" Next.js Link to `/stack` (T3.4's D3 force graph) + "retreat for now ↩" button.
- All colors from tokens.ts (`text-amber`, `bg-amber`, `bg-acc`, `bg-code-bg`, `border-amber/40`, etc.) — no hardcoded hex.

### Decisions

- **Procedural canvas sprite (per user direction)** — `Phaser.Textures.CanvasTexture` runtime draw. Each villain has a distinct bg + glyph + red "!" badge. Heavier code than a placeholder rect, but it looks intentional. No external file needed.
- **`VILLAINS` registry (per user direction)** — new `data/game/villains.ts`. Each villain entry has 7 fields: name, title, learningArea, hp, whatIKnow, whatImLearning, activeResources, encounterLine. Plus a `VILLAIN_BY_ID` lookup map. The entity just renders the sprite; the card reads the registry.
- **HP bar = explicit static value, not auto-derived** — `hp: 30 | 50 | 40` per villain. Honest self-rating, hand-updated. No coupling to `data/stack.ts`'s `depth` field (which has undefined values for some techs; auto-derivation would break).
- **`physics.add.overlap`, not `add.collider`** — villains are interaction zones, not walls. Player walks into them, fires the encounter, can step back out.
- **Fire-once guard `villainEncounterActive`** — overlap fires per-frame; without the guard, the same overlay would re-open every frame until the player stepped out of the zone. Guard resets on `bridge.on("CLOSE_OVERLAY", ...)` so the player can re-trigger the encounter by walking back into the zone after closing the overlay.
- **`wireEncounterHandlers` separate from `wireBridgeDuck`** — both subscribe to bridge events but the concerns are different (audio vs. encounter state). Co-locating the encounter listener with the duck listener would muddle responsibilities.
- **Color rule** — all colors from tokens.ts. The two intentional off-token hex literals in `Villain.ts` (`#FFFFFF` for white text, `#E13F3F` for the alert badge red) are the only "non-token" colors and they're scoped to the procedural sprite — the encounter card itself uses 100% tokens.

### Caveats / pending

- **Sprite quality at small size** — the centered glyph (G / T / ∅) is rendered at 18px on a 32px canvas. Readable, but in a 60×50-tile world the sprite is small. Future polish: scale up the canvas to 64×64 internally and `setDisplaySize(64, 64)` on the sprite so the rendering is sharper.
- **No villain sprite-sheet sprite** — each villain has its own canvas texture, registered under `villain-${id}`. Tiled-map placement is fine; T4.8 (UIScene / HUD) might add minimap dots for villain positions, in which case the canvas-texture approach is still cleaner than a spritesheet (3 distinct keys vs. 1 with 3 frames).
- **Player can re-trigger the same villain** — the guard resets on overlay close, so the player can walk back in. This is intentional (the user can revisit the encounter to update the hp if they later update `data/game/villains.ts`), but if it feels weird, T4.x polish can add a per-villain "completed" flag.
- **No 'defeated' state** — master spec says "Animation when defeated" but the user spec for T4.7 doesn't include that. T4.x or Phase 6 polish.
- **HP bar in a low-resolution 32-px sprite** — works in a desktop browser at 1× DPI; may look chunky on retina screens. The procedural canvas texture can be regenerated at 2× via `window.devicePixelRatio` for sharper rendering on retina (out of scope for T4.7).
- **Git author identity**: per standing instruction, all commits use `connect.mahboobalam@gmail.com`.

### Verified

- `pnpm typecheck` → clean.
- `pnpm lint` → clean.
- `pnpm build` → 23 routes. 0 warnings.
- **Live URL smoke** — `/game` → 200.
- **Bundle smoke** — game chunk contains all 3 villain names + slugs + titles:
  - "Gopher King", "Terraform Titan", "eBPF Phantom"
  - "gopher-king", "terraform-titan", "ebpf-phantom"
  - "Warden of Concurrency", "Lord of Infrastructure"

---

## T4.8 — UIScene / HUD (minimap + district label + hint + controls)

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-15

### What shipped

The HUD layer runs in parallel with WorldScene. Visiting `/game` now shows:
- **Minimap** (bottom-left, ~240×200 px): 60×50 tile grid, dim border color for ground, accent-tinted rectangles for buildings, mint-green player dot. Visited tiles brighten on first entry.
- **District label** (top-right): e.g. "CLOUD RIDGE", "SAAS QUARTER". Sampled every 8 frames; "—" when > 400 px from any building.
- **"[E] Enter …" hint** (bottom-center): shown only when player is inside a Building zone. UIScene is now the first subscriber on `bridge.SHOW_INTERACTION_HINT`.
- **"WASD / Arrow keys"** (bottom-right): always visible.

**`game/scenes/UIScene.ts` (full rewrite — was 33-line stub):**
- Imports `bridge` (the missing import — T4.0 stub didn't include it).
- Imports `PROJECTS_BY_SLUG` from `data/projects.ts` (new cross-boundary import: `game/` previously had no `data/` imports).
- 4 HUD elements: `minimapBg` Graphics (3000 rects, single draw call), `minimapPlayer` Graphics (redrawn each frame), `hintText` / `districtText` / `controlsText` Text objects.
- `update()` per frame: marks the player's current tile as visited, re-draws the player dot, samples the district label.
- `bridge.on("SHOW_INTERACTION_HINT", ...)` and `bridge.on("HIDE_INTERACTION_HINT", ...)` — first subscribers on these events. Stored listener refs for clean teardown on `SHUTDOWN`.
- `scene.get("WorldScene")` to get a reference to the running WorldScene — reads `player.x` / `player.y` and iterates `buildings` for the closest-building district lookup.

**`game/scenes/WorldScene.ts` (modify — 1 line):**
- `create()` now calls `this.scene.launch("UIScene")` after `createColliders`. `launch` (not `start`) keeps WorldScene running in parallel.

**`game/index.tsx` (modify — 2 lines):**
- Imports `UIScene` and adds `new UIScene()` to the `config.scene` push. Without this, Phaser's tree-shaker dropped UIScene entirely from the production bundle (verified: the chunk had no `UIScene`/`minimapBg`/`computeDistrictLabel` strings until this fix). Phaser scenes need to be in the scene list at construction time even if they're `launch`ed later.

### Decisions

- **Coordinate scaling** — minimap at 4 px/tile, 240×200 px total, anchored at bottom-left with 12 px padding. ~37% of viewport height, clear of the player sprite.
- **Static background via `Phaser.GameObjects.Graphics`** — single draw call for 3000 tiles vs 3000 individual `add.rectangle()` game objects. Phaser batches Graphics.
- **Per-tile "visited" state** — `Set<string>` keyed by `"x,y"`. First-visit brightens the tile via `fillStyle(0x5cc9a0, 0.3)` re-draw. 3000 max entries; trivial memory cost.
- **Player dot is a separate Graphics** — redrawn each frame as a 5×5 px square centered on the player's tile.
- **District label is derived from buildings, not from a Tiled district-layer** — no district-boundary data exists. T4.8 finds the closest building by center distance and looks up `PROJECTS_BY_SLUG[slug].game_district`. Fallback "—" when > 400 px.
- **District label sampled every 8 frames** (~7.5 Hz at 60 fps) — saves ~13× per-frame work. Imperceptible to the player.
- **`launch` not `start`** — `launch` starts a scene in parallel; `start` would stop the current scene. WorldScene must keep running while UIScene draws on top.
- **UIScene must be in the config.scene list at construction time** — Phaser's tree-shaker drops classes that aren't statically referenced. T4.0 had this in the docstring but the actual import was missing. T4.8 fix: `game/index.tsx` adds `new UIScene()` to the scene push (alongside `new PreloadScene()`).
- **No grid-style minimap data** — no in-repo visual reference. 3000-rect + accent-tint approach is hand-authored to match the dark-forest-green palette.
- **No minimap player icon** — simple accent-color square. Future polish: small dev sprite or arrow pointing in facing direction.
- **Bottom-center hint, top-right district, bottom-right controls** — top-left empty for a future location-name header.

### Caveats / pending

- **First build had tree-shaking bug** — UIScene was dropped from the production bundle because nothing statically imported it. WorldScene's `this.scene.launch("UIScene")` reference is a string, not a static import. Fixed by adding `new UIScene()` to the `config.scene` push in `game/index.tsx`. **Lesson learned**: scenes need to be in the scene list even if they're `launch`ed later. Future tasks adding new scenes should follow the same pattern.
- **No minimap player icon** — a simple square. Future polish: small dev sprite or arrow pointing in the player's facing direction.
- **Visited-tile painting is additive** — drawn on top of the static background, never removed. Future polish: re-paint the entire minimap on N% visited to consolidate the layers.
- **District label updates only when close to a building** — empty space shows "—". Honest + clear.
- **No HUD for the special buildings (Backend Diaries HQ, Skills Academy, Contact Bureau)** — they show in the minimap as accent-tinted rects (same as project buildings). Their `game_district: "center"` → "CENTER" label shows when near. T4.12 will handle the special-overlay routing; HUD works unchanged.
- **The 3000-rect background draw is at startup cost** — single draw call. Future polish: use a `CanvasTexture` for the static grid so it's effectively free at runtime.
- **Hint text update via bridge is event-driven** — relies on WorldScene emitting the correct events. Verified in T4.4's `WorldScene.update()`.
- **No minimap click-to-teleport** — out of scope. The user walks. T6.x polish can add minimap clicks as "fast travel".
- **Mobile / small-screen minimap** — 240×200 px is fixed-size. On a 360 px-wide phone, minimap takes ~67% of horizontal. Phase 6 polish: scale down on small viewports.
- **The "Controls" hint doesn't react to mobile** — reads "WASD / Arrow keys" but mobile has neither. Phase 6 polish: detect touch and show "tap to walk" instead.
- **No pause indicator in the HUD** — T4.11 will add the pause menu. UIScene just provides the canvas for it; UIScene doesn't need to know about pause state.
- **Git author identity**: per standing instruction, all commits use `connect.mahboobalam@gmail.com`.

### Verified

- `pnpm typecheck` → clean. (Initial pass had 2 errors: `bridge.off()` requires the listener ref, not just the event name. Fixed by storing `showHintListener` / `hideHintListener` as instance fields.)
- `pnpm lint` → clean. (Initial pass had 1 warning: `MINIMAP_W` unused. Removed the constant.)
- `pnpm build` → 23 routes. 0 warnings.
- **Live URL smoke** — `/game` → 200.
- **Bundle smoke (post-fix)** — Phaser dynamic chunk now contains:
  - `CLOUD RIDGE`, `SAAS QUARTER`, `SYSTEMS DISTRICT`, `MEDIA ROW`, `PROTOCOL STREET`, `VISION LAB` (all 6 district labels)
  - `WASD / Arrow keys` (controls hint)
  - `minimapBg`, `minimapPlayer` (minimap Graphics objects)
  - `UIScene` class identifier
  - `computeDistrictLabel` method (private method name preserved by Turbopack)
- **Visual verify** (real browser): not run in this session due to no display — but the string presence in the Phaser chunk + clean typecheck + clean build is the structural verification. End-to-end browser testing is the user's call.
