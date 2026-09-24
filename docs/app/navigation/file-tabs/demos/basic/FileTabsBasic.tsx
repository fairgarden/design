'use client'

import * as React from 'react'
import { FileTabs, FileTabsList, FileTabsPanel } from '@fairgarden/design/navigation/file-tabs'
import styles from './basic.module.css'

const files = [
  {
    name: 'TrailCard.tsx',
    code: `import styles from './trail-card.module.css'

export function TrailCard({ name, miles }) {
  return (
    <article className={styles.card}>
      <h3>{name}</h3>
      <p>{miles} miles, marked</p>
    </article>
  )
}`,
  },
  {
    name: 'trail-card.module.css',
    code: `.card {
  padding: var(--size-px-3);
  border: var(--border-size-1) solid var(--role-rule);
}`,
  },
  { name: 'index.ts', code: `export * from './TrailCard'` },
]

/**
 * Three files switching one panel, and a single file, which shows its name
 * instead of tabs. Each sits at the top of a bordered box, the header's host.
 */
export function FileTabsBasic() {
  const [selected, setSelected] = React.useState(files[0].name)
  const current = files.find((file) => file.name === selected) ?? files[0]

  return (
    <div className={styles.stack}>
      <FileTabs
        tabs={files.map((file) => ({ id: file.name, name: file.name }))}
        value={selected}
        onValueChange={setSelected}
        className={styles.frame}
      >
        <FileTabsList />
        <FileTabsPanel>
          <pre className={styles.code}>
            <code>{current.code}</code>
          </pre>
        </FileTabsPanel>
      </FileTabs>

      <FileTabs tabs={[{ id: 'index.ts', name: 'index.ts' }]} className={styles.frame}>
        <FileTabsList />
        <FileTabsPanel>
          <pre className={styles.code}>
            <code>{files[2].code}</code>
          </pre>
        </FileTabsPanel>
      </FileTabs>
    </div>
  )
}
