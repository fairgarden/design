'use client'

import * as React from 'react'
import { Combobox as BaseCombobox } from '@base-ui/react/combobox'
import { cva, type VariantProps } from 'class-variance-authority'

import { chip, chipParts } from '../../actions/chip'
import { dangerScale, useFieldInvalid } from '../field'
import { Ground } from '../../foundations/ground'
import { Icon, iconHost, type IconName } from '../../foundations/icon'
import { highlightMatch } from '../../utils/highlightMatch'
import { StatusGlyph } from '../../utils/StatusGlyph'
import { OverlayScope, overlayAttributes, overlayScaleClassName } from '../../utils/overlay'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './combobox.module.css'

/*
 * Combobox (§10.6): a value chosen from a filtered list (countries,
 * species, members), with optional multiple selection shown as chips.
 * Under about 15 options, use Select.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: combobox.module.css; CVA function `combobox`.
 * - Axes: `multiple` → multiple (the box wraps chips and grows); `plate` →
 *   plate; `primary`, `secondary` → scales module classes.
 * - Compound variants: none. Defaults: multiple false, plate false; color
 *   axes none.
 * - Color fallback: box and chips inherit the scope (chips take the
 *   Combobox's scales); while the Field is invalid, its danger scale
 *   (§10.2) [D129]. Popup: the `white` preset's defaults.
 * - States: box `:hover` (not disabled) → edge per [D140]; `data-focused` →
 *   the ring on any focus [D90]; `data-invalid` → error edge;
 *   `data-disabled` → dotted edge, --role-muted, clear hidden;
 *   `data-popup-open` → edge --primary12, chevron rotated. Item
 *   `data-highlighted` → --primary4 plus the start bar [D145];
 *   `data-selected` → leading ✓ plus --font-weight-6; `data-disabled` →
 *   --role-muted. Popup `data-starting-style` / `data-ending-style` → the
 *   clip reveal from `data-side` [D91].
 * - Parts: base (the box), input, icon, clear, trigger, chips (each a
 *   removable chip, the Chip module's parts through `chipParts` on Base
 *   UI's Chip and ChipRemove, plus `chip` for its keyboard ring, stack
 *   guard and print comma), popup, list, item,
 *   itemIndicator, group, groupLabel, empty, status, addRow; plus match.
 * - Scope: `popup` renders in its Base UI Portal and declares a nested
 *   `white` page scope, writes no `data-theme`, and takes the [D92] frame
 *   [D139, D156]. `plate` → the box is a nested `white` Ground.
 * - Container: none; inherits its context.
 */
export const combobox = cva(styles.base, {
  variants: {
    multiple: {
      true: styles.multiple,
    },
    plate: {
      true: styles.plate,
    },
    // Color axes: never defaulted [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    multiple: false,
    plate: false,
  },
})

type ComboboxVariants = VariantProps<typeof combobox>

/** A chosen value's chip: the Chip module's removable chip (§10.11), on Base UI's Chip. */
const chipClassName = chip({ removable: true })

/** One option: a string value and the words the list and the input show. */
export type ComboboxOption = {
  value: string
  label: string
  disabled?: boolean
}

/** A titled group of options. */
export type ComboboxOptionGroup = {
  /** The group label, in `type-label` caps. */
  label: string
  items: readonly ComboboxOption[]
}

type ComboboxItems = readonly ComboboxOption[] | readonly ComboboxOptionGroup[]

type ComboboxValue<Multiple extends boolean | undefined> = Multiple extends true
  ? ComboboxOption[]
  : ComboboxOption | null

type RootProps<Multiple extends boolean | undefined> = Omit<
  BaseCombobox.Root.Props<ComboboxOption, Multiple>,
  | 'items'
  | 'children'
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'itemToStringLabel'
  | 'itemToStringValue'
  | 'isItemEqualToValue'
>

