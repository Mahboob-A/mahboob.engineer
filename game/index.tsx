/**
 * game/index.tsx
 *
 * React mount point for the Phaser game. Mounted via `dynamic(..., { ssr: false })`
 * from app/game/page.tsx (see master §6 rule #5).
 *
 * Responsibilities:
 *   - Create the Phaser.Game instance on mount (effect-guarded so
 *     React strict-mode double-invoke doesn't spawn two games).
 *   - Inject BootScene into the scene list at runtime so Phaser
 *     doesn't try to load stub classes here.
 *   - Listen on the EventBridge for OPEN_OVERLAY / CLOSE_OVERLAY
 *     events and toggle the overlay slot.
 *   - On unmount: tear down the game cleanly + unsubscribe.
 *
 * T4.0 stub: the overlay slot is just a placeholder div. T4.6 will
 * swap the slot for the real `<ProjectOverlay>` / `<VillainOverlay>`
 * components, keyed by `overlay.overlayType`.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { bridge } from "@/game/EventBridge";
import { createPhaserConfig } from "@/game/config";
import { BootScene } from "@/game/scenes/BootScene";
import type { OverlayPayload } from "@/game/types";

export default function GameRoot() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [overlay, setOverlay] = useState<OverlayPayload | null>(null);

  useEffect(() => {
    /* React strict-mode safety: the effect runs twice in dev.
       Guard against spawning two Phaser instances. */
    if (gameRef.current) return;

    const config = createPhaserConfig();
    /* Register BootScene at runtime. Later tasks (T4.3+) will
       append PreloadScene / WorldScene / UIScene here. */
    if (Array.isArray(config.scene)) {
      (config.scene as Phaser.Scene[]).push(new BootScene());
    }
    gameRef.current = new Phaser.Game(config);

    /* Subscribe to bridge events. */
    function handleOpen(payload: OverlayPayload): void {
      bridge.pauseGame();
      setOverlay(payload);
    }
    function handleClose(): void {
      setOverlay(null);
      bridge.resumeGame();
    }
    bridge.on("OPEN_OVERLAY", handleOpen);
    bridge.on("CLOSE_OVERLAY", handleClose);

    return () => {
      bridge.off("OPEN_OVERLAY", handleOpen);
      bridge.off("CLOSE_OVERLAY", handleClose);
      /* Destroy the Phaser instance. `true` removes the canvas DOM
         element so React's tree doesn't keep a dangling reference. */
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      id="phaser-wrapper"
      className="relative h-[640px] w-full overflow-hidden rounded-[10px] border border-border"
    >
      <div id="phaser-root" className="h-full w-full" />

      {overlay ? (
        <div className="absolute inset-0 flex items-center justify-center bg-bg/80 p-6 backdrop-blur-sm">
          {/* T4.0 stub: T4.6 will swap this div for the typed
              <ProjectOverlay> / <VillainOverlay> components. */}
          <div className="bg-surface border-acc/40 flex max-w-[640px] flex-col gap-3 rounded-[12px] border p-8">
            <p className="text-acc font-mono text-[11px] tracking-[1.5px] uppercase">
              {overlay.overlayType}
            </p>
            <h2 className="font-display text-t1 text-[24px] font-bold tracking-[-0.3px]">
              Overlay slot: {overlay.slug}
            </h2>
            <p className="text-t3 font-mono text-[12px]">
              T4.6 will replace this with a full{" "}
              {overlay.overlayType === "project"
                ? "<ProjectOverlay>"
                : overlay.overlayType === "villain"
                  ? "<VillainOverlay>"
                  : "special overlay"}
              .
            </p>
            <button
              type="button"
              onClick={() => bridge.closeOverlay()}
              className="bg-acc text-bg mt-2 self-start rounded-[6px] px-4 py-2 font-mono text-[12px] font-semibold"
            >
              close →
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}