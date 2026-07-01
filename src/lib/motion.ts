import type { Variants, Transition } from "framer-motion";

/**
 * Shared motion foundations for Recall — "recollection, not loading".
 * Quiet, expensive, soft, precise. No bounce, no overshoot. Respect
 * `prefers-reduced-motion` at the call site via `useReducedMotion()`.
 */

export const SOFT_SPRING: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 30,
  mass: 0.9,
};

export const SOFT_EASE: Transition = {
  duration: 0.42,
  ease: [0.22, 1, 0.36, 1],
};

/** A memory surfacing: blur → focus with a gentle rise. */
export const surfaceVariants: Variants = {
  hidden: { opacity: 0, y: 10, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: SOFT_EASE,
  },
};

/** Staggered container so memories surface one after another. */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};
