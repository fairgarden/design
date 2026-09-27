'use client'

import * as React from 'react'

/*
 * Internal: the release mark for controls whose press swaps fill and ink as
 * a pair (the inverse pair) [D205]. A press is `:active`, so its module can
 * step it; a release lands on `:hover` like a hover-in, which should fade,
 * so CSS alone can't tell the two apart. The mark can: the element carries
 * `data-released` for two frames after the press ends (the pointer lifting
 * anywhere, or Space or Enter coming up), and its module drops the fill and
 * ink transitions while it's there, so no frame shows the ink over a fill
 * of its own tone. Not exported from any index.
 */

/** The attribute the element carries for two frames after a press ends. */
export const RELEASED_ATTRIBUTE = 'data-released'

/** Handlers to merge into the control's own `onPointerDown` and `onKeyUp`. */
export type ReleaseMarkHandlers = {
  onPointerDown: () => void
  onKeyUp: (event: { key: string }) => void
}

/** Marks `element` `data-released` for two frames whenever a press on it ends. */
export function useReleaseMark(element: React.RefObject<HTMLElement | null>): ReleaseMarkHandlers {
  return React.useMemo(() => {
    const mark = () => {
      const node = element.current
      if (!node) return
      node.setAttribute(RELEASED_ATTRIBUTE, '')
      requestAnimationFrame(() => {
        requestAnimationFrame(() => node.removeAttribute(RELEASED_ATTRIBUTE))
      })
    }
    // The pointer may lift outside the control, which still ends `:active`.
    const onPointerDown = () => {
      const release = () => {
        window.removeEventListener('pointerup', release, true)
        window.removeEventListener('pointercancel', release, true)
        mark()
      }
      window.addEventListener('pointerup', release, true)
      window.addEventListener('pointercancel', release, true)
    }
    const onKeyUp = (event: { key: string }) => {
      if (event.key === ' ' || event.key === 'Enter') mark()
    }
    return { onPointerDown, onKeyUp }
  }, [element])
}
