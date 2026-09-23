'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Sitemap } from '@fairgarden/docs/createSitemap/types'
import { toHref } from './href'
import styles from './chrome.module.css'

/** The sidebar: one group per sitemap section, pages in index order. */
export function Navigation({ sitemap }: { sitemap: Sitemap | undefined }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Main navigation" className={styles.nav}>
      <ul className={styles.navList}>
        {Object.entries(sitemap?.data ?? {}).map(([key, section]) => (
          <li key={key} className={styles.navSection}>
            <Link href={toHref(section.prefix)} className={styles.navHeading}>
              {section.title}
            </Link>
            <ul className={styles.navPages}>
              {section.pages.map((page) => {
                const href = toHref(section.prefix, page.path)
                return (
                  <li key={page.path}>
                    <Link
                      href={href}
                      className={styles.navLink}
                      aria-current={pathname === href ? 'page' : undefined}
                    >
                      {page.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  )
}
