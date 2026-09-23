'use client'

import * as React from 'react'
import { Separator as BaseSeparator } from '@base-ui/react/separator'
import { cva, type VariantProps } from 'class-variance-authority'

import { resolveClassName } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './separator.module.css'

/**
 * Separator (§9.12). `variant` names the line by role and style, within what
 * §4.2 allows a separator: solid `rule` (default, `--role-rule`) and
 * `hairline` (`--role-hairline`), `dotted` (relation subdivisions only),
 * `doubleHair` (totals, running headers) and `ruleDot` (the rule–dot–rule
 * thematic break). No dashed value: dashes never divide [D35]. Orientation is
 * Base UI's own prop. Color axes inherit the host's scope [D133].
 */
export const separator = cva(styles.base, {
  variants: {
    variant: {
      rule: styles.rule,
      hairline: styles.hairline,
      dotted: styles.dotted,
      doubleHair: styles.doubleHair,
      ruleDot: styles.ruleDot,
    },
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    variant: 'rule',
  },
})

export type SeparatorVariants = VariantProps<typeof separator>
export type SeparatorVariant = NonNullable<SeparatorVariants['variant']>
type Orientation = NonNullable<BaseSeparator.Props['orientation']>

/** Props for Separator: Base UI Separator props (including `orientation`) plus the variant and color axes. */
export interface SeparatorProps extends BaseSeparator.Props, SeparatorVariants {
  /**
   * The line by role: `rule` (default) in `--role-rule`, a division the
   * reader must find; `hairline` in `--role-hairline`, where whitespace also
   * carries structure; `dotted` for relation subdivisions only; `doubleHair`
   * for totals and running headers; `ruleDot` for a thematic break
   * (horizontal only).
   */
  variant?: SeparatorVariants['variant']
  /**
   * Primary Radix scale: the line color. Never defaulted; omitted, it
   * inherits the host's scope [D133].
   */
  primary?: SeparatorVariants['primary']
  /**
   * Secondary Radix scale, accepted for the shared color contract; no
   * separator part draws in an accent. Never defaulted.
   */
  secondary?: SeparatorVariants['secondary']
}

/** The `dotted` run: true round dots as zero-length round-capped dashes (§4.8.3). */
function DotRun({ orientation }: { orientation: Orientation }) {
  const vertical = orientation === 'vertical'
  return (
    <svg className={styles.dots} aria-hidden="true" focusable="false">
      <line
        x1={vertical ? '50%' : '0'}
        y1={vertical ? '0' : '50%'}
        x2={vertical ? '50%' : '100%'}
        y2={vertical ? '100%' : '50%'}
      />
    </svg>
  )
}

/** `ornament-rule-dot` (§4.8.2): hairline, solid dot, hairline. */
function RuleDot() {
  return (
    <>
      <span className={styles.segment} />
      <svg className={styles.dot} viewBox="0 0 2 2" aria-hidden="true" focusable="false">
        <circle cx="1" cy="1" r="1" />
      </svg>
      <span className={styles.segment} />
    </>
  )
}

/**
 * A separator announced to assistive technology (Base UI). Use it where the
 * grouping would otherwise be unclear; typographic separators (· • | ›) are
 * text, composed from this module's `glyph` / `glyphInk` parts by the host.
 * `ruleDot` is horizontal only.
 */
export function Separator(props: SeparatorProps) {
  const { variant, primary, secondary, className, orientation = 'horizontal', ...rest } = props
  const scope = useScopeAttributes()
  const resolvedVariant: SeparatorVariant = variant ?? 'rule'

  const classes = resolveClassName(className, (extra) =>
    separator({ variant, primary, secondary, className: extra })
  )

  return (
    <BaseSeparator {...scope} {...rest} orientation={orientation} className={classes}>
      {resolvedVariant === 'dotted' ? <DotRun orientation={orientation} /> : null}
      {resolvedVariant === 'ruleDot' ? <RuleDot /> : null}
    </BaseSeparator>
  )
}
