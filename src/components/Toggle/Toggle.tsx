'use client'

import * as React from 'react'
import { Toggle as BaseToggle } from '@base-ui/react/toggle'
import { cva, type VariantProps } from 'class-variance-authority'

import { Icon, iconHost, type IconName } from '../Icon'
import { cx, resolveClassName } from '../../utils/className'
import {
  primaryScaleVariants,
  secondaryScaleVariants,
} from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'

import styles from './toggle.module.css'

/*
 * Toggle (§9.4). §9.4 owns the filter chip and the segment.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: toggle.module.css; CVA function `toggle`.
 * - Axes: `variant` → outline | segment | chip (the text toggle pill; a
 *   joined cell with no edge of its own; a pill that selects by
 *   --role-select over a quiet rest edge); `size` → sm | md; `iconOnly` →
 *   `iconOnly` (the icon toggle's circle); `primary`, `secondary` → scales
 *   module classes.
 * - Compound variants: none.
 * - Defaults: variant outline, size md (sm for chips, whose height is
 *   --size-px-7), iconOnly false; color axes none [D133]. Inside a
 *   ToggleGroup the group passes `segment` or `chip` through context.
 * - Color fallback: inherits the scope.
 * - States: data-pressed → selected: --ds-stroke-3 inside edge, ✓ / ● or
 *   the icon swap, --font-weight-7, and the inverse pair (outline, segment)
 *   or --role-select (chip); :active → the momentary inverse pair; :hover
 *   (not disabled) [D181] → off outline and segment: a --role-soft-hover
 *   fill (--primary3; the bare-text label underline where soft fills
 *   drop); off chip: edge --role-rule → --primary12 at the same weight
 *   [D140] plus the soft fill; icon toggle: the glyph at the next tier's
 *   weight; on: fill --primary11 (chip: --role-select-hover), label, mark
 *   and edge unchanged; :focus-visible → the ring above neighbours;
 *   data-disabled → dotted edge, fill removed, --role-muted label.
 * - Parts: base, label, icon, glyph (✓, ● or the swapped icon), and edge /
 *   edgeLine (the disabled dotted edge).
 * - Scope: none.
 * - Container: none; inherits its context.
 */
export const toggle = cva(styles.base, {
  variants: {
    variant: {
      outline: styles.outline,
      segment: styles.segment,
      chip: styles.chip,
    },
    size: {
      sm: styles.sm,
      md: styles.md,
    },
    iconOnly: {
      true: styles.iconOnly,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    variant: 'outline',
    size: 'md',
    iconOnly: false,
  },
})

type ToggleVariants = VariantProps<typeof toggle>

/** A Toggle's look (§9.4). */
export type ToggleVariant = NonNullable<ToggleVariants['variant']>

/** What a ToggleGroup tells the toggles inside it. */
export interface ToggleItemContextValue {
  /** The item look the group's variant implies. */
  variant: ToggleVariant
  /** Whether the group allows several pressed items: ✓ rather than ●. */
  multiple: boolean
}

/** Provided by ToggleGroup; a standalone Toggle reads `undefined`. */
export const ToggleItemContext = React.createContext<ToggleItemContextValue | undefined>(
  undefined
)
ToggleItemContext.displayName = 'ToggleItemContext'

type ToggleCommonProps = Omit<BaseToggle.Props<string>, 'children'> & {
  /**
   * `outline` (default): a pill like the outline Button, selected by the
   * inverse pair. `segment`: a joined cell of a segmented group. `chip`: a
   * filter chip, selected by --role-select. Inside a ToggleGroup the group
   * sets it.
   */
  variant?: ToggleVariants['variant']
  /** Primary Radix scale: edges, label, the inverse pair and the ring. Never defaulted [D133]. */
  primary?: ToggleVariants['primary']
  /** Secondary Radix scale: drives only the selected chip (--role-select). Never defaulted. */
  secondary?: ToggleVariants['secondary']
}

type LabelledToggleProps = {
  /** `true` shows only the icon; see the icon toggle. Default `false`. */
  iconOnly?: false | null
  /**
   * Height: `sm` 32 px (chips, toolbars; hit area extended to 44) or `md`
   * 40 px (segments, standalone; default, chips default to `sm`).
   */
  size?: ToggleVariants['size']
  /** One optional leading glyph (§6.10), inline tier, FILL 0. */
  icon?: IconName
  /** Not used on a labelled toggle: it shows ✓ or ● when pressed. */
  pressedIcon?: never
  /** The label, authored in title case ("Grid View") [D160]. */
  children?: React.ReactNode
}

type IconOnlyToggleProps = {
  /** The icon toggle: a circle whose icon swaps when pressed (▷ ↔ ‖). */
  iconOnly: true
  /** `sm` or `md` (default). */
  size?: ToggleVariants['size']
  /** The glyph while not pressed (§6.10). */
  icon: IconName
  /** The glyph while pressed: a different icon, never only its FILL 1 twin [D166]. */
  pressedIcon: IconName
  /** The accessible name, visually hidden. Pair the toggle with a Tooltip. */
  children: React.ReactNode
}

/**
 * Props for Toggle: Base UI Toggle props plus the variant, size and color
 * axes. With `iconOnly`, `icon`, `pressedIcon` and an accessible-name
 * `children` are required.
 */
export type ToggleProps = ToggleCommonProps & (LabelledToggleProps | IconOnlyToggleProps)

function DisabledEdge() {
  return (
    <svg className={styles.edge} aria-hidden="true" focusable="false">
      <rect className={styles.edgeLine} width="100%" height="100%" />
    </svg>
  )
}

/**
 * A Base UI Toggle: an on/off button for immediate, reversible changes to
 * how content is shown (view, units, formatting, filters). Selection is a
 * heavier inside edge, a glyph and a weight change; fill is extra [D15].
 * Values a form submits use Radio or Checkbox Group; panels use Tabs.
 */
export function Toggle(props: ToggleProps) {
  const {
    variant,
    size,
    iconOnly,
    primary,
    secondary,
    icon,
    pressedIcon,
    className,
    children,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const item = React.useContext(ToggleItemContext)
  const resolvedVariant: ToggleVariant = variant ?? item?.variant ?? 'outline'
  const resolvedSize = size ?? (resolvedVariant === 'chip' ? 'sm' : 'md')

  const variants = {
    variant: resolvedVariant,
    size: resolvedSize,
    iconOnly,
    primary,
    secondary,
  }
  // An icon toggle hosts its glyph's hover and press weight (§10.1 icon states) [D181].
  const host = iconOnly ? iconHost : undefined
  const resolvedClassName = resolveClassName(className, (extra) =>
    toggle({ ...variants, className: cx(host, extra) })
  )

  const glyph: IconName =
    iconOnly && pressedIcon ? pressedIcon : item && !item.multiple ? 'circle' : 'check'
  const weight = iconOnly ? 'interactive' : 'rest'

  return (
    <BaseToggle {...rest} {...scope} className={resolvedClassName}>
      <Icon name={glyph} weight={weight} className={styles.glyph} />
      {icon ? <Icon name={icon} weight={weight} className={styles.icon} /> : null}
      {children == null ? null : <span className={styles.label}>{children}</span>}
      {resolvedVariant === 'segment' ? null : <DisabledEdge />}
    </BaseToggle>
  )
}
