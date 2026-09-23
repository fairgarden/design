'use client'

import * as React from 'react'
import { Menu as BaseMenu } from '@base-ui/react/menu'
import { cva, type VariantProps } from 'class-variance-authority'

import { Button, type ButtonProps } from '../../actions/button'
import { Icon, type IconName } from '../../foundations/icon'
import { StatusGlyph, statusScales } from '../../utils/StatusGlyph'
import { cx, resolveClassName } from '../../utils/className'
import { OVERLAY_SIDE_OFFSET } from '../../utils/overlay'
import { secondaryScaleVariants } from '../../utils/scales'
import { MenuPopupFrame, type MenuPopupProps } from './popup'
import styles from './menu.module.css'

export { menu, type MenuPopupProps } from './popup'

/*
 * Menu (§9.7): actions, sort and option menus.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: menu.module.css (shared by Context Menu and Menubar popups);
 *   CVA functions `menu` (the popup) and `menuItem` (an item).
 * - Axes: `primary`, `secondary` → scales module classes, passed to the
 *   popup; `menuItem`: `destructive` → `destructive` (the danger glyph,
 *   the danger label and the danger highlight [D192]), `secondary` → the
 *   item's own scale.
 * - Compound variants: none. Defaults: `menuItem` `destructive: false`;
 *   color axes: none.
 * - Color fallback: the popup takes the `white` preset's defaults; a
 *   destructive item's secondary falls back to the danger scale [D129].
 * - States: item data-highlighted → --primary4 plus the --ds-stroke-3
 *   start-edge bar in --primary12 [D145] (a destructive item: the
 *   --role-danger fill, its label and bar --role-danger-label [D192]);
 *   data-checked on checkbox and
 *   radio items → leading ✓ or ● in --primary12, label --font-weight-6, no
 *   fill and no bar [D145]; data-disabled → --role-muted, no highlight;
 *   submenu trigger data-popup-open → stays highlighted; popup
 *   data-starting-style / data-ending-style with data-side → the clip
 *   reveal from the trigger side, instant under --motionNotOK [D91].
 * - Parts: positioner, base (the popup), item, itemIcon (the leading slot),
 *   itemLabel, checkGlyph, dangerGlyph, shortcut, submenuChevron,
 *   groupLabel, separator.
 * - Scope: the popup renders through its Base UI Portal and declares a
 *   `white` scope (`page` scheme, no data-theme) with the --border-size-2
 *   --primary12 edge [D148, D156]. The trigger is a Button (§9.2).
 * - Container: none; inherits its context.
 */
export const menuItem = cva(styles.item, {
  variants: {
    destructive: {
      true: styles.destructive,
    },
    // Color axis: never defaulted [D133]; MenuItem computes the danger scale for destructive items.
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    destructive: false,
  },
})

type MenuItemVariants = VariantProps<typeof menuItem>

/** Props for Menu: Base UI Menu.Root props (`open`, `onOpenChange`, `modal` …). */
export type MenuProps<Payload = unknown> = BaseMenu.Root.Props<Payload>

/** Groups the parts of a menu (Base UI Menu.Root). */
export function Menu<Payload = unknown>(props: MenuProps<Payload>) {
  return <BaseMenu.Root<Payload> {...props} />
}

/** Props for MenuTrigger: Button props plus Base UI's trigger options. */
export type MenuTriggerProps = ButtonProps & {
  /** Associates a detached trigger with a Menu created by `Menu.createHandle`. */
  handle?: BaseMenu.Trigger.Props['handle']
  /** A payload handed to the Menu's children function when this trigger opens it. */
  payload?: unknown
}

/**
 * Opens the menu. Renders a Button (§9.2): an `outline` or `text` Button
 * with a title-case label ("Sort By", "Export") [D160, D165], or an
 * icon-only `more_horiz` "…". A sort trigger shows its current value.
 */
export function MenuTrigger(props: MenuTriggerProps) {
  const { handle, payload, ...buttonProps } = props
  return (
    <BaseMenu.Trigger
      handle={handle}
      payload={payload}
      render={<Button {...(buttonProps as ButtonProps)} />}
    />
  )
}

