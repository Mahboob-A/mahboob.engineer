/**
 * Layout-driven Backend City world scene.
 *
 * This renderer intentionally avoids the old Tiled JSON path. The ChatGPT
 * city image is a concept sheet, so the game now renders named cropped
 * sprites from `public/assets/game/*` and positions them with
 * `CITY_LAYOUT`.
 */

import Phaser from "phaser";
import { bridge } from "@/game/EventBridge";
import { BGM_TRACKS, BGM_VOLUME } from "@/game/audio/registry";
import { Player, type MovementKeys } from "@/game/entities/Player";
import { Building } from "@/game/entities/Building";
import { Villain } from "@/game/entities/Villain";
import {
  CITY_LAYOUT,
  districtForPoint,
  type Rect,
} from "@/game/world/city-layout";
import type {
  BuildingAssetKey,
  PropAssetKey,
  TerrainAssetKey,
} from "@/game/assets/manifest";

const PLAYER_DISPLAY_WIDTH = 44;
const PLAYER_DISPLAY_HEIGHT = 66;

function buildingKey(key: BuildingAssetKey): string {
  return `building-${key}`;
}

function terrainKey(key: TerrainAssetKey): string {
  return `terrain-${key}`;
}

function propKey(key: PropAssetKey): string {
  return `prop-${key}`;
}

