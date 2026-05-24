/**
 * Shared Framer Motion animation variants used across landing page sections.
 */

/** Fade in while sliding up from 30px below. */
export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

/** Fade in from the left */
export const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

/** Fade in from the right */
export const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

/** Scale up from 90% */
export const scaleUp = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

/** Blur in */
export const blurIn = {
  hidden: { opacity: 0, filter: "blur(12px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
};

/** Stagger children animations with 120ms delay between each. */
export const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

/** Faster stagger for dense grids */
export const staggerFast = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export const defaultTransition = { duration: 0.5 };
export const heroTransition = { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const };
export const smoothSpring = { type: "spring", stiffness: 100, damping: 20 };
