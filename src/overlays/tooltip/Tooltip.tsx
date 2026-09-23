'use client'

import * as React from 'react'
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { cva, type VariantProps } from 'class-variance-authority'

import { Icon } from '../../foundations/icon'
import { resolveClassName } from '../../utils/className'
import {
  OVERLAY_COLLISION_PADDING,
  OVERLAY_SIDE_OFFSET,
  OverlayScope,
  overlayAttributes,
  overlayScales,
} from '../../utils/overlay'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { TOOLTIP_DELAY_MS } from '../../utils/tokens'
import styles from './tooltip.module.css'

/*
 * Tooltip (§10.16): names an icon-only control, or gives a brief,
 * non-essential hint. Never links, actions or required information.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: tooltip.module.css; CVA functions `tooltip` (the popup) and
 *   `tooltipTrigger` (the trigger's `hint` and `term` classes).
 * - Axes: popup `primary`, `secondary` → scales module classes, applied
 *   inside the popup's scope (`secondary` unused); trigger `kind` → label |
 *   hint | term (which form the trigger takes).
 * - Compound variants: none.
 * - Defaults: trigger kind label; color axes: none.
 * - Color fallback: the popup takes the overlay scope preset's defaults.
 * - States: popup `data-open` / `data-closed` → appears instantly, never by
 *   fade [D91]; `data-side`, `data-align` → placement; `data-instant` → no
 *   delay between neighbors in one Provider. Trigger `:focus-visible` → ring.
 * - Parts: base (the popup), text, positioner (its layer), hint, hintLabel,
 *   term. No arrow by default.
 * - Scope: `base` renders in its Base UI Portal and declares the overlay
 *   scope (`white`, `page` scheme), which follows the root mode; it writes
 *   no `data-theme`, and its edge is the [D92] overlay frame, never
 *   --role-rule [D139, D156].
 * - Container: none; inherits its context.
 */
