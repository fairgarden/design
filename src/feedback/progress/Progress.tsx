'use client'

import * as React from 'react'
import { Progress as BaseProgress } from '@base-ui/react/progress'
import { cva, type VariantProps } from 'class-variance-authority'

import { resolveClassName } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import { StatusGlyph, statusScales } from '../../utils/StatusGlyph'
import styles from './progress.module.css'

/*
 * Progress (§10.18; what it draws, §8.9): task completion — uploads, step
 * position in a form, reading or quiz progress.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: progress.module.css; CVA function `progress`.
 * - Axes: `kind` → bar | steps | ring | rail → `bar`, `steps`, `kindRing`
 *   (axis-prefixed: `ring` is also a part), `rail` (constructions per §8.9
 *   and §10.19) [D155]; `primary`, `secondary` → scales module classes (both;
 *   `secondary` unused).
 * - Compound variants: none.
 * - Defaults: kind bar; color axes none [D133].
 * - Color fallback: inherits the scope. The `status` part takes the status
 *   scale of its `status` as its secondary.
 * - States: Root `data-progressing` → rest; `data-complete` → "Done" with
 *   the success `status` part; `data-indeterminate` → the track in
 *   `line-dashed`, no indicator, the dashes advancing only under
 *   --motionOK. No hover state.
 * - Parts: base, label, value, readout, track, indicator, dashes, cell
 *   (cellFilled), ring, ringTrack, ringArc, status (its own CVA function
 *   `progressStatus`: `status` → success | warning | danger), statusGlyph,
 *   statusText.
 * - Scope: none.
 * - Container: none; inherits its context. Inside a `MeterPanel` (the
 *   `meter-panel` container) label | track | value share one row from
 *   768 px of the panel; baseline without support: label and value above a
 *   full-width track, rows from --md-n-above.
 */