/** Props for Combobox: Base UI Combobox.Root props plus the options, rows and color axes. */
export type ComboboxProps<Multiple extends boolean | undefined = false> = RootProps<Multiple> & {
  /** The options, or titled groups. Base UI filters them as the user types. */
  items: ComboboxItems
  /** `true` chooses several values, shown as removable chips in the box. Default `false`. */
  multiple?: Multiple
  /** The chosen option (or options), controlled. */
  value?: ComboboxValue<Multiple>
  /** The initial choice, uncontrolled. */
  defaultValue?: ComboboxValue<Multiple>
  onValueChange?: (
    value: ComboboxValue<Multiple>,
    eventDetails: BaseCombobox.Root.ChangeEventDetails,
  ) => void
  /** The input's placeholder, ending in "…"; never the label. */
  placeholder?: string
  /** A leading icon in the box, such as `search` (inline tier). */
  icon?: IconName
  /** The empty row. Default "No matches for '[query]'". Keep what the user typed. */
  emptyText?: (query: string) => React.ReactNode
  /** Shows the loading row ("Searching…") while suggestions load. */
  loading?: boolean
  /** The loading row's words. Default "Searching…". */
  loadingText?: React.ReactNode
  /**
   * A fetch failure, shown with the danger glyph instead of silently
   * closing: "Couldn't load suggestions. Keep typing or try again."
   */
  error?: React.ReactNode
  /**
   * Adds the creatable row "+ Add '[query]'" when nothing matches exactly
   * (flat lists only). Called with the query; add the option to `items`
   * and select it through `value`.
   */
  onCreate?: (query: string) => void
  /** The add row's words. Default "Add '[query]'". */
  createText?: (query: string) => React.ReactNode
  /** The clear ×'s accessible name. Default "Clear". */
  clearLabel?: string
  /** The chevron's accessible name. Default "Show options". */
  triggerLabel?: string
  /** A chip ×'s accessible name. Default "Remove [label]". */
  removeLabel?: (label: string) => string
  /** Names the input when no visible label exists. Prefer a `FieldLabel`. */
  'aria-label'?: string
  /** Class names for the box, added after the module's own. */
  className?: string
  /** The box face becomes a nested `white` scope; patterned grounds only (§10.1). */
  plate?: boolean
  /** Primary Radix scale: edge, value, icons, chips and focus ring. Never defaulted [D133]. */
  primary?: ComboboxVariants['primary']
  /** Secondary Radix scale. Unused at rest; the danger scale while invalid. */
  secondary?: ComboboxVariants['secondary']
}

const CREATE = '\u0000create:'

function isGroups(items: ComboboxItems): items is readonly ComboboxOptionGroup[] {
  return items.length > 0 && 'items' in items[0]
}

function isCreate(option: ComboboxOption | null | undefined): boolean {
  return option != null && option.value.startsWith(CREATE)
}

/**
 * A Base UI Combobox inside a `Field` (label it with
 * `<FieldLabel nativeLabel={false}>`). Focus stays in the input while the
 * arrow keys highlight rows; Backspace in an empty input focuses the last
 * chip, and a second Backspace removes it.
 */
