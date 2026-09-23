import * as React from 'react'
import styles from './chrome.module.css'

/** The heading `createDemo` renders for `<DemoX.Title />`. */
export function DemoTitle({ slug, children }: { slug?: string; children?: string }) {
  return slug ? (
    <h3 id={slug} className={styles.demoTitle}>
      <a href={`#${slug}`}>{children}</a>
    </h3>
  ) : (
    <h3 className={styles.demoTitle}>{children}</h3>
  )
}
