'use client'

import * as React from 'react'

import { secondaryScaleVariants, type RadixScale } from './scales'
import { useScope, type Tone } from './scope'
import { MARKER_PX } from './tokens'
import styles from './ornament.module.css'

/*
 * The shared ornament parts (§1.5.16, §4.7, §6.6): the `marker-*` shapes,
 * the index and rank numerals, `ornament-trail`, the LTA dashed trail, and
 * `ornament-blob`, the LTA blob mount. Each draws its SVG geometry at the
 * token sizes (MARKER_PX mirrors them) and adds the ornament module's
 * classes, which set size, stroke and color. Markers, trails and mounts are
 * decorative (`aria-hidden`): whatever state they show is also in words.
 */

/** The §4.7 marker set: origin ○, waypoint ×, terminal ▷ and current ●. */
export type MarkerKind = 'origin' | 'waypoint' | 'terminal' | 'current'

/** Origin and terminal sizes: on a trail (5 / 6 px) or a timeline (8 px). */
export type MarkerSize = 'trail' | 'timeline'

const r = (value: number) => Math.round(value * 100) / 100

/** A marker's box in px: its token size (§1.5.16). */
function markerPx(kind: MarkerKind, size: MarkerSize): number {
  if (kind === 'waypoint') return MARKER_PX.waypoint
  if (kind === 'current') return MARKER_PX.current
  if (size === 'timeline') return MARKER_PX.timeline
  return kind === 'origin' ? MARKER_PX.trail : MARKER_PX.arrowHead
}

/**
 * One marker's shape, centered in its `px` box, its stroke inside the box.
 * The terminal is an equilateral outline pointing along `angle` (degrees,
 * 0 = the inline end, 90 = down).
 */
function markerShape(kind: MarkerKind, px: number, angle: number): React.ReactElement {
  const c = px / 2
  const inset = MARKER_PX.stroke / 2
  switch (kind) {
    case 'origin':
      return <circle cx={c} cy={c} r={r(c - inset)} />
    case 'waypoint': {
      const a = inset
      const b = px - inset
      return <path d={`M${a} ${a} ${b} ${b}M${b} ${a} ${a} ${b}`} />
    }
    case 'terminal': {
      const base = px - MARKER_PX.stroke
      const height = (base * Math.sqrt(3)) / 2
      const tip = r(c + height / 2)
      const back = r(c - height / 2)
      return (
        <path
          d={`M${tip} ${c}L${back} ${r(c - base / 2)}L${back} ${r(c + base / 2)}Z`}
          transform={angle === 0 ? undefined : `rotate(${angle} ${c} ${c})`}
        />
      )
    }
    case 'current':
      return <circle cx={c} cy={c} r={c} />
  }
}

const markerClass: Record<MarkerKind, string> = {
  origin: styles.markerOrigin,
  waypoint: styles.markerWaypoint,
  terminal: styles.markerTerminal,
  current: styles.markerCurrent,
}

/** Props for Marker: SVG props, the kind, the size and the terminal's direction. */
export type MarkerProps = Omit<React.SVGProps<SVGSVGElement>, 'children' | 'ref'> & {
  /** `origin` ○ (start), `waypoint` × (turns, intermediate entries), `terminal` ▷ (end), `current` ● ("now"). */
  kind: MarkerKind
  /**
   * `trail` (default): origin 5 px, terminal 6 px. `timeline`: origin and
   * terminal 8 px. The waypoint (9 px) and current dot (10 px) keep one size.
   */
  size?: MarkerSize
  /** The terminal's direction of travel in degrees: 0 the inline end, 90 down (default). */
  angle?: number
}

/**
 * A §4.7 marker (`marker-origin`, `marker-waypoint`, `marker-terminal`,
 * `marker-current`) as its own inline SVG, drawn in `currentColor` at its
 * token size. Decorative; say the state in words.
 */
export function Marker(props: MarkerProps) {
  const { kind, size = 'trail', angle = 90, className, ...rest } = props
  const px = markerPx(kind, size)
  const timeline = size === 'timeline' && (kind === 'origin' || kind === 'terminal')
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      {...rest}
      viewBox={`0 0 ${px} ${px}`}
      className={[markerClass[kind], timeline ? styles.markerTimeline : null, className]
        .filter(Boolean)
        .join(' ')}
    >
      {markerShape(kind, px, angle)}
    </svg>
  )
}

