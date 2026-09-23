'use client'

import * as React from 'react'
import { Slider as BaseSlider } from '@base-ui/react/slider'
import { cva, type VariantProps } from 'class-variance-authority'

import { Ground } from '../../foundations/ground'
import { resolveClassName } from '../../utils/className'
import {
  primaryScaleVariants,
  secondaryScaleVariants,
} from '../../utils/scales'
import { overlayScope, useScopeAttributes } from '../../utils/scope'

import styles from './slider.module.css'

/*
 * Slider (§10.10).
 *
 * Implementation (CSS Modules + CVA)
 * - Module: slider.module.css; CVA function `slider`.
 * - Axes: `stepped` → `stepped` (the tick scale: minor ticks half the
 *   --ds-space-12 major ticks, with major labels); `primary`, `secondary`
 *   → scales module classes.
 * - Compound variants: none.
 * - Defaults: stepped false; color axes none [D133]. The range form is
 *   Base UI's two-thumb value, not an axis.
 * - Color fallback: inherits the scope (secondary unused: the indicator is
 *   structure, not a selection).
 * - States: :hover (not disabled) → thumb face --role-soft-hover-face
 *   (--primary3 where soft fills apply, unchanged where they drop), edge
 *   unchanged [D181];
 *   data-dragging → thumb edge --ds-stroke-3 and the `chip`; :focus-visible on
 *   each thumb's input → ring on the thumb; data-orientation → track
 *   direction; data-disabled → dotted track and thumb edges, indicator
 *   removed, value kept.
 * - Parts: base, label, value, control, track, indicator, thumb, ticks,
 *   tick (tickMajor; tickStart, tickEnd and tickMid anchor the end labels
 *   and mark the labels that survive narrow widths), tickLabel, chip, and
 *   edge / edgeLine (the disabled dotted edges).
 * - Scope: `chip` is a nested overlay-face (`white`) Ground; otherwise none.
 * - Container: none; inherits its context. Tick labels thin by viewport:
 *   ends and midpoint at base, ends only at --xs-n-below, all from
 *   --md-n-above.
 */
