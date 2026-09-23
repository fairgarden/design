'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Button } from '../Button'
import { Link } from '../Link'
import { cx } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './pagination.module.css'

/*
 * Pagination (§9.9): moving through long paged lists.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: pagination.module.css; CVA function `pagination`.
 * - Axes: `kind` → numbered | compact | step | dots | more → numbered,
 *   compact, kindStep, kindDots, kindMore (prefixed, because `step` is also
 *   a part); `primary`, `secondary` → scales module classes (the secondary
 *   reaches only the arrows, through --role-glyph).
 * - Compound variants: none.
 * - Defaults: kind numbered (it renders the compact form below 768 px);
 *   color axes: none.
 * - Color fallback: inherits the scope.
 * - States: page numbers are Link kind="nav" (hover: the bare-text
 *   underline) and Previous / Next are `text` Buttons rendered as anchors,
 *   their arrows at the next tier's weight on hover; `:hover` on `step` →
 *   the bare-text underline on `word` (--role-accent at --border-size-2,
 *   offset --size-px-1), `:active` → the underline at --border-size-2
 *   [D181]. Step buttons are icon-only outline Buttons, whose hover, press
 *   and ring are Button's. aria-current="page" on `current` → the
 *   --ds-stroke-3 bar plus --font-weight-7; aria-current="true" on the
 *   current `dot` → solid and larger. Ends omit the control and keep its
 *   space; nothing is ever disabled. The list region the pager drives
 *   carries aria-busy while loading; the pager stays put.
 * - Parts: base (the nav), list, item, page, current, gap, prev, next,
 *   status (with statusWord and statusCount), dots, dot; plus step
 *   (Previous and Next), word (their visible label), more (the "Show More"
 *   Button), visuallyHidden and printLine. The arrows are the Buttons' own
 *   glyphs.
 * - Scope: none.
 * - Container: `base` is the inline-size container `pagination`. Baseline:
 *   compact Previous / Next, their words dropped below 360 px; viewport
 *   fallback numbered from --md-n-above (1 sibling) and 2 siblings from
 *   --lg-n-above; container from 768 px numbered with 1 sibling, from
 *   1024 px 2 siblings (§5.10.2). The row never wraps.
 */
