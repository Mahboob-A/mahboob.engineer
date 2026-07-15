/**
 * game/scenes/UIScene.ts
 *
 * HUD layer that runs in parallel with WorldScene. T4.8 fleshes this
 * out from the T4.0 stub:
 *
 *   - Minimap: 60×50 tile grid at the bottom-left of the viewport
 *     (~240×200 px, 4 px/tile). All tiles are dim; building rects
 *     are accent-tinted; tiles the player has walked over brighten
 *     on first entry. A small mint-green dot tracks the player.
 *   - District label: top-right, derived from the closest building's
 *     `game_district` (data/projects.ts). Sampled every 8 frames.
 *   - "[E] Enter" hint: bottom-center, shown only when the player is
 *     inside a Building zone. UIScene is the first subscriber on
 *     bridge.SHOW_INTERACTION_HINT.
 *   - Controls hint: bottom-right, always visible ("WASD / Arrow keys").
 *
 * The UIScene is launched in parallel from WorldScene.create via
 * `this.scene.launch('UIScene')`. WorldScene reference is fetched via
 * `this.scene.get('WorldScene')` and read each frame for the player
 * position + buildings list.
 *
 * Performance:
 *   - 3000 tiles drawn in a single Graphics.fillRect() loop on
 *     create() — one draw call, batched by Phaser.
 *   - Player dot redrawn each frame (3×3 px square, cheap).
 *   - District label updated every 8 frames (~7.5 Hz) to avoid
 *     per-frame `find` over 15 buildings.
 *   - Hint text only updated when SHOW_INTERACTION_HINT fires.
 */

import Phaser from "phaser";
import { bridge } from "@/game/EventBridge";
import { PROJECTS_BY_SLUG } from "@/data/projects";
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from "@/game/config";
import type { Building } from "@/game/entities/Building";

/* Layout constants. */
const MINIMAP_TILE = 4;            // px per minimap tile
const MINIMAP_PAD = 12;            // px from viewport edge
const MINIMAP_H = 50 * MINIMAP_TILE; // 200 (minimap height in px)
const MINIMAP_X = MINIMAP_PAD;
const MINIMAP_Y = GAME_HEIGHT - MINIMAP_H - MINIMAP_PAD;

const TEXT_FONT_SIZE = 11;
const FONT_MONO = '"JetBrains Mono", monospace';

/* Hex values mirror the token palette — documented inline so the
   few non-token literals are explicit. tokens.t2 = #9ac0a0, tokens.acc
   = #5cc9a0, tokens.border = #334e3c, tokens.codeBg = #0d1511. */
const COL = {
  border: 0x334e3c,
  borderAlpha: 0.3,
  borderVisited: 0x5cc9a0,  // acc-tinted for visited tiles
  borderVisitedAlpha: 0.3,
  buildingTint: 0x5cc9a0,
  buildingTintAlpha: 0.5,
  player: 0x5cc9a0,
  textT2: "#9ac0a0",
  textAcc: "#5cc9a0",
};

/* Format district name for the top-right label. */
const DISTRICT_LABELS: Record<string, string> = {
  cloud_ridge: "CLOUD RIDGE",
  systems_district: "SYSTEMS DISTRICT",
  saas_quarter: "SAAS QUARTER",
  media_row: "MEDIA ROW",
  protocol_street: "PROTOCOL STREET",
  vision_lab: "VISION LAB",
  center: "CENTER",
};

/* How far the player can be from the nearest building before we
   stop claiming a district. 400 px is roughly half a tile-grid
   square — far enough to mean "you're in empty space", close
   enough to feel natural. */
const DISTRICT_PROXIMITY_SQ = 400 * 400;

/* Per-frame district-label update interval. 8 frames at 60 fps =
   7.5 Hz. Imperceptible to the player; saves ~13x per-frame work. */
const DISTRICT_UPDATE_INTERVAL = 8;

export class UIScene extends Phaser.Scene {
  /** Reference to WorldScene. Populated in create() via
   *  `this.scene.get("WorldScene")`. Typed structurally — UIScene
   *  doesn't import WorldScene (avoids a circular dependency). */
  private world?: Phaser.Scene & {
    player?: { x: number; y: number };
    buildings: Building[];
  };

