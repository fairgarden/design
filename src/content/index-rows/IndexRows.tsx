'use client'

import * as React from 'react'
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import { cva, type VariantProps } from 'class-variance-authority'

import { CollapsiblePanel, DisclosureGlyph, type CollapsiblePanelProps } from '../../disclosure/collapsible'
import { Link, type LinkProps } from '../../actions/link'
import { cx, resolveClassName } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './index-rows.module.css'

/*
 * Ruled Index Rows (§12.11): many same-kind items, the default listing on
 * reading pages. Composed from `section` + an `ol` (ranked) or `ul` of rows,
 * each holding a heading link and meta; event rows expand with Collapsible
 * (§10.13).
 *
 * Implementation (CSS Modules + CVA)
 * - Module: index-rows.module.css; CVA function `indexRows`.
 * - Axes: `kind` → ranked | related | event | article; `primary`,
 *   `secondary` → scales module classes.
 * - Compound variants: none.
 * - Defaults: none (`kind` is required); color axes: none.
 * - Color fallback: inherits the scope.
 * - States: the title Link (§9.3) owns hover and press;
 *   `row:has(titleLink:focus-visible)` → the ring inside the rules;
 *   `aria-current` on the row's link → `currentBar` (titles already sit at
 *   --font-weight-6 or heavier, so the bar carries the change); on
 *   event rows the Collapsible Trigger's `:hover` → the title in
 *   --role-link-hover, color only [D181], and `data-panel-open` → glyph and
 *   title color (and the type-h2 title), with the Panel's clip reveal from
 *   §10.13.
 * - Parts: base, header, list, row, key (with rank, date or thumb), rule
 *   (the text column, which carries the row rule and the event column
 *   rule), title, titleLink, count, meta, dek, currentBar (the rule's
 *   ::before), trigger and glyph (event), details (the Collapsible Panel),
 *   footer.
 * - Scope: none.
 * - Container: `base` (the listing wrapper) is the inline-size container,
 *   unnamed (no inner part queries past it); the row layout queries it.
 *   Baseline without support: date above title, horizontal rules only, with
 *   viewport fallbacks of the date column from --md-n-above and the meta
 *   column from --lg-n-above. Thresholds (§5.10.2): date key column 3/8
 *   from 768; event key 3/12 and the article meta column from 1024 [D163].
 */
