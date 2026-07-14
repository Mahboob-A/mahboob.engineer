/**
 * game/audio/registry.ts
 *
 * Single source of truth for audio assets. Adding a new BGM track =
 * drop the file into /public/assets/audio/ + add one entry to
 * BGM_TRACKS below. No other code changes needed.
 *
 * Adding a new SFX = add a new key to the SFX object literal below.
 * Consumers (WorldScene, UIScene, overlays) reference SFX.<name>
 * for type-safe access to the Phaser audio buffer keys.
 */

/* AUDIO_BASE is hard-coded to /assets/audio/ rather than pulled from
   PHASER_ASSETS. PHASER_ASSETS is shaped for {png, json} pairs;
   audio is a single-path array, so coupling them would require an
   awkward shape change. The base path lives here once. */
const AUDIO_BASE = "/assets/audio";

/* ─────────────────────────────────────────────────────────────────────
   SFX — short sounds triggered by gameplay events.
   Keys become Phaser audio buffer names
   (`this.sound.play(SFX.footstep)` resolves to the 'footstep' buffer).
   ───────────────────────────────────────────────────────────────────── */

export const SFX = {
  footstep: `${AUDIO_BASE}/footstep.wav`,
  "zone-enter": `${AUDIO_BASE}/zone-enter.wav`,
  "overlay-open": `${AUDIO_BASE}/overlay-open.wav`,
  "overlay-close": `${AUDIO_BASE}/overlay-close.wav`,
  "villain-bump": `${AUDIO_BASE}/villain-bump.wav`,
  "ui-click": `${AUDIO_BASE}/ui-click.wav`,
} as const;

/** Union type of all SFX keys — consumers get type inference on
   `this.sound.play(SfxKey)`. */
export type SfxKey = keyof typeof SFX;

/* ─────────────────────────────────────────────────────────────────────
   BGM — background music tracks.
   Loop over this in PreloadScene's preload(); WorldScene picks one
   via `Phaser.Math.RND.pick(BGM_TRACKS)` and plays it on a loop.
   ───────────────────────────────────────────────────────────────────── */

export const BGM_TRACKS = [
  `${AUDIO_BASE}/bgm-1.mp3`,
  `${AUDIO_BASE}/bgm-2.mp3`,
  `${AUDIO_BASE}/bgm-3.mp3`,
  `${AUDIO_BASE}/bgm-4.mp3`,
  `${AUDIO_BASE}/bgm-5.mp3`,
  `${AUDIO_BASE}/bgm-6.mp3`,
  `${AUDIO_BASE}/bgm-7.mp3`,
  `${AUDIO_BASE}/bgm-8.mp3`,
] as const;

/* ─────────────────────────────────────────────────────────────────────
   Volume presets — single source of truth for the ducking spec.
   ───────────────────────────────────────────────────────────────────── */

/** BGM volume levels. Ducked while an overlay is open so the BGM
   stays audible but out of the way of the overlay's interaction. */
export const BGM_VOLUME = {
  /** Default playback level (looping). */
  base: 0.25,
  /** Reduced level while an overlay is open. */
  ducked: 0.08,
} as const;