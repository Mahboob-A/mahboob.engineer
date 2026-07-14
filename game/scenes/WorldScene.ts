/**
 * game/scenes/WorldScene.ts
 *
 * The main game scene. T4.4 fleshes out:
 *   - Tilemap load via `make.tilemap({key: "backend-city"})` (cached by
 *     PreloadScene in T4.3).
 *   - Tileset image registration.
 *   - Ground tile layer rendering.
 *   - Player entity at SpawnPoint (default visible, no movement yet —
 *     T4.5 attaches WASD/arrow handlers + walk-cycle animations).
 *   - Building zones per Buildings[] object-layer entries (E-key fires
 *     bridge.openOverlay when overlapping).
 *   - Villain entities per Villains[] entries (physics-only, no visual
 *     yet — T4.7 adds sprites).
 *   - Camera bounds + follow with lerp 0.1.
 *
 * T4.3 also wired the BGM + bridge ducking logic which remains unchanged.
 */

import Phaser from "phaser";
import { bridge } from "@/game/EventBridge";
import { BGM_TRACKS, BGM_VOLUME } from "@/game/audio/registry";
import { Player } from "@/game/entities/Player";
import { Building } from "@/game/entities/Building";
import { Villain } from "@/game/entities/Villain";
import type { OverlayType, VillainId } from "@/game/types";

/* Player sprite scale factor — 256x384 native / scale ≈ 0.13 → ~33x50,
   close to master spec's 32x48. */
const PLAYER_SCALE = 0.13;

/* Building zone inset — the Tiled rect is the building sprite's visual
   footprint (220x260). Inset by this much so walking past a building
   doesn't trigger zone overlap. */
const BUILDING_ZONE_INSET = 20;

/* Villain visual offset — sprites default to centered on coords, but
   Tiled objects are top-left. Offset +16 (half of 32, the spawn
   point's width/height) so the visual center sits on the spawn. */
const VILLAIN_VISUAL_OFFSET = 16;

interface TiledObjectProperties {
  slug?: string;
  type?: string;
  villainId?: string;
  name?: string;
}

export class WorldScene extends Phaser.Scene {
  /** Active BGM sound object — set by startBGM(). */
  private bgm: Phaser.Sound.BaseSound | null = null;
  /** Active BGM buffer key — derived from the picked track path. */
  private bgmKey: string | null = null;
  /** True while an overlay is open (BGM is ducked). */
  private isDucked = false;
  /** True while the user has muted audio via the pause menu. */
  private isMuted = false;

  /** Tilemap + ground layer (created in createMap). */
  private tilemap?: Phaser.Tilemaps.Tilemap;
  /** addTilesetImage returns Tileset | null — coerced to undefined
   *  for field typing. */
  private tileset: Phaser.Tilemaps.Tileset | undefined;
  /** createLayer returns TilemapLayer | TilemapGPULayer (no null).
   *  We use TilemapLayer as the concrete runtime type — TilemapGPULayer
   *  would only apply if we passed `gpu: true` to createLayer. */
  private groundLayer?: Phaser.Tilemaps.TilemapLayer;

  /** Player + collision-against zones. */
  private player?: Player;
  private buildings: Building[] = [];
  private villains: Villain[] = [];

  /** Currently-overlapping Building zone (for hint show/hide). */
  private currentZone: Building | null = null;

  constructor() {
    super({ key: "WorldScene" });
  }

  /**
   * Bootstraps the entire scene in deterministic order:
   *   1. BGM playback (T4.3)
   *   2. Bridge event subscriptions for overlay ducking (T4.3)
   *   3. Map + entities + camera + input (T4.4)
   */
  create(): void {
    this.startBGM();
    this.wireBridgeDuck();
    this.createMap();
    this.createEntities();
    this.createCamera();
    this.setupInput();
  }

  /* ─────────────────────────────────────────────────────────────────────
     T4.3 — Audio (BGM + duck + mute)
     ───────────────────────────────────────────────────────────────────── */

