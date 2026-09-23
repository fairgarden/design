'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Ground } from '../../foundations/ground'
import { cx } from '../../utils/className'
import {
  primaryScaleVariants,
  secondaryScaleVariants,
  type PrimaryScale,
  type RadixScale,
} from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './figure.module.css'

/*
 * Figure (§8.5): `figure` + `figcaption`. The media, then the label
 * ("Fig. 3"), the caption that says what to notice, and the credit in the
 * same run. Text never sits on the image [D22].
 *
 * Implementation (CSS Modules + CVA)
 * - Module: figure.module.css; CVA function `figure`.
 * - Axes: `kind` → photo | technical | plate (photo: `--ds-radius-8`,
 *   caption below right-flush; technical: square, caption below
 *   left-aligned with the label on its own line; plate: a specimen plate,
 *   a nested `white` face with a `--border-size-1` `--role-edge` frame over
 *   pattern-dotgrid-fine); `framed` → `framed` (technical figures: the
 *   `--border-size-1` frame); `sideCaption` → `sideCaption` (the caption
 *   in the adjacent column from 768 px of the figure); `primary`,
 *   `secondary` → scales module classes.
 * - Compound variants: none.
 * - Defaults: kind photo, framed false, sideCaption false; color axes none
 *   [D133].
 * - Color fallback: inherits the scope; figures have no secondary part.
 * - States: static.
 * - Parts: base (`figure`, the container), media (plateMedia on plates),
 *   caption (`figcaption`), label, text, credit.
 * - Scope: the plate's media is a nested `kind="face"` Ground, preset
 *   `white` (§8.5, §8.7) [D178]: a face that follows the page mode on a page
 *   ground, a light island inside a field or the night band, written by
 *   Ground from context [D149, D179]. Its frame is the face's --role-edge
 *   (--primary10 on a page ground, --primary12 as an island), and a chart
 *   on it keeps two inks. Other kinds name no scope.
 * - Container: `base` (the `figure`) is an inline-size container: the side
 *   caption moves beside the media from 768 px of it. Baseline without
 *   support: caption below.
 */
