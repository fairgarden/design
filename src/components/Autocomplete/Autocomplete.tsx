'use client'

import * as React from 'react'
import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete'
import { cva, type VariantProps } from 'class-variance-authority'

import { dangerScale, useFieldInvalid } from '../Field'
import { Ground } from '../Ground'
import { Icon, iconHost, type IconName } from '../Icon'
import { highlightMatch } from '../../utils/highlightMatch'
import { StatusGlyph } from '../../utils/StatusGlyph'
import { OverlayScope, overlayAttributes, overlayScaleClassName } from '../../utils/overlay'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './autocomplete.module.css'

/*
 * Autocomplete (§10.6): free text with suggestions (addresses); any value
 * is valid. Site and collection search compose it in Search (§9.10).
 *
 * Implementation (CSS Modules + CVA)
 * - Module: autocomplete.module.css; CVA function `autocomplete`.
 * - Axes: `plate` → plate; `primary`, `secondary` → scales module classes.
 * - Compound variants: none. Defaults: plate false; color axes none.
 * - Color fallback: the box inherits the scope; while the Field is invalid,
 *   its danger scale (§10.2) [D129]. Popup: the `white` preset's defaults.
 * - States: box `:hover` (not disabled) → edge per [D140]; `data-focused` →
 *   the ring on any focus [D90]; `data-invalid` → error edge;
 *   `data-disabled` → dotted edge, --role-muted, clear hidden;
 *   `data-popup-open` → edge --primary12, chevron rotated. Item
 *   `data-highlighted` → --primary4 plus the start bar [D145];
 *   `data-disabled` → --role-muted. No ✓: nothing stays selected. Popup
 *   `data-starting-style` / `data-ending-style` → the clip reveal [D91].
 * - Parts: base (the box), input, icon, clear, trigger, popup, list, item,
 *   group, groupLabel, empty, status; plus match.
 * - Scope: `popup` renders in its Base UI Portal and declares a nested
 *   `white` page scope, writes no `data-theme`, and takes the [D92] frame
 *   [D139, D156]. `plate` → the box is a nested `white` Ground.
 * - Container: none; inherits its context.
 */
export const autocomplete = cva(styles.base, {
  variants: {
    plate: {
      true: styles.plate,
    },
    // Color axes: never defaulted [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    plate: false,
  },
})

type AutocompleteVariants = VariantProps<typeof autocomplete>

/** One suggestion: the text it puts in the input, and optional display words. */
export type AutocompleteOption = {
  /** The text the suggestion fills in. */
  value: string
  /** The words shown in the list. Default: `value`. */
  label?: string
  disabled?: boolean
}

/** A titled group of suggestions. */
export type AutocompleteOptionGroup = {
  /** The group label, in `type-label` caps. */
  label: string
  items: readonly AutocompleteOption[]
}

type AutocompleteItems = readonly AutocompleteOption[] | readonly AutocompleteOptionGroup[]

function isGroups(items: AutocompleteItems): items is readonly AutocompleteOptionGroup[] {
  return items.length > 0 && 'items' in items[0]
}

type RootProps = Omit<
  BaseAutocomplete.Root.Props<AutocompleteOption>,
  'items' | 'children' | 'itemToStringValue'
>

/** Props for Autocomplete: Base UI Autocomplete.Root props plus the suggestions, rows and color axes. */
export type AutocompleteProps = RootProps & {
  /** The suggestions, or titled groups. Pass `filter={null}` when the server filters them. */
  items?: AutocompleteItems
  /** The input's placeholder, ending in "…"; never the label. */
  placeholder?: string
  /** A leading icon in the box, such as `search` (inline tier). */
  icon?: IconName
  /** Shows the chevron that opens the full list. Default `false`. */
  showTrigger?: boolean
  /** The empty row. Default "No matches for '[query]'". Keep what the user typed. */
  emptyText?: (query: string) => React.ReactNode
  /** Shows the loading row ("Searching…") while suggestions load. */
  loading?: boolean
  /** The loading row's words. Default "Searching…". */
  loadingText?: React.ReactNode
  /** A fetch failure, shown with the danger glyph instead of silently closing. */
  error?: React.ReactNode
  /** The clear ×'s accessible name. Default "Clear". */
  clearLabel?: string
  /** The chevron's accessible name. Default "Show suggestions". */
  triggerLabel?: string
  /** Names the input when no visible label exists. Prefer a `FieldLabel`. */
  'aria-label'?: string
  /** Class names for the box, added after the module's own. */
  className?: string
  /** The box face becomes a nested `white` scope; patterned grounds only (§10.1). */
  plate?: boolean
  /** Primary Radix scale: edge, value, icons and focus ring. Never defaulted [D133]. */
  primary?: AutocompleteVariants['primary']
  /** Secondary Radix scale. Unused at rest; the danger scale while invalid. */
  secondary?: AutocompleteVariants['secondary']
}

/**
 * A Base UI Autocomplete inside a `Field`. The input keeps any text: a
 * suggestion only fills it, and Enter submits the typed text. No row is
 * highlighted until the arrow keys move.
 */
