# Game Mode Rewrite Plan

## Goal

Rebuild game mode into a real top-down pixel-art portfolio world using the intended ChatGPT assets:

- `ChatGPT-cyberpunk-city-tileset-layout.png` for buildings, roads, sidewalks, grass, and props.
- `ChatGPT-pixel-art-developer.png` for the player character.

The current implementation renders technically, but it does not look or behave like a real game. The main issue is that the ChatGPT city image was treated like a clean 32x32 tileset, even though it is actually a labeled layout/concept sheet with distinct crop regions and a sample city preview.

## Working Constraint: Commit As You Go

Do not complete the whole rewrite and make one large commit.

Commit at meaningful states so the rewrite remains reviewable and reversible. A good commit should leave the app in a coherent state, even if the full game is not finished yet.

Recommended commit checkpoints:

1. Asset extraction scripts and generated cropped assets.
2. New city layout data model.
3. New world renderer with grass, roads, and buildings visible.
4. Player movement and animation rewrite.
5. Collision and interaction zones.
6. Overlay bridge integration restored.
7. HUD/minimap restored.
8. Cleanup of old tilemap-based code.

Before each commit:

- Run targeted lint/typecheck for touched files.
- Manually smoke test `/game` if the commit affects runtime behavior.
- Keep the commit focused on one meaningful layer of the rewrite.

## Keep From The Existing Game

The following parts are useful and should be preserved unless they block the rewrite:

- `/game` route.
- Desktop-only gate.
- Mode selector and `?entered=1` behavior.
- `/api/mode` cookie behavior.
- React to Phaser `EventBridge`.
- Project overlays.
- Villain overlays.
- Special overlays.
- Pause menu.
- Audio registry and existing audio files.
- Project, stack, contact, and villain data registries.
- Navbar behavior that switches back to flat mode when navigating away from game mode.

## Rewrite Completely

The following parts should be replaced:

- Current tilemap rendering path.
- Current `public/assets/maps/backend-city.json` visual dependency.
- Current use of `public/assets/tilesets/backend-city.json` as a Phaser tileset.
- Fake/repeated ground tile layer.
- Building visuals derived from tile IDs.
- Player scaling hack if it depends on oversized source frames directly.
- Any code assuming the ChatGPT city sheet is a uniform 32x32 tileset.

## Phase 1: Asset Audit And Extraction

Inspect the two source assets:

- `ChatGPT-cyberpunk-city-tileset-layout.png`
- `ChatGPT-pixel-art-developer.png`

Create a repeatable asset extraction workflow. Prefer a script over manual one-off image edits so future crop tuning is easy.

Suggested outputs:

```txt
public/assets/game/buildings/
public/assets/game/terrain/
public/assets/game/props/
public/assets/game/player/
game/assets/manifest.ts
```

Crop the city sheet into usable sprites:

- Buildings:
  - server farm
  - studio
  - lab
  - newspaper HQ
  - office tower
  - exchange
- Terrain:
  - grass base
  - grass variation
  - road straight horizontal
  - road straight vertical
  - road turn
  - intersection
  - sidewalk horizontal
  - sidewalk vertical
- Props:
  - trees
  - lamps
  - signs
  - small tech props

Important rules:

- Do not render labels from the source image.
- Do not render palette swatches.
- Do not render the sample preview region directly.
- Normalize cropped sprites so Phaser receives clean transparent or rectangular PNGs.

## Phase 2: Player Asset Rewrite

Use `ChatGPT-pixel-art-developer.png` as the character source.

Expected behavior:

- 4 directions: down, up, left, right.
- 4 frames per direction.
- Display size approximately 32x48.
- Idle state preserves the last movement direction.
- Movement supports WASD and arrow keys.

If the source sheet is 1024x1536 and contains a 4x4 grid, each raw frame is likely 256x384. The implementation should slice these frames and scale display size intentionally, not accidentally.

## Phase 3: New City Layout Data Model

Create a clean layout source instead of depending on Tiled JSON for visuals.

Suggested file:

```txt
game/world/city-layout.ts
```

Suggested shape:

```ts
export const CITY_LAYOUT = {
  world: { width: 1920, height: 1600, tileSize: 32 },
  spawn: { x: 960, y: 880 },
  roads: [],
  buildings: [],
  villains: [],
  districts: [],
};
```

Each building should define its visual sprite, collision area, entrance area, and overlay target:

```ts
{
  id: "taply",
  name: "Taply HQ",
  slug: "taply",
  type: "project",
  sprite: "exchange",
  x: 720,
  y: 520,
  width: 220,
  height: 260,
  entrance: { x: 830, y: 790 },
  interaction: { x: 760, y: 760, width: 180, height: 70 },
  collision: { x: 720, y: 540, width: 220, height: 210 },
  district: "Founder District"
}
```

