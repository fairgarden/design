'use client'

import * as React from 'react'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import { cva, type VariantProps } from 'class-variance-authority'

import { Link, type LinkProps } from '../../actions/link'
import { SectionHeader, type SectionHeaderProps } from '../../page/section-header'
import { cx } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './card-grid.module.css'

/*
 * Card Grid (§12.3): 3–24 peer cards to browse. Composed from `section` +
 * the §11.8 header + a `ul` of cards (§12.2) + an optional footer link.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: card-grid.module.css; CVA function `cardGrid`.
 * - Axes: `kind` → editorial | compact | block | lead; `primary`,
 *   `secondary` → scales module classes.
 * - Compound variants: none.
 * - Defaults: none (`kind` is required); color axes: none.
 * - Color fallback: inherits the scope. Bare cards inherit the grid's
 *   scales; pass `primary` / `secondary` to faced cards too, whose face
 *   Ground otherwise takes its preset defaults.
 * - States: the grid has none. `footerLink` is a standalone Link, which owns
 *   its hover, focus and press states (§9.3). No class marks an empty
 *   result: render §12.16 (EmptyState) in place of `list`.
 * - Parts: base, header (the §11.8 SectionHeader, from the `header` prop or
 *   composed in `CardGridHeader`), toolbar (filter chips and sort), count (the polite
 *   live region), list, item, footer, footerLink (a standalone Link, styled
 *   by its own module; footerGlyph is the Link's chevron).
 * - Scope: none.
 * - Container: `base` is the inline-size container `card-grid`; `list`
 *   queries it, and each card's face padding reads it (§12.2). Baseline
 *   without support: `list` is a grid auto-fit with minmax tracks at the
 *   288 px card minimum (compact 152 px), capped at 3 (compact 4), gutter
 *   --ds-space-margin; compact drops to 1 column at --xs-n-below.
 *   Thresholds (§5.10.2): editorial and block 2-up from 608, 3-up from 944;
 *   compact 1 below 360, 2 below 704, 4-up from 704 [D163].
 */
export const cardGrid = cva(styles.base, {
  variants: {
    kind: {
      editorial: styles.editorial,
      compact: styles.compact,
      block: styles.block,
      lead: styles.lead,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

type CardGridVariants = VariantProps<typeof cardGrid>

/** The four grid builds (§12.3). */
export type CardGridKind = 'editorial' | 'compact' | 'block' | 'lead'

/** Props for CardGrid: `section` props, `render`, the kind and the color axes. */
export type CardGridProps = useRender.ComponentProps<'section'> & {
  /**
   * Required. `editorial`: articles and programs, 1 → 2 → 3 columns.
   * `compact`: species, products and team, 1 → 2 → 4 columns. `block`: the
   * block-edge featured cards (1–3 per page, one card family), 1 → 2 → 3
   * columns with extra clearance for the heavy edge. `lead`: one lead card
   * across the grid, followed by §12.11 index rows.
   */
  kind: CardGridKind
  /**
   * Primary Radix scale: the count and footer link text. Never defaulted;
   * omitted, it inherits the scope [D133].
   */
  primary?: CardGridVariants['primary']
  /**
   * Secondary Radix scale: the footer link's underline and chevron
   * (`--role-accent`, `--role-glyph`). Never defaulted.
   */
  secondary?: CardGridVariants['secondary']
  /**
   * The module header (§11.8), rendered in the header slot before the
   * children: a `SectionHeader` props object (the section is then labelled
   * by its heading), or any node, such as a `SectionHeader` element. Omit it
   * to compose `CardGridHeader` yourself.
   */
  header?: React.ReactNode | SectionHeaderProps
}

/** A `SectionHeader` props object rather than a React node. */
function isSectionHeaderProps(value: unknown): value is SectionHeaderProps {
  return (
    typeof value === 'object' &&
    value !== null &&
    !React.isValidElement(value) &&
    !(Symbol.iterator in value) &&
    'heading' in value
  )
}

/**
 * The card grid module: an optional header (`header`, or a composed
 * `CardGridHeader` holding the §11.8 section header), an optional
 * `CardGridToolbar` and `CardGridCount`, the
 * `CardGridList` of `CardGridItem`s (one `Card` each), and an optional
 * `CardGridFooter` with a `CardGridFooterLink` ("See all ›"). Never mix
 * card kinds in one grid, and never scroll it horizontally (use §12.4).
 */
export function CardGrid(props: CardGridProps) {
  const { render, ref, className, kind, primary, secondary, header, children, ...rest } = props
  const scope = useScopeAttributes()
  const generatedId = React.useId()

  // A props object renders the §11.8 SectionHeader and labels the section by its heading.
  const headerProps = isSectionHeaderProps(header) ? header : null
  const headingId = headerProps ? (headerProps.headingId ?? generatedId) : undefined
  const headerNode = headerProps ? (
    <CardGridHeader>
      <SectionHeader {...headerProps} headingId={headingId} />
    </CardGridHeader>
  ) : header != null && header !== false ? (
    <CardGridHeader>{header as React.ReactNode}</CardGridHeader>
  ) : null

  return useRender({
    defaultTagName: 'section',
    render,
    ref,
    props: mergeProps<'section'>(
      {
        ...scope,
        'aria-labelledby': headingId,
        className: cardGrid({ kind, primary, secondary, className }),
        children: (
          <>
            {headerNode}
            {children}
          </>
        ),
      },
      rest
    ),
  })
}

/** Props for CardGridHeader: `header` props and `render`. */
export type CardGridHeaderProps = useRender.ComponentProps<'header'>

/**
 * The module header slot: holds the §11.8 `SectionHeader` (eyebrow +
 * hairline for explore grids; CardGrid's `header` prop fills it for you).
 * Sits `--size-px-5` above the grid and stays with the first row in print.
 */
export function CardGridHeader(props: CardGridHeaderProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'header',
    render,
    ref,
    props: mergeProps<'header'>({ className: cx(styles.header, className) }, rest),
  })
}

/** Props for CardGridToolbar: `div` props and `render`. */
export type CardGridToolbarProps = useRender.ComponentProps<'div'>

/**
 * The filter and sort bar: filter chips (§9.4) and a sort Select (§10.5),
 * wrapping onto more lines as needed. Hidden in print.
 */
export function CardGridToolbar(props: CardGridToolbarProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({ className: cx(styles.toolbar, className) }, rest),
  })
}

