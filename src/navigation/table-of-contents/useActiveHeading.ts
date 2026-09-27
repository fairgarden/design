'use client'

import * as React from 'react'

/** Options for useActiveHeading. */
export interface UseActiveHeadingOptions {
  /**
   * The scroll container the headings move in. Default: the viewport. Pass
   * a ref when the content scrolls inside its own box (a panel, a demo).
   */
  root?: React.RefObject<Element | null>
  /**
   * Where a heading becomes current: the activation line's distance below
   * the root's top edge, in `px` (`'80px'`) or as a percentage of the
   * root's height (`'25%'`). Default `'25%'`: a heading is current once
   * its top has passed the top quarter of the view, and stays current
   * until the next one passes.
   */
  line?: string
  /** `false` pauses the hook (it then returns `undefined`). Default `true`. */
  enabled?: boolean
}

/** A root's scroll state: whether it is scrolled to its end. */
function atEnd(root: Element | null): boolean {
  if (root == null) {
    const doc = document.documentElement
    return window.scrollY > 0 && window.innerHeight + window.scrollY >= doc.scrollHeight - 1
  }
  return root.scrollTop > 0 && root.clientHeight + root.scrollTop >= root.scrollHeight - 1
}

/**
 * Scrollspy for a table of contents [D202]: the id of the heading whose
 * section is in view, for `TableOfContents`' `activeId`. An
 * IntersectionObserver watches the headings against a band from the root's
 * top edge down to `line`; each time one crosses the line the hook takes
 * the last heading above it (the first while none has passed, the last
 * once the root is scrolled to its end). A `scrollend` pass re-reads the
 * positions after jumps that cross no line.
 *
 * It only reads layout and returns an id: nothing it drives changes size
 * (the list reserves each entry's current weight), so it causes no layout
 * shift. It returns `undefined` on the server and before the first
 * observation, so the server HTML marks no section.
 */
export function useActiveHeading(
  ids: readonly string[],
  options: UseActiveHeadingOptions = {}
): string | undefined {
  const { root, line = '25%', enabled = true } = options
  const key = ids.join('\n')
  const [active, setActive] = React.useState<string | undefined>(undefined)

  React.useEffect(() => {
    const list = key.split('\n').filter(Boolean)
    if (!enabled || list.length === 0 || typeof IntersectionObserver === 'undefined') {
      setActive(undefined)
      return undefined
    }
    const rootElement = root?.current ?? null
    const headings = list
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element != null)
    if (headings.length === 0) return undefined

    // The line's distance below the root's top edge, in px.
    const lineDepth = (): number => {
      const height = rootElement ? rootElement.clientHeight : window.innerHeight
      const value = Number.parseFloat(line) || 0
      return line.trim().endsWith('%') ? (height * value) / 100 : value
    }

    // The last heading whose top has passed the line; positions are read fresh.
    const update = () => {
      if (atEnd(rootElement)) {
        setActive(headings[headings.length - 1].id)
        return
      }
      const top = rootElement ? rootElement.getBoundingClientRect().top : 0
      const limit = top + lineDepth() + 1
      let current = headings[0].id
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= limit) current = heading.id
        else break
      }
      setActive(current)
    }

    // The band runs from the root's top edge down to the line, so every
    // crossing of the line is an intersection change. Rebuilt on resize.
    let observer: IntersectionObserver | null = null
    const connect = () => {
      observer?.disconnect()
      const height = rootElement ? rootElement.clientHeight : window.innerHeight
      const below = Math.max(0, Math.round(height - lineDepth()))
      observer = new IntersectionObserver(update, {
        root: rootElement,
        rootMargin: `0px 0px ${-below}px 0px`,
        threshold: [0, 1],
      })
      headings.forEach((heading) => observer?.observe(heading))
    }
    connect()

    const onResize = () => {
      connect()
      update()
    }
    const target: EventTarget = rootElement ?? window
    target.addEventListener('scrollend', update, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      observer?.disconnect()
      target.removeEventListener('scrollend', update)
      window.removeEventListener('resize', onResize)
    }
  }, [key, root, line, enabled])

  return enabled ? active : undefined
}