Special buildings should also live here:

- Backend Diaries HQ: opens writing.
- Skills Academy: opens stack.
- Contact Bureau: opens contact.

Villains should live in the same world model:

- Gopher King.
- Terraform Titan.
- eBPF Phantom.

## Phase 4: New World Renderer

Rewrite `game/scenes/WorldScene.ts` around explicit rendering steps:

```txt
create()
  startBGM()
  wireBridgeDuck()
  createBackground()
  createRoads()
  createSidewalks()
  createBuildings()
  createProps()
  createPlayer()
  createVillains()
  createCollisions()
  createInteractionZones()
  createCamera()
  setupInput()
  launchUI()
```

Rendering strategy:

- Fill the world with a repeated grass base.
- Draw roads from planned rectangles or path segments.
- Draw sidewalks around building entrances.
- Render buildings as large cropped sprites, not tile IDs.
- Place props after roads but before/around buildings.
- Sort depth by `y` so player/buildings overlap naturally.

The city should resemble the sample city section of the ChatGPT asset, but should be authored as real game objects.

## Phase 5: Collision And Interaction

Collisions:

- Buildings should have solid collision rectangles.
- Props can have smaller collision rectangles where useful.
- Player should not walk through buildings.
- Player should spawn on a path, not inside a collision area.

Interactions:

- Each building gets an invisible interaction rectangle near its entrance.
- On overlap, show a HUD hint like `[E] Enter Taply HQ`.
- On `E`, emit through the existing bridge:

```ts
bridge.openOverlay({
  overlayType: "project",
  slug: building.slug,
});
```

Special buildings emit `overlayType: "special"`.

Villain encounters emit `overlayType: "villain"`.

## Phase 6: HUD And Minimap

Keep or rewrite `UIScene`, but base it on the new city layout model.

HUD requirements from `portfolio-master-doc.md`:

- Top-left minimap.
- Top-right `BACKEND CITY` title plus current district.
- Bottom-center interaction hint.
- Bottom-right controls hint.

Minimap strategy:

- Scale the 1920x1600 world into a compact panel.
- Draw roads/buildings as simple rectangles.
- Draw player as a mint dot.
- Current district can be calculated from player position.

## Phase 7: Vertical Slice Before Full City

Build a small working slice before rebuilding every project building.

Vertical slice requirements:

- Grass background.
- Connected road/path.
- Three distinct cropped buildings.
- Player spawns on path.
- Player walks with correct animations.
- Player cannot walk through buildings.
- One project overlay opens with `E`.
- ESC pause still works.
- Audio still works.

Only after this slice looks like a game should the rest of Backend City be filled in.

## Phase 8: Full Backend City Layout

Expand the city to include:

- All project buildings.
- Three special buildings.
- Three villains.
- Multiple districts.
- Roads and sidewalks connecting all important locations.
- Props for visual life.

The player should always have an obvious navigable route from spawn to every building.

## Phase 9: Remove Broken Tilemap Path

After the rewritten renderer works, remove or archive the broken tilemap path:

- `this.make.tilemap({ key: "backend-city" })`
- `public/assets/maps/backend-city.json` as visual source.
- `public/assets/tilesets/backend-city.json` as visual source.
- Embedded/external tileset workaround.

Do not delete files blindly if they are useful as references. Prefer moving responsibility away from them first, then remove in a cleanup commit.

## Phase 10: Verification Checklist

Manual runtime checks:

- `/game` loads.
- Click `Enter Game`.
- Loading reaches 100%.
- No black screen.
- No tilemap parsing error.
- No missing scene error.
- Music starts after user gesture.
- City has distinct buildings.
- Roads and sidewalks are visible.
- Player appears at a sensible spawn point.
- Movement works.
- Camera follows player.
- Buildings block movement.
- Interaction hint appears near entrances.
- Project overlays open.
- Special overlays open.
- Villain overlays open.
- ESC pause menu works.
- Navbar links switch back to flat mode.

Visual checks:

- The city should look like a real top-down pixel game.
- The scene should not show repeated strips from the source image.
- The scene should not show labels from the source sheet.
- The scene should not show palette swatches.
- The scene should not show the full sample preview as a single pasted image.
- Building scale should feel consistent with the player.

Code checks:

- Run targeted eslint on touched files.
- Run `pnpm typecheck`.
- Run full lint when unrelated lint issues are either fixed or intentionally documented.

