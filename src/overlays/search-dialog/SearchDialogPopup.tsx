'use client'

import * as React from 'react'
import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import type {
  SearchResult,
  SearchResults,
  UseSearchResult,
} from '@fairgarden/docs/useSearch/types'

import { Button } from '../../actions/button'
import { ScrollArea } from '../../data/scroll-area'
import {
  ExpandingBox,
  ExpandingBoxExtra,
  ExpandingBoxMain,
  expandingBoxParts,
} from '../../foundations/expanding-box'
import { Icon } from '../../foundations/icon'
import { cx } from '../../utils/className'
import { highlightMatch } from '../../utils/highlightMatch'
import {
  OverlayScope,
  overlayActionClassName,
  overlayAttributes,
  overlayScales,
} from '../../utils/overlay'
import { searchDialog, searchDialogTypeIcons, type SearchDialogVariants } from './variants'
import styles from './search-dialog.module.css'

/*
 * The search dialog's popup (the source's SearchDialog, with its
 * SearchInput, SearchResults and SearchItem). Private to the module:
 * SearchDialog renders it with the engine's results.
 */

/** Props for SearchDialogPopup, all set by SearchDialog. */
export type SearchDialogPopupProps = {
  /** The expanding-box pair's name. */
  name: string
  open: boolean
  /** The Dialog's own requests (outside press, Escape outside the input). */
  onOpenChange: (open: boolean) => void
  onOpenChangeComplete: (open: boolean) => void
  /** Escape in the input, the esc key cap and the "Close search" button. */
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
  inputRef: React.RefObject<HTMLInputElement | null>
  inputId: string
  label: string
  keyboardShortcut: boolean
  /** The engine's results to show (the delayed copy): groups, count and elapsed time. */
  results: UseSearchResult<unknown>['results']
  query: string
  onValueChange: (value: string) => void
  /** A row's activation; its link goes to `buildResultUrl(result)`. */
  onItemClick: (event: React.MouseEvent<HTMLElement>, result: SearchResult) => void
  /** The engine's `buildResultUrl`. */
  buildResultUrl: (result: SearchResult) => string
  showScores: boolean
  primary: SearchDialogVariants['primary']
  secondary: SearchDialogVariants['secondary']
}

/**
 * Base UI Dialog (Portal, colorless Backdrop, Viewport, Popup) holding the
 * expanded `sheet` ExpandingBox with the Autocomplete: below --md-n-above
 * the sheet, a panel inset by the page margin and the safe areas; from it,
 * the centered panel. Modal: the page stays
 * visible, inert and scroll-locked, never dimmed.
 */
