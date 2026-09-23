'use client'

import * as React from 'react'
import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu'

import {
  MenuCheckboxItem,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSubmenu,
  MenuSubmenuTrigger,
} from '../menu'
import { MenuPopupFrame, type MenuPopupProps } from '../menu/popup'
import { useScopeAttributes } from '../../utils/scope'

/*
 * Context Menu (§9.7, Context Menu sub-spec): a shortcut menu on power-user
 * app surfaces (rows, editors, canvases), never on editorial pages. No case
 * shows one; derived from P2, P8 and the Menu spec.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: reuses menu.module.css with the `menu` and `menuItem` functions
 *   (exported from Menu); this component adds no module of its own.
 * - Axes, compound variants, defaults, color fallback, states, parts: as
 *   Menu.
 * - Scope: the popup renders through its Base UI Portal and declares a
 *   `white` scope (`page` scheme, no data-theme) with the --border-size-2
 *   --primary12 edge [D148, D156]. The trigger area has no visual part.
 * - Container: none; inherits its context.
 *
 * Every item must also exist in a visible "…" Menu on the same object: the
 * context menu is a shortcut, never the only route (P2).
 */

/** Props for ContextMenu: Base UI ContextMenu.Root props. */
export type ContextMenuProps = BaseContextMenu.Root.Props

/**
 * Groups the parts of a context menu (Base UI ContextMenu.Root). It opens
 * by right-click, Shift+F10 or the Menu key on the trigger area.
 */
export function ContextMenu(props: ContextMenuProps) {
  return <BaseContextMenu.Root {...props} />
}

/** Props for ContextMenuTrigger: Base UI ContextMenu.Trigger props. */
export type ContextMenuTriggerProps = BaseContextMenu.Trigger.Props

/**
 * The area that opens the menu: a row, an editor or a canvas. It has no
 * visual part of its own; it writes its scope attributes like every root.
 */
export function ContextMenuTrigger(props: ContextMenuTriggerProps) {
  const scope = useScopeAttributes()
  return <BaseContextMenu.Trigger {...scope} {...props} />
}

/** Props for ContextMenuPopup: the Menu popup's props. */
export type ContextMenuPopupProps = MenuPopupProps

/**
 * The popup: the Menu's build (a `white` scope, --border-size-2 --primary12
 * edge, --ds-size-hit rows, the highlight with its start-edge bar),
 * anchored to the pointer, or to the focused object for keyboard
 * invocation. Compose the Menu item parts inside it, re-exported here as
 * ContextMenuItem, ContextMenuCheckboxItem and so on.
 */
export function ContextMenuPopup(props: ContextMenuPopupProps) {
  return <MenuPopupFrame {...props} />
}

/** An action row; see MenuItem. */
export const ContextMenuItem = MenuItem
/** An option that toggles; see MenuCheckboxItem. */
export const ContextMenuCheckboxItem = MenuCheckboxItem
/** One choice among several; see MenuRadioGroup. */
export const ContextMenuRadioGroup = MenuRadioGroup
/** A choice in a radio group; see MenuRadioItem. */
export const ContextMenuRadioItem = MenuRadioItem
/** Groups related items; see MenuGroup. */
export const ContextMenuGroup = MenuGroup
/** A group's label; see MenuGroupLabel. */
export const ContextMenuGroupLabel = MenuGroupLabel
/** A rule between groups; see MenuSeparator. */
export const ContextMenuSeparator = MenuSeparator
/** Groups a submenu's trigger and popup; see MenuSubmenu. */
export const ContextMenuSubmenu = MenuSubmenu
/** The row that opens a submenu; see MenuSubmenuTrigger. */
export const ContextMenuSubmenuTrigger = MenuSubmenuTrigger
