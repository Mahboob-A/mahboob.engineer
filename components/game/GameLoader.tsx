/**
 * components/game/GameLoader.tsx
 *
 * Loading skeleton shown while the Phaser game module is dynamically
 * imported. Renders inside the dynamic boundary so users see
 * immediate feedback even on slow connections.
 *
 * Server-Component-friendly — no client interactivity.
 */

export function GameLoader() {
  return (
    <div className="bg-code-bg border-border flex h-[640px] w-full flex-col items-center justify-center gap-4 rounded-[10px] border">
      <div className="flex items-center gap-2">
        <span className="bg-acc inline-block h-2 w-2 animate-pulse rounded-full" />
        <span className="bg-acc inline-block h-2 w-2 animate-pulse rounded-full [animation-delay:0.2s]" />
        <span className="bg-acc inline-block h-2 w-2 animate-pulse rounded-full [animation-delay:0.4s]" />
      </div>
      <p className="text-t2 font-mono text-[14px] tracking-[1px]">
        loading backend city…
      </p>
    </div>
  );
}