export const progress = cva(styles.base, {
  variants: {
    kind: {
      bar: styles.bar,
      steps: styles.steps,
      ring: styles.kindRing,
      rail: styles.rail,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'bar',
  },
})

/** The status part: a §1.5.4 glyph plus a word, in the status scale [D129]. */
export const progressStatus = cva(styles.status, {
  variants: {
    status: {
      success: styles.success,
      warning: styles.warning,
      danger: styles.danger,
    },
    secondary: secondaryScaleVariants,
  },
})

type ProgressVariants = VariantProps<typeof progress>

/** A status beside the value: complete (`success`), near a limit (`warning`), failed or over (`danger`). */
export type ProgressStatus = 'success' | 'warning' | 'danger'

/** Props for Progress: Base UI Progress Root props plus the kind and color axes, the label and the status. */
export type ProgressProps = Omit<BaseProgress.Root.Props, 'children'> & {
  /**
   * `bar` (default): an outlined 8 px track with a solid indicator; label
   * left, value right. `steps`: one outlined 12 px cell per step
   * (`max` − `min` cells), "2 of 4". `ring`: a 2 px arc beside its value.
   * `rail`: the 2 px carousel position rail.
   */
  kind?: ProgressVariants['kind']
  /**
   * Primary Radix scale: track, indicator, label and value. Never defaulted;
   * omitted, it inherits the scope [D133].
   */
  primary?: ProgressVariants['primary']
  /** Secondary Radix scale: unused; status glyphs take their own scale. Never defaulted. */
  secondary?: ProgressVariants['secondary']
  /** The label, in caps (`type-label`); author it in sentence case. */
  label?: React.ReactNode
  /**
   * Formats the visible value (`type-data`): "62%", "3 of 5", "4.2 of 10
   * GB". Default: the Base UI formatted value (a percentage), or "n of N"
   * for `steps`.
   */
  formatValue?: (formattedValue: string, value: number) => React.ReactNode
  /**
   * The status part beside the value. Complete progress shows `success`
   * with `completeLabel` unless you pass another status. A threshold is
   * always a glyph plus a word, never an indicator color swap.
   */
  status?: ProgressStatus
  /** The status word: "Upload failed. Retry", "Near limit". A Retry button goes beside it. */
  statusText?: React.ReactNode
  /** The word shown at completion. Default "Done". */
  completeLabel?: React.ReactNode
  /** The words beside an indeterminate track (`value={null}`). Default "Loading…". */
  indeterminateLabel?: React.ReactNode
}

/**
 * A Base UI Progress drawn in ink only: every part is `--primary12` on the
 * ground, and the value is always shown in text, because the fill vanishes
 * in print. `value={null}` is indeterminate: a dashed track with "Loading…";
 * show it only after 1 s. Progress is hidden in print, except `steps`,
 * which prints its text.
 */
export function Progress(props: ProgressProps) {
  const {
    kind,
    primary,
    secondary,
    label,
    formatValue,
    status,
    statusText,
    completeLabel = 'Done',
    indeterminateLabel = 'Loading…',
    getAriaValueText,
    className,
    value,
    min = 0,
    max = 100,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const statusId = React.useId()
  const resolvedKind = kind ?? 'bar'
  const indeterminate = value == null || !Number.isFinite(value)
  const complete = !indeterminate && value >= max
  const resolvedStatus: ProgressStatus | undefined = status ?? (complete ? 'success' : undefined)
  const resolvedStatusText = status ? statusText : complete ? completeLabel : undefined
  const fraction = indeterminate ? 0 : clamp((value - min) / (max - min || 1))

  const variants = { kind, primary, secondary }
  const resolvedClassName = resolveClassName(className, (extra) =>
    progress({ ...variants, className: extra })
  )

  const stepsText = (current: number | null) => `${current ?? 0} of ${max - min}`
  const ariaValueText =
    getAriaValueText ??
    (resolvedKind === 'steps'
      ? (_formatted: string, current: number | null) => stepsText(current)
      : undefined)

  let track: React.ReactNode
  if (resolvedKind === 'ring') {
    track = (
      <svg className={styles.ring} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <circle className={styles.ringTrack} cx="10" cy="10" r="9" />
        {indeterminate ? null : (
          <circle
            className={styles.ringArc}
            cx="10"
            cy="10"
            r="9"
            pathLength={100}
            strokeDasharray={`${fraction * 100} 100`}
            transform="rotate(-90 10 10)"
          />
        )}
      </svg>
    )
  } else if (resolvedKind === 'steps') {
    const count = Math.max(0, Math.round(max - min))
    const filled = Math.round(fraction * count)
    track = (
      <BaseProgress.Track className={styles.track}>
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            className={index < filled ? `${styles.cell} ${styles.cellFilled}` : styles.cell}
          />
        ))}
      </BaseProgress.Track>
    )
  } else {
    track = (
      <BaseProgress.Track className={styles.track}>
        <BaseProgress.Indicator className={styles.indicator} />
        <svg className={styles.dashes} aria-hidden="true" focusable="false">
          <line className={styles.dashLine} x1="0" y1="50%" x2="100%" y2="50%" />
        </svg>
      </BaseProgress.Track>
    )
  }

  return (
    <BaseProgress.Root
      {...rest}
      {...scope}
      value={value}
      min={min}
      max={max}
      getAriaValueText={ariaValueText}
      aria-describedby={resolvedStatus ? statusId : rest['aria-describedby']}
      className={resolvedClassName}
    >
      {label == null ? null : <BaseProgress.Label className={styles.label}>{label}</BaseProgress.Label>}
      {track}
      <span className={styles.readout}>
        <BaseProgress.Value className={styles.value}>
          {(formatted, current) => {
            if (current == null || formatted == null) return indeterminateLabel
            if (formatValue) return formatValue(formatted, current)
            return resolvedKind === 'steps' ? stepsText(current) : formatted
          }}
        </BaseProgress.Value>
        {resolvedStatus ? (
          <ProgressStatusPart id={statusId} status={resolvedStatus}>
            {resolvedStatusText}
          </ProgressStatusPart>
        ) : null}
      </span>
    </BaseProgress.Root>
  )
}

function ProgressStatusPart(props: {
  id: string
  status: ProgressStatus
  children: React.ReactNode
}) {
  const { id, status, children } = props
  const scope = useScopeAttributes()
  return (
    <span
      {...scope}
      id={id}
      className={progressStatus({ status, secondary: statusScales[status] })}
    >
      <StatusGlyph status={status} label={null} className={styles.statusGlyph} />
      {children == null ? null : <span className={styles.statusText}>{children}</span>}
    </span>
  )
}

function clamp(fraction: number): number {
  return Math.min(1, Math.max(0, fraction))
}
