/**
 * game/entities/Building.ts
 *
 * Interaction zone wrapping a building. T4.4 will flesh this out:
 *   - Constructor takes (scene, x, y, width, height, slug,
 *     overlayType, hint)
 *   - Inherits Phaser.GameObjects.Zone for invisible collision body
 *   - On overlap with Player → bridge.showInteractionHint(hint)
 *   - On E key in zone → bridge.openOverlay({ slug, overlayType })
 *   - On exit → bridge.hideInteractionHint()
 *
 * Until then, this file declares the class so the type system is
 * satisfied when T4.4 wires it in.
 */

import Phaser from "phaser";
import type { OverlayType, ProjectSlug } from "@/game/types";

export class Building extends Phaser.GameObjects.Zone {
  /** Project slug this building represents (or villain id, etc.). */
  readonly slug: string;
  /** What kind of overlay opens when entering. */
  readonly overlayType: OverlayType;
  /** Text shown in the [E] hint when the player is nearby. */
  readonly hint: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    slug: ProjectSlug,
    overlayType: OverlayType,
    hint: string = "Enter",
  ) {
    super(scene, x, y, width, height);
    this.slug = slug;
    this.overlayType = overlayType;
    this.hint = hint;
  }
}