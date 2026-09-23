'use client'

import * as React from 'react'
import { Select as BaseSelect } from '@base-ui/react/select'
import { cva, type VariantProps } from 'class-variance-authority'

import { dangerScale, useFieldInvalid } from '../field'
import { Ground } from '../../foundations/ground'
import { Icon, iconHost } from '../../foundations/icon'
import { cx } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import { OverlayScope, overlayAttributes, overlayScaleClassName } from '../../utils/overlay'
import styles from './select.module.css'

/*
 * Select (§10.5): one choice from a known list of about 5–15 options.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: select.module.css; CVA function `select`.
 * - Axes: `variant` → outline (boxed trigger), underline (trigger text over
 *   a --border-size-2 --role-accent underline, LTA); `plate` → plate;
 *   `primary`, `secondary` → scales module classes.
 * - Compound variants: none. Excluded in the types: `plate` with underline.
 * - Defaults: variant outline, plate false; color axes none.
 * - Color fallback: trigger inherits the scope; while the Field is invalid,
 *   its danger scale (§10.2). Popup: the `white` preset's defaults; only
 *   props passed to the popup would apply inside it (§10.1).
 * - States: trigger `:hover` (not disabled) → boxed edge → --primary12
 *   [D140], underline --role-accent → --primary12 at the same weight
 *   [D181]; `data-popup-open` → boxed edge
 *   --primary12, underline --ds-stroke-3, chevron rotated; `:focus-visible`
 *   → ring; `data-disabled` → dotted edge, --role-muted; `data-invalid` →
 *   error edge or danger underline. Item `data-highlighted` → --primary4
 *   plus the --ds-stroke-3 start bar [D145]; `data-selected` → leading ✓
 *   plus --font-weight-6; `data-disabled` → --role-muted, never
 *   highlighted. Popup `data-starting-style` / `data-ending-style` → the
 *   clip reveal from `data-side` [D91].
 * - Parts: base (the trigger), value, icon, swatch, popup, list, item,
 *   itemText, itemIndicator, group, groupLabel, separator.
 * - Scope: `popup` renders in its Base UI Portal and declares a nested
 *   `white` page scope; it writes no `data-theme`, and its edge is the
 *   [D92] overlay frame [D139, D156]. `plate` → the trigger is a nested
 *   `white` Ground.
 * - Container: none; inherits its context.
 */
export const select = cva(styles.base, {
  variants: {
    variant: {
      outline: styles.outline,
      underline: styles.underline,
    },
    plate: {
      true: styles.plate,
    },
    // Color axes: never defaulted [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    variant: 'outline',
    plate: false,
  },
})

type SelectVariants = VariantProps<typeof select>

/** One option: its value, its label (the words the trigger shows) and an optional swatch. */
export type SelectOption<Value = string> = {
  value: Value
  /** The option's words; with a swatch they name the color. */
  label: string
  /**
   * The product's color, supplied as data like a photograph (a CSS color
   * string); drawn as a ringed disc before the label. Always name the color
   * in `label`.
   */
  swatch?: string
  disabled?: boolean
}

/** A titled group of options; groups are divided by the popup's separator. */
export type SelectOptionGroup<Value = string> = {
  /** The group label, set in `type-label` caps. */
  label: string
  items: readonly SelectOption<Value>[]
}

type SelectItems<Value> = readonly SelectOption<Value>[] | readonly SelectOptionGroup<Value>[]

function isGroups<Value>(items: SelectItems<Value>): items is readonly SelectOptionGroup<Value>[] {
  return items.length > 0 && 'items' in items[0]
}

function flatten<Value>(items: SelectItems<Value> | undefined): readonly SelectOption<Value>[] {
  if (!items) return []
  return isGroups(items) ? items.flatMap((group) => group.items) : items
}

type RootProps<Value> = Omit<BaseSelect.Root.Props<Value, false>, 'items' | 'children' | 'multiple'>

/** Props for Select: Base UI Select.Root props plus the options, variant and color axes. */
export type SelectProps<Value = string> = RootProps<Value> & {
  /**
   * The options (or titled groups). Rendered as items unless `children`
   * are given; always used to show the chosen option's label.
   */
  items?: SelectItems<Value>
  /** Custom list content (`SelectItem`, `SelectGroup`, `SelectSeparator`) instead of `items`. */
  children?: React.ReactNode
  /** Shown in --role-muted while nothing is chosen; end it with "…". */
  placeholder?: string
  /** Class names for the trigger (the root part), added after the module's own. */
  className?: string
  /** Names the trigger when no visible label exists. Prefer a `FieldLabel`. */
  'aria-label'?: string
  /**
   * Primary Radix scale: trigger edge, value, chevron and focus ring. Never
   * defaulted; omitted, it inherits the scope [D133].
   */
  primary?: SelectVariants['primary']
  /**
   * Secondary Radix scale: the underline variant's underline; the danger
   * scale while invalid.
   */
  secondary?: SelectVariants['secondary']
} & (
    | {
        /**
         * `outline` (default) is the boxed field; `underline` is the trigger
         * over a --role-accent underline that hugs its content.
         */
        variant?: 'outline'
        /** The trigger's face becomes a nested `white` scope; patterned grounds only (§10.1). */
        plate?: boolean
      }
    | { variant: 'underline'; plate?: false }
  )

/** The ringed disc of a swatch option; the color is content, not a role. */
function Swatch({ color }: { color: string }) {
  return (
    <svg className={styles.swatch} viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <circle className={styles.swatchRing} cx="6" cy="6" r="5.5" fill={color} />
    </svg>
  )
}

/**
 * A Base UI Select inside a `Field` (label it with
 * `<FieldLabel nativeLabel={false}>`). The popup opens below the trigger,
 * never on hover, and is never a sheet; use Combobox for long or
 * searchable lists and Radio for 2–4 visible options.
 */
