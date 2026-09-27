'use client'

import * as React from 'react'
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible'
import { cva, type VariantProps } from 'class-variance-authority'

import { DisclosureGlyph, disclosureGlyphHost } from '../../disclosure/collapsible'
import { Link } from '../../actions/link'
import { cx } from '../../utils/className'
import { isCurrentPath } from '../../utils/navigation'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './sidebar-nav.module.css'

/*
 * Sidebar Navigation (§9.15) [D202]: the docs layout's page tree, one
 * component in the desktop column and inside the mobile drawer.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: sidebar-nav.module.css; CVA function `sidebarNav`.
 * - Axes: `primary`, `secondary` → scales module classes.
 * - Compound variants: none. Defaults: none; color axes none.
 * - Color fallback: inherits the scope.
 * - States: group headings are Link `kind="nav"` (bare text): `:hover` →
 *   the --role-accent underline at --border-size-2 [D181];
 *   `aria-current="page"` → the --border-size-2-25 underline and weight
 *   700. Page links are Link `kind="nav"` with `list`: `:hover` →
 *   --role-link-hover only (plus the underline where it is --primary12)
 *   [D181]; `aria-current="page"` → the --border-size-2-25 start-edge bar
 *   over the guide and weight 700, whose width every label reserves, so
 *   the current page never rewraps a line. Collapsible Trigger
 *   `data-panel-open` → the D109 glyph turns inward in --primary12; Panel
 *   `data-starting-style` / `data-ending-style` → the clip reveal, instant
 *   under --motionNotOK. `:focus-visible` → the ring, inset inside rows.
 * - Parts: base (the nav), groups, group, headingRow, heading, toggle,
 *   glyph, panel, list, item, link, label, labelText.
 * - Scope: none. Container: none; its host (the docs layout's column or
 *   the drawer's Scroll Area) sets its width.
 * - Data: `items` is plain data ({ title, href, items }), so it can come
 *   from the docs engine's sitemap (utils/docs `toSidebarItems`) or a CMS.
 */
