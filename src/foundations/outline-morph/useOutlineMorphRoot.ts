'use client'

import * as React from 'react'

import { useOutlineMorph, type OutlineMorphRefs } from './OutlineMorph'
import type { OutlineMorphRing } from './morphEngine'

/*
 * Internal: the outline morph wired to a Base UI root [D204, D206]. Not
 * exported from the index. Each adopting component (Select, Combobox,
 * Autocomplete, Search, Menu, Popover, Dialog, Alert Dialog) keeps the root's open state for the morph, lets
 * `morph={false}` turn it off, and decides per open change whether that
 * change skips the morph (typing, hover, a menubar switch). A skipped
 * change is instant, as every popup opens and closes at once without the
 * morph [D205].
 */

/** Base UI's open-change details, as far as the morph reads them. */
export type MorphOpenChangeDetails = { reason?: string; readonly isCanceled: boolean }

export type OutlineMorphRootOptions<Details extends MorphOpenChangeDetails> = {
  /** The root's controlled `open`, if any. */
  open: boolean | undefined
  /** The root's `defaultOpen`. */
  defaultOpen: boolean | undefined
  /** The consumer's `onOpenChange`, called first. */
  onOpenChange: ((open: boolean, details: Details) => void) | undefined
  /** The component's `morph` prop (default `true`). */
  morph: boolean
  /** How the trigger draws its ring (`useOutlineMorph`). */
  ring?: OutlineMorphRing
  /** Whether this open change skips the morph and happens at once. */
  instant?: (open: boolean, details: Details) => boolean
  /** A modal surface: the `-surface` durations (`useOutlineMorph`). */
  surface?: boolean
}

export type OutlineMorphRoot<Details extends MorphOpenChangeDetails> = {
  /** The refs to wire, or `null` with `morph={false}` (render no frame). */
  refs: OutlineMorphRefs | null
  /** Pass to the Base UI root as `onOpenChange`. */
  onOpenChange: ((open: boolean, details: Details) => void) | undefined
  /** The current open or close skips the morph, so it happens at once. */
  instant: boolean
}

export function useOutlineMorphRoot<Details extends MorphOpenChangeDetails>(
  options: OutlineMorphRootOptions<Details>
): OutlineMorphRoot<Details> {
  const { open, defaultOpen, onOpenChange, morph, ring, instant: isInstant, surface } = options
  // The open state after each commit: controlled `open`, else a mirror of
  // the root's own (kept only while the morph is on, so no extra render otherwise).
  const [mirror, setMirror] = React.useState(defaultOpen ?? false)
  const [instant, setInstant] = React.useState(false)
  const refs = useOutlineMorph({ open: open ?? mirror, enabled: morph && !instant, ring, surface })

  const handleOpenChange = (next: boolean, details: Details) => {
    onOpenChange?.(next, details)
    if (details.isCanceled) return
    setMirror(next)
    setInstant(isInstant?.(next, details) ?? false)
  }

  return {
    refs: morph ? refs : null,
    onOpenChange: morph ? handleOpenChange : onOpenChange,
    instant: morph && instant,
  }
}

/** Open changes a pointer's pass causes (hover intent): they keep the popup's own way. */
export const HOVER_REASONS: ReadonlySet<string> = new Set(['trigger-hover'])

/** Open changes typing causes in a field that opens as you type. */
const TYPING_REASONS: ReadonlySet<string> = new Set(['input-change', 'input-clear', 'input-paste'])

/**
 * The typing policy for fields that open while typing (Combobox,
 * Autocomplete, Search) [D204]. Explicit opens morph (a press in the
 * field, the chevron, the arrow keys), and so does the first open of a
 * focus session, even when typing caused it. After that, opens and closes
 * caused by typing are instant, so the list keeps up with the keys; a close
 * by Escape, a choice or an outside press morphs back onto the ring. A
 * focus session starts when focus enters the field from outside it.
 * Returns the `instant` decider and an `onFocus` for the field's box.
 */
export function useTypingMorphPolicy(): {
  instant: (open: boolean, details: MorphOpenChangeDetails) => boolean
  onFocus: (event: React.FocusEvent<HTMLElement>) => void
} {
  const opened = React.useRef(false)
  const instant = React.useCallback((open: boolean, details: MorphOpenChangeDetails) => {
    const typing = details.reason != null && TYPING_REASONS.has(details.reason)
    if (!open) return typing
    const skip = typing && opened.current
    opened.current = true
    return skip
  }, [])
  const onFocus = React.useCallback((event: React.FocusEvent<HTMLElement>) => {
    const from = event.relatedTarget
    if (!(from instanceof Node) || !event.currentTarget.contains(from)) opened.current = false
  }, [])
  return { instant, onFocus }
}
