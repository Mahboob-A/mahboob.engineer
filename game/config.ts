/**
 * game/config.ts
 *
 * Phaser game config. Single source of truth for viewport size,
 * renderer settings, and the scene list.
 *
 * Viewport math:
 *   - 30 tiles × 32 px = 960 px wide (visible)
 *   - 20 tiles × 32 px = 640 px tall (visible)
 *   - World is 60 × 50 tiles = 1920 × 1600 px; the camera pans.
 *
 * Hex color note: `backgroundColor` takes a literal CSS color
 * string — Phaser doesn't accept CSS variables. We use `#0d1511`
 * here, which exactly mirrors `colors.codeBg` from data/tokens.ts.
 * This is the only hex value in the game module; all other colors
 * (when added in T4.x) will read from CSS vars on the parent
 * container and apply via game objects' fill properties.
 *
 * Scene list is intentionally empty in this config — `game/index.tsx`
 * pushes BootScene at runtime. Later tasks (T4.3+) will append
 * PreloadScene, WorldScene, UIScene.
 */

import Phaser from "phaser";

/* Viewport constants — exported so Phaser scenes and React can
   agree on dimensions without re-magic-numbering. */
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 640;
export const TILE_SIZE = 32;

/* World bounds — the camera pans inside this rectangle. */
export const WORLD_WIDTH = 60 * TILE_SIZE; // 1920 px
export const WORLD_HEIGHT = 50 * TILE_SIZE; // 1600 px

/** Build a fresh Phaser game config. Called once per mount. */
export function createPhaserConfig(): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: "phaser-root",
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#0d1511",
    pixelArt: true,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false, // flip to true during local dev for collider visualization
      },
    },
    scene: [],
  };
}