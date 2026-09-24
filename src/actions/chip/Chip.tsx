'use client'

import * as React from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import { cva, type VariantProps } from 'class-variance-authority'

import { Icon, iconHost } from '../../foundations/icon'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './chip.module.css'

/*
 * Chip (§10.11): the removable chip, a chosen value with its × in its own
 * hit area. Shared by the Combobox's multiple selection and by filter UIs
 * that list the active filters; the filter chip that toggles is §9.4's
 * Toggle `chip` variant, not this component.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: chip.module.css; CVA function `chip`.
 * - Axes: `primary`, `secondary` → scales module classes (`secondary`
 *   unused: the chip draws every part from the primary).
 * - Compound variants: none. Defaults: none; color axes: none [D133].
 * - Color fallback: inherits the scope (inside a Combobox, the Combobox's
 *   scales).
 * - States: `remove` (a Base UI Button) `:hover` (not disabled) → the ×
 *   takes the next tier's weight (§10.1 icon states, through `iconHost`);
 *   `:active` → the inverse pair on the × cell; `:focus-visible` → its own
 *   ring; `data-disabled` → `--role-muted` label and ×, and the
 *   `line-dotted-fine` chip edge drawn by `edge` / `edgeLine` [D16].
 * - Parts: base (with `removable` while it carries its ×), label, remove;
 *   `edge` / `edgeLine` draw the dotted disabled edge as true dots
 *   [D36, D68].
 * - Scope: none. Container: none; inherits its context. A set wraps; it
 *   scrolls sideways only inside a `rail` Scroll Area (§10.19).
 */
export const chip = cva(styles.base, {
  variants: {
    // Computed from `onRemove`, never a prop: the × cell closes the end.
    removable: {
      true: styles.removable,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

type ChipVariants = Omit<VariantProps<typeof chip>, 'removable'>

/**
 * The module's part classes, for a composed component that renders the
 * chip on its own Base UI parts (the Combobox's `Chip` and `ChipRemove`)
 * and leaves the look to this module (§1.11.1).
 */
export const chipParts = {
  base: styles.base,
  label: styles.label,
  remove: styles.remove,
  edge: styles.edge,
  edgeLine: styles.edgeLine,
} as const

/** Props for Chip: `span` props, `render`, the remove handler and label, and the color axes. */
export type ChipProps = Omit<useRender.ComponentProps<'span'>, 'children'> & {
  /** The chosen value, e.g. "Oak Savanna". Never truncated in print. */
  children: React.ReactNode
  /**
   * Called when the × is pressed. Omitted, the chip renders without its ×
   * (a read-only value).
   */
  onRemove?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /**
   * The ×'s accessible name. Default "Remove [label]" when `children` is a
   * string, otherwise "Remove".
   */
  removeLabel?: string
  /**
   * Replaces the × element, e.g. `<Combobox.ChipRemove />`, which then
   * receives the module's class, the glyph and the accessible name.
   */
  removeRender?: React.ReactElement
  /** The value can't be removed: muted label and ×, dotted edge. Default `false`. */
  disabled?: boolean
  /**
   * Primary Radix scale: edge, label, × and focus rings. Never defaulted;
   * omitted, it inherits the scope [D133].
   */
  primary?: ChipVariants['primary']
  /** Secondary Radix scale: accepted for the shared contract; unused. Never defaulted. */
  secondary?: ChipVariants['secondary']
}

/**
 * A removable chip: `--size-px-7` tall, a `--border-size-1-5` `--role-rule`
 * edge, the label in `type-body-ui` and the × (`close`, inline tier) in a
 * `--fgd-size-hit` target with its own focus ring. It prints as the word.
 */
export function Chip(props: ChipProps) {
  const {
    render,
    ref,
    className,
    children,
    onRemove,
    removeLabel,
    removeRender,
    disabled,
    primary,
    secondary,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const accessibleName =
    removeLabel ?? (typeof children === 'string' ? `Remove ${children}` : 'Remove')

  const remove = useRender({
    enabled: onRemove != null,
    render: removeRender ?? <BaseButton />,
    props: {
      className: `${styles.remove} ${iconHost}`,
      'aria-label': accessibleName,
      disabled,
      onClick: onRemove,
      children: <Icon name="close" weight="interactive" />,
    },
  })

  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: mergeProps<'span'>(
      {
        ...scope,
        className: chip({ removable: onRemove != null, primary, secondary, className }),
        'data-disabled': disabled ? '' : undefined,
        children: (
          <>
            <span className={styles.label}>{children}</span>
            {remove}
            <svg className={styles.edge} aria-hidden="true" focusable="false">
              <rect className={styles.edgeLine} width="100%" height="100%" />
            </svg>
          </>
        ),
      } as React.ComponentProps<'span'>,
      rest,
    ),
  })
}
