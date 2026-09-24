'use client'

import * as React from 'react'
import { useSearch } from '@fairgarden/docs/useSearch'
import type {
  SearchResult,
  Sitemap,
  UseSearchOptions,
  UseSearchResult,
} from '@fairgarden/docs/useSearch/types'

import { startExpandingTransition, useExpandingBoxName } from '../../foundations/expanding-box'
import { SearchDialogPopup } from './SearchDialogPopup'
import { SearchDialogTrigger } from './SearchDialogTrigger'
import type { SearchDialogVariants } from './variants'

/*
 * Search dialog (§9.10 [D194]): the header search where a site has a search
 * index. Built on `@fairgarden/docs` as the source's Search is: it calls
 * `useSearch` over the site's sitemap and renders the engine's results. A
 * field-like trigger morphs through the expanding box into a modal
 * Autocomplete dialog and back. Framework-free: a row's navigation goes out
 * through `onNavigate`.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: search-dialog.module.css; CVA function `searchDialog`
 *   (variants.ts), applied to the trigger (the page-scope root) and to the
 *   popup (the overlay scope root). Rows, group labels, statuses and
 *   matches compose forms/search's parts.
 * - Axes: `primary`, `secondary` → scales module classes. The popup takes
 *   the `white` overlay preset's scales unless props override them [D139].
 * - Compound variants: none. Defaults: color axes none [D133].
 * - Structure, as the source: SearchDialog (the source's Search: engine,
 *   state, transitions, shortcut) renders SearchDialogTrigger (its
 *   SearchButton) and SearchDialogPopup (its SearchDialog, input, results
 *   and items). The parts are private.
 * - Engine: `useSearch({ maxDefaultResults: 10, tolerance: 1, limit: 20,
 *   enableStemming: true, ...searchOptions })` builds the index on mount;
 *   each input change runs `search(value, searchBy)` once `isReady`; rows
 *   link to `buildResultUrl(result)`. Nothing of the engine is redone here.
 * - Mechanics: open and close run inside startExpandingTransition (the
 *   morph), each behind a 100 ms re-entry guard; without the morph the
 *   popup opens with the Dialog's clip reveal under --motionOK, else at
 *   once. ⌘K / Ctrl K is a capture-phase window listener. Non-empty results
 *   apply at once, empty ones after `emptyDelay`; after a close completes
 *   the results reset to the engine's `defaultResults`.
 * - States: trigger aria-expanded="true" → visibility: hidden (its box
 *   keeps its names valid); popup data-starting-style / data-ending-style
 *   → the clip reveal, off while <html data-fgd-expanding> is set, when the
 *   closing popup hides at once; row data-highlighted → --primary4 plus the
 *   start bar [D145]; the input's focus → the ring on the input row [D90].
 * - Parts: trigger, triggerBox, triggerMain, magnifier, triggerLabel, kbd,
 *   backdrop, viewport, popup, box, inputRow, input, esc, escKey,
 *   closeIcon, results, scroll, list, group, groupLabel, item, itemHead,
 *   itemIcon, itemTitle, match, sectionTitle, score, description, empty,
 *   stats, statsText, visuallyHidden.
 * - Scope: the trigger spreads the page scope; the popup renders in its
 *   Base UI Portal as a nested `white` scope, face --primary1.
 * - Container: none; the dialog is page frame: below --md-n-above the
 *   sheet, a panel inset by the page margin and the safe areas; from it,
 *   the centered panel in the Dialog `wide` width.
 */

/** The engine's per-query options: the second argument of `useSearch().search`. */
export type SearchDialogSearchBy = NonNullable<
  Parameters<ReturnType<typeof useSearch>['search']>[1]
>

/** `useSearch`'s options (all but `sitemap`), plus the per-query options. */
export type SearchDialogSearchOptions = Omit<UseSearchOptions, 'sitemap'> & {
  /**
   * Passed with every query, `search(value, searchBy)`. Replaces the
   * default, `{ groupBy: { properties: ['group'], maxResult: 5 } }`.
   */
  searchBy?: SearchDialogSearchBy
}

