'use client'

import * as React from 'react'
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group'
import { cva, type VariantProps } from 'class-variance-authority'

import { RadioKindContext } from '../radio'
import { resolveClassName } from '../../utils/className'
import {
  primaryScaleVariants,
  secondaryScaleVariants,
} from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'

import styles from './radio-group.module.css'

/*
 * Radio Group (§10.8): group layout only.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: radio-group.module.css; CVA function `radioGroup`.
 * - Axes: `kind` → standard | pill | swatch (the layout for that build,
 *   classes `standard`, `pill`, `kindSwatch`; also passed to the radios
 *   inside as their default kind); `primary`, `secondary` → scales module
 *   classes, inherited by the radios.
 * - Compound variants: none.
 * - Defaults: kind standard; color axes none [D133].
 * - Color fallback: inherits the scope.
 * - States: data-disabled (Base UI) → carried by each radio's own
 *   data-disabled; the group draws nothing.
 * - Parts: base.
 * - Scope: none.
 * - Container: `base` is the inline-size container `radio-group`.
 *   Baseline: a vertical stack, swatches wrapping in rows; 2–3 standard
 *   options run inline from 768 px of group width (viewport fallback
 *   --md-n-above); option pills always stack (§5.10.2) [D163].
 */
export const radioGroup = cva(styles.base, {
  variants: {
    kind: {
      standard: styles.standard,
      pill: styles.pill,
      swatch: styles.kindSwatch,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'standard',
  },
})

type RadioGroupVariants = VariantProps<typeof radioGroup>

/**
 * Props for RadioGroup: Base UI RadioGroup props plus the kind and color
 * axes. Label the group with a Fieldset legend or `aria-labelledby`.
 */
export type RadioGroupProps<Value = unknown> = BaseRadioGroup.Props<Value> & {
  /**
   * The build of the radios inside, and so the layout: `standard`
   * (default), `pill` (option pills, always stacked) or `swatch` (color
   * discs that wrap). Each Radio takes it as its default kind.
   */
  kind?: RadioGroupVariants['kind']
  /** Primary Radix scale for every radio inside. Never defaulted [D133]. */
  primary?: RadioGroupVariants['primary']
  /** Secondary Radix scale for every radio inside. Never defaulted, never the danger scale. */
  secondary?: RadioGroupVariants['secondary']
}

/**
 * One choice from 2–7 visible options (Base UI Radio Group). Arrow keys
 * move the selection; Tab leaves the group. Preselect a sensible default
 * unless the choice must be deliberate. Eight or more options are a Select.
 * For swatches, let the legend name the choice ("Color: Forest"). The root
 * is an inline-size container, so give it a width in shrink-to-fit layouts.
 */
export function RadioGroup<Value>(props: RadioGroupProps<Value>) {
  const { kind, primary, secondary, className, children, ...rest } = props

  const scope = useScopeAttributes()

  const variants = { kind, primary, secondary }
  const resolvedClassName = resolveClassName(className, (extra) =>
    radioGroup({ ...variants, className: extra })
  )

  return (
    <RadioKindContext.Provider value={kind ?? undefined}>
      <BaseRadioGroup<Value> {...rest} {...scope} className={resolvedClassName}>
        {children}
      </BaseRadioGroup>
    </RadioKindContext.Provider>
  )
}
