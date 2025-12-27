/**
 * Apple-Style Easing Curves
 * Based on Apple's animation design language
 */

// Apple's signature cubic bezier - used for most transitions
export const appleCubic: [number, number, number, number] = [0.76, 0, 0.24, 1];

// Smooth in and out - for gentle movements
export const appleInOut: [number, number, number, number] = [0.4, 0, 0.2, 1];

// Fast out, slow in - for appearing elements
export const appleOut: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Slow out, fast in - for disappearing elements
export const appleIn: [number, number, number, number] = [0.7, 0, 0.84, 0];

// Snappy transition - for quick interactions
export const appleSnap: [number, number, number, number] = [0.87, 0, 0.13, 1];

// Spring-like easing
export const appleSpring: [number, number, number, number] = [0.68, -0.55, 0.265, 1.55];

/**
 * Custom easing function for Lenis smooth scroll
 * Mimics Apple's scroll behavior
 */
export function appleScrollEasing(t: number): number {
  return Math.min(1, 1.001 - Math.pow(2, -10 * t));
}

/**
 * Exponential ease out - for decelerating animations
 */
export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Quartic ease out - smooth deceleration
 */
export function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

/**
 * Cubic ease in and out - balanced acceleration/deceleration
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
