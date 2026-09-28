'use client'

import * as React from 'react'
import { FileTabs, FileTabsList, FileTabsPanel } from '@fairgarden/design/navigation/file-tabs'
import styles from './basic.module.css'

/** A plot lease packet: three documents kept together. */
const documents = [
  {
    id: 'Lease',
    content: (
      <>
        <h3 className={styles.title}>Plot lease, 2026 season</h3>
        <p>
          Plot 14 at Riverbend Community Garden is leased to its gardener from March 1 to November
          30. The lease renews each winter while the plot is kept planted and tidy.
        </p>
        <p className={styles.muted}>Signed at the February open day.</p>
      </>
    ),
  },
  {
    id: 'Plot map',
    content: (
      <>
        <h3 className={styles.title}>Where plot 14 is</h3>
        <p>
          Third row from the gate, between the rain barrels and the pollinator bed. The water tap is
          two plots east; the tool shed is by the north fence.
        </p>
      </>
    ),
  },
  {
    id: 'Garden rules',
    content: (
      <>
        <h3 className={styles.title}>Garden rules</h3>
        <ul className={styles.list}>
          <li>Water in the early morning or the evening.</li>
          <li>Return shared tools to the shed the same day.</li>
          <li>No synthetic pesticides anywhere in the garden.</li>
        </ul>
      </>
    ),
  },
]

/**
 * Three documents of a lease packet switching one panel, and a packet of
 * one, which shows its title instead of tabs. Each sits at the top of a
 * bordered box, the header's host.
 */
export function FileTabsBasic() {
  const [selected, setSelected] = React.useState(documents[0].id)
  const current = documents.find((document) => document.id === selected) ?? documents[0]

  return (
    <div className={styles.stack}>
      <FileTabs
        tabs={documents.map((document) => ({ id: document.id, name: document.id }))}
        value={selected}
        onValueChange={setSelected}
        className={styles.frame}
      >
        <FileTabsList aria-label="Lease packet" />
        <FileTabsPanel>
          <div className={styles.doc}>{current.content}</div>
        </FileTabsPanel>
      </FileTabs>
      <FileTabs tabs={[{ id: 'Welcome letter', name: 'Welcome letter' }]} className={styles.frame}>
        <FileTabsList />
        <FileTabsPanel>
          <div className={styles.doc}>
            <p>
              Welcome to Riverbend! Your key to the tool shed is on the hook inside the gate box, and
              the next work day is the first Saturday of April.
            </p>
          </div>
        </FileTabsPanel>
      </FileTabs>
    </div>
  )
}
