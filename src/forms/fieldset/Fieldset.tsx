'use client'

import * as React from 'react'
import { Fieldset as BaseFieldset } from '@base-ui/react/fieldset'
import { cva, type VariantProps } from 'class-variance-authority'

import { resolveClassName, cx } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './fieldset.module.css'

/*
 * Fieldset (§10.2): controls that answer one question, and every checkbox
 * or radio group.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: fieldset.module.css; CVA function `fieldset`.
 * - Axes: `variant` → text (open: legend plus hairline rule, no container),
 *   outline (framed), ledger (the dotted frame with leader rows [D35]);
 *   `primary`, `secondary` → scales module classes (structure takes
 *   `primary` only; `secondary` is accepted unused).
 * - Compound variants: none.
 * - Defaults: variant text; color axes none.
 * - Color fallback: inherits the scope.
 * - States: root `data-disabled` → legend `--role-muted`, its controls
 *   disabled (Base UI passes it down).
 * - Parts: base, legend, rule, leader; `frame` / `frameLine` draw the
 *   ledger's dotted frame in SVG.
 * - Scope: none.
 * - Container: none of its own. Framed padding reads the Form container
 *   `form` (below 360 px: --size-px-2-5), with the viewport as fallback.
 */
export const fieldset = cva(styles.base, {
  variants: {
    variant: {
      text: styles.text,
      outline: styles.outline,
      ledger: styles.ledger,
    },
    // Color axes: never defaulted [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    variant: 'text',
  },
})

type FieldsetVariants = VariantProps<typeof fieldset>

/** Props for Fieldset: Base UI Fieldset.Root props plus the variant and color axes. */
export type FieldsetProps = BaseFieldset.Root.Props & {
  /**
   * `text` (default) is open: a legend over a hairline rule. `outline` is
   * the framed panel for technical forms and calculators; never nest two.
   * `ledger` is the dotted frame for self-contained order and checklist
   * forms, with `FieldsetLeader` rows.
   */
  variant?: FieldsetVariants['variant']
  /** Primary Radix scale: legend, frame and rules. Never defaulted [D133]. */
  primary?: FieldsetVariants['primary']
  /** Secondary Radix scale: accepted, unused (structure is primary only). */
  secondary?: FieldsetVariants['secondary']
}

/**
 * A Base UI Fieldset: a native `fieldset` whose first child is a
 * `FieldsetLegend`. `disabled` disables the legend and every control in it;
 * hiding the group is usually better.
 */
export function Fieldset(props: FieldsetProps) {
  const { variant, primary, secondary, className, children, ...rest } = props
  const scope = useScopeAttributes()

  return (
    <BaseFieldset.Root
      {...rest}
      {...scope}
      className={resolveClassName(className, (extra) =>
        fieldset({ variant, primary, secondary, className: extra }),
      )}
    >
      {variant === 'ledger' ? (
        <svg className={styles.frame} aria-hidden="true" focusable="false">
          <rect className={styles.frameLine} width="100%" height="100%" />
        </svg>
      ) : null}
      {children}
    </BaseFieldset.Root>
  )
}

/** Props for FieldsetLegend: Base UI Fieldset.Legend props. */
export type FieldsetLegendProps = BaseFieldset.Legend.Props

/**
 * The legend, a native `legend`: `type-field-label` in `--primary12`, title
 * case up to about four words, sentence case for longer or question
 * legends [D160]. Open fieldsets draw the hairline rule under it; framed
 * fieldsets set it into the top edge.
 */
export function FieldsetLegend(props: FieldsetLegendProps) {
  const { className, children, render, ...rest } = props
  return (
    <BaseFieldset.Legend
      {...rest}
      render={render ?? <legend />}
      className={resolveClassName(className, (extra) => cx(styles.legend, extra))}
    >
      {children}
      <span className={styles.rule} aria-hidden="true" />
    </BaseFieldset.Legend>
  )
}

/** Props for FieldsetLeader: SVG props without children. */
export type FieldsetLeaderProps = Omit<React.ComponentPropsWithRef<'svg'>, 'children'>

/**
 * The ledger's `line-dotted-fine` leader in `--role-rule`, running from a
 * row's label to its control. Place it between the two in
 * a row that lays out inline; it grows to fill the space. Decorative.
 */
export function FieldsetLeader(props: FieldsetLeaderProps) {
  const { className, ...rest } = props
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      {...rest}
      className={cx(styles.leader, className)}
    >
      <line className={styles.leaderLine} x1="0" y1="50%" x2="100%" y2="50%" />
    </svg>
  )
}
