# Phase 55: Game Mode Audio & SFX Improvements

**Phase:** 55: Game Mode Audio & SFX Improvements
**Phase status:** done
**Date started:** 2026-07-24

---

## T55.1: BGM Track Registry Update (bgm-1 to bgm-4)

**Task status:** done
**Commit:** b57a7f7
**Date:** 2026-07-24

### What shipped

- `game/audio/registry.ts`:
  - Updated `BGM_TRACKS` registry to list active background tracks (`bgm-1.mp3`, `bgm-2.mp3`, `bgm-3.mp3`, `bgm-4.mp3`), resolving `404 Not Found` and audio cache errors.

### Decisions

- **Aligned BGM Audio Matrix**: Synchronized the Phaser preload registry with actual compressed MP3 audio files on disk so WorldScene picks randomly from available tracks without missing key exceptions.

### Verified

- `pnpm typecheck` -> Clean.

---

## T55.2: Player Movement Footstep Audio Integration

**Task status:** done
**Commit:** 7a0001b
**Date:** 2026-07-24

### What shipped

- `game/entities/Player.ts`:
  - Added `nextFootstepTime` timer property to `Player`.
  - Added `this.scene.sound.play("footstep", { volume: 0.35 })` invocation inside `updateMovement()` with 320ms step cadence throttling whenever WASD or arrow key velocity is non-zero.

### Decisions

- **Step Cadence Throttling**: Throttled footstep sound triggers to 320ms intervals so diagonal/straight movement plays clear, rhythmic steps without audio clipping.

### Verified

- `pnpm typecheck` -> Clean.

---

## T55.3: Zone, Overlay & Villain Bump SFX Audio Triggers

**Task status:** done
**Commit:** 01bc7b6
**Date:** 2026-07-24

### What shipped

- `game/scenes/WorldScene.ts`:
  - Added `this.sound.play("overlay-open", { volume: 0.5 })` on `OPEN_OVERLAY` bridge event.
  - Added `this.sound.play("overlay-close", { volume: 0.5 })` on `CLOSE_OVERLAY` bridge event.
  - Added `this.sound.play("zone-enter", { volume: 0.4 })` in `onEnterBuildingZone()`.
  - Added `this.sound.play("villain-bump", { volume: 0.6 })` in `onVillainContact()`.

### Decisions

- **Event-Driven Gameplay SFX**: Connected loaded Phaser audio buffers directly to game engine interaction hooks for audible feedback on world exploration and modal states.

### Verified

- `pnpm typecheck` -> Clean.
- `pnpm test:security` -> Passed.