/** Props for SearchDialog. */
export type SearchDialogProps = {
  /**
   * The sitemap loader `useSearch` indexes, e.g. `() => import('./sitemap')`.
   * Read once, on mount, when the index builds; an inline arrow is fine.
   */
  sitemap: () => Promise<{ sitemap?: Sitemap }>
  /**
   * `useSearch` options, merged over the source's defaults:
   * `maxDefaultResults: 10`, `tolerance: 1`, `limit: 20`,
   * `enableStemming: true`. Keep `flattenPage` and `generateSlug` stable:
   * `useSearch` rebuilds its index when they change.
   */
  searchOptions?: SearchDialogSearchOptions
  /**
   * A plain activation of a row (click, or Enter on the highlighted row)
   * closes the dialog, `preventDefault()`s the row's link and calls this
   * with the engine's `buildResultUrl(result)`; a Next.js site passes
   * `(href) => router.push(href)`. Without it, the link navigates natively.
   * A modifier click always follows the link natively and leaves the dialog
   * open.
   */
  onNavigate?: (href: string, result: SearchResult) => void
  /**
   * Controlled open. SearchDialog calls `onOpenChange` inside the morph's
   * `flushSync`, so set `open` synchronously in it.
   */
  open?: boolean
  /** Default `false`. */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** After the morph (or fallback) finishes. On close, the results are already reset to the engine's `defaultResults`. */
  onOpenChangeComplete?: (open: boolean) => void
  /**
   * ⌘K / Ctrl K: a `keydown` listener on `window` in the capture phase,
   * `preventDefault` + `stopPropagation`, guarded while open, opening or
   * closing. Also shows the platform-aware hint and, from `--lg-n-above`,
   * the "esc" button in place of the "Close search" button. The hint renders
   * nothing on the server, then "⌘K" on Apple platforms or "Ctrl K"
   * elsewhere. One per page. Default `false`.
   */
  keyboardShortcut?: boolean
  /** Milliseconds before empty results replace the list. Default `400`. */
  emptyDelay?: number
  /** Trigger text, input placeholder and the dialog's accessible name. Default `"Search"`. */
  label?: string
  /** The score badge on each row. Default: outside production builds, as in the source. */
  showScores?: boolean
  /**
   * Primary Radix scale: frame, labels, highlighted row, focus ring. Never
   * defaulted; omitted, the trigger inherits the scope and the popup takes
   * the `white` overlay preset's default [D133, D139].
   */
  primary?: SearchDialogVariants['primary']
  /** Secondary Radix scale. Never defaulted. */
  secondary?: SearchDialogVariants['secondary']
  /** On the trigger. */
  className?: string
}

type EngineResults = UseSearchResult<unknown>['results']

/** The source's `useSearch` options. */
const searchDefaults = {
  maxDefaultResults: 10,
  tolerance: 1,
  limit: 20,
  enableStemming: true,
} satisfies Omit<UseSearchOptions, 'sitemap'>

/** The source's per-query options: at most five results per group. */
const defaultSearchBy: SearchDialogSearchBy = {
  groupBy: { properties: ['group'], maxResult: 5 },
}

const noOptions: SearchDialogSearchOptions = {}

/** How long a started open or close blocks the next one, as in the source. */
const REENTRY_GUARD_MS = 100

/** A pending open or close: done once both the morph and the Dialog's own transition finish. */
type Completion = { open: boolean; pending: number }

/**
 * The search dialog over a `@fairgarden/docs` sitemap: the trigger, and the
 * dialog in a portal. It owns the engine (`useSearch`), open state, the
 * shortcut listener, the delayed results copy and the transitions.
 */
