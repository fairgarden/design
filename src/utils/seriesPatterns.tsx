'use client'

import * as React from 'react'

import { cx } from './className'

/*
 * Semantic SVG patterns for charts and maps (§1.5.9, §1.5.16, §8.7) [D125,
 * D167]. Each chart or map instance renders its own <defs> with ids built
 * from its generated id, so two figures on a page never share an id. Marks
 * are fills (1 px rects, true circles), never strokes or gradients, drawn in
 * a role variable; each tile's ground is --role-ground, so a patterned shape
 * is opaque and no gridline shows through it. Print keeps the patterns (SVG
 * foreground) and the remap turns their inks black.
 */

/** A series slot of the semantic series order (§8.7): 1 solid, 2–5 patterns, 6 outline. */
export type SeriesSlot = 1 | 2 | 3 | 4 | 5 | 6

/** A sequential step (§8.7): screen fills secondary 4 / 6 / 8 / 11 / 12. */
export type SequentialStep = 1 | 2 | 3 | 4 | 5

/** The primary ink: even slots, slot 6, every edge, axis and label. */
export const INK_PRIMARY = 'var(--primary12)'

/**
 * The odd slots' ink, `--role-series-odd` (roles.css): `--secondary11` on a
 * light base ground or a `white` plate, `--primary12` elsewhere (§8.7)
 * [D125], so the scope picks two inks or one without a prop.
 */
export const INK_ODD = 'var(--role-series-odd)'

/** The scope's ground: slot 6's inside and every pattern tile's ground. */
export const GROUND = 'var(--role-ground)'

/** The label knockout plate (--primary1 in every scope and mode) [D150]. */
export const HALO = 'var(--role-halo)'

/** Screen fills of the five sequential steps (§8.7). */
export const SEQUENTIAL_FILLS: Record<SequentialStep, string> = {
  1: 'var(--secondary4)',
  2: 'var(--secondary6)',
  3: 'var(--secondary8)',
  4: 'var(--secondary11)',
  5: 'var(--secondary12)',
}

/** Value ink on each sequential fill: --primary12 on steps 1–3, --role-inverse on 4–5. */
export const SEQUENTIAL_INKS: Record<SequentialStep, string> = {
  1: INK_PRIMARY,
  2: INK_PRIMARY,
  3: INK_PRIMARY,
  4: 'var(--role-inverse)',
  5: 'var(--role-inverse)',
}

/**
 * The ink a slot's marks take: odd slots the scope's odd ink (two-ink or
 * one-ink by ground), even slots primary; forced one ink, all primary.
 */
export function slotInk(slot: SeriesSlot, oneInk: boolean): string {
  return oneInk || slot % 2 === 0 ? INK_PRIMARY : INK_ODD
}

/** The `id` of one pattern in a figure's defs. */
export function patternId(prefix: string, name: string): string {
  return `${prefix}-${name}`
}

/** The fill a slot's shape takes: solid ink, a pattern reference, or the ground. */
export function slotFill(prefix: string, slot: SeriesSlot, oneInk: boolean): string {
  if (slot === 1) return slotInk(1, oneInk)
  if (slot === 6) return GROUND
  return `url(#${patternId(prefix, `slot${slot}`)})`
}

/** The print (and one-ink screen) fill of a sequential step: step 1 is the empty ground. */
export function stepPatternFill(prefix: string, step: SequentialStep): string {
  return step === 1 ? GROUND : `url(#${patternId(prefix, `step${step}`)})`
}

/** Makes a React id safe inside `url(#…)` and CSS: letters, digits, `-` and `_`. */
export function safeId(reactId: string, lead: string): string {
  return `${lead}${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`
}

type Geometry =
  | { kind: 'hatch'; angle: 45 | 135 | 0 }
  | { kind: 'crossed' }
  | { kind: 'dots'; pitch: 4 | 5 | 6; heavy: boolean }

/*
 * §1.5.9 geometry, px: hatch 1 px lines at --ds-hatch-pitch 6 px, measured
 * perpendicular to the lines (an SVG pattern rotates an exact 6 px tile, so
 * it needs no 8 px CSS tile); dot screens --ds-dotscreen-dot 1.25 px or
 * --ds-dotscreen-dot-heavy 2 px at --ds-dotscreen-pitch-1/-2/-3 (6/5/4 px).
 * SVG pattern attributes cannot read custom properties, so the values are
 * mirrored here.
 */
const HATCH_PITCH = 6
const HATCH_LINE = 1
const DOT_RADIUS = 0.625
const DOT_RADIUS_HEAVY = 1

const slotGeometry: Record<2 | 3 | 4 | 5, Geometry> = {
  2: { kind: 'hatch', angle: 45 },
  3: { kind: 'dots', pitch: 5, heavy: false },
  4: { kind: 'hatch', angle: 0 },
  5: { kind: 'crossed' },
}

const stepGeometry: Record<2 | 3 | 4 | 5, Geometry> = {
  2: { kind: 'dots', pitch: 6, heavy: false },
  3: { kind: 'dots', pitch: 4, heavy: false },
  4: { kind: 'dots', pitch: 4, heavy: true },
  5: { kind: 'crossed' },
}