export const sidebarNav = cva(styles.base, {
  variants: {
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

type SidebarNavVariants = VariantProps<typeof sidebarNav>

/** One entry of the page tree: a group (top level, with `items`), a page, or a page with subpages. */
export interface SidebarNavItem {
  /** The link text, authored in sentence case; a group heading sets its own caps [D165]. */
  title: string
  /** The page. Omitted on a group, whose heading is then plain text. */
  href?: string
  /**
   * At the top level: the group's pages, under its caps heading. On a page:
   * its subpages, one level deeper on an indented guide. Nest no deeper.
   */
  items?: readonly SidebarNavItem[]
  /** Marks the current page. Default: its path equals `currentPath`. */
  current?: boolean
  /**
   * A collapsible group's initial state. Default: open when it holds the
   * current page.
   */
  defaultOpen?: boolean
}

/** Props for SidebarNav: `nav` props, the page tree, the current path and the color axes. */
export type SidebarNavProps = Omit<React.ComponentPropsWithRef<'nav'>, 'children'> & {
    /**
     * The page tree: groups (a caps heading over its pages) and, rarely,
     * top-level pages. Plain data, so the desktop column and the drawer
     * render the same object.
     */
    items: readonly SidebarNavItem[]
    /** The current page's URL path; its link takes `aria-current="page"`. */
    currentPath?: string
    /** The landmark's name. Default "Documentation". */
    label?: string
    /**
     * Groups become independent Collapsibles, each heading with the D109
     * glyph; the group holding the current page opens by default. Default
     * `false`: every group open, no toggles.
     */
    collapsible?: boolean
    /** The toggle's accessible name for a group. Default: "{title} pages". */
    toggleLabel?: (title: string) => string
    /**
     * Builds each anchor, e.g. `(href) => <NextLink href={href} />`.
     * Default: a plain `<a href>`.
     */
    renderLink?: (href: string) => React.ReactElement
    /** Override the scope's primary. Never defaulted [D133]. */
    primary?: SidebarNavVariants['primary']
    /** Override the scope's secondary. Never defaulted. */
    secondary?: SidebarNavVariants['secondary']
  }

interface SidebarNavContextValue {
  currentPath?: string
  collapsible: boolean
  toggleLabel: (title: string) => string
  renderLink?: (href: string) => React.ReactElement
}

const SidebarNavContext = React.createContext<SidebarNavContextValue>({
  collapsible: false,
  toggleLabel: (title) => `${title} pages`,
})

function isCurrent(item: SidebarNavItem, currentPath: string | undefined) {
  return item.current ?? isCurrentPath(item.href, currentPath)
}

/** Whether the item or any of its descendants is the current page. */
function holdsCurrent(item: SidebarNavItem, currentPath: string | undefined): boolean {
  if (isCurrent(item, currentPath)) return true
  return item.items?.some((child) => holdsCurrent(child, currentPath)) ?? false
}

/** The nearest ancestor that scrolls its block axis (never the page itself). */
function scrollParent(element: HTMLElement): HTMLElement | null {
  const root = element.ownerDocument.scrollingElement
  let node = element.parentElement
  while (node != null && node !== root && node !== element.ownerDocument.body) {
    const { overflowY } = getComputedStyle(node)
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node
    }
    node = node.parentElement
  }
  return null
}

/**
 * The docs page tree [D202]: a `nav` of groups, each a caps heading
 * (`type-label`, a link to the group's index page when it has one) over its
 * pages on a --role-hairline guide, groups split by hairline rules. The
 * current page takes `aria-current="page"`, the --border-size-2-25
 * start-edge bar and weight 700. The same component, from the same data,
 * fills the docs layout's column from --fgd-nav-inline-n-above and the
 * drawer below it. On mount, and when the current page changes, the
 * current link is scrolled into view inside the nearest scrolling
 * ancestor (the column or the drawer's Scroll Area), never the page, so
 * nothing moves around it. Hidden in print.
 */
export function SidebarNav(props: SidebarNavProps) {
  const {
    items,
    currentPath,
    label = 'Documentation',
    collapsible = false,
    toggleLabel = (title: string) => `${title} pages`,
    renderLink,
    primary,
    secondary,
    className,
    ref,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const navRef = React.useRef<HTMLElement | null>(null)

  const setRef = React.useCallback(
    (node: HTMLElement | null) => {
      navRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref]
  )

  // Bring the current page into view inside the scroller that holds the
  // nav, never the page. A scroll offset moves nothing in layout, so it is
  // no layout shift; in the docs layout's column, browsers with
  // `scroll-initial-target` (its CSS) have done it before first paint.
  React.useLayoutEffect(() => {
    const nav = navRef.current
    const link = nav?.querySelector<HTMLElement>('[aria-current="page"]')
    if (nav == null || link == null) return
    const scroller = scrollParent(link)
    if (scroller == null) return
    const box = scroller.getBoundingClientRect()
    const target = link.getBoundingClientRect()
    if (target.top >= box.top && target.bottom <= box.bottom) return
    scroller.scrollTop += target.top - box.top - (box.height - target.height) / 2
  }, [currentPath])

  // Rebuilt on every render: the functions are usually inline, and the tree re-renders with it anyway.
  const context: SidebarNavContextValue = { currentPath, collapsible, toggleLabel, renderLink }

  return (
    <SidebarNavContext.Provider value={context}>
      <nav
        {...rest}
        {...scope}
        ref={setRef}
        aria-label={label}
        className={sidebarNav({ primary, secondary, className })}
      >
        <ul className={styles.groups}>
          {items.map((item) => (
            <li key={item.href ?? item.title} className={styles.group}>
              {item.items != null && item.items.length > 0 ? (
                <SidebarNavGroup item={item} />
              ) : (
                <SidebarNavHeading item={item} />
              )}
            </li>
          ))}
        </ul>
      </nav>
    </SidebarNavContext.Provider>
  )
}

/** A group heading: a caps link to the group's index page, or plain caps text. */
function SidebarNavHeading({ item, id }: { item: SidebarNavItem; id?: string }) {
  const { currentPath, renderLink } = React.useContext(SidebarNavContext)
  if (item.href == null) {
    return (
      <span id={id} className={styles.heading}>
        {item.title}
      </span>
    )
  }
  const current = isCurrent(item, currentPath)
  return (
    <Link
      id={id}
      kind="nav"
      href={item.href}
      render={renderLink?.(item.href)}
      aria-current={current ? 'page' : undefined}
      className={styles.heading}
    >
      <Label text={item.title} />
    </Link>
  )
}

/** A group: its heading over its pages, open (default) or a Collapsible. */
function SidebarNavGroup({ item }: { item: SidebarNavItem }) {
  const { currentPath, collapsible, toggleLabel } = React.useContext(SidebarNavContext)
  const headingId = React.useId()
  const list = <SidebarNavList items={item.items ?? []} labelledBy={headingId} />

  if (!collapsible) {
    return (
      <>
        <SidebarNavHeading item={item} id={headingId} />
        {list}
      </>
    )
  }

  const containsCurrent = holdsCurrent(item, currentPath)
  return (
    <BaseCollapsible.Root defaultOpen={item.defaultOpen ?? containsCurrent} className={styles.collapsible}>
      {item.href != null ? (
        <div className={styles.headingRow}>
          <SidebarNavHeading item={item} id={headingId} />
          <BaseCollapsible.Trigger
            aria-label={toggleLabel(item.title)}
            className={cx(styles.toggle, disclosureGlyphHost)}
          >
            <DisclosureGlyph size="chrome" className={styles.glyph} />
          </BaseCollapsible.Trigger>
        </div>
      ) : (
        <BaseCollapsible.Trigger id={headingId} className={cx(styles.headingRow, styles.headingTrigger)}>
          <span className={styles.heading}>{item.title}</span>
          <DisclosureGlyph size="chrome" className={styles.glyph} />
        </BaseCollapsible.Trigger>
      )}
      <BaseCollapsible.Panel className={styles.panel}>{list}</BaseCollapsible.Panel>
    </BaseCollapsible.Root>
  )
}

/** A list of pages on the hairline guide; a page's subpages nest one level in. */
function SidebarNavList({
  items,
  labelledBy,
}: {
  items: readonly SidebarNavItem[]
  labelledBy?: string
}) {
  const { currentPath, renderLink } = React.useContext(SidebarNavContext)
  return (
    <ul className={styles.list} aria-labelledby={labelledBy}>
      {items.map((item) => {
        const current = isCurrent(item, currentPath)
        return (
          <li key={item.href ?? item.title} className={styles.item}>
            {item.href != null ? (
              <Link
                kind="nav"
                list
                href={item.href}
                render={renderLink?.(item.href)}
                aria-current={current ? 'page' : undefined}
                className={styles.link}
              >
                <Label text={item.title} />
              </Link>
            ) : (
              <span className={cx(styles.link, styles.plain)}>
                <Label text={item.title} />
              </span>
            )}
            {item.items != null && item.items.length > 0 ? <SidebarNavList items={item.items} /> : null}
          </li>
        )
      })}
    </ul>
  )
}

/**
 * A label that reserves its weight-700 box: a hidden copy at weight 700
 * shares its grid cell, so becoming current never widens or rewraps it.
 */
function Label({ text }: { text: string }) {
  return (
    <span className={styles.label} data-label={text}>
      <span className={styles.labelText}>{text}</span>
    </span>
  )
}
