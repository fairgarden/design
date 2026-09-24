'use client'

import * as React from 'react'
import { Meter as BaseMeter } from '@base-ui/react/meter'
import { cva, type VariantProps } from 'class-variance-authority'

import { resolveClassName } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import { StatusGlyph, statusScales } from '../../utils/StatusGlyph'
import styles from './meter.module.css'

/*
 * Meter (§10.18; what it draws, §8.9): a measured value in a known range —
 * storage used, strength, a level on an ordinal scale. Never for an
 * unbounded value.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: meter.module.css; CVA function `meter`.
 * - Axes: `kind` → bar | steps | ordinal | ring → `bar`, `steps`,
 *   `ordinal`, `kindRing` (axis-prefixed: `ring` is also a part) [D155];
 *   `primary`, `secondary` → scales module classes (both; `secondary`
 *   unused).
 * - Compound variants: none.
 * - Defaults: kind bar; color axes none [D133].
 * - Color fallback: inherits the scope. The `status` part takes the status
 *   scale of its `status` as its secondary.
 * - States: none (value only); thresholds are a tick plus a status glyph
 *   and word, never an indicator color swap.
 * - Parts: base, label, value, readout, track, indicator, threshold, cell
 *   (cellFilled), stop (stopActive), arrow, stops, stopLabel
 *   (stopLabelActive), ring, ringTrack, ringArc, status (its own CVA
 *   function `meterStatus`: `status` → success | warning | danger),
 *   statusGlyph, statusText; MeterPanel's `panel`.
 * - Scope: none.
 * - Container: none; inherits its context. `MeterPanel` is the
 *   `meter-panel` container: label | track | value rows from 768 px of it;
 *   baseline without support: label and value above a full-width track,
 *   rows from --md-n-above. Below 360 px of the panel, ordinal labels wrap,
 *   all kept.
 */
