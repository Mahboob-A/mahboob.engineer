/**
 * lib/cn.ts
 *
 * Tiny `className` joiner. Filters falsy values, joins the rest with spaces.
 * Stops us from importing `clsx` (1 dependency) for what is effectively
 * `arr.filter(Boolean).join(" ")`.
 *
 * Usage:
 *   cn("base", isActive && "active", className)
 *   cn("px-4 py-2", variant === "primary" && "bg-acc text-bg")
 */

export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | { [key: string]: boolean | null | undefined };

/** Flatten + filter + join. Object form lets you toggle classes by key. */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const push = (v: ClassValue) => {
    if (!v && v !== 0) return;
    if (typeof v === "string" || typeof v === "number") {
      out.push(String(v));
    } else if (Array.isArray(v)) {
      v.forEach(push);
    } else if (typeof v === "object") {
      for (const key of Object.keys(v)) {
        if (v[key]) out.push(key);
      }
    }
  };
  inputs.forEach(push);
  return out.join(" ");
}