export function Autocomplete(props: AutocompleteProps) {
  const {
    items,
    value,
    defaultValue,
    onValueChange,
    placeholder,
    icon,
    showTrigger = false,
    emptyText = (query: string) => `No matches for '${query}'`,
    loading = false,
    loadingText = 'Searching…',
    error,
    clearLabel = 'Clear',
    triggerLabel = 'Show suggestions',
    'aria-label': ariaLabel,
    className,
    plate,
    primary,
    secondary,
    ...rootProps
  } = props

  const scope = useScopeAttributes()
  const invalid = useFieldInvalid()
  const resolvedSecondary = invalid ? dangerScale : secondary

  // The typed text, for match marking.
  const [innerQuery, setInnerQuery] = React.useState(String(defaultValue ?? ''))
  const query = value !== undefined ? String(value) : innerQuery
  const handleValueChange: RootProps['onValueChange'] = (next, details) => {
    setInnerQuery(next)
    onValueChange?.(next, details)
  }

  const boxClassName = autocomplete({
    plate,
    primary: plate ? undefined : primary,
    secondary: plate ? undefined : resolvedSecondary,
    className,
  })

  const boxChildren = (
    <>
      <svg className={styles.edge} aria-hidden="true" focusable="false">
        <rect className={styles.edgeLine} width="100%" height="100%" />
      </svg>
      {icon ? <Icon name={icon} className={styles.icon} /> : null}
      <BaseAutocomplete.Input
        className={styles.input}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
      {/* The cells host their glyph's hover and press weight (§10.1 icon states) [D181]. */}
      <BaseAutocomplete.Clear className={`${styles.clear} ${iconHost}`} aria-label={clearLabel}>
        <Icon name="close" weight="interactive" />
      </BaseAutocomplete.Clear>
      {showTrigger ? (
        <BaseAutocomplete.Trigger
          className={`${styles.trigger} ${iconHost}`}
          aria-label={triggerLabel}
        >
          <Icon name="expand_more" weight="interactive" className={styles.chevron} />
        </BaseAutocomplete.Trigger>
      ) : null}
    </>
  )

  const renderOption = (option: AutocompleteOption) => (
    <BaseAutocomplete.Item
      key={option.value}
      value={option}
      disabled={option.disabled}
      className={styles.item}
    >
      <span className={styles.itemText}>
        {highlightMatch(option.label ?? option.value, query, styles.match)}
      </span>
    </BaseAutocomplete.Item>
  )

  return (
    <BaseAutocomplete.Root<AutocompleteOption>
      {...rootProps}
      // Groups are accepted at runtime; the flat overload types the value.
      items={items as readonly AutocompleteOption[] | undefined}
      value={value}
      defaultValue={defaultValue}
      onValueChange={handleValueChange}
      itemToStringValue={(option: AutocompleteOption) => option.value}
    >
      {plate ? (
        <BaseAutocomplete.InputGroup
          className={boxClassName}
          render={
            <Ground
              preset="white"
              kind="face"
              primary={primary ?? undefined}
              secondary={resolvedSecondary ?? undefined}
              render={<div />}
            />
          }
        >
          {boxChildren}
        </BaseAutocomplete.InputGroup>
      ) : (
        <BaseAutocomplete.InputGroup {...scope} className={boxClassName}>
          {boxChildren}
        </BaseAutocomplete.InputGroup>
      )}
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
              <AutocompleteStatusRow loading={loading} loadingText={loadingText} error={error} />
              <BaseAutocomplete.Empty className={styles.empty}>
                {loading || error ? null : emptyText(query)}
              </BaseAutocomplete.Empty>
              <BaseAutocomplete.List className={styles.list}>
                {items && isGroups(items)
                  ? items.map((group, index) => (
                      <React.Fragment key={group.label}>
                        {index > 0 ? (
                          <BaseAutocomplete.Separator className={styles.separator} />
                        ) : null}
                        <BaseAutocomplete.Group items={group.items} className={styles.group}>
                          <BaseAutocomplete.GroupLabel className={styles.groupLabel}>
                            {group.label}
                          </BaseAutocomplete.GroupLabel>
                          <BaseAutocomplete.Collection>
                            {(option: AutocompleteOption) => renderOption(option)}
                          </BaseAutocomplete.Collection>
                        </BaseAutocomplete.Group>
                      </React.Fragment>
                    ))
                  : (option: AutocompleteOption) => renderOption(option)}
              </BaseAutocomplete.List>
            </OverlayScope>
          </BaseAutocomplete.Popup>
        </BaseAutocomplete.Positioner>
      </BaseAutocomplete.Portal>
    </BaseAutocomplete.Root>
  )
}

/**
 * The loading row ("Searching…", busy wording [D84]) and the fetch-failure
 * row, in a polite live region that stays mounted.
 */
function AutocompleteStatusRow({
  loading,
  loadingText,
  error,
}: {
  loading: boolean
  loadingText: React.ReactNode
  error: React.ReactNode
}) {
  const scope = useScopeAttributes()
  return (
    <BaseAutocomplete.Status className={styles.status}>
      {loading ? (
        loadingText
      ) : error ? (
        <span
          {...scope}
          className={[styles.statusError, secondaryScaleVariants[dangerScale]].join(' ')}
        >
          <StatusGlyph status="danger" className={styles.statusGlyph} />
          <span>{error}</span>
        </span>
      ) : null}
    </BaseAutocomplete.Status>
  )
}
