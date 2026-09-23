'use client'

import * as React from 'react'
import { Toolbar as BaseToolbar } from '@base-ui/react/toolbar'
import { cva, type VariantProps } from 'class-variance-authority'

import { Button, type ButtonProps } from '../Button'
import { Link, type LinkProps } from '../Link'
import { Menu, MenuPopup, MenuTrigger, type MenuPopupProps } from '../Menu'
import { Tooltip, TooltipPopup, TooltipProvider, TooltipTrigger } from '../Tooltip'
import { cx, resolveClassName } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './toolbar.module.css'

/*
 * Toolbar (§9.11): a compact row of tools acting on one object or region.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: toolbar.module.css; CVA functions `toolbar` (the row) and
 *   `toolbarBottomRule` (the optional bottom rule).
 * - Axes: `kind` → list | format | context | figure → list, format,
 *   context, figure; `docked` → `docked`; `primary`, `secondary` → scales
 *   module classes (the toolbar's own parts use only the primary).
 *   Orientation is Base UI's own prop (`data-orientation`).
 *   `toolbarBottomRule`: `variant` → rule | hairline.
 * - Compound variants: none.
 * - Defaults: kind list, docked false; color axes: none.
 * - Color fallback: inherits the band's scope.
 * - States: data-orientation on `base`, `group` and `separator` → the row
 *   direction and the separator's axis; items are Buttons, Links, Toggles
 *   and Menu triggers whose own modules draw hover, press, focus and
 *   disabled (§9.2, §9.4, §9.7) [D181]; disabled items stay focusable
 *   (`focusableWhenDisabled`); a separator beside a data-pressed item hides.
 * - Parts: base (the row), group, separator, count, more, bottomRule; plus
 *   collapsing / label (a ToolbarButton that is icon-only below 768 px, and
 *   its label), lowPriority (an item that moves into "More") and caption
 *   (the printed state line).
 * - Scope: none.
 * - Container: `base` is the inline-size container `toolbar` (named, so a
 *   toolbar inside a card answers to itself). Baseline: icon-only `text`
 *   Buttons with names and Tooltips, low-priority items in "More"; viewport
 *   fallback labels from --md-n-above; container from 768 px labels return
 *   (§5.10.2). A toolbar never scrolls sideways and never wraps.
 */
