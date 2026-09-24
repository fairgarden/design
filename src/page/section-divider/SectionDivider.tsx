'use client'

import * as React from 'react'
import { Separator as BaseSeparator } from '@base-ui/react/separator'
import { cva, type VariantProps } from 'class-variance-authority'

import { Ground } from '../../foundations/ground'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScope, useScopeAttributes } from '../../utils/scope'
import styles from './section-divider.module.css'

/*
 * Section Divider & Shaped Edge (§11.2) [D172, D179, D189].
 *
 * Implementation (CSS Modules + CVA)
 * - Module: section-divider.module.css; CVA function `sectionDivider`.
 * - Axes: `kind` → straight | seam | page-seam | chrome | pause | hill |
 *   fringe → kindStraight, kindSeam, kindPageSeam, kindChrome, kindPause,
 *   kindHill, kindFringe (prefixed, because `fringe` is also a part);
 *   `heavy` → `heavy` (chrome only); `ornament` → dotted | dot | star →
 *   ornamentDotted, ornamentDot, ornamentStar (pause only; the §11.2
 *   Variants table names the three pause ornaments); `primary`,
 *   `secondary` → scales module classes.
 * - Compound variants: none. The types exclude `heavy` without
 *   `kind="chrome"` and `ornament` without `kind="pause"`.
 * - Defaults: kind straight, heavy false; color axes: none.
 * - Color fallback: inherits the scope, the lower band's (the bar's for a
 *   chrome rule).
 * - States: none (static). Under --forcedColors and in print `fallback`
 *   shows instead of `shape` and `fringe`.
 * - Parts: base, rule (Base UI Separator, data-orientation="horizontal"),
 *   ornament (the pause), shape (the hill), fringe (the tick row),
 *   fallback (the straight rule, print and forced colors only).
 * - Scope: none of its own. The shaped edges read the night band's
 *   --ds-edge-shaped switch (block only where tone separates the seam:
 *   the night band against a page ground in light mode [D179]); on a page
 *   ground the `shape` and `fringe` hosts are aria-hidden `night` band
 *   Grounds that carry that switch only, painting nothing of their own.
 * - Container: none; inherits its context. The hill's amplitude is a
 *   page-frame rule on the band's width.
 *
 * Placement. A band seam (seam, page-seam, hill, fringe) is the lower
 * band's first child: it inherits that band's scope and pulls itself up
 * through the band's --ds-space-section top padding (§11.1) to sit on the
 * seam. `chrome` and `pause` sit in the flow where they are placed.
 */
