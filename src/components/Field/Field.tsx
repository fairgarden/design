'use client'

import * as React from 'react'
import { Field as BaseField } from '@base-ui/react/field'
import { cva, type VariantProps } from 'class-variance-authority'

import { resolveClassName, cx } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import { StatusGlyph, statusScales } from '../../utils/StatusGlyph'
import styles from './field.module.css'

/*
 * Field (§10.2): wires a control's label, description and error.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: field.module.css; CVA functions `field` (root) and `fieldError`
 *   (the error part, which carries the computed danger scale).
 * - Axes: `primary`, `secondary` → scales module classes.
 * - Compound variants: none. Defaults: color axes none.
 * - Color fallback: inherits the scope. While Base UI reports the field
 *   invalid, the Field computes the danger scale and passes it as the
 *   `secondary` of its error part and, through context, of its text-entry
 *   or select control (§10.1) [D129]. It is never set on the root, so value
 *   controls (Checkbox, Radio, Switch) keep their own secondary.
 * - States: `data-invalid` → the §10.1 error state (the control draws the
 *   edge, the error part the glyph and message); `data-disabled` → label
 *   `--role-muted`; `data-valid`, `data-touched`, `data-dirty` → none;
 *   `data-focused` → none here (the control draws the ring).
 * - Parts: base, label, optional, description, error, errorGlyph.
 * - Scope: none. Container: none; the Form root is the container.
 */
export const field = cva(styles.base, {
  variants: {
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

/** The error part's own function: it takes a secondary the root does not (§1.11.3). */
const fieldError = cva(styles.error, {
  variants: {
    secondary: secondaryScaleVariants,
  },
})

/** The §1.5.4 danger scale, passed as `secondary` while a field is invalid [D129]. */
export const dangerScale = statusScales.danger

const FieldInvalidContext = React.createContext(false)
FieldInvalidContext.displayName = 'FieldInvalidContext'

/**
 * True while the nearest Field is invalid. Text-entry and select controls
 * read it to take the danger scale as their `secondary` (§10.1) [D129].
 */
export function useFieldInvalid(): boolean {
  return React.useContext(FieldInvalidContext)
}

type FieldVariants = VariantProps<typeof field>

/** Props for Field: Base UI Field.Root props plus the color axes. */
export type FieldProps = BaseField.Root.Props & {
  /**
   * Primary Radix scale: the label, description and, by inheritance, the
   * control's edge, value and focus ring. Never defaulted [D133].
   */
  primary?: FieldVariants['primary']
  /**
   * Secondary Radix scale. Unused at rest; while the field is invalid the
   * danger scale replaces it on the error and the control (§10.1).
   */
  secondary?: FieldVariants['secondary']
}

/**
 * A Base UI Field.Root: the stack of label, control, description and error.
 * Validation follows §10.2: validate on submit, then on blur for a field
 * that has already failed (`validationMode` on the Form).
 */
export function Field(props: FieldProps) {
  const { primary, secondary, className, children, ...rest } = props
  const scope = useScopeAttributes()

  return (
    <BaseField.Root
      {...rest}
      {...scope}
      className={resolveClassName(className, (extra) =>
        field({ primary, secondary, className: extra }),
      )}
    >
      <BaseField.Validity>
        {(validity) => (
          <FieldInvalidContext.Provider value={validity.validity.valid === false}>
            {children}
          </FieldInvalidContext.Provider>
        )}
      </BaseField.Validity>
    </BaseField.Root>
  )
}

/** Props for FieldLabel: Base UI Field.Label props plus the "(optional)" marker. */
export type FieldLabelProps = BaseField.Label.Props & {
  /**
   * Appends the marker inside the label (§10.1): `true` writes
   * "(optional)"; a string writes that marker instead, such as
   * "(required)" where most fields are optional. Never an asterisk alone.
   */
  optional?: boolean | string
}

/**
 * The field label: `type-field-label` in `--primary12`, authored in title
 * case up to about four words, sentence case for longer or question labels
 * [D160]. For a Select or Combobox trigger pass `nativeLabel={false}`: the
 * label then renders a `div` that focuses the control without opening it.
 */
export function FieldLabel(props: FieldLabelProps) {
  const { optional, className, children, nativeLabel, render, ...rest } = props
  const marker = optional === true ? '(optional)' : optional || null

  return (
    <BaseField.Label
      {...rest}
      nativeLabel={nativeLabel}
      render={render ?? (nativeLabel === false ? <div /> : undefined)}
      className={resolveClassName(className, (extra) => cx(styles.label, extra))}
    >
      {children}
      {marker ? (
        <>
          {' '}
          <span className={styles.optional}>{marker}</span>
        </>
      ) : null}
    </BaseField.Label>
  )
}

/** Props for FieldDescription: Base UI Field.Description props. */
export type FieldDescriptionProps = BaseField.Description.Props

/**
 * Helper text: `type-caption` in `--role-muted`, `--size-px-1` below the
 * box; sentence case. Base UI links it to the control with
 * `aria-describedby`.
 */
export function FieldDescription(props: FieldDescriptionProps) {
  const { className, ...rest } = props
  return (
    <BaseField.Description
      {...rest}
      className={resolveClassName(className, (extra) => cx(styles.description, extra))}
    />
  )
}

/** Props for FieldError: Base UI Field.Error props, without `render`. */
export type FieldErrorProps = Omit<BaseField.Error.Props, 'render'>

/**
 * The error message, shown by Base UI while the field is invalid (or for
 * the `match` it names): the danger glyph in `--role-status`, then the
 * message in `type-caption` at `--font-weight-6` in `--primary12`. Word it
 * as what happened plus how to fix it (§1.9.2). Without children it shows
 * the browser's validation message.
 */
export function FieldError(props: FieldErrorProps) {
  const { className, ...rest } = props
  const scope = useScopeAttributes()

  return (
    <BaseField.Error
      {...rest}
      {...scope}
      className={resolveClassName(className, (extra) =>
        fieldError({ secondary: dangerScale, className: extra }),
      )}
      render={(elementProps) => (
        <div {...elementProps}>
          <StatusGlyph status="danger" className={styles.errorGlyph} />
          <span>{elementProps.children}</span>
        </div>
      )}
    />
  )
}
