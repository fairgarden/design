'use client'

import * as React from 'react'
import type { ContentProps } from '@fairgarden/docs/CodeHighlighter/types'
import { useCode } from '@fairgarden/docs/useCode'
import styles from './code.module.css'
import './syntax.css'

type File = { name: string }

export function FileTabs(props: {
  files: File[]
  selected: string | undefined
  onSelect: (name: string) => void
}) {
  if (props.files.length <= 1) {
    return <span className={styles.fileName}>{props.selected}</span>
  }
  return (
    <div className={styles.tabs}>
      {props.files.map((file) => (
        <button
          key={file.name}
          type="button"
          className={styles.tab}
          aria-pressed={file.name === props.selected}
          onClick={() => props.onSelect(file.name)}
        >
          {file.name}
        </button>
      ))}
    </div>
  )
}

/** Renders an authored MDX code block (through `Pre`). */
export function CodeContent(props: ContentProps<object>) {
  const code = useCode(props, { preClassName: styles.pre })

  return (
    <figure className={styles.root}>
      {code.allFilesSlugs.map(({ slug }) => (
        <span key={slug} id={slug} />
      ))}
      <div className={styles.toolbar}>
        <FileTabs
          files={code.files}
          selected={code.selectedFileName}
          onSelect={code.selectFileName}
        />
        <button type="button" className={styles.copy} onClick={code.copy}>
          Copy
        </button>
      </div>
      {code.selectedFile}
    </figure>
  )
}
