import * as React from 'react'
import styles from './code.module.css'

/** Type signatures in the API tables (not precomputed, so not `Pre`). */
export function TypePre({ children }: { children: React.ReactNode }) {
  return <pre className={styles.typePre}>{children}</pre>
}