export const indexRows = cva(styles.base, {
  variants: {
    kind: {
      ranked: styles.ranked,
      related: styles.related,
      event: styles.event,
      article: styles.article,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

type IndexRowsVariants = VariantProps<typeof indexRows>

/** The four listing builds (§12.11). */
export type IndexRowsKind = 'ranked' | 'related' | 'event' | 'article'

const IndexRowsContext = React.createContext<IndexRowsKind>('article')
IndexRowsContext.displayName = 'IndexRowsContext'

/** Props for IndexRows: `section` props, `render`, the kind and the color axes. */
export type IndexRowsProps = useRender.ComponentProps<'section'> & {
  /**
   * Required. `ranked`: a muted rank numeral column, labels with counts,
   * hairline rules. `related`: a thumbnail left of each title, hairline
   * rules. `event`: a mono date key, `--role-rule` rules and a column rule;
   * rows may expand. `article`: serif titles, a caps meta line, optional
   * deks, hairline dividers.
   */
  kind: IndexRowsKind
  /**
   * Primary Radix scale: titles, keys, rules, bars and glyphs. Never
   * defaulted; omitted, it inherits the scope [D133].
   */
  primary?: IndexRowsVariants['primary']
  /**
   * Secondary Radix scale: the title links' underline and the footer
   * chevron (`--role-accent`, `--role-glyph`). Never defaulted.
   */
  secondary?: IndexRowsVariants['secondary']
}

/**
 * The index module: an optional `IndexRowsHeader` (the §11.8 eyebrow and
 * hairline, plus any Tabs), the `IndexRowsList` of `IndexRow`s and an
 * optional `IndexRowsFooter` ("See all ›"). Rows are separated by rules,
 * never boxed; numbers and dates use tabular figures.
 */
export function IndexRows(props: IndexRowsProps) {
  const { render, ref, className, kind, primary, secondary, ...rest } = props
  const scope = useScopeAttributes()
  const element = useRender({
    defaultTagName: 'section',
    render,
    ref,
    props: mergeProps<'section'>(
      {
        ...scope,
        className: indexRows({ kind, primary, secondary, className }),
      },
      rest
    ),
  })
  return <IndexRowsContext.Provider value={kind}>{element}</IndexRowsContext.Provider>
}

/** Props for IndexRowsHeader: `header` props and `render`. */
export type IndexRowsHeaderProps = useRender.ComponentProps<'header'>

/**
 * The module header slot: the §11.8 section header (eyebrow + `--role-hairline`
 * rule) and, where needed, "Upcoming / Past" Tabs (§9.5). Stays with the
 * first row in print.
 */
export function IndexRowsHeader(props: IndexRowsHeaderProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'header',
    render,
    ref,
    props: mergeProps<'header'>({ className: cx(styles.header, className) }, rest),
  })
}

/** Props for IndexRowsList: list props and `render`. */
export type IndexRowsListProps = useRender.ComponentProps<'ul'>

/** The rows: an `ol` for ranked lists, whose order means something; a `ul` otherwise. */
export function IndexRowsList(props: IndexRowsListProps) {
  const { render, ref, className, ...rest } = props
  const kind = React.useContext(IndexRowsContext)
  return useRender({
    defaultTagName: kind === 'ranked' ? 'ol' : 'ul',
    render,
    ref,
    props: mergeProps<'ul'>({ className: cx(styles.list, className) }, rest),
  })
}

/** Props for IndexRow: list-item props, `render` and the key column content. */
export type IndexRowProps = useRender.ComponentProps<'li'> & {
  /** Ranked rows: the rank numeral, with no period ("1", "2" …); `--role-muted`, tabular. */
  rank?: React.ReactNode
  /**
   * Event rows: the date key, e.g. `<time dateTime="2026-07-01">01 / 07</time>`;
   * `type-data`. Above the title below 768 px of container, a left column from 768.
   */
  date?: React.ReactNode
  /** Related rows: a thumbnail `img` (empty alt), `--fgd-size-thumb` square, dropped in print. */
  thumb?: React.ReactNode
}

/**
 * One row: an optional key column (`rank`, `date` or `thumb`) and the text
 * column, which holds `IndexRowTitle` (or an event's `IndexRowDisclosure`),
 * `IndexRowMeta` and `IndexRowDek`. The row rule runs from the text column
 * to the module edge, never under the key column.
 */
export function IndexRow(props: IndexRowProps) {
  const { render, ref, className, rank, date, thumb, children, ...rest } = props

  const key =
    rank != null ? (
      <span className={`${styles.key} ${styles.rank}`}>{rank}</span>
    ) : date != null ? (
      <span className={`${styles.key} ${styles.date}`}>{date}</span>
    ) : thumb != null ? (
      <span className={`${styles.key} ${styles.thumb}`}>{thumb}</span>
    ) : null

  return useRender({
    defaultTagName: 'li',
    render,
    ref,
    props: mergeProps<'li'>(
      {
        className: cx(styles.row, className),
        children: (
          <>
            {key}
            <div className={styles.rule}>{children}</div>
          </>
        ),
      },
      rest
    ),
  })
}

/** Props for IndexRowTitle: heading props and `render` (default `<h3>`). */
export type IndexRowTitleProps = useRender.ComponentProps<'h3'>

/**
 * The row's title: `type-itemhead` for article and event rows,
 * `type-body-ui` at `--font-weight-6` for ranked and related rows. Wrap an
 * `IndexRowTitleLink` inside, and follow it with an `IndexRowCount` in
 * ranked lists.
 */
export function IndexRowTitle(props: IndexRowTitleProps) {
  const { render, ref, className, ...rest } = props
  const kind = React.useContext(IndexRowsContext)
  const own = kind === 'ranked' || kind === 'related' ? styles.titleUi : styles.title
  return useRender({
    defaultTagName: 'h3',
    render,
    ref,
    props: mergeProps<'h3'>({ className: cx(own, className) }, rest),
  })
}

/** Props for IndexRowTitleLink: Link props except `kind`, which is always `title`. */
export type IndexRowTitleLinkProps = Omit<LinkProps, 'kind'>

/**
 * The row's one link, inside `IndexRowTitle`: a §9.3 title Link whose hit
 * area stretches over the row. Pass `aria-current="page"` (or `"true"` for
 * the active filter row) to mark the current row. `index` adds the visited ✓
 * for long indexes.
 */
export function IndexRowTitleLink(props: IndexRowTitleLinkProps) {
  const { className, ...rest } = props
  return <Link {...rest} kind="title" className={cx(styles.titleLink, className)} />
}

/** Props for IndexRowCount: `span` props and `render`. */
export type IndexRowCountProps = useRender.ComponentProps<'span'>

/** The ranked label's count, "(29)": `type-body-ui` in `--role-muted`, after the title. */
export function IndexRowCount(props: IndexRowCountProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: mergeProps<'span'>({ className: cx(styles.count, className) }, rest),
  })
}

