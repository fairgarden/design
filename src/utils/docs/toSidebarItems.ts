import type { Sitemap } from '@fairgarden/docs/createSitemap/types'

import type { SidebarNavItem } from '../../navigation/sidebar-nav'

/*
 * toSidebarItems: the docs engine's sitemap as the Sidebar Navigation's
 * page tree (§11.15) [D202]. Server-safe plain data: build it where the
 * sitemap is imported (a layout) and hand it to the client SidebarNav.
 *
 * Planned beside it (§11.15, "Wiring plan"): `toTableOfContents(page)`,
 * the page's headings as TableOfContents items, once the engine records
 * each heading's rendered id and level.
 */

/**
 * A sitemap page's route: its `path` (`./button/page.mdx`) under its
 * section's `prefix` (`/actions/`), without `page.mdx` or a trailing slash
 * (`/actions/button`); the section itself with no path (`/actions`).
 */
export function sitemapHref(prefix: string, path = ''): string {
  const href = (prefix + path.replace(/^\.\//, '').replace(/\/?page\.mdx$/, '')).replace(/\/$/, '')
  return href || '/'
}

/** Options for toSidebarItems. */
export interface ToSidebarItemsOptions {
  /** Builds each route from a section prefix and a page path. Default `sitemapHref`. */
  toHref?: (prefix: string, path?: string) => string
  /** Link each group heading to its section's index page. Default `true`. */
  groupLinks?: boolean
}

/**
 * The sitemap's sections, in sitemap order, as SidebarNav groups: each
 * section's title over its pages, in the section index's order, the
 * heading linking to the section's index page. Pages without a title use
 * their slug.
 */
export function toSidebarItems(
  sitemap: Sitemap | undefined,
  options: ToSidebarItemsOptions = {}
): SidebarNavItem[] {
  const { toHref = sitemapHref, groupLinks = true } = options
  return Object.values(sitemap?.data ?? {}).map((section) => ({
    title: section.title,
    href: groupLinks ? toHref(section.prefix) : undefined,
    items: section.pages.map((page) => ({
      title: page.title ?? page.slug,
      href: toHref(section.prefix, page.path),
    })),
  }))
}
