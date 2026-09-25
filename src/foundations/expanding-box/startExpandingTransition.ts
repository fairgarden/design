'use client'

import { flushSync } from 'react-dom'

/*
 * The expanding box's morph runner. It is a client module so a server
 * component importing the module index never evaluates react-dom's
 * flushSync.
 */

/** Which way the morph runs: `open` grows the trigger into the dialog; `close` is the faster way back. */
export type ExpandingTransitionDirection = 'open' | 'close'

/** Options for `startExpandingTransition`. */
export type StartExpandingTransitionOptions = {
  /** `open` or `close`: sets `<html data-fgd-expanding>`, which picks the timing. */
  direction: ExpandingTransitionDirection
}

/** Morphs running now; the root flag stays until the last one settles. */
let running = 0

const noop = () => {}

/**
 * Whether the morph can run: View Transitions with `view-transition-class`
 * (the pieces are styled by class), and motion allowed, read now.
 */
function canMorph(): boolean {
  if (typeof document === 'undefined' || typeof document.startViewTransition !== 'function') {
    return false
  }
  if (typeof CSS === 'undefined' || !CSS.supports('view-transition-class', 'a')) {
    return false
  }
  if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false
  }
  return true
}

/**
 * Runs `update` (the state change that swaps which box is active) as the
 * morph. Resolves once the morph finishes, or on a microtask when it doesn't
 * run. Never rejects.
 *
 * Without View Transitions, without `view-transition-class`, or under
 * `prefers-reduced-motion: reduce` (read at call time), it calls `update()`
 * directly; the owner's own fallback applies then (the Dialog's clip reveal
 * where motion is allowed, else instant). Otherwise it sets
 * `<html data-fgd-expanding="open|close">` and calls
 * `document.startViewTransition(() => flushSync(update))`, removing the flag
 * when the last running morph settles. Re-entry guards are the owner's.
 */
export function startExpandingTransition(
  update: () => void,
  options: StartExpandingTransitionOptions
): Promise<void> {
  if (!canMorph()) {
    update()
    return Promise.resolve()
  }

  const root = document.documentElement
  running += 1
  root.dataset.fgdExpanding = options.direction

  const settle = () => {
    running -= 1
    if (running === 0) {
      delete root.dataset.fgdExpanding
    }
  }

  let transition: ViewTransition
  try {
    transition = document.startViewTransition(() => flushSync(update))
  } catch {
    // A browser that refuses to start one: apply the change as the fallback does.
    settle()
    update()
    return Promise.resolve()
  }

  // A skipped morph (a duplicate name, a newer transition) still applies the update.
  transition.ready.catch(noop)
  return transition.finished.then(noop, noop).then(settle)
}
