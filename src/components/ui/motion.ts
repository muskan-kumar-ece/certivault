"use client";

import { useReducedMotion, type Transition } from "framer-motion";

/**
 * Shared Apple-grade spring physics constants (PRD.md §11.4).
 * Stiffness: 380, Damping: 32.
 */
export const springTransition: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 32,
};

export const snappySpring: Transition = {
  type: "spring",
  stiffness: 450,
  damping: 35,
};

export const gentleSpring: Transition = {
  type: "spring",
  stiffness: 280,
  damping: 28,
};

/**
 * Provides 100ms press feedback (scale: 0.97) adhering to Apple guidelines.
 * Gracefully disables scale animations when user prefers reduced motion.
 */
export function usePressMotion() {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return {
      whileTap: { opacity: 0.8 },
      transition: { duration: 0.1 } as Transition,
    };
  }

  return {
    whileTap: { scale: 0.97, opacity: 0.9 },
    transition: { type: "spring", stiffness: 400, damping: 25 } as Transition,
  };
}
