'use client'

import * as React from 'react'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import { cva, type VariantProps } from 'class-variance-authority'

import { Icon, iconHost } from '../../foundations/icon'
import { cx } from '../../utils/className'
import { cleanUrl, printUrl } from '../../utils/printUrl'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './link.module.css'

/**
 * Link (§9.3): which build (`kind`), the long-index visited mark (`index`),
 * the external mark (`external`), the list link's color-only hover (`list`)
 * and the muted ancestor ink (`muted`). Color axes inherit the scope and are
 * never defaulted [D133].
 */
export const link = cva(styles.base, {
  variants: {
    kind: {
      inline: styles.inline,
      standalone: styles.standalone,
      nav: styles.nav,
      backref: styles.backref,
      title: styles.title,
      noteref: styles.noteref,
    },
    index: { true: styles.index },
    external: { true: styles.external },
    list: { true: styles.list },
    muted: { true: styles.muted },
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'inline',
    external: false,
    list: false,
    muted: false,
  },
})

export type LinkVariants = VariantProps<typeof link>
export type LinkKind = NonNullable<LinkVariants['kind']>

/** Props for Link: anchor props, `render`, and the kind, mark and color axes. */
export interface LinkProps
  extends Omit<useRender.ComponentProps<'a'>, 'className'>,
    LinkVariants {
  /**
   * Which build: `inline` (default) underlines in running text; `standalone`
   * is the caps module link with a trailing ›; `nav` has no rest underline
   * and marks the current page; `title` stretches over a card or list item;
   * `noteref` and `backref` are the note call and return (§9.3).
   */
  kind?: LinkVariants['kind']
  /**
   * Adds the screen-only visited ✓ used in long indexes, such as reference
   * and archive lists. Default `false` [D174, D175].
   */
  index?: LinkVariants['index']
  /**
   * Adds the arrow-open mark and "(external site)" for assistive technology.
   * Default `false`.
   */
  external?: LinkVariants['external']
  /**
   * With `kind="nav"`: a list link (nav-panel, footer, drawer and breadcrumb
   * lists), whose hover is `--role-link-hover` color only, plus the
   * `--ds-stroke-1-5` `--role-accent` underline where that ink is
   * `--primary12`. Without it, `nav` is bare navigation text (bar and
   * utility items, page numbers, toolbar links), whose hover is the
   * `--border-size-2` `--role-accent` underline (§9.3) [D181]. Default
   * `false`.
   */
  list?: LinkVariants['list']
  /**
   * Rests in `--role-muted` instead of `--primary12`, as a breadcrumb's
   * ancestors. Hover takes `--role-link-hover` only (the underline is added
   * where that ink is `--primary12`); with `kind="nav"` it replaces the bar
   * item's bare-text underline (§9.3, §9.8) [D181]. Default `false`.
   */
  muted?: LinkVariants['muted']
  /**
   * Primary Radix scale: the link text and focus ring. Never defaulted;
   * omitted, it inherits the scope [D133].
   */
  primary?: LinkVariants['primary']
  /**
   * Secondary Radix scale: the accent underline. Never defaulted; omitted,
   * it inherits the scope.
   */
  secondary?: LinkVariants['secondary']
  /** Extra class names, added after the module's own. */
  className?: string
}

/** Word joiner: keeps a trailing mark on the last word's line without an underlined gap. */
const JOIN = '\u2060'

const PRINT_URL_KINDS: ReadonlySet<LinkKind> = new Set<LinkKind>(['inline', 'standalone', 'title'])

/**
 * The URL printed inline after the link (§7.6.1): only for absolute URLs of
 * ≤ 30 cleaned characters whose text is not already the URL. Longer URLs take
 * a lettered link note, which the page (not the Link) collects.
 */
function printedUrl(href: unknown, children: React.ReactNode): string | null {
  const cleaned = printUrl(href)
  if (cleaned === null) return null
  // A bare URL prints once, as itself.
  if (typeof children === 'string') {
    const text = children.trim()
    const asUrl = /^https?:\/\//i.test(text) ? text : `https://${text}`
    if (cleanUrl(asUrl) === cleaned) return null
  }
  return cleaned
}

/**
 * The external mark: a long shaft with an `arrow-open` head (6 px arms at
 * ±30°, round caps) at the inline tier, drawn custom (§1.5.12, §6.10).
 */
function ArrowOpenMark({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M3.5 12.5 12.5 3.5M6.7 5.05 12.5 3.5 10.95 9.3" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/**
 * A semantic anchor. `render` swaps the element, for example
 * `render={<NextLink href="/trails" />}`.
 *
 * - `kind="inline"` (default): `--role-accent` underline in running text.
 * - `kind="standalone"`: caps module link with a trailing ›.
 * - `kind="nav"`: no rest underline; hover the bare-text underline; current via
 *   `aria-current="page"` or `data-active`.
 * - `kind="title"`: stretched card or list-item title link [D157].
 * - `kind="noteref"` / `kind="backref"`: note call and ↩ return, never underlined.
 * - `index`: the screen-only visited ✓ for long indexes [D174, D175].
 * - `external`: the arrow-open mark plus "(external site)" for assistive technology.
 * - `list`: with `nav`, the list link's color-only hover (nav panels, footers, drawers).
 * - `muted`: the `--role-muted` ancestor ink with a color-only hover (breadcrumbs).
 */
export function Link(props: LinkProps) {
  const {
    render,
    ref,
    className,
    kind,
    index,
    external,
    list,
    muted,
    primary,
    secondary,
    children,
    ...elementProps
  } = props

  const scope = useScopeAttributes()
  const resolvedKind: LinkKind = kind ?? 'inline'

  const renderHref =
    React.isValidElement(render) && typeof render.props === 'object' && render.props !== null
      ? (render.props as { href?: unknown }).href
      : undefined
  const shortUrl = PRINT_URL_KINDS.has(resolvedKind)
    ? printedUrl(elementProps.href ?? renderHref, children)
    : null

  const trailing = (
    <>
      {external ? (
        <>
          {JOIN}
          <ArrowOpenMark className={`${styles.glyph} ${styles.arrow}`} />
          <span className={styles.visuallyHidden}> (external site)</span>
        </>
      ) : null}
      {shortUrl !== null ? <span className={styles.printUrl}>({shortUrl})</span> : null}
    </>
  )

  const visitedMark = index ? (
    <>
      {JOIN}
      <Icon name="check" className={`${styles.glyph} ${styles.visitedMark}`} />
    </>
  ) : null

  const content =
    resolvedKind === 'standalone' ? (
      <>
        <span className={styles.text}>
          {children}
          {trailing}
        </span>
        {/* Hover and press swap the › to the next tier's weight (§10.1) [D181]. */}
        <Icon
          name="chevron_right"
          weight="interactive"
          className={`${styles.glyph} ${styles.chevron}`}
        />
        {visitedMark}
      </>
    ) : (
      <>
        {children}
        {trailing}
        {visitedMark}
      </>
    )

  return useRender({
    render,
    ref,
    defaultTagName: 'a',
    props: {
      ...scope,
      ...mergeProps<'a'>(elementProps, {
        className: link({
          kind,
          index,
          external,
          list,
          muted,
          primary,
          secondary,
          // The standalone link hosts its interactive chevron.
          className: resolvedKind === 'standalone' ? cx(iconHost, className) : className,
        }),
        children: content,
      }),
    },
  })
}