export const figure = cva(styles.base, {
  variants: {
    kind: {
      photo: styles.photo,
      technical: styles.technical,
      plate: styles.plate,
    },
    framed: {
      true: styles.framed,
    },
    sideCaption: {
      true: styles.sideCaption,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'photo',
    framed: false,
    sideCaption: false,
  },
})

type FigureVariants = VariantProps<typeof figure>
type FigureKind = NonNullable<FigureVariants['kind']>

interface FigureContextValue {
  kind: FigureKind
  primary: PrimaryScale | undefined
  secondary: RadixScale | undefined
}

const FigureContext = React.createContext<FigureContextValue>({
  kind: 'photo',
  primary: undefined,
  secondary: undefined,
})
FigureContext.displayName = 'FigureContext'

/** Props for Figure: `figure` props and the kind, frame, caption-placement and color axes. */
export type FigureProps = React.ComponentPropsWithRef<'figure'> & {
  /**
   * `photo` (default): an editorial photo, `--ds-radius-8`, the caption
   * right-flush below it. `technical`: a chart, diagram or drawing, square,
   * the caption left-aligned below it with the label on its own line.
   * `plate`: a specimen plate on a nested `white` face over a fine dot
   * grid, framed in the face's `--role-edge`; a two-ink chart may sit on it
   * on any ground.
   */
  kind?: FigureVariants['kind']
  /** Technical figures: a `--border-size-1` `--role-rule` frame. Default `false`. */
  framed?: boolean
  /**
   * From 768 px of the figure's width, the caption sits in the adjacent
   * column, top-aligned, beside the media. Default `false`.
   */
  sideCaption?: boolean
  /**
   * Primary Radix scale: caption, label, credit and frames. Never
   * defaulted; omitted, it inherits the scope [D133].
   */
  primary?: FigureVariants['primary']
  /** Secondary Radix scale: unused by the figure itself. Never defaulted. */
  secondary?: FigureVariants['secondary']
}

/**
 * The figure. Put a `FigureMedia` and a `FigureCaption` inside. Every
 * figure gets a caption or a credit, for print; figure and caption never
 * separate across printed pages.
 */
export function Figure(props: FigureProps) {
  const { kind, framed, sideCaption, primary, secondary, className, ...rest } = props
  const scope = useScopeAttributes()
  const context = React.useMemo<FigureContextValue>(
    () => ({
      kind: kind ?? 'photo',
      primary: (primary ?? undefined) as PrimaryScale | undefined,
      secondary: (secondary ?? undefined) as RadixScale | undefined,
    }),
    [kind, primary, secondary]
  )
  return (
    <FigureContext.Provider value={context}>
      <figure
        {...rest}
        {...scope}
        className={figure({ kind, framed, sideCaption, primary, secondary, className })}
      />
    </FigureContext.Provider>
  )
}

/** Props for FigureMedia: `div` props. */
export type FigureMediaProps = React.ComponentPropsWithRef<'div'>

/**
 * The media box: an `img`, `svg` or chart. Photos fill the column;
 * technical figures keep their native width and never scale up [D78]. A
 * decorative photo (empty `alt`) is left out of print. On a plate it is the
 * nested `white` face, which takes the figure's `primary` and `secondary`.
 */
export function FigureMedia(props: FigureMediaProps) {
  const { className, ref, ...rest } = props
  const { kind, primary, secondary } = React.useContext(FigureContext)
  if (kind === 'plate') {
    return (
      <Ground
        {...(rest as React.HTMLAttributes<HTMLElement>)}
        ref={ref as React.Ref<HTMLElement>}
        kind="face"
        preset="white"
        primary={primary}
        secondary={secondary}
        render={<div />}
        className={cx(`${styles.media} ${styles.plateMedia}`, className)}
      />
    )
  }
  return <div {...rest} ref={ref} className={cx(styles.media, className)} />
}

/** Props for FigureCaption: `figcaption` props plus the numbering and the credit. */
export type FigureCaptionProps = React.ComponentPropsWithRef<'figcaption'> & {
  /** The figure number; renders "Fig. 3" (or "Figure 003" with `numbering="catalog"`). */
  number?: number | string
  /** `short` (default): "Fig. 3", "Fig. 3.2". `catalog`: "Figure 001" (menus, specimen sets, product sheets). */
  numbering?: 'short' | 'catalog'
  /** Replaces the generated label entirely. */
  label?: React.ReactNode
  /** Adds "(DETAIL)" to the label, for a crop. */
  detail?: boolean
  /** The credit, in the same run: "Photo: Name / Program" (`type-small`). */
  credit?: React.ReactNode
}

/**
 * The caption: the label in `type-data`, the caption text (the children)
 * in `type-caption` and the credit in `type-small`, all `--role-muted`.
 * Number figures only where the text refers to them.
 */
export function FigureCaption(props: FigureCaptionProps) {
  const { number, numbering = 'short', label, detail, credit, className, children, ...rest } = props
  const generated =
    number == null
      ? null
      : numbering === 'catalog'
        ? `Figure ${String(number).padStart(3, '0')}`
        : `Fig. ${number}`
  const labelText = label ?? generated
  return (
    <figcaption {...rest} className={cx(styles.caption, className)}>
      {labelText == null ? null : (
        <span className={styles.label}>
          {labelText}
          {detail ? ' (DETAIL)' : null}
        </span>
      )}
      {labelText != null && children != null ? ' ' : null}
      {children == null ? null : <span className={styles.text}>{children}</span>}
      {credit != null && (labelText != null || children != null) ? ' ' : null}
      {credit == null ? null : <span className={styles.credit}>{credit}</span>}
    </figcaption>
  )
}

