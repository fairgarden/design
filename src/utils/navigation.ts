import * as React from 'react'

/*
 * The shared navigation data [D182, D187]: one object feeds the desktop
 * Navigation Menu panels (§9.6), the Navigation Drawer (§11.6) and the
 * footer sitemap (§11.13), so the three never drift apart. Current and
 * parent-of-current come from the page's URL path, not from this data
 * (§9.6 "Current by path"); `current` is only a manual override.
 *
 * Plain data (strings and objects, no React nodes), so it can come from a
 * CMS or a JSON file and be shared by server and client components.
 */

/**
 * One navigation link: a Navigation Menu panel link, a drawer child link and
 * a footer sitemap link.
 */
export interface SitemapLink {
  /** The link text, authored in sentence case (bar items and group headings set their own case). */
  label: string
  href: string
  /**
   * Marks the current page (`aria-current="page"`). The Navigation Menu and
   * the drawer also match their `currentPath`; the footer reads only this.
   */
  current?: boolean
  /** An external site: the arrow-open mark and "(external site)". */
  external?: boolean
  /**
   * A third tier, for the mega panels only: in an `overview` panel the link
   * becomes a caps group heading (with ›, to `href`) over these links; in an
   * `index` panel a category whose pane lists them. The drawer and the
   * footer list the link itself and leave this tier to its page.
   */
  links?: readonly SitemapLink[]
}

/** An image in the navigation data. */
export interface SitemapImage {
  src: string
  /** The alternative text; `''` for a decorative image. */
  alt: string
}

/** The optional promo card of an `overview` panel (§9.6): one Tab stop, its stretched title link. */
export interface SitemapPromo {
  href: string
  /** The title, `type-itemhead`. */
  title: string
  /** A 16:9 image. */
  image?: SitemapImage
  /** A two-line `type-body-ui` blurb. */
  description?: string
}

/** The panel a section opens in the desktop Navigation Menu [D182]. */
export type SitemapPanel = 'dropdown' | 'overview' | 'index'

/**
 * One top-level navigation section: a bar item and its panel, a drawer
 * group and a footer sitemap group, whose heading is the section's label
 * [D187].
 */
export interface SitemapSection {
  /** The bar item, drawer row and footer group heading. */
  label: string
  /**
   * The section's landing page: the `overview` panel's overview link (a
   * `dropdown` panel's first link), the drawer group's first child and the
   * footer group's linked heading. Its path marks the parent of current.
   */
  href?: string
  /** One line under the `overview` panel's overview link, in `--role-muted`. */
  description?: string
  /**
   * The section's pages: the `dropdown` list, the `overview` link groups
   * (each link with its own `links`) or the `index` categories; the drawer
   * group's child links; the footer group's links. A section with no links
   * and an `href` is a plain bar link and a direct drawer link.
   */
  links: readonly SitemapLink[]
  /**
   * The desktop panel. Default: `overview` when the section has a
   * `description` or a `promo`, or a link carries its own `links`; else
   * `dropdown` (see `sitemapPanel`).
   */
  panel?: SitemapPanel
  /** The `overview` panel's optional promo card (≤ 1 per panel). */
  promo?: SitemapPromo
  /** The `index` panel's featured bar: one link across both panes, at the foot. */
  featured?: SitemapLink
}

/** The navigation data: the top-level sections, in bar order. */
export type Sitemap = readonly SitemapSection[]

/** The panel a section opens: its `panel`, else the default that its content implies. */
export function sitemapPanel(section: SitemapSection): SitemapPanel {
  if (section.panel != null) return section.panel
  const tiered = section.links.some((link) => link.links != null && link.links.length > 0)
  return tiered || section.description != null || section.promo != null ? 'overview' : 'dropdown'
}

/* ── Current by URL path [D182]: the Navigation Menu, Navigation Bar and drawer ── */

/**
 * The path of a site-relative (or absolute http) href, without query, hash
 * or trailing slash; `null` for fragments and other protocols.
 */
export function toPath(href: string | null | undefined): string | null {
  if (!href || href.startsWith('#')) return null
  let url: URL
  try {
    url = new URL(href, 'http://localhost/')
  } catch {
    return null
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
  const trimmed = url.pathname.replace(/\/+$/, '')
  return trimmed === '' ? '/' : trimmed
}

/** `true` when `href` is the current page: its path equals `currentPath`. */
export function isCurrentPath(
  href: string | null | undefined,
  currentPath: string | null | undefined
): boolean {
  const target = toPath(href)
  const current = toPath(currentPath)
  return target !== null && target === current
}

/**
 * `true` when the page lies in the section at `sectionHref`: the section's
 * path is a whole-segment prefix of `currentPath` (the section page itself
 * included). The home path `/` matches only itself.
 */
export function isInSection(
  sectionHref: string | null | undefined,
  currentPath: string | null | undefined
): boolean {
  const section = toPath(sectionHref)
  const current = toPath(currentPath)
  if (section === null || current === null) return false
  if (section === '/') return current === '/'
  return current === section || current.startsWith(`${section}/`)
}

/** Whether any link among `children` (elements with an `href`) is the current page or lies under it. */
export function holdsCurrent(children: React.ReactNode, currentPath: string | undefined): boolean {
  let found = false
  React.Children.forEach(children, (child) => {
    if (found || !React.isValidElement<{ href?: unknown }>(child)) return
    const href = child.props.href
    if (typeof href === 'string' && isInSection(href, currentPath)) found = true
  })
  return found
}

/** Wraps each child in a list item with `className`; empty children are dropped. */
export function listItems(children: React.ReactNode, className: string) {
  return React.Children.map(children, (child) =>
    child == null || child === false ? null : React.createElement('li', { className }, child)
  )
}
