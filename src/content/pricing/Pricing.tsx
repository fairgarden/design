'use client'

import * as React from 'react'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import { cva, type VariantProps } from 'class-variance-authority'

import { Badge } from '../../feedback/badge'
import { Card, CardChoice } from '../card'
import { Icon } from '../../foundations/icon'
import { cx } from '../../utils/className'
import {
  primaryScaleVariants,
  secondaryScaleVariants,
  type PrimaryScale,
  type RadixScale,
} from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './pricing.module.css'

/*
 * Pricing (§12.9), v1 [D169]: honest, comparable prices: items, sales,
 * plans, membership or donation tiers, wholesale matrices. Composed from
 * inline `data` prices, faced tier cards, a Radio per tier when a plan feeds
 * a form (§10.8), Buttons (§9.2) and a `table` for the matrix.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: pricing.module.css; CVA functions `pricing` and `pricingTier`.
 * - Axes: `kind` → inline | menu | sale | tiers | matrix → `inline`, `menu`,
 *   `sale`, `tiers`, `kindMatrix` (axis-prefixed: `matrix` is also a part);
 *   `primary`, `secondary` → scales module classes. `pricingTier`:
 *   `recommended` → `recommended` (default false).
 * - Compound variants: none.
 * - Defaults: none (`kind` is required); color axes: none.
 * - Color fallback: inherits the scope. The action Button aliases its
 *   secondary to the scope's action scale in its own `solid` class; the
 *   badge computes its own scale.
 * - States: `tier:has(choice [data-checked])` → the selected edge
 *   (--border-size-2-25 --primary12 in the outer scope, drawn by the Card's
 *   `--card-frame` hook over its --role-edge edge); `choice` is the Card's
 *   `CardChoice`, so its `data-disabled` draws the Card's line-dotted-fine
 *   unavailable edge, and the module adds --role-muted ink; the action's
 *   hover, focus and press follow §9.2. No frame or edge hover [D181].
 * - Parts: base, price (`data`), qualifier, currency, amount, cents,
 *   period, struck, save, tierList, tier, frame (the tier's faced Card),
 *   tierName, summary, features, feature, check, badge, choice (the Radio
 *   slot), action, matrix (with cellLabel), asOf.
 * - Scope: `tier` holds a faced Card (§12.2), whose nested face Ground
 *   resolves the face per ground and draws the rest edge in its --role-edge:
 *   a white face with a --primary10 edge on a page ground, a paper light
 *   island with a --primary12 edge inside a field [D177, D179]; the module
 *   names no preset and no edge color of its own.
 * - Container: `base` is the inline-size container `pricing` (tiers and
 *   matrix kinds); `tierList` and `matrix` query it. Baseline without
 *   support: tier cards stacked, recommended first, with the viewport
 *   fallback of the columns from --lg-n-above; the matrix keeps its columns,
 *   one block per row at --xs-n-below. Thresholds (§5.10.2): tier columns
 *   from 1024; matrix blocks below 360 [D163].
 */
