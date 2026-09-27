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
  /** The owner's `morph` prop. Default `true`; `false` applies the update at once, with no morph. */
  enabled?: boolean
  /**
   * The element the morph reads the shared switch and tokens on, usually the
   * trigger (default: the root): `--fgd-outline-morph: none` there, or the
   * direction's duration token (`--fgd-duration-expand` to open,
   * `--fgd-duration-collapse` to close) resolving to 0, applies the update
   * at once [D204].
   */
  source?: Element | null
}

/** Morphs running now; the root flag stays until the last one settles. */
let running = 0

const noop = () => {}

/** A `<time>` custom property's computed value in ms ("333ms", "0.2s"), or null. */
function timeMs(value: string): number | null {
  const match = value.trim().match(/^(-?[\d.]+)(ms|s)$/)
  return match ? parseFloat(match[1]) * (match[2] === 's' ? 1000 : 1) : null
}

/**
 * Whether the morph can run, read now: View Transitions with
 * `view-transition-class` (the pieces are styled by class); motion allowed,
 * no forced colors and not printing (as the outline morph, §9.17); the
 * owner's `morph` on; the shared switch `--fgd-outline-morph` not `none` on
 * the source; and the direction's duration token not 0 there [D204].
 */
function canMorph(options: StartExpandingTransitionOptions): boolean {
  if (options.enabled === false) return false
  if (typeof document === 'undefined' || typeof document.startViewTransition !== 'function') {
    return false
  }
  if (typeof CSS === 'undefined' || !CSS.supports('view-transition-class', 'a')) {
    return false
  }
  if (
    typeof matchMedia === 'function' &&
    (matchMedia('(prefers-reduced-motion: reduce)').matches ||
      matchMedia('(forced-colors: active)').matches ||
      matchMedia('print').matches)
  ) {
    return false
  }
  const style = getComputedStyle(options.source ?? document.documentElement)
  if (style.getPropertyValue('--fgd-outline-morph').trim() === 'none') return false
  const token = options.direction === 'open' ? '--fgd-duration-expand' : '--fgd-duration-collapse'
  const duration = timeMs(style.getPropertyValue(token))
  return duration === null || duration > 0
}

/**
 * Runs `update` (the state change that swaps which box is active) as the
 * morph. Resolves once the morph finishes, or on a microtask when it doesn't
 * run. Never rejects.
 *
 * Without View Transitions or `view-transition-class`, under
 * `prefers-reduced-motion: reduce`, in forced colors or print, with
 * `enabled: false`, where `--fgd-outline-morph: none` applies to the source,
 * or with the direction's duration token at 0 (read at call time), it calls
 * `update()` directly and the change is instant. Otherwise it sets
 * `<html data-fgd-expanding="open|close">` and calls
 * `document.startViewTransition(() => flushSync(update))`, removing the flag
 * when the last running morph settles. Re-entry guards are the owner's.
 */
export function startExpandingTransition(
  update: () => void,
  options: StartExpandingTransitionOptions
): Promise<void> {
  if (!canMorph(options)) {
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
