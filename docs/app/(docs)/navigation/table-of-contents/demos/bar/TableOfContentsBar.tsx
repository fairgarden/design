'use client'

import * as React from 'react'
import {
  TableOfContents,
  useActiveHeading,
  type TableOfContentsItem,
} from '@fairgarden/design/navigation/table-of-contents'
import { guide } from './guide'
import styles from './bar.module.css'

const items: TableOfContentsItem[] = guide.map(({ id, title, level }) => ({ id, title, level }))
const ids = items.map((item) => item.id)

/**
 * The compact bar over a long page: it names the section in view and
 * opens the whole list, scrolled so that section sits centered and marked.
 * The page here scrolls in a box of its own, so `useActiveHeading` watches
 * it (`root`) and the bar sticks to the box's top.
 */
export function TableOfContentsBar() {
  const pageRef = React.useRef<HTMLDivElement | null>(null)
  const activeId = useActiveHeading(ids, { root: pageRef })
  return (
    <div ref={pageRef} className={styles.page} tabIndex={0} aria-label="Seed-saving guide">
      <div className={styles.bar}>
        <TableOfContents kind="bar" items={items} activeId={activeId} />
      </div>
      {guide.map((section) => {
        const Heading = section.level === 2 ? 'h2' : 'h3'
        return (
          <React.Fragment key={section.id}>
            <Heading id={section.id} className={section.level === 2 ? styles.h2 : styles.h3}>
              {section.title}
            </Heading>
            <p className={styles.p}>{section.body}</p>
          </React.Fragment>
        )
      })}
    </div>
  )
}
