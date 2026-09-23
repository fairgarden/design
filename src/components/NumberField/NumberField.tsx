'use client'

import * as React from 'react'
import { NumberField as BaseNumberField } from '@base-ui/react/number-field'
import { cva, type VariantProps } from 'class-variance-authority'

import { dangerScale, FieldLabel, useFieldInvalid } from '../Field'
import { Ground } from '../Ground'
import { Icon, iconHost } from '../Icon'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './number-field.module.css'

/*
 * Number Field (§10.4): quantities, amounts and measurements where
 * stepping helps. Codes that only look like numbers are Input.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: number-field.module.css; CVA function `numberField`.
 * - Axes: `kind` → stepper (−/+ cells butted to the input [D174]), amount
 *   (no steppers, type-itemhead value), readout (circular −/+ around a
 *   large mono value) [D155]; `plate` → plate; `primary`, `secondary`.
 * - Compound variants: none. Excluded in the types: `plate` with readout.
 * - Defaults: kind stepper, plate false; color axes none.
 * - Color fallback: inherits the scope; while the Field is invalid, its
 *   danger scale (§10.2) [D129].
 * - States: `:hover` (not disabled) → edge --role-rule → --primary12 [D140],
 *   step and readout glyphs at the next tier's weight (§10.1 icon states),
 *   the readout edge unchanged [D181];
 *   `data-focused` → the ring on any focus [D90]; `data-invalid` → error
 *   edge; `data-disabled` → dotted edges, --role-muted; `data-readonly` →
 *   box removed, bottom rule kept; `data-scrubbing` → none; step cell
 *   `data-disabled` (at min or max) → dotted cell edge, --role-muted glyph;
 *   step cell `:active` → the inverse pair [D84].
 * - Parts: base, group, decrement, input, increment, affix, scrub.
 * - Scope: `plate` → the group is a nested `white` Ground (a light island on
 *   fixed grounds); otherwise none.
 * - Container: none; inherits its context.
 */
export const numberField = cva(styles.base, {
  variants: {
    kind: {
      stepper: styles.stepper,
      amount: styles.amount,
      readout: styles.readout,
    },
    plate: {
      true: styles.plate,
    },
    // Color axes: never defaulted [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'stepper',
    plate: false,
  },
})

type NumberFieldVariants = VariantProps<typeof numberField>

type RootProps = Omit<BaseNumberField.Root.Props, 'className' | 'render' | 'children'>

interface NumberFieldOwnProps {
  /** Class names for the root, added after the module's own. */
  className?: string
  /** A prefix unit, in --role-muted ("$"). */
  prefix?: React.ReactNode
  /**
   * The unit, in --role-muted after the value with a no-break space
   * ("kg"); on the readout, the caption under the value. Show units on
   * screen and in print.
   */
  suffix?: React.ReactNode
  /**
   * A label rendered inside the root (a `FieldLabel`). Use it with `scrub`;
   * otherwise a `FieldLabel` beside the NumberField in its `Field` works.
   */
  label?: React.ReactNode
  /** Makes `label` a scrub area: drag it to change the value (fine pointers). */
  scrub?: boolean
  /** The input's placeholder, ending in "…". */
  placeholder?: string
  /** The decrement cell's accessible name. Default "Decrease" (Base UI). */
  decrementLabel?: string
  /** The increment cell's accessible name. Default "Increase" (Base UI). */
  incrementLabel?: string
  /**
   * Primary Radix scale: group edge, dividers, glyphs and value. Never
   * defaulted; omitted, it inherits the scope [D133].
   */
  primary?: NumberFieldVariants['primary']
  /** Secondary Radix scale. Unused at rest; the danger scale while invalid. */
  secondary?: NumberFieldVariants['secondary']
}

type KindProps =
  | {
      /**
       * `stepper` (default): square −/+ cells joined to the input. `amount`:
       * no steppers, the value in the display serif. `readout`: circular
       * −/+ buttons around a large mono value, for dashboards.
       */
      kind?: 'stepper' | 'amount'
      /** The group's face becomes a nested `white` scope; patterned grounds only (§10.1). */
      plate?: boolean
    }
  | { kind: 'readout'; plate?: false }

