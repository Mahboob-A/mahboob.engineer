/**
 * game/entities/Player.ts
 *
 * Player sprite + arcade physics body + movement + animations.
 *
 * T4.0: extends Phaser.Physics.Arcade.Sprite with a constructor that
 *        accepts an optional texture key. Default `__PLACEHOLDER__`
 *        for backward compat.
 *
 * T4.4: constructor accepts textureKey so WorldScene can pass the
 *        real spritesheet key ("developer") loaded by PreloadScene.
 *
 * T4.5: adds movement + walk animations.
 *   - WASD / arrow keys drive velocity at PLAYER_SPEED (160 px/sec
 *     per master §5.5), normalized for diagonal movement.
 *   - 4 walk animations registered via `createAnimations()`: down,
 *     up, left, right — 4 frames each, 10 fps, looped.
 *   - Idle = `anims.stop()` + `setFrame(<facing idle index>)`. No
 *     separate idle animation needed (a single frame doesn't need
 *     one).
 *
 * Frame index convention (matches developer.json):
 *   - down:  rows 0-3   (idle = 1)
 *   - up:    rows 4-7   (idle = 5)
 *   - left:  rows 8-11  (idle = 9)
 *   - right: rows 12-15 (idle = 13)
 *   - idle is frame index 1 within each row (the canonical
 *     "hands-on-laptop" pose, per developer.json's `idleFrame`).
 */

import Phaser from "phaser";

/* Movement constants — defaults match master §5.5 ("160 px/sec"). */
const PLAYER_SPEED = 160;
/* Walk animation frame rate (frames per second). 10fps × 4 frames =
   400ms per cycle ≈ 2.5 cycles/sec — natural walking pace. */
const WALK_FRAME_RATE = 10;

/* Sprite-sheet row ranges. Hardcoded here so the entity is
   self-contained; the canonical source remains developer.json. */
type Facing = "down" | "up" | "left" | "right";
const ROWS: Record<Facing, { start: number; end: number }> = {
  down: { start: 0, end: 3 },
  up: { start: 4, end: 7 },
  left: { start: 8, end: 11 },
  right: { start: 12, end: 15 },
};

/* Default idle-frame offset within each row (per developer.json
   `idleFrame: 1`). The actual idle frame index = ROWS[facing].start + 1. */
const IDLE_FRAME_OFFSET = 1;

/* Animation keys — exported so WorldScene (or future consumers like
   the pause menu's sprite debug) can reference them. */
export const PLAYER_ANIMS = {
  walkDown: "player-walk-down",
  walkUp: "player-walk-up",
  walkLeft: "player-walk-left",
  walkRight: "player-walk-right",
} as const;

export class Player extends Phaser.Physics.Arcade.Sprite {
  /** Last facing direction — used to pick the correct idle frame
   *  on stop. Defaults to 'down' (matches the SpawnPoint orientation
   *  in backend-city.json which leaves the player facing the camera). */
  public facing: Facing = "down";

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string = "__PLACEHOLDER__",
  ) {
    super(scene, x, y, textureKey);
  }

  /**
   * T4.5: register the 4 walk animations. Call from WorldScene.create()
   * after PreloadScene has loaded the 'developer' spritesheet.
   *
   * - The spritesheet texture (`developer`) was loaded with
   *   `frameWidth: 256, frameHeight: 384` per PreloadScene's
   *   `load.spritesheet` call.
   * - `generateFrameNumbers(spritesheet, {start, end})` returns the
   *   AnimationFrame[] for those indices.
   * - `frameRate: 10, repeat: -1` = looped walk cycle.
   */
  public createAnimations(): void {
    const scene = this.scene;
    scene.anims.create({
      key: PLAYER_ANIMS.walkDown,
      frames: scene.anims.generateFrameNumbers("developer", ROWS.down),
      frameRate: WALK_FRAME_RATE,
      repeat: -1,
    });
    scene.anims.create({
      key: PLAYER_ANIMS.walkUp,
      frames: scene.anims.generateFrameNumbers("developer", ROWS.up),
      frameRate: WALK_FRAME_RATE,
      repeat: -1,
    });
    scene.anims.create({
      key: PLAYER_ANIMS.walkLeft,
      frames: scene.anims.generateFrameNumbers("developer", ROWS.left),
      frameRate: WALK_FRAME_RATE,
      repeat: -1,
    });
    scene.anims.create({
      key: PLAYER_ANIMS.walkRight,
      frames: scene.anims.generateFrameNumbers("developer", ROWS.right),
      frameRate: WALK_FRAME_RATE,
      repeat: -1,
    });
  }

  /**
   * T4.5: read WASD / arrow keys via the scene's keyboard plugin
   * (created by `createCursorKeys()`), set velocity, and switch
   * the walk animation. Called every frame from WorldScene.update().
   *
   * Velocity is normalized for diagonal motion so |v| doesn't exceed
   * PLAYER_SPEED. Animation pick is dominant-direction (horizontal
   * when |vx| ≥ |vy|, vertical otherwise) — this avoids flip-flopping
   * when the player holds, say, W+ D while moving mostly up.
   */
  public updateMovement(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    const body = this.body as Phaser.Physics.Arcade.Body | undefined;
    if (!body) return;

    let vx = 0;
    let vy = 0;
    if (cursors.left?.isDown) vx -= PLAYER_SPEED;
    if (cursors.right?.isDown) vx += PLAYER_SPEED;
    if (cursors.up?.isDown) vy -= PLAYER_SPEED;
    if (cursors.down?.isDown) vy += PLAYER_SPEED;

    /* Normalize diagonals (Phaser's built-in `normalize()` is in
       the Phaser.Math.Vector2D utility; for vx/vy primitives we do
       it inline since we're working with Physics.Arcade.Body's
       setVelocity directly). */
    if (vx !== 0 && vy !== 0) {
      const len = Math.sqrt(vx * vx + vy * vy);
      const scale = PLAYER_SPEED / len;
      vx *= scale;
      vy *= scale;
    }

    this.setVelocity(vx, vy);

    if (vx === 0 && vy === 0) {
      this.stopMoving();
      return;
    }

    /* Pick animation by dominant direction. */
    if (Math.abs(vx) >= Math.abs(vy)) {
      if (vx > 0) {
        this.facing = "right";
        this.anims.play(PLAYER_ANIMS.walkRight, true);
      } else {
        this.facing = "left";
        this.anims.play(PLAYER_ANIMS.walkLeft, true);
      }
    } else {
      if (vy > 0) {
        this.facing = "down";
        this.anims.play(PLAYER_ANIMS.walkDown, true);
      } else {
        this.facing = "up";
        this.anims.play(PLAYER_ANIMS.walkUp, true);
      }
    }
  }

  /**
   * T4.5: stop moving. Called from updateMovement() when velocity is
   * zero. Stops the walk animation + pins the sprite to the idle
   * frame of the last facing direction.
   *
   * No separate idle animation is registered — for a still frame,
   * `anims.stop()` + `setFrame(idleIndex)` is cheaper and cleaner.
   */
  public stopMoving(): void {
    this.setVelocity(0, 0);
    this.anims.stop();
    this.setFrame(ROWS[this.facing].start + IDLE_FRAME_OFFSET);
  }
}