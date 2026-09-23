'use client'

import * as React from 'react'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import { cva, type VariantProps } from 'class-variance-authority'

import { Card } from '../Card'
import { Link, type LinkProps } from '../Link'
import { SectionHeader, type SectionHeaderProps } from '../SectionHeader'
import { cx } from '../../utils/className'
import {
  primaryScaleVariants,
  secondaryScaleVariants,
  type PrimaryScale,
  type RadixScale,
} from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './feature-grid.module.css'

/*
 * Feature Grid (§12.6): 2–6 parallel benefits or ways to take part, each a
 * sentence or two. Composed from `section` + a `ul` of cells (leader,
 * `h3`, text), with optional title Links.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: feature-grid.module.css; CVA function `featureGrid`.
 * - Axes: `kind` → icon | numbered | rule-topped | framed | glossary →
 *   `kindIcon` (axis-prefixed: `icon` is also a part), `numbered`,
 *   `ruleTopped`, `framed`, `glossary`; `primary`, `secondary` → scales
 *   module classes.
 * - Compound variants: none.
 * - Defaults: kind icon; color axes: none.
 * - Color fallback: inherits the scope.
 * - States: static. A linked cell's title Link (§9.3) owns the hover and
 *   press underline; `cell:has(link:focus-visible)` → the ring around the
 *   cell.
 * - Parts: base, header (the §11.8 SectionHeader, from the `header` prop
 *   or composed in `FeatureGridHeader`), list, cell, icon, numeral, drawing, heading
 *   (`caption` for glossary), body, link, insetRule and columnRule (the
 *   numbered separators, drawn as each cell's ::before), frame.
 * - Scope: `frame` (the `framed` kind) is a faced Card (§12.2), whose nested
 *   face Ground resolves the face per ground (a white face on light grounds,
 *   a light island on deep ones) and draws its edge in --role-edge; the
 *   module names no preset.
 * - Container: `base` is the inline-size container `feature-grid` (named
 *   because the framed list sits inside the frame's own `card` container);
 *   `list` queries it. Baseline without support: one stacked column, with
 *   viewport fallbacks of 3-up from --md-n-above and 4-up from
 *   --lg-n-above. Thresholds (§5.10.2): 3-up from 768, up to 4-up from 1024
 *   [D163].
 */
