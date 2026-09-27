'use client'

import * as React from 'react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { DocsLayout, DocsLayoutDrawer } from '@fairgarden/design/page/docs-layout'
import { NavigationBar } from '@fairgarden/design/navigation/navigation-bar'
import { SidebarNav, type SidebarNavItem } from '@fairgarden/design/navigation/sidebar-nav'
import { Lockup } from './Logo'
import { Search } from './Search'
import { tableOfContentsFor } from './DocsToc'

/** Internal links go through the Next.js router. */
const renderLink = (href: string) => <NextLink href={href} />

/**
 * The docs chrome: the design system's Docs Layout, as any docs site would
 * use it. The header is the Navigation Bar (`wide`, so its content box
 * meets the columns): the lockup as the home link, the search trigger, and
 * the drawer's menu Button below the inline threshold. The sidebar is the
 * Sidebar Navigation, built on the server from the sitemap
 * (`toSidebarItems`); the same component fills the column and the drawer.
 * The current page comes from the URL, so the server HTML already marks
 * it. The table of contents is a placeholder slot (`tableOfContentsFor`)
 * until the engine's page headings are wired (§11.15, "Wiring plan").
 */
export function DocsFrame({
  items,
  children,
}: {
  items: readonly SidebarNavItem[]
  children: React.ReactNode
}) {
  const pathname = usePathname()
  return (
    <DocsLayout
      header={
        <NavigationBar
          wide
          logo={<Lockup />}
          logoLabel="FairGarden Design home"
          renderLink={renderLink}
          currentPath={pathname}
          search={<Search />}
          drawer={<DocsLayoutDrawer />}
        />
      }
      sidebar={<SidebarNav items={items} currentPath={pathname} renderLink={renderLink} />}
      toc={tableOfContentsFor(pathname)}
    >
      {children}
    </DocsLayout>
  )
}
