/*
 * JavaScript mirrors of the tokens that Base UI takes as numbers
 * (positioner offsets, open and close delays). Each value restates one token
 * in tokens.css; change both together.
 */

/** The anchored-panel offset from its trigger: `--fgd-popup-offset` (8 px, §9.1, §10.1). */
export const POPUP_OFFSET_PX = 8

/**
 * Viewport clearance before a panel flips or shifts: `--fgd-popup-clearance`
 * (16 px, the base `--fgd-space-margin`, §10.1).
 */
export const POPUP_CLEARANCE_PX = 16

/** The tooltip open delay: `--fgd-delay-tooltip` (500 ms, §1.5.15) [D175]. */
export const TOOLTIP_DELAY_MS = 500

/**
 * Desktop Navigation Menu hover intent [D182], for Base UI's Root `delay`
 * and `closeDelay`: `--fgd-delay-nav-open` (150 ms) and `--fgd-delay-nav-close`
 * (300 ms). Every input still opens a panel by click, Enter, Space or
 * ArrowDown; the delays apply to a fine pointer only.
 */
export const NAV_DELAY_MS = { open: 150, close: 300 } as const

/**
 * The expanding box's View Transitions morph: open `--fgd-duration-expand`
 * (333 ms), close `--fgd-duration-disclosure` (200 ms). Both are instant
 * under reduced motion, where the morph does not run at all.
 */
export const EXPAND_DURATION_MS = { open: 333, close: 200 } as const

/**
 * The open easing, `--fgd-ease-expand`: a critically damped spring sampled
 * as `linear()` stops, its undershoot clipped to 0, so it never leaves
 * [0, 1] (for a Web Animations fallback).
 */
export const EXPAND_EASE =
  'linear(0, 0, 0.294, 0.401, 0.58, 0.706, 0.75, 0.825, 0.878, 0.896, 0.927, 0.949, 0.957, 0.97, 0.979, 0.982, 0.987, 0.991, 0.992, 0.995, 0.996, 0.998, 0.999, 0.999, 1)'

/**
 * The code block's variant and JS/TS swap, `--fgd-duration-swap` (350 ms):
 * useCode's `transformDelay` and `variantSwapDelay`, which must equal the CSS
 * duration of the line grow and shrink. Pass 0 for both under reduced motion,
 * where the CSS duration is instant too. The swap's scroll-anchor window is
 * twice this.
 */
export const SWAP_DURATION_MS = 350

/**
 * The marker and trail geometry (§1.5.16, §4.7), for SVG viewBoxes, which
 * take numbers: `--fgd-marker-trail` (5 px), `--fgd-marker-timeline` (8 px),
 * `--fgd-marker-waypoint` (9 px), `--fgd-marker-current` (10 px),
 * `--fgd-arrow-head` (6 px), the markers' `--border-size-1-5` stroke, and the
 * `--size-px-1` (4 px) gap where a dash stops short of a marker.
 */
export const MARKER_PX = {
  trail: 5,
  timeline: 8,
  waypoint: 9,
  current: 10,
  arrowHead: 6,
  stroke: 1.5,
  gap: 4,
} as const
