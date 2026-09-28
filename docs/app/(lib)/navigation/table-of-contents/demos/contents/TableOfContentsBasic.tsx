import * as React from 'react'
import {
  TableOfContents,
  type TableOfContentsItem,
} from '@fairgarden/design/navigation/table-of-contents'
import styles from './contents.module.css'

/** The headings of the handbook's Composting page: H2s, with their H3s nested. */
const headings: TableOfContentsItem[] = [
  { id: 'compost-what-goes-in', title: 'What goes in', level: 2 },
  { id: 'compost-greens', title: 'Greens', level: 3 },
  { id: 'compost-browns', title: 'Browns', level: 3 },
  { id: 'compost-the-three-bays', title: 'The three bays', level: 2 },
  { id: 'compost-turning-days', title: 'Turning days', level: 3 },
  { id: 'compost-worm-bins', title: 'Worm bins', level: 2 },
  { id: 'compost-sharing', title: 'Sharing finished compost with the other plots', level: 2 },
]

/** The page's contents with "The three bays" in view, at the docs layout's 240 px column width. */
export function TableOfContentsBasic() {
  return (
    <div className={styles.column}>
      <TableOfContents items={headings} activeId="compost-the-three-bays" />
    </div>
  )
}
