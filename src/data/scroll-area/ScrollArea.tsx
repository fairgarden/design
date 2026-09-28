'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { useMergedRef } from '../../utils/assignRef'
import { cx } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './scroll-area.module.css'

/*
 * Scroll Area (§10.19): bounded overflow for popup lists, dialog bodies,
 * wide tables (§8.2), carousels (§12.4) and removable-chip rows. Never for
 * whole pages or reading columns.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: scroll-area.module.css; CVA function `scrollArea`.
 * - Native scrolling [D207]: the viewport is the browser's own scroller,
 *   with its native scrollbar in the scope's colors (reset.css); no Base UI
 *   part and no drawn scrollbar.
 * - Axes: `kind` → panel | wide | rail (panel: vertical, its gutter
 *   reserved with `scrollbar-gutter: stable`; wide: horizontal, proximity
 *   snap; rail: horizontal, mandatory snap, for carousels) [D155];
 *   `primary`, `secondary` → scales module classes (`secondary` unused).
 * - Compound variants: none.
 * - Defaults: kind panel; color axes none [D133].
 * - Color fallback: inherits the scope.
 * - States: each `edge` rule shows while content is hidden on its side,
 *   from a scroll-driven animation on the viewport's scroll timeline where
 *   supported, else from the root's `data-overflow-{x,y}-{start,end}`,
 *   which a small effect writes only in browsers without scroll-driven
 *   animations; the same effect keeps the viewport out of the tab order
 *   while it has nothing to scroll. Viewport `:focus-visible` → ring;
 *   `:hover` → the thumb's hover step (reset.css). Geometry never waits on
 *   either: a native scrollbar is laid out in the first paint [D201].
 * - Parts: base, viewport, content, edge (edgeStart, edgeEnd).
 * - Scope: none.
 * - Container: none; inherits its context.
 *
 * Hooks for composed components: `--scroll-area-edge-start: none` on the
 * root hides the start edge, for a table whose pinned column draws that
 * edge itself (§8.2); `--scroll-area-overscroll-x` / `-y` set the
 * viewport's scroll chaining per axis; `--scroll-area-scroll-padding-inline`
 * sets its inline scroll padding, the snapport's insets (a carousel's
 * bleed). The viewport names its scroll
 * timeline `--scroll-area-block` (panel) or `--scroll-area-inline` (wide,
 * rail) and the root scopes it; a composer that reads it outside the root
 * (the table's cue) scopes it on its own element and sets the root's
 * `timeline-scope` to `none`. `maxBlockSize` writes `--scroll-area-max-block`,
 * the root's cap (50dvh on a panel by default).
 */