/**
 * The popup, rendered through its Base UI Portal as a nested `white`
 * scope: --primary1 face, --border-size-2 --primary12 edge, --ds-radius-8,
 * --size-px-1 padding, 200 px to --size-px-14 wide and at least the
 * trigger's width, --size-px-2 from the trigger, aligned to its start
 * edge. It opens instantly or with a clip reveal from the trigger side.
 * Inside a `MenuSubmenu` it flies out to the end side.
 */
export function MenuPopup(props: MenuPopupProps) {
  return (
    <MenuPopupFrame {...props} placement={{ align: 'start', sideOffset: OVERLAY_SIDE_OFFSET }} />
  )
}

/** Props for MenuItem: Base UI Menu.Item props plus the leading glyph, shortcut and destructive axis. */
export type MenuItemProps = BaseMenu.Item.Props & {
  /** A leading Material Symbols glyph at the inline tier (§6.10). */
  icon?: IconName
  /** A trailing keyboard shortcut, in `type-data` --role-muted, end-aligned. */
  shortcut?: React.ReactNode
  /**
   * A destructive action (delete, remove, clear): the danger glyph (◆ with
   * its inner ×) in the leading slot, the label in --role-danger-text, and
   * a highlight in the danger fill with --role-danger-label [D192]. The
   * label still names the verb and object ("Delete note"), so color is
   * never the only cue. Default `false`.
   */
  destructive?: MenuItemVariants['destructive']
  /** The item's secondary scale. Omitted, a destructive item takes the danger scale [D129]. */
  secondary?: MenuItemVariants['secondary']
}

/**
 * An action row (Base UI Menu.Item): --ds-size-hit tall at every
 * breakpoint, a --size-px-5 leading slot, the label in `type-body-ui`
 * sentence case, and an optional trailing shortcut. Highlight (pointer or
 * keyboard) is the --primary4 fill plus the start-edge bar (the danger fill
 * on a destructive item [D192]); activation closes the menu.
 */
export function MenuItem(props: MenuItemProps) {
  const { icon, shortcut, destructive, secondary, className, children, ...rest } = props
  const leading = destructive ? (
    <StatusGlyph status="danger" className={styles.dangerGlyph} />
  ) : icon ? (
    <Icon name={icon} />
  ) : null

  return (
    <BaseMenu.Item
      {...rest}
      className={resolveClassName(className, (extra) =>
        menuItem({
          destructive,
          secondary: secondary ?? (destructive ? statusScales.danger : undefined),
          className: extra,
        })
      )}
    >
      <span className={styles.itemIcon}>{leading}</span>
      <span className={styles.itemLabel}>{children}</span>
      {shortcut != null ? <kbd className={styles.shortcut}>{shortcut}</kbd> : null}
    </BaseMenu.Item>
  )
}

/** Props for MenuCheckboxItem: Base UI Menu.CheckboxItem props. */
export type MenuCheckboxItemProps = BaseMenu.CheckboxItem.Props

/**
 * An option that toggles (Base UI Menu.CheckboxItem). Checked shows a
 * leading ✓ in --primary12 and sets the label at --font-weight-6, with no
 * fill and no bar [D145]. It stays open on activation.
 */
export function MenuCheckboxItem(props: MenuCheckboxItemProps) {
  const { className, children, ...rest } = props
  return (
    <BaseMenu.CheckboxItem
      {...rest}
      className={resolveClassName(className, (extra) => menuItem({ className: extra }))}
    >
      <span className={styles.itemIcon}>
        <BaseMenu.CheckboxItemIndicator className={styles.checkGlyph}>
          <Icon name="check" />
        </BaseMenu.CheckboxItemIndicator>
      </span>
      <span className={styles.itemLabel}>{children}</span>
    </BaseMenu.CheckboxItem>
  )
}

/** Props for MenuRadioGroup: Base UI Menu.RadioGroup props (`value`, `onValueChange` …). */
export type MenuRadioGroupProps = BaseMenu.RadioGroup.Props

