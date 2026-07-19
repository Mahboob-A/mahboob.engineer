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
 * T4.10: GameGate is the mode-selector entry. While `accepted` is
 * false, the selector renders and `<GameRoot />` is not in the React
 * tree — so the dynamic-imported Phaser game doesn't mount even
 * after the chunk loads. After the user clicks "Enter Game", the
 * selector unmounts and the children mount. The click is also the
 * user gesture that unblocks the browser's audio context.
 *
 * Master §6 rule #5: "Game mode is client-only. 'use client' +
 * dynamic(() => import(...), { ssr: false })."
 */

"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { GameLoader } from "@/components/game/GameLoader";
import { GameGate } from "@/components/game/ModeSelector";
import { DesktopOnlyGate } from "@/components/game/DesktopOnlyGate";

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
          Game mode
        </p>
        <h1 className="font-display text-t1 text-[clamp(28px,4vw,40px)] font-bold tracking-[-0.5px]">
          Backend City
        </h1>
        <p className="text-t2 mt-3 max-w-[520px] text-[15px]">
          Top-down pixel-art city. Every building is a project,
          every villain is a learning area. Walk into buildings,
          bump into villains, find out what I&apos;m working on.
        </p>
      </header>
      {/* T6.7: DesktopOnlyGate wraps the game UI. On viewports <md
         (767 px and below) the gate swaps in a "best on desktop" card
         so the Phaser chunk doesn't even download on mobile. On md+,
         children render unchanged (ModeSelector → GameRoot). */}
      <DesktopOnlyGate>
        {/* T4.10 polish: GameGate reads `?entered=1` via useSearchParams.
           Next.js 16 requires any component using useSearchParams to
           be wrapped in a Suspense boundary at the page level — the
           boundary lets the page prerender with the rest of the
           static content while the gate streams in. */}
        <Suspense fallback={<GameLoader />}>
          {/* GameGate holds the selector open until the user clicks
              "Enter Game". GameRoot is the dynamic-imported Phaser game —
              not in the React tree until the gate opens. */}
          <GameGate>
            <GameRoot />
          </GameGate>
        </Suspense>
      </DesktopOnlyGate>
    </div>
  );
}