/** Props for IndexRowMeta: paragraph props and `render`. */
export type IndexRowMetaProps = useRender.ComponentProps<'p'>

/**
 * The meta line in `--role-muted`: `type-label` caps for article rows,
 * `type-caption` otherwise. Past rows say "Past" here; never dim them. From
 * 1024 px of container an article row's meta moves to a right-aligned column.
 */
export function IndexRowMeta(props: IndexRowMetaProps) {
  const { render, ref, className, ...rest } = props
  const kind = React.useContext(IndexRowsContext)
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: mergeProps<'p'>(
      { className: cx(kind === 'article' ? styles.metaCaps : styles.meta, className) },
      rest
    ),
  })
}

/** Props for IndexRowDek: paragraph props and `render`. */
export type IndexRowDekProps = useRender.ComponentProps<'p'>

/** An optional one- or two-line dek under an article title: `type-body-ui` in `--primary12`. */
export function IndexRowDek(props: IndexRowDekProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: mergeProps<'p'>({ className: cx(styles.dek, className) }, rest),
  })
}

/** Props for IndexRowDisclosure: Base UI Collapsible Root props plus the title, meta and panel props. */
export type IndexRowDisclosureProps = Omit<BaseCollapsible.Root.Props, 'title' | 'render'> & {
  /** The event title, the trigger's label: `--role-muted` collapsed, `--primary12` open. */
  title: React.ReactNode
  /** An optional meta line under the title (format, place; "Past"), shown in both states. */
  meta?: React.ReactNode
  /** Props for the details panel. */
  panelProps?: Omit<CollapsiblePanelProps, 'children'>
}

/**
 * An expandable event row (§10.13): the title is the trigger, inside an
 * `h3`, with the disclosure glyph; the details (body, "Host" /
 * "Entrance" pairs, a sm Button) sit in the panel. Collapsed titles are
 * `--role-muted` and grow to `type-h2` in `--primary12` when open. Rows
 * print expanded, glyphs hidden.
 */
export function IndexRowDisclosure(props: IndexRowDisclosureProps) {
  const { title, meta, panelProps, className, children, ...rest } = props
  return (
    <BaseCollapsible.Root
      {...rest}
      className={resolveClassName(className, (extra) => cx(styles.disclosure, extra))}
    >
      <h3 className={styles.eventHeading}>
        <BaseCollapsible.Trigger className={styles.trigger}>
          <span className={styles.triggerLabel}>{title}</span>
          <DisclosureGlyph className={styles.glyph} />
        </BaseCollapsible.Trigger>
      </h3>
      {meta != null ? <p className={styles.meta}>{meta}</p> : null}
      <CollapsiblePanel
        {...panelProps}
        className={withDetails(panelProps?.className)}
      >
        {children}
      </CollapsiblePanel>
    </BaseCollapsible.Root>
  )
}

/** Props for IndexRowsFooter: `div` props and `render`. */
export type IndexRowsFooterProps = useRender.ComponentProps<'div'>

/**
 * The module footer: a standalone `Link` ("See all ›", `type-label` caps
 * with its `--role-glyph` chevron). Prints "Full list (short URL)" for lists
 * of more than 10 rows (§7.6).
 */
export function IndexRowsFooter(props: IndexRowsFooterProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({ className: cx(styles.footer, className) }, rest),
  })
}

type PanelClassName = CollapsiblePanelProps['className']

/** The details class first, then the consumer's (static or state-driven) class. */
function withDetails(className: PanelClassName): PanelClassName {
  if (typeof className === 'function') {
    const consumer = className
    return (state) => cx(styles.details, consumer(state))
  }
  return cx(styles.details, className)
}