  private startBGM(): void {
    const trackPath = Phaser.Math.RND.pick(
      BGM_TRACKS as unknown as string[],
    );
    this.bgmKey =
      trackPath.split("/").pop()?.replace(/\.[^.]+$/, "") ?? null;
    if (!this.bgmKey) return;

    const sound = this.sound.add(this.bgmKey, {
      loop: true,
      volume: BGM_VOLUME.base,
    });
    sound.play();
    this.bgm = sound;
  }

  private setBgmVolume(volume: number): void {
    if (!this.bgm) return;
    (this.bgm as Phaser.Sound.WebAudioSound).setVolume(volume);
  }

  private wireBridgeDuck(): void {
    const onOpen = (): void => {
      if (!this.isDucked) {
        this.setBgmVolume(BGM_VOLUME.ducked);
        this.isDucked = true;
      }
    };
    const onClose = (): void => {
      if (this.isDucked) {
        this.setBgmVolume(BGM_VOLUME.base);
        this.isDucked = false;
      }
    };

    bridge.on("OPEN_OVERLAY", onOpen);
    bridge.on("CLOSE_OVERLAY", onClose);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      bridge.off("OPEN_OVERLAY", onOpen);
      bridge.off("CLOSE_OVERLAY", onClose);
      this.sound.stopAll();
      this.bgm = null;
      this.bgmKey = null;
    });
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.sound.setMute(this.isMuted);
  }

  /* ─────────────────────────────────────────────────────────────────────
     T4.4 — Map, entities, camera, input, zone overlap
     ───────────────────────────────────────────────────────────────────── */

  /**
   * Read the cached 'backend-city' tilemap (loaded by PreloadScene),
   * register the tileset image (loaded by PreloadScene as key
   * 'tileset'), and create the Ground layer.
   */
  private createMap(): void {
    this.tilemap = this.make.tilemap({ key: "backend-city" });
    /* The Tiled tileset JSON's `name` field is "tileset" and the loaded
       Phaser image is also keyed "tileset" — same key.
       addTilesetImage returns Tileset | null; we coerce to undefined
       so the field type matches. */
    this.tileset = this.tilemap.addTilesetImage("tileset", "tileset") ?? undefined;
    if (!this.tileset) {
      console.warn(
        "[Backend City] tileset 'tileset' not found in cached map; aborting createMap",
      );
      return;
    }
    /* createLayer returns TilemapLayer | TilemapGPULayer (no null).
       We use the CPU TilemapLayer — TilemapGPULayer would only apply
       if we passed gpu: true (T6.x polish). The cast is safe. */
    const layer = this.tilemap.createLayer(
      "Ground",
      this.tileset,
      0,
      0,
    ) as Phaser.Tilemaps.TilemapLayer | undefined;
    if (!layer) {
      console.warn("[Backend City] could not create Ground layer");
      return;
    }
    this.groundLayer = layer;
    /* No collidable tiles yet — T4.5 may add building-wall collisions. */
    this.groundLayer.setCollisionByProperty({ collides: false });
  }

  /**
   * Spawns the Player at SpawnPoint, then iterates the Buildings and
   * Villains object layers to create entities. Each Building is a
   * Phaser.GameObjects.Zone with a static physics body; each Villain
   * gets a physics body but no visual (T4.7 swaps in a sprite).
   */
  private createEntities(): void {
    this.createPlayer();
    this.createBuildings();
    this.createVillains();
  }

  private createPlayer(): void {
    if (!this.tilemap) return;
    const spawnLayer = this.tilemap.getObjectLayer("SpawnPoint");
    /* Phaser 4's Tilemap.findObject takes a callback, not a name. Iterate
       the layer's `objects` array directly to find the spawn by name. */
    const spawn = spawnLayer?.objects.find((o) => o.name === "player");
    const x = spawn?.x ?? 928;
    const y = spawn?.y ?? 832;

    this.player = new Player(this, x, y, "developer");
    /* Scale 256x384 → ~33x50 to match master §5.5's 32x48 spec. */
    this.player.setScale(PLAYER_SCALE);
    /* add.existing + physics.add.existing is the Phaser 4 canonical
       idiom for placing a non-pool object into a scene's display +
       physics lists without a Phaser factory function. */
    this.add.existing(this.player);
    this.physics.add.existing(this.player);
  }

  private createBuildings(): void {
    if (!this.tilemap) return;
    const buildingsLayer = this.tilemap.getObjectLayer("Buildings");
    if (!buildingsLayer) return;

    for (const obj of buildingsLayer.objects) {
      const props = readTiledProperties(obj);
      const slug = props.slug ?? "";
      if (!slug) continue;
      const overlayType = (props.type as OverlayType) ?? "project";
      const hint =
        overlayType === "special"
          ? "Enter"
          : (props.name ?? slug);

      const zone = new Building(
        this,
        obj.x! + BUILDING_ZONE_INSET,
        obj.y! + BUILDING_ZONE_INSET,
        obj.width! - BUILDING_ZONE_INSET * 2,
        obj.height! - BUILDING_ZONE_INSET * 2,
        slug,
        overlayType,
        hint,
      );
      /* physics.add.existing(obj, true) — true = static body. Zone
         geometries never move; collision checks should be O(1). */
      this.physics.add.existing(zone, true);
      this.buildings.push(zone);
    }
  }

  private createVillains(): void {
    if (!this.tilemap) return;
    const villainsLayer = this.tilemap.getObjectLayer("Villains");
    if (!villainsLayer) return;

    for (const obj of villainsLayer.objects) {
      const props = readTiledProperties(obj);
      const villainId = (props.villainId as VillainId) ?? "gopher-king";
      const villain = new Villain(
        this,
        (obj.x ?? 0) + VILLAIN_VISUAL_OFFSET,
        (obj.y ?? 0) + VILLAIN_VISUAL_OFFSET,
        villainId,
      );
      this.physics.add.existing(villain);
      this.villains.push(villain);
    }
  }

  /**
   * Camera bounds 0,0 → 1920,1600 (matches map size per master §5.5).
   * Follows the Player with lerp 0.1.
   */
  private createCamera(): void {
    const cam = this.cameras.main;
    cam.setBounds(0, 0, 1920, 1600);
    if (this.player) {
      cam.startFollow(this.player, true, 0.1, 0.1);
    }
  }

  /**
   * E-key listener — fires `bridge.openOverlay()` when the player
   * overlaps any Building zone at the moment of keypress.
   */
  private setupInput(): void {
    this.input.keyboard?.on("keydown-E", () => {
      if (!this.player) return;
      for (const b of this.buildings) {
        if (this.physics.overlap(this.player, b)) {
          bridge.openOverlay({
            slug: b.slug,
            overlayType: b.overlayType,
          });
          return;
        }
      }
    });
  }

  /**
   * Per-frame loop. Tracks which Building zone the player is
   * currently overlapping and emits the appropriate bridge event
   * (SHOW_INTERACTION_HINT on enter, HIDE on exit). Phaser 4 has no
   * "on-overlap-exit" callback, so we compute it manually each tick.
   */
  update(_time: number, _delta: number): void {
    void _time;
    void _delta;
    if (!this.player) return;

    const nextZone =
      this.buildings.find((b) => this.physics.overlap(this.player!, b)) ??
      null;
    if (nextZone === this.currentZone) return;

    if (nextZone) {
      bridge.showInteractionHint(nextZone.hint);
    } else if (this.currentZone) {
      bridge.hideInteractionHint();
    }
    this.currentZone = nextZone;
  }
}

/* ─────────────────────────────────────────────────────────────────────
   Module-private helper
   ───────────────────────────────────────────────────────────────────── */

/**
 * Read a Tiled object's custom properties into a flat object.
 * Tiled's `obj.properties` is `{name, type, value}[]` — we flatten to
 * `{[name]: value}` keyed by the property name.
 */
function readTiledProperties(
  obj: Phaser.Types.Tilemaps.TiledObject,
): TiledObjectProperties {
  const out: TiledObjectProperties = {};
  if (obj.properties) {
    for (const p of obj.properties) {
      const name = p.name as keyof TiledObjectProperties;
      const value = p.value as TiledObjectProperties[typeof name];
      if (name === "slug") out.slug = String(value);
      else if (name === "type") out.type = String(value);
      else if (name === "villainId") out.villainId = String(value);
      else if (name === "name") out.name = String(value);
    }
  }
  return out;
}