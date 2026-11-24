"use client";

/**
 * components/motion/FadeUp.tsx
 *
 * Tiny entrance animation wrapper. Fades up on first viewport entry,
 * does nothing on subsequent scroll. Honors `prefers-reduced-motion`
 * via Framer Motion's `useReducedMotion()`.
 *
 * Use as the outermost wrapper of any block that should "slide in"
 * on scroll: landing sections, inner-page headers, project cards.
 *
 * No CSS class needed at the call site — the motion.div is the
 * element. Phase 6 (T6.2).
 */

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface FadeUpProps {
  children: ReactNode;
  /** Delay in seconds before the entrance fires. Defaults to 0. */
  delay?: number;
  /** Y offset in pixels. Defaults to 16. Set to 0 for a pure fade. */
  y?: number;
  /** Duration in seconds. Defaults to 0.4. */
  duration?: number;
  className?: string;
  /** Optional id attribute, forwarded to the rendered tag. */
  id?: string;
  /** Markup override. Defaults to `div`. Use `section`, `article`, etc. */
  as?: "div" | "section" | "article" | "li" | "header" | "aside" | "main";
}

export function FadeUp({
  children,
  delay = 0,
  y = 16,
  duration = 0.4,
  className,
  id,
  as = "div",
}: FadeUpProps) {
  const reduced = useReducedMotion();

  // When the user prefers reduced motion, render the element with no
  // motion props at all — keeps the SSR'd HTML stable and avoids the
  // hydration flicker.
  if (reduced) {
    const Tag = as as keyof React.JSX.IntrinsicElements;
    return (
      <Tag className={className} id={id}>
        {children}
      </Tag>
    );
  }

  // Cast through ComponentType because motion.div / motion.section / etc.
  // differ in TS type. The runtime behavior is identical: motion.* wraps
  // the corresponding HTML tag with framer-motion's variants system.
  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      className={className}
      id={id}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </MotionTag>
  );
}
