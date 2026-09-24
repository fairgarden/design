'use client'

import * as React from 'react'

import {
  actionScaleVariants,
  primaryScaleVariants,
  secondaryScaleVariants,
  type PrimaryScale,
  type RadixScale,
} from './scales'
import { GroundContext, overlayScope, presetDefaults, toScopeAttributes } from './scope'
import { POPUP_CLEARANCE_PX, POPUP_OFFSET_PX } from './tokens'

/*
 * Internal helpers shared by the portaled overlays (Popover, Preview Card,
 * Dialog, Alert Dialog, Menu, Context Menu, Menubar, Tooltip, Toast, Select,
 * Combobox, Autocomplete, Search). Not exported from any index: each overlay
 * root uses them to declare its own `white` scope.
 *
 * Every overlay renders in its Base UI Portal, outside every band, so the
 * popup root writes the overlay scope itself (`white`, `page` scheme, no
 * data-theme) and takes the white preset's scales unless props override
 * them; it never inherits the trigger's scales, nor the root's action scale
 * (§10.1, §1.11.9) [D139].
 */

/** The attributes every overlay root writes: a `white` scope that follows the page mode [D139]. */
export const overlayAttributes = toScopeAttributes(overlayScope)

const overlayDefaults = presetDefaults[overlayScope.ground]

/**
 * The popup's color axes: the explicit props, else the overlay preset's
 * defaults. Computed, never CVA defaults, so the classes mark a new scope
 * root the way Ground's do [D133].
 */
export function overlayScales(
  primary: PrimaryScale | null | undefined,
  secondary: RadixScale | null | undefined
): { primary: PrimaryScale; secondary: RadixScale } {
  return {
    primary: primary ?? overlayDefaults.primary,
    secondary: secondary ?? overlayDefaults.secondary,
  }
}

/**
 * The overlay scope's action scale class (the white preset's amber), so a
 * solid Button inside a popup takes the overlay's action, not the root's.
 * Add it to the popup root beside its CVA classes.
 */
export const overlayActionClassName =
  actionScaleVariants[overlayDefaults.action === 'ink' ? overlayDefaults.primary : overlayDefaults.action]

/** The overlay preset's default scale classes (primary, secondary, action), for a popup root without color props. */
export const overlayScaleClassName = [
  primaryScaleVariants[overlayDefaults.primary],
  secondaryScaleVariants[overlayDefaults.secondary],
  overlayActionClassName,
].join(' ')

/**
 * Provides the overlay scope to the popup's children. React context reaches
 * through portals, so without it a Button inside a popup opened from a
 * forest field would write forest's scope attributes.
 */
export function OverlayScope({ children }: { children?: React.ReactNode }) {
  return <GroundContext.Provider value={overlayScope}>{children}</GroundContext.Provider>
}

/**
 * The anchored-panel offset from the trigger, `--fgd-popup-offset` (8 px,
 * §9.1, §10.1). Base UI positions in JavaScript, so the token is restated.
 */
export const OVERLAY_SIDE_OFFSET = POPUP_OFFSET_PX

/**
 * Viewport clearance before a panel flips or shifts: `--fgd-popup-clearance`
 * (16 px, the base `--fgd-space-margin`, §10.1).
 */
export const OVERLAY_COLLISION_PADDING = POPUP_CLEARANCE_PX

/**
 * The anchored-panel tail on a 12 × 8 box (--size-px-2-5 wide): 6 px of
 * triangle plus the 2 px band that overlaps the panel's frame, filled with
 * the face so the frame opens under the tail, and the two slanted edges at
 * the frame's --border-size-2. The host module sets fill and stroke.
 */
export function OverlayTail({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 8" aria-hidden="true" focusable="false">
      <path d="M0 8 6 1l6 7z" stroke="none" />
      <path d="M0 7 6 1l6 6" fill="none" />
    </svg>
  )
}