  /* Minimap graphics. The background draws all 3000 tiles once;
     the player dot redraws each frame. */
  private minimapBg!: Phaser.GameObjects.Graphics;
  private minimapPlayer!: Phaser.GameObjects.Graphics;

  /** Set of "tx,ty" strings for tiles the player has entered.
   *  Re-drawing the tile's rect on first visit brightens it. */
  private visitedTiles: Set<string> = new Set();

  /* HUD text elements. */
  private districtText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private controlsText!: Phaser.GameObjects.Text;

  /** Frame counter for sampled district-label update. */
  private frameCount = 0;

  /** Listener refs (stored so we can pass them back to bridge.off on
   *  scene shutdown — bridge.off requires the same function ref). */
  private showHintListener?: (hint: string) => void;
  private hideHintListener?: () => void;

  constructor() {
    super({ key: "UIScene" });
  }

  create(): void {
    /* Cache the WorldScene reference. `this.scene.get` returns the
       live scene instance; UIScene reads player.x / player.y from
       it each frame. */
    this.world = this.scene.get("WorldScene") as UIScene["world"];

    this.buildMinimap();
    this.buildDistrictText();
    this.buildHintText();
    this.buildControlsText();

    /* First subscriber on SHOW_INTERACTION_HINT / HIDE_INTERACTION_HINT.
       WorldScene already emits these; we just render the result. */
    this.showHintListener = (hint: string) => {
      this.hintText.setText(hint);
      this.hintText.setVisible(true);
    };
    this.hideHintListener = () => {
      this.hintText.setVisible(false);
    };
    bridge.on("SHOW_INTERACTION_HINT", this.showHintListener);
    bridge.on("HIDE_INTERACTION_HINT", this.hideHintListener);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.showHintListener) {
        bridge.off("SHOW_INTERACTION_HINT", this.showHintListener);
      }
      if (this.hideHintListener) {
        bridge.off("HIDE_INTERACTION_HINT", this.hideHintListener);
      }
    });
  }

  /**
   * Build the minimap: 60×50 ground tiles (dim border) + tinted
   * building rectangles + a separate Graphics for the player dot.
   * The static parts are drawn once in create(); the player dot
   * is redrawn each frame in update().
   */
  private buildMinimap(): void {
    this.minimapBg = this.add.graphics();
    this.minimapBg.setDepth(10);

    /* 3000 ground tiles in one Graphics object. */
    for (let tx = 0; tx < 60; tx++) {
      for (let ty = 0; ty < 50; ty++) {
        this.minimapBg.fillStyle(COL.border, COL.borderAlpha);
        this.minimapBg.fillRect(
          MINIMAP_X + tx * MINIMAP_TILE,
          MINIMAP_Y + ty * MINIMAP_TILE,
          MINIMAP_TILE,
          MINIMAP_TILE,
        );
      }
    }

    /* Tint the rect under each building. Convert Tiled pixel coords
       (x, y, width, height) to minimap tile units. We then re-draw
       the same tile bounds with the building tint. */
    if (this.world) {
      for (const b of this.world.buildings) {
        const tx0 = Math.floor(b.x / TILE_SIZE);
        const ty0 = Math.floor(b.y / TILE_SIZE);
        const tw = Math.max(1, Math.floor(b.width / TILE_SIZE));
        const th = Math.max(1, Math.floor(b.height / TILE_SIZE));
        for (let dx = 0; dx < tw; dx++) {
          for (let dy = 0; dy < th; dy++) {
            const tx = tx0 + dx;
            const ty = ty0 + dy;
            if (tx < 0 || tx >= 60 || ty < 0 || ty >= 50) continue;
            this.minimapBg.fillStyle(
              COL.buildingTint,
              COL.buildingTintAlpha,
            );
            this.minimapBg.fillRect(
              MINIMAP_X + tx * MINIMAP_TILE,
              MINIMAP_Y + ty * MINIMAP_TILE,
              MINIMAP_TILE,
              MINIMAP_TILE,
            );
          }
        }
      }
    }

    /* Player dot — redrawn each frame in update(). */
    this.minimapPlayer = this.add.graphics();
    this.minimapPlayer.setDepth(11);
  }

  private buildDistrictText(): void {
    this.districtText = this.add
      .text(GAME_WIDTH - MINIMAP_PAD, MINIMAP_PAD, "—", {
        fontFamily: FONT_MONO,
        fontSize: TEXT_FONT_SIZE,
        color: COL.textT2,
      })
      .setOrigin(1, 0)
      .setDepth(12);
  }

  private buildHintText(): void {
    this.hintText = this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT - MINIMAP_PAD - 16,
        "",
        {
          fontFamily: FONT_MONO,
          fontSize: TEXT_FONT_SIZE,
          color: COL.textAcc,
        },
      )
      .setOrigin(0.5, 1)
      .setVisible(false)
      .setDepth(12);
  }

  private buildControlsText(): void {
    this.controlsText = this.add
      .text(
        GAME_WIDTH - MINIMAP_PAD,
        GAME_HEIGHT - MINIMAP_PAD,
        "WASD / Arrow keys",
        {
          fontFamily: FONT_MONO,
          fontSize: TEXT_FONT_SIZE,
          color: COL.textT2,
        },
      )
      .setOrigin(1, 1)
      .setDepth(12);
  }

  /**
   * Per-frame loop. Three responsibilities:
   *   1. Mark the player's current tile as visited (first time only)
   *      and re-draw it brighter.
   *   2. Redraw the player dot at the player's tile coord.
   *   3. Update the district label (sampled every 8 frames).
   */
  update(_time: number, _delta: number): void {
    void _time;
    void _delta;
    if (!this.world || !this.world.player) return;

    const px = this.world.player.x;
    const py = this.world.player.y;
    const tileX = Math.floor(px / TILE_SIZE);
    const tileY = Math.floor(py / TILE_SIZE);
    const tileKey = `${tileX},${tileY}`;

    /* First-visit brightening. Set add + redraw the tile's bg. */
    if (!this.visitedTiles.has(tileKey)) {
      this.visitedTiles.add(tileKey);
      if (tileX >= 0 && tileX < 60 && tileY >= 0 && tileY < 50) {
        this.minimapBg.fillStyle(
          COL.borderVisited,
          COL.borderVisitedAlpha,
        );
        this.minimapBg.fillRect(
          MINIMAP_X + tileX * MINIMAP_TILE,
          MINIMAP_Y + tileY * MINIMAP_TILE,
          MINIMAP_TILE,
          MINIMAP_TILE,
        );
      }
    }

    /* Player dot. 5×5 px square (centered on the tile) so it's
       visible at the minimap scale. */
    this.minimapPlayer.clear();
    this.minimapPlayer.fillStyle(COL.player, 1);
    this.minimapPlayer.fillRect(
      MINIMAP_X + tileX * MINIMAP_TILE - 2,
      MINIMAP_Y + tileY * MINIMAP_TILE - 2,
      5,
      5,
    );

    /* Sampled district-label update. */
    this.frameCount++;
    if (this.frameCount >= DISTRICT_UPDATE_INTERVAL) {
      this.frameCount = 0;
      this.districtText.setText(this.computeDistrictLabel(px, py));
    }
  }

  /**
   * Find the closest building to (px, py) and return its formatted
   * district name. Returns "—" if the player is too far from any
   * building (> 400 px, per DISTRICT_PROXIMITY_SQ).
   */
  private computeDistrictLabel(px: number, py: number): string {
    if (!this.world) return "—";

    let bestDistSq = Number.POSITIVE_INFINITY;
    let bestSlug: string | null = null;
    for (const b of this.world.buildings) {
      const cx = b.x + (b.width ?? 0) / 2;
      const cy = b.y + (b.height ?? 0) / 2;
      const dx = px - cx;
      const dy = py - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestDistSq) {
        bestDistSq = d2;
        bestSlug = b.slug;
      }
    }
    if (bestSlug === null || bestDistSq > DISTRICT_PROXIMITY_SQ) return "—";
    const project = PROJECTS_BY_SLUG[bestSlug];
    if (!project) return "—";
    return (
      DISTRICT_LABELS[project.game_district] ??
      project.game_district.toUpperCase()
    );
  }
}