/** Props for NumberField: Base UI NumberField.Root props plus the kind, units and color axes. */
export type NumberFieldProps = RootProps & NumberFieldOwnProps & KindProps

/**
 * A Base UI NumberField inside a `Field`. At the minimum or maximum the
 * matching cell is disabled; out-of-range errors read "Enter 1–12" with an
 * en dash [D32]. Use steppers for up to about 20 steps and tabular figures
 * throughout.
 */
export function NumberField(props: NumberFieldProps) {
  const {
    kind,
    plate,
    prefix,
    suffix,
    label,
    scrub,
    placeholder,
    decrementLabel,
    incrementLabel,
    primary,
    secondary,
    className,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const invalid = useFieldInvalid()
  const resolvedSecondary = invalid ? dangerScale : secondary
  const resolvedKind = kind ?? 'stepper'
  const readout = resolvedKind === 'readout'
  const steppers = resolvedKind !== 'amount'

  const valueClass =
    resolvedKind === 'amount'
      ? styles.valueAmount
      : readout
        ? styles.valueReadout
        : styles.valueText
  const unitClass = readout ? styles.unitCaption : styles.unitText

  const labelNode =
    label == null ? null : scrub ? (
      <BaseNumberField.ScrubArea className={styles.scrub}>
        <FieldLabel nativeLabel={false}>{label}</FieldLabel>
      </BaseNumberField.ScrubArea>
    ) : (
      <FieldLabel>{label}</FieldLabel>
    )

  const cellEdge = (
    <svg className={styles.cellEdge} aria-hidden="true" focusable="false">
      {readout ? (
        <rect className={styles.cellEdgeLine} width="100%" height="100%" rx="50%" />
      ) : (
        <line className={styles.cellEdgeLine} x1="50%" y1="0" x2="50%" y2="100%" />
      )}
    </svg>
  )

  const groupChildren = (
    <>
      {steppers ? (
        <BaseNumberField.Decrement
          className={`${styles.decrement} ${iconHost}`}
          {...(decrementLabel ? { 'aria-label': decrementLabel } : null)}
        >
          <Icon name="remove" weight="interactive" />
          {cellEdge}
        </BaseNumberField.Decrement>
      ) : null}
      {prefix != null && !readout ? (
        <span className={[styles.affix, unitClass].join(' ')}>
          {prefix}
          {'\u00a0'}
        </span>
      ) : null}
      <BaseNumberField.Input
        className={[styles.input, valueClass].join(' ')}
        placeholder={placeholder}
      />
      {suffix != null ? (
        <span className={[styles.affix, unitClass].join(' ')}>
          {readout ? null : '\u00a0'}
          {suffix}
        </span>
      ) : null}
      {steppers ? (
        <BaseNumberField.Increment
          className={`${styles.increment} ${iconHost}`}
          {...(incrementLabel ? { 'aria-label': incrementLabel } : null)}
        >
          <Icon name="add" weight="interactive" />
          {cellEdge}
        </BaseNumberField.Increment>
      ) : null}
      {readout ? null : (
        <svg className={styles.edge} aria-hidden="true" focusable="false">
          <rect className={styles.edgeLine} width="100%" height="100%" />
        </svg>
      )}
    </>
  )

  return (
    <BaseNumberField.Root
      {...rest}
      {...scope}
      className={numberField({
        kind,
        plate,
        primary: plate ? undefined : primary,
        secondary: plate ? undefined : resolvedSecondary,
        className,
      })}
    >
      {labelNode}
      {plate && !readout ? (
        <BaseNumberField.Group
          className={styles.group}
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
          {groupChildren}
        </BaseNumberField.Group>
      ) : (
        <BaseNumberField.Group className={styles.group}>{groupChildren}</BaseNumberField.Group>
      )}
    </BaseNumberField.Root>
  )
}
