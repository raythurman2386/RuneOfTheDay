/**
 * Shared animation constants and helpers.
 *
 * Centralized so every screen uses consistent, snappy-yet-elegant timing.
 * The goal: animations feel immediate (never sluggish) but never jarring.
 */

import { Animated, Easing } from "react-native";

// ─── Durations (ms) ──────────────────────────────────────────────
/** Quick feedback — press scales, tab switches. ~150ms feels instant. */
export const DURATION_QUICK = 150;

/** Standard UI transition — card swaps, content swaps. ~220ms is snappy. */
export const DURATION_STANDARD = 220;

/** Page-level entrance — fade-in on mount, slide-up. ~280ms feels smooth. */
export const DURATION_ENTRANCE = 280;

// ─── Easing ──────────────────────────────────────────────────────
/**
 * A gentle ease-out: starts fast, decelerates smoothly.
 * Good for entrances and content reveals.
 */
export const easeOut = Easing.out(Easing.ease);

/**
 * A balanced ease-in-out for symmetric transitions (fade out → fade in).
 */
export const easeInOut = Easing.inOut(Easing.ease);

/**
 * Spring config for the "pop" effect on cards and symbols.
 * Snappy with a tiny overshoot — feels tactile without being bouncy.
 */
export const popSpring = {
  tension: 120,
  friction: 8,
  useNativeDriver: true,
} as const;

/**
 * Spring config for gentle scale entrances.
 * Slower, more graceful — for hero elements like the daily rune.
 */
export const gentleSpring = {
  tension: 50,
  friction: 7,
  useNativeDriver: true,
} as const;

// ─── Stagger helpers ─────────────────────────────────────────────
/**
 * Per-item delay for staggered list entrances.
 * 35ms keeps a list of 24 items under 1s total.
 */
export const STAGGER_DELAY_MS = 35;

// ─── Preset animations ───────────────────────────────────────────
/**
 * Fade in from 0 → 1 with a subtle upward slide.
 * Returns the Animated.CompositeAnimation — caller must .start().
 */
export const fadeInUp = (
  opacity: Animated.Value,
  translateY: Animated.Value,
  duration: number = DURATION_ENTRANCE,
  delay: number = 0,
) =>
  Animated.parallel([
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      easing: easeOut,
      useNativeDriver: true,
    }),
    Animated.timing(translateY, {
      toValue: 0,
      duration,
      delay,
      easing: easeOut,
      useNativeDriver: true,
    }),
  ]);

/**
 * Quick fade in — opacity only, no transform.
 */
export const fadeIn = (
  opacity: Animated.Value,
  duration: number = DURATION_STANDARD,
  delay: number = 0,
) =>
  Animated.timing(opacity, {
    toValue: 1,
    duration,
    delay,
    easing: easeOut,
    useNativeDriver: true,
  });
