'use client'

import * as React from 'react'
import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete'
import { cva, type VariantProps } from 'class-variance-authority'

import { Button } from '../Button'
import { Field, FieldLabel } from '../Field'
import { Icon, type IconName } from '../Icon'
import { input, inputParts } from '../Input'
import { Link } from '../Link'
import { highlightMatch } from '../../utils/highlightMatch'
import { OverlayScope, overlayAttributes, overlayScaleClassName } from '../../utils/overlay'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './search.module.css'

/*
 * Search (§9.10): where typing beats browsing. Site and collection search
 * on Base UI's Autocomplete, in a `search` landmark.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: search.module.css; CVA function `search`. The module styles
 *   only Search's own parts: the field is the Input's box (§10.1, through
 *   `input` and `inputParts`), the submit a `solid` Button butted to it,
 *   and the clear and header trigger icon-only Buttons.
 * - Axes: `kind` → boxed, ruled, trigger, docked; `primary`, `secondary`
 *   → scales module classes. `trigger` is the header's icon-only Button,
 *   which carries only the Button's own classes.
 * - Compound variants: none.
 * - Defaults: kind boxed; color axes none.
 * - Color fallback: Search's parts inherit the scope. The submit falls back
 *   to the scope's action scale through the Button's `solid` class.
 * - States: `data-focused` on the input → the ring on any focus [D90]
 *   (around field and submit together when butted); `data-popup-open` →
 *   `aria-expanded`, popup shown; `data-highlighted` on `item` → --primary4
 *   plus the start bar [D145]; `data-disabled` → per §10.1; popup
 *   `data-starting-style` / `data-ending-style` → the clip reveal.
 * - Parts: base (the landmark), magnifier, rules, popup, group,
 *   groupLabel, item, itemIcon, match, secondaryName, seeAll, status, bar.
 * - Scope: the popup renders in its Base UI Portal and declares a `white`
 *   page scope; edge --border-size-2 --primary12 [D148, D156].
 * - Container: none; the docked bar is page frame, and the butted submit
 *   follows the Input's row (§5.10.2).
 */
export const search = cva(styles.base, {
  variants: {
    kind: {
      boxed: styles.boxed,
      ruled: styles.ruled,
      docked: styles.docked,
    },
    // Color axes: never defaulted [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'boxed',
  },
})

type SearchVariants = VariantProps<typeof search>

/** One suggestion row. */
export type SearchSuggestion = {
  /** The text the suggestion fills in (and submits). */
  value: string
  /** The row's words. Default: `value`. */
  label?: string
  /** An italic secondary name in --role-muted (a Latin name, a place). */
  secondaryName?: string
  /** An optional type icon (inline tier). */
  icon?: IconName
  /** Makes the row a link to this page. */
  href?: string
  disabled?: boolean
}

/** A titled group of suggestions; each group after the first sits under a rule. */
export type SearchSuggestionGroup = {
  /** The group head, in `type-label` caps. */
  label: string
  items: readonly SearchSuggestion[]
}

type SearchItems = readonly SearchSuggestion[] | readonly SearchSuggestionGroup[]

function isGroups(items: SearchItems): items is readonly SearchSuggestionGroup[] {
  return items.length > 0 && 'items' in items[0]
}

interface SearchFieldProps {
  /**
   * The field's label and the landmark's name ("Search the guide"). A
   * placeholder never replaces it.
   */
  label: string
  /** Shows `label` above the field. Default `false`: it names the input for assistive technology. */
  labelVisible?: boolean
  /** Default "Search…", ending in the ellipsis character. */
  placeholder?: string
  /** The query, controlled. */
  value?: string
  /** The initial query. */
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Called with the query on submit (Enter, or the submit cell); the page does not reload. */
  onSubmit?: (query: string, event: React.FormEvent<HTMLFormElement>) => void
  /** A native form action, used when `onSubmit` is not given. */
  action?: string
  /** The query's name in a native submission. Default `q`. */
  name?: string
  /** The suggestions, or titled groups. Pass `filter={null}` when the server filters them. */
  items?: SearchItems
  /** Base UI's filter; `null` when the server already filtered the items. */
  filter?: BaseAutocomplete.Root.Props<SearchSuggestion>['filter']
  /** Status text: "12 results". Announced politely. */
  status?: React.ReactNode
  /** Shows "Searching…" in the status row while suggestions load. */
  loading?: boolean
  /** The empty status. Default "No results for '[query]'"; add a next step where you can. */
  emptyText?: (query: string) => React.ReactNode
  /** The "See all results" row's destination for a query. */
  seeAllHref?: (query: string) => string
  /** The "See all" row's words. Default "See all results for '[query]'". */
  seeAllText?: (query: string) => React.ReactNode
  /** The submit cell's accessible name (and label from `--md-n-above` when `submitLabelled`). Default "Search". */
  submitLabel?: string
  /** Shows the submit's label from `--md-n-above`. Default `false`: the icon-only cell. */
  submitLabelled?: boolean
  /** Hides the butted submit (boxed and docked); Enter still submits. */
  hideSubmit?: boolean
  /** Submits the chosen suggestion when a row is pressed. */
  submitOnItemClick?: boolean
  disabled?: boolean
  /** Class names for the landmark, added after the module's own. */
  className?: string
  /** Primary Radix scale: field, rules, rows and focus ring. Never defaulted [D133]. */
  primary?: SearchVariants['primary']
  /** Secondary Radix scale: accepted; the submit takes the scope's action scale. */
  secondary?: SearchVariants['secondary']
}

