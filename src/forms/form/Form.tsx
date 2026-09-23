'use client'

import * as React from 'react'
import { Form as BaseForm } from '@base-ui/react/form'
import { cva, type VariantProps } from 'class-variance-authority'

import { Alert } from '../../feedback/alert'
import { Link } from '../../actions/link'
import { cx } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './form.module.css'

/*
 * Form (§10.2): anything submitted. Instant-apply settings are switches.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: form.module.css; CVA function `form`.
 * - Axes: `primary`, `secondary` → scales module classes (structure takes
 *   `primary` only; `secondary` is accepted unused).
 * - Compound variants: none. Defaults: color axes none.
 * - Color fallback: inherits the scope. The summary is an Alert whose
 *   secondary is the danger scale [D129].
 * - States: `aria-busy` (set from `busy`) → the form is inert, the submit
 *   reads "-ing…" at its rest width [D84].
 * - Parts: base, summary (an Alert, status danger; `summaryTitle`,
 *   `summaryList`), actions; `row` holds a short pair.
 * - Scope: none.
 * - Container: the root is the inline-size container `form`; short pairs
 *   share a row from 480 px, fieldset padding and the butted submit's
 *   stack guard read it below 360 px (§5.10.2) [D163].
 */
export const form = cva(styles.base, {
  variants: {
    // Color axes: never defaulted [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

type FormVariants = VariantProps<typeof form>

/** Props for Form: Base UI Form props plus `busy` and the color axes. */
export type FormProps<Values extends Record<string, unknown> = Record<string, unknown>> = Omit<
  BaseForm.Props<Values>,
  'className'
> & {
  /** Extra class names, added after the module's own. */
  className?: string
  /**
   * While the submission is pending: the form is `inert` and
   * `aria-busy`. Give the solid submit its "-ing…" label ("Sending…").
   */
  busy?: boolean
  /** Primary Radix scale: structure and inherited control roles. Never defaulted [D133]. */
  primary?: FormVariants['primary']
  /** Secondary Radix scale: accepted, unused. */
  secondary?: FormVariants['secondary']
}

/**
 * A Base UI Form, one column at `--size-sm`. Base UI validates on submit,
 * then re-validates failed fields as they change (§10.2 asks for blur;
 * pass `validationMode="onBlur"` to a Field that should wait for it).
 * Order: an optional `FormSummary`, fields and fieldsets, then
 * `FormActions`.
 */
export function Form<Values extends Record<string, unknown> = Record<string, unknown>>(
  props: FormProps<Values>,
) {
  const { busy, primary, secondary, className, ...rest } = props
  const scope = useScopeAttributes()

  return (
    <BaseForm<Values>
      {...rest}
      {...scope}
      aria-busy={busy || undefined}
      inert={busy || undefined}
      className={form({ primary, secondary, className })}
    />
  )
}

/** One failing field in the summary: the field's `id` and the message that links to it. */
export interface FormSummaryError {
  /** The `id` of the field's control; the link moves focus there. */
  id: string
  /** The field's error message, as at the field. */
  message: React.ReactNode
}

/** Props for FormSummary. */
export interface FormSummaryProps {
  /** The heading, in `type-subhead`: "Fix 2 fields to continue". */
  title: React.ReactNode
  /** The failing fields, each a link that moves focus to its control. */
  errors: readonly FormSummaryError[]
  /** Extra class names, added after the module's own. */
  className?: string
}

/**
 * The error summary at the top of the form (§10.2): the danger Alert with
 * a heading and a link to each failing field. Render it only while there
 * are errors; it takes focus when it appears.
 */
export function FormSummary(props: FormSummaryProps) {
  const { title, errors, className } = props
  const ref = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    ref.current?.focus()
  }, [])

  const focusField = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id)
    if (!target) return
    event.preventDefault()
    target.focus()
    target.scrollIntoView({ block: 'center' })
  }

  return (
    <Alert
      ref={ref}
      status="danger"
      tabIndex={-1}
      className={cx(styles.summary, className)}
    >
      <h2 className={styles.summaryTitle}>{title}</h2>
      <ul className={styles.summaryList}>
        {errors.map((error) => (
          <li key={error.id}>
            <Link href={`#${error.id}`} onClick={(event) => focusField(event, error.id)}>
              {error.message}
            </Link>
          </li>
        ))}
      </ul>
    </Alert>
  )
}

/** Props for FormRow: `div` props. */
export type FormRowProps = React.ComponentPropsWithRef<'div'>

/**
 * A short pair, such as city and postcode: a 2:1 row that stacks when both
 * fields do not fit, and always shares the row from 480 px of form width.
 */
export function FormRow(props: FormRowProps) {
  const { className, ...rest } = props
  return <div {...rest} className={cx(styles.row, className)} />
}

/** Props for FormActions: `div` props. */
export type FormActionsProps = React.ComponentPropsWithRef<'div'>

/**
 * The action row, `--size-px-5` below the last field. Author the solid
 * submit (`size="lg"`) last: it shows first and full width at base, and
 * last (rightmost) from `--md-n-above` [D106].
 */
export function FormActions(props: FormActionsProps) {
  const { className, ...rest } = props
  return <div {...rest} className={cx(styles.actions, className)} />
}