export function SearchDialog(props: SearchDialogProps): React.JSX.Element {
  const {
    sitemap,
    searchOptions = noOptions,
    onNavigate,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    onOpenChangeComplete,
    keyboardShortcut = false,
    emptyDelay = 400,
    label = 'Search',
    showScores = process.env.NODE_ENV !== 'production',
    primary,
    secondary,
    className,
  } = props
  const { searchBy = defaultSearchBy, ...engineOptions } = searchOptions

  // useSearch rebuilds its index whenever the loader's identity changes; an
  // inline `() => import(…)` must not rebuild it on every render.
  const sitemapRef = React.useRef(sitemap)
  React.useLayoutEffect(() => {
    sitemapRef.current = sitemap
  })
  const loadSitemap = React.useCallback<UseSearchOptions['sitemap']>(
    () => sitemapRef.current(),
    []
  )

  const { results, defaultResults, search, buildResultUrl, isReady } = useSearch({
    ...searchDefaults,
    ...engineOptions,
    sitemap: loadSitemap,
  })

  const name = useExpandingBoxName()
  const inputId = React.useId()
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const [innerOpen, setInnerOpen] = React.useState(defaultOpen)
  const controlled = openProp !== undefined
  const open = controlled ? openProp : innerOpen

  const [query, setQuery] = React.useState('')

  // The source's delayed copy: non-empty results apply at once, empty ones
  // after the delay, so "No results" never flashes while typing. A layout
  // effect, so a new non-empty list replaces the old one before paint.
  const [shown, setShown] = React.useState<EngineResults>(results)
  React.useLayoutEffect(() => {
    if (results.results.length === 0) {
      const timeout = window.setTimeout(() => setShown(results), emptyDelay)
      return () => window.clearTimeout(timeout)
    }
    setShown(results)
    return undefined
  }, [results, emptyDelay])

  // The latest values, for handlers that outlive a render.
  const openRef = React.useRef(open)
  const latest = React.useRef({
    controlled,
    onOpenChange,
    onOpenChangeComplete,
    defaultResults,
    query,
    search,
    searchBy,
  })
  React.useLayoutEffect(() => {
    openRef.current = open
    latest.current = {
      controlled,
      onOpenChange,
      onOpenChangeComplete,
      defaultResults,
      query,
      search,
      searchBy,
    }
  })

  // A query typed before the index was ready runs once it is.
  React.useEffect(() => {
    if (!isReady) return
    const { query: pending, search: runSearch, searchBy: by } = latest.current
    if (pending.trim()) void runSearch(pending, by)
  }, [isReady])

  const openingRef = React.useRef(false)
  const closingRef = React.useRef(false)
  const guardTimers = React.useRef<number[]>([])
  React.useEffect(() => {
    const timers = guardTimers.current
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [])

  const releaseLater = React.useCallback((guard: React.RefObject<boolean>) => {
    const timer = window.setTimeout(() => {
      guard.current = false
      guardTimers.current = guardTimers.current.filter((pending) => pending !== timer)
    }, REENTRY_GUARD_MS)
    guardTimers.current.push(timer)
  }, [])

  const setOpen = React.useCallback((next: boolean) => {
    if (!latest.current.controlled) setInnerOpen(next)
    latest.current.onOpenChange?.(next)
  }, [])

  const completion = React.useRef<Completion | null>(null)

  const finish = React.useCallback((next: boolean) => {
    if (!next) {
      setShown(latest.current.defaultResults)
      setQuery('')
    }
    latest.current.onOpenChangeComplete?.(next)
  }, [])

  // Both the morph and the Dialog's own transition report here; the later one completes.
  const settle = React.useCallback(
    (next: boolean, from: 'morph' | 'dialog') => {
      const current = completion.current
      if (!current) {
        // An open state changed from outside (controlled): the Dialog's report is the only one.
        if (from === 'dialog') finish(next)
        return
      }
      if (current.open !== next) return
      current.pending -= 1
      if (current.pending > 0) return
      completion.current = null
      finish(next)
    },
    [finish]
  )

  const requestOpen = React.useCallback(() => {
    if (openingRef.current || openRef.current) return
    openingRef.current = true
    completion.current = { open: true, pending: 2 }
    void startExpandingTransition(() => setOpen(true), { direction: 'open' }).then(() =>
      settle(true, 'morph')
    )
    releaseLater(openingRef)
  }, [releaseLater, setOpen, settle])

  const requestClose = React.useCallback(() => {
    if (closingRef.current || !openRef.current) return
    closingRef.current = true
    completion.current = { open: false, pending: 2 }
    void startExpandingTransition(() => setOpen(false), { direction: 'close' }).then(() =>
      settle(false, 'morph')
    )
    releaseLater(closingRef)
  }, [releaseLater, setOpen, settle])

  const handleDialogOpenChange = React.useCallback(
    (next: boolean) => (next ? requestOpen() : requestClose()),
    [requestOpen, requestClose]
  )

  const handleDialogOpenChangeComplete = React.useCallback(
    (next: boolean) => settle(next, 'dialog'),
    [settle]
  )

  // Focus returns to the trigger inside the morph's flushSync, so the new
  // snapshot holds its ring; the Dialog's finalFocus covers every other close.
  const wasOpen = React.useRef(open)
  React.useLayoutEffect(() => {
    if (wasOpen.current && !open) triggerRef.current?.focus({ preventScroll: true })
    wasOpen.current = open
  }, [open])

  // ⌘K / Ctrl K, in the capture phase so the page's own handlers never see it.
  React.useEffect(() => {
    if (!keyboardShortcut) return undefined
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.shiftKey || event.altKey) return
      if (event.key !== 'k' && event.key !== 'K') return
      // Another search dialog on the page took this keystroke: one dialog opens, not two.
      if (event.defaultPrevented) return
      event.preventDefault()
      event.stopPropagation()
      if (!openRef.current && !openingRef.current && !closingRef.current) requestOpen()
    }
    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [keyboardShortcut, requestOpen])

  const handleValueChange = React.useCallback(
    (value: string) => {
      setQuery(value)
      if (!isReady) return
      void search(value, searchBy)
    },
    [isReady, search, searchBy]
  )

  const handleItemClick = React.useCallback(
    (event: React.MouseEvent<HTMLElement>, result: SearchResult) => {
      if (event.defaultPrevented) return
      // A modifier click opens the link its own way; the dialog stays open.
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }
      if (onNavigate) event.preventDefault()
      requestClose()
      onNavigate?.(buildResultUrl(result), result)
    },
    [buildResultUrl, onNavigate, requestClose]
  )

  // Blank input: the engine's default results, even if an empty result's delay is still pending.
  const current = query.trim() === '' ? defaultResults : shown

  return (
    <React.Fragment>
      <SearchDialogTrigger
        ref={triggerRef}
        name={name}
        open={open}
        label={label}
        keyboardShortcut={keyboardShortcut}
        onClick={requestOpen}
        primary={primary}
        secondary={secondary}
        className={className}
      />
      <SearchDialogPopup
        name={name}
        open={open}
        onOpenChange={handleDialogOpenChange}
        onOpenChangeComplete={handleDialogOpenChangeComplete}
        onClose={requestClose}
        triggerRef={triggerRef}
        inputRef={inputRef}
        inputId={inputId}
        label={label}
        keyboardShortcut={keyboardShortcut}
        results={current}
        query={query}
        onValueChange={handleValueChange}
        onItemClick={handleItemClick}
        buildResultUrl={buildResultUrl}
        showScores={showScores}
        primary={primary}
        secondary={secondary}
      />
    </React.Fragment>
  )
}