/** Groups radio items into one choice, such as a sort order (Base UI Menu.RadioGroup). */
export function MenuRadioGroup(props: MenuRadioGroupProps) {
  return <BaseMenu.RadioGroup {...props} />
}

/** Props for MenuRadioItem: Base UI Menu.RadioItem props (`value` …). */
export type MenuRadioItemProps = BaseMenu.RadioItem.Props

/**
 * One choice in a MenuRadioGroup (Base UI Menu.RadioItem). Checked shows a
 * leading ● in --primary12 (the FILL 1 `circle`, always with the weight
 * change) and the label at --font-weight-6; no fill and no bar [D145, D166].
 */
export function MenuRadioItem(props: MenuRadioItemProps) {
  const { className, children, ...rest } = props
  return (
    <BaseMenu.RadioItem
      {...rest}
      className={resolveClassName(className, (extra) => menuItem({ className: extra }))}
    >
      <span className={styles.itemIcon}>
        <BaseMenu.RadioItemIndicator className={styles.checkGlyph}>
          <Icon name="circle" />
        </BaseMenu.RadioItemIndicator>
      </span>
      <span className={styles.itemLabel}>{children}</span>
    </BaseMenu.RadioItem>
  )
}

/** Props for MenuGroup: Base UI Menu.Group props. */
export type MenuGroupProps = BaseMenu.Group.Props

/** Groups related items under a MenuGroupLabel (Base UI Menu.Group). */
export function MenuGroup(props: MenuGroupProps) {
  return <BaseMenu.Group {...props} />
}

/** Props for MenuGroupLabel: Base UI Menu.GroupLabel props. */
export type MenuGroupLabelProps = BaseMenu.GroupLabel.Props

/** A group's label, in `type-label` --role-muted; not focusable (Base UI Menu.GroupLabel). */
export function MenuGroupLabel(props: MenuGroupLabelProps) {
  const { className, ...rest } = props
  return (
    <BaseMenu.GroupLabel
      {...rest}
      className={resolveClassName(className, (extra) => cx(styles.groupLabel, extra))}
    />
  )
}

/** Props for MenuSeparator: Base UI Menu.Separator props. */
export type MenuSeparatorProps = BaseMenu.Separator.Props

/** A full-width --border-size-1 --role-rule between groups, --size-px-1 above and below. */
export function MenuSeparator(props: MenuSeparatorProps) {
  const { className, ...rest } = props
  return (
    <BaseMenu.Separator
      {...rest}
      className={resolveClassName(className, (extra) => cx(styles.separator, extra))}
    />
  )
}

/** Props for MenuSubmenu: Base UI Menu.SubmenuRoot props. */
export type MenuSubmenuProps = BaseMenu.SubmenuRoot.Props

/**
 * Groups a submenu's trigger and popup (Base UI Menu.SubmenuRoot). The
 * nested MenuPopup flies out to the end side at --size-px-2 and flips at
 * the viewport edge.
 */
export function MenuSubmenu(props: MenuSubmenuProps) {
  return <BaseMenu.SubmenuRoot {...props} />
}

/** Props for MenuSubmenuTrigger: Base UI Menu.SubmenuTrigger props plus a leading glyph. */
export type MenuSubmenuTriggerProps = BaseMenu.SubmenuTrigger.Props & {
  /** A leading Material Symbols glyph at the inline tier (§6.10). */
  icon?: IconName
}

/**
 * The row that opens a submenu (Base UI Menu.SubmenuTrigger), with a
 * trailing `chevron_right` at the inline tier. It stays highlighted while
 * its submenu is open.
 */
export function MenuSubmenuTrigger(props: MenuSubmenuTriggerProps) {
  const { icon, className, children, ...rest } = props
  return (
    <BaseMenu.SubmenuTrigger
      {...rest}
      className={resolveClassName(className, (extra) => menuItem({ className: extra }))}
    >
      <span className={styles.itemIcon}>{icon ? <Icon name={icon} /> : null}</span>
      <span className={styles.itemLabel}>{children}</span>
      <Icon name="chevron_right" className={styles.submenuChevron} />
    </BaseMenu.SubmenuTrigger>
  )
}
