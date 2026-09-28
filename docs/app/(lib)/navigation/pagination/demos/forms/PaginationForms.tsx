'use client'

import * as React from 'react'
import { Pagination } from '@fairgarden/design/navigation/pagination'
import styles from './forms.module.css'

/** Keeps the demo on this page: a click on a page link sets the page instead of navigating. */
function usePager(initial: number) {
  const [page, setPage] = React.useState(initial)
  const onClick = (event: React.MouseEvent<HTMLElement>) => {
    const anchor = (event.target as HTMLElement).closest('a')
    const match = anchor?.hash.match(/^#page-(\d+)$/)
    if (match) {
      event.preventDefault()
      setPage(Number(match[1]))
    }
  }
  return { page, onClick }
}

const href = (page: number) => `#page-${page}`

export function PaginationForms() {
  const numbered = usePager(5)
  const compact = usePager(5)
  const more = usePager(1)
  const [step, setStep] = React.useState(3)
  const [dots, setDots] = React.useState(2)

  return (
    <div className={styles.stack}>
      <p className={styles.name}>numbered</p>
      <div className={styles.frame}>
        <Pagination
          page={numbered.page}
          count={12}
          getHref={href}
          onClick={numbered.onClick}
          items={{
            first: (numbered.page - 1) * 10 + 1,
            last: Math.min(numbered.page * 10, 118),
            total: 118,
          }}
        />
      </div>
      <p className={styles.name}>compact</p>
      <div className={styles.frame}>
        <Pagination
          kind="compact"
          page={compact.page}
          count={60}
          getHref={href}
          onClick={compact.onClick}
        />
      </div>
      <p className={styles.name}>step</p>
      <div className={styles.frame}>
        <Pagination kind="step" page={step} count={12} onPageChange={setStep} />
      </div>
      <p className={styles.name}>dots</p>
      <div className={styles.frame}>
        <Pagination
          kind="dots"
          page={dots}
          count={6}
          onPageChange={setDots}
          previousLabel="Previous photo"
          nextLabel="Next photo"
        />
      </div>
      <p className={styles.name}>more</p>
      <div className={styles.frame}>
        <Pagination
          kind="more"
          page={more.page}
          count={3}
          getHref={href}
          onClick={more.onClick}
          items={{ first: 1, last: Math.min(more.page * 20, 54), total: 54 }}
        />
      </div>
    </div>
  )
}
