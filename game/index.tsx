/**
 * game/index.tsx
 *
 * React mount point for the Phaser game. Mounted via `dynamic(..., { ssr: false })`
 * from app/game/page.tsx (see master §6 rule #5).
 *
 * Responsibilities:
 *   - Create the Phaser.Game instance on mount (effect-guarded so
 *     React strict-mode double-invoke doesn't spawn two games).
 *   - Register PreloadScene at runtime so Phaser doesn't try to
 *     load stub classes here.
 *   - Listen on the EventBridge for OPEN_OVERLAY / CLOSE_OVERLAY
 *     events and toggle the overlay slot.
 *   - On unmount: tear down the game cleanly + unsubscribe.
 *
 * T4.6: the overlay slot is now a typed dispatcher (<OverlaySlot>)
 * that renders <ProjectOverlay> / <VillainOverlay> based on
 * `overlay.overlayType`. The placeholder div from T4.0 is gone.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { bridge } from "@/game/EventBridge";
import { createPhaserConfig } from "@/game/config";
import { PreloadScene } from "@/game/scenes/PreloadScene";
import { UIScene } from "@/game/scenes/UIScene";
import { ProjectOverlay } from "@/game/scenes/overlays/ProjectOverlay";
import { VillainOverlay } from "@/game/scenes/overlays/VillainOverlay";
import { PauseMenu } from "@/components/game/PauseMenu";
import { SpecialOverlay } from "@/components/game/SpecialOverlay";
import type { OverlayPayload, VillainId } from "@/game/types";

export default function GameRoot() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [overlay, setOverlay] = useState<OverlayPayload | null>(null);
  /* T4.11 — pause menu state. Toggled by Escape / "Resume" button.
     Defaults to false; the player has to enter the game first. */
  const [paused, setPaused] = useState(false);
  /* Mirror of WorldScene.isMuted — local React state that updates
     only when the pause-menu's Toggle sound button is clicked. The
     source of truth is WorldScene; this is a UI-only copy. */
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    /* React strict-mode safety: the effect runs twice in dev.
       Guard against spawning two Phaser instances. */
    if (gameRef.current) return;

    const config = createPhaserConfig();
    /* Register the entry scene + the parallel HUD layer. PreloadScene
       (T4.3+) loads assets, logs "[Backend City] assets ready" once
       done, then transitions to WorldScene. UIScene (T4.8) draws the
       HUD — but is launched in parallel by WorldScene.create() (not
       from here); we still need to register the class so Phaser
       knows the scene key. */
    if (Array.isArray(config.scene)) {
      (config.scene as Phaser.Scene[]).push(
        new PreloadScene(),
        new UIScene(),
      );
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

  /* T4.11: window-level Escape listener — only opens the pause menu
     when not already paused (so Escape from "Resume" doesn't
     immediately re-open). */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !paused) {
        setPaused(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paused]);

  /* T4.11: when paused, freeze the WorldScene. Scene.pause() halts
     update() + physics callbacks but does NOT pause the BGM (the
     SoundManager is independent of the scene update loop). UIScene
     keeps running — its minimap dot just sits at the pause position
     because WorldScene.player.x doesn't change while paused. */
  useEffect(() => {
    if (!gameRef.current) return;
    if (paused) {
      gameRef.current.scene.pause("WorldScene");
    } else {
      gameRef.current.scene.resume("WorldScene");
    }
  }, [paused]);

  return (
    <div
      id="phaser-wrapper"
      className="relative h-[640px] w-full overflow-hidden rounded-[10px] border border-border"
    >
      <div id="phaser-root" className="h-full w-full" />

      {overlay ? (
        <OverlaySlot overlay={overlay} onClose={() => bridge.closeOverlay()} />
      ) : null}

      {paused ? (
        <PauseMenu
          onResume={() => setPaused(false)}
          onToggleMute={() => {
            /* Resolve the WorldScene instance at click time via
               Phaser's scene plugin. Same pattern as UIScene uses
               in T4.8 (`this.scene.get('WorldScene')`). */
            const worldScene = gameRef.current?.scene.getScene(
              "WorldScene",
            ) as
              | (Phaser.Scene & { toggleMute: () => void })
              | undefined;
            worldScene?.toggleMute();
            setIsMuted((m) => !m);
          }}
          isMuted={isMuted}
        />
      ) : null}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   OverlaySlot — type-dispatching overlay renderer.
   ───────────────────────────────────────────────────────────────────── */

/**
 * Dispatches on `overlay.overlayType` to render the right component.
 * Falls back to a temporary placeholder for `special` overlays
 * (T4.12 will route them to /writing, /stack, /contact).
 *
 * Also registers a window-level Escape key listener so users can
 * dismiss the overlay without aiming for the close button.
 */
function OverlaySlot({
  overlay,
  onClose,
}: {
  overlay: OverlayPayload;
  onClose: () => void;
}) {
  /* Escape closes the overlay. Window-level listener because Phaser's
     keyboard plugin only listens when the canvas has focus — Escape
     via the document body should still work. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-bg/80 p-6 backdrop-blur-sm">
      {overlay.overlayType === "project" ? (
        <ProjectOverlay slug={overlay.slug} onClose={onClose} />
      ) : overlay.overlayType === "villain" ? (
        <VillainOverlay
          villainId={overlay.slug as VillainId}
          onClose={onClose}
        />
      ) : (
        /* T4.12: route to the appropriate flat-portfolio page. The
           SpecialOverlay handles slug-not-found safety internally. */
        <SpecialOverlay slug={overlay.slug} onClose={onClose} />
      )}
    </div>
  );
}