'use client'

import { RefObject, useEffect, useState } from 'react'

export type ColorScheme = 'light' | 'dark'

// The follow-OS query, screen only, so print always reads light (§1.11.9).
const DARK_QUERY = 'only screen and (prefers-color-scheme: dark)'

function resolve(element: Element | null | undefined): ColorScheme {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return 'light'
  }
  const start = element ?? document.documentElement
  const theme = start.closest('[data-theme]')?.getAttribute('data-theme')
  if (theme === 'dark' || theme === 'light') return theme
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

/**
 * Reports the color scheme in effect at an element [D158], mirroring the CSS
 * precedence: the nearest ancestor's `data-theme`, else the OS preference,
 * else light. Re-evaluates when either changes. Server rendering assumes
 * light. An escape hatch for non-CSS consumers only (canvas, map tiles,
 * embeds, raster swaps, the theme-color meta): no component uses it to
 * choose colors.
 */
export function useColorScheme(ref?: RefObject<Element | null>): ColorScheme {
  const [scheme, setScheme] = useState<ColorScheme>('light')

  useEffect(() => {
    const update = () => setScheme(resolve(ref?.current))
    update()
    const media = window.matchMedia(DARK_QUERY)
    media.addEventListener('change', update)
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
      subtree: true,
    })
    return () => {
      media.removeEventListener('change', update)
      observer.disconnect()
    }
  }, [ref])

  return scheme
}
