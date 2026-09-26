'use client'

import * as React from 'react'
import { Button } from '@fairgarden/design/actions/button'
import { Tag } from '@fairgarden/design/feedback/tag'
import styles from './seedling-counter.module.css'

/** Counts the seedlings planted on a work day, in a tag. */
export function SeedlingCounter() {
  // @focus-start @padding 1
  const [planted, setPlanted] = React.useState(0) // @highlight
  const label = planted === 1 ? '1 seedling' : `${planted} seedlings`

  return (
    <div className={styles.row}>
      <Button variant="solid" onClick={() => setPlanted((n) => n + 1)}>
        Plant a Seedling
      </Button>
      <Tag>{label}</Tag>
    </div>
  )
  // @focus-end
}
