'use client'

import * as React from 'react'
import { FileTabs, FileTabsList, FileTabsPanel } from '@fairgarden/design/navigation/file-tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@fairgarden/design/data/table'
import styles from './links.module.css'

/** A grant application packet: each document has a deep-link slug. */
const documents = [
  {
    id: 'Cover letter',
    slug: 'grant-packet:cover-letter',
    content: (
      <>
        <h3 className={styles.title}>Cover letter</h3>
        <p>
          Riverbend Community Garden asks the county’s neighbourhood fund for help building a
          rain-fed watering system for its forty plots.
        </p>
      </>
    ),
  },
  {
    id: 'Budget',
    slug: 'grant-packet:budget',
    content: (
      <Table strategy="fit" density="compact">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Item</TableHeaderCell>
            <TableHeaderCell numeric>Cost ($)</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableHeaderCell>Rain barrels (6)</TableHeaderCell>
            <TableCell numeric>540</TableCell>
          </TableRow>
          <TableRow>
            <TableHeaderCell>Drip line and fittings</TableHeaderCell>
            <TableCell numeric>310</TableCell>
          </TableRow>
          <TableRow>
            <TableHeaderCell>Volunteer lunches</TableHeaderCell>
            <TableCell numeric>150</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    ),
  },
  {
    id: 'Site plan',
    slug: 'grant-packet:site-plan',
    content: (
      <>
        <h3 className={styles.title}>Site plan</h3>
        <p>Barrels along the shed’s north gutter feed a drip line down each row of plots.</p>
      </>
    ),
  },
  {
    id: 'Letters of support',
    slug: 'grant-packet:letters-of-support',
    content: (
      <>
        <h3 className={styles.title}>Letters of support</h3>
        <ul className={styles.list}>
          <li>Riverbend Elementary’s garden club</li>
          <li>The Hillside Tool Library</li>
        </ul>
      </>
    ),
  },
]

/** The document whose slug is the URL hash, if any. */
function documentFromHash() {
  const hash = decodeURIComponent(window.location.hash.slice(1))
  return documents.find((document) => document.slug === hash)?.id
}

/**
 * Each tab is a deep link to `#slug`. A plain click selects the document; a
 * modifier click (Ctrl, Cmd, Alt or Shift) opens the link elsewhere and
 * leaves the selection. The scroll targets and the hash latch are the
 * consumer's: this demo renders one hidden target per document and selects
 * the document named by the hash on load and on hash changes.
 */
export function FileTabsLinks() {
  const [selected, setSelected] = React.useState(documents[0].id)
  const current = documents.find((document) => document.id === selected) ?? documents[0]

  React.useEffect(() => {
    const latch = () => {
      const id = documentFromHash()
      if (id) setSelected(id)
    }
    latch()
    window.addEventListener('hashchange', latch)
    return () => window.removeEventListener('hashchange', latch)
  }, [])

  return (
    <div className={styles.stack}>
      <div>
        {documents.map((document) => (
          <span key={document.slug} id={document.slug} className={styles.target} />
        ))}
        <FileTabs
          tabs={documents.map((document) => ({ id: document.id, name: document.id, slug: document.slug }))}
          value={selected}
          onValueChange={setSelected}
          className={styles.frame}
        >
          <FileTabsList aria-label="Grant application" />
          <FileTabsPanel>
            <div className={styles.doc}>{current.content}</div>
          </FileTabsPanel>
        </FileTabs>
      </div>
      <p className={styles.copy}>
        Link to the <a href={`#${documents[1].slug}`}>budget</a> or the{' '}
        <a href={`#${documents[3].slug}`}>letters of support</a>.
      </p>
    </div>
  )
}
