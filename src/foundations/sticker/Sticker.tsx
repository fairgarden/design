'use client'

import * as React from 'react'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import { cva, type VariantProps } from 'class-variance-authority'

import { Ground } from '../ground'
import {
  primaryScaleVariants,
  secondaryScaleVariants,
  type PrimaryScale,
  type RadixScale,
} from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './sticker.module.css'

/*
 * Sticker (§6.5, §6.12, §6.14): Bareburger's die-cut halo. Hand art with an
 * 8 px `--primary1` halo around its merged silhouette, which separates the
 * art from any ground without shadow, alpha or blur. Decorative
 * (`aria-hidden`); at most one per scene; sizes S and L only; never on a
 * photograph.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: sticker.module.css; CVA function `sticker`.
 * - Axes: `size` → s | l (`--ds-size-art-s` 152 px, `--ds-size-art-l`
 *   312 px, with their stroke pairs); `bare` → `bare` (no halo and no scope
 *   of its own: the host's `--role-heading`, counters open); `primary`,
 *   `secondary` → scales module classes (bare only; a haloed sticker passes
 *   them to its own scope).
 * - Compound variants: none.
 * - Defaults: size s, bare false; color axes: none.
 * - Color fallback: the sticker's own `white` scope (olive × green), so it
 *   looks the same on every ground; bare, it inherits the host scope.
 * - States: static.
 * - Parts: base (the sized box), art (the SVG), the scope (the nested
 *   Ground, an SVG group; no class of its own), halo (the asset's
 *   pre-expanded halo path, `--primary1`), line (the line art in
 *   `--role-heading`: strokes at the silhouette weight, ink fills through
 *   `fill="currentColor"`), detail (interior lines at the lighter weight;
 *   `StickerDetail`).
 * - Scope: a nested `kind="face"` Ground, preset `white`, rendered as the
 *   SVG group that holds halo and line, so it paints no box: it follows the
 *   page mode on a page ground and is a light island (`data-theme="light"`)
 *   inside a field or the night band, which Ground writes from context
 *   [D148, D149, D179]. The halo names `--primary1` directly, never
 *   `--role-halo` [D144, D150].
 * - Container: none. Fixed sizes, never scaled with the viewport (P9) [D78];
 *   a smaller box (the empty state's spot size) swaps the size, keeping
 *   strokes at their token weight.
 */
export const sticker = cva(styles.base, {
  variants: {
    size: {
      s: styles.s,
      l: styles.l,
    },
    bare: {
      true: styles.bare,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    size: 's',
    bare: false,
  },
})

type StickerVariants = VariantProps<typeof sticker>

/** The two native sticker sizes (§6.2): S 152 px, L 312 px. */
export type StickerSize = 's' | 'l'

/** Props for Sticker: `span` props, `render`, the art, the size, `bare` and the color axes. */
export type StickerProps = Omit<useRender.ComponentProps<'span'>, 'children'> & {
  /**
   * The asset's viewBox, drawn at its native size: `0 0 152 152` for S,
   * `0 0 312 312` for L (other aspect ratios keep the width).
   */
  viewBox: string
  /**
   * The halo layer: the asset's pre-expanded path, 8 px (`--ds-space-halo`)
   * outside every part, merged into one silhouette with rounded concave
   * bridges and no sharp outer corners. Never a runtime stroke, outline or
   * blur. Filled `--primary1`; no edge, ever. Ignored with `bare`.
   */
  halo?: React.ReactNode
  /**
   * The line art, stroked in `--role-heading` at the silhouette weight
   * (`--ds-stroke-3` at S, `--ds-stroke-4` at L), round caps and joins, no
   * fill; give ink-spot parts `fill="currentColor"`, and wrap interior lines
   * in `StickerDetail`. No text inside the art.
   */
  children: React.ReactNode
  /** `s` (default): `--ds-size-art-s`, 152 px. `l`: `--ds-size-art-l`, 312 px. */
  size?: StickerSize
  /**
   * The bare variant: no halo and no scope of its own; the art draws in the
   * host ground's `--role-heading` with open counters. Never on a
   * decorative pattern. Default `false`.
   */
  bare?: boolean
  /**
   * Primary Radix scale: the halo's `--primary1` (the sticker's own scope),
   * or, when bare, the host's. Override only with a pairing §2 verifies
   * [D128]. Never defaulted.
   */
  primary?: StickerVariants['primary']
  /**
   * Secondary Radix scale: the line's `--role-heading` (step 12). Override
   * only with a verified pairing [D128]. Never defaulted.
   */
  secondary?: StickerVariants['secondary']
}

/**
 * A §6.5 sticker: pass the asset's `viewBox`, its pre-expanded `halo` path
 * and its line art as children. It declares its own `white` scope, so the
 * same asset looks identical on every ground within a mode: a face that
 * follows the page mode on a page ground, a light island inside a field or
 * the night band. In print the halo vanishes and the line prints black.
 */
export function Sticker(props: StickerProps) {
  const {
    render,
    ref,
    className,
    viewBox,
    halo,
    children,
    size = 's',
    bare = false,
    primary,
    secondary,
    ...rest
  } = props
  const scope = useScopeAttributes()

  const line = <g className={styles.line}>{children}</g>
  const art = (
    <svg className={styles.art} viewBox={viewBox} focusable="false" aria-hidden="true">
      {bare ? (
        line
      ) : (
        <Ground
          kind="face"
          preset="white"
          primary={(primary ?? undefined) as PrimaryScale | undefined}
          secondary={(secondary ?? undefined) as RadixScale | undefined}
          render={<g />}
        >
          {halo != null ? <g className={styles.halo}>{halo}</g> : null}
          {line}
        </Ground>
      )}
    </svg>
  )

  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: mergeProps<'span'>(
      {
        ...(bare ? scope : null),
        'aria-hidden': true,
        className: sticker({
          size,
          bare,
          primary: bare ? primary : undefined,
          secondary: bare ? secondary : undefined,
          className,
        }),
        children: art,
      },
      rest
    ),
  })
}

/** Props for StickerDetail: SVG group props. */
export type StickerDetailProps = Omit<React.SVGProps<SVGGElement>, 'ref'>

/**
 * Interior lines, one stroke step lighter than the silhouette
 * (`--border-size-2` at S, `--ds-stroke-3` at L): at most two weights per
 * drawing, depth by weight, never tone (§6.2).
 */
export function StickerDetail(props: StickerDetailProps) {
  const { className, ...rest } = props
  return <g {...rest} className={className ? `${styles.detail} ${className}` : styles.detail} />
}
