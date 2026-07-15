"use client";

/**
 * components/motion/PageTransition.tsx
 *
 * Fades the children on every route change. Wraps `{children}` inside
 * the root layout. Honors `prefers-reduced-motion`.
 *
 * Implementation notes:
 *   - Uses Framer Motion's `AnimatePresence` with `mode="wait"` so the
 *     outgoing page finishes its fade-out before the new page fades in.
 *     Without `wait`, both pages animate simultaneously which looks
 *     jittery on slow connections.
 *   - The `key={pathname}` on the inner motion.div tells AnimatePresence
 *     to mount a new instance per route. The previous instance exits
 *     with `exit={{ opacity: 0 }}`.
 *   - No transform on exit — pure opacity. Avoids layout thrash when
 *     the new route's content reflows.
 *
 * Excluded routes: nothing is excluded here at the layout level. The
 * `/game` route is `'use client'` and gates its content behind a
 * `ModeSelector`; the gate's own entrance handles its perceived speed.
 *
 * Phase 6 (T6.2).
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  if (reduced) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex-1"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}