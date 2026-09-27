'use client'

import * as React from 'react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'

import {
  OutlineMorphFrame,
  OutlineMorphLayer,
  type OutlineMorphRefs,
} from '../../foundations/outline-morph'
import { useMergedRef } from '../../utils/assignRef'

/*
 * Internal: the outline morph's wiring through a dialog's parts [D206]. Not
 * exported from the Dialog index. `Dialog` and `AlertDialog` provide the
 * refs; their triggers take the source ref, `DialogPopup` (which the Alert
 * Dialog composes) takes the target ref and renders `DialogMorphLayer`
 * after the popup in its portal. The navigation drawer, on the Dialog,
 * wires its own menu Button and sheet through `DialogMorphTrigger` and
 * `DialogMorphPopup`.
 */

/** The nearest dialog root's morph refs, or `null` (`morph={false}`, or outside a root). */
export const DialogMorphContext = React.createContext<OutlineMorphRefs | null>(null)

/**
 * The frame's layer, for a popup with no positioner: fixed, the full
 * viewport, above the popup. Render it after the popup, in its portal.
 */
export function DialogMorphLayer(props: { morph: OutlineMorphRefs | null }) {
  const { morph } = props
  if (!morph) return null
  return (
    <OutlineMorphLayer>
      <OutlineMorphFrame ref={morph.frameRef} />
    </OutlineMorphLayer>
  )
}

/** Base UI's Dialog.Trigger, wired as the nearest dialog root's morph source. */
export function DialogMorphTrigger(props: BaseDialog.Trigger.Props) {
  const { ref, ...rest } = props
  const morph = React.useContext(DialogMorphContext)
  const mergedRef = useMergedRef<HTMLButtonElement>(ref, morph?.sourceRef)
  return <BaseDialog.Trigger {...rest} ref={mergedRef} />
}

/** Base UI's Dialog.Popup, wired as the morph target, with the frame's layer after it. */
export function DialogMorphPopup(props: BaseDialog.Popup.Props) {
  const { ref, ...rest } = props
  const morph = React.useContext(DialogMorphContext)
  const mergedRef = useMergedRef<HTMLDivElement>(ref, morph?.targetRef)
  return (
    <>
      <BaseDialog.Popup {...rest} ref={mergedRef} />
      <DialogMorphLayer morph={morph} />
    </>
  )
}
