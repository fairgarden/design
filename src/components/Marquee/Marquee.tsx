'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Ground } from '../Ground'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './marquee.module.css'

/*
 * Marquee (§11.12, the marquee band): a thin, loud scene divider of brand
 * phrases, once per page. Static only [D169]: it never moves, so it has no
 * motion control. By default the phrases sit in a full-container `forest`
 * field; they may instead run on the page ground [D180].
 *
 * Implementation (CSS Modules + CVA)
 * - Module: marquee.module.css; CVA function `marquee` (the spec's
 *   `marqueeBand`, named for the component).
 * - Axes: `kind` → static | ticker → `static`, `ticker` (phrases, or the
 *   quote ticker between rules); `fielded` → `fielded` (the phrases in a
 *   full-container field; default for `static`, excluded for `ticker`)
 *   [D180]; `hanging` → `hanging` (a hanging drawing, computed from the
 *   `drawing` prop); `primary`, `secondary` → scales module classes.
 * - Compound variants: none.
 * - Defaults: kind static, fielded true (static only), hanging false; color
 *   axes: none [D133].
 * - Color fallback: inherits the scope, or the field preset's defaults.
 *   Secondary drives nothing: the marquee is one ink on every preset.
 * - States: none; it renders the same under every motion preference [D169].
 * - Parts: base, container, field, run (with `marqueeText` or
 *   `tickerText`, the run's type role), phrase, dot, drawing; the ticker's
 *   `rule`s are the root's own full-bleed borders.
 * - Scope: the root sits on its band's page ground. With `fielded`, `field`
 *   is a `kind="field"` Ground (`forest` by default; `leaf` or `amber`
 *   within their rations) with its radius and its `--primary12` edge in
 *   `--role-edge` [D177, D178].
 * - Container: none: a page-frame part. Place it full width in its band;
 *   it sets its own `--ds-container-content` container, and any responsive
 *   change is a viewport rule [D163].
 */
export const marquee = cva(styles.base, {
  variants: {
    kind: {
      static: styles.static,
      ticker: styles.ticker,
    },
    fielded: {
      true: styles.fielded,
    },
    hanging: {
      true: styles.hanging,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'static',
    hanging: false,
  },
})

type MarqueeVariants = VariantProps<typeof marquee>

/** The fields a marquee may sit in [D180]: `forest` (default), `leaf` or `amber`, within their rations. */
export type MarqueeField = 'forest' | 'leaf' | 'amber'

interface MarqueeCommonProps extends Omit<React.ComponentPropsWithRef<'section'>, 'children'> {
  /** The section's accessible name, e.g. "What we stand for". */
  label: string
  /**
   * The phrases, each shown whole, separated by dots. Short brand phrases
   * or social proof, never facts a reader needs; ≤ 2 lines at base.
   */
  phrases: readonly string[]
  /**
   * An optional hanging drawing (an `aria-hidden` SVG at `--ds-size-art-l`,
   * `--ds-size-art-s` below `--md-n-above`): `--primary12` lines
   * (`currentColor`) and `--role-halo` fills. It tucks under the field's
   * bottom edge and hangs into the page ground below.
   */
  drawing?: React.ReactNode
  /**
   * Primary Radix scale: the phrases, dots and rules. Never defaulted;
   * omitted, it inherits the scope or the field's defaults [D133].
   */
  primary?: MarqueeVariants['primary']
  /** Secondary Radix scale: accepted for the shared contract; unused. Never defaulted. */
  secondary?: MarqueeVariants['secondary']
}

interface MarqueeStaticProps extends MarqueeCommonProps {
  /**
   * `static` (default): the phrases set once, centered, in a field or on
   * the page ground. `ticker`: serif sentences on the page ground between
   * two full-bleed rules.
   */
  kind?: 'static'
  /**
   * The phrases sit in a full-container field (default `true`); `false`
   * runs them on the page ground [D180].
   */
  fielded?: boolean
  /** The field preset. Default `forest`. */
  field?: MarqueeField
}

interface MarqueeTickerProps extends MarqueeCommonProps {
  kind: 'ticker'
  fielded?: false
  field?: never
}

/** Props for Marquee: `section` props, the label, phrases, kind, field and drawing, and the color axes. */
export type MarqueeProps = MarqueeStaticProps | MarqueeTickerProps

function Dot() {
  return (
    <svg className={styles.dot} viewBox="0 0 2 2" aria-hidden="true" focusable="false">
      <circle cx="1" cy="1" r="1" />
    </svg>
  )
}

/**
 * The marquee band. It never scrolls, clips or animates [D169]: every
 * phrase shows whole. In print the phrases print once, centered, between two
 * 1.5 pt rules, and the field's fill drops.
 */
export function Marquee(props: MarqueeProps) {
  const {
    kind,
    fielded: fieldedProp,
    field,
    label,
    phrases,
    drawing,
    primary,
    secondary,
    className,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const resolvedKind = kind ?? 'static'
  const fielded = resolvedKind === 'static' && fieldedProp !== false
  const hanging = drawing != null

  const run = (
    <p className={styles.run}>
      <span className={resolvedKind === 'ticker' ? styles.tickerText : styles.marqueeText}>
        {phrases.map((phrase, index) => (
          <React.Fragment key={`${index}-${phrase}`}>
            {index > 0 ? (
              <>
                {' '}
                <Dot />{' '}
              </>
            ) : null}
            <span className={styles.phrase}>{phrase}</span>
          </React.Fragment>
        ))}
      </span>
    </p>
  )

  return (
    <section
      {...rest}
      {...scope}
      aria-label={label}
      className={marquee({ kind: resolvedKind, fielded, hanging, primary, secondary, className })}
    >
      <div className={styles.container}>
        {fielded ? (
          <Ground kind="field" preset={field ?? 'forest'} render={<div />} className={styles.field}>
            {run}
          </Ground>
        ) : (
          run
        )}
        {hanging ? (
          <div className={styles.drawing} aria-hidden="true">
            {drawing}
          </div>
        ) : null}
      </div>
    </section>
  )
}