interface SearchTriggerProps {
  /** The trigger's accessible name ("Search"). */
  label: string
  /** Opens the app's search sheet (a Dialog below `--lg-n-above`) or docked bar. */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** Base UI `render`, to compose the trigger with a Dialog trigger. */
  render?: React.ReactElement
  /** Class names for the Button, added after its own. */
  className?: string
  /** Primary Radix scale for the Button. Never defaulted [D133]. */
  primary?: SearchVariants['primary']
  /** Secondary Radix scale for the Button. */
  secondary?: SearchVariants['secondary']
}

/**
 * Props for Search. `kind="trigger"` takes only the trigger props; the
 * other kinds take the field props.
 */
export type SearchProps =
  | ({
      /**
       * `boxed` (default): the field box with the butted submit. `ruled`:
       * the field between two --border-size-2 rules. `docked`: the boxed
       * field in the full-width top bar. `trigger`: the header's icon-only
       * Button that opens the search sheet or bar.
       */
      kind?: 'boxed' | 'ruled' | 'docked'
    } & SearchFieldProps)
  | ({ kind: 'trigger' } & SearchTriggerProps)

/**
 * Search in a `search` landmark. Matches are marked by weight, never
 * color; an empty result is a plain-word status, never a red error (P10).
 * Show one docked bar at a time.
 */
export function Search(props: SearchProps) {
  if (props.kind === 'trigger') {
    const { label, onClick, render, className, primary, secondary } = props
    return (
      <Button
        iconOnly
        size="lg"
        icon="search"
        onClick={onClick}
        render={render}
        className={className}
        primary={primary}
        secondary={secondary}
      >
        {label}
      </Button>
    )
  }
  return <SearchField {...props} />
}

