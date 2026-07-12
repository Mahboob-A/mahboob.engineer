/**
 * game/scenes/BootScene.ts
 *
 * The first scene loaded when Phaser mounts. T4.0 only — logs a
 * console line and emits `RESUME_GAME` to the EventBridge so React
 * knows the game is alive.
 *
 * T4.3 will replace this with PreloadScene (asset loading + progress
 * bar). T4.4 will replace this with WorldScene (tilemap + player +
 * camera).
 */

import Phaser from "phaser";
import { bridge } from "@/game/EventBridge";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  /**
   * Called once after Phaser has finished setting up the renderer.
   * T4.0: emit a smoke-test log + bridge event. T4.3 will replace
   * with `this.load.image(...)` calls + a progress bar scene
   * transition.
   */
  create(): void {
    // T4.0 verification smoke test — replaced by PreloadScene progress UI in T4.3.
    console.log("[Backend City] Phaser ready");
    bridge.resumeGame();
  }
}