export const featureGrid = cva(styles.base, {
  variants: {
    kind: {
      icon: styles.kindIcon,
      numbered: styles.numbered,
      'rule-topped': styles.ruleTopped,
      framed: styles.framed,
      glossary: styles.glossary,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'icon',
  },
})

type FeatureGridVariants = VariantProps<typeof featureGrid>

/** The five cell constructions (§12.6). */
export type FeatureGridKind = 'icon' | 'numbered' | 'rule-topped' | 'framed' | 'glossary'

interface FeatureGridContextValue {
  kind: FeatureGridKind
  primary: PrimaryScale | undefined
  secondary: RadixScale | undefined
}

const FeatureGridContext = React.createContext<FeatureGridContextValue>({
  kind: 'icon',
  primary: undefined,
  secondary: undefined,
})
FeatureGridContext.displayName = 'FeatureGridContext'

/** Props for FeatureGrid: `section` props, `render`, the kind and the color axes. */
export type FeatureGridProps = useRender.ComponentProps<'section'> & {
  /**
   * `icon` (default): block icon → serif heading → body, whitespace only.
   * `numbered`: a zero-padded numeral in a 56 px outline circle, cells
   * separated by inset rules (vertical rules once they sit in a row).
   * `rule-topped`: each cell opens with a `--role-hairline` rule.
   * `framed`: 2 × 2 inside one faced frame. `glossary`: small drawings with
   * caps captions, no rules.
   */
  kind?: FeatureGridKind
  /**
   * Primary Radix scale: numerals, headings, text, rules and the frame.
   * Never defaulted; omitted, it inherits the scope [D133].
   */
  primary?: FeatureGridVariants['primary']
  /**
   * Secondary Radix scale: the block icons (`--role-accent`) and the title
   * links' underline. Never defaulted.
   */
  secondary?: FeatureGridVariants['secondary']
  /**
   * The module header (§11.8), rendered in the header slot before the
   * children: a `SectionHeader` props object (the section is then labelled
   * by its heading), or any node, such as a `SectionHeader` element. Omit it
   * to compose `FeatureGridHeader` yourself.
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
 * The feature grid module: an optional header (`header`, or a composed
 * `FeatureGridHeader`), then a `FeatureGridList` of 2–6 `FeatureGridCell`s. Each cell holds one leader
 * (`FeatureGridIcon` or `FeatureGridDrawing`; numbered cells draw their own
 * numeral), a `FeatureGridHeading` (optionally wrapping a `FeatureGridLink`)
 * and a `FeatureGridBody`. Use one leader type per grid, never mixed.
 */
export function FeatureGrid(props: FeatureGridProps) {
  const {
    render,
    ref,
    className,
    kind = 'icon',
    primary,
    secondary,
    header,
    children,
    ...rest
  } = props
  const scope = useScopeAttributes()
  const generatedId = React.useId()
  const context = React.useMemo<FeatureGridContextValue>(
    () => ({ kind, primary: primary ?? undefined, secondary: secondary ?? undefined }),
    [kind, primary, secondary]
  )

  // A props object renders the §11.8 SectionHeader and labels the section by its heading.
  const headerProps = isSectionHeaderProps(header) ? header : null
  const headingId = headerProps ? (headerProps.headingId ?? generatedId) : undefined
  const headerNode = headerProps ? (
    <FeatureGridHeader>
      <SectionHeader {...headerProps} headingId={headingId} />
    </FeatureGridHeader>
  ) : header != null && header !== false ? (
    <FeatureGridHeader>{header as React.ReactNode}</FeatureGridHeader>
  ) : null

  const element = useRender({
    defaultTagName: 'section',
    render,
    ref,
    props: mergeProps<'section'>(
      {
        ...scope,
        'aria-labelledby': headingId,
        className: featureGrid({ kind, primary, secondary, className }),
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
  return <FeatureGridContext.Provider value={context}>{element}</FeatureGridContext.Provider>
}

/** Props for FeatureGridHeader: `header` props and `render`. */
export type FeatureGridHeaderProps = useRender.ComponentProps<'header'>

/**
 * The module header slot: holds the §11.8 `SectionHeader` (FeatureGrid's
 * `header` prop fills it for you); stays with the first cells in print.
 */
export function FeatureGridHeader(props: FeatureGridHeaderProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'header',
    render,
    ref,
    props: mergeProps<'header'>({ className: cx(styles.header, className) }, rest),
  })
}

/** Props for FeatureGridList: list props and `render`. */
export type FeatureGridListProps = useRender.ComponentProps<'ul'>

/**
 * The cells' grid: a `ul`, or an `ol` for the numbered kind, whose order the
 * numerals carry. In the framed kind it sits inside the faced frame.
 */
export function FeatureGridList(props: FeatureGridListProps) {
  const { render, ref, className, ...rest } = props
  const { kind, primary, secondary } = React.useContext(FeatureGridContext)
  const list = useRender({
    defaultTagName: kind === 'numbered' ? 'ol' : 'ul',
    render,
    ref,
    props: mergeProps<'ul'>({ className: cx(styles.list, className) }, rest),
  })
  if (kind !== 'framed') return list
  return (
    <Card faced render={<div />} primary={primary} secondary={secondary} className={styles.frame}>
      {list}
    </Card>
  )
}

/** Props for FeatureGridCell: list-item props and `render`. */
export type FeatureGridCellProps = useRender.ComponentProps<'li'>

/**
 * One benefit: leader → heading → body. Numbered cells draw their
 * zero-padded numeral ("01") first, from the list order. A cell with a
 * `FeatureGridLink` is linked as a whole.
 */
export function FeatureGridCell(props: FeatureGridCellProps) {
  const { render, ref, className, children, ...rest } = props
  const { kind } = React.useContext(FeatureGridContext)
  return useRender({
    defaultTagName: 'li',
    render,
    ref,
    props: mergeProps<'li'>(
      {
        className: cx(styles.cell, className),
        children: (
          <>
            {kind === 'numbered' ? <span className={styles.numeral} aria-hidden="true" /> : null}
            {children}
          </>
        ),
      },
      rest
    ),
  })
}

/** Props for FeatureGridIcon: `span` props and `render`. */
export type FeatureGridIconProps = useRender.ComponentProps<'span'>

/**
 * The block-icon leader: put an `<Icon size="block" … />` (Material Symbols
 * Rounded, FILL 0) inside. It fills in `--role-accent`, which resolves to
 * `--primary12` on saturated grounds. Never put a colored tile behind it.
 */
export function FeatureGridIcon(props: FeatureGridIconProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: mergeProps<'span'>({ className: cx(styles.icon, className) }, rest),
  })
}

/** Props for FeatureGridDrawing: `span` props and `render`. */
export type FeatureGridDrawingProps = useRender.ComponentProps<'span'>

/**
 * The glossary leader: a small geometric drawing (inline SVG, spot size
 * `--size-px-9`) in `--primary12`. Fixed size; it never scales.
 */
export function FeatureGridDrawing(props: FeatureGridDrawingProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: mergeProps<'span'>(
      { 'aria-hidden': true, className: cx(styles.drawing, className) },
      rest
    ),
  })
}

/** Props for FeatureGridHeading: heading props and `render` (default `<h3>`). */
export type FeatureGridHeadingProps = useRender.ComponentProps<'h3'>

/**
 * The cell's heading: `type-itemhead` in `--primary12`; in the glossary kind
 * a `type-label` caps caption. Renders `<h3>`.
 */
export function FeatureGridHeading(props: FeatureGridHeadingProps) {
  const { render, ref, className, ...rest } = props
  const { kind } = React.useContext(FeatureGridContext)
  return useRender({
    defaultTagName: 'h3',
    render,
    ref,
    props: mergeProps<'h3'>(
      { className: cx(kind === 'glossary' ? styles.caption : styles.heading, className) },
      rest
    ),
  })
}

/** Props for FeatureGridLink: Link props except `kind`, which is always `title`. */
export type FeatureGridLinkProps = Omit<LinkProps, 'kind'>

/**
 * The cell's one link, inside `FeatureGridHeading`: a §9.3 title Link whose
 * hit area stretches over the cell. Hover, focus and press underline the
 * heading; the cell draws the focus ring.
 */
export function FeatureGridLink(props: FeatureGridLinkProps) {
  const { className, ...rest } = props
  return <Link {...rest} kind="title" className={cx(styles.link, className)} />
}

/** Props for FeatureGridBody: `div` props and `render`. */
export type FeatureGridBodyProps = useRender.ComponentProps<'div'>

/** A sentence or two of `type-body-ui` in `--primary12`. */
export function FeatureGridBody(props: FeatureGridBodyProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({ className: cx(styles.body, className) }, rest),
  })
}

