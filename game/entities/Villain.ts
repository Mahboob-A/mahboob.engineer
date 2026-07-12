/**
 * game/entities/Villain.ts
 *
 * Villain encounter entity — 3 placed on the map (Gopher King,
 * Terraform Titan, eBPF Phantom). T4.7 will flesh this out with:
 *   - Sprite rendering (uses dev-sprite set from T4.1)
 *   - HP bar (visual feedback for "encounter progress")
 *   - On player overlap → bridge.openOverlay({ slug: villainId,
 *     overlayType: "villain" })
 *   - Animation when defeated (post-encounter)
 *
 * Until then, this file declares the class so the type system is
 * satisfied when T4.7 wires it in.
 */

import Phaser from "phaser";
import type { VillainId } from "@/game/types";

export class Villain extends Phaser.Physics.Arcade.Sprite {
  readonly villainId: VillainId;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    villainId: VillainId,
  ) {
    super(scene, x, y, "__PLACEHOLDER__");
    this.villainId = villainId;
  }
}