export const pricing = cva(styles.base, {
  variants: {
    kind: {
      inline: styles.inline,
      menu: styles.menu,
      sale: styles.sale,
      tiers: styles.tiers,
      matrix: styles.kindMatrix,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

/** Tier classes: `recommended` draws the --border-size-2-25 --primary12 frame and the badge. */
export const pricingTier = cva(styles.tier, {
  variants: {
    recommended: {
      true: styles.recommended,
    },
  },
  defaultVariants: {
    recommended: false,
  },
})

type PricingVariants = VariantProps<typeof pricing>

/** The five pricing builds (§12.9). */
export type PricingKind = 'inline' | 'menu' | 'sale' | 'tiers' | 'matrix'

interface PricingContextValue {
  kind: PricingKind
  primary: PrimaryScale | undefined
  secondary: RadixScale | undefined
}

const PricingContext = React.createContext<PricingContextValue>({
  kind: 'inline',
  primary: undefined,
  secondary: undefined,
})
PricingContext.displayName = 'PricingContext'

/** Props for Pricing: `div` props, `render`, the kind and the color axes. */
export type PricingProps = useRender.ComponentProps<'div'> & {
  /**
   * Required. `inline`: "From $49" in running text, figure bold. `menu`: a
   * mono figure on its own line or at a leader row's end (§12.13). `sale`:
   * the struck original in `--role-muted`, the current price bold, then
   * "Save $300" as a word. `tiers`: 2–4 plans as faced cards, stacked, as
   * columns from 1024 px of container. `matrix`: rows × columns of prices
   * in a table, one block per row below 360 px of container.
   */
  kind: PricingKind
  /**
   * Primary Radix scale: prices, strikes, frames and checks. Never
   * defaulted; omitted, it inherits the scope [D133].
   */
  primary?: PricingVariants['primary']
  /**
   * Secondary Radix scale: the tier Radio's selection (`--role-select`) and
   * the badge. Never defaulted.
   */
  secondary?: PricingVariants['secondary']
}

/**
 * The pricing module. Inline, menu and sale prices hold a `PricingPrice`
 * (and, for a sale, a `PricingStruck` and a `PricingSave`); pass
 * `render={<span />}` inside running text. A tier set holds a
 * `PricingTierList` of `PricingTier`s; a matrix a `PricingMatrix`. Close a
 * tier set or matrix with `PricingAsOf`. Show the unit and period with
 * every price, never mark a sale with red alone, and never hide fees.
 */
export function Pricing(props: PricingProps) {
  const { render, ref, className, kind, primary, secondary, ...rest } = props
  const scope = useScopeAttributes()
  const context = React.useMemo<PricingContextValue>(
    () => ({ kind, primary: primary ?? undefined, secondary: secondary ?? undefined }),
    [kind, primary, secondary]
  )
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>(
      {
        ...scope,
        className: pricing({ kind, primary, secondary, className }),
      },
      rest
    ),
  })
  return <PricingContext.Provider value={context}>{element}</PricingContext.Provider>
}

/** Props for PricingPrice: `data` props, `render` and the hidden label. */
export type PricingPriceProps = useRender.ComponentProps<'data'> & {
  /** The machine-readable amount, e.g. `"49.00"`; written as the `data` element's `value`. */
  value?: string | number
  /**
   * Words for assistive technology only, read before the price: "Now" for
   * the current price of a sale.
   */
  label?: React.ReactNode
}

/**
 * One price, a `data` element: `PricingQualifier` ("From"), `PricingCurrency`,
 * `PricingAmount`, `PricingCents` and `PricingPeriod`, in the locale's
 * order (author the spaces). Kept on one line.
 */
export function PricingPrice(props: PricingPriceProps) {
  const { render, ref, className, value, label, children, ...rest } = props
  return useRender({
    defaultTagName: 'data',
    render,
    ref,
    props: mergeProps<'data'>(
      {
        value: value == null ? undefined : String(value),
        className: cx(styles.price, className),
        children: (
          <>
            {label != null ? <span className={styles.visuallyHidden}>{label} </span> : null}
            {children}
          </>
        ),
      },
      rest
    ),
  })
}

/** Props for the small price parts: `span` props and `render`. */
export type PricingPartProps = useRender.ComponentProps<'span'>

/** The qualifier, e.g. "From": regular weight, before the figure. */
export function PricingQualifier(props: PricingPartProps) {
  return <PricingPart {...props} own={styles.qualifier} />
}

/** The currency sign: with the figure inline; `type-caption` beside a tier's figure. */
export function PricingCurrency(props: PricingPartProps) {
  const { kind } = React.useContext(PricingContext)
  return <PricingPart {...props} own={kind === 'tiers' ? styles.unitCaption : styles.currency} />
}

/**
 * The figure, in data numerals: bold in body text (inline, sale), mono
 * (menu), `type-stat-compact` in a tier.
 */
export function PricingAmount(props: PricingPartProps) {
  const { kind } = React.useContext(PricingContext)
  const own =
    kind === 'tiers' ? styles.amountStat : kind === 'menu' ? styles.amountMono : styles.amount
  return <PricingPart {...props} own={own} />
}

/** Optional retail cents as a superscript at 60%, never below `--font-size-0`. */
export function PricingCents(props: PricingPartProps) {
  return <PricingPart {...props} own={styles.cents} />
}

/**
 * The period or unit, e.g. "/ month", after a thin space the part adds; on
 * the figure's line, `type-caption` in a tier.
 */
export function PricingPeriod(props: PricingPartProps) {
  const { children, ...rest } = props
  const { kind } = React.useContext(PricingContext)
  return (
    <PricingPart {...rest} own={kind === 'tiers' ? styles.unitCaption : styles.period}>
      {' '}
      {children}
    </PricingPart>
  )
}

/** Props for PricingStruck: `s` props, `render` and the hidden label. */
export type PricingStruckProps = useRender.ComponentProps<'s'> & {
  /** Words for assistive technology only, read before the struck price. Default "Was". */
  label?: React.ReactNode
}

/**
 * The original price of a sale, struck through at `--border-size-1-5` in
 * `--role-muted` (never a status color), with a hidden "Was" for assistive
 * technology. Put a `PricingPrice` inside.
 */
export function PricingStruck(props: PricingStruckProps) {
  const { render, ref, className, label = 'Was', children, ...rest } = props
  return useRender({
    defaultTagName: 's',
    render,
    ref,
    props: mergeProps<'s'>(
      {
        className: cx(styles.struck, className),
        children: (
          <>
            <span className={styles.visuallyHidden}>{label} </span>
            {children}
          </>
        ),
      },
      rest
    ),
  })
}

/** The saving as a word, "Save $300", in `--primary12`: the word carries the sale, not a color. */
export function PricingSave(props: PricingPartProps) {
  return <PricingPart {...props} own={styles.save} />
}

/** Props for PricingTierList: list props and `render`. */
export type PricingTierListProps = useRender.ComponentProps<'ul'>

/**
 * The tier set's layout, queried on the `pricing` container: stacked below
 * 1024 px of container (author the recommended tier first, since visual
 * order follows source order), columns of one comparison row from 1024,
 * capped at `--fgd-container-content`. When the plans feed a form, wrap it
 * in a `RadioGroup` and put each tier's `Radio` in its `PricingChoice`.
 */
export function PricingTierList(props: PricingTierListProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'ul',
    render,
    ref,
    props: mergeProps<'ul'>({ className: cx(styles.tierList, className) }, rest),
  })
}