export const scrollArea = cva(styles.base, {
  variants: {
    kind: {
      panel: styles.panel,
      wide: styles.wide,
      rail: styles.rail,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'panel',
  },
})

type ScrollAreaVariants = VariantProps<typeof scrollArea>

/** Props for ScrollArea: `div` props for the root plus the kind and color axes. */
export type ScrollAreaProps = React.ComponentPropsWithRef<'div'> & {
  /**
   * `panel` (default): vertical; its scrollbar gutter is always reserved;
   * the area caps at 50% of the viewport height (`maxBlockSize` changes the
   * cap).
   * `wide`: horizontal, with proximity snap (wide tables).
   * `rail`: horizontal, with mandatory snap (carousels and removable-chip
   * rows).
   */
  kind?: ScrollAreaVariants['kind']
  /**
   * Primary Radix scale: every part (thumb, edges, focus ring). Never
   * defaulted; omitted, it inherits the scope [D133].
   */
  primary?: ScrollAreaVariants['primary']
  /** Secondary Radix scale: unused by the scroll area. Never defaulted. */
  secondary?: ScrollAreaVariants['secondary']
  /**
   * Accessible name for the scrollable region. Given, the viewport becomes a
   * named `region`; the viewport is focusable whenever it scrolls.
   */
  label?: string
  /** Ref to the scrolling viewport, e.g. to scroll it from Prev/Next buttons. */
  viewportRef?: React.Ref<HTMLDivElement>
  /** Class for the content wrapper, the layout box of the children. */
  contentClassName?: string
  /**
   * The area's maximum block size, a CSS length such as
   * `calc(var(--available-height) - 2px)` (a number is px). Default: 50dvh
   * for `panel`, none for `wide` and `rail`.
   */
  maxBlockSize?: string | number
  /**
   * `true` (default): the viewport joins the tab order whenever it scrolls,
   * so a keyboard can scroll it (§10.19). `false` keeps it out, for content
   * whose own items are the focus stops and scroll themselves into view
   * (a tab list).
   */
  focusable?: boolean
  /**
   * `true` (default): the content is at least as wide as its children, so
   * wide content scrolls. `false`: the content keeps the viewport's width
   * and its children overflow it, so their percentages resolve against the
   * viewport (a carousel track).
   */
  fitContent?: boolean
}

/** Whether the overflow edges can follow the viewport's scroll timeline in CSS. */
function supportsScrollTimeline(): boolean {
  return typeof CSS !== 'undefined' && CSS.supports('animation-timeline', 'scroll()')
}

/**
 * The effect behind the viewport: it takes the viewport out of the tab
 * order while it has nothing to scroll and, only where scroll-driven
 * animations are missing, writes the root's overflow attributes for the
 * edge rules. It never changes geometry.
 */
function useOverflowState(
  rootRef: React.RefObject<HTMLDivElement | null>,
  viewportRef: React.RefObject<HTMLDivElement | null>,
  axis: 'x' | 'y',
  focusable: boolean
) {
  React.useEffect(() => {
    const root = rootRef.current
    const viewport = viewportRef.current
    if (!root || !viewport) return undefined
    const cssEdges = supportsScrollTimeline()
    let frame = 0

    const update = () => {
      frame = 0
      const range =
        axis === 'x'
          ? viewport.scrollWidth - viewport.clientWidth
          : viewport.scrollHeight - viewport.clientHeight
      const offset = axis === 'x' ? Math.abs(viewport.scrollLeft) : viewport.scrollTop
      const scrolls = range > 0.5
      if (focusable) viewport.tabIndex = scrolls ? 0 : -1
      if (cssEdges) return
      root.toggleAttribute(`data-has-overflow-${axis}`, scrolls)
      root.toggleAttribute(`data-overflow-${axis}-start`, scrolls && offset > 0.5)
      root.toggleAttribute(`data-overflow-${axis}-end`, scrolls && range - offset > 0.5)
    }
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update)
    }

    update()
    const observer = new ResizeObserver(schedule)
    observer.observe(viewport)
    if (viewport.firstElementChild) observer.observe(viewport.firstElementChild)
    if (!cssEdges) viewport.addEventListener('scroll', schedule, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      viewport.removeEventListener('scroll', schedule)
    }
  }, [rootRef, viewportRef, axis, focusable])
}

/**
 * A native scroll area: the browser's own scrollbar, in the scope's thumb
 * and track colors, and a hard `--border-size-2` `--role-rule` edge on each
 * side with hidden content, never a fade [D21, D68, D207]. Content prints
 * at full height with the edges hidden. Don't nest two scroll areas on the
 * same axis.
 */
export function ScrollArea(props: ScrollAreaProps) {
  const {
    kind,
    primary,
    secondary,
    label,
    viewportRef: viewportRefProp,
    contentClassName,
    maxBlockSize,
    focusable = true,
    fitContent = true,
    className,
    style,
    ref,
    children,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const mergedRootRef = useMergedRef<HTMLDivElement>(ref, rootRef)
  const mergedViewportRef = useMergedRef<HTMLDivElement>(viewportRefProp, viewportRef)
  const axis = (kind ?? 'panel') === 'panel' ? 'y' : 'x'
  useOverflowState(rootRef, viewportRef, axis, focusable)

  const named = label ? ({ role: 'region', 'aria-label': label } as const) : null

  // The cap is a local dimension on the root; the kind classes read it.
  const resolvedStyle =
    maxBlockSize == null
      ? style
      : ({
          ...style,
          '--scroll-area-max-block':
            typeof maxBlockSize === 'number' ? `${maxBlockSize}px` : maxBlockSize,
        } as React.CSSProperties)

  return (
    <div
      {...rest}
      {...scope}
      ref={mergedRootRef}
      className={scrollArea({ kind, primary, secondary, className })}
      style={resolvedStyle}
    >
      <div
        ref={mergedViewportRef}
        className={styles.viewport}
        {...named}
        // A tab stop from the first paint, so the area is reachable without
        // script; the effect drops it while nothing scrolls. With `false`
        // it stays out: Chromium would otherwise make a scroller with no
        // focusable content a tab stop on its own.
        tabIndex={focusable ? 0 : -1}
      >
        <div className={cx(styles.content, !fitContent && styles.contentFluid, contentClassName)}>
          {children}
        </div>
      </div>
      <span className={`${styles.edge} ${styles.edgeStart}`} aria-hidden="true" />
      <span className={`${styles.edge} ${styles.edgeEnd}`} aria-hidden="true" />
    </div>
  )
}
