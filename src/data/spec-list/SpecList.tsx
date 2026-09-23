'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './spec-list.module.css'

/*
 * Leader list (§8.3; the §12.7 leader sheet): label, a dotted leader, then
 * the value right-aligned in tabular figures. Prices, dimensions,
 * printable forms.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: spec-list.module.css; CVA function `specList`.
 * - Axes: `primary`, `secondary` → scales module classes.
 * - Compound variants: none.
 * - Defaults: color axes none [D133].
 * - Color fallback: inherits the scope. Secondary drives nothing here.
 * - States: static.
 * - Parts: base (`dl`, the container), item, label, leader (the item's
 *   `::before`, a `line-dotted-fine` run in --role-rule drawn as an SVG
 *   mask), value.
 * - Scope: none.
 * - Container: `base` is an inline-size container; below 320 px of it the
 *   leader drops and the label stacks over the value. Baseline without
 *   support: the leader stays and wraps safely.
 */
export const specList = cva(styles.base, {
  variants: {
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

type SpecListVariants = VariantProps<typeof specList>

/** Props for SpecList: `dl` props and the color axes. */
export type SpecListProps = React.ComponentPropsWithRef<'dl'> & {
  /**
   * Primary Radix scale: labels, leaders and values. Never defaulted;
   * omitted, it inherits the scope [D133].
   */
  primary?: SpecListVariants['primary']
  /** Secondary Radix scale: unused. Never defaulted. */
  secondary?: SpecListVariants['secondary']
}

/** The leader list. Put `SpecListItem`s inside; on a saturated ground keep it to 6 pairs. */
export function SpecList(props: SpecListProps) {
  const { primary, secondary, className, ...rest } = props
  const scope = useScopeAttributes()
  return <dl {...rest} {...scope} className={specList({ primary, secondary, className })} />
}

/** Props for SpecListItem: `div` props and the label. */
export type SpecListItemProps = React.ComponentPropsWithRef<'div'> & {
  /** The caps label (`type-label`); author it in sentence case. */
  label: React.ReactNode
}

/**
 * One pair: "Label ········ Value". The leader stops `--size-px-2` short of
 * each text and sits on the label's last baseline; a long value wraps and
 * stays right-aligned. A label never splits from its value in print.
 */
export function SpecListItem(props: SpecListItemProps) {
  const { label, className, children, ...rest } = props
  return (
    <div {...rest} className={className ? `${styles.item} ${className}` : styles.item}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{children}</dd>
    </div>
  )
}
