/**
 * app/game/page.tsx
 *
 * /game — the Phaser game mount point.
 *
 * 'use client' + dynamic import with `ssr: false` prevents Phaser
 * from ever running on the server (it touches `window` at import
 * time, so SSR would break). The actual GameRoot is loaded
 * asynchronously; <GameLoader /> renders while the bundle arrives.
 *
 * Master §6 rule #5: "Game mode is client-only. 'use client' +
 * dynamic(() => import(...), { ssr: false })."
 */

"use client";

import dynamic from "next/dynamic";
import { GameLoader } from "@/components/game/GameLoader";

const GameRoot = dynamic(
  () => import("@/game").then((m) => m.default),
  {
    ssr: false,
    loading: () => <GameLoader />,
  },
);

export default function GamePage() {
  return (
    <div className="mx-auto max-w-[1180px] px-6 py-12 md:px-8">
      <header className="mb-8">
        <p className="text-acc mb-2.5 font-mono text-[13px] tracking-[1px]">
          06 / GAME MODE
        </p>
        <h1 className="font-display text-t1 text-[clamp(28px,4vw,40px)] font-bold tracking-[-0.5px]">
          Backend City
        </h1>
        <p className="text-t2 mt-3 max-w-[520px] text-[15px]">
          Top-down pixel-art city — every building is a project,
          every villain is a learning area. Walk into buildings,
          bump into villains, find out what I&apos;m working on.
        </p>
      </header>
      <GameRoot />
    </div>
  );
}