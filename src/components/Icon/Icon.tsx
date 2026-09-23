'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import {
  iconPathsByWeight,
  iconTierWeights,
  iconViewBox,
  type IconName,
  type IconTier,
} from '../../icons/paths'

import styles from './icon.module.css'

export type { IconName, IconTier }

/**
 * Icon classes (§6.10) [D166]. `size` is the Material Symbols tier:
 * `inline` 16 px (`--size-px-3`), `tag` 20 px (`--size-px-4`), `block` 36 px
 * (`--ds-size-icon-block`). The icon has no color axes: it is filled in
 * `currentColor` and takes its part's ink role.
 */
export const icon = cva(styles.base, {
  variants: {
    size: {
      inline: styles.inline,
      tag: styles.tag,
      block: styles.block,
    },
    directional: {
      true: styles.directional,
    },
  },
  defaultVariants: {
    size: 'inline',
    directional: false,
  },
})

/**
 * Which weight instance an icon draws (§10.1 icon states) [D166]:
 * - `rest`: the tier's calibrated weight;
 * - `emphasis`: the next stroke tier's weight at the same size, pinned;
 * - `interactive`: rest, swapping to emphasis while an `iconHost` ancestor
 *   is hovered or pressed.
 */
export type IconWeightState = 'rest' | 'emphasis' | 'interactive'

/** Glyphs that point along the inline axis, mirrored in right-to-left layouts (§6.10). */
const directionalIcons: ReadonlySet<IconName> = new Set<IconName>([
  'arrow_forward',
  'chevron_left',
  'chevron_right',
])

/** Props for Icon: SVG props (without `children`, `color`, `fill` and `size`), the size tier, the name and the weight state. */
export type IconProps = Omit<
  React.ComponentPropsWithRef<'svg'>,
  'children' | 'color' | 'fill' | 'size'
> &
  VariantProps<typeof icon> & {
    /** The §6.10 inventory name (Material Symbols Rounded). */
    name: IconName
    /**
     * Accessible name. Omit it for an icon beside a visible label or inside
     * a named control: the icon is then hidden from assistive technology.
     */
    label?: string
    /**
     * `rest` (default) draws the tier's calibrated weight. `emphasis` pins
     * the next stroke tier's weight at the same size, as the weight-change
     * cue of a pressed or selected state. `interactive` draws rest and swaps
     * to emphasis while an ancestor carrying `iconHost` is hovered or
     * pressed; it ships both paths, so use it only inside such a host.
     */
    weight?: IconWeightState
  }

/**
 * A Material Symbols Rounded UI icon, drawn as inline SVG in `currentColor`
 * (FILL 0) at its tier's calibrated weight. The one FILL 1 instance,
 * `circle`, is a selection mark only and must always travel with a second
 * cue (a bar, a weight change, an edge change or a word): state is never
 * shown by fill alone [D166].
 */
export function Icon({
  name,
  label,
  size,
  directional,
  weight = 'rest',
  className,
  ...rest
}: IconProps) {
  const a11y = label
    ? ({ role: 'img', 'aria-label': label } as const)
    : ({ 'aria-hidden': true } as const)
  const weights = iconTierWeights[size ?? 'inline']

  return (
    <svg
      viewBox={iconViewBox}
      fill="currentColor"
      focusable="false"
      {...a11y}
      {...rest}
      className={icon({
        size,
        directional: directional ?? directionalIcons.has(name),
        className,
      })}
    >
      {weight === 'interactive' ? (
        <>
          <path className={styles.rest} d={iconPathsByWeight[weights.rest][name]} />
          <path className={styles.emphasis} d={iconPathsByWeight[weights.emphasis][name]} />
        </>
      ) : (
        <path d={iconPathsByWeight[weights[weight]][name]} />
      )}
    </svg>
  )
}