export function Select<Value = string>(props: SelectProps<Value>) {
  const {
    items,
    children,
    placeholder,
    variant,
    plate,
    primary,
    secondary,
    className,
    'aria-label': ariaLabel,
    ...rootProps
  } = props

  const scope = useScopeAttributes()
  const invalid = useFieldInvalid()
  const resolvedSecondary = invalid ? dangerScale : secondary
  const options = flatten(items)
  const hasSwatch = options.some((option) => option.swatch)

  const triggerClassName = select({
    variant,
    plate,
    primary: plate ? undefined : primary,
    secondary: plate ? undefined : resolvedSecondary,
    // The trigger hosts the chevron's hover weight (§10.1 icon states).
    className: className ? `${iconHost} ${className}` : iconHost,
  })

  const renderValue = hasSwatch
    ? (value: Value | null) => {
        const option = options.find((candidate) => Object.is(candidate.value, value))
        if (!option) return placeholder ?? null
        return (
          <>
            {option.swatch ? <Swatch color={option.swatch} /> : null}
            {option.label}
          </>
        )
      }
    : undefined

  return (
    <BaseSelect.Root<Value, false> {...rootProps} items={items}>
      <BaseSelect.Trigger
        {...(plate ? null : scope)}
        aria-label={ariaLabel}
        className={triggerClassName}
        render={
          plate ? (
            <Ground
              preset="white"
              kind="face"
              primary={primary ?? undefined}
              secondary={resolvedSecondary ?? undefined}
              render={<button type="button" />}
            />
          ) : undefined
        }
      >
        <BaseSelect.Value className={styles.value} placeholder={placeholder}>
          {renderValue}
        </BaseSelect.Value>
        <BaseSelect.Icon className={styles.icon}>
          <Icon name="expand_more" weight="interactive" />
        </BaseSelect.Icon>
        <svg className={styles.edge} aria-hidden="true" focusable="false">
          {variant === 'underline' ? (
            <line className={styles.edgeLine} x1="0" y1="100%" x2="100%" y2="100%" />
          ) : (
            <rect className={styles.edgeLine} width="100%" height="100%" />
          )}
        </svg>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner
          className={styles.positioner}
          alignItemWithTrigger={false}
          side="bottom"
          align={variant === 'underline' ? 'end' : 'start'}
          sideOffset={8}
          collisionPadding={16}
        >
          <BaseSelect.Popup
            {...overlayAttributes}
            className={[styles.popup, overlayScaleClassName].join(' ')}
          >
            <OverlayScope>
              <BaseSelect.List className={styles.list}>
                {children ?? (items ? renderItems(items) : null)}
              </BaseSelect.List>
            </OverlayScope>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  )
}

function renderOption<Value>(option: SelectOption<Value>, index: number) {
  return (
    <SelectItem
      key={`${String(option.value)}-${index}`}
      value={option.value}
      label={option.label}
      disabled={option.disabled}
      swatch={option.swatch}
    >
      {option.label}
    </SelectItem>
  )
}

function renderItems<Value>(items: SelectItems<Value>) {
  if (!isGroups(items)) return items.map(renderOption)
  return items.map((group, index) => (
    <React.Fragment key={group.label}>
      {index > 0 ? <SelectSeparator /> : null}
      <SelectGroup label={group.label}>{group.items.map(renderOption)}</SelectGroup>
    </React.Fragment>
  ))
}

/** Props for SelectItem: Base UI Select.Item props plus an optional swatch. */
export type SelectItemProps = Omit<BaseSelect.Item.Props, 'className'> & {
  /** Extra class names, added after the module's own. */
  className?: string
  /** The product's color (content) as a ringed disc before the label. */
  swatch?: string
}

/**
 * One option: a `--ds-size-hit` row. Highlighted rows take the `--primary4`
 * soft fill and the `--ds-stroke-3` start bar; the chosen row a leading ✓
 * and `--font-weight-6` [D145].
 */
export function SelectItem(props: SelectItemProps) {
  const { className, swatch, children, ...rest } = props
  return (
    <BaseSelect.Item {...rest} className={cx(styles.item, className)}>
      <BaseSelect.ItemIndicator className={styles.itemIndicator}>
        <Icon name="check" />
      </BaseSelect.ItemIndicator>
      <BaseSelect.ItemText className={styles.itemText}>
        {swatch ? (
          <span className={styles.value}>
            <Swatch color={swatch} />
            {children}
          </span>
        ) : (
          children
        )}
      </BaseSelect.ItemText>
    </BaseSelect.Item>
  )
}

/** Props for SelectGroup: Base UI Select.Group props plus its label. */
export type SelectGroupProps = Omit<BaseSelect.Group.Props, 'className'> & {
  /** The group label, in `type-label` caps and --role-muted. */
  label: React.ReactNode
  className?: string
}

/** A titled group of items. */
export function SelectGroup(props: SelectGroupProps) {
  const { label, className, children, ...rest } = props
  return (
    <BaseSelect.Group {...rest} className={cx(styles.group, className)}>
      <BaseSelect.GroupLabel className={styles.groupLabel}>{label}</BaseSelect.GroupLabel>
      {children}
    </BaseSelect.Group>
  )
}

/** Props for SelectSeparator: Base UI Select.Separator props. */
export type SelectSeparatorProps = Omit<BaseSelect.Separator.Props, 'className'> & {
  className?: string
}

/** The one popup group separator: `--border-size-1` in `--role-rule`. */
export function SelectSeparator(props: SelectSeparatorProps) {
  const { className, ...rest } = props
  return (
    <BaseSelect.Separator
      {...rest}
      className={cx(styles.separator, className)}
    />
  )
}
