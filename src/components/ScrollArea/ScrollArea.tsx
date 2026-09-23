'use client'

import * as React from 'react'
import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area'
import { cva, type VariantProps } from 'class-variance-authority'

import { cx, resolveClassName } from '../../utils/className'
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
 * - Axes: `kind` → panel | wide | rail (panel: vertical, scrollbar on
 *   hover, focus and scroll; wide: horizontal, scrollbar always visible;
 *   rail: the 2 px progress rail) [D155]; `primary`, `secondary` → scales
 *   module classes (`secondary` unused).
 * - Compound variants: none.
 * - Defaults: kind panel; color axes none [D133].
 * - Color fallback: inherits the scope.
 * - States: Scrollbar `data-orientation` → its edge; `data-hovering`,
 *   `data-scrolling` → the panel scrollbar shows and the thumb widens;
 *   Thumb `:active` → --primary12; Root `data-has-overflow-x/-y` → the
 *   gutter is reserved; `data-overflow-{x,y}-{start,end}` → each `edge`
 *   rule; Viewport `:focus-visible` → ring.
 * - Parts: base, viewport, content, scrollbar, thumb, corner, edge
 *   (edgeStart, edgeEnd).
 * - Scope: none.
 * - Container: none; inherits its context.
 *
 * Hook for composed components: `--scroll-area-edge-start: none` on the
 * root hides the start edge, for a table whose pinned column draws that
 * edge itself (§8.2). `maxBlockSize` writes `--scroll-area-max-block`, the
 * root's cap (50dvh on a panel by default).
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

/** Props for ScrollArea: Base UI Scroll Area Root props plus the kind and color axes. */
export type ScrollAreaProps = BaseScrollArea.Root.Props & {
  /**
   * `panel` (default): vertical; the scrollbar shows on hover, focus and
   * scroll; the area caps at 50% of the viewport height (`maxBlockSize`
   * changes the cap).
   * `wide`: horizontal, the scrollbar always visible (wide tables).
   * `rail`: horizontal, a 2 px progress rail whose thumb equals the visible
   * fraction (carousels and removable-chip rows).
   */
  kind?: ScrollAreaVariants['kind']
  /**
   * Primary Radix scale: every part (track, thumb, edges, focus ring). Never
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

/**
 * A Base UI Scroll Area. Overflow is shown by a hard `--border-size-2`
 * `--role-rule` edge on each side with hidden content, never a fade
 * [D21, D68], and by a hairline track with a `--role-rule` thumb. Content
 * prints at full height with the scrollbars and edges hidden. Don't nest
 * two scroll areas on the same axis.
 */
export function ScrollArea(props: ScrollAreaProps) {
  const {
    kind,
    primary,
    secondary,
    label,
    viewportRef,
    contentClassName,
    maxBlockSize,
    focusable = true,
    fitContent = true,
    className,
    style,
    children,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const orientation = (kind ?? 'panel') === 'panel' ? 'vertical' : 'horizontal'
  const variants = { kind, primary, secondary }
  const resolvedClassName = resolveClassName(className, (extra) =>
    scrollArea({ ...variants, className: extra })
  )

  const named = label ? ({ role: 'region', 'aria-label': label } as const) : null

  // The cap is a local dimension on the root; the kind classes read it.
  const cap =
    maxBlockSize == null
      ? null
      : ({
          '--scroll-area-max-block':
            typeof maxBlockSize === 'number' ? `${maxBlockSize}px` : maxBlockSize,
        } as React.CSSProperties)
  const resolvedStyle =
    cap == null
      ? style
      : typeof style === 'function'
        ? (state: BaseScrollArea.Root.State) => ({ ...style(state), ...cap })
        : { ...style, ...cap }

  return (
    <BaseScrollArea.Root
      {...rest}
      {...scope}
      className={resolvedClassName}
      style={resolvedStyle}
    >
      <BaseScrollArea.Viewport
        ref={viewportRef}
        className={styles.viewport}
        {...named}
        // Base UI makes a scrolling viewport a tab stop; `false` overrides it
        // (an undefined key would erase Base UI's own value, so none is passed).
        {...(focusable ? null : { tabIndex: -1 })}
      >
        <BaseScrollArea.Content
          className={cx(styles.content, contentClassName)}
          // Base UI writes `min-width: fit-content` inline; `false` lifts it.
          {...(fitContent ? null : { style: { minWidth: 0 } })}
        >
          {children}
        </BaseScrollArea.Content>
      </BaseScrollArea.Viewport>
      <BaseScrollArea.Scrollbar orientation={orientation} className={styles.scrollbar}>
        <BaseScrollArea.Thumb className={styles.thumb} />
      </BaseScrollArea.Scrollbar>
      <BaseScrollArea.Corner className={styles.corner} />
      <span className={`${styles.edge} ${styles.edgeStart}`} aria-hidden="true" />
      <span className={`${styles.edge} ${styles.edgeEnd}`} aria-hidden="true" />
    </BaseScrollArea.Root>
  )
}

