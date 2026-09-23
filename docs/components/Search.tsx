'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSearch } from '@fairgarden/docs/useSearch'
import styles from './chrome.module.css'

const sitemap = () => import('../app/sitemap')

/** Client-side search over the precomputed sitemap (Orama, built on mount). */
export function Search() {
  const { isReady, search, results, buildResultUrl } = useSearch({ sitemap, limit: 12 })
  const [query, setQuery] = React.useState('')
  const listId = React.useId()

  return (
    <div role="search" className={styles.search}>
      <input
        type="search"
        aria-label="Search the docs"
        aria-controls={listId}
        className={styles.searchInput}
        placeholder={isReady ? 'Search' : 'Loading search…'}
        disabled={!isReady}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          void search(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setQuery('')
        }}
      />
      {query ? (
        <ul id={listId} className={styles.results}>
          {results.results.length === 0 ? (
            <li className={styles.noResults}>No matches for “{query}”.</li>
          ) : (
            results.results.map((group) => (
              <li key={group.group}>
                <div className={styles.resultGroup}>{group.group}</div>
                <ul className={styles.navPages}>
                  {group.items.map((item) => {
                    const href = buildResultUrl(item)
                    return (
                      <li key={href}>
                        <Link href={href} className={styles.resultLink} onClick={() => setQuery('')}>
                          {item.title}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  )
}
