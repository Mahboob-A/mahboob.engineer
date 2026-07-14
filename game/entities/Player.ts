/**
 * game/entities/Player.ts
 *
 * Player sprite + arcade physics body. T4.5 will flesh this out with:
 *   - 4-directional WASD/arrow movement at 160 px/sec
 *   - 4-frame walk cycle per direction (sprite sheet from T4.1)
 *   - Idle animation when stopped
 *
 * T4.4 update: constructor now accepts `textureKey` so WorldScene
 * can pass the real texture key ("developer", loaded by PreloadScene
 * from /assets/sprites/developer.png) instead of the
 * "__PLACEHOLDER__" stub key. Default keeps backward compat.
 */

import Phaser from "phaser";

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string = "__PLACEHOLDER__",
  ) {
    super(scene, x, y, textureKey);
  }
}