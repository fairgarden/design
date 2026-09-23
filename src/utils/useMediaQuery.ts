'use client'

import * as React from 'react'

/**
 * Whether a media query matches, kept in sync with its `change` events.
 * False on the server and during hydration, so layouts render mobile first
 * and motion starts off. For JavaScript that must restate a CSS media tier
 * or preference; styling itself stays in the module's media queries.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    [query]
  )
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  )
}