export const meter = cva(styles.base, {
  variants: {
    kind: {
      bar: styles.bar,
      steps: styles.steps,
      ordinal: styles.ordinal,
      ring: styles.kindRing,
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
export const meterStatus = cva(styles.status, {
  variants: {
    status: {
      success: styles.success,
      warning: styles.warning,
      danger: styles.danger,
    },
    secondary: secondaryScaleVariants,
  },
})

type MeterVariants = VariantProps<typeof meter>

/** A status beside the value: `warning` ▲ "Near limit", `danger` ◆ "Over limit", `success` ●. */
export type MeterStatus = 'success' | 'warning' | 'danger'

/** Props for Meter: Base UI Meter Root props plus the kind and color axes, the label, stops, threshold and status. */
export type MeterProps = Omit<BaseMeter.Root.Props, 'children' | 'value'> & {
  /** The measured value, between `min` and `max`; for `ordinal`, the index of the active stop. */
  value: number
  /**
   * `bar` (default): an outlined 8 px track with a solid indicator. `steps`:
   * one outlined 12 px cell per unit (`max` − `min` cells). `ordinal`: a
   * 1 px track with a tick and a caps label per stop, the active stop bold,
   * larger and pointed to. `ring`: a 2 px arc beside its value.
   */
  kind?: MeterVariants['kind']
  /**
   * Primary Radix scale: track, indicator, ticks, stops and text. Never
   * defaulted; omitted, it inherits the scope [D133].
   */
  primary?: MeterVariants['primary']
  /** Secondary Radix scale: unused, so a meter never reads as a chart series. Never defaulted. */
  secondary?: MeterVariants['secondary']
  /** The label, in caps (`type-label`); author it in sentence case. */
  label?: React.ReactNode
  /** Formats the visible value (`type-data`): "62%", "4.2 of 10 GB". Default: the Base UI formatted value. */
  formatValue?: (formattedValue: string, value: number) => React.ReactNode
  /**
   * `ordinal` only: the stop labels in order (author them in sentence case;
   * CSS sets the caps). `min` becomes 0 and `max` the last index.
   */
  stops?: readonly React.ReactNode[]
  /** A limit, drawn as a --size-px-2-5 tick at --border-size-2 across the track (`bar`). */
  threshold?: number
  /** The status beside the value; always with `statusText`. */
  status?: MeterStatus
  /** The status word: "Near limit", "Over limit". In a form it is also the Field description. */
  statusText?: React.ReactNode
}

/**
 * A Base UI Meter drawn in ink only: every part is `--primary12` on the
 * ground; the value is always in text. In print, linear and segmented
 * indicators turn to a 45° hatch inside their outline, closed by an edge at
 * the value; rings and ordinal scales print as line.
 */
export function Meter(props: MeterProps) {
  const {
    kind,
    primary,
    secondary,
    label,
    formatValue,
    stops,
    threshold,
    status,
    statusText,
    getAriaValueText,
    className,
    value,
    min: minProp = 0,
    max: maxProp = 100,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const statusId = React.useId()
  const resolvedKind = kind ?? 'bar'
  const ordinalStops = resolvedKind === 'ordinal' ? (stops ?? []) : null
  const min = ordinalStops ? 0 : minProp
  const max = ordinalStops ? Math.max(ordinalStops.length - 1, 1) : maxProp
  const fraction = clamp((value - min) / (max - min || 1))

  const variants = { kind, primary, secondary }
  const resolvedClassName = resolveClassName(className, (extra) =>
    meter({ ...variants, className: extra })
  )

  const activeIndex = Math.round(value)
  const activeStop = ordinalStops?.[activeIndex]
  const ariaValueText =
    getAriaValueText ??
    (ordinalStops && (typeof activeStop === 'string' || typeof activeStop === 'number')
      ? () => String(activeStop)
      : undefined)

  let track: React.ReactNode
  let after: React.ReactNode = null
  if (resolvedKind === 'ring') {
    track = (
      <svg className={styles.ring} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <circle className={styles.ringTrack} cx="10" cy="10" r="9" />
        <circle
          className={styles.ringArc}
          cx="10"
          cy="10"
          r="9"
          pathLength={100}
          strokeDasharray={`${fraction * 100} 100`}
          transform="rotate(-90 10 10)"
        />
      </svg>
    )
  } else if (resolvedKind === 'steps') {
    const count = Math.max(0, Math.round(max - min))
    const filled = Math.round(fraction * count)
    track = (
      <BaseMeter.Track className={styles.track}>
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            className={index < filled ? `${styles.cell} ${styles.cellFilled}` : styles.cell}
          />
        ))}
      </BaseMeter.Track>
    )
  } else if (ordinalStops) {
    const count = ordinalStops.length
    const scale = { '--meter-stops': count } as React.CSSProperties
    track = (
      <BaseMeter.Track className={styles.track} style={scale}>
        {ordinalStops.map((_, index) => (
          <span
            key={index}
            className={index === activeIndex ? `${styles.stop} ${styles.stopActive}` : styles.stop}
            style={{ '--meter-stop-index': index } as React.CSSProperties}
          />
        ))}
        <svg
          className={styles.arrow}
          viewBox="0 0 12 8"
          aria-hidden="true"
          focusable="false"
          style={{ '--meter-stop-index': activeIndex } as React.CSSProperties}
        >
          <path d="M1 1h10L6 7z" />
        </svg>
      </BaseMeter.Track>
    )
    after = (
      <ol className={styles.stops} style={scale} aria-hidden="true">
        {ordinalStops.map((stop, index) => (
          <li
            key={index}
            className={
              index === activeIndex ? `${styles.stopLabel} ${styles.stopLabelActive}` : styles.stopLabel
            }
          >
            {stop}
          </li>
        ))}
      </ol>
    )
  } else {
    track = (
      <BaseMeter.Track className={styles.track}>
        <BaseMeter.Indicator className={styles.indicator} />
        {threshold == null ? null : (
          <span
            className={styles.threshold}
            style={
              {
                '--meter-threshold': `${clamp((threshold - min) / (max - min || 1)) * 100}%`,
              } as React.CSSProperties
            }
          />
        )}
      </BaseMeter.Track>
    )
  }

  return (
    <BaseMeter.Root
      {...rest}
      {...scope}
      value={value}
      min={min}
      max={max}
      getAriaValueText={ariaValueText}
      aria-describedby={status ? statusId : rest['aria-describedby']}
      className={resolvedClassName}
    >
      {label == null ? null : <BaseMeter.Label className={styles.label}>{label}</BaseMeter.Label>}
      {track}
      {after}
      <span className={styles.readout}>
        {ordinalStops ? null : (
          <BaseMeter.Value className={styles.value}>
            {(formatted, current) => (formatValue ? formatValue(formatted, current) : formatted)}
          </BaseMeter.Value>
        )}
        {status ? (
          <MeterStatusPart id={statusId} status={status}>
            {statusText}
          </MeterStatusPart>
        ) : null}
      </span>
    </BaseMeter.Root>
  )
}

function MeterStatusPart(props: { id: string; status: MeterStatus; children: React.ReactNode }) {
  const { id, status, children } = props
  const scope = useScopeAttributes()
  return (
    <span {...scope} id={id} className={meterStatus({ status, secondary: statusScales[status] })}>
      <StatusGlyph status={status} label={null} className={styles.statusGlyph} />
      {children == null ? null : <span className={styles.statusText}>{children}</span>}
    </span>
  )
}

/** Props for MeterPanel: `div` props. */
export type MeterPanelProps = React.ComponentPropsWithRef<'div'>

/**
 * A meter or scale panel: stacks its meters and is the `meter-panel`
 * container, so each meter sets label | track | value in one row from
 * 768 px of the panel's width, and stacks below it.
 */
export function MeterPanel(props: MeterPanelProps) {
  const { className, ...rest } = props
  const scope = useScopeAttributes()
  return (
    <div {...rest} {...scope} className={className ? `${styles.panel} ${className}` : styles.panel} />
  )
}

function clamp(fraction: number): number {
  return Math.min(1, Math.max(0, fraction))
}
