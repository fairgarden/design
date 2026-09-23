'use client'

import * as React from 'react'
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group'
import { cva, type VariantProps } from 'class-variance-authority'

import { ToggleItemContext, type ToggleVariant } from '../toggle'
import { resolveClassName } from '../../utils/className'
import {
  primaryScaleVariants,
  secondaryScaleVariants,
} from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'

import styles from './toggle-group.module.css'

/*
 * Toggle Group (§9.4): separate toggles, the segmented control and the
 * filter-chip group. §9.4 owns filter chips and segments.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: toggle-group.module.css; CVA function `toggleGroup`.
 * - Axes: `variant` → outline | segmented | chip (separate toggles; the
 *   joined container; the wrapping chip layout); `primary`, `secondary` →
 *   scales module classes, inherited by the toggles. Orientation is Base
 *   UI's own prop (data-orientation), not an axis.
 * - Compound variants: none.
 * - Defaults: variant outline; color axes none [D133].
 * - Color fallback: inherits the scope.
 * - States: data-orientation → which edge carries the dividers;
 *   data-multiple → the toggles show ✓ rather than ● (passed through
 *   context); data-disabled → the dotted divider pair. A divider next to
 *   the pressed cell is hidden.
 * - Parts: base (the group container), divider, groupLabel.
 * - Scope: none.
 * - Container: `base` is the inline-size container `toggle-group` for the
 *   outline and chip layouts (chips flex-wrap and never scroll). The
 *   segmented container hugs its labels from 768 px, which an inline-size
 *   container cannot do, so it is not one: it reads its nearest ancestor
 *   container, with an --md-n-above viewport fallback; 2–3 equal cells at
 *   baseline (§5.10.2) [D163].
 */
export const toggleGroup = cva(styles.base, {
  variants: {
    variant: {
      outline: styles.outline,
      segmented: styles.segmented,
      chip: styles.chip,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    variant: 'outline',
  },
})

type ToggleGroupVariants = VariantProps<typeof toggleGroup>

const itemVariants: Record<NonNullable<ToggleGroupVariants['variant']>, ToggleVariant> = {
  outline: 'outline',
  segmented: 'segment',
  chip: 'chip',
}

/**
 * Props for ToggleGroup: Base UI ToggleGroup props plus the variant, color
 * axes and an optional visible group label.
 */
export type ToggleGroupProps<Value extends string = string> = BaseToggleGroup.Props<Value> & {
  /**
   * `outline` (default): separate text toggles. `segmented`: joined cells
   * in one `--border-size-2` container, for 2–4 options (4+ belong in a
   * Select). `chip`: filter chips that wrap and never scroll.
   */
  variant?: ToggleGroupVariants['variant']
  /** Primary Radix scale for the group and its toggles. Never defaulted [D133]. */
  primary?: ToggleGroupVariants['primary']
  /** Secondary Radix scale: the selected chips' --role-select. Never defaulted. */
  secondary?: ToggleGroupVariants['secondary']
  /**
   * A visible group label (`type-field-label`, title case), rendered
   * before the group and wired with `aria-labelledby`. It may echo the
   * value ("Size: M"). Omit it and pass `aria-label` or `aria-labelledby`
   * instead where the label lives elsewhere.
   */
  label?: React.ReactNode
}

/**
 * A Base UI Toggle Group of Toggles, single (default) or `multiple`. The
 * group passes `segment` or `chip` to its Toggles and tells them whether
 * the pressed mark is ● (single) or ✓ (multiple). Use it for immediate,
 * reversible view changes and filters, never to switch panels (Tabs).
 * The outline and chip roots are inline-size containers, so give them a
 * width in shrink-to-fit layouts; the segmented root sizes to its cells.
 */
export function ToggleGroup<Value extends string>(props: ToggleGroupProps<Value>) {
  const {
    variant,
    primary,
    secondary,
    label,
    className,
    children,
    multiple = false,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const labelId = React.useId()

  const resolvedVariant = variant ?? 'outline'
  const item = React.useMemo(
    () => ({ variant: itemVariants[resolvedVariant], multiple }),
    [resolvedVariant, multiple]
  )

  const variants = { variant: resolvedVariant, primary, secondary }
  const resolvedClassName = resolveClassName(className, (extra) =>
    toggleGroup({ ...variants, className: extra })
  )

  // Segmented cells are divided by --border-size-1 rules between them.
  const items =
    resolvedVariant === 'segmented'
      ? React.Children.toArray(children).flatMap((child, index) =>
          index === 0
            ? [child]
            : [
                <span key={`divider-${index}`} className={styles.divider} aria-hidden="true" />,
                child,
              ]
        )
      : children

  return (
    <ToggleItemContext.Provider value={item}>
      {label == null ? null : (
        <span id={labelId} className={styles.groupLabel}>
          {label}
        </span>
      )}
      <BaseToggleGroup<Value>
        aria-labelledby={label == null ? undefined : labelId}
        {...rest}
        {...scope}
        multiple={multiple}
        className={resolvedClassName}
      >
        {items}
      </BaseToggleGroup>
    </ToggleItemContext.Provider>
  )
}
