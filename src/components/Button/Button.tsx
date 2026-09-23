'use client'

import * as React from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { Icon, iconHost, type IconName } from '../Icon'
import { assignRef } from '../../utils/assignRef'
import { cx, resolveClassName } from '../../utils/className'
import {
  primaryScaleVariants,
  secondaryScaleVariants,
} from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'

import styles from './button.module.css'

/**
 * Button classes (§9.2, §1.11.10). `primary` and `secondary` are never
 * defaulted [D133]: the `solid` class falls back to the scope's action scale
 * for `secondary`, and an explicit `secondary` wins from the scales layer.
 * `destructive` swaps in the danger roles per variant (compounds) [D192].
 */
export const button = cva(styles.base, {
  variants: {
    variant: {
      solid: styles.solid,
      outline: styles.outline,
      text: styles.text,
    },
    size: {
      sm: styles.sm,
      md: styles.md,
      lg: styles.lg,
      xl: styles.xl,
    },
    iconOnly: {
      true: styles.iconOnly,
    },
    onMedia: {
      true: styles.onMedia,
    },
    butted: {
      start: styles.buttedStart,
      end: styles.buttedEnd,
    },
    destructive: {
      true: styles.destructive,
    },
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  compoundVariants: [
    { iconOnly: true, onMedia: true, class: styles.iconOnlyOnMedia },
    { iconOnly: true, butted: 'start', class: styles.iconOnlyButtedStart },
    { iconOnly: true, butted: 'end', class: styles.iconOnlyButtedEnd },
    { variant: 'solid', destructive: true, class: styles.solidDestructive },
    { variant: 'outline', destructive: true, class: styles.outlineDestructive },
    { variant: 'text', destructive: true, class: styles.textDestructive },
  ],
  defaultVariants: {
    variant: 'outline',
    size: 'md',
    iconOnly: false,
    onMedia: false,
    destructive: false,
  },
})

type ButtonVariants = VariantProps<typeof button>

/** Handler type of the deprecated `onPress` alias, kept for existing callers. */
export type PressCallback = (event: React.MouseEvent<HTMLButtonElement>) => void

type ClickEvent = Parameters<NonNullable<BaseButton.Props['onClick']>>[0]

type ButtonCommonProps = Omit<BaseButton.Props, 'children'> & {
    /**
     * `outline` (default) is the outline twin; `solid` is the page's primary
     * action, filled with the scope's action scale; `text` is a text button
     * whose glyph trails (§9.2).
     */
    variant?: ButtonVariants['variant']
    /**
     * Butts the button against an adjacent field on its `start` or `end`
     * edge, as in the butted submit. Default: none.
     */
    butted?: ButtonVariants['butted']
    /**
     * Marks a destructive action (delete, remove, discard, clear): the
     * danger (red) roles replace the action and primary inks in every
     * variant [D192]. `solid` takes the danger fill, label and edge;
     * `outline` the danger edge and label; `text` the danger label and
     * glyph. Focus and pressed are unchanged. Default `false`.
     */
    destructive?: ButtonVariants['destructive']
    /**
     * Primary Radix scale, from the primary roster: the outline edge, labels
     * and focus ring. Never defaulted; omitted, it inherits the scope [D133].
     */
    primary?: ButtonVariants['primary']
    /**
     * Secondary Radix scale: the `solid` fill and the `text` glyph. Omitted,
     * `solid` falls back to the scope's action scale.
     */
    secondary?: ButtonVariants['secondary']
    /** Which side of the label the glyph sits on (a `text` Button's chevron trails). */
    iconPosition?: 'start' | 'end'
    /**
     * Called on click, after `onClick`.
     * @deprecated Use `onClick`. Kept as an alias from the react-aria Button.
     */
    onPress?: PressCallback
  }

type LabelledButtonProps = {
  /** `true` hides the label and shows only `icon`. Default `false`. */
  iconOnly?: false | null
  /** Only with `iconOnly`. */
  onMedia?: false | null
  /**
   * Fixed height: `sm` 32 px (hit area extended to 44), `md` 40 px (default),
   * `lg` 48 px, `xl` 56 px for the page's single transactional action.
   */
  size?: ButtonVariants['size']
  /** One optional functional glyph (§6.10), inline tier, FILL 0. */
  icon?: IconName
  /** The label: verb plus object, authored in title case [D160]. */
  children?: React.ReactNode
}

type IconOnlyButtonProps = {
  /**
   * Shows only `icon`; `children` becomes the visually hidden accessible
   * name. Pair the button with a Tooltip. Default `false`.
   */
  iconOnly: true
  /** Media button: place it inside a `night` Ground [D148]. */
  onMedia?: boolean | null
  /** `sm`, `md` (default) or `lg`: `xl` is excluded for icon-only buttons. */
  size?: Exclude<ButtonVariants['size'], 'xl'>
  /** The glyph (§6.10). */
  icon: IconName
  /** The accessible name, visually hidden. Pair the button with a Tooltip. */
  children: React.ReactNode
}

/**
 * Props for Button: Base UI Button props plus the variant and color axes.
 * With `iconOnly`, `icon` and an accessible-name `children` are required.
 */
export type ButtonProps = ButtonCommonProps &
  (LabelledButtonProps | IconOnlyButtonProps)

/**
 * A Base UI Button. A navigating action renders an anchor through `render`
 * (with `nativeButton={false}`), keeping link semantics. States come from
 * Base UI and ARIA attributes only: pass `disabled` (with
 * `focusableWhenDisabled` where the reason matters) or `aria-busy` together
 * with an authored "-ing…" label; a busy button holds its rest width and
 * ignores clicks.
 */
export function Button(props: ButtonProps) {
  const {
    variant,
    size,
    iconOnly,
    onMedia,
    butted,
    destructive,
    primary,
    secondary,
    icon,
    iconPosition = 'start',
    onPress,
    onClick,
    className,
    children,
    disabled,
    ref,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const busy = rest['aria-busy'] === true || rest['aria-busy'] === 'true'
  // A navigating Button keeps link semantics: drop Base UI's role="button".
  const linkSemantics =
    React.isValidElement<{ href?: unknown }>(rest.render) &&
    rest.render.props.href != null &&
    !('role' in rest)
      ? { role: undefined }
      : null

  const element = React.useRef<HTMLElement | null>(null)
  const restWidth = React.useRef<number | null>(null)

  const setRef = React.useCallback(
    (node: HTMLElement | null) => {
      element.current = node
      assignRef(ref, node as HTMLButtonElement | null)
    },
    [ref],
  )

  // Remember the rest width, then hold it while busy [D84].
  React.useLayoutEffect(() => {
    if (!busy && element.current) {
      restWidth.current = element.current.getBoundingClientRect().width
    }
  }, [busy, children])

  React.useLayoutEffect(() => {
    const node = element.current
    if (!busy || !node || restWidth.current === null) return undefined
    node.style.setProperty('--button-rest-width', `${restWidth.current}px`)
    return () => {
      node.style.removeProperty('--button-rest-width')
    }
  }, [busy])

  const handleClick = (event: ClickEvent) => {
    if (busy) {
      event.preventDefault()
      event.preventBaseUIHandler()
      return
    }
    restWidth.current = event.currentTarget.getBoundingClientRect().width
    onClick?.(event)
    onPress?.(event)
  }

  const variants = {
    variant,
    size,
    iconOnly,
    onMedia,
    butted,
    destructive,
    primary,
    secondary,
  }
  // The text Button and icon-only buttons swap the glyph to the next tier's
  // weight on hover and press (§10.1 icon states) [D181]; the root hosts it.
  const interactiveGlyph = icon != null && (variant === 'text' || iconOnly === true)
  const host = interactiveGlyph ? iconHost : undefined
  const resolvedClassName = resolveClassName(className, (extra) =>
    button({ ...variants, className: cx(host, extra) })
  )

  // Icon-only lg takes the tag tier (20 px) as its own instance, never a resize.
  const glyph = icon ? (
    <Icon
      name={icon}
      size={iconOnly && size === 'lg' ? 'tag' : 'inline'}
      weight={interactiveGlyph ? 'interactive' : 'rest'}
      className={styles.icon}
    />
  ) : null
  const label =
    children == null ? null : <span className={styles.label}>{children}</span>
  const edge =
    disabled && variant !== 'text' ? (
      <svg className={styles.edge} aria-hidden="true" focusable="false">
        <rect className={styles.edgeLine} width="100%" height="100%" />
      </svg>
    ) : null

  return (
    <BaseButton
      {...rest}
      {...linkSemantics}
      {...scope}
      ref={setRef}
      disabled={disabled}
      className={resolvedClassName}
      onClick={handleClick}
    >
      {iconPosition === 'end' ? label : glyph}
      {iconPosition === 'end' ? glyph : label}
      {edge}
    </BaseButton>
  )
}
