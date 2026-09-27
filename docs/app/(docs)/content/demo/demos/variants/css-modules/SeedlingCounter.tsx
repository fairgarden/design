'use client'

import * as React from 'react'
import { Button } from '@fairgarden/design/actions/button'
import styles from './seedling-counter.module.css'

/** Counts the seedlings planted on a work day. */
export function SeedlingCounter() {
  // @focus-start @padding 1
  const [planted, setPlanted] = React.useState(0) // @highlight

  return (
    <div className={styles.row}>
      <Button variant="solid" onClick={() => setPlanted((n) => n + 1)}>
        Plant a Seedling
      </Button>
      <output className={styles.count}>{planted} planted</output>
    </div>
  )
  // @focus-end
}
