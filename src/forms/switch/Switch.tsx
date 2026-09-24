'use client'

import * as React from 'react'
import { Switch as BaseSwitch } from '@base-ui/react/switch'
import { cva, type VariantProps } from 'class-variance-authority'

import {
  primaryScaleVariants,
  secondaryScaleVariants,
} from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'

import styles from './switch.module.css'

/*
 * Switch (§10.9).
 *
 * Implementation (CSS Modules + CVA)
 * - Module: switch.module.css; CVA function `switchRoot` (`switch` is a
 *   reserved word).
 * - Axes: `kind` → row | inline (label left, switch right, hairline row
 *   rule; switch then label) [D155]; `primary`, `secondary` → scales
 *   module classes.
 * - Compound variants: none.
 * - Defaults: kind row; color axes none [D133].
 * - Color fallback: inherits the scope; its secondary drives the on state
 *   through the --role-select aliases.
 * - States: data-checked → track fill --role-select, edge --border-size-2-25
 *   --role-select-edge, thumb a --role-select-mark disc at the end;
 *   :hover (not disabled, read-only or busy) [D181] → off track fill
 *   --role-soft-hover (--primary3 where soft fills apply), on track fill
 *   --role-select-hover, edges and thumb unchanged, label the bare-text
 *   underline; :focus-visible on the track → ring; data-disabled →
 *   dotted track, --role-muted ring; data-readonly → rest roles, no hover;
 *   aria-busy (from the consumer, as on Button) → state word "Saving…",
 *   read-only (inert), rest roles.
 * - Parts: base (the row, a <label>), track (Switch.Root), thumb, label,
 *   state, description, and edge / edgeLine (the disabled dotted track).
 * - Scope: none.
 * - Container: none; inherits its context. A settings list's wrapper, not
 *   the Switch, is the `settings-list` container [D163].
 */
export const switchRoot = cva(styles.base, {
  variants: {
    kind: {
      row: styles.row,
      inline: styles.inline,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'row',
  },
})

type SwitchVariants = VariantProps<typeof switchRoot>

/** The state words shown beside the track. */
export interface SwitchStateLabels {
  /** Shown while on. Default "On". */
  on: string
  /** Shown while off. Default "Off". */
  off: string
}

const defaultStateLabels: SwitchStateLabels = { on: 'On', off: 'Off' }

/**
 * Props for Switch: Base UI Switch.Root props (on the track) plus the
 * kind, color axes and the row's content. `className` goes on the row.
 */
export type SwitchProps = Omit<BaseSwitch.Root.Props, 'className' | 'children'> & {
  /**
   * `row` (default): label left, switch right, the row a hit target with a
   * hairline rule. `inline`: switch, state word, then label.
   */
  kind?: SwitchVariants['kind']
  /**
   * Primary Radix scale: the off track and thumb, label and state word.
   * Never defaulted; omitted, it inherits the scope [D133].
   */
  primary?: SwitchVariants['primary']
  /**
   * Secondary Radix scale: the on track's fill and edge and the on thumb,
   * through --role-select. Omitted, it inherits the scope.
   */
  secondary?: SwitchVariants['secondary']
  /** Class for the row (the `base` part). */
  className?: string
  /** The label: name the setting, not the action, in title case [D160]. */
  children?: React.ReactNode
  /** Optional helper text under the label, in sentence case. */
  description?: React.ReactNode
  /** The state words; default "On" / "Off". Set in `type-label` caps. */
  stateLabels?: SwitchStateLabels
  /** The state word while `aria-busy` is set; default "Saving…". */
  busyLabel?: string
}

/**
 * A Base UI Switch for a setting that takes effect the moment it flips.
 * Off → on changes position, thumb shape (ring → disc), edge weight and
 * fill, so state is never fill alone [D15]. While the change is saving,
 * pass `aria-busy`: the state word reads "Saving…" and the switch is
 * inert; on failure revert `checked` and explain in a toast (§10.17).
 */
export function Switch(props: SwitchProps) {
  const {
    kind,
    primary,
    secondary,
    className,
    children,
    description,
    stateLabels = defaultStateLabels,
    busyLabel = 'Saving…',
    checked: checkedProp,
    defaultChecked,
    onCheckedChange,
    readOnly,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const busy = rest['aria-busy'] === true || rest['aria-busy'] === 'true'

  // The state word needs the value, so the switch is always controlled
  // underneath; an uncontrolled caller keeps `defaultChecked` semantics.
  const [uncontrolled, setUncontrolled] = React.useState(defaultChecked ?? false)
  const isControlled = checkedProp !== undefined
  const checked = isControlled ? checkedProp : uncontrolled

  const handleCheckedChange: NonNullable<BaseSwitch.Root.Props['onCheckedChange']> = (
    next,
    details
  ) => {
    onCheckedChange?.(next, details)
    if (!isControlled && !details.isCanceled) setUncontrolled(next)
  }

  const word = busy ? busyLabel : checked ? stateLabels.on : stateLabels.off

  return (
    <label {...scope} className={switchRoot({ kind, primary, secondary, className })}>
      {children == null ? null : <span className={styles.label}>{children}</span>}
      <span className={styles.state} aria-hidden="true">
        {word}
      </span>
      <BaseSwitch.Root
        {...rest}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        readOnly={readOnly || busy}
        className={styles.track}
      >
        <BaseSwitch.Thumb className={styles.thumb} />
        <svg className={styles.edge} aria-hidden="true" focusable="false">
          <rect className={styles.edgeLine} width="100%" height="100%" />
        </svg>
      </BaseSwitch.Root>
      {description == null ? null : (
        <span className={styles.description}>{description}</span>
      )}
    </label>
  )
}
