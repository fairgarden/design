'use client'

import * as React from 'react'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import { cva, type VariantProps } from 'class-variance-authority'

import { Sticker, type StickerProps } from '../Sticker'
import { OrnamentTrail } from '../../utils/Ornament'
import { cx } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './empty-state.module.css'

/*
 * Empty State (§12.16): a list, grid, search or collection with no items.
 * It says what is empty and offers a next step; a sanctioned place for one
 * ornament (P6). Not for errors (§10.20) or loading.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: empty-state.module.css; CVA function `emptyState`.
 * - Axes: `kind` → framed | inline | illustrated; `filtered` → `filtered`
 *   (a filter caused it: a polite status region, and not printed);
 *   `primary`, `secondary` → scales module classes.
 * - Compound variants: none.
 * - Defaults: kind framed, filtered false; color axes: none.
 * - Color fallback: inherits the scope; the action Button brings its own
 *   fallback (§9.2).
 * - States: static; the action follows §9.2.
 * - Parts: base, frame (the padded box; its dashed outline is the SVG
 *   `frameLine` > `frameRect`, composing line-dashed), drawing (the §6.5
 *   Sticker, S size), trail (the shared `ornament-trail`, short-tail shape,
 *   utils/Ornament), heading, text, action. `drawing` and `trail` are
 *   exclusive and rendered by content, with no axis [D38].
 * - Scope: `drawing` renders the Sticker, which declares its own nested
 *   `white` scope (a light island inside a field or the night band); the
 *   module names none.
 * - Container: `base` is the inline-size container (unnamed); the frame's
 *   drawing-beside-text layout queries it. Baseline without support:
 *   drawing above the text, with the viewport fallback of the side layout
 *   from --lg-n-above. Threshold (§5.10.2): drawing beside the text from
 *   1024, content capped at --size-sm and centered [D163].
 */
export const emptyState = cva(styles.base, {
  variants: {
    kind: {
      framed: styles.framed,
      inline: styles.inline,
      illustrated: styles.illustrated,
    },
    filtered: {
      true: styles.filtered,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'framed',
    filtered: false,
  },
})

type EmptyStateVariants = VariantProps<typeof emptyState>

/** The three empty-state builds (§12.16). */
export type EmptyStateKind = 'framed' | 'inline' | 'illustrated'

/** Props for EmptyState: `div` props, `render`, the kind, `filtered` and the color axes. */
export type EmptyStateProps = useRender.ComponentProps<'div'> & {
  /**
   * `framed` (default): a centered stack in a `line-dashed` frame (dashed
   * means provisional: a place not yet filled). `inline`: one sentence in
   * place of the content, no frame, inside dense panels. `illustrated`:
   * framed, plus a §6.5 sticker (S size) in `EmptyStateDrawing`.
   */
  kind?: EmptyStateKind
  /**
   * A filter caused it: the root becomes a polite status region
   * (`role="status"`), and it is not printed (print the unfiltered list, or
   * "No items" once). Name the filter and offer "Clear Filters". Default
   * `false`.
   */
  filtered?: boolean
  /**
   * Primary Radix scale: the frame, heading and text. Never defaulted;
   * omitted, it inherits the scope [D133].
   */
  primary?: EmptyStateVariants['primary']
  /**
   * Secondary Radix scale: only the trail ornament (`--role-accent`). Never
   * defaulted.
   */
  secondary?: EmptyStateVariants['secondary']
}

/**
 * The empty state, rendered in place of a list or grid: an optional
 * `EmptyStateDrawing` or `EmptyStateTrail` (one, never both), an
 * `EmptyStateHeading`, an `EmptyStateText` and an `EmptyStateAction` (an
 * outline Button, or the solid one when it is the page's main next step).
 * Pass `role="status"` when it replaces dynamic results (automatic with
 * `filtered`). Never set its text lighter than the scope's ink.
 */
export function EmptyState(props: EmptyStateProps) {
  const {
    render,
    ref,
    className,
    kind = 'framed',
    filtered = false,
    primary,
    secondary,
    children,
    ...rest
  } = props
  const scope = useScopeAttributes()
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>(
      {
        ...scope,
        ...(filtered ? { role: 'status' } : null),
        className: emptyState({ kind, filtered, primary, secondary, className }),
        children: (
          <div className={styles.frame}>
            {kind !== 'inline' ? (
              <svg className={styles.frameLine} aria-hidden="true" focusable="false">
                <rect className={styles.frameRect} width="100%" height="100%" rx="8" ry="8" />
              </svg>
            ) : null}
            {children}
          </div>
        ),
      },
      rest
    ),
  })
}

