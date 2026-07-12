/**
 * game/scenes/UIScene.ts
 *
 * The HUD layer — runs in parallel with WorldScene and renders on
 * top of it. T4.8 will flesh this out with:
 *   - Top-left minimap (60×50 grid, visited=bright, unvisited=dark)
 *   - Top-right "BACKEND CITY" title + district name (updates as
 *     player moves zones)
 *   - Bottom-center interaction hint "[E] Enter" when near a
 *     building (subscribed to bridge.on('SHOW_INTERACTION_HINT', ...))
 *   - Bottom-right controls hint "WASD / Arrow keys"
 *
 * Until then, this file declares the class so the game config can
 * reference it when T4.8 wires it in.
 */

import Phaser from "phaser";

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: "UIScene" });
  }

  /**
   * T4.8 placeholder. Will:
   *   - subscribe to bridge.on('SHOW_INTERACTION_HINT', ...)
   *   - render minimap + district label + control hints
   *   - update player dot on minimap each frame
   */
  create(): void {
    // T4.8: HUD layer.
  }
}