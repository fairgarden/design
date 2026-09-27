'use client'

import * as React from 'react'
import { Menu as BaseMenu } from '@base-ui/react/menu'

import type { OutlineMorphRefs } from '../../foundations/outline-morph'
import { useMergedRef } from '../../utils/assignRef'

/*
 * Internal: the outline morph's wiring through a menu's parts [D204]. Not
 * exported from the Menu index. `Menu` provides the refs; the trigger
 * (`MenuMorphTrigger`, behind MenuTrigger, the Menubar's triggers and the
 * Code Block's ⋮) takes the source ref, and the popup build
 * (`MenuPopupFrame`) takes the target ref and renders the frame. A
 * `MenuSubmenu` provides `null`, so a submenu keeps its own reveal.
 */

/** The nearest menu's morph refs, or `null` (no morph: a submenu, a context menu, `morph={false}`). */
export const MenuMorphContext = React.createContext<OutlineMorphRefs | null>(null)

/**
 * Set by the Menubar around its menus: switching between them (hover, the
 * arrow keys, focus) is instant, as Base UI makes it, so only a press opens
 * with the morph and only Escape, a choice or an outside press closes with it.
 */
export const MenubarMorphContext = React.createContext(false)

/** Open changes that switch between a menubar's menus: Base UI's instant `group` reasons. */
export const MENUBAR_SWITCH_REASONS: ReadonlySet<string> = new Set([
  'trigger-hover',
  'trigger-focus',
  'focus-out',
  'list-navigation',
  'sibling-open',
])

/** Base UI's Menu.Trigger, wired as the nearest menu's morph source. */
export function MenuMorphTrigger(props: BaseMenu.Trigger.Props) {
  const { ref, ...rest } = props
  const morph = React.useContext(MenuMorphContext)
  const mergedRef = useMergedRef<HTMLButtonElement>(ref, morph?.sourceRef)
  return <BaseMenu.Trigger {...rest} ref={mergedRef} />
}
