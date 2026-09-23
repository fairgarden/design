'use client'

import * as React from 'react'
import { Menu as BaseMenu } from '@base-ui/react/menu'
import { cva, type VariantProps } from 'class-variance-authority'

import { cx, resolveClassName } from '../../utils/className'
import {
  OVERLAY_COLLISION_PADDING,
  OverlayScope,
  overlayActionClassName,
  overlayAttributes,
  overlayScales,
} from '../../utils/overlay'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import styles from './menu.module.css'

/*
 * Internal: the menu popup build shared by Menu, Context Menu and Menubar
 * (§9.7). Not exported from the Menu index; Menu.tsx re-exports `menu` and
 * wraps `MenuPopupFrame` as MenuPopup.
 */

/** Menu classes (§9.7): the popup. Shared by Context Menu and Menubar. */
export const menu = cva(styles.base, {
  variants: {
    // Color axes: never defaulted [D133]; the popup computes the overlay preset's defaults.
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

export type MenuVariants = VariantProps<typeof menu>

type PositionerProps = BaseMenu.Positioner.Props

/** Props for a menu popup: Base UI Menu.Popup props plus placement, color axes and portal options. */
export type MenuPopupProps = BaseMenu.Popup.Props & {
  /**
   * Primary Radix scale inside the popup's `white` scope. Omitted, the
   * white preset's default: the popup never takes the trigger's scales [D133].
   */
  primary?: MenuVariants['primary']
  /** Secondary Radix scale inside the popup. It drives nothing but a destructive item's fallback. */
  secondary?: MenuVariants['secondary']
  /** Side of the trigger. Default `bottom` for a menu, the end side for a submenu. */
  side?: PositionerProps['side']
  /** Alignment to the trigger. Default `start`. */
  align?: PositionerProps['align']
  /** Distance from the trigger in px. Default 8 (`--size-px-2`). */
  sideOffset?: PositionerProps['sideOffset']
  /** Offset along the alignment axis in px. */
  alignOffset?: PositionerProps['alignOffset']
  /** Clearance from the viewport edge in px before the popup shifts or flips. Default 16. */
  collisionPadding?: PositionerProps['collisionPadding']
  /** The element the portal renders into. Default: `document.body`. */
  container?: BaseMenu.Portal.Props['container']
  /** Keeps the portal mounted while closed. */
  keepMounted?: boolean
}

/**
 * The portal, positioner and popup. `placement` supplies defaults for the
 * positioner; any prop left undefined falls through to Base UI's own
 * defaults (the end side for submenus, the pointer for context menus).
 */
export function MenuPopupFrame(
  props: MenuPopupProps & { placement?: Pick<MenuPopupProps, 'align' | 'sideOffset'> }
) {
  const {
    primary,
    secondary,
    side,
    align,
    sideOffset,
    alignOffset,
    collisionPadding = OVERLAY_COLLISION_PADDING,
    container,
    keepMounted,
    placement,
    className,
    children,
    ...rest
  } = props

  const scales = overlayScales(primary, secondary)

  return (
    <BaseMenu.Portal container={container} keepMounted={keepMounted}>
      <BaseMenu.Positioner
        className={styles.positioner}
        side={side}
        align={align ?? placement?.align}
        sideOffset={sideOffset ?? placement?.sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
      >
        <BaseMenu.Popup
          {...rest}
          {...overlayAttributes}
          className={resolveClassName(className, (extra) =>
            menu({
              primary: scales.primary,
              secondary: scales.secondary,
              className: cx(overlayActionClassName, extra),
            })
          )}
        >
          <OverlayScope>{children}</OverlayScope>
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  )
}
