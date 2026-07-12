/**
 * game/scenes/WorldScene.ts
 *
 * The main game scene. T4.4 will flesh this out with:
 *   - load `/public/assets/maps/backend-city.json` tilemap
 *   - create player sprite at the SpawnPoint object
 *   - loop over the Buildings object layer, create invisible
 *     interaction zones per building
 *   - loop over the Villains object layer, place villain entities
 *   - camera follow with lerp 0.1
 *   - WASD/arrow movement handled by Player (T4.5)
 *   - zone overlap → bridge.showInteractionHint(hint)
 *   - E key in zone → bridge.openOverlay({ slug, overlayType })
 *   - launch UIScene in parallel (HUD)
 *
 * Until then, this file declares the class so the game config can
 * reference it when T4.4 wires it in.
 */

import Phaser from "phaser";

export class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: "WorldScene" });
  }

  /**
   * T4.4 placeholder. The full create() will be ~150 lines:
   *   createMap / createPlayer / createColliders / createZones /
   *   createCamera / createUI / setupInput.
   */
  create(): void {
    // T4.4: build out the city.
  }

  /**
   * T4.4 placeholder. World tick — handle per-frame logic
   * (camera lerp, zone overlap detection, etc.).
   */
  update(_time: number, _delta: number): void {
    void _time;
    void _delta;
    // T4.4: update camera follow, check zone overlaps.
  }
}