'use client'

import * as React from 'react'
import { Menu as BaseMenu } from '@base-ui/react/menu'
import { Menubar as BaseMenubar } from '@base-ui/react/menubar'
import { cva, type VariantProps } from 'class-variance-authority'

import { MenuGroup, MenuGroupLabel, MenuPopup, type MenuPopupProps } from '../menu'
import { resolveClassName } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import { useMediaQuery } from '../../utils/useMediaQuery'
import styles from './menubar.module.css'

/*
 * Menubar (§9.7): an application row of menus, only on application screens
 * with three or more command groups. No case shows one; derived from P4,
 * P5 and §9.11.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: menubar.module.css; CVA function `menubar`. Its menus' popups
 *   are Menu popups (menu.module.css).
 * - Axes: `primary`, `secondary` → scales module classes, on the bar.
 *   Orientation is Base UI's own prop (data-orientation).
 * - Compound variants: none. Defaults: color axes: none.
 * - Color fallback: inherits the scope; the popups take the `white`
 *   preset's defaults like every Menu popup.
 * - States: data-orientation → the bar's direction and rule edge;
 *   trigger data-popup-open → the --ds-stroke-3 bar in --primary12;
 *   trigger :hover (not disabled) → the §9.2 `text` Button hover: label
 *   --role-link-hover, underlined only where that is --primary12 [D181];
 *   :focus-visible → the ring; data-disabled → --role-muted.
 * - Parts: base (the bar and its rule), trigger.
 * - Scope: none on the bar (it writes its host's scope attributes); the
 *   popups are portaled `white` scopes.
 * - Container: none; below --lg-n-above (the viewport tier of the page
 *   frame) the bar collapses into one "Menu" trigger whose popup lists the
 *   former menus as labelled groups.
 */
export const menubar = cva(styles.base, {
  variants: {
    // Color axes: never defaulted [D133]; omitted, the bar inherits the scope.
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

type MenubarVariants = VariantProps<typeof menubar>

/** The page frame's --lg-n-above tier, restated for matchMedia. */
const WIDE_QUERY = '(min-width: 1024px)'

/** Inside the collapsed "Menu", each MenubarMenu renders as a labelled group. */
const CollapsedContext = React.createContext(false)

/** Props for Menubar: Base UI Menubar props plus the color axes and the collapsed label. */
export type MenubarProps = BaseMenubar.Props & {
  /** Primary Radix scale for the bar: triggers, rule, open bar and ring. Never defaulted [D133]. */
  primary?: MenubarVariants['primary']
  /** Secondary Radix scale for the bar. Never defaulted. */
  secondary?: MenubarVariants['secondary']
  /**
   * The single trigger's label below --lg-n-above, where the menus collapse
   * into one menu of labelled groups. Title case. Default "Menu".
   */
  collapsedLabel?: string
  /** Props for the collapsed menu's popup. */
  collapsedPopupProps?: MenuPopupProps
}

/**
 * The bar (Base UI Menubar): --ds-size-hit tall with a --border-size-1
 * --role-rule under it, holding `MenubarMenu`s. Below --lg-n-above it
 * collapses into one `collapsedLabel` trigger whose popup lists each menu
 * as a labelled group.
 */
export function Menubar(props: MenubarProps) {
  const {
    primary,
    secondary,
    collapsedLabel = 'Menu',
    collapsedPopupProps,
    className,
    children,
    ...rest
  } = props

  const scope = useScopeAttributes()
  // True from --lg-n-above; false on the server and below it (mobile first).
  const wide = useMediaQuery(WIDE_QUERY)

  return (
    <BaseMenubar
      {...rest}
      {...scope}
      className={resolveClassName(className, (extra) =>
        menubar({ primary, secondary, className: extra })
      )}
    >
      {wide ? (
        children
      ) : (
        <BaseMenu.Root>
          <BaseMenu.Trigger className={styles.trigger}>{collapsedLabel}</BaseMenu.Trigger>
          <MenuPopup {...collapsedPopupProps}>
            <CollapsedContext.Provider value={true}>{children}</CollapsedContext.Provider>
          </MenuPopup>
        </BaseMenu.Root>
      )}
    </BaseMenubar>
  )
}

/** Props for MenubarMenu: Base UI Menu.Root props plus the trigger label and the popup's props. */
export type MenubarMenuProps = Omit<BaseMenu.Root.Props, 'children'> & {
  /**
   * The trigger's label, authored in title case with no tracking ("File",
   * "Edit", "View Options") [D160, D165]; the group label when collapsed.
   */
  label: string
  /** Disables the trigger. */
  disabled?: boolean
  /** Props for the menu's popup (placement, color axes). */
  popupProps?: MenuPopupProps
  /** The menu's items: MenuItem, MenuCheckboxItem, MenuRadioGroup, MenuSubmenu … */
  children?: React.ReactNode
}

/**
 * One menu of the bar: a `type-button-sm` trigger and a Menu popup of its
 * items. Inside the collapsed "Menu" it renders as a MenuGroup under a
 * MenuGroupLabel of the same label.
 */
export function MenubarMenu(props: MenubarMenuProps) {
  const { label, disabled, popupProps, children, ...rest } = props
  const collapsed = React.useContext(CollapsedContext)

  if (collapsed) {
    return (
      <MenuGroup>
        <MenuGroupLabel>{label}</MenuGroupLabel>
        {children}
      </MenuGroup>
    )
  }

  return (
    <BaseMenu.Root {...rest}>
      <BaseMenu.Trigger className={styles.trigger} disabled={disabled}>
        {label}
      </BaseMenu.Trigger>
      <MenuPopup {...popupProps}>{children}</MenuPopup>
    </BaseMenu.Root>
  )
}