export function Combobox<Multiple extends boolean | undefined = false>(
  props: ComboboxProps<Multiple>,
) {
  const {
    items,
    multiple,
    value,
    defaultValue,
    onValueChange,
    inputValue,
    defaultInputValue,
    onInputValueChange,
    placeholder,
    icon,
    emptyText = (query: string) => `No matches for '${query}'`,
    loading = false,
    loadingText = 'Searching…',
    error,
    onCreate,
    createText = (query: string) => `Add '${query}'`,
    clearLabel = 'Clear',
    triggerLabel = 'Show options',
    removeLabel = (label: string) => `Remove ${label}`,
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

  // The query, for match marking and the add row.
  const [innerQuery, setInnerQuery] = React.useState(String(defaultInputValue ?? ''))
  const query = inputValue !== undefined ? String(inputValue) : innerQuery

  // The value is held here so the creatable row never becomes the value.
  const [innerValue, setInnerValue] = React.useState<ComboboxOption | ComboboxOption[] | null>(
    () => (defaultValue ?? (multiple ? [] : null)) as ComboboxOption | ComboboxOption[] | null,
  )
  const currentValue = value !== undefined ? value : innerValue

  const trimmed = query.trim()
  const creatable =
    onCreate !== undefined &&
    trimmed !== '' &&
    !isGroups(items) &&
    !items.some((option) => option.label.trim().toLocaleLowerCase() === trimmed.toLocaleLowerCase())
  const viewItems: ComboboxItems = creatable
    ? [...(items as readonly ComboboxOption[]), { value: `${CREATE}${trimmed}`, label: trimmed }]
    : items

  const handleValueChange = (
    next: ComboboxOption | ComboboxOption[] | null,
    details: BaseCombobox.Root.ChangeEventDetails,
  ) => {
    const created = Array.isArray(next) ? next.find(isCreate) : isCreate(next) ? next : null
    if (created) {
      onCreate?.(created.label)
      return
    }
    setInnerValue(next)
    onValueChange?.(next as ComboboxValue<Multiple>, details)
  }

  const handleInputValueChange = (next: string, details: BaseCombobox.Root.ChangeEventDetails) => {
    setInnerQuery(next)
    onInputValueChange?.(next, details)
  }

  const boxClassName = combobox({
    multiple,
    plate,
    primary: plate ? undefined : primary,
    secondary: plate ? undefined : resolvedSecondary,
    className,
  })

  const inputNode = (
    <BaseCombobox.Input className={styles.input} placeholder={placeholder} aria-label={ariaLabel} />
  )

  const boxChildren = (
    <>
      {icon ? <Icon name={icon} className={styles.icon} /> : null}
      {multiple ? (
        <BaseCombobox.Chips className={styles.chips}>
          <BaseCombobox.Value>
            {(chosen: ComboboxOption[]) =>
              chosen.map((option) => (
                <BaseCombobox.Chip
                  key={option.value}
                  className={`${chipClassName} ${styles.chip}`}
                  aria-label={option.label}
                >
                  <span className={chipParts.label}>{option.label}</span>
                  <BaseCombobox.ChipRemove
                    className={`${chipParts.remove} ${iconHost}`}
                    aria-label={removeLabel(option.label)}
                  >
                    <Icon name="close" weight="interactive" />
                  </BaseCombobox.ChipRemove>
                  <svg className={chipParts.edge} aria-hidden="true" focusable="false">
                    <rect className={chipParts.edgeLine} width="100%" height="100%" />
                  </svg>
                </BaseCombobox.Chip>
              ))
            }
          </BaseCombobox.Value>
          {inputNode}
        </BaseCombobox.Chips>
      ) : (
        inputNode
      )}
      <BaseCombobox.Clear className={`${styles.clear} ${iconHost}`} aria-label={clearLabel}>
        <Icon name="close" weight="interactive" />
      </BaseCombobox.Clear>
      <BaseCombobox.Trigger className={`${styles.trigger} ${iconHost}`} aria-label={triggerLabel}>
        <Icon name="expand_more" weight="interactive" className={styles.chevron} />
      </BaseCombobox.Trigger>
      <svg className={styles.edge} aria-hidden="true" focusable="false">
        <rect className={styles.edgeLine} width="100%" height="100%" />
      </svg>
    </>
  )

  const renderOption = (option: ComboboxOption) =>
    isCreate(option) ? (
      <BaseCombobox.Item
        key={option.value}
        value={option}
        className={[styles.item, styles.addRow].join(' ')}
      >
        <Icon name="add" className={styles.addGlyph} />
        <span className={styles.itemText}>{createText(option.label)}</span>
      </BaseCombobox.Item>
    ) : (
      <BaseCombobox.Item
        key={option.value}
        value={option}
        disabled={option.disabled}
        className={styles.item}
      >
        <BaseCombobox.ItemIndicator className={styles.itemIndicator}>
          <Icon name="check" />
        </BaseCombobox.ItemIndicator>
        <span className={styles.itemText}>{highlightMatch(option.label, query, styles.match)}</span>
      </BaseCombobox.Item>
    )

  return (
    <BaseCombobox.Root<ComboboxOption, Multiple>
      {...(rootProps as RootProps<Multiple>)}
      multiple={multiple}
      items={viewItems}
      value={currentValue as BaseCombobox.Root.Props<ComboboxOption, Multiple>['value']}
      onValueChange={
        handleValueChange as BaseCombobox.Root.Props<ComboboxOption, Multiple>['onValueChange']
      }
      inputValue={inputValue}
      defaultInputValue={defaultInputValue}
      onInputValueChange={handleInputValueChange}
      itemToStringLabel={(option: ComboboxOption) => option.label}
      itemToStringValue={(option: ComboboxOption) => option.value}
      isItemEqualToValue={(option: ComboboxOption, chosen: ComboboxOption) =>
        option.value === chosen.value
      }
    >
      {plate ? (
        <BaseCombobox.InputGroup
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
        </BaseCombobox.InputGroup>
      ) : (
        <BaseCombobox.InputGroup {...scope} className={boxClassName}>
          {boxChildren}
        </BaseCombobox.InputGroup>
      )}
      <BaseCombobox.Portal>
        <BaseCombobox.Positioner className={styles.positioner} sideOffset={8} collisionPadding={16}>
          <BaseCombobox.Popup
            {...overlayAttributes}
            className={[styles.popup, overlayScaleClassName].join(' ')}
          >
            <OverlayScope>
              <ComboboxStatusRow loading={loading} loadingText={loadingText} error={error} />
              <BaseCombobox.Empty className={styles.empty}>
                {loading || error ? null : emptyText(query)}
              </BaseCombobox.Empty>
              <BaseCombobox.List className={styles.list}>
                {isGroups(viewItems)
                  ? viewItems.map((group, index) => (
                      <React.Fragment key={group.label}>
                        {index > 0 ? <BaseCombobox.Separator className={styles.separator} /> : null}
                        <BaseCombobox.Group items={group.items} className={styles.group}>
                          <BaseCombobox.GroupLabel className={styles.groupLabel}>
                            {group.label}
                          </BaseCombobox.GroupLabel>
                          <BaseCombobox.Collection>
                            {(option: ComboboxOption) => renderOption(option)}
                          </BaseCombobox.Collection>
                        </BaseCombobox.Group>
                      </React.Fragment>
                    ))
                  : (option: ComboboxOption) => renderOption(option)}
              </BaseCombobox.List>
            </OverlayScope>
          </BaseCombobox.Popup>
        </BaseCombobox.Positioner>
      </BaseCombobox.Portal>
    </BaseCombobox.Root>
  )
}

/**
 * The loading row ("Searching…", busy wording [D84]) and the fetch-failure
 * row, in a polite live region that stays mounted. The failure carries the
 * danger scale for its glyph.
 */
function ComboboxStatusRow({
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
    <BaseCombobox.Status className={styles.status}>
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
    </BaseCombobox.Status>
  )
}