/** Props for CardGridCount: paragraph props and `render`. */
export type CardGridCountProps = useRender.ComponentProps<'p'>

/**
 * The result count of a filtered grid ("12 events"), a polite live region
 * in `--primary12`. Keep it mounted and change its text, so the change is
 * announced.
 */
export function CardGridCount(props: CardGridCountProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: mergeProps<'p'>(
      { role: 'status', 'aria-live': 'polite', className: cx(styles.count, className) },
      rest
    ),
  })
}

/** Props for CardGridList: list props and `render`. */
export type CardGridListProps = useRender.ComponentProps<'ul'>

/**
 * The grid itself, a `ul` whose columns follow the `card-grid` container
 * (auto-fit without container-query support). Rows keep equal heights and
 * print 2-up, each row whole.
 */
export function CardGridList(props: CardGridListProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'ul',
    render,
    ref,
    props: mergeProps<'ul'>({ className: cx(styles.list, className) }, rest),
  })
}

/** Props for CardGridItem: list-item props and `render`. */
export type CardGridItemProps = useRender.ComponentProps<'li'>

/** One cell: holds one `Card`, stretched to the row's height. */
export function CardGridItem(props: CardGridItemProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'li',
    render,
    ref,
    props: mergeProps<'li'>({ className: cx(styles.item, className) }, rest),
  })
}

/** Props for CardGridFooter: `div` props and `render`. */
export type CardGridFooterProps = useRender.ComponentProps<'div'>

/** The module footer, `--size-px-7` below the grid: a `CardGridFooterLink` or §9.9 pagination. */
export function CardGridFooter(props: CardGridFooterProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({ className: cx(styles.footer, className) }, rest),
  })
}

/** Props for CardGridFooterLink: Link props except `kind`, which is always `standalone`. */
export type CardGridFooterLinkProps = Omit<LinkProps, 'kind'>

/**
 * "See all ›": the standalone Link (§9.3), `type-label` caps authored in
 * sentence case, with its chevron in `--role-glyph`. The Link owns every
 * state, so hover follows the central link model.
 */
export function CardGridFooterLink(props: CardGridFooterLinkProps) {
  return <Link {...props} kind="standalone" />
}

