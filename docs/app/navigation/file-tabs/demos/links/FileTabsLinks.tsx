'use client'

import * as React from 'react'
import { FileTabs, FileTabsList, FileTabsPanel } from '@fairgarden/design/navigation/file-tabs'
import styles from './links.module.css'

const files = [
  {
    name: 'Visit.tsx',
    slug: 'file-tabs-links:visit.tsx',
    code: `export function Visit() {
  return <p>Open dawn to dusk. Dogs on leash.</p>
}`,
  },
  {
    name: 'hours.ts',
    slug: 'file-tabs-links:hours.ts',
    code: `export const hours = { open: 'dawn', close: 'dusk' }`,
  },
  {
    name: 'visit.module.css',
    slug: 'file-tabs-links:visit.module.css',
    code: `.visit {
  color: var(--primary12);
}`,
  },
]

/** The file whose slug is the URL hash, if any. */
function fileFromHash() {
  const hash = decodeURIComponent(window.location.hash.slice(1))
  return files.find((file) => file.slug === hash)?.name
}

/**
 * Each tab is a deep link to `#slug`. A plain click selects the file; a
 * modifier click (Ctrl, Cmd, Alt or Shift) opens the link elsewhere and
 * leaves the selection. The scroll targets and the hash latch are the
 * consumer's: this demo renders one hidden target per file and selects the
 * file named by the hash on load and on hash changes.
 */
export function FileTabsLinks() {
  const [selected, setSelected] = React.useState(files[0].name)
  const current = files.find((file) => file.name === selected) ?? files[0]

  React.useEffect(() => {
    const latch = () => {
      const name = fileFromHash()
      if (name) setSelected(name)
    }
    latch()
    window.addEventListener('hashchange', latch)
    return () => window.removeEventListener('hashchange', latch)
  }, [])

  return (
    <div className={styles.stack}>
      <div>
        {files.map((file) => (
          <span key={file.slug} id={file.slug} className={styles.target} />
        ))}
        <FileTabs
          tabs={files.map((file) => ({ id: file.name, name: file.name, slug: file.slug }))}
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
      </div>
      <p className={styles.copy}>
        Link to <a href={`#${files[1].slug}`}>{files[1].name}</a> or{' '}
        <a href={`#${files[2].slug}`}>{files[2].name}</a>.
      </p>
    </div>
  )
}
