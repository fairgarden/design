'use client'

import * as React from 'react'

/*
 * The search dialog's platform-aware shortcut hint. Private to the module:
 * not exported from its index.
 */

/** The hint's visible text and its `aria-keyshortcuts` value. */
export type ShortcutLabel = {
  /** "⌘K" on Apple platforms, "Ctrl K" elsewhere. */
  label: string
  /** "Meta+K" or "Control+K". */
  aria: string
}

const apple: ShortcutLabel = { label: '⌘K', aria: 'Meta+K' }
const other: ShortcutLabel = { label: 'Ctrl K', aria: 'Control+K' }

type NavigatorWithUAData = Navigator & { userAgentData?: { platform?: string } }

function isApplePlatform(): boolean {
  const nav = navigator as NavigatorWithUAData
  const platform = nav.userAgentData?.platform || nav.platform || nav.userAgent
  return /mac|iphone|ipad|ipod/i.test(platform)
}

// The platform never changes while the page is open.
const subscribe = () => () => {}

/**
 * The ⌘K / Ctrl K hint. `null` on the server and during hydration, so the
 * server markup never names the wrong platform; the client fills it in.
 */
export function useShortcutLabel(): ShortcutLabel | null {
  return React.useSyncExternalStore(
    subscribe,
    () => (isApplePlatform() ? apple : other),
    () => null
  )
}
