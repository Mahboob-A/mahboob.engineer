/**
 * game/entities/Villain.ts
 *
 * Villain encounter entity — 3 placed on the map at fixed positions
 * (set by WorldScene.createVillains in T4.4). T4.7 fleshes this out:
 *
 *   - Procedural 32×32 sprite generated at runtime via
 *     `Phaser.Textures.CanvasTexture`. Each villain has a distinct
 *     color (gopher-king=#0E1C2C, terraform-titan=#1E1608,
 *     ebpf-phantom=#1E1030) with a centered letter/symbol + a red
 *     "!" badge at the top-right corner.
 *   - The sprite is registered as `villain-${id}` in the scene's
 *     texture manager. Idempotent — `textures.exists()` guard so
 *     duplicate spawns (defensive) don't double-register.
 *   - HP bar / encounter card lives in `VillainOverlay.tsx` and
 *     `data/game/villains.ts` — the entity itself is just a sprite +
 *     physics body.
 *
 *   - On player overlap → WorldScene fires `bridge.openOverlay`
 *     (with `villainEncounterActive` guard so the callback only
 *     fires once per encounter).
 *
 * Implementation note: `document.createElement` is browser-only.
 * That's fine — Villain only ever lives inside the Phaser dynamic
 * chunk loaded via `dynamic(..., { ssr: false })` (master §6 rule #5).
 */

import Phaser from "phaser";
import type { VillainId } from "@/game/types";

/* Villain sprite style — hex values mirror the token palette (the same
   hexes the user can read directly in `tokens.ts → colors`). The
   dark backgrounds here match the kwDark palette's tile colors so
   the villain visually echoes the chip color it would resolve to:
     - gopher-king  → sage   → bg `#0E1C2C` (kwDark[1] slate — used for general dark UI)
     - terraform-titan → amber  → bg `#1E1608` (kwDark[2] amber dark)
     - ebpf-phantom → mauve  → bg `#1E1030` (kwDark[3] mauve dark)
   White text is `#FFFFFF` and the alert badge is `#E13F3F` — these
   are the only "off-token" colors, used intentionally because
   sprite visuals need a non-palette contrast layer. */
const VILLAIN_STYLE: Record<
  VillainId,
  { bg: string; fg: string; glyph: string }
> = {
  "gopher-king":     { bg: "#0E1C2C", fg: "#FFFFFF", glyph: "G" },
  "terraform-titan": { bg: "#1E1608", fg: "#FFFFFF", glyph: "T" },
  "ebpf-phantom":    { bg: "#1E1030", fg: "#FFFFFF", glyph: "∅" },
};

const ALERT_RED = "#E13F3F";
const SPRITE_SIZE = 32;

export class Villain extends Phaser.Physics.Arcade.Sprite {
  readonly villainId: VillainId;

  /**
   * Sprite key used by this villain class. Each villainId registers
   * its own key (`villain-gopher-king`, etc.) so 3 villains on the
   * map = 3 distinct keys. Idempotent: if the same key is requested
   * twice, we skip re-registration.
   */
  static readonly TEXTURE_PREFIX = "villain-";

  static textureKeyFor(villainId: VillainId): string {
    return `${Villain.TEXTURE_PREFIX}${villainId}`;
  }

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    villainId: VillainId,
  ) {
    const key = Villain.textureKeyFor(villainId);

    /* Register the procedural canvas texture once per villain id.
       `textures.exists` is the official idempotency check in Phaser
       4 — true if a texture with that key is already registered. */
    if (!scene.textures.exists(key)) {
      const canvas = document.createElement("canvas");
      canvas.width = SPRITE_SIZE;
      canvas.height = SPRITE_SIZE;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        Villain.drawVillainSprite(ctx, villainId);
        scene.textures.addCanvas(key, canvas);
      }
    }

    super(scene, x, y, key);
    this.villainId = villainId;

    /* Set display size so the 32×32 canvas reads well in a 60×50-tile
       world (32 px tiles). Future polish can scale by HP. */
    this.setDisplaySize(SPRITE_SIZE, SPRITE_SIZE);
  }

  /**
   * Draw the villain's 32×32 procedural sprite on the supplied
   * CanvasRenderingContext2D. Three layers:
   *   1. Filled rounded-rect background (villain's palette color).
   *   2. Centered letter/symbol (white).
   *   3. Top-right "!" alert badge (red circle with white !).
   */
  private static drawVillainSprite(
    ctx: CanvasRenderingContext2D,
    villainId: VillainId,
  ): void {
    const style = VILLAIN_STYLE[villainId];

    /* Layer 1 — background. Slight padding so the border reads. */
    ctx.fillStyle = style.bg;
    ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

    /* Layer 2 — centered glyph. Bold sans-serif, vertically centered
       with the typographic baseline at ~22 px. */
    ctx.fillStyle = style.fg;
    ctx.font =
      "bold 18px 'JetBrains Mono', 'Menlo', 'Consolas', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(style.glyph, SPRITE_SIZE / 2, SPRITE_SIZE / 2 + 1);

    /* Layer 3 — top-right "!" alert badge. 8-px red circle + white !. */
    const badgeRadius = 4;
    const badgeCx = SPRITE_SIZE - 5;
    const badgeCy = 5;
    ctx.fillStyle = ALERT_RED;
    ctx.beginPath();
    ctx.arc(badgeCx, badgeCy, badgeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 7px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", badgeCx, badgeCy + 0.5);
  }
}