export function SearchDialogPopup(props: SearchDialogPopupProps): React.JSX.Element {
  const { open, onOpenChange, onOpenChangeComplete, triggerRef, inputRef, label } = props
  const scales = overlayScales(props.primary, props.secondary)

  return (
    <BaseDialog.Root
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className={styles.backdrop} />
        <BaseDialog.Viewport className={styles.viewport}>
          <BaseDialog.Popup
            {...overlayAttributes}
            aria-label={label}
            initialFocus={inputRef}
            finalFocus={triggerRef}
            className={searchDialog({
              primary: scales.primary,
              secondary: scales.secondary,
              className: cx(expandingBoxParts.host, styles.popup, overlayActionClassName),
            })}
          >
            <OverlayScope>
              <SearchDialogPanel {...props} />
            </OverlayScope>
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}

/** The expanded box: the input row, the results and the stats row. */
function SearchDialogPanel(props: SearchDialogPopupProps) {
  const {
    name,
    open,
    onClose,
    inputRef,
    inputId,
    label,
    keyboardShortcut,
    results,
    query,
    onValueChange,
    onItemClick,
    buildResultUrl,
    showScores,
  } = props
  const trimmed = query.trim()

  // Focus lands on the input inside the morph's flushSync, so the new snapshot holds its ring.
  React.useLayoutEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [inputRef])

  return (
    <ExpandingBox name={name} active={open} sheet className={styles.box}>
      <BaseAutocomplete.Root
        items={results.results}
        filter={null}
        open
        inline
        autoHighlight
        value={query}
        onValueChange={onValueChange}
        onOpenChange={(next, details) => {
          if (!next && details.reason === 'escape-key') onClose()
        }}
        itemToStringValue={(result: SearchResult) => result.title || result.slug}
      >
        <ExpandingBoxMain className={styles.inputRow}>
          <Icon name="search" className={styles.magnifier} />
          <BaseAutocomplete.Input
            ref={inputRef}
            id={inputId}
            className={styles.input}
            placeholder={label}
            aria-label={label}
          />
          {keyboardShortcut ? (
            <button
              type="button"
              aria-keyshortcuts="Escape"
              className={cx(expandingBoxParts.end, styles.esc)}
              onClick={onClose}
            >
              <kbd className={styles.escKey}>esc</kbd>
              <span className={styles.visuallyHidden}>, close {label.toLowerCase()}</span>
            </button>
          ) : null}
          <Button
            iconOnly
            icon="close"
            size="sm"
            className={cx(expandingBoxParts.end, styles.closeIcon)}
            onClick={onClose}
          >
            {`Close ${label.toLowerCase()}`}
          </Button>
        </ExpandingBoxMain>
        <ExpandingBoxExtra className={styles.results}>
          <ScrollArea kind="panel" maxBlockSize="none" className={styles.scroll}>
            <BaseAutocomplete.Empty className={styles.empty}>
              {trimmed ? `No results for '${trimmed}'` : null}
            </BaseAutocomplete.Empty>
            <BaseAutocomplete.List className={styles.list}>
              {(group: SearchResults[number]) => (
                <BaseAutocomplete.Group
                  key={group.group}
                  items={group.items}
                  className={styles.group}
                >
                  {group.group !== 'Default' ? (
                    <BaseAutocomplete.GroupLabel className={styles.groupLabel}>
                      {group.group}
                    </BaseAutocomplete.GroupLabel>
                  ) : null}
                  <BaseAutocomplete.Collection>
                    {(result: SearchResult, index: number) => (
                      <SearchDialogItem
                        key={result.id || index}
                        result={result}
                        href={buildResultUrl(result)}
                        query={query}
                        showScores={showScores}
                        onClick={onItemClick}
                      />
                    )}
                  </BaseAutocomplete.Collection>
                </BaseAutocomplete.Group>
              )}
            </BaseAutocomplete.List>
          </ScrollArea>
        </ExpandingBoxExtra>
        <BaseAutocomplete.Status className={styles.stats}>
          <span
            className={styles.statsText}
            data-hidden={results.elapsed.raw > 0 ? undefined : ''}
          >
            {`Found ${results.count} in ${results.elapsed.formatted}`}
          </span>
        </BaseAutocomplete.Status>
      </BaseAutocomplete.Root>
    </ExpandingBox>
  )
}

type SearchDialogItemProps = {
  result: SearchResult
  href: string
  query: string
  showScores: boolean
  onClick: SearchDialogPopupProps['onItemClick']
}

/** One row: a link with the type icon, the title, and for pages the section and description. */
function SearchDialogItem(props: SearchDialogItemProps) {
  const { result, href, query, showScores, onClick } = props
  const icon = searchDialogTypeIcons[result.type]
  const page = result.type === 'page'

  return (
    <BaseAutocomplete.Item
      value={result}
      className={styles.item}
      render={<a href={href} />}
      onClick={(event) => onClick(event, result)}
    >
      <span className={styles.itemHead}>
        {icon ? <Icon name={icon} className={styles.itemIcon} /> : null}
        <span className={styles.itemTitle}>
          {highlightMatch(result.title || result.slug, query, styles.match)}
        </span>
        {page && result.sectionTitle ? (
          <span className={styles.sectionTitle}>{result.sectionTitle}</span>
        ) : null}
        {showScores && result.score != null ? (
          <span className={styles.score}>{result.score.toFixed(2)}</span>
        ) : null}
      </span>
      {page && result.description ? (
        <span className={styles.description}>{result.description}</span>
      ) : null}
    </BaseAutocomplete.Item>
  )
}
