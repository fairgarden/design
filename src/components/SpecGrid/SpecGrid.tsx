'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Icon, type IconName } from '../Icon'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './spec-grid.module.css'

/*
 * Spec grid (§8.3, the signature variant; the §12.7 "At a Glance" sheet):
 * a boxless `dl` whose cells are each topped by a hairline rule at column
 * width, the rules breaking at the gutter. For an item's measurable
 * attributes; the densest module, with no ornament.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: spec-grid.module.css; CVA functions `specGrid` and
 *   `specGridCell`.
 * - Axes: `primary`, `secondary` → scales module classes. SpecGridItem:
 *   `estimated` → `estimated` (a data flag, not a state).
 * - Compound variants: none.
 * - Defaults: estimated false; color axes none [D133].
 * - Color fallback: inherits the scope. Secondary drives nothing here.
 * - States: static.
 * - Parts: base (the container), grid (`dl`), cell (its top border is the
 *   `rule`; dotted when `estimated`), icon, label, value.
 * - Scope: none.
 * - Container: `base` is the inline-size container `spec-grid` (named for
 *   a grid inside a card or split); `grid` queries it: 1 column below
 *   360 px, 2 from 360, 3 from 768, 4 from 1024. Baseline without support:
 *   auto-fit tracks at the 160 px minimum column, capped at 4; 1 column at
 *   --xs-n-below.
 */
export const specGrid = cva(styles.base, {
  variants: {
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

/** A spec cell; `estimated` swaps the hairline for a dotted `--role-rule` top rule. */
export const specGridCell = cva(styles.cell, {
  variants: {
    estimated: {
      true: styles.estimated,
    },
  },
  defaultVariants: {
    estimated: false,
  },
})

type SpecGridVariants = VariantProps<typeof specGrid>

/** Props for SpecGrid: `div` props (the container) and the color axes. */
export type SpecGridProps = React.ComponentPropsWithRef<'div'> & {
  /**
   * Primary Radix scale: rules, labels, icons and values. Never defaulted;
   * omitted, it inherits the scope [D133].
   */
  primary?: SpecGridVariants['primary']
  /** Secondary Radix scale: unused; the sheet carries no accents. Never defaulted. */
  secondary?: SpecGridVariants['secondary']
  /** Accessible name for the list, e.g. "At a glance", when no heading labels it. */
  label?: string
}

/**
 * The spec grid. Put `SpecGridItem`s inside. The gutter equals the page
 * margin; there is no rule after the last row; cells never split in print.
 */
export function SpecGrid(props: SpecGridProps) {
  const { primary, secondary, label, className, children, ...rest } = props
  const scope = useScopeAttributes()
  return (
    <div {...rest} {...scope} className={specGrid({ primary, secondary, className })}>
      <dl className={styles.grid} aria-label={label}>
        {children}
      </dl>
    </div>
  )
}

/** Props for SpecGridItem: `div` props, the label, an optional icon and the estimate flag. */
export type SpecGridItemProps = React.ComponentPropsWithRef<'div'> & {
  /** The caps label (`type-label`); author it in sentence case. */
  label: React.ReactNode
  /**
   * A decorative data icon before the label (Material Symbols Rounded,
   * inline tier, FILL 0). The label carries the meaning.
   */
  icon?: IconName
  /** An estimated value: dotted top rule and a leading "≈". Don't write the "≈" yourself. */
  estimated?: boolean
}

/**
 * One spec cell: icon and caps label on line 1, the value (`type-body-ui`)
 * below, flush under the icon. Units sit outside the figure after a
 * no-break space, metric in parentheses: "28–34 cm (11–13 in)".
 */
export function SpecGridItem(props: SpecGridItemProps) {
  const { label, icon, estimated, className, children, ...rest } = props
  return (
    <div {...rest} className={specGridCell({ estimated, className })}>
      <dt className={styles.label}>
        {icon ? <Icon name={icon} className={styles.icon} /> : null}
        {label}
      </dt>
      <dd className={styles.value}>
        {estimated ? '≈ ' : null}
        {children}
      </dd>
    </div>
  )
}