/** Props for PricingTier: list-item props, `render`, `recommended` and the badge word. */
export type PricingTierProps = useRender.ComponentProps<'li'> &
  VariantProps<typeof pricingTier> & {
    /**
     * Marks the recommended plan: a `--border-size-2-25` `--primary12` frame and
     * the badge. Default `false`. Never fill-only.
     */
    recommended?: boolean
    /**
     * The badge word straddling the top edge. Defaults to "Recommended" on
     * the recommended tier; pass your own words, or `null` for none.
     */
    badge?: React.ReactNode
    /** Props for the tier's frame, the faced Card (an `article`), such as `aria-labelledby`. */
    frameProps?: Omit<useRender.ComponentProps<'article'>, 'children'>
  }

/**
 * One plan: a faced card (`article`) holding `PricingTierName`, a
 * `PricingPrice`, `PricingSummary`, `PricingFeatures`, an optional
 * `PricingChoice` (a Radio, when the plan feeds a form) and a
 * `PricingAction` (a Button, "Choose Basic"). Selected and unavailable
 * states follow the Radio's `data-checked` and `data-disabled`.
 */
export function PricingTier(props: PricingTierProps) {
  const {
    render,
    ref,
    className,
    recommended = false,
    badge,
    frameProps,
    children,
    ...rest
  } = props
  const { primary, secondary } = React.useContext(PricingContext)
  const badgeWord = badge === undefined ? (recommended ? 'Recommended' : null) : badge

  return useRender({
    defaultTagName: 'li',
    render,
    ref,
    props: mergeProps<'li'>(
      {
        className: pricingTier({ recommended, className }),
        children: (
          <>
            {badgeWord != null ? (
              <span className={styles.badge}>
                <span className={styles.badgeHalo}>
                  <Badge primary={primary} secondary={secondary}>
                    {badgeWord}
                  </Badge>
                </span>
              </span>
            ) : null}
            <Card
              {...frameProps}
              faced
              primary={primary}
              secondary={secondary}
              className={cx(styles.frame, frameProps?.className)}
            >
              {children}
            </Card>
          </>
        ),
      },
      rest
    ),
  })
}

/** Props for PricingTierName: heading props and `render` (default `<h3>`). */
export type PricingTierNameProps = useRender.ComponentProps<'h3'>

/** The plan's name: `type-itemhead` in `--primary12`. Renders `<h3>`. */
export function PricingTierName(props: PricingTierNameProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'h3',
    render,
    ref,
    props: mergeProps<'h3'>({ className: cx(styles.tierName, className) }, rest),
  })
}

/** Props for PricingSummary: paragraph props and `render`. */
export type PricingSummaryProps = useRender.ComponentProps<'p'>

/** The one-line summary: `type-body-ui` in `--primary12`. */
export function PricingSummary(props: PricingSummaryProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: mergeProps<'p'>({ className: cx(styles.summary, className) }, rest),
  })
}

/** Props for PricingFeatures: list props and `render`. */
export type PricingFeaturesProps = useRender.ComponentProps<'ul'>

