import * as React from 'react'

import styles from './mdx.module.css'

/** Props the demo factories hand their `DemoTitle`. */
export type DemoTitleProps = { slug?: string; children?: string }

/**
 * The heading the demo factories render for `<DemoX.Title />`: an H3 in
 * type-subhead that links to itself, so a demo can be linked by its slug.
 */
export function DemoTitle({ slug, children }: DemoTitleProps) {
  return slug ? (
    <h3 id={slug} className={styles.demoTitle}>
      <a href={`#${slug}`} className={styles.anchor}>
        {children}
      </a>
    </h3>
  ) : (
    <h3 className={styles.demoTitle}>{children}</h3>
  )
}