/** Props for MarkerIndex: `span` props, the number and its padded width. */
export type MarkerIndexProps = Omit<React.ComponentPropsWithRef<'span'>, 'children'> & {
  /** The callout's number, keyed to the list beside the figure. */
  value: number
  /** Digits to zero-pad to: the widest count ("01"–"09" for up to 99 items). Default 2. */
  digits?: number
}

/**
 * `marker-index` (§4.7.5, §8.10): a 24 px numbered circle, a `--primary1`
 * face with a `--primary12` edge and a zero-padded `type-label` numeral.
 * Numbering runs continuously across one figure.
 */
export function MarkerIndex(props: MarkerIndexProps) {
  const { value, digits = 2, className, ...rest } = props
  return (
    <span {...rest} className={className ? `${styles.markerIndex} ${className}` : styles.markerIndex}>
      {String(value).padStart(digits, '0')}
    </span>
  )
}

/** Props for MarkerRank: `span` props and the rank. */
export type MarkerRankProps = Omit<React.ComponentPropsWithRef<'span'>, 'children'> & {
  /** The rank, written with no period. */
  value: number
}

/**
 * The rank numeral of a ranked list (§8.4, §12.11): `type-body-ui` data
 * numerals in `--role-muted`, no period, end-aligned in a 2.5ch column.
 */
export function MarkerRank(props: MarkerRankProps) {
  const { value, className, ...rest } = props
  return (
    <span {...rest} className={className ? `${styles.markerRank} ${className}` : styles.markerRank}>
      {value}
    </span>
  )
}

/** The trail library shapes built so far (§4.7.1). */
export type TrailShape = 'short-tail' | 'entry'

interface TrailPoint {
  x: number
  y: number
}

interface TrailGeometry {
  width: number
  height: number
  /** The freehand path, starting --size-px-1 past the origin and ending --size-px-1 short of the terminal. */
  d: string
  origin: TrailPoint
  terminal: TrailPoint & { angle: number }
}

/*
 * Hand-set library paths (§4.7.1): freehand, no straight run over ≈ 40 px,
 * the phase starting on a full dash at the origin. `short-tail` (120 × 60)
 * wanders and turns down into its terminal, pointing at what follows below
 * (the empty state's action). `entry` (176 × 56) loops once near its start
 * (≈ 22 × 40 px), then runs level into a label at its inline end; the label
 * sits --ds-space-halo past the terminal.
 */
const trails: Record<TrailShape, TrailGeometry> = {
  'short-tail': {
    width: 120,
    height: 60,
    d: 'M12.5 12C24 9 32 21 46 19C60 17 62 5 76 7C92 9 88 29 100 32C106 34 108 38 108 44',
    origin: { x: 5, y: 12 },
    terminal: { x: 108, y: 52, angle: 90 },
  },
  entry: {
    width: 176,
    height: 56,
    d: 'M12.5 44C26 44 38 41 46 31C55 20 58 4 49 3C39 2 32 21 44 35C52 45 70 46 88 41C104 36 118 45 134 41C146 38 154 39 163 40',
    origin: { x: 5, y: 44 },
    terminal: { x: 171, y: 40, angle: 0 },
  },
}

/** Props for OrnamentTrail: SVG props, the library shape and the mirror. */
export type OrnamentTrailProps = Omit<React.SVGProps<SVGSVGElement>, 'children' | 'ref'> & {
  /**
   * `short-tail` (default): a short wander that turns down into its
   * terminal. `entry`: one loop near the start, then a level run into a
   * label at the inline end.
   */
  shape?: TrailShape
  /** Mirror it: the entry-right form, or a short tail that starts at the inline end. */
  flip?: boolean
}

/**
 * `ornament-trail` (§4.7.1): the system's signature line ornament, a
 * freehand `line-dashed` path in `--role-accent` (`--primary12` on the
 * saturated fields) from a `marker-origin` circle to a `marker-terminal`
 * triangle. The element's one ornament; decorative (`aria-hidden`).
 */
