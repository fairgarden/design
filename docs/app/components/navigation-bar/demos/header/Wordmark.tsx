import * as React from 'react'
import styles from './header.module.css'

/** A stand-in ink wordmark: a leaf mark and "FairGarden", drawn in currentColor. */
export function Wordmark() {
  return (
    <svg className={styles.wordmark} viewBox="0 0 168 36" aria-hidden="true" focusable="false">
      <path
        d="M4 30C4 16 14 6 30 6c0 16-10 26-24 26M8 28 22 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <text x="38" y="26">
        FairGarden
      </text>
    </svg>
  )
}
