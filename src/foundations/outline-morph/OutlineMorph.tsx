'use client'

import * as React from 'react'

import { cx } from '../../utils/className'
import { EXPAND_DURATION_MS } from '../../utils/tokens'
import {
  OutlineMorphController,
  type OutlineMorphDuration,
  type OutlineMorphRing,
} from './morphEngine'
import styles from './outline-morph.module.css'

/*
 * Outline morph [D204, D206]: a trigger's focus ring grows into its popup's
 * frame as the popup opens, and shrinks back as it closes. On by default in
 * every component whose focusable trigger opens a framed surface: the
 * anchored popups (Select, Combobox, Autocomplete, Search, Menu and its
 * Menubar, Toolbar, Breadcrumb and Code Block triggers, Popover with its
 * tail, the Section Bar's Jump to, the contents bar) and the modal ones
 * (Dialog, Alert Dialog, the navigation drawer's sheets); each takes
 * `morph={false}`, and `--fgd-outline-morph: none` turns it off for a
 * subtree or the whole app. Without the morph a surface opens and closes
 * at once [D205]. A live DOM overlay animated with the Web
 * Animations API, not View Transitions: the page (the caret included) keeps
 * running, and the two ends may differ in radius. Its sibling
 * foundations/expanding-box morphs one constant frame through View
 * Transitions [D196].
 *
 * Implementation
 * - Module: outline-morph.module.css; no CVA axes (the frame's color is
 *   read from the two ends, never a scale class).
 * - Parts: `OutlineMorphFrame` (the overlay), `OutlineMorphTail` (a
 *   tailed popup's tail cap), `OutlineMorphLayer` (the fixed full-viewport
 *   container a modal surface's frame sits in) and `useOutlineMorph` (its
 *   engine, morphEngine.ts).
 * - Timing: open `--fgd-duration-expand` (333 ms) on `--fgd-ease-expand`;
 *   close `--fgd-duration-collapse` (200 ms, an alias of
 *   `--fgd-duration-disclosure`) on the same curve, all read from the
 *   trigger's computed style at each open and close (a duration of 0ms is
 *   the morph off); a modal surface (`surface`) reads
 *   `--fgd-duration-expand-surface` (400 ms) and
 *   `--fgd-duration-collapse-surface` (240 ms) instead. A morph reversed
 *   midway runs the remaining share (at least 35 %). JS fallbacks:
 *   utils/tokens.ts (EXPAND_DURATION_MS, SURFACE_DURATION_MS, EXPAND_EASE).
 * - States: the frame shows only while `data-running`; the popup carries
 *   `data-outline-morph-pending` (held clipped away by this module)
 *   while an open waits for its placement, then `data-outline-morph` while
 *   the frame draws its edge, so its owner gives the popup's border its
 *   face and drops the popup's own enter and exit transition for that time.
 * - Never runs: without the Web Animations API, under reduced motion (the
 *   duration tokens are 0ms there), in forced colors or in print, or with
 *   no rendered trigger to start from; the popup then opens and closes at
 *   once.
 */

/** Options for `useOutlineMorph`. */
export type UseOutlineMorphOptions = {
  /** The popup's open state, as its root has it after each commit. */
  open: boolean
  /**
   * Run the morph. Default `true`; `false` leaves the popup's own open and
   * close, and a change of `open` committed with it false happens that way.
   */
  enabled?: boolean
  /**
   * How the trigger draws its focus ring. Default `focus-visible`: on the
   * trigger while it matches `:focus-visible` (focus moves into the popup).
   * `focus-within`: on a field's box whenever anything in it holds focus,
   * pointer focus included (focus stays in its input).
   */
  ring?: OutlineMorphRing
  /**
   * Durations in ms, overriding the tokens. Default: the trigger's
   * `--fgd-duration-expand` (333) and `--fgd-duration-collapse` (200), read
   * at each open and close; 0 turns the morph off.
   */
  duration?: OutlineMorphDuration
  /**
   * A modal surface (a dialog, a sheet), whose frame sits in an
   * `OutlineMorphLayer`: the durations default to the trigger's
   * `--fgd-duration-expand-surface` (400) and
   * `--fgd-duration-collapse-surface` (240). Default `false`.
   */
  surface?: boolean
}

/** The refs `useOutlineMorph` returns: stable callbacks for the three elements. */
export type OutlineMorphRefs = {
  /** A trigger: its focus ring (or edge) is where the morph starts and lands. */
  sourceRef: (element: HTMLElement | null) => void
  /** The popup: its border box and radius are the frame the morph grows into. */
  targetRef: (element: HTMLElement | null) => void
  /** The overlay: pass to `OutlineMorphFrame`. */
  frameRef: (element: HTMLElement | null) => void
  /** The popup's own tail, if it has one (an arrow): the cap copies it while the morph runs. */
  tailSourceRef: (element: HTMLElement | null) => void
  /** The tail cap: pass to `OutlineMorphTail`, rendered after the frame. */
  tailRef: (element: HTMLElement | null) => void
}