/** Props for EmptyStateDrawing: `div` props, `render`, and the sticker's art (`viewBox`, `halo`, line art as children). */
export type EmptyStateDrawingProps = Omit<useRender.ComponentProps<'div'>, 'children'> &
  Pick<StickerProps, 'viewBox' | 'halo' | 'children'>

/**
 * The drawing (`illustrated`): a §6.5 Sticker at `--ds-size-art-s` with its
 * halo, decorative (`aria-hidden`); the spot size `--size-px-9` below
 * 360 px. Pass the asset's `viewBox`, its pre-expanded `halo` path and its
 * line art as children. The sticker brings its own `white` scope, so it
 * looks the same on every ground and ignores the empty state's props.
 */
export function EmptyStateDrawing(props: EmptyStateDrawingProps) {
  const { render, ref, className, viewBox, halo, children, ...rest } = props
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>(
      {
        'aria-hidden': true,
        className: cx(styles.drawing, className),
        children: (
          <Sticker size="s" viewBox={viewBox} halo={halo}>
            {children}
          </Sticker>
        ),
      },
      rest
    ),
  })
}

/** Props for EmptyStateTrail: `div` props and `render`; the trail itself is drawn. */
export type EmptyStateTrailProps = Omit<useRender.ComponentProps<'div'>, 'children'>

/**
 * The trail, the alternative to a drawing: the short-tail `ornament-trail`
 * (utils/Ornament), from its origin circle to a `marker-terminal` that
 * points down at the action, dashed in `--role-accent`, decorative. Hidden
 * if it would touch type.
 */
export function EmptyStateTrail(props: EmptyStateTrailProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>(
      {
        'aria-hidden': true,
        className: cx(styles.trail, className),
        children: <OrnamentTrail shape="short-tail" />,
      },
      rest
    ),
  })
}

/** Props for EmptyStateHeading: heading props and `render` (default `<h3>`). */
export type EmptyStateHeadingProps = useRender.ComponentProps<'h3'>

/** What is empty: `type-itemhead` in `--primary12`, centered. Renders `<h3>`. */
export function EmptyStateHeading(props: EmptyStateHeadingProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'h3',
    render,
    ref,
    props: mergeProps<'h3'>({ className: cx(styles.heading, className) }, rest),
  })
}

/** Props for EmptyStateText: paragraph props and `render`. */
export type EmptyStateTextProps = useRender.ComponentProps<'p'>

/**
 * Why, and what to do next: `type-body-ui` in `--primary12`, at most 40ch.
 * When a filter caused it, name the filter ("No events match 'Virtual'").
 */
export function EmptyStateText(props: EmptyStateTextProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: mergeProps<'p'>({ className: cx(styles.text, className) }, rest),
  })
}

/** Props for EmptyStateAction: `div` props and `render`. */
export type EmptyStateActionProps = useRender.ComponentProps<'div'>

/**
 * The next step: an outline Button (md), or the solid one when it is the
 * page's main next step; "Clear Filters" after a filter (title case).
 */
export function EmptyStateAction(props: EmptyStateActionProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({ className: cx(styles.action, className) }, rest),
  })
}

