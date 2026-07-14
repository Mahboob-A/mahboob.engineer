/**
 * game/scenes/PreloadScene.ts
 *
 * The first scene that runs when the canvas mounts. Loads:
 *   - 1 tileset image (`PHASER_ASSETS.tileset.png`, single image)
 *   - 1 dev sprite (`PHASER_ASSETS.sprite.png`, 4×4 frames at 256×384 each)
 *   - 6 SFX buffers (footstep / zone-enter / overlay-open /
 *     overlay-close / villain-bump / ui-click)
 *   - 8 BGM tracks (bgm-1 … bgm-8, mp3)
 *
 * Progress UI: a Phaser.Graphics rectangle that fills 0→1 as the
 * Loader fires `Phaser.Loader.Events.PROGRESS`. Background bar in
 * the border color; filled bar in the accent color. Centered
 * horizontally, ~70% down the canvas vertically.
 *
 * On completion (`Phaser.Loader.Events.COMPLETE`), logs
 * `[Backend City] assets ready` and transitions to WorldScene.
 *
 * Color note: `Phaser.Display.Color` accepts hex integers directly
 * (0xRRGGBB). All hex values used in this file mirror the
 * data/tokens.ts palette — kept in sync manually because Phaser
 * doesn't read CSS vars.
 */

import Phaser from "phaser";
import { PHASER_ASSETS, GAME_WIDTH, GAME_HEIGHT } from "@/game/config";
import { SFX, BGM_TRACKS } from "@/game/audio/registry";

/* Hex colors that mirror the token palette. These are the only hex
   literals in this file — same exception as config.ts's
   backgroundColor. Phaser can't read CSS vars from data/tokens.ts. */
const COLOR_BORDER = 0x334e3c; // mirrors tokens.border
const COLOR_ACC = 0x5cc9a0;     // mirrors tokens.acc

/* Progress bar geometry */
const BAR_WIDTH = 320;
const BAR_HEIGHT = 6;
const BAR_Y = GAME_HEIGHT * 0.7; // ~70% down

export class PreloadScene extends Phaser.Scene {
  /** The progress bar's filled (left-truncated) rectangle. */
  private progressBar: Phaser.GameObjects.Rectangle | null = null;
  /** Status caption above the bar. */
  private statusText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: "PreloadScene" });
  }

  /**
   * Phaser calls preload() before any rendering. This is where all
   * `this.load.*` calls live. Once all assets load, Phaser fires
   * COMPLETE and we transition to WorldScene in create().
   */
  preload(): void {
    /* 1. Tileset PNG (a single image; per-tile cropping happens in
         WorldScene.create via `setTexture('tileset', tileId)`). */
    this.load.image("tileset", PHASER_ASSETS.tileset.png);

    /* 2. Dev sprite — 4×4 grid of frames at 256×384 each. Player.ts
         (T4.5) reads developer.json for animation setup; the loader
         here uses hardcoded frame dims to keep PreloadScene
         self-contained. */
    this.load.spritesheet("developer", PHASER_ASSETS.sprite.png, {
      frameWidth: 256,
      frameHeight: 384,
    });

    /* 3. SFX — one buffer per file. Keys are derived from the SFX
         object literal in registry.ts. */
    for (const [key, path] of Object.entries(SFX)) {
      this.load.audio(key, path);
    }

    /* 4. BGM — N tracks via loop. Adding a new mp3 = add one entry
         to BGM_TRACKS in registry.ts. The buffer key is derived from
         the filename ("bgm-1.mp3" → "bgm-1") so WorldScene can
         re-derive it for `this.sound.play(key)`. */
    for (const path of BGM_TRACKS) {
      const filename = path.split("/").pop() ?? "";
      const key = filename.replace(/\.[^.]+$/, "");
      this.load.audio(key, path);
    }

    /* 5. Tilemap (Tiled JSON). WorldScene (T4.4) reads the cached key
         "backend-city" via `this.make.tilemap({key: "backend-city"})`.
         T4.2 verifies the JSON parses + the asset loads; T4.4 builds
         the actual map. */
    this.load.tilemapTiledJSON("backend-city", PHASER_ASSETS.tilemap.json);

    /* ─── Progress bar UI ──────────────────────────────────────────
       Three Phaser.GameObjects laid over the canvas:
         - status text caption ("loading… 0%")
         - background bar (border color, 320×6)
         - filled bar (accent color, growing 0→320)
       Repositioned once on RESIZE. Listens to PROGRESS events.    */
    this.statusText = this.add
      .text(GAME_WIDTH / 2, BAR_Y - 20, "loading… 0%", {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#9ac0a0", // mirrors tokens.t2
      })
      .setOrigin(0.5, 0.5);

    this.add
      .rectangle(GAME_WIDTH / 2, BAR_Y, BAR_WIDTH, BAR_HEIGHT, COLOR_BORDER)
      .setOrigin(0.5, 0.5);

    this.progressBar = this.add
      .rectangle(
        GAME_WIDTH / 2 - BAR_WIDTH / 2,
        BAR_Y,
        0,
        BAR_HEIGHT,
        COLOR_ACC,
      )
      .setOrigin(0, 0.5);

    this.load.on(
      Phaser.Loader.Events.PROGRESS,
      (progress: number) => {
        if (this.progressBar) {
          this.progressBar.width = BAR_WIDTH * progress;
        }
        if (this.statusText) {
          this.statusText.setText(
            `loading… ${Math.round(progress * 100)}%`,
          );
        }
      },
    );
  }

  /**
   * Phaser calls create() once preload() finishes + assets are ready.
   * We log + transition to WorldScene.
   */
  create(): void {
    console.log("[Backend City] assets ready");
    this.scene.start("WorldScene");
  }
}