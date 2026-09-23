/*
 * JavaScript mirrors of the --ds- tokens that Base UI takes as numbers
 * (positioner offsets, open and close delays). Each value restates one token
 * in tokens.css; change both together.
 */

/** The anchored-panel offset from its trigger: `--ds-popup-offset` (8 px, §9.1, §10.1). */
export const POPUP_OFFSET_PX = 8

/**
 * Viewport clearance before a panel flips or shifts: `--ds-popup-clearance`
 * (16 px, the base `--ds-space-margin`, §10.1).
 */
export const POPUP_CLEARANCE_PX = 16

/** The tooltip open delay: `--ds-delay-tooltip` (500 ms, §1.5.15) [D175]. */
export const TOOLTIP_DELAY_MS = 500

/**
 * Desktop Navigation Menu hover intent [D182], for Base UI's Root `delay`
 * and `closeDelay`: `--ds-delay-nav-open` (150 ms) and `--ds-delay-nav-close`
 * (300 ms). Every input still opens a panel by click, Enter, Space or
 * ArrowDown; the delays apply to a fine pointer only.
 */
export const NAV_DELAY_MS = { open: 150, close: 300 } as const

/**
 * The marker and trail geometry (§1.5.16, §4.7), for SVG viewBoxes, which
 * take numbers: `--ds-marker-trail` (5 px), `--ds-marker-timeline` (8 px),
 * `--ds-marker-waypoint` (9 px), `--ds-marker-current` (10 px),
 * `--ds-arrow-head` (6 px), the markers' `--ds-stroke-1-5` stroke, and the
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