export const slider = cva(styles.base, {
  variants: {
    stepped: {
      true: styles.stepped,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    stepped: false,
  },
})

type SliderVariants = VariantProps<typeof slider>

/** A major tick on a stepped slider: its value and optional label. */
export interface SliderMark {
  /** The value the tick marks, between `min` and `max`. */
  value: number
  /** The label under the tick; defaults to the formatted value. */
  label?: React.ReactNode
}

/** Above this many minor ticks, the minor scale is dropped. */
const MAX_MINOR_TICKS = 100

/**
 * Props for Slider: Base UI Slider.Root props plus the stepped and color
 * axes, the label, the value readout and the tick scale.
 */
export type SliderProps<Value extends number | readonly number[] = number | readonly number[]> =
  Omit<BaseSlider.Root.Props<Value>, 'children'> & {
    /** Shows the tick scale under the track: minor and major ticks, major labels. Default `false`. */
    stepped?: SliderVariants['stepped']
    /**
     * Primary Radix scale: every part (track edge, indicator, thumb edge,
     * ticks, value). Never defaulted; omitted, it inherits the scope [D133].
     */
    primary?: SliderVariants['primary']
    /** Secondary Radix scale: unused by the slider itself. Never defaulted. */
    secondary?: SliderVariants['secondary']
    /** The field label, above the track; title case up to about four words [D160]. */
    label?: React.ReactNode
    /**
     * Formats the value readout at the right end of the label row, e.g. a
     * unit or a derived rate in parentheses ("1M (≈24 WPM)"). Default: the
     * formatted values joined by " – ".
     */
    formatValue?: (formattedValues: readonly string[], values: readonly number[]) => React.ReactNode
    /** `stepped` only: the major ticks. Default: `min`, the midpoint and `max`. */
    marks?: readonly SliderMark[]
    /** `stepped` only: the minor tick spacing. Default `step`. */
    minorStep?: number
    /** Accessible names per thumb, needed for a range ("Minimum price", "Maximum price"). */
    thumbLabels?: readonly string[]
  }

function DisabledEdge() {
  return (
    <svg className={styles.edge} aria-hidden="true" focusable="false">
      <rect className={styles.edgeLine} width="100%" height="100%" />
    </svg>
  )
}

function percentOf(value: number, min: number, max: number) {
  return ((value - min) / (max - min)) * 100
}

/**
 * A Base UI Slider for approximate values where relative position
 * matters: an outlined track, a --primary12 indicator and a tall
 * --role-halo thumb, with the value always shown in text. Exact values use
 * a Number Field. A range passes an array `value` / `defaultValue`.
 */
export function Slider<Value extends number | readonly number[]>(props: SliderProps<Value>) {
  const {
    stepped,
    primary,
    secondary,
    label,
    formatValue,
    marks,
    minorStep,
    thumbLabels,
    className,
    min = 0,
    max = 100,
    step = 1,
    format,
    locale,
    orientation,
    ...rest
  } = props

  const scope = useScopeAttributes()

  const initial = rest.value ?? rest.defaultValue
  const thumbCount = Array.isArray(initial) ? initial.length : 1
  const thumbs = Array.from({ length: thumbCount }, (_, index) => index)

  const variants = { stepped, primary, secondary }
  const resolvedClassName = resolveClassName(className, (extra) =>
    slider({ ...variants, className: extra })
  )

  let ticks: React.ReactNode = null
  if (stepped && orientation !== 'vertical' && max > min) {
    const formatter = new Intl.NumberFormat(locale, format)
    const midpoint = (min + max) / 2
    const majors: readonly SliderMark[] = marks ?? [
      { value: min },
      { value: midpoint },
      { value: max },
    ]
    const majorValues = new Set(majors.map((mark) => mark.value))
    const spacing = minorStep ?? step
    const minorCount = spacing > 0 ? Math.floor((max - min) / spacing) : 0
    const minors =
      minorCount > 0 && minorCount <= MAX_MINOR_TICKS
        ? Array.from({ length: minorCount + 1 }, (_, index) =>
            // Rounded, so decimal steps don't drift past the majors.
            Number((min + index * spacing).toFixed(10))
          ).filter((value) => !majorValues.has(value))
        : []

    ticks = (
      <div className={styles.ticks} aria-hidden="true">
        {minors.map((value) => (
          <span
            key={`minor-${value}`}
            className={styles.tick}
            style={{ '--slider-tick-position': `${percentOf(value, min, max)}%` } as React.CSSProperties}
          />
        ))}
        {majors.map((mark) => {
          const position =
            mark.value <= min ? styles.tickStart : mark.value >= max ? styles.tickEnd : ''
          const middle = mark.value === midpoint ? styles.tickMid : ''
          return (
            <span
              key={`major-${mark.value}`}
              className={[styles.tick, styles.tickMajor, position, middle]
                .filter(Boolean)
                .join(' ')}
              style={
                {
                  '--slider-tick-position': `${percentOf(mark.value, min, max)}%`,
                } as React.CSSProperties
              }
            >
              <span className={styles.tickLabel}>
                {mark.label ?? formatter.format(mark.value)}
              </span>
            </span>
          )
        })}
      </div>
    )
  }

  return (
    <BaseSlider.Root<Value>
      {...rest}
      {...scope}
      min={min}
      max={max}
      step={step}
      format={format}
      locale={locale}
      orientation={orientation}
      className={resolvedClassName}
    >
      {label == null ? null : (
        <BaseSlider.Label className={styles.label}>{label}</BaseSlider.Label>
      )}
      <BaseSlider.Value className={styles.value}>{formatValue ?? null}</BaseSlider.Value>
      <BaseSlider.Control className={styles.control}>
        <BaseSlider.Track className={styles.track}>
          <BaseSlider.Indicator className={styles.indicator} />
          {thumbs.map((index) => (
            <BaseSlider.Thumb
              key={index}
              index={thumbCount > 1 ? index : undefined}
              aria-label={thumbLabels?.[index]}
              className={styles.thumb}
            >
              <Ground
                kind="face"
                preset={overlayScope.ground}
                render={<span />}
                className={styles.chip}
                aria-hidden="true"
              >
                <BaseSlider.Value render={<span />}>
                  {(formatted) => formatted[index]}
                </BaseSlider.Value>
              </Ground>
              <DisabledEdge />
            </BaseSlider.Thumb>
          ))}
          <DisabledEdge />
        </BaseSlider.Track>
      </BaseSlider.Control>
      {ticks}
    </BaseSlider.Root>
  )
}
