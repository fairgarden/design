'use client'

import * as React from 'react'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import { cva, type VariantProps } from 'class-variance-authority'

import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import { StatusGlyph, statusLabels, statusScales, type Status } from '../../utils/StatusGlyph'
import styles from './alert.module.css'

/*
 * Alert: the inline status block (§10.20, owner per [D110]).
 *
 * Implementation (CSS Modules + CVA)
 * - Module: alert.module.css; CVA function `alert`.
 * - Axes: `status` → info | success | warning | danger (selects the glyph,
 *   the default role and the computed secondary; it carries no class);
 *   `primary`, `secondary` → scales module classes.
 * - Compound variants: none. Defaults: none; color axes none.
 * - Color fallback: secondary = the explicit prop, else the status scale
 *   (info indigo, success green, warning amber, danger red) [D129].
 * - States: none (loading → loaded → failed swaps what renders).
 * - Parts: base (its inline-start border is the bar), glyph, lead, message,
 *   action.
 * - Scope: none. Container: none; inherits its context.
 */
const alert = cva(styles.base, {
  variants: {
    // Color axes: never defaulted [D133]; the component computes secondary from status.
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

export type AlertStatus = Status

/** Props for Alert: `div` props (without `title`), `render`, the status, lead, action and color axes. */
export type AlertProps = Omit<useRender.ComponentProps<'div'>, 'title'> &
  VariantProps<typeof alert> & {
    /**
     * Required by §10.20 (no default). Optional in the type only so a bare
     * `<Alert />` compiles; without it nothing renders.
     */
    status?: AlertStatus
    /** The `type-runin` word lead, e.g. "Couldn't load." It runs into the message. */
    title?: React.ReactNode
    /** An optional action, normally a Retry Button (`variant="outline"`, `size="md"`). */
    action?: React.ReactNode
    /** The glyph's accessible name; defaults to the English status word. */
    statusLabel?: string
  }

/**
 * The inline status block: start bar, status glyph (custom §1.5.4 shape with
 * its inner mark), word lead, message and optional action, on the page
 * ground with no fill.
 *
 * `role` defaults to `status` (polite) and to `alert` for danger (§10.20);
 * pass `role="status"` for a danger notice that does not block the task.
 *
 * Renders nothing when `status` is missing, or when there is neither a
 * `title` nor children: a status block needs a status and words (§1.5.4,
 * §10.20), and an empty live region must not be announced.
 */
export function Alert(props: AlertProps) {
  const {
    render,
    ref,
    className,
    status,
    title,
    action,
    statusLabel,
    primary,
    secondary,
    children,
    ...rest
  } = props

  const scopeAttributes = useScopeAttributes()

  const hasTitle = hasContent(title)
  const hasMessage = hasContent(children)
  const enabled = status !== undefined && (hasTitle || hasMessage)

  const content = status ? (
    <>
      <StatusGlyph
        status={status}
        label={statusLabel ?? statusLabels[status]}
        className={styles.glyph}
      />
      <div className={styles.message}>
        {hasTitle ? <strong className={styles.lead}>{title}</strong> : null}
        {hasTitle && hasMessage ? ' ' : null}
        {children}
      </div>
      {hasContent(action) ? <div className={styles.action}>{action}</div> : null}
    </>
  ) : null

  return useRender({
    enabled,
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>(
      {
        ...scopeAttributes,
        role: status === 'danger' ? 'alert' : 'status',
        className: alert({
          primary,
          secondary: secondary ?? (status ? statusScales[status] : undefined),
          className,
        }),
        children: content,
      },
      rest
    ),
  })
}

/** True when a node would render something visible. */
function hasContent(node: React.ReactNode): boolean {
  return React.Children.toArray(node).some((child) => child !== '')
}