export const toolbar = cva(styles.base, {
  variants: {
    kind: {
      list: styles.list,
      format: styles.format,
      context: styles.context,
      figure: styles.figure,
    },
    docked: {
      true: styles.docked,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'list',
    docked: false,
  },
})

/** The optional bottom rule (§9.11): `rule` governs a list or table; `hairline` where whitespace also separates. */
export const toolbarBottomRule = cva(styles.bottomRule, {
  variants: {
    variant: {
      rule: styles.rule,
      hairline: styles.hairline,
    },
  },
  defaultVariants: {
    variant: 'rule',
  },
})

export type ToolbarVariants = VariantProps<typeof toolbar>

/** Props for Toolbar: Base UI Toolbar.Root props plus the kind, docked and color axes. */
export type ToolbarProps = BaseToolbar.Root.Props &
  ToolbarVariants & {
    /**
     * `list` (default): a count, then its actions at the end ("Items (54)",
     * "Add", "Sort By"). `format`: groups of icon toggles and buttons divided
     * by vertical rules. `context`: a docked bar, tools at the start, a
     * centered breadcrumb, a toggle at the end. `figure`: controls under a
     * figure (zoom, full screen, download, a step pager).
     */
    kind?: ToolbarVariants['kind']
    /**
     * The docked position: the top edge's one sticky bar, opaque on the
     * band's ground, a --border-size-1 rule on the content side, on
     * --layer-2. Swap it with the header; never stack the two. Default `false`.
     */
    docked?: ToolbarVariants['docked']
    /**
     * Primary Radix scale: separators, rules, the count and the ring.
     * Never defaulted; omitted, it inherits the band's scope [D133].
     */
    primary?: ToolbarVariants['primary']
    /** Secondary Radix scale, accepted for the shared contract; items take their own props. */
    secondary?: ToolbarVariants['secondary']
    /**
     * The state the toolbar carries, printed as one `type-caption` line in
     * its place ("54 items · Sorted by recently accessed"); the toolbar
     * itself never prints.
     */
    caption?: React.ReactNode
  }

/**
 * A Base UI Toolbar: one Tab stop enters it and arrow keys move within it.
 * Compose ToolbarGroup, ToolbarSeparator, ToolbarButton, ToolbarLink,
 * ToolbarCount and ToolbarMore; a Toggle or a Menu trigger joins through
 * Base UI's `render`, e.g. `<ToolbarItem render={<Toggle … />} />`. The row
 * takes the band's ground and has no face of its own. Avoid saturated
 * grounds; on a photo, use media buttons.
 */
export function Toolbar(props: ToolbarProps) {
  const { kind, docked, primary, secondary, caption, className, children, ...rest } = props
  const scope = useScopeAttributes()

  return (
    <>
      <BaseToolbar.Root
        {...rest}
        {...scope}
        className={resolveClassName(className, (extra) =>
          toolbar({ kind, docked, primary, secondary, className: extra })
        )}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </BaseToolbar.Root>
      {caption != null ? (
        <p {...scope} className={styles.caption}>
          {caption}
        </p>
      ) : null}
    </>
  )
}

/** Props for ToolbarGroup: Base UI Toolbar.Group props. */
export type ToolbarGroupProps = BaseToolbar.Group.Props

/** Groups related items, `--size-px-1` apart (Base UI Toolbar.Group). `disabled` disables the whole group. */
export function ToolbarGroup(props: ToolbarGroupProps) {
  const { className, ...rest } = props
  return (
    <BaseToolbar.Group
      {...rest}
      className={resolveClassName(className, (extra) => cx(styles.group, extra))}
    />
  )
}

/** Props for ToolbarSeparator: Base UI Toolbar.Separator props. */
export type ToolbarSeparatorProps = BaseToolbar.Separator.Props

/**
 * A vertical `--border-size-1` rule in `--role-rule`, `--size-px-4` tall
 * with `--size-px-2` each side, announced to assistive technology. It takes
 * the axis opposite the toolbar's and hides beside a pressed segment.
 */
export function ToolbarSeparator(props: ToolbarSeparatorProps) {
  const { className, ...rest } = props
  return (
    <BaseToolbar.Separator
      {...rest}
      className={resolveClassName(className, (extra) => cx(styles.separator, extra))}
    />
  )
}

/** Props for ToolbarItem: Base UI Toolbar.Button props; pass the control as `render`. */
export type ToolbarItemProps = BaseToolbar.Button.Props

/**
 * A roving-focus slot for a control that is not a ToolbarButton: a Toggle
 * (§9.4) or a Menu trigger (§9.7), passed as `render`. Disabled items stay
 * focusable by default.
 */
export function ToolbarItem(props: ToolbarItemProps) {
  return <BaseToolbar.Button {...props} />
}

/** Props for ToolbarButton: Button props plus the overflow priority. */
export type ToolbarButtonProps = ButtonProps & {
  /**
   * Moves the item into ToolbarMore below 768 px of the toolbar's width;
   * list it there too, as a MenuItem. Default `false`.
   */
  lowPriority?: boolean | null
}

/**
 * A Button (§9.2) in the toolbar's roving focus. Defaults: `variant="text"`,
 * `size` `sm` (`md` when `iconOnly`). A `text` Button with an `icon` is
 * icon-only below 768 px of the toolbar's width, its label kept as the
 * accessible name and shown in a Tooltip; from 768 px the label returns.
 * An `iconOnly` Button always carries the Tooltip. Disabled buttons stay
 * focusable so their name can be read.
 */
export function ToolbarButton(props: ToolbarButtonProps) {
  const {
    lowPriority,
    variant,
    size,
    className,
    children,
    disabled,
    focusableWhenDisabled = true,
    ...rest
  } = props

  const resolvedVariant = variant ?? 'text'
  const collapsing = !rest.iconOnly && rest.icon != null && resolvedVariant === 'text'
  const named = Boolean(rest.iconOnly) || collapsing
  const ownClasses = cx(collapsing && styles.collapsing, lowPriority && styles.lowPriority)

  const buttonProps = {
    ...rest,
    variant: resolvedVariant,
    size: size ?? (rest.iconOnly ? 'md' : 'sm'),
    disabled,
    focusableWhenDisabled,
    className: resolveClassName(className, (extra) => cx(ownClasses, extra)),
    children: collapsing ? <span className={styles.label}>{children}</span> : children,
  } as ButtonProps

  const item = (
    <BaseToolbar.Button
      disabled={disabled}
      focusableWhenDisabled={focusableWhenDisabled}
      render={<Button {...buttonProps} />}
    />
  )

  if (!named) return item

  return (
    <Tooltip>
      <TooltipTrigger render={item} />
      <TooltipPopup>{children}</TooltipPopup>
    </Tooltip>
  )
}

/** Props for ToolbarLink: Link props. */
export type ToolbarLinkProps = LinkProps

/**
 * A Link (§9.3) in the toolbar's roving focus (Base UI Toolbar.Link).
 * Default `kind="nav"`: no rest underline, Link's hover and ring.
 */
export function ToolbarLink(props: ToolbarLinkProps) {
  const { kind, ...rest } = props
  return <BaseToolbar.Link render={<Link kind={kind ?? 'nav'} {...rest} />} />
}

/** Props for ToolbarCount: `span` props. */
export type ToolbarCountProps = React.ComponentPropsWithRef<'span'>

/** The list's count in mono `type-data`, `--primary12`, following LTA's parentheses: "Items (54)". */
export function ToolbarCount(props: ToolbarCountProps) {
  const { className, ...rest } = props
  return <span {...rest} className={cx(styles.count, className)} />
}

/** Props for ToolbarMore: the overflow menu's items and popup options. */
export type ToolbarMoreProps = Omit<MenuPopupProps, 'children'> & {
  /** MenuItems mirroring the toolbar's `lowPriority` items, lowest priority last. */
  children?: React.ReactNode
  /** The trigger's accessible name and tooltip. Default "More". */
  label?: string
}

/**
 * The "…" overflow: an icon-only `more_horiz` `text` Button named "More"
 * that opens a Menu. It shows only below 768 px of the toolbar's width,
 * while the `lowPriority` items are hidden, so list those items here.
 */
export function ToolbarMore(props: ToolbarMoreProps) {
  const { label = 'More', align = 'end', children, ...popupProps } = props
  return (
    <Menu>
      <Tooltip>
        <TooltipTrigger
          render={
            <BaseToolbar.Button
              render={
                <MenuTrigger
                  variant="text"
                  size="sm"
                  iconOnly
                  icon="more_horiz"
                  className={styles.more}
                >
                  {label}
                </MenuTrigger>
              }
            />
          }
        />
        <TooltipPopup>{label}</TooltipPopup>
      </Tooltip>
      <MenuPopup {...popupProps} align={align}>
        {children}
      </MenuPopup>
    </Menu>
  )
}

/** Props for ToolbarBottomRule: `span` props plus the rule's role. */
export type ToolbarBottomRuleProps = Omit<React.ComponentPropsWithRef<'span'>, 'children'> &
  VariantProps<typeof toolbarBottomRule> & {
    /** `rule` (default) in `--role-rule`, governing a list or table; `hairline` in `--role-hairline`, where whitespace also separates. */
    variant?: VariantProps<typeof toolbarBottomRule>['variant']
  }

/** The optional `--border-size-1` rule along the toolbar's bottom edge; place it last. Decorative. */
export function ToolbarBottomRule(props: ToolbarBottomRuleProps) {
  const { variant, className, ...rest } = props
  return (
    <span aria-hidden="true" {...rest} className={toolbarBottomRule({ variant, className })} />
  )
}
