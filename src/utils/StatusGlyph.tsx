import * as React from 'react'

import type { RadixScale } from './scales'

/*
 * The four §1.5.4 status glyphs, shared by Alert, Badge, Avatar, Alert
 * Dialog, Toast and the destructive Menu item: ○ with i, ● with check,
 * ▲ with !, ◆ with ×, drawn custom on a 20 px grid, never Material [D58].
 * Shapes and marks are in currentColor (the host's --role-status); knockout
 * marks and the outline disc take the SVG's own fill and stroke (the host's
 * --role-status-fill). The host module sets size, color, fill, stroke and
 * stroke width.
 */

export type Status = 'info' | 'success' | 'warning' | 'danger'

/** §1.5.4 status scales, passed as the host's computed secondary [D129]. */
export const statusScales = {
  info: 'indigo',
  success: 'green',
  warning: 'amber',
  danger: 'red',
} as const satisfies Record<Status, RadixScale>

/** The glyph's accessible name: the status in words, so it is never shape or color alone. */
export const statusLabels: Record<Status, string> = {
  info: 'Information',
  success: 'Success',
  warning: 'Warning',
  danger: 'Error',
}

const glyphs: Record<Status, React.ReactNode> = {
  info: (
    <>
      <circle cx="10" cy="10" r="8.25" stroke="currentColor" />
      <path d="M10 9v5" fill="none" stroke="currentColor" />
      <circle cx="10" cy="6.25" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  success: (
    <>
      <circle cx="10" cy="10" r="9" fill="currentColor" stroke="none" />
      <path d="M6.25 10.25l2.5 2.5 5-5" fill="none" />
    </>
  ),
  warning: (
    <>
      <path d="M10 2.75 18 16.75H2z" fill="currentColor" stroke="currentColor" />
      <path d="M10 7.5v4" fill="none" />
      <circle cx="10" cy="14.25" r="1" stroke="none" />
    </>
  ),
  danger: (
    <>
      <path d="M10 1.5 18.5 10 10 18.5 1.5 10z" fill="currentColor" stroke="currentColor" />
      <path d="m7.5 7.5 5 5m0-5-5 5" fill="none" />
    </>
  ),
}

/** Props for StatusGlyph: SVG props (without `children`), the status and its accessible name. */
export type StatusGlyphProps = Omit<React.ComponentProps<'svg'>, 'children'> & {
  status: Status
  /**
   * Accessible name, normally the status word. Omit it, or pass `null`, when
   * an adjacent word already names the status: the glyph is then hidden from
   * assistive technology.
   */
  label?: string | null
}

/** A §1.5.4 status glyph, drawn custom with its inner mark [D58]. */
export function StatusGlyph({ status, label, ...rest }: StatusGlyphProps) {
  const a11y =
    label == null
      ? ({ 'aria-hidden': true } as const)
      : ({ role: 'img', 'aria-label': label } as const)

  return (
    <svg viewBox="0 0 20 20" focusable="false" {...a11y} {...rest}>
      {glyphs[status]}
    </svg>
  )
}
