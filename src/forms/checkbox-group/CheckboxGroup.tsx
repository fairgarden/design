'use client'

import * as React from 'react'
import { CheckboxGroup as BaseCheckboxGroup } from '@base-ui/react/checkbox-group'
import { cva, type VariantProps } from 'class-variance-authority'

import { CheckboxKindContext } from '../checkbox'
import { resolveClassName } from '../../utils/className'
import {
  primaryScaleVariants,
  secondaryScaleVariants,
} from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'

import styles from './checkbox-group.module.css'

/*
 * Checkbox Group (§10.7): group layout only.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: checkbox-group.module.css; CVA function `checkboxGroup`.
 * - Axes: `kind` → standard | card | ledger (the layout for that build; it
 *   is also passed to the checkboxes inside as their default kind);
 *   `primary`, `secondary` → scales module classes, inherited by the
 *   checkboxes.
 * - Compound variants: none.
 * - Defaults: kind standard; color axes none [D133].
 * - Color fallback: inherits the scope.
 * - States: data-disabled (Base UI) → carried by each checkbox's own
 *   data-disabled; the group draws nothing.
 * - Parts: base.
 * - Scope: none.
 * - Container: `base` is the inline-size container `checkbox-group`.
 *   Baseline one column (option cards full width); from 480 px short
 *   labels in 2 columns; from 768 px option cards 2-up when there are more
 *   than 4; below 360 px the card value drops under its title (§5.10.2)
 *   [D163].
 */
export const checkboxGroup = cva(styles.base, {
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

type CheckboxGroupVariants = VariantProps<typeof checkboxGroup>

/**
 * Props for CheckboxGroup: Base UI CheckboxGroup props plus the kind and
 * color axes. Label the group with a Fieldset legend or `aria-labelledby`.
 */
export type CheckboxGroupProps = BaseCheckboxGroup.Props & {
  /**
   * The build of the checkboxes inside, and so the group's layout:
   * `standard` (default), `card` (option cards, `--size-px-5` apart) or
   * `ledger` (leader rows). Each Checkbox takes it as its default kind.
   */
  kind?: CheckboxGroupVariants['kind']
  /** Primary Radix scale for every checkbox inside. Never defaulted [D133]. */
  primary?: CheckboxGroupVariants['primary']
  /**
   * Secondary Radix scale for every checkbox inside: the checked fill,
   * mark and edge. Never defaulted, and never the danger scale.
   */
  secondary?: CheckboxGroupVariants['secondary']
}

/**
 * Shared state for a set of Checkboxes (Base UI Checkbox Group). A "select
 * all" parent is a Checkbox with `parent`, and the group needs `allValues`
 * and a controlled `value`. Put the group inside a Fieldset whose legend
 * names the question; the group error message sits under the legend and
 * never turns a box red (§10.7). The root is an inline-size container, so
 * give it a width in shrink-to-fit layouts.
 */
export function CheckboxGroup(props: CheckboxGroupProps) {
  const { kind, primary, secondary, className, children, ...rest } = props

  const scope = useScopeAttributes()

  const variants = { kind, primary, secondary }
  const resolvedClassName = resolveClassName(className, (extra) =>
    checkboxGroup({ ...variants, className: extra })
  )

  return (
    <CheckboxKindContext.Provider value={kind ?? undefined}>
      <BaseCheckboxGroup {...rest} {...scope} className={resolvedClassName}>
        {children}
      </BaseCheckboxGroup>
    </CheckboxKindContext.Provider>
  )
}
