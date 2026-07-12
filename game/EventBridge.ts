/**
 * game/EventBridge.ts
 *
 * Singleton EventEmitter bridging Phaser scenes ↔ React components.
 * Phaser calls `bridge.openOverlay({ slug, overlayType })` to ask
 * React to show a project overlay; React calls `bridge.closeOverlay()`
 * to dismiss. The Phaser side listens for `resumeGame` / `pauseGame`
 * to coordinate with the React modal open state.
 *
 * Why a standalone EventEmitter (not Phaser's internal one)?
 *   - React and Phaser run in separate runtime contexts. The bridge
 *     must work without depending on the Phaser instance being mounted
 *     (so React can subscribe before Phaser mounts).
 *   - Lets us test bridge logic without spinning up Phaser.
 *   - Avoids circular-import risk between Phaser and React trees.
 *
 * Contract locked here (consumed in T4.4 + T4.6):
 *
 *   Phaser → React (scenes fire these when they need UI):
 *     openOverlay(payload)  → show project/villain/special overlay
 *     showInteractionHint   → render [E] Enter hint near building
 *     hideInteractionHint   → remove [E] Enter hint
 *     pauseGame             → ask React to begin pause flow
 *
 *   React → Phaser (UI fires these to coordinate state):
 *     closeOverlay          → overlay closed, unpause and resume
 *     resumeGame            → resume the world simulation
 *
 * Implementation: typed event map + typed methods. Each event has
 * its own (channel, payload) signature so subscribers get full
 * type inference at the call site.
 */

import EventEmitter from "eventemitter3";
import type { OverlayPayload } from "@/game/types";

/* ─────────────────────────────────────────────────────────────────────
   Typed event map — drives on() type inference.
   ───────────────────────────────────────────────────────────────────── */

export interface GameEventMap {
  OPEN_OVERLAY: OverlayPayload;
  CLOSE_OVERLAY: void;
  SHOW_INTERACTION_HINT: string;
  HIDE_INTERACTION_HINT: void;
  PAUSE_GAME: void;
  RESUME_GAME: void;
}

type GameEventName = keyof GameEventMap;

/* ─────────────────────────────────────────────────────────────────────
   Bridge
   ───────────────────────────────────────────────────────────────────── */

class GameBridge {
  private readonly emitter = new EventEmitter();

  /* ─── Phaser → React ─────────────────────────────────────────── */

  openOverlay(payload: OverlayPayload): void {
    this.emitter.emit("OPEN_OVERLAY", payload);
  }

  showInteractionHint(hint: string): void {
    this.emitter.emit("SHOW_INTERACTION_HINT", hint);
  }

  hideInteractionHint(): void {
    this.emitter.emit("HIDE_INTERACTION_HINT");
  }

  pauseGame(): void {
    this.emitter.emit("PAUSE_GAME");
  }

  /* ─── React → Phaser ─────────────────────────────────────────── */

  closeOverlay(): void {
    this.emitter.emit("CLOSE_OVERLAY");
  }

  resumeGame(): void {
    this.emitter.emit("RESUME_GAME");
  }

  /* ─── Subscribe / unsubscribe ────────────────────────────────────
     The overloads specialize each event's payload. The fallback
     catch-all uses `unknown` so callers can still subscribe to
     anything not yet typed here. */

  on<K extends GameEventName>(
    event: K,
    listener: (payload: GameEventMap[K]) => void,
  ): void;
  on(event: string, listener: (payload: unknown) => void): void;
  on(event: string, listener: (payload: unknown) => void): void {
    this.emitter.on(event, listener);
  }

  off<K extends GameEventName>(
    event: K,
    listener: (payload: GameEventMap[K]) => void,
  ): void;
  off(event: string, listener: (payload: unknown) => void): void;
  off(event: string, listener: (payload: unknown) => void): void {
    this.emitter.off(event, listener);
  }

  /* ─── Test helpers (T4.0 verification) ────────────────────────── */

  /** Dev-only: list currently-registered event names. */
  eventNames(): string[] {
    return this.emitter.eventNames() as string[];
  }
}

export const bridge = new GameBridge();

export type { OverlayPayload };