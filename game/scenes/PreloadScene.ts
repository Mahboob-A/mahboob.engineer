/**
 * game/scenes/PreloadScene.ts
 *
 * Asset preload + progress UI. T4.3 will flesh this out with:
 *   - `this.load.image('tileset', '/assets/tilesets/...')`
 *   - `this.load.spritesheet('developer', '/assets/sprites/...', {...})`
 *   - `this.load.tilemapTiledJSON('backend-city', '/assets/maps/...')`
 *   - Progress bar callback (`this.load.on('progress', ...)`)
 *   - Scene transition to WorldScene on completion.
 *
 * Until then, this file declares the class so the game config can
 * reference it without import errors when we wire it in.
 */

import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  /**
   * T4.3 placeholder. Will:
   *   - load the chosen tileset + sprite + tilemap
   *   - render a progress bar in the center of the canvas
   *   - on completion, call `this.scene.start('WorldScene')`
   */
  preload(): void {
    // T4.3: this.load.image(...); this.load.spritesheet(...);
  }

  create(): void {
    /* T4.3: transition to WorldScene.
       this.scene.start("WorldScene"); */
  }
}