/** Classes the host module gives the pattern parts, for its print and forced-colors rules. */
export interface PatternClassNames {
  /** Every mark (hatch line, dot). */
  mark?: string
  /** Standard 1.25 px dots, which print at 1 pt (§1.5.9). */
  dot?: string
  /** The tile ground. */
  ground?: string
}

interface PatternProps {
  id: string
  geometry: Geometry
  ink: string
  scale: number
  classNames: PatternClassNames
}

function Pattern({ id, geometry, ink, scale, classNames }: PatternProps) {
  const scaled = scale === 1 ? '' : `scale(${scale}) `

  if (geometry.kind === 'dots') {
    const { pitch, heavy } = geometry
    return (
      <pattern
        id={id}
        patternUnits="userSpaceOnUse"
        width={pitch}
        height={pitch}
        patternTransform={scaled ? scaled.trim() : undefined}
      >
        <rect width={pitch} height={pitch} fill={GROUND} className={classNames.ground} />
        <circle
          cx={pitch / 2}
          cy={pitch / 2}
          r={heavy ? DOT_RADIUS_HEAVY : DOT_RADIUS}
          fill={ink}
          className={cx(classNames.mark, !heavy && classNames.dot) || undefined}
        />
      </pattern>
    )
  }

  const angle = geometry.kind === 'crossed' ? 45 : geometry.angle
  // A vertical 1 px line rotated by 45 draws "/", by -45 "\" (y points down).
  const rotation = angle === 0 ? '' : angle === 45 ? 'rotate(45)' : 'rotate(-45)'
  const transform = `${scaled}${rotation}`.trim()

  return (
    <pattern
      id={id}
      patternUnits="userSpaceOnUse"
      width={HATCH_PITCH}
      height={HATCH_PITCH}
      patternTransform={transform || undefined}
    >
      <rect width={HATCH_PITCH} height={HATCH_PITCH} fill={GROUND} className={classNames.ground} />
      {angle === 0 ? (
        <rect width={HATCH_PITCH} height={HATCH_LINE} fill={ink} className={classNames.mark} />
      ) : (
        <rect width={HATCH_LINE} height={HATCH_PITCH} fill={ink} className={classNames.mark} />
      )}
      {geometry.kind === 'crossed' ? (
        <rect width={HATCH_PITCH} height={HATCH_LINE} fill={ink} className={classNames.mark} />
      ) : null}
    </pattern>
  )
}

/** Props for PatternDefs: which patterns one figure defines, and in which inks. */
export interface PatternDefsProps {
  /** The figure's id prefix; each pattern id is `${prefix}-${name}`. */
  prefix: string
  /**
   * Forces every mark into --primary12. Off, odd slots take
   * --role-series-odd, which the scope already resolves to --primary12 off
   * the light base grounds (§8.7).
   */
  oneInk: boolean
  /** Series slots whose patterns are needed (slots 1 and 6 need none). */
  slots?: readonly SeriesSlot[]
  /** Defines the sequential print patterns `step2`–`step5`. */
  steps?: boolean
  /** Defines the map area fills `water`, `green` and `planned` (§8.10). */
  map?: boolean
  /**
   * Counter-scale for a zoomed drawing, so pattern pitch keeps its screen
   * size at every zoom level [I7]. Default 1.
   */
  scale?: number
  /** Classes for the host module's print and forced-colors rules. */
  classNames?: PatternClassNames
}

/**
 * One figure's pattern definitions, in a <defs> element: the series slots it
 * uses in their slot inks (odd --role-series-odd, even --primary12, or all
 * --primary12 in one ink), the sequential print patterns in --primary12, and
 * the map area fills (green space in the odd ink, §8.10).
 */
export function PatternDefs({
  prefix,
  oneInk,
  slots = [],
  steps = false,
  map = false,
  scale = 1,
  classNames = {},
}: PatternDefsProps) {
  const patternSlots = Array.from(new Set(slots)).filter(
    (slot): slot is 2 | 3 | 4 | 5 => slot > 1 && slot < 6
  )
  return (
    <defs>
      {patternSlots.map((slot) => (
        <Pattern
          key={`slot${slot}`}
          id={patternId(prefix, `slot${slot}`)}
          geometry={slotGeometry[slot]}
          ink={slotInk(slot, oneInk)}
          scale={scale}
          classNames={classNames}
        />
      ))}
      {steps
        ? ([2, 3, 4, 5] as const).map((step) => (
            <Pattern
              key={`step${step}`}
              id={patternId(prefix, `step${step}`)}
              geometry={stepGeometry[step]}
              ink={INK_PRIMARY}
              scale={scale}
              classNames={classNames}
            />
          ))
        : null}
      {map ? (
        <>
          <Pattern
            id={patternId(prefix, 'water')}
            geometry={{ kind: 'hatch', angle: 45 }}
            ink={INK_PRIMARY}
            scale={scale}
            classNames={classNames}
          />
          <Pattern
            id={patternId(prefix, 'green')}
            geometry={{ kind: 'dots', pitch: 6, heavy: false }}
            ink={oneInk ? INK_PRIMARY : INK_ODD}
            scale={scale}
            classNames={classNames}
          />
          <Pattern
            id={patternId(prefix, 'planned')}
            geometry={{ kind: 'hatch', angle: 135 }}
            ink={INK_PRIMARY}
            scale={scale}
            classNames={classNames}
          />
        </>
      ) : null}
    </defs>
  )
}
