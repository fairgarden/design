'use client'

import * as React from 'react'
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import { cva, type VariantProps } from 'class-variance-authority'

import {
  primaryScaleVariants,
  secondaryScaleVariants,
} from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'

import styles from './checkbox.module.css'

/*
 * Checkbox (§10.7).
 *
 * Implementation (CSS Modules + CVA)
 * - Module: checkbox.module.css; CVA function `checkbox`.
 * - Axes: `kind` → standard | card | ledger (box plus label; the option
 *   card; box at the end of a leader row) [D155]; `primary`, `secondary` →
 *   scales module classes.
 * - Compound variants: none.
 * - Defaults: kind standard (or the enclosing CheckboxGroup's kind); color
 *   axes none [D133].
 * - Color fallback: inherits the scope; its secondary drives the
 *   --role-select aliases and never switches to the danger scale (§10.1).
 * - States: data-checked / data-indeterminate → --role-select fill,
 *   --role-select-mark ✓ or bar, --border-size-2-25 --role-select-edge box edge,
 *   card edge --border-size-2 --role-select-edge (read through :has());
 *   :hover (not disabled or read-only) [D181] → unchecked box fill
 *   --role-soft-hover (--primary3 where soft fills apply), checked box fill
 *   --role-select-hover, the edge unchanged; label the bare-text underline;
 *   unchecked card edge --role-rule → --primary12 [D140];
 *   :focus-visible on the box → ring; data-disabled → dotted edge, fill
 *   dropped, mark --role-muted; data-readonly → rest roles, no hover;
 *   data-invalid → no change (the group message carries it).
 * - Parts: base (the row, a <label>), box (Checkbox.Root), indicator, mark,
 *   check, bar, label, description, thumb, title, value, leader, leaderLine,
 *   and edge / edgeLine (the disabled dotted edge, drawn in SVG).
 * - Scope: none.
 * - Container: none of its own; the option card's value drops under its
 *   title below 360 px of the enclosing `checkbox-group` container, with an
 *   --xs-n-below viewport fallback [D163].
 */
export const checkbox = cva(styles.base, {
  variants: {
    kind: {
      standard: styles.standard,
      card: styles.card,
      ledger: styles.ledger,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'standard',
  },
})

type CheckboxVariants = VariantProps<typeof checkbox>

/** The structural build of a Checkbox (§10.7). */
export type CheckboxKind = NonNullable<CheckboxVariants['kind']>

/**
 * The kind a CheckboxGroup passes to the checkboxes inside it. A
 * checkbox's own `kind` prop wins.
 */
export const CheckboxKindContext = React.createContext<CheckboxKind | undefined>(
  undefined
)
CheckboxKindContext.displayName = 'CheckboxKindContext'

/**
 * Props for Checkbox: Base UI Checkbox.Root props (on the box) plus the
 * kind, color axes and the row's content. `className` goes on the row.
 */
export type CheckboxProps = Omit<
  BaseCheckbox.Root.Props,
  'className' | 'children'
> & {
  /**
   * `standard` (default): box plus label. `card`: the option card, a
   * bordered row with an optional thumbnail, caps title and right-aligned
   * value. `ledger`: the box at the end of a dotted leader row. Inside a
   * CheckboxGroup the group's kind is the default.
   */
  kind?: CheckboxVariants['kind']
  /**
   * Primary Radix scale: box edge, label and focus ring. Never defaulted;
   * omitted, it inherits the scope [D133].
   */
  primary?: CheckboxVariants['primary']
  /**
   * Secondary Radix scale: the checked fill, mark and edge through
   * --role-select. Omitted, it inherits the scope (green by default). Never
   * the danger scale, even in an error.
   */
  secondary?: CheckboxVariants['secondary']
  /** Class for the row (the `base` part). */
  className?: string
  /**
   * The label, phrased positively. Short labels (about four words) are
   * authored in title case [D160]; the option card sets its title in caps.
   */
  children?: React.ReactNode
  /** Optional helper text under the label, in sentence case. */
  description?: React.ReactNode
  /** `card` only: an optional thumbnail (an `img`), shown after the box. */
  thumb?: React.ReactNode
  /**
   * `card` and `ledger`: the value, such as a price ("+ $75.00") or a
   * quantity blank. Right-aligned on a card; before the box on a ledger row.
   */
  valueLabel?: React.ReactNode
}

function DisabledEdge() {
  return (
    <svg className={styles.edge} aria-hidden="true" focusable="false">
      <rect className={styles.edgeLine} width="100%" height="100%" />
    </svg>
  )
}

/**
 * A Base UI Checkbox inside its own label row, so the whole row is the hit
 * target. The ✓ and the indeterminate bar are drawn at --border-size-2
 * with round caps; checked is a --role-select fill, the mark and a 3 px
 * edge, never fill alone [D15]. Use it for independent yes/no choices or
 * inside a CheckboxGroup; an instant setting is a Switch.
 */
export function Checkbox(props: CheckboxProps) {
  const {
    kind,
    primary,
    secondary,
    className,
    children,
    description,
    thumb,
    valueLabel,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const groupKind = React.useContext(CheckboxKindContext)
  const resolvedKind: CheckboxKind = kind ?? groupKind ?? 'standard'

  return (
    <label
      {...scope}
      className={checkbox({ kind: resolvedKind, primary, secondary, className })}
    >
      <BaseCheckbox.Root {...rest} className={styles.box}>
        <BaseCheckbox.Indicator className={styles.indicator}>
          <svg
            className={styles.mark}
            viewBox="0 0 20 20"
            aria-hidden="true"
            focusable="false"
          >
            <path className={styles.check} d="M5.5 10.5l3 3 6-7" />
            <path className={styles.bar} d="M6 10h8" />
          </svg>
        </BaseCheckbox.Indicator>
        <DisabledEdge />
      </BaseCheckbox.Root>
      {resolvedKind === 'card' && thumb != null ? (
        <span className={styles.thumb}>{thumb}</span>
      ) : null}
      {children == null ? null : (
        <span className={resolvedKind === 'card' ? styles.title : styles.label}>
          {children}
        </span>
      )}
      {resolvedKind === 'ledger' ? (
        <svg className={styles.leader} aria-hidden="true" focusable="false">
          <line className={styles.leaderLine} x1="0" y1="75%" x2="100%" y2="75%" />
        </svg>
      ) : null}
      {resolvedKind !== 'standard' && valueLabel != null ? (
        <span className={styles.value}>{valueLabel}</span>
      ) : null}
      {description == null ? null : (
        <span className={styles.description}>{description}</span>
      )}
      {resolvedKind === 'card' ? <DisabledEdge /> : null}
    </label>
  )
}