/**
 * Grows a trigger's focus ring into its popup's frame on open, and back on
 * close. With a ring drawn (keyboard focus, or any focus in a field), the
 * morph starts on it; without one (a pointer press), on the trigger's edge:
 * its boxed edge, else its box in its fill, else (a text button, an
 * underline, a bare glyph) its ring's box in its ink. The close lands on the
 * ring when focus stays or returns with one (the trigger's own ring then
 * shows in the same frame the overlay goes), else on the edge.
 *
 * Wire three refs: `sourceRef` on the trigger (several triggers may share
 * one popup; the one marked open is used), `targetRef` on the popup,
 * and `frameRef` on an `OutlineMorphFrame` rendered as the popup's sibling
 * inside the element that positions it (e.g. Base UI's Positioner), so the
 * frame is out of flow and moves with the popup. The popup's CSS must
 * answer `[data-outline-morph]`: its border takes its face color and its
 * own enter and exit transition is dropped.
 */
export function useOutlineMorph(options: UseOutlineMorphOptions): OutlineMorphRefs {
  const { open, enabled = true, ring = 'focus-visible', duration, surface = false } = options
  const [controller] = React.useState(() => new OutlineMorphController())
  // Explicit durations only; otherwise the engine reads the tokens at each open and close.
  const openMs = duration?.open
  const closeMs = duration?.close

  // A layout effect: both directions start in the commit that changes the popup, before it paints.
  React.useLayoutEffect(() => {
    controller.duration =
      openMs === undefined && closeMs === undefined
        ? undefined
        : { open: openMs ?? EXPAND_DURATION_MS.open, close: closeMs ?? EXPAND_DURATION_MS.close }
    controller.ring = ring
    controller.surface = surface
    controller.update(open, enabled)
  }, [controller, open, enabled, ring, surface, openMs, closeMs])

  React.useEffect(() => () => controller.stop(), [controller])

  return React.useMemo(
    () => ({
      sourceRef: controller.sourceRef,
      targetRef: controller.targetRef,
      frameRef: controller.frameRef,
      tailSourceRef: controller.tailSourceRef,
      tailRef: controller.tailRef,
    }),
    [controller]
  )
}

/** Props for OutlineMorphFrame. */
export type OutlineMorphFrameProps = {
  /** `frameRef` from `useOutlineMorph`. */
  ref: (element: HTMLElement | null) => void
  /** Extra class names, added after the module's own. */
  className?: string
}

/**
 * The overlay the morph animates: an empty 2 px frame (the popup's own
 * weight and color, read at run time), absolutely positioned, hidden
 * unless a morph runs, `aria-hidden` and never hit-tested.
 */
export function OutlineMorphFrame(props: OutlineMorphFrameProps): React.JSX.Element {
  const { ref, className } = props
  return <div ref={ref} aria-hidden="true" className={cx(styles.frame, className)} />
}

/** Props for OutlineMorphTail. */
export type OutlineMorphTailProps = {
  /** `tailRef` from `useOutlineMorph`. */
  ref: (element: HTMLElement | null) => void
  /** The adopter's class: the tail's size, and its rotation per `data-side` as the popup's own tail. */
  className?: string
  /** The same drawing as the popup's tail (e.g. `OverlayTail`), its fill and stroke answering the cap. */
  children?: React.ReactNode
}

/**
 * The tail cap [§9.17]: the overlay's copy of a popup's tail, rendered
 * after `OutlineMorphFrame` in the same container so it paints above the
 * frame. While the morph runs it sits on the popup's own tail (hidden
 * meanwhile) and shows only on the trigger side of the frame's trigger-
 * facing edge, so the tail grows out of that edge as the frame arrives and
 * is whole as it lands. Its stroke is `currentColor` (the frame's color on
 * the same timing); its face is `--fgd-outline-morph-tail-fill` (the
 * popup's). Hidden unless a morph runs, `aria-hidden`, never hit-tested. A
 * popup without a tail never shows it.
 */
export function OutlineMorphTail(props: OutlineMorphTailProps): React.JSX.Element {
  const { ref, className, children } = props
  return (
    <div ref={ref} aria-hidden="true" className={cx(styles.tail, className)}>
      {children}
    </div>
  )
}

/** Props for `OutlineMorphLayer`. */
export type OutlineMorphLayerProps = {
  /** Extra class names, added after the module's own (e.g. a `z-index` other than the modal layer's). */
  className?: string
  /** The `OutlineMorphFrame`. */
  children?: React.ReactNode
}

/**
 * The container a modal surface's frame sits in, since the surface has no
 * positioner: fixed, the full viewport, above the surface (`--layer-4`, the
 * dialogs' layer, rendered after the popup in its portal) and never hit
 * tested, so the engine measures in viewport coordinates as they are.
 */
export function OutlineMorphLayer(props: OutlineMorphLayerProps): React.JSX.Element {
  const { className, children } = props
  return (
    <div aria-hidden="true" className={cx(styles.layer, className)}>
      {children}
    </div>
  )
}
