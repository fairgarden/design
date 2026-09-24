'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cx } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './stat.module.css'

/*
 * Stat block (§12.10; stat typography §8.8; column counts §5.10.2): one to
 * four sourced headline numbers. The block is type and draws no chart; a
 * series is a separate §8.7 figure.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: stat.module.css; CVA function `statBlock`.
 * - Axes: `kind` → row | hero | inline; `compact` → `compact` (four or
 *   more stats, §8.8; StatBlock sets it from the count); `primary`,
 *   `secondary` → scales module classes.
 * - Compound variants: none.
 * - Defaults: kind row, compact false (set from the count); color axes
 *   none [D133].
 * - Color fallback: inherits the scope (the mount's discs take the
 *   inherited secondary).
 * - States: static. A defined term is a `TooltipTrigger kind="term"`
 *   (§10.16) passed as the qualifier.
 * - Parts: base, cell (its top border is the `rule`), label, numeral
 *   (numeralCompact, numeralInline), unit (unitCompact), qualifier, delta,
 *   deltaGlyph, source, mount, mountArt, mountFront, mountUnder, caption.
 *   The derived layout classes countTwo, countThree, countFour, long (a
 *   figure over 5 characters) and threeShort (three figures of ≤ 4
 *   characters) come from the children.
 * - Scope: none.
 * - Container: `base` (the row) is the inline-size container `stat-row`.
 *   Baseline without support: four stats 2 × 2 (1-up if a figure runs past
 *   5 characters), never auto-fit; viewport fallbacks 1-up at
 *   --xs-n-below, 4-up (three: 3-up) at --lg-n-above.
 */
