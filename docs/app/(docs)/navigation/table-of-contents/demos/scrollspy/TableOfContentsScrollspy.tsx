'use client'

import * as React from 'react'
import {
  TableOfContents,
  useActiveHeading,
  type TableOfContentsItem,
} from '@fairgarden/design/navigation/table-of-contents'
import styles from './scrollspy.module.css'

const headings: TableOfContentsItem[] = [
  { id: 'spy-before-you-sow', title: 'Before you sow', level: 2 },
  { id: 'spy-choosing-seed', title: 'Choosing seed', level: 3 },
  { id: 'spy-sowing', title: 'Sowing', level: 2 },
  { id: 'spy-thinning', title: 'Thinning', level: 2 },
  { id: 'spy-saving-seed', title: 'Saving seed for next year', level: 2 },
]

const ids = headings.map((heading) => heading.id)

const body: Record<string, string> = {
  'spy-before-you-sow':
    'Rake the bed level and water it the evening before. Seed sown into dry soil sits there waiting; seed sown into damp soil starts the same week.',
  'spy-choosing-seed':
    'The seed library in the tool shed lends packets by the spoonful. Take what you will sow this month, and write the variety in the ledger by the door.',
  'spy-sowing':
    'Sow in drills a finger deep for beans and peas, a knuckle deep for roots and greens. Cover, firm the soil with the back of the rake, and label the row.',
  'spy-thinning':
    'When the seedlings have two true leaves, thin them to a hand’s width. The thinnings of lettuce, beet and chard make a good first salad.',
  'spy-saving-seed':
    'Leave the best plant of each row to flower and set seed. Once the pods are dry and rattle, pick them on a dry afternoon and bring the seed back to the library.',
}

/**
 * Scrollspy in a box of its own: `useActiveHeading` watches the headings
 * inside the scrolling panel (its `root`) and marks the section in view.
 */
export function TableOfContentsScrollspy() {
  const panelRef = React.useRef<HTMLDivElement | null>(null)
  const activeId = useActiveHeading(ids, { root: panelRef })
  return (
    <div className={styles.split}>
      <div ref={panelRef} className={styles.panel} tabIndex={0} aria-label="Seed sowing guide">
        {headings.map((heading) =>
          heading.level === 2 ? (
            <React.Fragment key={heading.id}>
              <h2 id={heading.id} className={styles.h2}>
                {heading.title}
              </h2>
              <p className={styles.p}>{body[heading.id]}</p>
            </React.Fragment>
          ) : (
            <React.Fragment key={heading.id}>
              <h3 id={heading.id} className={styles.h3}>
                {heading.title}
              </h3>
              <p className={styles.p}>{body[heading.id]}</p>
            </React.Fragment>
          )
        )}
      </div>
      <div className={styles.column}>
        <TableOfContents items={headings} activeId={activeId} />
      </div>
    </div>
  )
}
