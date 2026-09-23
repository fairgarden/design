'use client'

import * as React from 'react'
import type { ContentProps } from '@fairgarden/docs/CodeHighlighter/types'
import { useDemo } from '@fairgarden/docs/useDemo'
import { FileTabs } from './CodeContent'
import styles from './code.module.css'
import './syntax.css'

/**
 * A live demo: the rendered component above its source. The component
 * renders inline (no iframe), inside the page's own ground scope.
 */
export function DemoContent(props: ContentProps<object>) {
  // Always pass props straight through (useDemo reads the precomputed data).
  const demo = useDemo(props, { preClassName: styles.pre })

  return (
    <div className={styles.root}>
      {demo.allFilesSlugs.map(({ slug }) => (
        <span key={slug} id={slug} />
      ))}
      <div className={styles.preview}>{demo.component}</div>
      <div className={styles.toolbar}>
        <FileTabs
          files={demo.files}
          selected={demo.selectedFileName}
          onSelect={demo.selectFileName}
        />
        <button type="button" className={styles.copy} onClick={demo.copy}>
          Copy
        </button>
      </div>
      {demo.selectedFile}
    </div>
  )
}