export const statBlock = cva(styles.base, {
  variants: {
    kind: {
      row: styles.row,
      hero: styles.hero,
      inline: styles.inline,
    },
    compact: {
      true: styles.compact,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'row',
    compact: false,
  },
})

type StatBlockVariants = VariantProps<typeof statBlock>
type StatKind = NonNullable<StatBlockVariants['kind']>

interface StatContextValue {
  kind: StatKind
  compact: boolean
}

const StatContext = React.createContext<StatContextValue>({ kind: 'row', compact: false })

/** Props for StatBlock: the kind, compact and color axes, and the stats. */
export type StatBlockProps = {
  /**
   * `row` (default): 1–4 rule-topped cells in a `dl`. `hero`: one numeral
   * on the blob mount, centered, with a caption, once per page and only on
   * light grounds and night (never forest or saturated grounds). `inline`:
   * one numeral in running text with its qualifier.
   */
  kind?: StatBlockVariants['kind']
  /**
   * Sets every figure in `type-stat-compact`. Default: on for four or more
   * stats, at every width, so figures never change size as the row wraps.
   */
  compact?: boolean
  /**
   * Primary Radix scale: every text and the cell rules. Never defaulted;
   * omitted, it inherits the scope [D133].
   */
  primary?: StatBlockVariants['primary']
  /** Secondary Radix scale: only the hero's mount discs. Never defaulted. */
  secondary?: StatBlockVariants['secondary']
  className?: string
  id?: string
  /** `Stat` elements: 1–4 in a row, exactly one in a hero or inline block. */
  children?: React.ReactNode
}

/**
 * The stat block. Reflows on its own width (the `stat-row` container): 1-up
 * below 360 px; four stats 2 × 2 until 4-up from 1024 px; three stats
 * 3-up from 1024 (from 768 when every figure has ≤ 4 characters); two
 * stats 2-up (1-up below 768 when a figure runs past 5 characters).
 */
export function StatBlock(props: StatBlockProps) {
  const { kind, compact, primary, secondary, className, id, children } = props
  const scope = useScopeAttributes()
  const resolvedKind: StatKind = kind ?? 'row'

  const stats = React.Children.toArray(children).filter((child) =>
    React.isValidElement<StatProps>(child)
  ) as React.ReactElement<StatProps>[]
  const count = stats.length
  const lengths = stats.map((stat) => figureLength(stat.props.value))
  const resolvedCompact = compact ?? count >= 4

  const derived =
    resolvedKind === 'row'
      ? [
          count === 2 ? styles.countTwo : '',
          count === 3 ? styles.countThree : '',
          count >= 4 ? styles.countFour : '',
          lengths.some((length) => length > 5) ? styles.long : '',
          count === 3 && lengths.every((length) => length > 0 && length <= 4)
            ? styles.threeShort
            : '',
        ]
          .filter(Boolean)
          .join(' ')
      : ''

  const context = React.useMemo(
    () => ({ kind: resolvedKind, compact: resolvedCompact }),
    [resolvedKind, resolvedCompact]
  )

  const classes = statBlock({
    kind,
    compact: resolvedCompact,
    primary,
    secondary,
    className: cx(derived, className),
  })

  const Element = resolvedKind === 'hero' ? 'figure' : resolvedKind === 'inline' ? 'span' : 'dl'

  return (
    <StatContext.Provider value={context}>
      <Element {...scope} id={id} className={classes}>
        {children}
      </Element>
    </StatContext.Provider>
  )
}

/** Props for Stat: the label, figure, unit, qualifier, delta and source of one stat. */
export interface StatProps {
  /** The caps label above the figure (`type-label`); author it in sentence case. */
  label?: React.ReactNode
  /**
   * The figure in lining tabular numerals, with locale separators and a
   * stated rounding ("67,000,000", "15,000+", "≈ 2.4 M"). A currency symbol
   * leads it at full size.
   */
  value: React.ReactNode
  /** The unit, set after a no-break space at roughly half the figure's size. */
  unit?: React.ReactNode
  /** A qualifier ("per plot") in `type-caption`; pass a `TooltipTrigger kind="term"` for a defined term. */
  qualifier?: React.ReactNode
  /** The change as words: "12% since 2023". Drawn after a ▲ or ▼, never color alone. */
  delta?: React.ReactNode
  /** The direction of `delta`: `up` ▲ or `down` ▼. */
  deltaDirection?: 'up' | 'down'
  /** The glyph's accessible name. Default "Up" or "Down". */
  deltaLabel?: string
  /** The source: a note reference (§8.12), in `type-small`. */
  source?: React.ReactNode
  className?: string
}

/**
 * One stat inside a `StatBlock`: label, figure with unit, qualifier, delta
 * and source. Give every stat a label, a unit where one applies, and a
 * source.
 */
export function Stat(props: StatProps) {
  const {
    label,
    value,
    unit,
    qualifier,
    delta,
    deltaDirection = 'up',
    deltaLabel,
    source,
    className,
  } = props
  const { kind, compact } = React.useContext(StatContext)

  const unitNode =
    unit == null ? null : (
      <span className={compact ? styles.unitCompact : styles.unit}>
        {' '}
        {unit}
      </span>
    )

  const deltaNode =
    delta == null ? null : (
      <>
        <svg
          className={styles.deltaGlyph}
          viewBox="0 0 16 16"
          role="img"
          aria-label={deltaLabel ?? (deltaDirection === 'down' ? 'Down' : 'Up')}
          focusable="false"
        >
          <path d={deltaDirection === 'down' ? 'M8 13 2 3h12z' : 'M8 3l6 10H2z'} />
        </svg>
        {delta}
      </>
    )

  if (kind === 'inline') {
    return (
      <>
        <span className={cx(styles.numeralInline, className)}>
          {value}
          {unit == null ? null : ` `}
          {unit}
        </span>
        {qualifier == null ? null : (
          <>
            {' '}
            <span className={styles.qualifier}>{qualifier}</span>
          </>
        )}
      </>
    )
  }

  if (kind === 'hero') {
    return (
      <>
        <div className={cx(styles.mount, className)}>
          <svg className={styles.mountArt} viewBox="0 0 142 140" aria-hidden="true" focusable="false">
            <path className={styles.mountUnder} transform="rotate(8 71 70)" d={UNDER_DISC} />
            <path className={styles.mountFront} d={FRONT_DISC} />
          </svg>
          <p className={styles.numeral}>
            {value}
            {unitNode}
          </p>
        </div>
        <figcaption className={styles.caption}>
          {label == null ? null : <span className={styles.label}>{label}</span>}
          {qualifier == null ? null : <span className={styles.qualifier}>{qualifier}</span>}
          {delta == null ? null : <span className={styles.delta}>{deltaNode}</span>}
          {source == null ? null : <span className={styles.source}>{source}</span>}
        </figcaption>
      </>
    )
  }

  return (
    <div className={cx(styles.cell, className)}>
      {label == null ? null : <dt className={styles.label}>{label}</dt>}
      <dd className={compact ? styles.numeralCompact : styles.numeral}>
        {value}
        {unitNode}
      </dd>
      {qualifier == null ? null : <dd className={styles.qualifier}>{qualifier}</dd>}
      {delta == null ? null : <dd className={styles.delta}>{deltaNode}</dd>}
      {source == null ? null : <dd className={styles.source}>{source}</dd>}
    </div>
  )
}

/*
 * The blob mount (§6.6): an irregular hand-cut disc (asset geometry, about
 * 136 × 130) and an under-disc about 4% larger, rotated 8°, that shows only
 * thin crescents.
 */
const FRONT_DISC =
  'M72 5C104 4 137 26 138 66C139 102 112 135 70 135C33 136 5 108 5 69C5 34 34 6 72 5Z'
const UNDER_DISC =
  'M72 2C106 1 140 24 141 66C142 104 114 139 70 139C31 140 2 111 2 69C2 32 32 3 72 2Z'

/** Characters in a plain-text figure; 0 when the figure isn't plain text. */
function figureLength(value: React.ReactNode): number {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).replace(/\s/g, '').length
  }
  return 0
}

