'use client'

import * as React from 'react'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import { cva, type VariantProps } from 'class-variance-authority'

import { Ground } from '../Ground'
import {
  primaryScaleVariants,
  secondaryScaleVariants,
  type RadixScale,
} from '../../utils/scales'
import { useScopeAttributes, type PageGroundPreset } from '../../utils/scope'
import {
  StatusGlyph,
  statusLabels,
  statusScales,
  type Status,
  type StatusGlyphProps,
} from '../../utils/StatusGlyph'
import styles from './badge.module.css'

// The shared status glyph (src/utils), re-exported here for existing imports.
export { StatusGlyph, statusScales, type StatusGlyphProps }

/*
 * Badge (§10.11): a short static label, a state or a count; never a button,
 * never more than three words.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: badge.module.css; CVA function `badge`.
 * - Axes: `variant` → solid | static | sticker (the `base` class is the
 *   outline badge, so outline needs no value; `static` → `staticFill`, the
 *   --secondary4 fill with a --secondary11 edge and a --primary12 label,
 *   which a solid pill on a "none" scale also takes); `status` → info |
 *   success | warning | danger (the status badge: glyph plus word,
 *   §1.5.4); `numeric` →
 *   `numeric` (a count in `type-data`); `primary`, `secondary` → scales
 *   module classes.
 * - Compound variants: none. Excluded in the types: `status` with
 *   `variant`; `numeric` with `variant` or `status`.
 * - Defaults: numeric false, no variant, no status; color axes: none.
 * - Color fallback: inherits the scope (the solid pill takes the scope's
 *   accent secondary, or the taxonomy scale passed as `secondary`); with
 *   `status`, secondary = the status scale [D129].
 * - States: none (static).
 * - Parts: base, glyph (status only), label, count.
 * - Scope: `sticker` → the root is a nested face scope (paper preset, a
 *   light island on dark grounds); otherwise none.
 * - Container: none; inherits its context.
 */
export const badge = cva(styles.base, {
  variants: {
    variant: {
      solid: styles.solid,
      static: styles.staticFill,
      sticker: styles.sticker,
    },
    status: {
      info: styles.info,
      success: styles.success,
      warning: styles.warning,
      danger: styles.danger,
    },
    numeric: {
      true: styles.numeric,
    },
    // Color axes: never defaulted [D133]; status computes secondary.
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    numeric: false,
  },
})

type BadgeVariants = VariantProps<typeof badge>

export type BadgeStatus = Status

/** The glyph's accessible name: the status in words, so it is never shape or color alone. */
export const statusWords: Record<BadgeStatus, string> = statusLabels

/**
 * Scales with no step-9 text ink in a light scope (§1.4.7): a solid pill on
 * them takes the static fill (`variant="static"`: `--secondary4`,
 * `--secondary11` edge, `--primary12` label) instead.
 */
const staticFillScales: ReadonlySet<RadixScale> = new Set<RadixScale>([
  'crimson',
  'gold',
  'pink',
  'red',
  'ruby',
  'tomato',
])

/** The sticker's face scope: a nested paper face [D144]. */
const STICKER_PRESET: PageGroundPreset = 'paper'

type BadgeKindProps =
  | {
      /**
       * Omitted: the outline badge (`--ds-stroke-1-5` `--primary12` edge and
       * label). `solid`: the pill badge, a step-9 fill of the secondary with
       * its edge and a contrast-ink label; on a scale with no step-9 text ink
       * (pink, red, crimson, gold, ruby, tomato) it takes the static fill.
       * `static`: the static fill, a `--secondary4` fill with a
       * `--secondary11` edge and a `--primary12` label (§10.11). `sticker`: a
       * nested paper face with a ring and bold caps, the same on every
       * ground; one per module.
       */
      variant?: 'solid' | 'static' | 'sticker'
      status?: never
      numeric?: false
    }
  | {
      variant?: never
      /**
       * The status badge: a §1.5.4 glyph plus the word (children), on the
       * status fill with a status edge. Sets `secondary` to the status scale.
       */
      status: BadgeStatus
      numeric?: false
    }
  | {
      variant?: never
      status?: never
      /** A count: a numeral in `type-data` in an outline pill at least 20 px wide. */
      numeric: true
    }

/** Props for Badge: `span` props, `render`, the kind (variant, status or numeric) and the color axes. */
export type BadgeProps = useRender.ComponentProps<'span'> &
  BadgeKindProps & {
    /**
     * Primary Radix scale: the outline, sticker and count inks. Never
     * defaulted; omitted, it inherits the scope [D133].
     */
    primary?: BadgeVariants['primary']
    /**
     * Secondary Radix scale: the solid pill's fill (the accent or taxonomy
     * scale). With `status`, the status scale replaces it unless passed.
     */
    secondary?: BadgeVariants['secondary']
    /** The status glyph's accessible name; defaults to the English status word. */
    statusLabel?: string
  }

/**
 * A static label in caps (`type-label`, authored in sentence case; badges
 * keep caps [D160]), 24 px tall, `--radius-round`. Use one badge per item,
 * two at most. On saturated grounds use the outline badge: they take no
 * accent fills. Fills drop in print; edges and words print black.
 */
export function Badge(props: BadgeProps) {
  const {
    render,
    ref,
    className,
    variant,
    status,
    numeric,
    primary,
    secondary,
    statusLabel,
    children,
    ...rest
  } = props

  const scope = useScopeAttributes()

  const content = status ? (
    <>
      <StatusGlyph
        status={status}
        label={statusLabel ?? statusWords[status]}
        className={styles.glyph}
      />
      <span className={styles.label}>{children}</span>
    </>
  ) : numeric ? (
    <span className={styles.count}>{children}</span>
  ) : (
    <span className={styles.label}>{children}</span>
  )

  const resolvedVariant =
    variant === 'solid' && secondary != null && staticFillScales.has(secondary)
      ? 'static'
      : variant

  const element = useRender({
    enabled: variant !== 'sticker',
    defaultTagName: 'span',
    render,
    ref,
    props: mergeProps<'span'>(
      {
        ...scope,
        className: badge({
          variant: resolvedVariant,
          status,
          numeric: numeric ?? false,
          primary,
          secondary: secondary ?? (status ? statusScales[status] : undefined),
          className,
        }),
        children: content,
      },
      rest
    ),
  })

  if (variant !== 'sticker') return element

  // The sticker is its own face scope; Ground writes the scope (and the light island).
  return (
    <Ground
      {...(rest as React.HTMLAttributes<HTMLElement>)}
      ref={ref as React.Ref<HTMLElement>}
      kind="face"
      preset={STICKER_PRESET}
      primary={primary ?? undefined}
      render={render ?? <span />}
      className={badge({ variant, className })}
    >
      {content}
    </Ground>
  )
}