export function OrnamentTrail(props: OrnamentTrailProps) {
  const { shape = 'short-tail', flip = false, className, ...rest } = props
  const trail = trails[shape]
  const origin = MARKER_PX.trail
  const terminal = MARKER_PX.arrowHead
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={trail.width}
      height={trail.height}
      {...rest}
      viewBox={`0 0 ${trail.width} ${trail.height}`}
      className={className ? `${styles.ornamentTrail} ${className}` : styles.ornamentTrail}
    >
      <g transform={flip ? `matrix(-1 0 0 1 ${trail.width} 0)` : undefined}>
        <path className={styles.ornamentTrailPath} d={trail.d} vectorEffect="non-scaling-stroke" />
        <g
          className={styles.trailMarker}
          transform={`translate(${trail.origin.x - origin / 2} ${trail.origin.y - origin / 2})`}
        >
          {markerShape('origin', origin, 0)}
        </g>
        <g
          className={styles.trailMarker}
          transform={`translate(${trail.terminal.x - terminal / 2} ${trail.terminal.y - terminal / 2})`}
        >
          {markerShape('terminal', terminal, trail.terminal.angle)}
        </g>
      </g>
    </svg>
  )
}

/*
 * The blob mount's hand-cut disc (§6.6): a closed curve through nine points
 * at uneven angles and radii in a 136 × 130 box. The under-disc is the same
 * curve scaled 1.04 and turned 8° about the centre, so its crescents vary
 * between about 2 and 6 px.
 */
const BLOB_WIDTH = 136
const BLOB_HEIGHT = 130
const BLOB_PATH =
  'M136 65C135.9 78.1 130.2 93.3 120.2 104C110.3 114.8 90.6 127.1 76.3 129.5C61.9 132 46.1 125.9 34.2 118.8C22.3 111.7 9.3 100.1 4.7 87C0.2 73.9 1.4 53.6 7 40.2C12.5 26.8 25.4 12.6 38.2 6.6C51 0.5 70.1 0.7 84 3.8C97.8 7 112.4 15.2 121 25.4C129.7 35.6 136.1 51.9 136 65Z'
const BLOB_UNDER = 'translate(68 65) rotate(8) scale(1.04) translate(-68 -65)'

/** The grounds that take the mount (§6.6, §1.5.16): the page grounds and the night band. */
const MOUNT_TONES: ReadonlySet<Tone> = new Set<Tone>(['light-base', 'tinted', 'dark-base'])

/** Props for OrnamentBlob: `span` props, the mark and the secondary override. */
export type OrnamentBlobProps = Omit<React.ComponentPropsWithRef<'span'>, 'children'> & {
  /**
   * The mark centred on the front disc, drawn in its contrast ink
   * (`currentColor` is `--secondary-contrast`): a logo, a block icon or a
   * stat numeral, about 42% of the disc's width (57 px).
   */
  children?: React.ReactNode
  /**
   * Secondary Radix scale: both discs (steps 9 and 7) and the mark's
   * contrast ink. Never defaulted; omitted, it inherits the scope [D133].
   * On a pastel, `green` keeps the brand green (verified on all six, §6.6).
   */
  secondary?: RadixScale
}

/**
 * `ornament-blob` (§6.6, §1.5.16): the LTA blob mount, a flat hand-cut disc
 * in `--secondary9` over a larger, turned under-disc in `--secondary7`,
 * holding a centred mark in `--secondary-contrast`. Once per page, at a
 * fixed 136 × 130 px. On `forest` and the solid fields the mount is omitted
 * and the bare mark takes the scope's one ink [D14, D162]. In print the
 * discs drop and the mark prints black. Decorative: the discs are
 * `aria-hidden`; give a meaningful mark its own text alternative.
 */
export function OrnamentBlob(props: OrnamentBlobProps) {
  const { secondary, className, children, ...rest } = props
  const { tone } = useScope()
  const mounted = MOUNT_TONES.has(tone)
  return (
    <span
      {...rest}
      className={[
        styles.ornamentBlob,
        mounted ? null : styles.blobOmitted,
        secondary ? secondaryScaleVariants[secondary] : null,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {mounted ? (
        <svg
          className={styles.blobDiscs}
          width={BLOB_WIDTH}
          height={BLOB_HEIGHT}
          viewBox={`0 0 ${BLOB_WIDTH} ${BLOB_HEIGHT}`}
          aria-hidden="true"
          focusable="false"
        >
          <path className={styles.blobUnder} d={BLOB_PATH} transform={BLOB_UNDER} />
          <path className={styles.blobFront} d={BLOB_PATH} />
        </svg>
      ) : null}
      {children != null ? <span className={styles.blobMark}>{children}</span> : null}
    </span>
  )
}
