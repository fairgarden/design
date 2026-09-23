import * as React from 'react'
import Link from 'next/link'
import type { SitemapSectionData } from '@fairgarden/docs/createSitemap/types'
import { toHref } from './href'
import styles from './chrome.module.css'

/**
 * Wraps the auto-generated part of each section index (`extractToIndex`
 * `indexWrapperComponent`). `data` is injected at build time; `children` is
 * the generated markdown, which stays readable on GitHub but is replaced here
 * by cards.
 */
export function PagesIndex({ data }: { data?: SitemapSectionData; children?: React.ReactNode }) {
  if (!data) return null
  return (
    <ul className={styles.index}>
      {data.pages.map((page) => (
        <li key={page.path}>
          <Link href={toHref(data.prefix, page.path)} className={styles.indexCard}>
            <span className={styles.indexTitle}>{page.title}</span>
            <span className={styles.indexDescription}>{page.description}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