export const sectionDivider = cva(styles.base, {
  variants: {
    kind: {
      straight: styles.kindStraight,
      seam: styles.kindSeam,
      'page-seam': styles.kindPageSeam,
      chrome: styles.kindChrome,
      pause: styles.kindPause,
      hill: styles.kindHill,
      fringe: styles.kindFringe,
    },
    heavy: {
      true: styles.heavy,
    },
    ornament: {
      dotted: styles.ornamentDotted,
      dot: styles.ornamentDot,
      star: styles.ornamentStar,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'straight',
    heavy: false,
  },
})

type SectionDividerVariants = VariantProps<typeof sectionDivider>

/** The seven §11.2 builds. */
export type SectionDividerKind = NonNullable<SectionDividerVariants['kind']>

/** The pause ornament: `line-dotted`, `ornament-rule-dot` or `ornament-rule-star` (§4.8.2). */
export type SectionDividerOrnament = NonNullable<SectionDividerVariants['ornament']>

type SectionDividerCommonProps = Omit<React.ComponentPropsWithRef<'div'>, 'children'> & {
  /**
   * Primary Radix scale: the rule, dots and ticks. Never defaulted;
   * omitted, it inherits the lower band's scope [D133].
   */
  primary?: SectionDividerVariants['primary']
  /**
   * Secondary Radix scale: drives only the ornament-rule strokes
   * (`--role-accent`). Never defaulted.
   */
  secondary?: SectionDividerVariants['secondary']
}

type SectionDividerKindProps =
  | {
      /**
       * `straight` (default): the hard cut; no element renders, the ground
       * change is the seam. `seam`: the same-ground `--role-rule` seam.
       * `page-seam`: the hairline between two different page grounds, in
       * the lower band's `--role-hairline`, in both modes [D179]. `hill`:
       * the hill on the night media hero's lower seam, light mode
       * only [D189]. `fringe`: the hatched fringe on the night band's edge,
       * light mode only [D172]. `chrome`: a header or footer chrome rule.
       * `pause`: an ornamental pause inside one band.
       */
      kind?: 'straight' | 'seam' | 'page-seam' | 'hill' | 'fringe'
      heavy?: never
      ornament?: never
    }
  | {
      kind: 'chrome'
      /**
       * The heavy chrome option (§4.3): `--border-size-2` in `--primary12`,
       * for technical pages only [D174]. Default `false`.
       */
      heavy?: boolean
      ornament?: never
    }
  | {
      kind: 'pause'
      heavy?: never
      /**
       * `dotted` (default): a centered `line-dotted` run in `--role-rule`.
       * `dot`: rule–dot–rule; `star`: dot-and-star, both in `--role-accent`.
       */
      ornament?: SectionDividerOrnament
    }

/** Props for SectionDivider: `div` props, the kind with its options, and the color axes. */
export type SectionDividerProps = SectionDividerCommonProps & SectionDividerKindProps

/** A centered run of true round dots (§4.8.3), drawn in SVG so it prints. */
function DotRun() {
  return (
    <span className={styles.run}>
      <svg className={styles.dots} aria-hidden="true" focusable="false">
        <line className={styles.dotLine} x1="0" y1="50%" x2="100%" y2="50%" />
      </svg>
    </span>
  )
}

/** The five-point `--ds-ornament-star` (9 px), solid, on the dotted run's centre line. */
function Star({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path d="M9 1 11 6.75 17.08 6.87 12.23 10.55 14 16.38 9 12.9 4 16.38 5.77 10.55 0.92 6.87 7 6.75Z" />
    </svg>
  )
}

function Ornament({ ornament }: { ornament: SectionDividerOrnament }) {
  if (ornament === 'dot') {
    return (
      <span className={styles.ornament}>
        <span className={styles.segment} />
        <svg className={styles.dot} viewBox="0 0 2 2" aria-hidden="true" focusable="false">
          <circle cx="1" cy="1" r="1" />
        </svg>
        <span className={styles.segment} />
      </span>
    )
  }
  if (ornament === 'star') {
    return (
      <span className={styles.ornament}>
        <DotRun />
        <Star className={styles.star} />
        <DotRun />
      </span>
    )
  }
  return (
    <span className={styles.ornament}>
      <DotRun />
    </span>
  )
}

/**
 * The seam between two bands, or a pause inside one. Render a band seam
 * (`seam`, `page-seam`, `hill`, `fringe`) as the first child of the lower
 * band's `<Ground kind="band">`, whose block padding is `--ds-space-section`
 * (§11.1): the divider takes that band's colors and sits on its top edge.
 *
 * A shaped edge sits only where tone separates the seam: the night band
 * against a page ground in light mode [D179]. On a dark page it drops for
 * the night band's straight `--primary12` seam, and in print and forced
 * colors for a straight rule. Use one shaped edge per page at most.
 * - `hill`: first child of the page-ground band under the `night` media
 *   hero. The lower ground rises into the hero as one asymmetric curve,
 *   4.6% of the width clamped 12–64 px, cresting at 0.667 of the width; no
 *   rule runs under it [D189]. The amplitude joins the band's top padding.
 * - `fringe`: first child of the `night` footer (ticks in the night band's
 *   ink), or of the page-ground band under the `night` media hero (ticks in
 *   that band's ink), hanging from the seam.
 */
export function SectionDivider(props: SectionDividerProps) {
  const { kind, heavy, ornament, primary, secondary, className, ...rest } = props

  const scope = useScope()
  const scopeAttributes = useScopeAttributes()
  const resolvedKind: SectionDividerKind = kind ?? 'straight'

  // The hard cut is the ground change itself: no element (§11.2 Base UI).
  if (resolvedKind === 'straight') return null

  const onNight = scope.ground === 'night'
  const classes = sectionDivider({
    kind: resolvedKind,
    heavy: resolvedKind === 'chrome' && heavy === true,
    ornament: resolvedKind === 'pause' ? (ornament ?? 'dotted') : undefined,
    primary,
    secondary,
    className,
  })

  if (resolvedKind === 'seam' || resolvedKind === 'page-seam' || resolvedKind === 'chrome') {
    return (
      <div {...scopeAttributes} {...rest} aria-hidden="true" className={classes}>
        <BaseSeparator orientation="horizontal" className={styles.rule} />
      </div>
    )
  }

  if (resolvedKind === 'pause') {
    return (
      <div {...scopeAttributes} {...rest} aria-hidden="true" className={classes}>
        <Ornament ornament={ornament ?? 'dotted'} />
      </div>
    )
  }

  if (resolvedKind === 'hill') {
    // On a page ground the host is a `night` Ground carrying only the
    // shaped-edge switch; the curve paints this band's own ground. The hill
    // has no meaning inside the night band itself, so nothing draws there.
    return (
      <div {...scopeAttributes} {...rest} aria-hidden="true" className={classes}>
        {onNight ? null : (
          <Ground kind="band" preset="night" render={<span />} className={styles.shape} />
        )}
        <span className={styles.fallback} />
      </div>
    )
  }

  // fringe. Inside the night band (the footer's top edge) the root takes the
  // band's own switch and ink; on a page ground a `night` Ground host carries
  // the switch and the ticks take this band's --primary12 through `color`.
  return (
    <div {...scopeAttributes} {...rest} aria-hidden="true" className={classes}>
      {onNight ? (
        <span className={styles.fringe} />
      ) : (
        <Ground
          kind="band"
          preset="night"
          render={<span />}
          className={`${styles.fringe} ${styles.fringeOnPage}`}
        />
      )}
      <span className={styles.fallback} />
    </div>
  )
}
