/**
 * game/scenes/WorldScene.ts
 *
 * The main game scene. T4.3 wires the audio side:
 *   - Pick a random BGM track from `BGM_TRACKS` and loop it at
 *     `BGM_VOLUME.base` (0.25).
 *   - On `OPEN_OVERLAY` bridge event: duck the BGM to
 *     `BGM_VOLUME.ducked` (0.08).
 *   - On `CLOSE_OVERLAY`: restore to base.
 *   - Expose `toggleMute()` for UIScene's pause menu (T4.11).
 *   - On scene shutdown: unsubscribe bridge listeners + `stopAll()`
 *     to free memory.
 *
 * T4.4+ adds the rest: tilemap / player / colliders / zones /
 * camera. The audio wiring is independent of those — once T4.3
 * lands, every subsequent task can call `this.sound.play(SFX.footstep)`
 * and similar without re-implementing the BGM plumbing.
 */

import Phaser from "phaser";
import { bridge } from "@/game/EventBridge";
import { BGM_TRACKS, BGM_VOLUME } from "@/game/audio/registry";

export class WorldScene extends Phaser.Scene {
  /** Active BGM sound object. Cast to BaseSound (Phaser's supertype);
   *  ducking / mute calls use `setVolume` + `setMute` which both
   *  WebAudio and HTML5AudioSound implement. */
  private bgm: Phaser.Sound.BaseSound | null = null;
  /** Active BGM buffer key — derived from the picked track path. */
  private bgmKey: string | null = null;
  /** True while an overlay is open (BGM is ducked). */
  private isDucked = false;
  /** True while the user has muted audio via the pause menu. */
  private isMuted = false;

  constructor() {
    super({ key: "WorldScene" });
  }

  /**
   * Set up BGM playback + bridge listeners for ducking. T4.4 will
   * expand `createMap()` with the actual tilemap rendering.
   */
  create(): void {
    this.startBGM();
    this.wireBridgeDuck();
    this.createMap();
  }

  /**
   * T4.2 placeholder. T4.4 will:
   *   - this.make.tilemap({ key: "backend-city" }) → Phaser.Tilemaps.Tilemap
   *   - this.tilemap.addTilesetImage("tileset", "tileset")
   *   - create Ground layer (this.tilemap.createLayer("Ground", tileset, 0, 0))
   *   - loop Buildings object layer → create Building zones per rect
   *   - loop Villains object layer → place Villain entities
   *   - read SpawnPoint object layer → spawn Player at (x, y)
   *   - this.cameras.main.setBounds(0, 0, 1920, 1600)
   *   - this.cameras.main.startFollow(player, true, 0.1, 0.1)
   *   - this.physics.world.setBounds(0, 0, 1920, 1600)
   */
  private createMap(): void {
    // No-op for T4.2; the JSON loads into Phaser's cache via
    // PreloadScene, but actual rendering lands in T4.4.
  }

  /**
   * Pick a random BGM track from the registry, derive its buffer
   * key from the filename (same convention PreloadScene uses),
   * add it to the sound manager, and start it on a loop at the
   * base volume.
   *
   * Implementation note: Phaser 4's `SoundManager.play()` returns
   * a boolean, not the sound. The pattern here is `add()` first
   * (returns `BaseSound`), then `play()` on that instance. We
   * store the sound so we can call `setVolume` later for ducking.
   */
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

  /**
   * Subscribe to bridge OPEN_OVERLAY / CLOSE_OVERLAY events for
   * BGM ducking. The listeners are unsubscribed on scene shutdown
   * to prevent memory leaks if the user navigates away and back.
   *
   * Cast note: Phaser 4 declares `setVolume` only on the concrete
   * `WebAudioSound` and `HTML5AudioSound` subclasses — not on the
   * `BaseSound` supertype. Both implementations add it at runtime,
   * so the cast is safe regardless of which audio backend
   * Phaser picks. Centralized here so callers don't repeat the
   * cast inline.
   */
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

  /**
   * Called by UIScene's pause-menu "Toggle sound" item (T4.11).
   * Flips the mute state on the entire Phaser sound manager
   * (affects BGM + all SFX). Local `isMuted` flag keeps the toggle
   * idempotent — calling twice returns to the original state.
   */
  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.sound.setMute(this.isMuted);
  }

  /**
   * T4.4 placeholder. World tick — handle per-frame logic
   * (camera lerp, zone overlap detection, etc.).
   */
  update(_time: number, _delta: number): void {
    void _time;
    void _delta;
    // T4.4: update camera follow, check zone overlaps.
  }
}