export const pagination = cva(styles.base, {
  variants: {
    kind: {
      numbered: styles.numbered,
      compact: styles.compact,
      step: styles.kindStep,
      dots: styles.kindDots,
      more: styles.kindMore,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'numbered',
  },
})

export type PaginationVariants = VariantProps<typeof pagination>
export type PaginationKind = NonNullable<PaginationVariants['kind']>

/** The items on the current page, for the printed state line (§7.12.1). */
export interface PaginationItems {
  /** The first item's position on this page, e.g. 41. */
  first: number
  /** The last item's position on this page, e.g. 50. */
  last: number
  /** The item count across every page, e.g. 118. */
  total: number
}

/** The props every form shares: `nav` props, the page, the count, the labels and the color axes. */
interface PaginationCommonProps extends Omit<React.ComponentPropsWithRef<'nav'>, 'children'> {
  /** The current page (or item), 1-based. */
  page: number
  /** The page (or item) count. */
  count: number
  /**
   * Builds each anchor, e.g. `(href) => <NextLink href={href} />`. Default: a
   * plain `<a href>`.
   */
  renderLink?: (href: string) => React.ReactElement
  /**
   * Primary Radix scale: numerals, labels, the current bar and the focus
   * ring. Never defaulted; omitted, it inherits the scope [D133].
   */
  primary?: PaginationVariants['primary']
  /** Secondary Radix scale: the Previous and Next arrows on light grounds. Never defaulted. */
  secondary?: PaginationVariants['secondary']
  /**
   * The Previous label, authored in sentence case; the CSS sets the caps
   * [D165]. On the step pager it is the ‹ button's accessible name. Default
   * "Previous".
   */
  previousLabel?: string
  /**
   * The Next label, authored in sentence case; the CSS sets the caps
   * [D165]. On the step pager it is the › button's accessible name. Default
   * "Next".
   */
  nextLabel?: string
  /** The items on this page. Given, the pager prints "Items 41–50 of 118." in its place. */
  items?: PaginationItems
  /** The full list's URL, printed after the state line per §7.6 ("Full list (example.org/birds)"). */
  fullListHref?: string
}

/** Which form, and how it moves between pages. */
type PaginationFormProps =
  | {
      /**
       * `numbered` (default): ‹ Previous · 1 … 4 5 6 … 12 · Next ›, shown
       * from 768 px of its own width and compact below. `compact`:
       * ‹ Previous · Page 5 of 12 · Next › at every width, for lists over 50
       * pages.
       */
      kind?: 'numbered' | 'compact'
      /** Every page's URL: each page is a link, never a click handler alone (P8). */
      getHref: (page: number) => string
      onPageChange?: never
      moreLabel?: never
    }
  | {
      /**
       * `step`: icon-only ‹ › circles around a mono "3 of 12", for carousels
       * and figures. `dots`: the step pager plus up to 8 dots, the count
       * still shown; with more than 8 it is the plain step pager. Neither
       * prints.
       */
      kind: 'step' | 'dots'
      /** Given, the step buttons are links to these URLs. */
      getHref?: (page: number) => string
      /** Called with the target page when a step button is pressed. Pass it, `getHref`, or both. */
      onPageChange?: (page: number) => void
      moreLabel?: never
    }
  | {
      /**
       * `more`: the count ("Showing 20 of 54") over an outline "Show More"
       * Button, for feeds. Each step is a link to the next page's URL (P8);
       * the Button is omitted once everything shows.
       */
      kind: 'more'
      /** Every page's URL; the Button links to the next one. */
      getHref: (page: number) => string
      /** The items showing, for "Showing 20 of 54" and the printed state line. */
      items: PaginationItems
      /** The Button's label, authored in title case [D160]. Default "Show More". */
      moreLabel?: string
      onPageChange?: never
    }

/** Props for Pagination: `nav` props, the page, the count, the form and how it moves, and the color axes. */
export type PaginationProps = PaginationCommonProps & PaginationFormProps

/** More dots than this and the dots form falls back to the plain step pager (§9.9). */
const MAX_DOTS = 8

/** The pages one tier shows: first, last, the current page and its siblings, with a fixed slot count. */
function visiblePages(page: number, count: number, siblings: number): Set<number> {
  const pages = new Set<number>([1, count])
  const start = Math.max(Math.min(page - siblings, count - siblings * 2 - 2), 3)
  const end = Math.min(Math.max(page + siblings, siblings * 2 + 3), count - 2)
  // A gap that would hide a single page shows that page instead.
  if (start <= 3 && count > 2) pages.add(2)
  if (end >= count - 2 && count > 2) pages.add(count - 1)
  for (let index = start; index <= end; index += 1) pages.add(index)
  return pages
}

interface PageSlot {
  kind: 'page' | 'gap'
  page: number
  near: boolean
  far: boolean
}

/** One sibling from 768 px, two from 1024 px; each slot records the tiers that show it. */
function pageSlots(page: number, count: number): PageSlot[] {
  const near = visiblePages(page, count, 1)
  const far = visiblePages(page, count, 2)
  const union = Array.from(new Set([...near, ...far])).sort((a, b) => a - b)
  const next = (set: Set<number>, from: number) => union.find((value) => value > from && set.has(value))
  const slots: PageSlot[] = []

  for (const value of union) {
    slots.push({ kind: 'page', page: value, near: near.has(value), far: far.has(value) })
    const nearNext = next(near, value)
    const farNext = next(far, value)
    const nearGap = near.has(value) && nearNext !== undefined && nearNext > value + 1
    const farGap = far.has(value) && farNext !== undefined && farNext > value + 1
    if (nearGap || farGap) slots.push({ kind: 'gap', page: value, near: nearGap, far: farGap })
  }
  return slots
}

/** An icon-only ‹ or › step button: a link when `getHref` is given, else a button calling `onPageChange`. */
function StepButton({
  direction,
  target,
  label,
  getHref,
  onPageChange,
  renderLink,
}: {
  direction: 'previous' | 'next'
  target: number
  label: string
  getHref?: (page: number) => string
  onPageChange?: (page: number) => void
  renderLink?: (href: string) => React.ReactElement
}) {
  const icon = direction === 'previous' ? 'chevron_left' : 'chevron_right'
  const className = direction === 'previous' ? styles.prev : styles.next
  const onClick = onPageChange ? () => onPageChange(target) : undefined

  if (getHref) {
    const href = getHref(target)
    return (
      <Button
        variant="outline"
        iconOnly
        icon={icon}
        nativeButton={false}
        render={renderLink ? renderLink(href) : <a href={href} />}
        rel={direction === 'previous' ? 'prev' : 'next'}
        onClick={onClick}
        className={className}
      >
        {label}
      </Button>
    )
  }
  return (
    <Button variant="outline" iconOnly icon={icon} onClick={onClick} className={className}>
      {label}
    </Button>
  )
}

/**
 * A `nav` named "Pagination". `numbered` and `compact`: Previous at the
 * start, the page numbers (or the "Page 5 of 12" status) centered, Next at
 * the end; Previous and Next are `type-label` caps with Material Symbols
 * `chevron_left` / `chevron_right` at the inline tier; page numerals are
 * mono at `type-label` size with tabular figures, so a changing count never
 * shifts the row [D165, D174, D175]. The current page is unlinked, bold and
 * barred. `step` and `dots`: icon-only ‹ › circles around a mono "3 of 12"
 * (plus up to 8 dots). `more`: "Showing 20 of 54" over a "Show More"
 * Button. At the ends a control is omitted and its space kept, never
 * disabled. The pager is hidden in print; with `items` the linked forms
 * print one state line instead.
 */
export function Pagination(props: PaginationProps) {
  const {
    page: pageProp,
    count,
    getHref,
    onPageChange,
    renderLink,
    kind,
    primary,
    secondary,
    previousLabel = 'Previous',
    nextLabel = 'Next',
    items,
    fullListHref,
    moreLabel = 'Show More',
    className,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const requestedKind: PaginationKind = kind ?? 'numbered'
  const total = Math.max(0, Math.floor(count))
  const page = Math.min(Math.max(1, Math.floor(pageProp)), Math.max(1, total))
  // The dots form shows at most 8 dots; past that it is the plain step pager.
  const resolvedKind: PaginationKind =
    requestedKind === 'dots' && total > MAX_DOTS ? 'step' : requestedKind
  const stepForm = resolvedKind === 'step' || resolvedKind === 'dots'
  const anchor = (href: string) => (renderLink ? renderLink(href) : <a href={href} />)
  // The linked forms require `getHref` in their types; only the step forms may omit it.
  const hrefOf = (value: number) => getHref?.(value) ?? '#'
  const pageLink = (value: number) => {
    const href = hrefOf(value)
    return { href, render: renderLink?.(href) }
  }

  // Step pagers print nothing: carousels and figures print as grids (§9.9).
  const printLine =
    items != null && !stepForm ? (
      <p className={styles.printLine}>
        Items {items.first}–{items.last} of {items.total}.
        {fullListHref != null ? (
          <>
            {' '}
            <Link href={fullListHref} render={renderLink?.(fullListHref)}>
              Full list
            </Link>
          </>
        ) : null}
      </p>
    ) : null

  if (total < 1) return null

  const navProps = {
    'aria-label': 'Pagination',
    ...rest,
    ...scope,
    className: pagination({ kind: resolvedKind, primary, secondary, className }),
  }

  if (stepForm) {
    return (
      <nav {...navProps}>
        {page > 1 ? (
          <StepButton
            direction="previous"
            target={page - 1}
            label={previousLabel}
            getHref={getHref}
            onPageChange={onPageChange}
            renderLink={renderLink}
          />
        ) : null}
        {resolvedKind === 'dots' ? (
          // The dots repeat the count, which is announced, so they are hidden
          // from assistive technology; the current one is solid and larger.
          <span className={styles.dots} aria-hidden="true">
            {Array.from({ length: total }, (_, index) => (
              <span
                key={index}
                className={styles.dot}
                aria-current={index + 1 === page ? 'true' : undefined}
              />
            ))}
          </span>
        ) : null}
        <p className={styles.status} aria-live="polite" aria-atomic="true">
          <span className={styles.statusCount}>
            {page} of {total}
          </span>
        </p>
        {page < total ? (
          <StepButton
            direction="next"
            target={page + 1}
            label={nextLabel}
            getHref={getHref}
            onPageChange={onPageChange}
            renderLink={renderLink}
          />
        ) : null}
      </nav>
    )
  }

  if (resolvedKind === 'more') {
    const shown = items?.last ?? page
    const of = items?.total ?? total
    return (
      <nav {...navProps}>
        <p className={styles.status} aria-live="polite" aria-atomic="true">
          <span className={styles.statusWord}>Showing</span>{' '}
          <span className={styles.statusCount}>
            {shown} of {of}
          </span>
        </p>
        {page < total ? (
          <Button
            variant="outline"
            nativeButton={false}
            render={anchor(hrefOf(page + 1))}
            rel="next"
            className={styles.more}
          >
            {moreLabel}
          </Button>
        ) : null}
        {printLine}
      </nav>
    )
  }

  return (
    <nav {...navProps}>
      {page > 1 ? (
        <Button
          variant="text"
          icon="chevron_left"
          nativeButton={false}
          render={anchor(hrefOf(page - 1))}
          rel="prev"
          className={cx(styles.step, styles.prev)}
        >
          <span className={styles.word}>{previousLabel}</span>
        </Button>
      ) : null}

      {resolvedKind === 'numbered' ? (
        <ol className={styles.list}>
          {pageSlots(page, total).map((slot) =>
            slot.kind === 'gap' ? (
              <li
                key={`gap-${slot.page}`}
                className={cx(styles.item, slot.near && styles.near, slot.far && styles.far)}
                aria-hidden="true"
              >
                <span className={styles.gap}>…</span>
              </li>
            ) : (
              <li
                key={slot.page}
                className={cx(styles.item, slot.near && styles.near, slot.far && styles.far)}
              >
                {slot.page === page ? (
                  <span className={styles.current} aria-current="page">
                    <span className={styles.visuallyHidden}>Page </span>
                    {slot.page}
                  </span>
                ) : (
                  <Link kind="nav" {...pageLink(slot.page)} className={styles.page}>
                    <span className={styles.visuallyHidden}>Page </span>
                    {slot.page}
                  </Link>
                )}
              </li>
            )
          )}
        </ol>
      ) : null}

      <p className={styles.status} aria-live="polite" aria-atomic="true">
        <span className={styles.statusWord}>Page</span>{' '}
        <span className={styles.statusCount}>
          {page} of {total}
        </span>
      </p>

      {page < total ? (
        <Button
          variant="text"
          icon="chevron_right"
          iconPosition="end"
          nativeButton={false}
          render={anchor(hrefOf(page + 1))}
          rel="next"
          className={cx(styles.step, styles.next)}
        >
          <span className={styles.word}>{nextLabel}</span>
        </Button>
      ) : null}

      {printLine}
    </nav>
  )
}