function rectCenter(rect: Rect): { x: number; y: number } {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

export class WorldScene extends Phaser.Scene {
  public player?: Player;
  public buildings: Building[] = [];

  private bgm: Phaser.Sound.BaseSound | null = null;
  private isDucked = false;
  private isMuted = false;
  private movementKeys!: MovementKeys;
  private currentZone: Building | null = null;
  private villainEncounterActive = false;
  private villainEncounterCooldownUntil = 0;
  private collisionZones: Phaser.GameObjects.Zone[] = [];
  private villains: Villain[] = [];
  private closeOverlayListener?: () => void;

  constructor() {
    super({ key: "WorldScene" });
  }

  create(): void {
    this.startBGM();
    this.wireBridgeDuck();
    this.wireEncounterHandlers();
    this.createBackground();
    this.createRoads();
    this.createBuildings();
    this.createProps();
    this.createPlayer();
    this.createVillains();
    this.createColliders();
    this.setupInput();
    this.createCamera();
    this.scene.launch("UIScene");
  }

  update(_time: number, _delta: number): void {
    void _time;
    void _delta;
    this.player?.updateMovement(this.movementKeys);
    if (this.player) {
      this.player.setDepth(this.player.y + 24);
    }
    this.maybeLeaveBuildingZone();
  }

  private startBGM(): void {
    const trackPath = Phaser.Math.RND.pick(
      BGM_TRACKS as unknown as string[],
    );
    const bgmKey = trackPath.split("/").pop()?.replace(/\.[^.]+$/, "");
    if (!bgmKey) return;

    const sound = this.sound.add(bgmKey, {
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
    });
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.sound.setMute(this.isMuted);
  }

  private wireEncounterHandlers(): void {
    this.closeOverlayListener = () => {
      this.villainEncounterActive = false;
      this.villainEncounterCooldownUntil = this.time.now + 900;
    };
    bridge.on("CLOSE_OVERLAY", this.closeOverlayListener);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.closeOverlayListener) {
        bridge.off("CLOSE_OVERLAY", this.closeOverlayListener);
      }
      this.villainEncounterActive = false;
    });
  }

  private createBackground(): void {
    const { width, height } = CITY_LAYOUT.world;
    this.add
      .tileSprite(
        width / 2,
        height / 2,
        width,
        height,
        terrainKey("grassPlain"),
      )
      .setDepth(0);

    for (let x = 96; x < width; x += 240) {
      for (let y = 96; y < height; y += 220) {
        const key = (x + y) % 3 === 0 ? "grassFlower" : "grassDetail";
        this.add
          .image(x, y, terrainKey(key))
          .setAlpha(0.42)
          .setDepth(0.5);
      }
    }
  }

  private createRoads(): void {
    for (const road of CITY_LAYOUT.roads) {
      this.add
        .tileSprite(
          road.x + road.width / 2,
          road.y + road.height / 2,
          road.width,
          road.height,
          terrainKey(road.sprite),
        )
        .setDepth(1);
    }

    for (const building of CITY_LAYOUT.buildings) {
      this.add
        .tileSprite(
          building.interaction.x + building.interaction.width / 2,
          building.interaction.y + building.interaction.height / 2,
          building.interaction.width + 32,
          42,
          terrainKey("sidewalkPlain"),
        )
        .setAlpha(0.9)
        .setDepth(2);
    }
  }

  private createBuildings(): void {
    for (const building of CITY_LAYOUT.buildings) {
      this.add
        .image(building.x, building.y, buildingKey(building.sprite))
        .setOrigin(0, 0)
        .setScale(building.scale)
        .setDepth(building.y + 260);

      const interactionCenter = rectCenter(building.interaction);
      const zone = new Building(
        this,
        interactionCenter.x,
        interactionCenter.y,
        building.interaction.width,
        building.interaction.height,
        building.slug,
        building.overlayType,
        `[E] Enter ${building.name}`,
      );
      this.add.existing(zone);
      this.physics.add.existing(zone, true);
      this.buildings.push(zone);

      const collision = this.createStaticZone(building.collision);
      this.collisionZones.push(collision);
    }
  }

  private createProps(): void {
    for (const prop of CITY_LAYOUT.props) {
      const sprite = this.add
        .image(prop.x, prop.y, propKey(prop.sprite))
        .setScale(prop.scale ?? 1)
        .setDepth(prop.y + 12);
      if (prop.collision) {
        this.collisionZones.push(this.createStaticZone(prop.collision));
      }
      sprite.setName(prop.id);
    }
  }

  private createPlayer(): void {
    this.player = new Player(
      this,
      CITY_LAYOUT.spawn.x,
      CITY_LAYOUT.spawn.y,
      "developer",
    );
    this.player.setDisplaySize(PLAYER_DISPLAY_WIDTH, PLAYER_DISPLAY_HEIGHT);
    this.player.setDepth(this.player.y + 24);
    this.add.existing(this.player);
    this.physics.add.existing(this.player);
    this.player.createAnimations();
    this.player.stopMoving();

    const body = this.player.body as Phaser.Physics.Arcade.Body | undefined;
    body?.setSize(28, 32);
    body?.setOffset(34, 96);
  }

  private createVillains(): void {
    for (const villainLayout of CITY_LAYOUT.villains) {
      const villain = new Villain(
        this,
        villainLayout.x,
        villainLayout.y,
        villainLayout.id,
      );
      villain.setDepth(villain.y + 16);
      this.add.existing(villain);
      this.physics.add.existing(villain);
      this.villains.push(villain);
    }
  }

  private createColliders(): void {
    if (!this.player) return;

    this.player.setCollideWorldBounds(true);
    for (const zone of this.collisionZones) {
      this.physics.add.collider(this.player, zone);
    }
    for (const zone of this.buildings) {
      this.physics.add.overlap(
        this.player,
        zone,
        (_player, building) => this.onEnterBuildingZone(building as Building),
      );
    }
    for (const villain of this.villains) {
      this.physics.add.overlap(
        this.player,
        villain,
        (_player, v) => this.onVillainContact(v as Villain),
      );
    }
  }

  private setupInput(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) return;

    keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.W,
      Phaser.Input.Keyboard.KeyCodes.A,
      Phaser.Input.Keyboard.KeyCodes.S,
      Phaser.Input.Keyboard.KeyCodes.D,
      Phaser.Input.Keyboard.KeyCodes.E,
    ]);

    const arrows = keyboard.createCursorKeys();
    const wasd = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
    }) as Record<string, Phaser.Input.Keyboard.Key>;

    this.movementKeys = {
      up: [arrows.up, wasd.up],
      down: [arrows.down, wasd.down],
      left: [arrows.left, wasd.left],
      right: [arrows.right, wasd.right],
    };

    wasd.interact.on("down", () => {
      if (!this.currentZone) return;
      bridge.openOverlay({
        slug: this.currentZone.slug,
        overlayType: this.currentZone.overlayType,
        title: this.currentZone.hint.replace(/^\[E\]\s*/, ""),
      });
    });
  }

  private createCamera(): void {
    const cam = this.cameras.main;
    cam.setBounds(0, 0, CITY_LAYOUT.world.width, CITY_LAYOUT.world.height);
    cam.setBackgroundColor("#0d1511");
    if (this.player) {
      cam.startFollow(this.player, true, 0.1, 0.1);
    }
    this.physics.world.setBounds(
      0,
      0,
      CITY_LAYOUT.world.width,
      CITY_LAYOUT.world.height,
    );
  }

  private createStaticZone(rect: Rect): Phaser.GameObjects.Zone {
    const center = rectCenter(rect);
    const zone = this.add.zone(center.x, center.y, rect.width, rect.height);
    this.physics.add.existing(zone, true);
    return zone;
  }

  private onEnterBuildingZone(zone: Building): void {
    if (this.currentZone === zone) return;
    this.currentZone = zone;
    bridge.showInteractionHint(zone.hint);
  }

  private onVillainContact(villain: Villain): void {
    if (this.villainEncounterActive) return;
    if (this.time.now < this.villainEncounterCooldownUntil) return;
    this.villainEncounterActive = true;
    this.player?.setVelocity(0, 0);
    bridge.openOverlay({
      slug: villain.villainId,
      overlayType: "villain",
    });
  }

  private maybeLeaveBuildingZone(): void {
    if (!this.currentZone || !this.player) return;
    const zoneBody = this.currentZone.body as Phaser.Physics.Arcade.StaticBody;
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const overlaps =
      playerBody.x < zoneBody.x + zoneBody.width &&
      playerBody.x + playerBody.width > zoneBody.x &&
      playerBody.y < zoneBody.y + zoneBody.height &&
      playerBody.y + playerBody.height > zoneBody.y;
    if (!overlaps) {
      this.currentZone = null;
      bridge.hideInteractionHint();
    }
  }

  public currentDistrictName(): string {
    if (!this.player) return "Backend City";
    return districtForPoint(this.player.x, this.player.y)?.name ?? "Backend City";
  }
}