function SearchField(props: { kind?: 'boxed' | 'ruled' | 'docked' } & SearchFieldProps) {
  const {
    kind,
    label,
    labelVisible = false,
    placeholder = 'Search…',
    value,
    defaultValue,
    onValueChange,
    onSubmit,
    action,
    name = 'q',
    items,
    filter,
    status,
    loading = false,
    emptyText = (query: string) => `No results for '${query}'`,
    seeAllHref,
    seeAllText = (query: string) => `See all results for '${query}'`,
    submitLabel = 'Search',
    submitLabelled = false,
    hideSubmit = false,
    submitOnItemClick,
    disabled,
    className,
    primary,
    secondary,
  } = props

  const scope = useScopeAttributes()
  const ruled = kind === 'ruled'
  const showSubmit = !ruled && !hideSubmit

  const [innerQuery, setInnerQuery] = React.useState(defaultValue ?? '')
  const query = value !== undefined ? value : innerQuery
  const trimmed = query.trim()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!onSubmit) return
    event.preventDefault()
    onSubmit(query, event)
  }

  const boxClassName = ruled ? styles.rules : input({ butted: showSubmit ? 'end' : undefined })

  const renderRow = (suggestion: SearchSuggestion) => (
    <BaseAutocomplete.Item
      key={suggestion.value}
      value={suggestion}
      disabled={suggestion.disabled}
      className={styles.item}
      render={suggestion.href ? <a href={suggestion.href} /> : undefined}
    >
      {suggestion.icon ? <Icon name={suggestion.icon} className={styles.itemIcon} /> : null}
      <span className={styles.itemText}>
        <span>{highlightMatch(suggestion.label ?? suggestion.value, query, styles.match)}</span>
        {suggestion.secondaryName ? (
          <span className={styles.secondaryName}>{suggestion.secondaryName}</span>
        ) : null}
      </span>
    </BaseAutocomplete.Item>
  )

  const field = (
    <Field disabled={disabled}>
      {labelVisible ? <FieldLabel>{label}</FieldLabel> : null}
      <BaseAutocomplete.Root<SearchSuggestion>
        items={items as readonly SearchSuggestion[] | undefined}
        filter={filter}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => {
          setInnerQuery(next)
          onValueChange?.(next)
        }}
        itemToStringValue={(suggestion: SearchSuggestion) => suggestion.value}
        submitOnItemClick={submitOnItemClick}
        disabled={disabled}
        name={name}
      >
        <BaseAutocomplete.InputGroup {...scope} className={boxClassName}>
          {ruled ? (
            <svg className={styles.rulesEdge} aria-hidden="true" focusable="false">
              <line className={styles.rulesEdgeLine} x1="0" y1="0.5" x2="100%" y2="0.5" />
              <line
                className={styles.rulesEdgeLine}
                x1="0"
                y1="100%"
                x2="100%"
                y2="100%"
                transform="translate(0 -0.5)"
              />
            </svg>
          ) : null}
          <Icon name="search" className={styles.magnifier} />
          <BaseAutocomplete.Input
            className={inputParts.control}
            placeholder={placeholder}
            aria-label={labelVisible ? undefined : label}
          />
          <BaseAutocomplete.Clear
            render={
              <Button iconOnly size="sm" icon="close">
                Clear search
              </Button>
            }
          />
          {showSubmit ? (
            <span className={inputParts.actionSlot}>
              <Button
                type="submit"
                variant="solid"
                butted="start"
                iconOnly
                icon="arrow_forward"
                disabled={disabled}
                className={inputParts.actionIcon}
              >
                {submitLabel}
              </Button>
              {submitLabelled ? (
                <Button
                  type="submit"
                  variant="solid"
                  butted="start"
                  size="lg"
                  disabled={disabled}
                  className={inputParts.actionText}
                >
                  {submitLabel}
                </Button>
              ) : null}
            </span>
          ) : null}
          {ruled ? null : (
            <svg className={inputParts.edge} aria-hidden="true" focusable="false">
              <rect className={inputParts.edgeLine} width="100%" height="100%" />
            </svg>
          )}
        </BaseAutocomplete.InputGroup>
        <BaseAutocomplete.Portal>
          <BaseAutocomplete.Positioner
            className={styles.positioner}
            sideOffset={8}
            align="start"
            collisionPadding={16}
          >
            <BaseAutocomplete.Popup
              {...overlayAttributes}
              className={[styles.popup, overlayScaleClassName].join(' ')}
            >
              <OverlayScope>
                <BaseAutocomplete.Status className={styles.status}>
                  {loading ? 'Searching…' : status}
                </BaseAutocomplete.Status>
                <BaseAutocomplete.Empty className={styles.status}>
                  {loading || trimmed === '' ? null : emptyText(trimmed)}
                </BaseAutocomplete.Empty>
                <BaseAutocomplete.List className={styles.list}>
                  {items && isGroups(items)
                    ? items.map((group) => (
                        <BaseAutocomplete.Group
                          key={group.label}
                          items={group.items}
                          className={styles.group}
                        >
                          <BaseAutocomplete.GroupLabel className={styles.groupLabel}>
                            {group.label}
                          </BaseAutocomplete.GroupLabel>
                          <BaseAutocomplete.Collection>
                            {(suggestion: SearchSuggestion) => renderRow(suggestion)}
                          </BaseAutocomplete.Collection>
                        </BaseAutocomplete.Group>
                      ))
                    : (suggestion: SearchSuggestion) => renderRow(suggestion)}
                </BaseAutocomplete.List>
                {seeAllHref && trimmed !== '' ? (
                  <div className={styles.seeAll}>
                    <Link kind="standalone" href={seeAllHref(trimmed)}>
                      {seeAllText(trimmed)}
                    </Link>
                  </div>
                ) : null}
              </OverlayScope>
            </BaseAutocomplete.Popup>
          </BaseAutocomplete.Positioner>
        </BaseAutocomplete.Portal>
      </BaseAutocomplete.Root>
    </Field>
  )

  const form = (
    <form className={styles.form} action={action} onSubmit={handleSubmit}>
      {field}
    </form>
  )

  return (
    <search
      {...scope}
      aria-label={label}
      className={search({ kind, primary, secondary, className })}
    >
      {kind === 'docked' ? <div className={styles.bar}>{form}</div> : form}
    </search>
  )
}