export const tooltip = cva(styles.base, {
  variants: {
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

export const tooltipTrigger = cva('', {
  variants: {
    kind: {
      label: '',
      hint: styles.hint,
      term: styles.term,
    },
  },
  defaultVariants: {
    kind: 'label',
  },
})

type TooltipVariants = VariantProps<typeof tooltip>
export type TooltipTriggerKind = NonNullable<VariantProps<typeof tooltipTrigger>['kind']>

/** The open delay, mirroring `--ds-delay-tooltip` (500 ms, §1.5.15) [D175]. */
export { TOOLTIP_DELAY_MS }

/** The open delay a TooltipProvider sets for the triggers inside it. */
const TooltipDelayContext = React.createContext<number | undefined>(undefined)

/** Props for TooltipProvider: Base UI Tooltip Provider props. */
export type TooltipProviderProps = BaseTooltip.Provider.Props

/**
 * Shares the open delay across a group of triggers, such as a toolbar: the
 * first tooltip opens after `--ds-delay-tooltip` (500 ms), its neighbors
 * open at once while one is showing.
 */
export function TooltipProvider({ delay = TOOLTIP_DELAY_MS, ...rest }: TooltipProviderProps) {
  return (
    <TooltipDelayContext.Provider value={delay}>
      <BaseTooltip.Provider delay={delay} {...rest} />
    </TooltipDelayContext.Provider>
  )
}

/** Props for Tooltip: Base UI Tooltip Root props. */
export type TooltipProps<Payload = unknown> = BaseTooltip.Root.Props<Payload>

/**
 * One tooltip: a `TooltipTrigger` and a `TooltipPopup`. It opens on hover
 * after 500 ms and on keyboard focus, appears instantly, stays open while the
 * pointer moves onto it, and Esc dismisses it without moving focus. Touch
 * screens never show it, so the trigger must make sense without it. It never
 * prints: definitions behind terms must also exist as footnotes.
 */
export function Tooltip<Payload = unknown>(props: TooltipProps<Payload>) {
  return <BaseTooltip.Root<Payload> {...props} />
}

/** Props for TooltipTrigger: Base UI Tooltip Trigger props plus the trigger form. */
export type TooltipTriggerProps<Payload = unknown> = BaseTooltip.Trigger.Props<Payload> & {
  /**
   * `label` (default): the trigger is your control, passed through `render`
   * (an icon-only Button); the popup text equals its accessible name.
   * `hint`: a Material `help` glyph at the inline tier beside a label; the
   * children become its visually hidden accessible name. `term`: the
   * children, underlined in `line-dotted-fine` at a 2 px offset.
   */
  kind?: TooltipTriggerKind
}

/**
 * The element the tooltip names. With `kind="label"`, pass the control as
 * `render`, e.g. `render={<Button iconOnly icon="search">Search</Button>}`.
 * The hint glyph and the term underline follow the trigger's own ground.
 */
export function TooltipTrigger<Payload = unknown>(props: TooltipTriggerProps<Payload>) {
  const { kind = 'label', delay, className, children, ...rest } = props
  const providerDelay = React.useContext(TooltipDelayContext)
  const resolvedClassName =
    typeof className === 'function'
      ? (state: BaseTooltip.Trigger.State) =>
          tooltipTrigger({ kind, className: className(state) }) || undefined
      : tooltipTrigger({ kind, className }) || undefined

  return (
    <BaseTooltip.Trigger<Payload>
      {...rest}
      delay={delay ?? providerDelay ?? TOOLTIP_DELAY_MS}
      className={resolvedClassName}
    >
      {kind === 'hint' ? (
        <>
          <Icon name="help" className={styles.hintIcon} />
          <span className={styles.hintLabel}>{children}</span>
        </>
      ) : (
        children
      )}
    </BaseTooltip.Trigger>
  )
}

/** Props for TooltipPopup: Base UI Tooltip Popup props plus placement and the color axes. */
export type TooltipPopupProps = BaseTooltip.Popup.Props &
  Pick<BaseTooltip.Positioner.Props, 'side' | 'align'> & {
    /**
     * Primary Radix scale inside the popup's scope: face, edge and text.
     * Omitted, the overlay scope's default applies; the popup never inherits
     * the trigger's scales.
     */
    primary?: TooltipVariants['primary']
    /** Secondary Radix scale inside the popup's scope; no part uses it. */
    secondary?: TooltipVariants['secondary']
    /** Props for the Base UI Portal, such as `container`. */
    portalProps?: Omit<BaseTooltip.Portal.Props, 'children'>
  }

/**
 * The popup: one short line of `type-caption` (three at most), at most
 * `--ds-size-tooltip` (280 px) wide, on the overlay scope's `--primary1` face inside a
 * `--border-size-2` `--primary12` frame with `--radius-1`. It sits
 * `--size-px-2` from the trigger (`side`, default `top`) and flips or shifts
 * to stay inside the viewport.
 */
export function TooltipPopup(props: TooltipPopupProps) {
  const {
    side = 'top',
    align = 'center',
    primary,
    secondary,
    portalProps,
    className,
    children,
    ...rest
  } = props

  const variants = overlayScales(primary, secondary)
  const resolvedClassName = resolveClassName(className, (extra) =>
    tooltip({ ...variants, className: extra })
  )

  return (
    <BaseTooltip.Portal {...portalProps}>
      <BaseTooltip.Positioner
        className={styles.positioner}
        side={side}
        align={align}
        sideOffset={OVERLAY_SIDE_OFFSET}
        collisionPadding={OVERLAY_COLLISION_PADDING}
      >
        <OverlayScope>
          <BaseTooltip.Popup {...rest} {...overlayAttributes} className={resolvedClassName}>
            <span className={styles.text}>{children}</span>
          </BaseTooltip.Popup>
        </OverlayScope>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  )
}