/** The feature list, in full under each tier. Omit excluded features; never strike them. */
export function PricingFeatures(props: PricingFeaturesProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'ul',
    render,
    ref,
    props: mergeProps<'ul'>({ className: cx(styles.features, className) }, rest),
  })
}

/** Props for PricingFeature: list-item props and `render`. */
export type PricingFeatureProps = useRender.ComponentProps<'li'>

/** One included feature, led by the inline-tier `check` icon (hidden: the words carry it). */
export function PricingFeature(props: PricingFeatureProps) {
  const { render, ref, className, children, ...rest } = props
  return useRender({
    defaultTagName: 'li',
    render,
    ref,
    props: mergeProps<'li'>(
      {
        className: cx(styles.feature, className),
        children: (
          <>
            <Icon name="check" size="inline" className={styles.check} />
            <span>{children}</span>
          </>
        ),
      },
      rest
    ),
  })
}

/** Props for PricingChoice: `div` props and `render`. */
export type PricingChoiceProps = useRender.ComponentProps<'div'>

/**
 * The plan choice, the tier Card's `CardChoice`: put the tier's `Radio` here
 * (its group wraps the tier list). Its `data-checked` selects the tier's
 * edge; its `data-disabled` marks the tier unavailable (then say
 * "Unavailable" in `PricingAction`).
 */
export function PricingChoice(props: PricingChoiceProps) {
  const { className, ...rest } = props
  return <CardChoice {...rest} className={cx(styles.choice, className)} />
}

/** Props for PricingAction: `div` props and `render`. */
export type PricingActionProps = useRender.ComponentProps<'div'>

/**
 * The tier's action: a Button with a title-case label ("Start Free Trial"),
 * or the word "Unavailable". Prints as "Label (short URL)".
 */
export function PricingAction(props: PricingActionProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({ className: cx(styles.action, className) }, rest),
  })
}

/** Props for PricingMatrix: `table` props, `render` and the scroll region's name. */
export type PricingMatrixProps = useRender.ComponentProps<'table'> & {
  /**
   * Names the scrolling wrapper for assistive technology, which then is a
   * focusable `region` (so keyboards can scroll a wide matrix).
   */
  label?: string
}

/**
 * The price matrix: a §8.2 table (rows by species or size × retail and
 * wholesale columns) with `--role-rule` row rules and a `line-double-hair`
 * total rule above the `tfoot` (the minimum order). Author `thead`,
 * `tbody` and `tfoot`; use `PricingCell` with a `label` so each value keeps
 * its column name when rows become blocks below 360 px of container.
 */
export function PricingMatrix(props: PricingMatrixProps) {
  const { render, ref, className, label, ...rest } = props
  const table = useRender({
    defaultTagName: 'table',
    render,
    ref,
    props: mergeProps<'table'>({ className: cx(styles.matrix, className) }, rest),
  })
  return (
    <div
      className={styles.matrixScroll}
      {...(label ? { role: 'region', 'aria-label': label, tabIndex: 0 } : null)}
    >
      {table}
    </div>
  )
}

/** Props for PricingCell: `td` props, `render` and the column name. */
export type PricingCellProps = useRender.ComponentProps<'td'> & {
  /** The column's name ("Wholesale"), shown before the value only when rows are blocks. */
  label?: React.ReactNode
}

/** A matrix value cell; its `label` repeats the column header in the block form. */
export function PricingCell(props: PricingCellProps) {
  const { render, ref, className, label, children, ...rest } = props
  return useRender({
    defaultTagName: 'td',
    render,
    ref,
    props: mergeProps<'td'>(
      {
        className,
        children: (
          <>
            {label != null ? <span className={styles.cellLabel}>{label}</span> : null}
            {children}
          </>
        ),
      },
      rest
    ),
  })
}

/** Props for PricingAsOf: paragraph props and `render`. */
export type PricingAsOfProps = useRender.ComponentProps<'p'>

/**
 * The provenance line, "Prices as of 1 Sep 2026 (short URL)": `type-caption`
 * after a tier set or matrix, on screen and in print (§12.9, P10).
 */
export function PricingAsOf(props: PricingAsOfProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: mergeProps<'p'>({ className: cx(styles.asOf, className) }, rest),
  })
}

/** A price part: a `span` with its module class first. */
function PricingPart(props: PricingPartProps & { own: string }) {
  const { render, ref, className, own, ...rest } = props
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: mergeProps<'span'>({ className: cx(own, className) }, rest),
  })
}

