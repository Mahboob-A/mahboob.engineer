"use client";

import { track } from "@vercel/analytics";
import { cn } from "@/lib/cn";

export interface ModeTogglePillProps {
  active: boolean;
  value: "flat" | "game";
  nextPath: string;
  label: string;
}

export function ModeTogglePill({ active, value, nextPath, label }: ModeTogglePillProps) {
  const ariaLabel =
    value === "flat"
      ? "Switch to flat portfolio mode"
      : "Switch to game mode";

  const handleClick = () => {
    try {
      track("game_mode_click", { mode: value });
    } catch {
      // Ignore analytics failures
    }
  };

  return (
    <form action="/api/mode" method="post" className="contents">
      <input type="hidden" name="mode" value={value} />
      <input type="hidden" name="next" value={nextPath} />
      <button
        type="submit"
        onClick={handleClick}
        aria-pressed={active}
        aria-current={active ? "true" : undefined}
        aria-label={ariaLabel}
        className={cn(
          "cursor-pointer rounded-full px-3.5 py-1.5 transition-all",
          active ? "text-acc bg-acc-dim font-semibold" : "text-t2 hover:text-t1",
        )}
      >
        {label}
      </button>
    </form>
  );
}
