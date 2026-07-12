/**
 * game/entities/Player.ts
 *
 * Player sprite + arcade physics body. T4.5 will flesh this out with:
 *   - 4-directional WASD/arrow movement at 160 px/sec
 *   - 4-frame walk cycle per direction (sprite sheet from T4.1)
 *   - Idle animation when stopped
 *   - Camera follow target (WorldScene.attachCamera)
 *
 * Until then, this file declares the class so the type system is
 * satisfied when T4.5 wires it in.
 */

import Phaser from "phaser";

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    /* `__PLACEHOLDER__` is a Phaser texture key that never resolves
       (no asset loaded under that name). T4.5 replaces this with the
       real sprite key chosen in T4.1. The body still gets created
       so collision math works in T4.5 once assets land. */
    super(scene, x, y, "__PLACEHOLDER__");
  }
}